import { ProjectService } from "../services/project.service.js";

const projectService = new ProjectService();

export const listProjects = async (req, res, next) => {
  try {
    const projects =
      req.user.role === "MANAGER"
        ? await projectService.listProjectsForManager(req.user.companyId || null)
        : await projectService.listProjectsForUser(req.user.id);
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject({
      data: req.body || {},
      createdBy: req.user.id,
    });
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectForUser(
      req.params.projectId,
      req.user.id,
      true,
      req.user.role,
      req.user.companyId || null
    );
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body || {};

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        error: "userId and role are required",
      });
    }

    const project = await projectService.addMember({
      projectId: req.params.projectId,
      userId,
      role,
    });

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
};
