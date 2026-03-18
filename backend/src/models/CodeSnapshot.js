import mongoose from 'mongoose';

const codeSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeSubmission',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust', 'sql', 'html', 'css'],
      default: 'javascript',
      index: true,
    },
    fileName: {
      type: String,
      default: 'index.js',
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    lineCount: {
      type: Number,
      default: 0,
    },
    checksumHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    skillsAffected: [
      {
        skillName: {
          type: String,
          enum: ['Frontend', 'Backend', 'API Development', 'Testing', 'DevOps', 'Documentation', 'Communication'],
        },
        xpAwarded: {
          type: Number,
          default: 0,
        },
        levelBefore: {
          type: Number,
          default: 1,
        },
        levelAfter: {
          type: Number,
          default: 1,
        },
      },
    ],
    notes: {
      type: String,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Track code versions per submission
codeSnapshotSchema.index({ submissionId: 1, version: -1 });
codeSnapshotSchema.index({ userId: 1, createdAt: -1 });
codeSnapshotSchema.index({ workspaceId: 1, createdAt: -1 });

const CodeSnapshot = mongoose.model('CodeSnapshot', codeSnapshotSchema);

export default CodeSnapshot;
