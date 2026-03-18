import express from 'express';
import ProgressionService from '../services/progression.service.js';
import { requireAuth } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Admin/manual trigger to evaluate a user's progression
router.post('/evaluate/:userId', requireAuth, async (req, res, next) => {
  try {
    // Only ADMIN or OWNER may trigger evaluations
    const callerRole = req.user?.role;
    if (![ROLES.ADMIN, ROLES.OWNER].includes(callerRole)) {
      return res.status(403).json({ error: 'Forbidden: admin only' });
    }

    const { userId } = req.params;
    const result = await ProgressionService.evaluatePromotion(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Simple health/check endpoint (no auth)
router.get('/ping', (req, res) => res.json({ ok: true }));

export default router;
