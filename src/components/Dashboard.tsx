import { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Target, TrendingUp, Swords, MessageSquare, Filter, ChevronRight, LogOut, User, Settings, RefreshCw, Clock, Gamepad2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { championService, matchService, statsService } from '../services/api';
import type { Match, PlayerStats, EvolutionData, ChampionStats } from '../services/api';

interface DashboardProps {
  onNavigate: (screen: string, data?: unknown) => void;
}

// Helper function for tier colors
const getTierColor = (tier: string): string => {
  const colors: Record<string, string> = {
    'IRON': '#8B7355',
    'BRONZE': '#CD7F32',
    'SILVER': '#C0C0C0',
    'GOLD': '#FFD700',
    'PLATINUM': '#00CED1',
    'EMERALD': '#50C878',
    'DIAMOND': '#B9F2FF',
    'MASTER': '#9932CC',
    'GRANDMASTER': '#FF4500',
    'CHALLENGER': '#F0E68C',
  };
  return colors[tier?.toUpperCase()] || 'var(--muted-text)';
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, logout, isLoading: authLoading, refreshUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7D' | '30D' | '90D'>('7D');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const hasLoadedData = useRef(false);

  // Data states
  const [matches, setMatches] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [championStats, setChampionStats] = useState<ChampionStats[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPeriodDays = useCallback(() => {
    switch (selectedPeriod) {
      case '7D': return 7;
      case '30D': return 30;
      case '90D': return 90;
      default: return 7;
    }
  }, [selectedPeriod]);

  // Load all data ONCE on mount - reduced API calls
  const loadAllData = useCallback(async () => {
    if (!user?.puuid || hasLoadedData.current) return;
    
    hasLoadedData.current = true;
    setIsLoadingMatches(true);
    setIsLoadingStats(true);

    try {
      // Carregar TUDO em paralelo - apenas 1 chamada para cada endpoint
      const [matchesData, statsData, evolutionDataResult, champStats] = await Promise.all([
        matchService.getMatches(user.puuid, 8), // Reduzido de 10 para 8
        statsService.getPlayerStats(user.puuid, getPeriodDays()),
        statsService.getEvolutionData(user.puuid, getPeriodDays()),
        statsService.getChampionStats(user.puuid)
      ]);

      setMatches(matchesData);
      setPlayerStats(statsData);
      setEvolutionData(evolutionDataResult);
      setChampionStats(champStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingMatches(false);
      setIsLoadingStats(false);
    }
  }, [user?.puuid, getPeriodDays]);

  // Load data on mount - ONCE only
  useEffect(() => {
    if (user?.puuid && !hasLoadedData.current) {
      loadAllData();
    }
  }, [user?.puuid, loadAllData]);

  // Load ONLY stats when period changes (não recarrega matches e champion stats)
  const loadStatsForPeriod = useCallback(async () => {
    if (!user?.puuid) return;

    setIsLoadingStats(true);
    try {
      const [stats, evolution] = await Promise.all([
        statsService.getPlayerStats(user.puuid, getPeriodDays()),
        statsService.getEvolutionData(user.puuid, getPeriodDays())
      ]);
      setPlayerStats(stats);
      setEvolutionData(evolution);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user?.puuid, getPeriodDays]);

  // Quando o período muda, só atualiza stats (não recarrega tudo)
  useEffect(() => {
    if (hasLoadedData.current && user?.puuid) {
      loadStatsForPeriod();
    }
  }, [selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (user?.puuid) {
        // Sync matches primeiro (isso invalida o cache no backend)
        await matchService.syncMatches(user.puuid);
      }
      // Resetar flag para permitir reload
      hasLoadedData.current = false;
      await loadAllData();
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('onboarding');
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  };

  // Display data - usar diretamente do user (AuthContext já faz refresh)
  const displayName = user?.gameName || 'Jogador';
  const displayTag = user?.tagLine || '';
  const displayTier = user?.tier || 'Unranked';
  const displayRank = user?.rank || '';
  const displayLevel = user?.level || '1';
  const displayIcon = user?.iconId || 29;
  const displayLP = user?.leaguePoints || 0;

  // Stats
  const stats = {
    winrate: playerStats?.winrate ?? 0,
    winrateTrend: playerStats?.winrateTrend ?? 0,
    kda: playerStats?.kda ?? 0,
    kdaTrend: playerStats?.kdaTrend ?? 0,
    csPerMin: playerStats?.csPerMin ?? 0,
    csPerMinTrend: playerStats?.csPerMinTrend ?? 0,
    avgDamage: playerStats?.avgDamage ?? 0,
    avgDamageTrend: playerStats?.avgDamageTrend ?? 0,
    totalGames: playerStats?.totalGames ?? 0,
    wins: playerStats?.wins ?? 0,
    losses: playerStats?.losses ?? 0,
  };

  return (
    <div className="min-h-screen">
      {/* Header - Improved with better styling */}
      <header className="glass border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo with icon */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
                <Gamepad2 className="w-5 h-5 text-neon-primary" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                SmartGG
              </span>
            </div>
            <nav className="hidden md:flex gap-1">
              <button className="px-4 py-2 rounded-lg transition-all bg-white/5 text-neon-primary text-sm font-medium">
                Dashboard
              </button>
              <button className="px-4 py-2 rounded-lg transition-all hover:bg-white/5 text-muted hover:text-white text-sm font-medium">
                Campeões
              </button>
              <button className="px-4 py-2 rounded-lg transition-all hover:bg-white/5 text-muted hover:text-white text-sm font-medium">
                Partidas
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              className="p-2.5 rounded-lg transition-all hover:bg-white/5 disabled:opacity-50 group"
              onClick={handleRefresh}
              disabled={isRefreshing || authLoading}
              title="Atualizar dados"
            >
              <RefreshCw
                className={`w-[18px] h-[18px] text-muted group-hover:text-neon-primary transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                strokeWidth={1.5}
              />
            </button>

            {/* Assistant Button */}
            <button
              className="p-2.5 rounded-lg transition-all hover:bg-white/5 group"
              onClick={() => onNavigate('assistant')}
              title="Assistente de Dicas"
            >
              <MessageSquare className="w-[18px] h-[18px] text-muted group-hover:text-neon-primary transition-colors" strokeWidth={1.5} />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-all hover:bg-white/5"
              >
                <div 
                  className="w-8 h-8 rounded-lg overflow-hidden border-2 flex-shrink-0"
                  style={{ borderColor: getTierColor(displayTier) }}
                >
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${displayIcon}.png`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/29.png`;
                    }}
                  />
                </div>
                <span className="hidden sm:block text-sm font-medium">{displayName}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 glass rounded-xl p-3 z-50 shadow-xl shadow-black/20 border border-white/10">
                  {/* User Info */}
                  <div className="pb-3 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0"
                        style={{ borderColor: getTierColor(displayTier) }}
                      >
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${displayIcon}.png`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{displayName}</p>
                        <p className="text-xs text-muted">
                          #{displayTag} • Nível {displayLevel}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Trophy className="w-3.5 h-3.5" style={{ color: getTierColor(displayTier) }} />
                          <span className="text-xs font-medium" style={{ color: getTierColor(displayTier) }}>
                            {displayTier} {displayRank}
                          </span>
                          {displayLP > 0 && (
                            <span className="text-xs text-muted">• {displayLP} LP</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-white/5 text-left">
                      <User className="w-4 h-4 text-muted" strokeWidth={1.5} />
                      <span className="text-sm">Meu Perfil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-white/5 text-left">
                      <Settings className="w-4 h-4 text-muted" strokeWidth={1.5} />
                      <span className="text-sm">Configurações</span>
                    </button>
                    <div className="border-t border-white/10 my-1.5" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-red-500/10 text-left text-red-400"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm">Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-5">
            {/* Player Card - Improved design */}
            <div className="glass rounded-2xl p-5 relative overflow-hidden">
              {/* Gradient background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${getTierColor(displayTier)} 0%, transparent 60%)`
                }}
              />
              {/* Subtle pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }} />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <div 
                      className="w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 shadow-lg"
                      style={{ borderColor: getTierColor(displayTier) }}
                    >
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${displayIcon}.png`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/29.png`;
                        }}
                      />
                    </div>
                    {/* Level badge */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 border border-white/20">
                      {displayLevel}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-0.5">{displayName}</h3>
                    <p className="text-sm text-muted mb-1.5">#{displayTag}</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" style={{ color: getTierColor(displayTier) }} strokeWidth={2} />
                      <span className="font-semibold" style={{ color: getTierColor(displayTier) }}>
                        {displayTier} {displayRank}
                      </span>
                      {displayLP > 0 && (
                        <span className="text-xs text-muted px-1.5 py-0.5 bg-white/5 rounded">
                          {displayLP} LP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-muted mb-1 uppercase tracking-wide">Vitórias</p>
                    <p className="text-xl font-bold text-success">{stats.wins}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-muted mb-1 uppercase tracking-wide">Derrotas</p>
                    <p className="text-xl font-bold text-danger">{stats.losses}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-muted mb-1 uppercase tracking-wide">Total</p>
                    <p className="text-xl font-bold">{stats.totalGames}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Champions - Improved design */}
            <div className="glass rounded-2xl p-5">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-neon-accent" strokeWidth={2} />
                </div>
                Top Campeões Ranked
              </h4>
              <div className="space-y-2.5">
                {championStats.length > 0 ? (
                  championStats.slice(0, 3).map((champ, i) => (
                    <div 
                      key={i} 
                      className="bg-white/5 rounded-xl p-3 flex items-center gap-3 transition-all hover:bg-white/10 cursor-pointer border border-white/5 hover:border-white/10"
                    >
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-white/10">
                          <img
                            src={championService.getChampionImage(champ.championId)}
                            alt={champ.championName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Rank badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{champ.championName}</p>
                        <p className="text-xs text-muted">
                          {champ.games} jogos • {champ.wins}V {champ.games - champ.wins}D
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: champ.winrate >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                          {champ.winrate.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted">
                          {champ.kda.toFixed(1)} KDA
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" strokeWidth={1} />
                    <p className="text-sm text-muted">Carregando campeões...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assistant Button - Improved design */}
            <button
              onClick={() => onNavigate('assistant')}
              className="w-full group relative overflow-hidden rounded-2xl p-5 transition-all hover:scale-[1.02] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-neon-primary" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-neon-primary">Assistente IA</p>
                  <p className="text-xs text-muted">Dicas personalizadas para melhorar</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted ml-auto" strokeWidth={1.5} />
              </div>
            </button>
          </div>

          {/* Main Column */}
          <div className="lg:col-span-8 space-y-5">
            {/* Metrics Grid - Improved design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Winrate',
                  value: `${stats.winrate.toFixed(1)}%`,
                  trend: `${stats.winrateTrend >= 0 ? '+' : ''}${stats.winrateTrend.toFixed(1)}%`,
                  icon: TrendingUp,
                  color: '#3de08a',
                  bgColor: 'rgba(61, 224, 138, 0.1)',
                  positive: stats.winrateTrend >= 0
                },
                {
                  label: 'KDA',
                  value: stats.kda.toFixed(2),
                  trend: `${stats.kdaTrend >= 0 ? '+' : ''}${stats.kdaTrend.toFixed(1)}`,
                  icon: Swords,
                  color: '#00e6ff',
                  bgColor: 'rgba(0, 230, 255, 0.1)',
                  positive: stats.kdaTrend >= 0
                },
                {
                  label: 'CS/min',
                  value: stats.csPerMin.toFixed(1),
                  trend: `${stats.csPerMinTrend >= 0 ? '+' : ''}${stats.csPerMinTrend.toFixed(1)}`,
                  icon: Target,
                  color: '#ffd93d',
                  bgColor: 'rgba(255, 217, 61, 0.1)',
                  positive: stats.csPerMinTrend >= 0
                },
                {
                  label: 'Dano Médio',
                  value: stats.avgDamage >= 1000 ? `${(stats.avgDamage / 1000).toFixed(1)}k` : stats.avgDamage.toFixed(0),
                  trend: `${stats.avgDamageTrend >= 0 ? '+' : ''}${(stats.avgDamageTrend / 1000).toFixed(1)}k`,
                  icon: Trophy,
                  color: '#ff4d9e',
                  bgColor: 'rgba(255, 77, 158, 0.1)',
                  positive: stats.avgDamageTrend >= 0
                },
              ].map((metric, i) => (
                <div 
                  key={i} 
                  className="glass rounded-2xl p-4 transition-all hover:scale-[1.02] cursor-pointer border border-white/5 hover:border-white/10"
                  style={{ background: metric.bgColor }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${metric.color}20` }}
                    >
                      <metric.icon className="w-4 h-4" style={{ color: metric.color }} strokeWidth={2} />
                    </div>
                    <p className="text-xs text-muted uppercase tracking-wide font-medium">{metric.label}</p>
                  </div>
                  <p className="text-2xl font-bold mb-1">{isLoadingStats ? '...' : metric.value}</p>
                  <p className="text-xs font-medium" style={{ color: metric.positive ? '#3de08a' : '#ff6b6b' }}>
                    {isLoadingStats ? '' : metric.trend} vs período anterior
                  </p>
                </div>
              ))}
            </div>

            {/* Evolution Chart - Improved design */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-neon-primary" strokeWidth={2} />
                  </div>
                  <h4 className="font-semibold">Evolução de Winrate</h4>
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                  {(['7D', '30D', '90D'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedPeriod === period 
                          ? 'bg-white/10 text-neon-primary' 
                          : 'text-muted hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                {evolutionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolutionData}>
                      <defs>
                        <linearGradient id="colorWinrate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00e6ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00e6ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="game"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={0.5}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={0.5}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 15, 28, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Winrate']}
                        labelFormatter={(label) => `Partida ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="winrate"
                        stroke="#00e6ff"
                        strokeWidth={2}
                        fill="url(#colorWinrate)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-muted opacity-30 mb-2" strokeWidth={1} />
                    <p className="text-sm text-muted">
                      {isLoadingStats ? 'Carregando...' : 'Nenhum dado disponível'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Match List - Improved design */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Swords className="w-4 h-4 text-neon-accent" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Partidas Ranked Recentes</h4>
                    <p className="text-xs text-muted">Solo/Duo e Flex</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg transition-all hover:bg-white/5 group">
                  <Filter className="w-4 h-4 text-muted group-hover:text-neon-primary transition-colors" strokeWidth={1.5} />
                </button>
              </div>

              {isLoadingMatches ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-neon-primary" />
                  <p className="text-sm text-muted">Carregando partidas rankeadas...</p>
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => onNavigate('match', match)}
                      className={`rounded-xl p-3.5 transition-all hover:scale-[1.01] cursor-pointer flex items-center gap-3 border ${
                        match.result === 'win' 
                          ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
                          : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                      }`}
                    >
                      {/* Result indicator */}
                      <div 
                        className={`w-1 h-12 rounded-full ${match.result === 'win' ? 'bg-success' : 'bg-danger'}`} 
                      />
                      
                      <div
                        className="w-11 h-11 rounded-xl overflow-hidden ring-2 flex-shrink-0"
                        style={{ 
                          ringColor: match.result === 'win' ? 'rgba(61, 224, 138, 0.5)' : 'rgba(255, 107, 107, 0.5)' 
                        }}
                      >
                        <img
                          src={championService.getChampionImage(match.championId)}
                          alt={match.champion}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium">{match.champion}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-muted">{match.gameMode}</span>
                        </div>
                        <p className="text-xs text-muted">
                          <span className="text-white font-medium">{match.kda}</span> KDA • 
                          <span className="text-white font-medium"> {match.cs}</span> CS • 
                          <span className="text-white font-medium"> {(match.damage / 1000).toFixed(1)}k</span> dano
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`px-2.5 py-1 rounded-lg mb-1 text-xs font-bold ${
                            match.result === 'win' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {match.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                        </div>
                        <p className="text-xs flex items-center gap-1 justify-end text-muted">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(match.timestamp)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" strokeWidth={1.5} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Swords className="w-10 h-10 mx-auto mb-3 text-muted opacity-30" strokeWidth={1} />
                  <p className="text-sm text-muted mb-3">Nenhuma partida rankeada encontrada</p>
                  <button
                    onClick={handleRefresh}
                    className="text-sm font-medium text-neon-primary hover:underline"
                  >
                    Sincronizar partidas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
