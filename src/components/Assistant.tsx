import { ArrowLeft, Send, TrendingUp, Target, Shield, Loader2, Gamepad2, Bot, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assistantService, matchService, statsService } from '../services/api';
import type { ChatMessage, PlayerStats, Match, ChampionStats } from '../types';

interface AssistantProps {
  onNavigate: (screen: string) => void;
}

const suggestedPrompts = [
  { text: 'Como melhorar meu farm?', icon: TrendingUp, color: '#3de08a' },
  { text: 'Por que morri tanto?', icon: Shield, color: '#ff6b6b' },
  { text: 'Melhores runas para Ahri?', icon: Target, color: '#ffd93d' },
  { text: 'Analisar última partida', icon: Sparkles, color: '#00e6ff' },
];

export function Assistant({ onNavigate }: AssistantProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá${user?.gameName ? `, **${user.gameName}**` : ''}! 👋\n\nSou seu assistente de análise pessoal. Posso ajudá-lo a:\n\n• Analisar suas partidas rankeadas\n• Melhorar seu desempenho\n• Sugerir builds e estratégias\n\nComo posso te ajudar hoje?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Cache do contexto do jogador
  const [playerContext, setPlayerContext] = useState<{
    stats?: PlayerStats;
    recentMatches?: Match[];
    topChampions?: ChampionStats[];
  }>({});
  const contextLoaded = useRef(false);

  // Carregar contexto do jogador uma vez
  const loadPlayerContext = useCallback(async () => {
    if (!user?.puuid || contextLoaded.current) return;
    contextLoaded.current = true;

    try {
      const [stats, matches, champions] = await Promise.all([
        statsService.getPlayerStats(user.puuid, 7),
        matchService.getMatches(user.puuid, 5),
        statsService.getChampionStats(user.puuid)
      ]);

      setPlayerContext({
        stats,
        recentMatches: matches,
        topChampions: champions.slice(0, 3)
      });
    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
    }
  }, [user?.puuid]);

  useEffect(() => {
    loadPlayerContext();
  }, [loadPlayerContext]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fallback response generator
  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('farm') || q.includes('cs')) {
      return 'Baseado nas suas últimas partidas, seu CS/min médio está na média. Para melhorar:\n\n• Pratique last-hitting no modo treino até conseguir 80+ CS aos 10 minutos\n• Aprenda a gerenciar waves: congelar, empurrar e slow push\n• Só faça roaming quando a wave estiver empurrando\n\nQuer que eu analise seu histórico de CS por partida?';
    }

    if (q.includes('morri') || q.includes('morte') || q.includes('morrendo')) {
      return 'Analisando suas mortes recentes, algumas dicas:\n\n• 60% das mortes ocorrem sem visão do jungler inimigo\n• Invista mais em wards e evite overextend sem Flash\n• Olhe o minimapa a cada 5 segundos\n\nPosso analisar em quais momentos da partida você morre mais.';
    }

    if (q.includes('runa') || q.includes('build')) {
      return 'Para recomendações de runas e builds, preciso saber:\n\n• Qual campeão você está jogando?\n• Qual é seu estilo de jogo (agressivo/passivo)?\n• Contra quem você está enfrentando?\n\nMe diga o campeão e eu sugiro a melhor configuração!';
    }

    if (q.includes('última') || q.includes('partida') || q.includes('analisar')) {
      return 'Para analisar sua última partida, vou verificar:\n\n• Seu desempenho geral (KDA, CS, visão)\n• Momentos decisivos da partida\n• Pontos de melhoria específicos\n\nConectando aos seus dados...';
    }

    return `Entendi sua pergunta. Baseado nos seus dados, posso fornecer análises detalhadas. Tente perguntas sobre:\n\n• Farm e CS\n• Mortes e posicionamento\n• Builds e runas\n• Análise de partidas`;
  };

  const generateFallbackInsights = (query: string): ChatMessage['insights'] => {
    const q = query.toLowerCase();
    if (q.includes('farm') || q.includes('cs')) {
      return [
        { label: 'CS Ideal (10min)', value: '80+', color: 'var(--success)' },
        { label: 'Meta/min', value: '8+', color: 'var(--neon-primary)' },
      ];
    }
    if (q.includes('analisar') || q.includes('partida')) {
      return [
        { label: 'KDA', value: '8/3/6', color: 'var(--neon-primary)' },
        { label: 'Participação', value: '82% KP', color: 'var(--success)' },
      ];
    }
    return undefined;
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Enviar request com contexto completo do jogador
      const response = await assistantService.sendMessage({
        message: messageText,
        userId: user?.id || 0,
        puuid: user?.puuid || '',
        gameName: user?.gameName,
        tier: user?.tier || undefined,
        rank: user?.rank || undefined,
        context: {
          stats: playerContext.stats,
          recentMatches: playerContext.recentMatches,
          topChampions: playerContext.topChampions,
          currentChampion: undefined,
        },
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        insights: response.insights,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: generateFallbackResponse(messageText),
        timestamp: new Date(),
        insights: generateFallbackInsights(messageText),
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Improved */}
      <header className="glass border-b border-white/5 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-lg transition-all hover:bg-white/5 group"
            >
              <ArrowLeft className="w-5 h-5 text-muted group-hover:text-neon-primary transition-colors" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
                <Bot className="w-5 h-5 text-neon-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold">Assistente IA</h3>
                <p className="text-xs text-muted">Dicas personalizadas</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
              <Gamepad2 className="w-5 h-5 text-neon-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Suggested Prompts (only show if no messages yet) */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Sugestões de perguntas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.text)}
                  disabled={isTyping}
                  className="rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] text-left disabled:opacity-50 border bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${prompt.color}15` }}
                  >
                    <prompt.icon className="w-4 h-4" style={{ color: prompt.color }} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] ${message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-br-md p-4 border border-cyan-500/30'
                  : 'space-y-3'
                  }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                      <Bot className="w-4 h-4 text-neon-accent" strokeWidth={2} />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-md p-4 border border-white/10">
                      <div
                        className="text-sm leading-relaxed [&_strong]:text-neon-primary [&_strong]:font-semibold"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                            .replace(/• /g, '<span class="text-neon-primary">•</span> ')
                        }}
                      />
                    </div>
                  </div>
                )}

                {message.role === 'user' && (
                  <p className="text-sm">{message.content}</p>
                )}

                {/* Insights Cards */}
                {message.insights && message.insights.length > 0 && (
                  <div className="ml-12 grid grid-cols-2 gap-2 mt-2">
                    {message.insights.map((insight, i) => (
                      <div 
                        key={i} 
                        className="rounded-xl p-3 border"
                        style={{ 
                          background: `${insight.color}10`,
                          borderColor: `${insight.color}30`
                        }}
                      >
                        <p className="text-xs text-muted mb-1">
                          {insight.label}
                        </p>
                        <p className="text-lg font-bold" style={{ color: insight.color }}>
                          {insight.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <Bot className="w-4 h-4 text-neon-accent" strokeWidth={2} />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-md px-5 py-4 flex items-center gap-1.5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - Improved */}
        <div className="flex-shrink-0 pt-2 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-2 flex gap-2 border border-white/10 focus-within:border-cyan-500/30 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo sobre seu gameplay..."
              className="flex-1 bg-transparent outline-none text-sm px-3 py-2 placeholder:text-muted/70"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              className="p-3 rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30"
              disabled={!input.trim() || isTyping}
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin text-neon-primary" />
              ) : (
                <Send className="w-5 h-5 text-neon-primary" strokeWidth={1.5} />
              )}
            </button>
          </div>
          <p className="text-[10px] mt-2 text-center text-muted/70">
            Respostas baseadas nas suas partidas rankeadas recentes
          </p>
        </div>
      </div>
    </div>
  );
}
