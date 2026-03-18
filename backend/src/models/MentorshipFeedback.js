import mongoose from 'mongoose';

const MentorshipFeedbackSchema = new mongoose.Schema({
  submissionId: { type: String, required: false },
  mentorId: { type: String, required: true },
  menteeId: { type: String, required: true },
  criteria: { type: Object, default: {} }, // e.g. { readability: 4, tests: 3, architecture: 5 }
  score: { type: Number, default: 0 },
  comments: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('MentorshipFeedback', MentorshipFeedbackSchema);
