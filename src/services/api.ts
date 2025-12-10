import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  gameName: string;
  tagLine: string;
}

export interface User {
  id: number;
  email: string;
  gameName: string;
  tagLine: string;
  puuid: string;
  iconId: number;
  level: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  masteries?: ChampionMastery[];
}

export interface ChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
}

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

// Auth Service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('user');
  },
};

// User Service
export const userService = {
  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getUserWithMasteries: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

// Match Service
export const matchService = {
  getMatches: async (puuid: string, count: number = 10): Promise<Match[]> => {
    const response = await api.get(`/matches/${puuid}?count=${count}`);
    return response.data;
  },

  getMatchById: async (puuid: string, matchId: string): Promise<Match> => {
    const response = await api.get(`/matches/${puuid}/match/${matchId}`);
    return response.data;
  },

  syncMatches: async (puuid: string): Promise<{ success: boolean; matchesSynced: number }> => {
    const response = await api.post(`/matches/${puuid}/sync`);
    return response.data;
  },
};

// Stats Service
export const statsService = {
  getPlayerStats: async (puuid: string, days: number = 30): Promise<PlayerStats> => {
    const response = await api.get(`/stats/${puuid}?days=${days}`);
    return response.data;
  },

  getChampionStats: async (puuid: string): Promise<ChampionStats[]> => {
    const response = await api.get(`/stats/${puuid}/champions`);
    return response.data;
  },

  getEvolutionData: async (puuid: string, days: number = 30): Promise<EvolutionData[]> => {
    const response = await api.get(`/stats/${puuid}/evolution?days=${days}`);
    return response.data;
  },
};

// Champion Service
export const championService = {
  getChampionAverage: async (puuid: string, championId: number): Promise<any> => {
    const response = await api.get(`/users/champion/average/${puuid}?championId=${championId}`);
    return response.data;
  },

  getChampionImage: (championId: number): string => {
    // Using Data Dragon for champion images
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`;
  },

  getChampionSplash: (championId: number): string => {
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${championId}/${championId}000.jpg`;
  },
};

// Assistant Service (AI) - Integração com n8n
export const assistantService = {
  sendMessage: async (request: { 
    message: string; 
    userId: number; 
    puuid: string; 
    gameName?: string;
    tier?: string;
    rank?: string;
    context?: { 
      currentChampion?: string;
      stats?: PlayerStats;
      recentMatches?: Match[];
      topChampions?: ChampionStats[];
    } 
  }): Promise<{ 
    response: string; 
    insights?: { label: string; value: string; color: string }[];
    isGameRelated?: boolean;
  }> => {
    try {
      // Preparar payload para o backend (que vai chamar o n8n)
      const payload = {
        message: request.message,
        userId: request.userId,
        puuid: request.puuid,
        gameName: request.gameName,
        tier: request.tier,
        rank: request.rank,
        playerContext: request.context ? {
          stats: request.context.stats,
          recentMatches: request.context.recentMatches,
          topChampions: request.context.topChampions,
          currentChampion: request.context.currentChampion
        } : undefined
      };

      const response = await api.post('/assistant/chat', payload);
      return response.data;
    } catch (error) {
      console.error('[AssistantService] Erro ao chamar backend:', error);
      // Fallback response if AI endpoint not available
      return {
        response: generateAIResponse(request.message),
        insights: generateInsights(request.message),
        isGameRelated: true
      };
    }
  },
};

// Generate insights based on message
function generateInsights(message: string): { label: string; value: string; color: string }[] | undefined {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('farm') || lowerMessage.includes('cs')) {
    return [
      { label: 'Meta CS/min', value: '8+', color: 'var(--neon-primary)' },
      { label: 'CS aos 10min', value: '80+', color: 'var(--success)' }
    ];
  }
  
  if (lowerMessage.includes('morte') || lowerMessage.includes('morrer')) {
    return [
      { label: 'Mortes ideais', value: '<4', color: 'var(--danger)' },
      { label: 'Wards/jogo', value: '10+', color: 'var(--success)' }
    ];
  }
  
  return undefined;
}

// Fallback AI response generator
function generateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('build') || lowerMessage.includes('item')) {
    return `Para builds otimizadas, recomendo analisar suas partidas recentes e focar em itens que complementem seu estilo de jogo. Verifique seu winrate com diferentes builds no Dashboard.`;
  }
  
  if (lowerMessage.includes('melhorar') || lowerMessage.includes('improve') || lowerMessage.includes('dica')) {
    return `Para melhorar seu gameplay, foque em: 1) CS consistente (mire em 7+ CS/min), 2) Visão do mapa (coloque wards frequentemente), 3) Posicionamento em teamfights. Analise suas partidas perdidas para identificar padrões de erro.`;
  }
  
  if (lowerMessage.includes('campeão') || lowerMessage.includes('champion') || lowerMessage.includes('pick')) {
    return `Baseado no meta atual, recomendo focar em 2-3 campeões por role. Confira sua aba de Champions no Dashboard para ver com quais você tem melhor desempenho.`;
  }
  
  if (lowerMessage.includes('rank') || lowerMessage.includes('elo') || lowerMessage.includes('subir')) {
    return `Para subir de elo: 1) Domine 2-3 campeões, 2) Mantenha mentalidade positiva, 3) Foque em objetivos, 4) Aprenda a carregar e a ser carregado. Seu progresso está sendo monitorado no Dashboard!`;
  }

  return `Olá! Sou o assistente do SmartGG. Posso te ajudar com builds, estratégias, análise de partidas e dicas para melhorar seu gameplay. Como posso te ajudar hoje?`;
}

// Utility functions
export const getProfileIconUrl = (iconId: number): string => {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${iconId}.jpg`;
};

export const getRankEmblemUrl = (tier: string): string => {
  if (!tier) return '';
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;
};

export const formatTimeAgo = (timestamp: number): string => {
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

export default api;
