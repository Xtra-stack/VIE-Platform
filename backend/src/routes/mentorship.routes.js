import express from 'express';
import * as MentorshipController from '../controllers/mentorship.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/feedback', requireAuth, MentorshipController.postFeedback);
router.get('/mentee/:menteeId', requireAuth, MentorshipController.getMenteeFeedback);
router.get('/submission/:submissionId', requireAuth, MentorshipController.getSubmissionFeedback);
router.get('/mentee/:menteeId/summary', requireAuth, MentorshipController.getMenteeSummary);

export default router;
