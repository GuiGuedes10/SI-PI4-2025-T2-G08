// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  email: string;
  gameName: string;
  tagLine: string;
  puuid: string;
  iconId: number | null;
  level: string | null;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
}

export interface UserWithMastery {
  user: User;
  masteries: ChampionMastery[];
}

export interface ChampionMastery {
  championId: number;
  championName: string;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  gameName: string;
  tagLine: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// MATCH TYPES
// ============================================

export interface Match {
  id: string;
  champion: string;
  championId: number;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  result: 'win' | 'lose';
  time: string;
  timestamp: number;
  damage: number;
  cs: number;
  csPerMin: number;
  gold: number;
  duration: number;
  gameMode: string;
}

export interface MatchDetails extends Match {
  items: number[];
  runes: {
    primary: number;
    secondary: number;
  };
  summonerSpells: number[];
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  objectivesParticipation: number;
}

// ============================================
// STATS TYPES
// ============================================

export interface PlayerStats {
  winrate: number;
  winrateTrend: number;
  kda: number;
  kdaTrend: number;
  csPerMin: number;
  csPerMinTrend: number;
  avgDamage: number;
  avgDamageTrend: number;
  totalGames: number;
  wins: number;
  losses: number;
}

export interface ChampionStats {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  winrate: number;
  kda: number;
  avgCs: number;
  avgDamage: number;
}

export interface EvolutionData {
  date: string;
  game: number;
  winrate: number;
  kda: number;
}

// ============================================
// RECOMMENDATIONS TYPES
// ============================================

export interface BuildRecommendation {
  id: string;
  championId: number;
  championName: string;
  title: string;
  description: string;
  items: number[];
  runes: {
    primary: number[];
    secondary: number[];
  };
  winrate: number;
  gamesAnalyzed: number;
}

export interface Insight {
  id: string;
  type: 'tip' | 'warning' | 'success';
  title: string;
  description: string;
  metric?: string;
  value?: string;
}

// ============================================
// ASSISTANT TYPES (N8N Webhook)
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: {
    label: string;
    value: string;
    color: string;
  }[];
}

export interface N8NWebhookRequest {
  message: string;
  userId: number;
  puuid: string;
  context?: {
    lastMatches?: Match[];
    stats?: PlayerStats;
    currentChampion?: string;
  };
}

export interface N8NWebhookResponse {
  response: string;
  insights?: {
    label: string;
    value: string;
    color: string;
  }[];
  suggestions?: string[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

