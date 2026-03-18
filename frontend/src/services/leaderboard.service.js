import axios from 'axios';

const API_BASE = '/api/leaderboard';

/**
 * Frontend Leaderboard Service
 * Handles API calls to leaderboard endpoints
 */
const leaderboardService = {
  /**
   * Get all-time leaderboard
   */
  getAllTimeLeaderboard: async (page = 1, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE}/all-time`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all-time leaderboard');
    }
  },

  /**
   * Get monthly leaderboard
   */
  getMonthlyLeaderboard: async (month, page = 1, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE}/monthly`, {
        params: { month, page, limit },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly leaderboard');
    }
  },

  /**
   * Get quarterly leaderboard
   */
  getQuarterlyLeaderboard: async (page = 1, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE}/quarterly`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quarterly leaderboard');
    }
  },

  /**
   * Get yearly leaderboard
   */
  getYearlyLeaderboard: async (page = 1, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE}/yearly`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch yearly leaderboard');
    }
  },

  /**
   * Get current user's rank
   */
  getMyRank: async (period = 'ALL_TIME', month) => {
    try {
      const params = { period };
      if (month) params.month = month;

      const response = await axios.get(`${API_BASE}/my-rank`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your rank');
    }
  },

  /**
   * Get specific user's rank
   */
  getUserRank: async (userId, period = 'ALL_TIME', month) => {
    try {
      const params = { period };
      if (month) params.month = month;

      const response = await axios.get(`${API_BASE}/user/${userId}/rank`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user rank');
    }
  },

  /**
   * Get top performers
   */
  getTopPerformers: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/top`, {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch top performers');
    }
  },

  /**
   * Get leaderboard summary (all ranks + achievements)
   */
  getLeaderboardSummary: async () => {
    try {
      const response = await axios.get(`${API_BASE}/summary`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard summary');
    }
  },

  /**
   * Get current user's achievements
   */
  getUserAchievements: async () => {
    try {
      const response = await axios.get(`${API_BASE}/achievements`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch achievements');
    }
  },

  /**
   * Get specific user's achievements
   */
  getUserAchievementsById: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}/achievements`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user achievements');
    }
  },

  /**
   * Get achievement statistics
   */
  getAchievementStats: async (type) => {
    try {
      const response = await axios.get(`${API_BASE}/achievements/stats/${type}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch achievement stats');
    }
  },

  /**
   * Check and unlock achievements
   */
  checkAndUnlockAchievements: async () => {
    try {
      const response = await axios.post(`${API_BASE}/check-achievements`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check achievements');
    }
  },

  /**
   * Admin: Recalculate rankings
   */
  recalculateRankings: async (period = 'ALL_TIME') => {
    try {
      const response = await axios.post(`${API_BASE}/recalculate`, { period });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to recalculate rankings');
    }
  },
};

export default leaderboardService;
