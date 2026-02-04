import { ActivityLog } from "../models/ActivityLog.js";

export class ActivityLogService {
  async logAction({
    actorId,
    actorRole,
    actionType,
    entityType,
    entityId,
    message,
    details = {},
  }) {
    try {
      return await ActivityLog.create({
        actorId,
        actorRole,
        actionType,
        entityType,
        entityId,
        message,
        details,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Don't throw - logging shouldn't break the main action
    }
  }

  async getActivityLog(entityId, limit = 50) {
    return ActivityLog.find({ entityId })
      .populate("actorId", "username email")
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getUserActivityLog(userId, limit = 50) {
    return ActivityLog.find({ actorId: userId })
      .populate("actorId", "username email")
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async getActionActivityLog(actionType, limit = 50) {
    return ActivityLog.find({ actionType })
      .populate("actorId", "username email")
      .sort({ timestamp: -1 })
      .limit(limit);
  }
}
