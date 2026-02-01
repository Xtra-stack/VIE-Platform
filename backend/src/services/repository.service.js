import { InternalRepository } from "../models/InternalRepository.js";

export class RepositoryService {
  async createRepository({ projectId, repositoryPath, defaultBranch = "main" }) {
    const repository = await InternalRepository.create({
      projectId,
      repositoryPath,
      defaultBranch,
    });
    return repository;
  }

  async getRepositoryByProject(projectId) {
    return InternalRepository.findOne({ projectId, isActive: true });
  }
}
