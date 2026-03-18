import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    role: { type: String, required: true }, // MANAGER | SENIOR | JUNIOR
    action: { type: String, required: true }, // login, logout, task_created, task_assigned, etc.
    entityType: { type: String, required: true }, // TASK | WORKSPACE | SUBMISSION | AUTH | COMMENT
    entityId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional context (e.g., old values, new values)
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Indexes for efficient querying
activityLogSchema.index({ workspaceId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
