import { ArrowLeft, Clock, Trophy, Target, Zap, AlertCircle, Swords, Gamepad2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { championService } from '../services/api';
import { useState, useEffect } from 'react';

interface MatchDetailProps {
  match: any;
  onNavigate: (screen: string) => void;
}

// Data Dragon version (atualize conforme necessário)
const DDRAGON_VERSION = '14.24.1';
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

// Mapeamento de Summoner Spells por ID
const SPELL_BY_ID: Record<number, { key: string; name: string }> = {
  1: { key: 'SummonerBoost', name: 'Cleanse' },
  3: { key: 'SummonerExhaust', name: 'Exhaust' },
  4: { key: 'SummonerFlash', name: 'Flash' },
  6: { key: 'SummonerHaste', name: 'Ghost' },
  7: { key: 'SummonerHeal', name: 'Heal' },
  11: { key: 'SummonerSmite', name: 'Smite' },
  12: { key: 'SummonerTeleport', name: 'Teleport' },
  14: { key: 'SummonerDot', name: 'Ignite' },
  21: { key: 'SummonerBarrier', name: 'Barrier' },
};

// Mapeamento de Runas (Keystones) por ID
const RUNE_BY_ID: Record<number, { icon: string; name: string }> = {
  // Precision
  8005: { icon: 'perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png', name: 'Press the Attack' },
  8008: { icon: 'perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png', name: 'Lethal Tempo' },
  8021: { icon: 'perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png', name: 'Fleet Footwork' },
  8010: { icon: 'perk-images/Styles/Precision/Conqueror/Conqueror.png', name: 'Conqueror' },
  // Domination
  8112: { icon: 'perk-images/Styles/Domination/Electrocute/Electrocute.png', name: 'Electrocute' },
  8124: { icon: 'perk-images/Styles/Domination/Predator/Predator.png', name: 'Predator' },
  8128: { icon: 'perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png', name: 'Dark Harvest' },
  9923: { icon: 'perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png', name: 'Hail of Blades' },
  // Sorcery
  8214: { icon: 'perk-images/Styles/Sorcery/SummonAery/SummonAery.png', name: 'Summon Aery' },
  8229: { icon: 'perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png', name: 'Arcane Comet' },
  8230: { icon: 'perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png', name: 'Phase Rush' },
  // Resolve
  8437: { icon: 'perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png', name: 'Grasp of the Undying' },
  8439: { icon: 'perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png', name: 'Aftershock' },
  8465: { icon: 'perk-images/Styles/Resolve/Guardian/Guardian.png', name: 'Guardian' },
  // Inspiration
  8351: { icon: 'perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png', name: 'Glacial Augment' },
  8360: { icon: 'perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png', name: 'Unsealed Spellbook' },
  8369: { icon: 'perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png', name: 'First Strike' },
};

// Árvores de runas secundárias
const RUNE_TREE_BY_ID: Record<number, { icon: string; name: string }> = {
  8000: { icon: 'perk-images/Styles/7201_Precision.png', name: 'Precision' },
  8100: { icon: 'perk-images/Styles/7200_Domination.png', name: 'Domination' },
  8200: { icon: 'perk-images/Styles/7202_Sorcery.png', name: 'Sorcery' },
  8300: { icon: 'perk-images/Styles/7203_Whimsy.png', name: 'Inspiration' },
  8400: { icon: 'perk-images/Styles/7204_Resolve.png', name: 'Resolve' },
};

// Mapeamento de Itens comuns por ID (nomes em português)
const ITEM_BY_ID: Record<number, string> = {
  // Itens de Mago
  3285: "Eco de Luden",
  3089: "Chapéu da Morte de Rabadon",
  3020: "Botas do Feiticeiro",
  3135: "Máscara do Vazio",
  3157: "Ampulheta de Zhonya",
  3165: "Morellonomicon",
  3116: "Cetro de Cristal de Rylai",
  3152: "Rocketbelt Hextec",
  6653: "Abraço de Liandry",
  4628: "Lança do Horizonte",
  3102: "Véu da Banshee",
  4629: "Fulgor Cósmico",
  // Itens de AD
  6672: "Kraken Slayer",
  3031: "Gume do Infinito",
  6673: "Arco-escudo Imortal",
  3036: "Lembrete Mortal",
  3033: "Dominik",
  3072: "Sede de Sangue",
  3153: "Lâmina do Rei Destruído",
  6632: "Dançarina Fantasma",
  3006: "Botas de Berserker",
  6675: "Devorador de Essência",
  // Itens de Tank
  3068: "Égide de Fogo Solar",
  3075: "Cota de Espinhos",
  3143: "Presságio de Randuin",
  3110: "Coração Congelado",
  3065: "Visagem Espiritual",
  3193: "Gárgula Petroperene",
  3742: "Placa de Osso Morto",
  3047: "Tabi Ninja",
  3111: "Passos de Mercúrio",
  // Itens de Suporte
  3504: "Censer Ardente",
  3107: "Lágrima de Redenção",
  3011: "Queimador Químico",
  // Itens Jungle
  3850: "Lâmina do Coletor",
  // Wards
  3340: "Sentinela Furtivo",
  3364: "Lente Oracular",
};

// Componente de imagem com fallback
function GameImage({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback?: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} bg-white/10 flex items-center justify-center text-xs text-muted`}>
        {fallback || alt.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

const timelineEvents = [
  { time: 2, event: 'First Blood', description: 'Você eliminou o ADC inimigo', type: 'positive' },
  { time: 8, event: 'Torre Destruída', description: 'Primeira torre mid', type: 'positive' },
  { time: 12, event: 'Morte', description: 'Emboscado na jungle', type: 'negative' },
  { time: 18, event: 'Team Fight', description: 'Ace no dragão', type: 'positive' },
  { time: 25, event: 'Barão', description: 'Sua equipe matou o Barão', type: 'positive' },
  { time: 31, event: 'Vitória', description: 'Nexus destruído', type: 'positive' },
];

const damageData = [
  { min: 5, damage: 3200 },
  { min: 10, damage: 7800 },
  { min: 15, damage: 12400 },
  { min: 20, damage: 17100 },
  { min: 25, damage: 21500 },
  { min: 31, damage: 24500 },
];

const radarData = [
  { stat: 'Dano', player: 85, avg: 70 },
  { stat: 'Farm', player: 65, avg: 75 },
  { stat: 'Visão', player: 70, avg: 60 },
  { stat: 'Objetivo', player: 80, avg: 65 },
  { stat: 'KDA', player: 90, avg: 70 },
];

export function MatchDetail({ match, onNavigate }: MatchDetailProps) {
  return (
    <div className="min-h-screen">
      {/* Header - Improved */}
      <header className="glass border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-lg transition-all hover:bg-white/5 group"
            >
              <ArrowLeft className="w-5 h-5 text-muted group-hover:text-neon-primary transition-colors" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Swords className="w-4 h-4 text-neon-accent" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold">Detalhes da Partida</h3>
                <p className="text-xs text-muted">{match.gameMode}</p>
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

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Match Header */}
        <div className="glass rounded-xl p-8 mb-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${match.result === 'win' ? 'var(--success)' : 'var(--danger)'} 0%, transparent 100%)`
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border-4"
                style={{ borderColor: match.result === 'win' ? 'var(--success)' : 'var(--danger)' }}
              >
                <img
                  src={championService.getChampionImage(match.championId)}
                  alt={match.champion}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2>{match.champion}</h2>
                  <span
                    className="px-4 py-1 rounded-lg text-sm"
                    style={{
                      backgroundColor: match.result === 'win' ? 'rgba(61, 224, 138, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                      color: match.result === 'win' ? 'var(--success)' : 'var(--danger)'
                    }}
                  >
                    {match.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted-text)' }}>
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4" strokeWidth={1.5} />
                    {match.role || match.gameMode}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    {match.time}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm mb-1 text-muted">KDA</p>
                <p className="text-2xl text-neon-primary">{match.kda}</p>
                <p className="text-sm text-success">Razão 4.67</p>
              </div>
              <div className="text-center">
                <p className="text-sm mb-1 text-muted">CS</p>
                <p className="text-2xl">{match.cs}</p>
                <p className="text-sm text-muted">{match.csPerMin?.toFixed(1) || '7.4'}/min</p>
              </div>
              <div className="text-center">
                <p className="text-sm mb-1 text-muted">Dano</p>
                <p className="text-2xl">{(match.damage / 1000).toFixed(1)}k</p>
                <p className="text-sm text-success">+12% média</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-xl mb-6">
          <div className="flex border-b border-white/5">
            <button className="px-6 py-4 border-b-2 transition-smooth border-neon-primary text-neon-primary">
              Resumo
            </button>
            <button className="px-6 py-4 transition-smooth text-muted">
              Timeline
            </button>
            <button className="px-6 py-4 transition-smooth text-muted">
              Comparativo
            </button>
            <button className="px-6 py-4 transition-smooth text-muted">
              Eventos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Build & Items */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h4 className="mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-accent" strokeWidth={1.5} />
                Build Final
              </h4>

              <div className="space-y-3">
                {/* ITENS */}
                <div>
                  <p className="text-xs mb-1.5 text-muted uppercase tracking-wide">Itens</p>
                  <div className="flex flex-wrap gap-1">
                    {(match.items && match.items.length > 0
                      ? match.items.slice(0, 6)
                      : [3285, 3089, 3020, 3135, 3157, 3165]
                    ).map((itemId: number, i: number) => {
                      const itemName = ITEM_BY_ID[itemId] || `Item ${itemId}`;
                      return (
                        <div key={i} className="group relative">
                          <div
                            className="w-7 h-7 rounded overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer"
                            title={itemName}
                          >
                            <GameImage
                              src={`${DDRAGON_BASE}/img/item/${itemId}.png`}
                              alt={itemName}
                              className="w-full h-full object-cover"
                              fallback="?"
                            />
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                            <div className="bg-black/95 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap border border-white/20">
                              {itemName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RUNAS */}
                <div>
                  <p className="text-xs mb-1.5 text-muted uppercase tracking-wide">Runas</p>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const runeId = match.primaryRuneId || 8112;
                      const runeData = RUNE_BY_ID[runeId];
                      return (
                        <div
                          className="w-6 h-6 rounded overflow-hidden border border-cyan-500/50 bg-cyan-500/10 cursor-pointer"
                          title={runeData?.name || 'Keystone'}
                        >
                          {runeData ? (
                            <GameImage
                              src={`https://ddragon.leagueoflegends.com/cdn/img/${runeData.icon}`}
                              alt={runeData.name}
                              className="w-full h-full object-cover"
                              fallback="K"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px]">K</div>
                          )}
                        </div>
                      );
                    })()}
                    <span className="text-white/30 text-xs">+</span>
                    {(() => {
                      const treeId = match.secondaryRuneId || 8200;
                      const treeData = RUNE_TREE_BY_ID[treeId];
                      return (
                        <div
                          className="w-5 h-5 rounded overflow-hidden border border-white/20 bg-white/5 cursor-pointer"
                          title={treeData?.name || 'Secondary'}
                        >
                          {treeData ? (
                            <GameImage
                              src={`https://ddragon.leagueoflegends.com/cdn/img/${treeData.icon}`}
                              alt={treeData.name}
                              className="w-full h-full object-cover"
                              fallback="S"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px]">S</div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* FEITIÇOS */}
                <div>
                  <p className="text-xs mb-1.5 text-muted uppercase tracking-wide">Feitiços</p>
                  <div className="flex items-center gap-1">
                    {[match.spell1Id || 4, match.spell2Id || 14].map((spellId: number, i: number) => {
                      const spellData = SPELL_BY_ID[spellId];
                      return (
                        <div
                          key={i}
                          className="w-6 h-6 rounded overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer"
                          title={spellData?.name || `Spell ${spellId}`}
                        >
                          {spellData ? (
                            <GameImage
                              src={`${DDRAGON_BASE}/img/spell/${spellData.key}.png`}
                              alt={spellData.name}
                              className="w-full h-full object-cover"
                              fallback={spellData.name.charAt(0)}
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-[8px] text-muted">?</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Box */}
            <div className="glass rounded-xl p-6 border-l-4 border-neon-primary">
              <h4 className="mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-neon-primary" strokeWidth={1.5} />
                Análise Automática
              </h4>
              <div className="space-y-3">
                <div className="glass rounded-lg p-3">
                  <p className="text-sm mb-1 text-success">✓ Ótimo aproveitamento de dano</p>
                  <p className="text-xs text-muted">Seu dano foi 12% acima da média</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-sm mb-1 text-warning">⚠ Farm pode melhorar</p>
                  <p className="text-xs text-muted">CS/min está 8% abaixo do ideal</p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-sm mb-1 text-success">✓ Boa participação em kills</p>
                  <p className="text-xs text-muted">KP: 82% - excelente presença</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Damage Over Time */}
            <div className="glass rounded-xl p-6">
              <h4 className="mb-6">Dano por Minuto</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={damageData}>
                    <XAxis
                      dataKey="min"
                      stroke="var(--muted-text)"
                      strokeWidth={0.5}
                      tick={{ fill: 'var(--muted-text)', fontSize: 12 }}
                      label={{ value: 'Minutos', position: 'insideBottom', offset: -5, fill: 'var(--muted-text)' }}
                    />
                    <YAxis
                      stroke="var(--muted-text)"
                      strokeWidth={0.5}
                      tick={{ fill: 'var(--muted-text)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="damage"
                      stroke="var(--neon-accent)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--neon-accent)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart - Stats Comparison */}
            <div className="glass rounded-xl p-6">
              <h4 className="mb-6">Desempenho vs Média do Servidor</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="stat"
                      tick={{ fill: 'var(--muted-text)', fontSize: 12 }}
                    />
                    <Radar
                      name="Você"
                      dataKey="player"
                      stroke="var(--neon-primary)"
                      fill="var(--neon-primary)"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Média"
                      dataKey="avg"
                      stroke="var(--muted-text)"
                      fill="var(--muted-text)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--neon-primary)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted-text)' }}>Você</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--muted-text)' }} />
                  <span className="text-sm" style={{ color: 'var(--muted-text)' }}>Média do servidor</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass rounded-xl p-6">
              <h4 className="mb-6">Timeline de Eventos</h4>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'var(--neon-primary)', opacity: 0.3 }} />
                <div className="space-y-4">
                  {timelineEvents.map((event, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div
                        className="w-12 h-12 rounded-full glass flex items-center justify-center flex-shrink-0 border-2 z-10"
                        style={{
                          borderColor: event.type === 'positive' ? 'var(--success)' : 'var(--danger)',
                          backgroundColor: 'var(--background)'
                        }}
                      >
                        <span className="text-sm">{event.time}'</span>
                      </div>
                      <div className="glass rounded-lg p-4 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p>{event.event}</p>
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: event.type === 'positive' ? 'rgba(61, 224, 138, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                              color: event.type === 'positive' ? 'var(--success)' : 'var(--danger)'
                            }}
                          >
                            {event.type === 'positive' ? '+' : '-'}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--muted-text)' }}>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
