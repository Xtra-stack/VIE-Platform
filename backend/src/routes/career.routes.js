import express from 'express';
import * as CareerController from '../controllers/career.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/unlockables', requireAuth, CareerController.listUnlockables);
router.get('/profile/:userId?', requireAuth, CareerController.getProfile);
router.post('/unlock', requireAuth, CareerController.unlock);
router.post('/unlockable', requireAuth, CareerController.createUnlockable);

export default router;
