import { Workspace } from "../models/Workspace.js";
import { Task } from "../models/Task.js";
import { WorkspaceFile } from "../models/WorkspaceFile.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { ROLES } from "../constants/roles.js";
import path from "path";
import fs from "fs/promises";

export class WorkspaceManagementService {
  /**
   * Create a new workspace with tasks
   */
  async createWorkspace({
    name,
    projectId,
    companyId,
    projectType,
    techArea,
    assignedJuniors = [],
    assignedSeniors = [],
    createdBy,
  }) {
    // Validate inputs
    if (!name || !projectId || !companyId || !projectType || !techArea || !createdBy) {
      const error = new Error("Missing required fields");
      error.status = 400;
      throw error;
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project || project.companyId.toString() !== companyId.toString()) {
      const error = new Error("Project not found");
      error.status = 404;
      throw error;
    }

    // Create workspace
    const workspace = await Workspace.create({
      name,
      projectId,
      companyId,
      projectType,
      techArea,
      assignedJuniors,
      assignedSeniors,
      createdBy,
      status: "ACTIVE",
    });

    // Create tasks for each assigned junior
    const tasks = [];
    for (const juniorId of assignedJuniors) {
      const task = await Task.create({
        workspaceId: workspace._id,
        projectId,
        title: name,
        description: `Work on ${name} - ${projectType}`,
        projectType,
        techArea,
        assignedTo: juniorId,
        assignedBy: createdBy,
        status: "ASSIGNED",
      });
      tasks.push(task);
    }

    return { workspace, tasks };
  }

  /**
   * Upload base code ZIP (for updates/bug fixes)
   */
  async uploadBaseCode({ workspaceId, files, uploadedBy }) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      const error = new Error("Workspace not found");
      error.status = 404;
      throw error;
    }

    // Set paths
    const baseCodePath = `/workspaces/${workspaceId}/base-code`;
    const workingCopyPath = `/workspaces/${workspaceId}/working-copy`;

    workspace.hasBaseCode = true;
    workspace.baseCodePath = baseCodePath;
    workspace.workingCopyPath = workingCopyPath;
    await workspace.save();

    // Store files in database (simulated)
    const savedFiles = [];
    for (const file of files) {
      const workspaceFile = await WorkspaceFile.create({
        workspaceId: workspace._id,
        fileType: "BASE_CODE",
        fileName: file.fileName,
        filePath: path.join(baseCodePath, file.fileName),
        fileSize: file.size,
        content: file.content,
        uploadedBy,
        isReadOnly: true,
      });
      savedFiles.push(workspaceFile);

      // Create working copy
      await WorkspaceFile.create({
        workspaceId: workspace._id,
        fileType: "WORKING_COPY",
        fileName: file.fileName,
        filePath: path.join(workingCopyPath, file.fileName),
        fileSize: file.size,
        content: file.content,
        uploadedBy,
        isReadOnly: false,
      });
    }

    return { workspace, files: savedFiles };
  }

  /**
   * Get all workspaces for a company/manager
   */
  async listWorkspaces({ companyId, status = null }) {
    const query = { companyId };
    if (status) {
      query.status = status;
    }

    return Workspace.find(query)
      .populate("assignedJuniors", "username fullName")
      .populate("assignedSeniors", "username fullName")
      .populate("createdBy", "username fullName")
      .sort({ createdAt: -1 });
  }

  /**
   * Get workspace details
   */
  async getWorkspace(workspaceId) {
    const workspace = await Workspace.findById(workspaceId)
      .populate("assignedJuniors", "username fullName email")
      .populate("assignedSeniors", "username fullName email")
      .populate("createdBy", "username fullName")
      .populate("projectId", "name slug");

    if (!workspace) {
      const error = new Error("Workspace not found");
      error.status = 404;
      throw error;
    }

    // Get tasks for this workspace
    const tasks = await Task.find({ workspaceId })
      .populate("assignedTo", "username fullName")
      .populate("assignedBy", "username fullName")
      .sort({ createdAt: -1 });

    return { workspace, tasks };
  }

  /**
   * Get tasks assigned to a junior
   */
  async getJuniorTasks(juniorId) {
    return Task.find({ assignedTo: juniorId })
      .populate("workspaceId", "name projectType techArea")
      .populate("projectId", "name")
      .populate("assignedBy", "username fullName")
      .sort({ createdAt: -1 });
  }

  /**
   * Update task status
   */
  async updateTaskStatus({ taskId, status, submissionId = null }) {
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error("Task not found");
      error.status = 404;
      throw error;
    }

    task.status = status;
    if (submissionId) {
      task.submissionId = submissionId;
    }
    if (status === "APPROVED") {
      task.completedAt = new Date();
    }

    await task.save();
    return task;
  }

  /**
   * Get base code files for a workspace (read-only)
   */
  async getBaseCodeFiles(workspaceId) {
    return WorkspaceFile.find({
      workspaceId,
      fileType: "BASE_CODE",
    }).sort({ filePath: 1 });
  }

  /**
   * Get working copy files for a workspace
   */
  async getWorkingCopyFiles(workspaceId) {
    return WorkspaceFile.find({
      workspaceId,
      fileType: "WORKING_COPY",
    }).sort({ filePath: 1 });
  }

  /**
   * Update working copy file
   */
  async updateWorkingCopyFile({ workspaceId, filePath, content, updatedBy }) {
    const file = await WorkspaceFile.findOne({
      workspaceId,
      filePath,
      fileType: "WORKING_COPY",
    });

    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }

    file.content = content;
    file.version += 1;
    file.uploadedBy = updatedBy;
    file.uploadedAt = new Date();

    await file.save();
    return file;
  }
}
