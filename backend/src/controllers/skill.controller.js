import SkillService from '../services/skill.service.js';
import Skill from '../models/Skill.js';
import { logger } from '../config/logger.js';

class SkillController {
  /**
   * Initialize skills for a new user (called during user registration)
   */
  static async initializeSkills(req, res) {
    try {
      const userId = req.user?.id || req.params.userId;

      const skills = await SkillService.initializeUserSkills(userId);
      res.status(201).json({
        success: true,
        message: 'User skills initialized',
        data: { skills }
      });
    } catch (error) {
      logger.error('Error initializing skills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize skills',
        error: error.message
      });
    }
  }

  /**
   * Get all skills for current user
   */
  static async getUserSkills(req, res) {
    try {
      const userId = req.user?.id;

      const skills = await SkillService.getUserSkills(userId);
      res.status(200).json({
        success: true,
        data: { skills }
      });
    } catch (error) {
      logger.error('Error fetching user skills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch skills',
        error: error.message
      });
    }
  }

  /**
   * Award XP to a skill (called after task approval)
   */
  static async awardSkillXP(req, res) {
    try {
      const { skillName, taskData } = req.body;
      const userId = req.user?.id;

      if (!skillName || !taskData) {
        return res.status(400).json({
          success: false,
          message: 'skillName and taskData are required'
        });
      }

      const result = await SkillService.awardSkillXP(userId, skillName, taskData);

      res.status(200).json({
        success: true,
        message: 'XP awarded',
        data: result
      });
    } catch (error) {
      logger.error('Error awarding skill XP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to award XP',
        error: error.message
      });
    }
  }

  /**
   * Get organization skill heatmap (ADMIN only)
   */
  static async getOrganizationHeatmap(req, res) {
    try {
      const workspaceId = req.user?.workspaceId;

      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only ADMIN can view organization heatmap'
        });
      }

      const heatmap = await SkillService.getOrganizationSkillHeatmap(workspaceId);

      res.status(200).json({
        success: true,
        data: { heatmap }
      });
    } catch (error) {
      logger.error('Error fetching organization heatmap:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch heatmap',
        error: error.message
      });
    }
  }

  /**
   * Get junior improvement trend (SENIOR only)
   */
  static async getJuniorImprovementTrend(req, res) {
    try {
      const { juniorId } = req.params;
      const { months = 3 } = req.query;

      // Verify senior is assigned to mentor this junior (can be a check in full implementation)

      const trend = await SkillService.getJuniorImprovementTrend(
        juniorId,
        parseInt(months)
      );

      res.status(200).json({
        success: true,
        data: { trend }
      });
    } catch (error) {
      logger.error('Error fetching improvement trend:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trend',
        error: error.message
      });
    }
  }

  /**
   * Get team performance ranking (MANAGER only)
   */
  static async getTeamPerformance(req, res) {
    try {
      const workspaceId = req.user?.workspaceId;

      if (req.user?.role !== 'MANAGER') {
        return res.status(403).json({
          success: false,
          message: 'Only MANAGER can view team performance'
        });
      }

      const ranking = await SkillService.getTeamPerformanceRanking(workspaceId);

      res.status(200).json({
        success: true,
        data: { ranking }
      });
    } catch (error) {
      logger.error('Error fetching team performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance data',
        error: error.message
      });
    }
  }

  /**
   * Get skill development path for junior
   */
  static async getSkillDevPath(req, res) {
    try {
      const userId = req.user?.id;

      const devPath = await SkillService.getSkillDevPath(userId);

      res.status(200).json({
        success: true,
        data: devPath
      });
    } catch (error) {
      logger.error('Error fetching skill dev path:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch development path',
        error: error.message
      });
    }
  }

  /**
   * Get single skill details
   */
  static async getSkillDetails(req, res) {
    try {
      const { skillId } = req.params;
      const userId = req.user?.id;

      const skill = await Skill.findById(skillId);

      if (!skill) {
        return res.status(404).json({
          success: false,
          message: 'Skill not found'
        });
      }

      // Ensure user owns this skill or is admin
      if (skill.userId.toString() !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: skill._id,
          name: skill.skillName,
          level: skill.level,
          xp: skill.xp,
          nextLevelXp: skill.nextLevelXp,
          progress: skill.getProgressPercent(),
          metrics: {
            taskCount: skill.taskCount,
            approvalRate: skill.approvalRate,
            avgReworkCount: skill.avgReworkCount,
            completionEfficiency: skill.completionEfficiency
          },
          growthHistory: skill.growthHistory.slice(-10), // Last 10 entries
          lastUpdated: skill.lastUpdated
        }
      });
    } catch (error) {
      logger.error('Error fetching skill details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch skill details',
        error: error.message
      });
    }
  }
}

export default SkillController;
