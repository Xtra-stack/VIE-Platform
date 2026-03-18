import express from 'express';
import LeaderboardController from '../controllers/leaderboard.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

/**
 * Leaderboard Routes
 * All routes require authentication
 */

// Get all-time leaderboard
router.get('/all-time', requireAuth, LeaderboardController.getAllTimeLeaderboard);

// Get monthly leaderboard
router.get('/monthly', requireAuth, LeaderboardController.getMonthlyLeaderboard);

// Get quarterly leaderboard
router.get('/quarterly', requireAuth, LeaderboardController.getQuarterlyLeaderboard);

// Get yearly leaderboard
router.get('/yearly', requireAuth, LeaderboardController.getYearlyLeaderboard);

// Get top performers
router.get('/top', requireAuth, LeaderboardController.getTopPerformers);

// Get current user's rank
router.get('/my-rank', requireAuth, LeaderboardController.getMyRank);

// Get specific user's rank
router.get('/user/:userId/rank', requireAuth, LeaderboardController.getUserRank);

// Get leaderboard summary (all ranks, achievements)
router.get('/summary', requireAuth, LeaderboardController.getLeaderboardSummary);

// Get current user's achievements
router.get('/achievements', requireAuth, LeaderboardController.getUserAchievements);

// Get achievement statistics
router.get('/achievements/stats/:type', requireAuth, LeaderboardController.getAchievementStats);

// Get specific user's achievements
router.get('/user/:userId/achievements', requireAuth, LeaderboardController.getUserAchievementsById);

// Check and unlock achievements for current user
router.post('/check-achievements', requireAuth, LeaderboardController.checkAndUnlockAchievements);

// Admin: Recalculate rankings
router.post(
	'/recalculate',
	requireAuth,
	requireRole([ROLES.ADMIN, ROLES.MANAGER]),
	LeaderboardController.recalculateRankings
);

export default router;
