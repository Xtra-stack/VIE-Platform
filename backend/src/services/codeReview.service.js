import { CodeSubmission } from '../models/CodeSubmission.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Task } from '../models/Task.js';
import { logger } from '../config/logger.js';
import CodeSubmissionService from './codeSubmission.service.js';
import ProgressionService from './progression.service.js';

export class CodeReviewService {
  /**
   * Create a code review with feedback
   */
  static async createReview(submissionId, reviewerId, feedback, status, scores = {}) {
    try {
      const submission = await CodeSubmission.findById(submissionId);
      if (!submission) throw new Error('Submission not found');

      const reviewer = await User.findById(reviewerId);
      if (!reviewer) throw new Error('Reviewer not found');

      // Only SENIOR/MANAGER can review
      if (!['SENIOR', 'MANAGER'].includes(reviewer.role)) {
        throw new Error('Only SENIOR/MANAGER can create reviews');
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ submissionId });
      if (existingReview) {
        throw new Error('Review already exists for this submission');
      }

      // Create review
      const review = new Review({
        submissionId,
        reviewerId,
        feedback,
        status, // 'APPROVED', 'REQUESTED_CHANGES', 'REJECTED'
        scores: {
          codeQuality: scores.codeQuality || 0,
          readability: scores.readability || 0,
          functionality: scores.functionality || 0,
          efficiency: scores.efficiency || 0,
          documentation: scores.documentation || 0
        },
        reviewedAt: new Date()
      });

      await review.save();

      // Update submission status
      submission.status = status;
      if (status === 'APPROVED') {
        submission.resolvedAt = new Date();
        submission.approvedBy = reviewerId;
      }
      await submission.save();

      // Award skill XP if approved
      if (status === 'APPROVED') {
        const submitter = await User.findById(submission.submittedBy);
        if (submitter && submission.taskId) {
          await CodeSubmissionService.awardSkillXP(
            submitter._id,
            submission.taskId,
            { approvalRate: 1.0 }
          );

          // Evaluate promotion after awarding XP
          try {
            await ProgressionService.evaluatePromotion(submitter._id);
          } catch (err) {
            logger.warn(`Promotion evaluation failed for ${submitter._id}: ${err.message}`);
          }
        }
      }

      logger.info(`Review created for submission ${submissionId}`);
      return review;
    } catch (error) {
      logger.error(`Error creating review: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get reviews by submission
   */
  static async getSubmissionReview(submissionId) {
    try {
      const review = await Review.findOne({ submissionId })
        .populate('reviewerId', 'username email role')
        .populate('submissionId');

      return review;
    } catch (error) {
      logger.error(`Error fetching review: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get pending reviews for a reviewer
   */
  static async getPendingReviews(reviewerId, limit = 10) {
    try {
      const reviews = await CodeSubmission.find({
        status: 'SUBMITTED'
      })
        .populate('submittedBy', 'username email')
        .sort({ submittedAt: -1 })
        .limit(limit);

      return reviews;
    } catch (error) {
      logger.error(`Error fetching pending reviews: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get review history for a user's code
   */
  static async getUserReviewHistory(userId) {
    try {
      const submissions = await CodeSubmission.find({
        submittedBy: userId,
        status: { $in: ['APPROVED', 'REJECTED', 'REQUESTED_CHANGES'] }
      }).sort({ resolvedAt: -1 });

      const reviewsWithFeedback = await Promise.all(
        submissions.map(async (sub) => {
          const review = await Review.findOne({ submissionId: sub._id })
            .populate('reviewerId', 'username email role');
          return { submission: sub, review };
        })
      );

      return reviewsWithFeedback;
    } catch (error) {
      logger.error(`Error fetching review history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get reviews assigned to a reviewer
   */
  static async getReviewerAssignments(reviewerId) {
    try {
      const reviews = await Review.find({ reviewerId })
        .populate('submissionId')
        .populate('reviewerId', 'username email')
        .sort({ reviewedAt: -1 });

      return reviews;
    } catch (error) {
      logger.error(`Error fetching reviewer assignments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get analytics for reviewer performance
   */
  static async getReviewerAnalytics(reviewerId) {
    try {
      const reviews = await Review.find({ reviewerId });

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          avgTimeToReview: 0,
          approvalRate: 0,
          avgQualityScore: 0,
          reviewerStats: {}
        };
      }

      const approved = reviews.filter((r) => r.status === 'APPROVED').length;
      const totalScores = reviews.reduce(
        (sum, r) => sum + (r.scores?.codeQuality || 0),
        0
      );

      return {
        totalReviews: reviews.length,
        approvalRate: Math.round((approved / reviews.length) * 100),
        avgQualityScore: Math.round(totalScores / reviews.length),
        statusBreakdown: {
          approved: reviews.filter((r) => r.status === 'APPROVED').length,
          requestedChanges: reviews.filter(
            (r) => r.status === 'REQUESTED_CHANGES'
          ).length,
          rejected: reviews.filter((r) => r.status === 'REJECTED').length
        },
        scoreBreakdown: {
          avgCodeQuality:
            Math.round(
              (reviews.reduce((sum, r) => sum + (r.scores?.codeQuality || 0), 0) /
                reviews.length) *
                10
            ) / 10,
          avgReadability:
            Math.round(
              (reviews.reduce((sum, r) => sum + (r.scores?.readability || 0), 0) /
                reviews.length) *
                10
            ) / 10,
          avgFunctionality:
            Math.round(
              (reviews.reduce(
                (sum, r) => sum + (r.scores?.functionality || 0),
                0
              ) /
                reviews.length) *
                10
            ) / 10
        }
      };
    } catch (error) {
      logger.error(`Error fetching reviewer analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a review
   */
  static async updateReview(reviewId, updates) {
    try {
      const review = await Review.findByIdAndUpdate(reviewId, updates, {
        new: true,
        runValidators: true
      });

      if (!review) throw new Error('Review not found');

      logger.info(`Review ${reviewId} updated`);
      return review;
    } catch (error) {
      logger.error(`Error updating review: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get team review statistics
   */
  static async getTeamReviewStats(taskId) {
    try {
      const submissions = await CodeSubmission.find({ taskId });
      const reviews = await Review.find({
        submissionId: { $in: submissions.map((s) => s._id) }
      });

      const stats = {
        totalSubmissions: submissions.length,
        totalReviewed: reviews.length,
        reviewPercentage: Math.round((reviews.length / submissions.length) * 100),
        statusCounts: {
          approved: reviews.filter((r) => r.status === 'APPROVED').length,
          requestedChanges: reviews.filter(
            (r) => r.status === 'REQUESTED_CHANGES'
          ).length,
          rejected: reviews.filter((r) => r.status === 'REJECTED').length
        },
        avgScores: {
          quality:
            Math.round(
              (reviews.reduce(
                (sum, r) => sum + (r.scores?.codeQuality || 0),
                0
              ) /
                Math.max(reviews.length, 1)) *
                10
            ) / 10,
          readability:
            Math.round(
              (reviews.reduce((sum, r) => sum + (r.scores?.readability || 0), 0) /
                Math.max(reviews.length, 1)) *
                10
            ) / 10
        }
      };

      return stats;
    } catch (error) {
      logger.error(`Error fetching team review stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request changes on a submission
   */
  static async requestChanges(submissionId, reviewerId, feedback, specificIssues = []) {
    try {
      const submission = await CodeSubmission.findById(submissionId);
      if (!submission) throw new Error('Submission not found');

      const review = new Review({
        submissionId,
        reviewerId,
        feedback,
        status: 'REQUESTED_CHANGES',
        issues: specificIssues,
        reviewedAt: new Date()
      });

      await review.save();

      submission.status = 'REQUESTED_CHANGES';
      await submission.save();

      logger.info(`Changes requested for submission ${submissionId}`);
      return review;
    } catch (error) {
      logger.error(`Error requesting changes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reject a submission
   */
  static async rejectSubmission(submissionId, reviewerId, feedback, reason = '') {
    try {
      const submission = await CodeSubmission.findById(submissionId);
      if (!submission) throw new Error('Submission not found');

      const review = new Review({
        submissionId,
        reviewerId,
        feedback,
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date()
      });

      await review.save();

      submission.status = 'REJECTED';
      submission.rejectedBy = reviewerId;
      submission.rejectionReason = reason;
      await submission.save();

      logger.info(`Submission ${submissionId} rejected`);
      return review;
    } catch (error) {
      logger.error(`Error rejecting submission: ${error.message}`);
      throw error;
    }
  }
}

export default CodeReviewService;
