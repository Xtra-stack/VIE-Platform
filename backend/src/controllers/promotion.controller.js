import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';
import { PromotionHistory } from '../models/PromotionHistory.js';

const router = express.Router();

// Get promotion history for a user (admin or the user themselves)
router.get('/user/:userId', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && ![ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const history = await PromotionHistory.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ history });
  } catch (err) {
    next(err);
  }
});

export default router;
