import CodeSubmissionService from '../services/codeSubmission.service.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import { logger } from '../config/logger.js';

export class CodeSubmissionController {
  /**
   * Save code draft
   * POST /api/submissions/save
   */
  static async saveDraft(req, res) {
    try {
      const { userId } = req.user;
      const { taskId, code, language, filename } = req.body;

      if (!taskId || !code) {
        return res.status(400).json({ error: 'taskId and code are required' });
      }

      const submission = await CodeSubmissionService.saveDraft(
        userId,
        taskId,
        code,
        language || 'javascript',
        filename || 'code.js'
      );

      res.json({
        success: true,
        submission,
        message: 'Draft saved successfully'
      });
    } catch (error) {
      logger.error(`Save draft error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Submit code for review
   * POST /api/submissions/submit
   */
  static async submitCode(req, res) {
    try {
      const { userId } = req.user;
      const { taskId, code, language, filename } = req.body;

      if (!taskId || !code) {
        return res.status(400).json({ error: 'taskId and code are required' });
      }

      const submission = await CodeSubmissionService.submitCode(
        userId,
        taskId,
        code,
        language || 'javascript',
        filename || 'code.js'
      );

      res.status(201).json({
        success: true,
        submission,
        message: 'Code submitted successfully'
      });
    } catch (error) {
      logger.error(`Submit code error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get draft for a task
   * GET /api/submissions/draft/:taskId
   */
  static async getDraft(req, res) {
    try {
      const { userId } = req.user;
      const { taskId } = req.params;

      const draft = await CodeSubmissionService.getDraft(userId, taskId);

      res.json({
        success: true,
        draft,
        found: !!draft
      });
    } catch (error) {
      logger.error(`Get draft error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all submissions for a task
   * GET /api/submissions/user/:taskId
   */
  static async getUserSubmissions(req, res) {
    try {
      const { userId } = req.user;
      const { taskId } = req.params;

      const submissions = await CodeSubmissionService.getSubmissions(userId, taskId);

      res.json({
        success: true,
        submissions,
        count: submissions.length
      });
    } catch (error) {
      logger.error(`Get submissions error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all submissions for a task (manager/senior view)
   * GET /api/submissions/task/:taskId
   */
  static async getTaskSubmissions(req, res) {
    try {
      const { role } = req.user;

      // Only MANAGER and SENIOR can view all submissions
      if (!['MANAGER', 'SENIOR'].includes(role)) {
        return res
          .status(403)
          .json({ error: 'Insufficient permissions to view submissions' });
      }

      const { taskId } = req.params;
      const submissions = await CodeSubmissionService.getTaskSubmissions(taskId);

      res.json({
        success: true,
        submissions,
        count: submissions.length
      });
    } catch (error) {
      logger.error(`Get task submissions error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Analyze code
   * POST /api/submissions/analyze
   */
  static async analyzeCode(req, res) {
    try {
      const { code, language } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'code is required' });
      }

      const analysis = await CodeSubmissionService.analyzeCode(
        code,
        language || 'javascript'
      );

      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      logger.error(`Analyze code error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user submission analytics
   * GET /api/submissions/analytics/user
   */
  static async getUserAnalytics(req, res) {
    try {
      const { userId } = req.user;

      const analytics = await CodeSubmissionService.getUserSubmissionAnalytics(userId);

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      logger.error(`Get analytics error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get submission by ID
   * GET /api/submissions/:submissionId
   */
  static async getSubmissionById(req, res) {
    try {
      const { submissionId } = req.params;
      const { userId } = req.user;

      const submission = await CodeSubmission.findById(submissionId).populate(
        'userId',
        'username email'
      );

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      // User can only view their own submissions (unless they're a manager/senior)
      if (submission.userId._id.toString() !== userId && !['MANAGER', 'SENIOR'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        submission
      });
    } catch (error) {
      logger.error(`Get submission error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete a submission
   * DELETE /api/submissions/:submissionId
   */
  static async deleteSubmission(req, res) {
    try {
      const { submissionId } = req.params;
      const { userId, role } = req.user;

      const submission = await CodeSubmission.findById(submissionId);

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      // Only owner or MANAGER/SENIOR can delete
      if (submission.userId.toString() !== userId && !['MANAGER', 'SENIOR'].includes(role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await CodeSubmission.findByIdAndDelete(submissionId);

      res.json({
        success: true,
        message: 'Submission deleted successfully'
      });
    } catch (error) {
      logger.error(`Delete submission error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}

export default CodeSubmissionController;
