import mongoose from 'mongoose';

/**
 * Achievement Model
 * Stores badges, achievements, and milestones unlocked by users
 */

const achievementSchema = new mongoose.Schema(
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
        'SKILL_LEVEL_5',
        'FIRST_SUBMISSION',
        'FIVE_SUBMISSIONS',
        'FIFTY_APPROVALS',
        'CODE_REVIEWER',
        'CODE_MASTER',
        'SKILL_SPECIALIST',
        'COMMUNITY_STAR',
        'ACCURACY_STREAK',
        'SPEED_DEMON',
        'CONSISTENCY_PRO',
        'QUALITY_ADVOCATE',
        'MILESTONE_SENIOR',
        'MILESTONE_MANAGER',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      description: 'Emoji or icon representing the achievement',
    },
    rarity: {
      type: String,
      enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'],
      default: 'COMMON',
    },
    xpReward: {
      type: Number,
      default: 100,
      description: 'XP awarded for this achievement',
    },
    requirement: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Criteria needed to unlock (e.g., { skill: "JavaScript", level: 5 })',
    },
    stats: {
      viewCount: {
        type: Number,
        default: 0,
      },
      userCount: {
        type: Number,
        default: 0,
        description: 'How many users have this achievement',
      },
    },
    unlockedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'],
      default: 'PUBLIC',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Related submission/review/skill for context',
    },
  },
  {
    timestamps: true,
    collection: 'achievements',
  }
);

achievementSchema.index({ userId: 1, type: 1 });
achievementSchema.index({ userId: 1, unlockedAt: -1 });
achievementSchema.index({ type: 1, userCount: -1 });

export default mongoose.model('Achievement', achievementSchema);
