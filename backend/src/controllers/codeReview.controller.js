import CodeReviewService from '../services/codeReview.service.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import { Review } from '../models/Review.js';
import { logger } from '../config/logger.js';

export class CodeReviewController {
  /**
   * Create a code review
   * POST /api/reviews/create
   */
  static async createReview(req, res) {
    try {
      const { submissionId, feedback, status, scores } = req.body;
      const { userId } = req.user;

      if (!submissionId || !feedback || !status) {
        return res
          .status(400)
          .json({ error: 'submissionId, feedback, and status are required' });
      }

      const validStatuses = ['APPROVED', 'REQUESTED_CHANGES', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const review = await CodeReviewService.createReview(
        submissionId,
        userId,
        feedback,
        status,
        scores
      );

      res.status(201).json({
        success: true,
        review,
        message: `Code review created with status: ${status}`
      });
    } catch (error) {
      logger.error(`Create review error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get review for a submission
   * GET /api/reviews/submission/:submissionId
   */
  static async getSubmissionReview(req, res) {
    try {
      const { submissionId } = req.params;

      const review = await CodeReviewService.getSubmissionReview(submissionId);

      res.json({
        success: true,
        review,
        found: !!review
      });
    } catch (error) {
      logger.error(`Get review error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get pending reviews for reviewer
   * GET /api/reviews/pending
   */
  static async getPendingReviews(req, res) {
    try {
      const { limit = 10 } = req.query;

      const submissions = await CodeReviewService.getPendingReviews(
        req.user.userId,
        parseInt(limit)
      );

      res.json({
        success: true,
        submissions,
        count: submissions.length
      });
    } catch (error) {
      logger.error(`Get pending reviews error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get review history for a user
   * GET /api/reviews/user/:userId
   */
  static async getUserReviewHistory(req, res) {
    try {
      const { userId } = req.params;

      const history = await CodeReviewService.getUserReviewHistory(userId);

      res.json({
        success: true,
        history,
        count: history.length
      });
    } catch (error) {
      logger.error(`Get review history error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get reviewer's assignments
   * GET /api/reviews/reviewer/assignments
   */
  static async getReviewerAssignments(req, res) {
    try {
      const { userId } = req.user;

      const assignments = await CodeReviewService.getReviewerAssignments(userId);

      res.json({
        success: true,
        assignments,
        count: assignments.length
      });
    } catch (error) {
      logger.error(`Get assignments error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get reviewer analytics
   * GET /api/reviews/reviewer/analytics
   */
  static async getReviewerAnalytics(req, res) {
    try {
      const { userId } = req.user;

      const analytics = await CodeReviewService.getReviewerAnalytics(userId);

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      logger.error(`Get reviewer analytics error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Request changes on submission
   * POST /api/reviews/request-changes
   */
  static async requestChanges(req, res) {
    try {
      const { submissionId, feedback, specificIssues } = req.body;
      const { userId } = req.user;

      if (!submissionId || !feedback) {
        return res.status(400).json({ error: 'submissionId and feedback are required' });
      }

      const review = await CodeReviewService.requestChanges(
        submissionId,
        userId,
        feedback,
        specificIssues || []
      );

      res.status(201).json({
        success: true,
        review,
        message: 'Changes requested for submission'
      });
    } catch (error) {
      logger.error(`Request changes error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Reject submission
   * POST /api/reviews/reject
   */
  static async rejectSubmission(req, res) {
    try {
      const { submissionId, feedback, reason } = req.body;
      const { userId } = req.user;

      if (!submissionId || !feedback) {
        return res.status(400).json({ error: 'submissionId and feedback are required' });
      }

      const review = await CodeReviewService.rejectSubmission(
        submissionId,
        userId,
        feedback,
        reason || ''
      );

      res.status(201).json({
        success: true,
        review,
        message: 'Submission rejected'
      });
    } catch (error) {
      logger.error(`Reject submission error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get team review statistics
   * GET /api/reviews/team/stats/:taskId
   */
  static async getTeamReviewStats(req, res) {
    try {
      const { taskId } = req.params;

      const stats = await CodeReviewService.getTeamReviewStats(taskId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      logger.error(`Get team stats error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Approve submission
   * POST /api/reviews/approve
   */
  static async approveSubmission(req, res) {
    try {
      const { submissionId, feedback, scores } = req.body;
      const { userId } = req.user;

      if (!submissionId) {
        return res.status(400).json({ error: 'submissionId is required' });
      }

      const review = await CodeReviewService.createReview(
        submissionId,
        userId,
        feedback || 'Approved',
        'APPROVED',
        scores
      );

      res.status(201).json({
        success: true,
        review,
        message: 'Submission approved'
      });
    } catch (error) {
      logger.error(`Approve submission error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}

export default CodeReviewController;
