import express from 'express';
import CodeReviewController from '../controllers/codeReview.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/code-review/create
 * Create a code review (SENIOR/MANAGER only)
 */
router.post('/create', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.createReview);

/**
 * POST /api/code-review/approve
 * Approve a submission (SENIOR/MANAGER only)
 */
router.post('/approve', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.approveSubmission);

/**
 * POST /api/code-review/request-changes
 * Request changes on submission (SENIOR/MANAGER only)
 */
router.post('/request-changes', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.requestChanges);

/**
 * POST /api/code-review/reject
 * Reject a submission (SENIOR/MANAGER only)
 */
router.post('/reject', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.rejectSubmission);

/**
 * GET /api/code-review/submission/:submissionId
 * Get review for a submission
 */
router.get('/submission/:submissionId', CodeReviewController.getSubmissionReview);

/**
 * GET /api/code-review/pending
 * Get pending reviews for reviewer (SENIOR/MANAGER only)
 */
router.get('/pending', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.getPendingReviews);

/**
 * GET /api/code-review/user/:userId
 * Get review history for a user
 */
router.get('/user/:userId', CodeReviewController.getUserReviewHistory);

/**
 * GET /api/code-review/reviewer/assignments
 * Get reviewer's assignments (SENIOR/MANAGER only)
 */
router.get('/reviewer/assignments', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.getReviewerAssignments);

/**
 * GET /api/code-review/reviewer/analytics
 * Get reviewer analytics (SENIOR/MANAGER only)
 */
router.get('/reviewer/analytics', requireRole(['SENIOR', 'MANAGER']), CodeReviewController.getReviewerAnalytics);

/**
 * GET /api/code-review/team/stats/:taskId
 * Get team review statistics (MANAGER only)
 */
router.get('/team/stats/:taskId', requireRole(['MANAGER']), CodeReviewController.getTeamReviewStats);

export default router;
