import { WorkspaceManagementService } from "../services/workspaceManagement.service.js";
import { ROLES } from "../constants/roles.js";

const workspaceService = new WorkspaceManagementService();

/**
 * Create a new workspace (Manager only)
 */
export const createProjectWorkspace = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.MANAGER) {
      return res.status(403).json({
        success: false,
        error: "Only managers can create workspaces",
      });
    }

    const {
      name,
      projectId,
      projectType,
      techArea,
      assignedJuniors,
      assignedSeniors,
    } = req.body;

    const result = await workspaceService.createWorkspace({
      name,
      projectId,
      companyId: req.user.companyId,
      projectType,
      techArea,
      assignedJuniors: assignedJuniors || [],
      assignedSeniors: assignedSeniors || [],
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Upload base code for a workspace (Manager only)
 */
export const uploadWorkspaceBaseCode = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.MANAGER) {
      return res.status(403).json({
        success: false,
        error: "Only managers can upload base code",
      });
    }

    const { workspaceId } = req.params;
    const { files } = req.body; // Expect array of { fileName, content, size }

    const result = await workspaceService.uploadBaseCode({
      workspaceId,
      files,
      uploadedBy: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all workspaces for the manager's company
 */
export const listWorkspaces = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.MANAGER) {
      return res.status(403).json({
        success: false,
        error: "Only managers can list workspaces",
      });
    }

    const { status } = req.query;

    const workspaces = await workspaceService.listWorkspaces({
      companyId: req.user.companyId,
      status,
    });

    return res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get workspace details
 */
export const getWorkspaceDetails = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const result = await workspaceService.getWorkspace(workspaceId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get tasks for junior
 */
export const getMyTasks = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.JUNIOR) {
      return res.status(403).json({
        success: false,
        error: "Only juniors can access this endpoint",
      });
    }

    const tasks = await workspaceService.getJuniorTasks(req.user.id);

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update task status
 */
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, submissionId } = req.body;

    const task = await workspaceService.updateTaskStatus({
      taskId,
      status,
      submissionId,
    });

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get base code files (read-only)
 */
export const getBaseCodeFiles = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const files = await workspaceService.getBaseCodeFiles(workspaceId);

    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get working copy files
 */
export const getWorkingCopyFiles = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const files = await workspaceService.getWorkingCopyFiles(workspaceId);

    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update working copy file (Junior only)
 */
export const updateWorkingFile = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.JUNIOR) {
      return res.status(403).json({
        success: false,
        error: "Only juniors can update working copy files",
      });
    }

    const { workspaceId } = req.params;
    const { filePath, content } = req.body;

    const file = await workspaceService.updateWorkingCopyFile({
      workspaceId,
      filePath,
      content,
      updatedBy: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    return next(error);
  }
};
