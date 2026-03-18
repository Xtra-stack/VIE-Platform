import { hasRoleAtLeast } from "../constants/roles.js";

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    return next();
  };
};

export const requireMinRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    if (!hasRoleAtLeast(req.user.role, minimumRole)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    return next();
  };
};
