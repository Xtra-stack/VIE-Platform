import { WorkspaceService } from "../services/workspace.service.js";
import { ROLES } from "../constants/roles.js";

const workspaceService = new WorkspaceService();

export const createWorkspace = async (req, res, next) => {
  try {
    const { companyName, companySlug, projectName, projectSlug, timezone, country, manager } = req.body || {};

    if (!manager || !manager.username || !manager.email || !manager.password || !manager.fullName) {
      return res.status(400).json({
        success: false,
        error: "Manager account details are required",
      });
    }

    const result = await workspaceService.createWorkspace({
      companyName,
      companySlug,
      projectName,
      projectSlug,
      timezone,
      country,
      manager,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const inviteUser = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { username, email, password, fullName, role } = req.body || {};

    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: "username, email, password, fullName, and role are required",
      });
    }

    if (![ROLES.SENIOR, ROLES.JUNIOR].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "role must be SENIOR or JUNIOR",
      });
    }

    if (req.user.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
      });
    }

    const result = await workspaceService.inviteUser({
      companyId,
      managerId: req.user.id,
      user: { username, email, password, fullName, role },
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
