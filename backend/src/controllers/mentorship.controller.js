import * as MentorshipService from '../services/mentorship.service.js';

export const postFeedback = async (req, res) => {
  try {
    const payload = req.body || {};
    const mentorId = req.user?.id || req.user?._id || req.user?.sub || payload.mentorId;
    const menteeId = payload.menteeId;
    if (!mentorId || !menteeId) return res.status(400).json({ error: 'mentorId and menteeId required' });

    const doc = await MentorshipService.createFeedback({ submissionId: payload.submissionId, mentorId, menteeId, criteria: payload.criteria || {}, comments: payload.comments || '' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('postFeedback error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getMenteeFeedback = async (req, res) => {
  try {
    const menteeId = req.params.menteeId;
    if (!menteeId) return res.status(400).json({ error: 'menteeId required' });
    const rows = await MentorshipService.getFeedbackForMentee(menteeId);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getMenteeFeedback error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getSubmissionFeedback = async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    if (!submissionId) return res.status(400).json({ error: 'submissionId required' });
    const rows = await MentorshipService.getFeedbackForSubmission(submissionId);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getSubmissionFeedback error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getMenteeSummary = async (req, res) => {
  try {
    const menteeId = req.params.menteeId;
    if (!menteeId) return res.status(400).json({ error: 'menteeId required' });
    const summary = await MentorshipService.getSummaryForUser(menteeId);
    return res.json({ success: true, data: summary });
  } catch (err) {
    console.error('getMenteeSummary error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
