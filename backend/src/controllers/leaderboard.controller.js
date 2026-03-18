import LeaderboardService from '../services/leaderboard.service.js';
import { logger } from '../config/logger.js';

/**
 * Leaderboard Controller
 * Handles HTTP requests for leaderboard and achievement endpoints
 */

class LeaderboardController {
  /**
   * Get all-time leaderboard
   * GET /api/leaderboard/all-time
   */
  static async getAllTimeLeaderboard(req, res) {
    try {
      const { limit = 100, page = 1 } = req.query;
      const skip = (page - 1) * limit;
      const companyId = req.user.companyId;

      const result = await LeaderboardService.getAllTimeLeaderboard(limit, skip, companyId);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Failed to get all-time leaderboard: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message,
      });
    }
  }

  /**
   * Get monthly leaderboard
   * GET /api/leaderboard/monthly
   */
  static async getMonthlyLeaderboard(req, res) {
    try {
      const { month, limit = 100, page = 1 } = req.query;
      const skip = (page - 1) * limit;
      const companyId = req.user.companyId;

      const result = await LeaderboardService.getMonthlyLeaderboard(month, limit, skip, companyId);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Failed to get monthly leaderboard: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message,
      });
    }
  }

  /**
   * Get quarterly leaderboard
   * GET /api/leaderboard/quarterly
   */
  static async getQuarterlyLeaderboard(req, res) {
    try {
      const { limit = 100, page = 1 } = req.query;
      const skip = (page - 1) * limit;
      const companyId = req.user.companyId;

      const result = await LeaderboardService.getQuarterlyLeaderboard(limit, skip, companyId);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Failed to get quarterly leaderboard: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message,
      });
    }
  }

  /**
   * Get yearly leaderboard
   * GET /api/leaderboard/yearly
   */
  static async getYearlyLeaderboard(req, res) {
    try {
      const { limit = 100, page = 1 } = req.query;
      const skip = (page - 1) * limit;
      const companyId = req.user.companyId;

      const result = await LeaderboardService.getYearlyLeaderboard(limit, skip, companyId);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Failed to get yearly leaderboard: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message,
      });
    }
  }

  /**
   * Get top performers
   * GET /api/leaderboard/top
   */
  static async getTopPerformers(req, res) {
    try {
      const { limit = 10 } = req.query;
      const companyId = req.user.companyId;

      const topPerformers = await LeaderboardService.getTopPerformers(limit, companyId);

      return res.json({
        success: true,
        data: topPerformers,
      });
    } catch (error) {
      logger.error(`Failed to get top performers: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch top performers',
        error: error.message,
      });
    }
  }

  /**
   * Get user rank and position
   * GET /api/leaderboard/my-rank
   */
  static async getMyRank(req, res) {
    try {
      const { period = 'ALL_TIME', month } = req.query;
      const userId = req.user.id;
      const companyId = req.user.companyId;

      const rank = await LeaderboardService.getUserRank(userId, period, month, companyId);

      if (!rank) {
        return res.status(404).json({
          success: false,
          message: 'User not found on leaderboard',
        });
      }

      return res.json({
        success: true,
        data: rank,
      });
    } catch (error) {
      logger.error(`Failed to get user rank: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user rank',
        error: error.message,
      });
    }
  }

  /**
   * Get user rank by ID
   * GET /api/leaderboard/user/:userId/rank
   */
  static async getUserRank(req, res) {
    try {
      const { userId } = req.params;
      const { period = 'ALL_TIME', month } = req.query;
      const companyId = req.user.companyId;

      const rank = await LeaderboardService.getUserRank(userId, period, month, companyId);

      if (!rank) {
        return res.status(404).json({
          success: false,
          message: 'User not found on leaderboard',
        });
      }

      return res.json({
        success: true,
        data: rank,
      });
    } catch (error) {
      logger.error(`Failed to get user rank: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user rank',
        error: error.message,
      });
    }
  }

  /**
   * Get leaderboard summary
   * GET /api/leaderboard/summary
   */
  static async getLeaderboardSummary(req, res) {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId;

      const summary = await LeaderboardService.getLeaderboardSummary(userId, companyId);

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error(`Failed to get leaderboard summary: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch summary',
        error: error.message,
      });
    }
  }

  /**
   * Get user achievements
   * GET /api/leaderboard/achievements
   */
  static async getUserAchievements(req, res) {
    try {
      const userId = req.user.id;

      const achievements = await LeaderboardService.getUserAchievements(userId);

      return res.json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      logger.error(`Failed to get achievements: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch achievements',
        error: error.message,
      });
    }
  }

  /**
   * Get achievement statistics
   * GET /api/leaderboard/achievements/stats/:type
   */
  static async getAchievementStats(req, res) {
    try {
      const { type } = req.params;

      const stats = await LeaderboardService.getAchievementStats(type);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error(`Failed to get achievement stats: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch achievement stats',
        error: error.message,
      });
    }
  }

  /**
   * Get user achievements by user ID
   * GET /api/leaderboard/user/:userId/achievements
   */
  static async getUserAchievementsById(req, res) {
    try {
      const { userId } = req.params;

      const achievements = await LeaderboardService.getUserAchievements(userId);

      return res.json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      logger.error(`Failed to get achievements: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch achievements',
        error: error.message,
      });
    }
  }

  /**
   * Recalculate leaderboard rankings
   * POST /api/leaderboard/recalculate
   * Admin only
   */
  static async recalculateRankings(req, res) {
    try {
      const { period = 'ALL_TIME' } = req.body;

      await LeaderboardService.recalculateRanks(period);

      return res.json({
        success: true,
        message: `Leaderboard rankings recalculated for period: ${period}`,
      });
    } catch (error) {
      logger.error(`Failed to recalculate rankings: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to recalculate rankings',
        error: error.message,
      });
    }
  }

  /**
   * Check and unlock achievements for user
   * POST /api/leaderboard/check-achievements
   */
  static async checkAndUnlockAchievements(req, res) {
    try {
      const userId = req.user.id;

      await LeaderboardService.checkAndUnlockAchievements(userId);

      return res.json({
        success: true,
        message: 'Achievements checked and unlocked if eligible',
      });
    } catch (error) {
      logger.error(`Failed to check achievements: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to check achievements',
        error: error.message,
      });
    }
  }
}

export default LeaderboardController;
