import express from 'express';
import CodeSubmissionController from '../controllers/codeSubmission.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/code-editor/save
 * Save code draft (any authenticated user)
 */
router.post('/save', CodeSubmissionController.saveDraft);

/**
 * POST /api/code-editor/submit
 * Submit code for review (any authenticated user)
 */
router.post('/submit', CodeSubmissionController.submitCode);

/**
 * GET /api/code-editor/draft/:taskId
 * Get user's draft for a task
 */
router.get('/draft/:taskId', CodeSubmissionController.getDraft);

/**
 * POST /api/code-editor/analyze
 * Analyze code (any authenticated user)
 */
router.post('/analyze', CodeSubmissionController.analyzeCode);

/**
 * GET /api/code-editor/analytics/user
 * Get user's submission analytics
 */
router.get('/analytics/user', CodeSubmissionController.getUserAnalytics);

export default router;
