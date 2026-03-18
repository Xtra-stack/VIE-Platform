import CodingService from '../services/coding.service.js';
import { logger } from '../config/logger.js';

class CodingController {
  /**
   * POST /api/coding/terminal/execute
   * Execute a simulated terminal command
   */
  static async executeTerminalCommand(req, res) {
    try {
      const { command, sessionId } = req.body;
      const userId = req.user._id;
      const workspaceId = req.user.workspaceId;

      if (!command || command.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Command is required',
        });
      }

      const result = await CodingService.executeSimulatedCommand(
        userId,
        workspaceId,
        command,
        sessionId || 'default'
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('[CodingController] Error executing command', {
        error: error.message,
        userId: req.user._id,
      });
      res.status(500).json({
        success: false,
        error: 'Failed to execute command',
      });
    }
  }

  /**
   * POST /api/coding/submit
   * Save code submission with skill tracking
   */
  static async submitCode(req, res) {
    try {
      const { projectId, code, language = 'javascript', fileName = 'index.js' } = req.body;
      const userId = req.user._id;

      if (!projectId || !code) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and code are required',
        });
      }

      const result = await CodingService.submitCode(userId, projectId, code, language, fileName);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('[CodingController] Error submitting code', {
        error: error.message,
        userId: req.user._id,
      });
      res.status(500).json({
        success: false,
        error: 'Failed to submit code',
      });
    }
  }

  /**
   * GET /api/coding/skills
   * Get user's skill progress
   */
  static async getUserSkills(req, res) {
    try {
      const userId = req.user._id;

      const result = await CodingService.getUserSkills(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('[CodingController] Error fetching skills', {
        error: error.message,
        userId: req.user._id,
      });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch skills',
      });
    }
  }

  /**
   * POST /api/coding/skills/update
   * Award XP from approval (called by review controller)
   */
  static async updateSkillsFromApproval(req, res) {
    try {
      const { submissionId, approvalRate = 100 } = req.body;

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          error: 'Submission ID is required',
        });
      }

      const result = await CodingService.updateSkillsFromApproval(submissionId, approvalRate);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('[CodingController] Error updating skills', {
        error: error.message,
      });
      res.status(500).json({
        success: false,
        error: 'Failed to update skills',
      });
    }
  }

  /**
   * GET /api/coding/terminal/history
   * Get user's terminal command history
   */
  static async getTerminalHistory(req, res) {
    try {
      const userId = req.user._id;
      const workspaceId = req.user.workspaceId;
      const limit = parseInt(req.query.limit || 50);

      const result = await CodingService.getTerminalHistory(userId, workspaceId, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('[CodingController] Error fetching terminal history', {
        error: error.message,
        userId: req.user._id,
      });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch terminal history',
      });
    }
  }
}

export default CodingController;
