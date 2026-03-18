import { ActivityLogService } from "../services/activitylog.service.js";

const activityService = new ActivityLogService();

/**
 * Middleware to track activity
 * Usage: router.post('/endpoint', trackActivity('action', 'ENTITY_TYPE'), controller)
 */
export const trackActivity = (action, entityType) => {
  return async (req, res, next) => {
    // Store tracking info in request for later use
    req.tracking = {
      action,
      entityType,
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Wrap the response send method to capture entity ID
    const originalSend = res.send;
    res.send = function (data) {
      res.send = originalSend;

      // Log activity after response is sent
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        setImmediate(async () => {
          try {
            let entityId = null;

            // Try to extract entity ID from response
            if (typeof data === "string") {
              try {
                const parsed = JSON.parse(data);
                if (parsed.data && parsed.data._id) {
                  entityId = parsed.data._id;
                } else if (parsed.data && parsed.data.id) {
                  entityId = parsed.data.id;
                }
              } catch (err) {
                // Not JSON, skip parsing
              }
            } else if (typeof data === "object" && data !== null) {
              if (data.data && data.data._id) {
                entityId = data.data._id;
              } else if (data.data && data.data.id) {
                entityId = data.data.id;
              } else if (data._id) {
                entityId = data._id;
              }
            }

            // Or from request params
            if (!entityId && req.params && req.params.id) {
              entityId = req.params.id;
            }

            await activityService.logAction({
              userId: req.user.id,
              workspaceId: req.params.workspaceId || req.body?.workspaceId,
              role: req.user.role,
              action,
              entityType,
              entityId,
              description: generateDescription(action, entityType, req.body),
              metadata: req.body || {},
              ipAddress: req.tracking.ip,
              userAgent: req.tracking.userAgent,
            });
          } catch (error) {
            console.error("Failed to track activity:", error);
            // Don't fail the request if tracking fails
          }
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Generate human-readable description for an activity
 */
function generateDescription(action, entityType, body) {
  const descriptions = {
    create_task: `Created a new ${entityType}`,
    update_task: `Updated a ${entityType}`,
    delete_task: `Deleted a ${entityType}`,
    assign_task: `Assigned a ${entityType}`,
    create_workspace: `Created a new workspace`,
    invite_member: `Invited a team member`,
    join_workspace: `Joined workspace`,
    create_submission: `Created a new submission`,
    approve_submission: `Approved a submission`,
    reject_submission: `Rejected a submission`,
    add_comment: `Added a comment to ${entityType}`,
    edit_comment: `Edited a comment`,
    login: `User logged in`,
    logout: `User logged out`,
    failed_login: `Failed login attempt`,
  };

  return descriptions[action] || `Performed action: ${action}`;
}

/**
 * Middleware to update user's last active timestamp
 * Apply to all protected routes
 */
export const updateLastActive = async (req, res, next) => {
  if (req.user) {
    try {
      await activityService.updateUserOnlineStatus(req.user.id, true);
    } catch (error) {
      console.error("Failed to update last active:", error);
    }
  }
  next();
};

/**
 * Middleware to handle user logout
 */
export const trackLogout = async (req, res, next) => {
  if (req.user) {
    try {
      await activityService.logAction({
        userId: req.user.id,
        role: req.user.role,
        action: "logout",
        entityType: "AUTH",
        description: "User logged out",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
      });

      // Set user as offline
      await activityService.updateUserOnlineStatus(req.user.id, false);
    } catch (error) {
      console.error("Failed to track logout:", error);
    }
  }
  next();
};
