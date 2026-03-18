import mongoose from 'mongoose';

const terminalLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    command: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    output: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    commandType: {
      type: String,
      enum: ['npm', 'git', 'build', 'test', 'deploy', 'general'],
      default: 'general',
      index: true,
    },
    exitCode: {
      type: Number,
      default: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    sessionId: {
      type: String,
      index: true,
    },
    isSimulated: {
      type: Boolean,
      default: true, // True for learning environment simulations
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
terminalLogSchema.index({ userId: 1, createdAt: -1 });
terminalLogSchema.index({ workspaceId: 1, createdAt: -1 });
terminalLogSchema.index({ userId: 1, commandType: 1, createdAt: -1 });
terminalLogSchema.index({ sessionId: 1, createdAt: 1 });

// TTL index: auto-delete logs older than 90 days
terminalLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const TerminalLog = mongoose.model('TerminalLog', terminalLogSchema);

export default TerminalLog;
