import Leaderboard from '../models/Leaderboard.js';
import Achievement from '../models/Achievement.js';
import { User } from '../models/User.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import { Review } from '../models/Review.js';
import Skill from '../models/Skill.js';
import { logger } from '../config/logger.js';

/**
 * Leaderboard Service
 * Handles ranking calculations, leaderboard retrieval, and achievement tracking
 */

class LeaderboardService {
  /**
   * Calculate composite leaderboard score
   */
  static calculateScore(stats) {
    const weights = {
      xp: 0.35,
      approval: 0.30,
      review: 0.20,
      skill: 0.10,
      consistency: 0.05,
    };

    const xpScore = Math.min((stats.totalXp / 10000) * 100, 100);
    const approvalScore = stats.approvalRate || 0;
    const reviewScore = Math.min((stats.reviewCount / 50) * 100, 100);
    const skillScore = (stats.maxSkillLevel / 5) * 100;
    const consistencyScore = Math.min((stats.streak.current / 30) * 100, 100);

    const totalScore =
      xpScore * weights.xp +
      approvalScore * weights.approval +
      reviewScore * weights.review +
      skillScore * weights.skill +
      consistencyScore * weights.consistency;

    return {
      totalScore: Math.round(totalScore),
      xpScore: Math.round(xpScore),
      approvalScore: Math.round(approvalScore),
      reviewScore: Math.round(reviewScore),
      skillScore: Math.round(skillScore),
      consistencyScore: Math.round(consistencyScore),
    };
  }

  /**
   * Get all-time leaderboard
   */
  static async getAllTimeLeaderboard(limit = 100, skip = 0, companyId = null) {
    return this.getLeaderboardByPeriod('ALL_TIME', limit, skip, companyId);
  }

  /**
   * Get monthly leaderboard
   */
  static async getMonthlyLeaderboard(month = null, limit = 100, skip = 0, companyId = null) {
    return this.getLeaderboardByPeriod('MONTHLY', limit, skip, companyId, month);
  }

  /**
   * Get quarterly leaderboard
   */
  static async getQuarterlyLeaderboard(limit = 100, skip = 0, companyId = null) {
    return this.getLeaderboardByPeriod('QUARTERLY', limit, skip, companyId);
  }

  /**
   * Get yearly leaderboard
   */
  static async getYearlyLeaderboard(limit = 100, skip = 0, companyId = null) {
    return this.getLeaderboardByPeriod('YEARLY', limit, skip, companyId);
  }

