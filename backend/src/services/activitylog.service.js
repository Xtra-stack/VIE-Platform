import { ActivityLog } from "../models/ActivityLog.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

export class ActivityLogService {
  /**
   * Log an activity action
   */
  async logAction({
    userId,
    workspaceId,
    role,
    action,
    entityType,
    entityId,
    description,
    metadata = {},
    ipAddress,
    userAgent,
  }) {
    try {
      return await ActivityLog.create({
        userId,
        workspaceId,
        role,
        action,
        entityType,
        entityId,
        description,
        metadata,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Don't throw - logging shouldn't break the main action
    }
  }

  /**
   * Get activity logs for a workspace (paginated)
   */
  async getWorkspaceActivityLogs(workspaceId, page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { workspaceId };

      if (filters.action) {
        query.action = filters.action;
      }
      if (filters.entityType) {
        query.entityType = filters.entityType;
      }
      if (filters.role) {
        query.role = filters.role;
      }
      if (filters.userId) {
        query.userId = filters.userId;
      }
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }

      const logs = await ActivityLog.find(query)
        .populate("userId", "username email fullName role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ActivityLog.countDocuments(query);

      return {
        logs,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Failed to get workspace activity logs:", error);
      throw error;
    }
  }

  /**
   * Get team status for a workspace
   */
  async getTeamStatus(workspaceId, currentUserId, currentUserRole) {
    try {
      // Get workspace members
      const Workspace = await import("../models/Workspace.js").then(m => m.Workspace);
      const workspace = await Workspace.findById(workspaceId)
        .populate({
          path: "members.user",
          select: "username email fullName role isOnline lastActiveAt",
        })
        .lean();

      if (!workspace) {
        return [];
      }

      // Filter based on role
      let teamMembers = workspace.members;

      if (currentUserRole === "SENIOR") {
        // Seniors can only see juniors assigned to them
        const assignedJuniors = await ActivityLog.find({
          workspaceId,
          role: "JUNIOR",
        })
          .distinct("userId");
        teamMembers = teamMembers.filter(
          (m) => m.role === "JUNIOR" && assignedJuniors.includes(m.user._id)
        );
      } else if (currentUserRole === "JUNIOR") {
        // Juniors can only see their own info
        teamMembers = teamMembers.filter(
          (m) => m.user._id.toString() === currentUserId
        );
      }

      // Get current task for each member
      const Task = await import("../models/Task.js").then(m => m.Task || m.default);
      const teamStatus = await Promise.all(
        teamMembers.map(async (member) => {
          let currentTask = null;
          if (Task) {
            try {
              currentTask = await Task.findOne({
                assignedTo: member.user._id,
                status: { $in: ["ACTIVE", "IN_PROGRESS"] },
              })
                .select("title priority status deadline")
                .lean();
            } catch (err) {
              console.error("Failed to get current task:", err);
            }
          }

          return {
            _id: member.user._id,
            username: member.user.username,
            fullName: member.user.fullName,
            email: member.user.email,
            role: member.user.role,
            isOnline: member.user.isOnline,
            lastActiveAt: member.user.lastActiveAt,
            currentTask,
          };
        })
      );

      return teamStatus;
    } catch (error) {
      console.error("Failed to get team status:", error);
      throw error;
    }
  }

  /**
   * Get user's activity history
   */
  async getUserActivityLogs(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const logs = await ActivityLog.find({ userId })
        .populate("userId", "username email fullName role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ActivityLog.countDocuments({ userId });

      return {
        logs,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Failed to get user activity logs:", error);
      throw error;
    }
  }

  /**
   * Update user online status
   */
  async updateUserOnlineStatus(userId, isOnline) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          isOnline,
          lastActiveAt: new Date(),
        },
        { new: true }
      );
    } catch (error) {
      console.error("Failed to update user online status:", error);
    }
  }

  /**
   * Get activity stats for a workspace
   */
  async getActivityStats(workspaceId) {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

      const stats = await ActivityLog.aggregate([
        {
          $facet: {
            last24Hours: [
              {
                $match: {
                  workspaceId: workspaceObjectId,
                  createdAt: { $gte: twentyFourHoursAgo },
                },
              },
              { $count: "total" },
            ],
            last7Days: [
              {
                $match: {
                  workspaceId: workspaceObjectId,
                  createdAt: { $gte: sevenDaysAgo },
                },
              },
              { $count: "total" },
            ],
            byAction: [
              {
                $match: {
                  workspaceId: workspaceObjectId,
                },
              },
              {
                $group: {
                  _id: "$action",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      return {
        last24Hours: stats[0].last24Hours[0]?.total || 0,
        last7Days: stats[0].last7Days[0]?.total || 0,
        byAction: stats[0].byAction,
      };
    } catch (error) {
      console.error("Failed to get activity stats:", error);
      throw error;
    }
  }
}
