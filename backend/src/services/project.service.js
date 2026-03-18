import { Project } from "../models/Project.js";
import { RepositoryService } from "./repository.service.js";
import { ROLES, hasRoleAtLeast } from "../constants/roles.js";

export class ProjectService {
  constructor() {
    this.repositoryService = new RepositoryService();
  }

  async createProject({ data, createdBy }) {
    const project = await Project.create({
      ...data,
      createdBy,
      members: [
        {
          userId: createdBy,
          role: data.ownerRole || ROLES.MANAGER,
        },
      ],
    });

    if (data.repositoryPath) {
      await this.repositoryService.createRepository({
        projectId: project._id,
        repositoryPath: data.repositoryPath,
        defaultBranch: project.mainBranch,
      });
    }

    return project;
  }

  async listProjectsForUser(userId) {
    return Project.find({ "members.userId": userId });
  }

  async listProjectsForManager(companyId) {
    if (!companyId) {
      return Project.find();
    }
    return Project.find({ companyId });
  }

  async getProjectForUser(projectId, userId, allowManagerAccess = false, userRole, companyId = null) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Project not found");
      error.status = 404;
      throw error;
    }

    const isMember = project.members.some((member) => member.userId.toString() === userId);
    const isManager = allowManagerAccess && hasRoleAtLeast(userRole, ROLES.MANAGER);

    if (isManager && companyId && project.companyId.toString() !== companyId) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    if (!isMember && !isManager) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    return project;
  }

  async addMember({ projectId, userId, role }) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Project not found");
      error.status = 404;
      throw error;
    }

    const exists = project.members.some((member) => member.userId.toString() === userId);
    if (exists) {
      return project;
    }

    project.members.push({ userId, role });
    await project.save();
    return project;
  }
}
