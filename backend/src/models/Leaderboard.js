import mongoose from 'mongoose';

/**
 * Leaderboard Model
 * Stores ranked user statistics for monthly and all-time leaderboards
 */

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      description: 'Company context for leaderboard',
    },
    period: {
      type: String,
      enum: ['ALL_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
      required: true,
      index: true,
    },
    month: {
      type: String,
      description: 'YYYY-MM format for monthly leaderboards',
    },
    rank: {
      type: Number,
      index: true,
    },
    previousRank: {
      type: Number,
      description: 'Previous ranking for tracking rank changes',
    },
    totalXp: {
      type: Number,
      default: 0,
      index: true,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
    approvalCount: {
      type: Number,
      default: 0,
    },
    rejectionCount: {
      type: Number,
      default: 0,
    },
    approvalRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Approval rate percentage (0-100)',
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    averageReviewQuality: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    skillCount: {
      type: Number,
      default: 0,
      description: 'Number of skills developed',
    },
    maxSkillLevel: {
      type: Number,
      default: 0,
      description: 'Highest skill level achieved (max 5)',
    },
    achievementCount: {
      type: Number,
      default: 0,
      description: 'Number of achievements unlocked',
    },
    streak: {
      current: {
        type: Number,
        default: 0,
        description: 'Current submission/activity streak',
      },
      longest: {
        type: Number,
        default: 0,
        description: 'Longest streak achieved',
      },
      lastActivityDate: {
        type: Date,
        description: 'Last activity date for streak calculation',
      },
    },
    score: {
      type: Number,
      default: 0,
      index: true,
      description: 'Composite leaderboard score',
    },
    scoreBreakdown: {
      xpScore: { type: Number, default: 0 },
      approvalScore: { type: Number, default: 0 },
      reviewScore: { type: Number, default: 0 },
      skillScore: { type: Number, default: 0 },
      consistencyScore: { type: Number, default: 0 },
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
    trendDirection: {
      type: String,
      enum: ['UP', 'DOWN', 'STABLE'],
      default: 'STABLE',
    },
    percentileRank: {
      type: Number,
      description: 'Percentile ranking (0-100)',
    },
    lastUpdated: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: 'leaderboards',
  }
);

// Indexes for efficient querying
leaderboardSchema.index({ period: 1, rank: 1 });
leaderboardSchema.index({ period: 1, score: -1 });
leaderboardSchema.index({ userId: 1, period: 1 });
leaderboardSchema.index({ companyId: 1, period: 1, rank: 1 });
leaderboardSchema.index({ month: 1, rank: 1 });
leaderboardSchema.index({ period: 1, month: 1, score: -1 });
leaderboardSchema.index({ period: 1, month: 1, rank: 1 });

export default mongoose.model('Leaderboard', leaderboardSchema);
