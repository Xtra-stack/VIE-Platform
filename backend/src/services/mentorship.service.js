import MentorshipFeedback from '../models/MentorshipFeedback.js';

export const createFeedback = async ({ submissionId = null, mentorId, menteeId, criteria = {}, comments = '' }) => {
  const score = Object.values(criteria).reduce((s, v) => s + (Number(v) || 0), 0);
  const avg = Object.keys(criteria).length ? (score / Object.keys(criteria).length) : 0;
  const doc = new MentorshipFeedback({ submissionId, mentorId, menteeId, criteria, score: avg, comments });
  await doc.save();
  return doc;
};

export const getFeedbackForMentee = async (menteeId, limit = 50) => {
  return MentorshipFeedback.find({ menteeId }).sort({ createdAt: -1 }).limit(limit).lean().exec();
};

export const getFeedbackForSubmission = async (submissionId) => {
  return MentorshipFeedback.find({ submissionId }).sort({ createdAt: -1 }).lean().exec();
};

export const getSummaryForUser = async (userId) => {
  const rows = await MentorshipFeedback.aggregate([
    { $match: { menteeId: userId } },
    { $group: { _id: null, avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
  ]).exec();
  return rows[0] || { avgScore: 0, count: 0 };
};