  /**
   * Get leaderboard by period
   */
  static async getLeaderboardByPeriod(period, limit = 100, skip = 0, companyId = null, month = null) {
    try {
      const query = { period };
      if (companyId) {
        query.companyId = companyId;
      }

      if (period === 'MONTHLY') {
        const currentMonth = month || new Date().toISOString().substring(0, 7);
        query.month = currentMonth;
      }

      const leaderboard = await Leaderboard.find(query)
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username fullName avatar role')
        .populate('badges', 'type title icon')
        .lean();

      const total = await Leaderboard.countDocuments(query);

      return {
        leaderboard,
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
        ...(query.month ? { month: query.month } : {}),
      };
    } catch (error) {
      logger.error(`Failed to fetch ${period} leaderboard: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user rank and position
   */
  static async getUserRank(userId, period = 'ALL_TIME', month = null, companyId = null) {
    try {
      const query = { userId, period };
      if (companyId) {
        query.companyId = companyId;
      }
      if (period === 'MONTHLY') {
        query.month = month || new Date().toISOString().substring(0, 7);
      }

      const userRank = await Leaderboard.findOne(query)
        .populate('userId', 'username fullName avatar role')
        .populate('badges', 'type title icon')
        .lean();

      if (!userRank) {
        return null;
      }

      // Calculate percentile
      const higherScores = await Leaderboard.countDocuments({
        period: query.period,
        ...(query.month && { month: query.month }),
        ...(companyId && { companyId }),
        score: { $gt: userRank.score },
      });

      const totalUsers = await Leaderboard.countDocuments({
        period: query.period,
        ...(query.month && { month: query.month }),
        ...(companyId && { companyId }),
      });

      const percentileRank = totalUsers
        ? ((totalUsers - higherScores) / totalUsers) * 100
        : 0;

      return {
        ...userRank,
        percentileRank: Math.round(percentileRank),
      };
    } catch (error) {
      logger.error(`Failed to get user rank: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user leaderboard stats
   */
  static async updateUserStats(userId, updates, period = 'ALL_TIME', companyId = null) {
    try {
      const query = { userId, period };
      if (period === 'MONTHLY') {
        query.month = new Date().toISOString().substring(0, 7);
      }

      // Calculate new stats
      const updatedStats = updates;
      const scoreCalculation = this.calculateScore(updatedStats);

      const leaderboardEntry = await Leaderboard.findOneAndUpdate(
        query,
        {
          ...updatedStats,
          score: scoreCalculation.totalScore,
          scoreBreakdown: {
            xpScore: scoreCalculation.xpScore,
            approvalScore: scoreCalculation.approvalScore,
            reviewScore: scoreCalculation.reviewScore,
            skillScore: scoreCalculation.skillScore,
            consistencyScore: scoreCalculation.consistencyScore,
          },
          lastUpdated: new Date(),
        },
        { new: true, upsert: true }
      );

      // Recalculate ranks
      await this.recalculateRanks(period, companyId);

      logger.info(`Updated leaderboard stats for user ${userId}`);
      return leaderboardEntry;
    } catch (error) {
      logger.error(`Failed to update user stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Recalculate all ranks for a period
   */
  static async recalculateRanks(period = 'ALL_TIME', companyId = null) {
    try {
      const query = { period };
      if (companyId) {
        query.companyId = companyId;
      }

      const leaderboard = await Leaderboard.find(query).sort({ score: -1 });

      for (let i = 0; i < leaderboard.length; i++) {
        await Leaderboard.updateOne(
          { _id: leaderboard[i]._id },
          {
            previousRank: leaderboard[i].rank,
            rank: i + 1,
            percentileRank: ((leaderboard.length - i) / leaderboard.length) * 100,
            trendDirection: this.getTrendDirection(leaderboard[i].previousRank, i + 1),
          }
        );
      }

      logger.info(`Recalculated ranks for period ${period}`);
    } catch (error) {
      logger.error(`Failed to recalculate ranks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get trend direction
   */
  static getTrendDirection(previousRank, currentRank) {
    if (!previousRank) return 'STABLE';
    if (currentRank < previousRank) return 'UP';
    if (currentRank > previousRank) return 'DOWN';
    return 'STABLE';
  }

  /**
   * Unlock achievement
   */
  static async unlockAchievement(userId, achievementType, requirement = null) {
    try {
      const existingAchievement = await Achievement.findOne({
        userId,
        type: achievementType,
      });

      if (existingAchievement) {
        logger.info(`User ${userId} already has achievement ${achievementType}`);
        return existingAchievement;
      }

      const achievementData = this.getAchievementData(achievementType);

      const achievement = new Achievement({
        userId,
        type: achievementType,
        title: achievementData.title,
        description: achievementData.description,
        icon: achievementData.icon,
        rarity: achievementData.rarity,
        xpReward: achievementData.xpReward,
        requirement,
      });

      await achievement.save();

      // Update achievement stats
      await Achievement.updateOne(
        { type: achievementType },
        { $inc: { 'stats.userCount': 1 } }
      );

      logger.info(`Achievement unlocked for user ${userId}: ${achievementType}`);
      return achievement;
    } catch (error) {
      logger.error(`Failed to unlock achievement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get achievement data by type
   */
  static getAchievementData(type) {
    const achievements = {
      SKILL_LEVEL_5: {
        title: 'Master of Skills',
        description: 'Reach level 5 in any skill',
        icon: '⭐',
        rarity: 'RARE',
        xpReward: 500,
      },
      FIRST_SUBMISSION: {
        title: 'First Steps',
        description: 'Submit your first code',
        icon: '👣',
        rarity: 'COMMON',
        xpReward: 10,
      },
      FIVE_SUBMISSIONS: {
        title: 'Prolific Developer',
        description: 'Submit 5 code submissions',
        icon: '📝',
        rarity: 'UNCOMMON',
        xpReward: 100,
      },
      FIFTY_APPROVALS: {
        title: 'Quality Code Master',
        description: 'Get 50 code approvals',
        icon: '✅',
        rarity: 'EPIC',
        xpReward: 500,
      },
      CODE_REVIEWER: {
        title: 'Code Reviewer',
        description: 'Complete 10 code reviews',
        icon: '👀',
        rarity: 'UNCOMMON',
        xpReward: 150,
      },
      CODE_MASTER: {
        title: 'Code Master',
        description: 'Complete 50 code reviews',
        icon: '🧙',
        rarity: 'EPIC',
        xpReward: 400,
      },
      SKILL_SPECIALIST: {
        title: 'Skill Specialist',
        description: 'Master 3 different skills',
        icon: '🎯',
        rarity: 'RARE',
        xpReward: 300,
      },
      COMMUNITY_STAR: {
        title: 'Community Star',
        description: 'Reach the top 10 on the leaderboard',
        icon: '⭐',
        rarity: 'LEGENDARY',
        xpReward: 1000,
      },
      ACCURACY_STREAK: {
        title: 'Accuracy Streak',
        description: 'Get 10 approvals in a row',
        icon: '🔥',
        rarity: 'RARE',
        xpReward: 300,
      },
      SPEED_DEMON: {
        title: 'Speed Demon',
        description: 'Submit 10 codes in one day',
        icon: '⚡',
        rarity: 'UNCOMMON',
        xpReward: 200,
      },
      CONSISTENCY_PRO: {
        title: 'Consistency Pro',
        description: 'Maintain a 30-day activity streak',
        icon: '🏆',
        rarity: 'RARE',
        xpReward: 400,
      },
      QUALITY_ADVOCATE: {
        title: 'Quality Advocate',
        description: 'Maintain 90%+ approval rate',
        icon: '💎',
        rarity: 'EPIC',
        xpReward: 500,
      },
      MILESTONE_SENIOR: {
        title: 'Senior Developer',
        description: 'Reach SENIOR role',
        icon: '🚀',
        rarity: 'EPIC',
        xpReward: 600,
      },
      MILESTONE_MANAGER: {
        title: 'Team Manager',
        description: 'Reach MANAGER role',
        icon: '👔',
        rarity: 'LEGENDARY',
        xpReward: 1000,
      },
    };

    return achievements[type] || {
      title: 'Unknown Achievement',
      description: 'Achievement description not found',
      icon: '🏅',
      rarity: 'COMMON',
      xpReward: 50,
    };
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId) {
    try {
      const achievements = await Achievement.find({ userId })
        .sort({ unlockedAt: -1 })
        .lean();

      return achievements;
    } catch (error) {
      logger.error(`Failed to fetch user achievements: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get achievement statistics
   */
  static async getAchievementStats(achievementType) {
    try {
      const achievement = await Achievement.findOne({ type: achievementType });

      if (!achievement) {
        return {
          type: achievementType,
          totalUnlocked: 0,
          rarity: 'COMMON',
        };
      }

      return {
        type: achievementType,
        totalUnlocked: achievement.stats.userCount,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
      };
    } catch (error) {
      logger.error(`Failed to get achievement stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get leaderboard summary
   */
  static async getLeaderboardSummary(userId, companyId = null) {
    try {
      const allTimeRank = await this.getUserRank(userId, 'ALL_TIME', null, companyId);
      const monthlyRank = await this.getUserRank(userId, 'MONTHLY', null, companyId);
      const achievements = await this.getUserAchievements(userId);

      return {
        allTimeRank,
        monthlyRank,
        achievements: {
          total: achievements.length,
          recent: achievements.slice(0, 5),
        },
      };
    } catch (error) {
      logger.error(`Failed to get leaderboard summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top performers
   */
  static async getTopPerformers(limit = 10, companyId = null) {
    try {
      const query = { period: 'ALL_TIME' };
      if (companyId) {
        query.companyId = companyId;
      }

      const topPerformers = await Leaderboard.find(query)
        .sort({ score: -1 })
        .limit(limit)
        .populate('userId', 'username fullName avatar role')
        .lean();

      return topPerformers;
    } catch (error) {
      logger.error(`Failed to get top performers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check and unlock achievements for user
   */
  static async checkAndUnlockAchievements(userId) {
    try {
      const user = await User.findById(userId);
      const submissions = await CodeSubmission.find({ userId });
      const reviews = await Review.find({ reviewerId: userId });
      const skills = await Skill.find({ userId, level: { $gt: 0 } });

      const approvedSubmissions = submissions.filter((s) => s.status === 'APPROVED').length;
      const skillAtMax = skills.filter((s) => s.level === 5).length;

      const checks = [
        {
          condition: submissions.length >= 1,
          type: 'FIRST_SUBMISSION',
        },
        {
          condition: submissions.length >= 5,
          type: 'FIVE_SUBMISSIONS',
        },
        {
          condition: approvedSubmissions >= 50,
          type: 'FIFTY_APPROVALS',
        },
        {
          condition: reviews.length >= 10,
          type: 'CODE_REVIEWER',
        },
        {
          condition: reviews.length >= 50,
          type: 'CODE_MASTER',
        },
        {
          condition: skills.length >= 3 && skillAtMax > 0,
          type: 'SKILL_SPECIALIST',
        },
        {
          condition: skillAtMax >= 1,
          type: 'SKILL_LEVEL_5',
        },
        {
          condition: user.role === 'SENIOR',
          type: 'MILESTONE_SENIOR',
        },
        {
          condition: user.role === 'MANAGER',
          type: 'MILESTONE_MANAGER',
        },
      ];

      for (const check of checks) {
        if (check.condition) {
          await this.unlockAchievement(userId, check.type);
        }
      }
    } catch (error) {
      logger.error(`Failed to check achievements: ${error.message}`);
    }
  }
}

export default LeaderboardService;
