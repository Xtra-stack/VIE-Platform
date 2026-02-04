import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, required: true }, // JUNIOR, SENIOR, MANAGER
    actionType: { type: String, required: true }, // submit, review, approve, merge, deploy, login, logout
    entityType: { type: String }, // CodeSubmission, Review, Deployment
    entityId: { type: mongoose.Schema.Types.ObjectId }, // ID of the entity being acted upon
    message: { type: String, required: true }, // Human-readable description
    details: { type: mongoose.Schema.Types.Mixed }, // Additional context
    timestamp: { type: Date, default: Date.now, immutable: true },
  },
  { timestamps: false } // We handle timestamps manually
);

// Index for efficient querying
activityLogSchema.index({ entityId: 1, timestamp: -1 });
activityLogSchema.index({ actorId: 1, timestamp: -1 });
activityLogSchema.index({ actionType: 1, timestamp: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
