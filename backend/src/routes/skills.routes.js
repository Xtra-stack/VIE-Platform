import { Router } from 'express';
import SkillController from '../controllers/skill.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/skills
 * Get all skills for current user
 */
router.get('/', SkillController.getUserSkills);

/**
 * GET /api/skills/:skillId
 * Get detailed skill info
 */
router.get('/:skillId', SkillController.getSkillDetails);

/**
 * POST /api/skills/initialize
 * Initialize skills for a user (internal use during registration)
 */
router.post('/initialize', SkillController.initializeSkills);

/**
 * POST /api/skills/award-xp
 * Award XP to a skill (called after task approval)
 * Body: { skillName: string, taskData: {...} }
 */
router.post('/award-xp', SkillController.awardSkillXP);

/**
 * GET /api/skills/team/performance
 * Get team performance ranking (MANAGER only)
 */
router.get('/team/performance', requireRole('MANAGER'), SkillController.getTeamPerformance);

/**
 * GET /api/skills/org/heatmap
 * Get organization skill heatmap (ADMIN only)
 */
router.get(
  '/org/heatmap',
  requireRole('ADMIN'),
  SkillController.getOrganizationHeatmap
);

/**
 * GET /api/skills/junior/:juniorId/trend
 * Get junior improvement trend (SENIOR only)
 */
router.get(
  '/junior/:juniorId/trend',
  requireRole('SENIOR'),
  SkillController.getJuniorImprovementTrend
);

/**
 * GET /api/skills/dev-path
 * Get skill development path recommendation
 */
router.get('/dev-path/recommendation', SkillController.getSkillDevPath);

export default router;
