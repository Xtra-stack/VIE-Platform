import express from 'express';
import * as AnalyticsController from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// record a metric
router.post('/metric', AnalyticsController.postMetric);

// User personal dashboard
router.get('/dashboard', AnalyticsController.getUserDashboard);

// Team and company analytics
router.get('/team', requireRole(['SENIOR', 'MANAGER']), AnalyticsController.getTeamAnalytics);
router.get('/company', requireRole(['MANAGER']), AnalyticsController.getCompanyAnalytics);

// Skill trends and quality metrics
router.get('/skills', AnalyticsController.getSkillTrends);
router.get('/quality/:taskId', AnalyticsController.getQualityMetrics);

// Learning path and comparisons
router.get('/learning-path', AnalyticsController.getLearningPath);
router.get('/comparison', AnalyticsController.getComparisonAnalytics);

// Summary and export
router.get('/summary', AnalyticsController.getAnalyticsSummary);
router.get('/export', AnalyticsController.exportAnalytics);

export default router;
