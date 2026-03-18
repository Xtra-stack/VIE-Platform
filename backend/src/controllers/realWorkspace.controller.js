import { RealWorkspaceService } from "../services/realWorkspace.service.js";

const realWorkspaceService = new RealWorkspaceService();

export const createOrganization = async (req, res, next) => {
  try {
    const { name, slug, timezone, country } = req.body || {};
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Organization name is required",
      });
    }

    const result = await realWorkspaceService.createOrganization({
      adminId: req.user.id,
      name,
      slug,
      timezone,
      country,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, projectName, projectSlug, projectType, techArea } = req.body || {};
    if (!name || !projectName || !projectType || !techArea) {
      return res.status(400).json({
        success: false,
        error: "name, projectName, projectType, and techArea are required",
      });
    }

    const result = await realWorkspaceService.createWorkspace({
      adminId: req.user.id,
      name,
      projectName,
      projectSlug,
      projectType,
      techArea,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const assignManager = async (req, res, next) => {
  try {
    const { managerUserId } = req.body || {};
    if (!managerUserId) {
      return res.status(400).json({
        success: false,
        error: "managerUserId is required",
      });
    }

    const result = await realWorkspaceService.assignManager({
      adminId: req.user.id,
      workspaceId: req.params.workspaceId,
      managerUserId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body || {};
    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "fullName, username, email, password, and role are required",
      });
    }

    const result = await realWorkspaceService.inviteMember({
      actorId: req.user.id,
      fullName,
      username,
      email,
      password,
      role,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
