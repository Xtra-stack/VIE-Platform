import { ActivityLogService } from "../services/activitylog.service.js";
import { Workspace } from "../models/Workspace.js";
import mongoose from "mongoose";

const activityService = new ActivityLogService();

/**
 * Get activity logs for a workspace
 * GET /api/workspaces/:workspaceId/activity
 */
export const getWorkspaceActivity = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, limit = 20, action, entityType, role, startDate, endDate } = req.query;

    // Verify user has access to workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Check permission based on role
    const member = workspace.members.find((m) => m.user.toString() === req.user.id);
    if (!member && req.user.role !== "MANAGER") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Build filters
    const filters = {};
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (role) filters.role = role;
    if (startDate || endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    // For SENIOR, only show logs for their juniors
    if (member && member.role === "SENIOR") {
      filters.role = "JUNIOR";
      // Get juniors assigned to this senior
      const juniors = workspace.members.filter(
        (m) => m.role === "JUNIOR" && m.assignedDomain === member.assignedDomain
      );
      if (juniors.length > 0) {
        filters.userIds = juniors.map((m) => m.user);
      }
    }
    // For JUNIOR, only show their own logs
    else if (member && member.role === "JUNIOR") {
      filters.userId = req.user.id;
    }

    const result = await activityService.getWorkspaceActivityLogs(
      workspaceId,
      parseInt(page),
      parseInt(limit),
      filters
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting workspace activity:", error);
    return next(error);
  }
};

/**
 * Get team status for a workspace
 * GET /api/workspaces/:workspaceId/team-status
 */
export const getTeamStatus = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Verify workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Check permission
    const member = workspace.members.find((m) => m.user.toString() === req.user.id);
    if (!member && req.user.role !== "MANAGER") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const teamStatus = await activityService.getTeamStatus(
      workspaceId,
      req.user.id,
      member ? member.role : req.user.role
    );

    return res.status(200).json({
      success: true,
      data: teamStatus,
    });
  } catch (error) {
    console.error("Error getting team status:", error);
    return next(error);
  }
};

/**
 * Get user's activity history
 * GET /api/users/activity
 */
export const getUserActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await activityService.getUserActivityLogs(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting user activity:", error);
    return next(error);
  }
};

/**
 * Get activity statistics for a workspace
 * GET /api/workspaces/:workspaceId/activity-stats
 */
export const getActivityStats = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Verify user has access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    const member = workspace.members.find((m) => m.user.toString() === req.user.id);
    if (!member && req.user.role !== "MANAGER") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const stats = await activityService.getActivityStats(workspaceId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting activity stats:", error);
    return next(error);
  }
};
