import mongoose from 'mongoose';

const skillGrowthEntry = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  source: { type: String, enum: ['task_completion', 'bonus', 'manual_adjustment'] }
});

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skillName: {
      type: String,
      enum: [
        'Frontend Development',
        'Backend Development',
        'API Development',
        'Testing & QA',
        'DevOps',
        'Documentation',
        'Communication'
      ],
      required: true
    },

    // Level & XP
    level: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    xp: {
      type: Number,
      min: 0,
      default: 0
    },
    nextLevelXp: {
      type: Number,
      default: 100
    },

    // Performance Metrics
    taskCount: {
      type: Number,
      default: 0
    },
    approvalRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    avgReworkCount: {
      type: Number,
      default: 0
    },
    completionEfficiency: {
      type: Number,
      default: 100 // % of deadline used
    },

    // Growth History (last 30 entries)
    growthHistory: {
      type: [skillGrowthEntry],
      default: []
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'skills'
  }
);

// Index for quick lookup
skillSchema.index({ userId: 1, skillName: 1 }, { unique: true });
skillSchema.index({ userId: 1 });
skillSchema.index({ level: -1 });

// Method: Award XP
skillSchema.methods.awardXP = function(points, source = 'task_completion') {
  const previousLevel = this.level;
  this.xp += points;

  // Level up logic
  while (this.xp >= this.nextLevelXp && this.level < 5) {
    this.xp -= this.nextLevelXp;
    this.level += 1;
    this.nextLevelXp = this.calculateNextLevelXp(this.level);
  }

  // Add to growth history
  this.growthHistory.push({
    date: new Date(),
    xp: points,
    level: this.level,
    source
  });

  // Keep only last 30 entries
  if (this.growthHistory.length > 30) {
    this.growthHistory.shift();
  }

  this.lastUpdated = new Date();
  return { leveledUp: this.level > previousLevel, newLevel: this.level };
};

// Method: Calculate XP for next level
skillSchema.methods.calculateNextLevelXp = function(level) {
  const xpThresholds = {
    0: 100,
    1: 150,
    2: 200,
    3: 300,
    4: 500
  };
  return xpThresholds[level] || 500;
};

// Method: Update performance metrics
skillSchema.methods.updateMetrics = function(taskData) {
  this.taskCount += 1;

  // Update approval rate
  const previousApprovals = Math.floor(
    (this.approvalRate / 100) * (this.taskCount - 1)
  );
  const newApprovals = taskData.approved ? previousApprovals + 1 : previousApprovals;
  this.approvalRate = Math.round((newApprovals / this.taskCount) * 100);

  // Update rework average
  const previousReworks = this.avgReworkCount * (this.taskCount - 1);
  this.avgReworkCount = (previousReworks + taskData.reworkCount) / this.taskCount;

  // Update completion efficiency
  const deadlineUsagePercent = (taskData.hoursUsed / taskData.hoursAvailable) * 100;
  const previousEfficiency = this.completionEfficiency * (this.taskCount - 1);
  this.completionEfficiency = (previousEfficiency + deadlineUsagePercent) / this.taskCount;

  this.lastUpdated = new Date();
};

// Method: Get skill progress percentage
skillSchema.methods.getProgressPercent = function() {
  return Math.round((this.xp / this.nextLevelXp) * 100);
};

// Static: Create or get user skill
skillSchema.statics.findOrCreateSkill = async function(userId, skillName) {
  let skill = await this.findOne({ userId, skillName });
  if (!skill) {
    skill = await this.create({ userId, skillName });
  }
  return skill;
};

// Static: Get all skills for user
skillSchema.statics.getUserSkillsWithProgress = async function(userId) {
  return await this.find({ userId }).sort({ level: -1, xp: -1 });
};

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
