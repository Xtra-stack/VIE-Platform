import mongoose from 'mongoose';

/**
 * Notification Model
 * Stores in-app and email notifications for users
 */

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'SUBMISSION_APPROVED',
        'SUBMISSION_REJECTED',
        'REVIEW_ASSIGNED',
        'REVIEW_COMPLETED',
        'MILESTONE_ACHIEVED',
        'SKILL_LEVEL_UP',
        'TEAM_MENTION',
        'FEEDBACK_RECEIVED',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['CODE_REVIEW', 'SKILL', 'ACHIEVEMENT', 'TEAM', 'ADMIN'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Reference to submission, review, skill, or task',
    },
    relatedModel: {
      type: String,
      enum: ['CodeSubmission', 'Review', 'Skill', 'Task', 'User', 'Milestone'],
    },
    actionUrl: {
      type: String,
      description: 'URL user should navigate to for action',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSent: {
      type: Boolean,
      default: false,
      description: 'Whether email notification was sent',
    },
    emailSentAt: {
      type: Date,
      description: 'Timestamp when email was sent',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Additional contextual data',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'User who triggered the notification',
    },
    expiresAt: {
      type: Date,
      description: 'When notification should be auto-archived',
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

// Indexes for common queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, category: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);
