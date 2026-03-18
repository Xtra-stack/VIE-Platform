import express from 'express';
import CodingController from '../controllers/coding.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All coding endpoints require authentication
router.use(requireAuth);

/**
 * Terminal execution
 */
router.post('/terminal/execute', CodingController.executeTerminalCommand);
router.get('/terminal/history', CodingController.getTerminalHistory);

/**
 * Code submission
 */
router.post('/submit', CodingController.submitCode);

/**
 * Skill tracking
 */
router.get('/skills', CodingController.getUserSkills);
router.post('/skills/update', CodingController.updateSkillsFromApproval);

export default router;
