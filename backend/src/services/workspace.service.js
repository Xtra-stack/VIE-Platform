import { Company } from "../models/Company.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { InternalRepository } from "../models/InternalRepository.js";
import { ROLES } from "../constants/roles.js";
import { signToken } from "../utils/jwt.js";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export class WorkspaceService {
  async createWorkspace({
    companyName,
    companySlug,
    projectName,
    projectSlug,
    timezone,
    country,
    manager,
  }) {
    if (!companyName || !projectName || !manager) {
      const error = new Error("companyName, projectName, and manager are required");
      error.status = 400;
      throw error;
    }

    const normalizedCompanySlug = companySlug ? slugify(companySlug) : slugify(companyName);
    const normalizedProjectSlug = projectSlug ? slugify(projectSlug) : slugify(projectName);

    if (!normalizedCompanySlug || !normalizedProjectSlug) {
      const error = new Error("Invalid company or project slug");
      error.status = 400;
      throw error;
    }

    const existingCompany = await Company.findOne({ slug: normalizedCompanySlug });
    if (existingCompany) {
      const error = new Error("Company slug already exists");
      error.status = 409;
      throw error;
    }

    const existingUser = await User.findOne({
      $or: [{ username: manager.username }, { email: manager.email }],
    });
    if (existingUser) {
      const error = new Error("Manager username or email already exists");
      error.status = 409;
      throw error;
    }

    const company = await Company.create({
      name: companyName,
      slug: normalizedCompanySlug,
      timezone: timezone || "UTC",
      country: country || "",
    });

    const managerUser = await User.create({
      username: manager.username,
      email: manager.email,
      password: manager.password,
      fullName: manager.fullName,
      role: ROLES.MANAGER,
      companyId: company._id,
      canReview: true,
      canDeploy: true,
      canApproveDeployment: true,
    });

    const repositoryPath = `workspaces/${normalizedCompanySlug}/${normalizedProjectSlug}`;

    const project = await Project.create({
      name: projectName,
      slug: normalizedProjectSlug,
      description: manager.projectDescription || "",
      companyId: company._id,
      repositoryPath,
      gitRemoteUrl: `git://vie/${normalizedCompanySlug}/${normalizedProjectSlug}.git`,
      members: [{ userId: managerUser._id, role: ROLES.MANAGER }],
      createdBy: managerUser._id,
      mainBranch: "main",
      branchProtection: {
        mainBranchLocked: true,
        requireReview: true,
        requiredReviewers: 1,
      },
      validationRules: {
        commitMessageFormat: "^[A-Z]+-\\d+: .+$",
        blockedKeywords: ["WIP", "temp"],
        minCommitMessageLength: 10,
        filePatterns: {
          allowed: ["src/**", "tests/**", "docs/**"],
          blocked: ["node_modules/**", "dist/**"],
        },
      },
      cicdEnabled: true,
      testCommand: "npm test",
      testTimeout: 900000,
      deploymentEnvironments: [
        { name: "staging", branch: "develop", autoDeployOnApproval: false },
        { name: "production", branch: "main", autoDeployOnApproval: false },
      ],
    });

    await InternalRepository.create({
      projectId: project._id,
      repositoryPath,
      defaultBranch: "main",
    });

    const token = signToken({
      id: managerUser._id.toString(),
      username: managerUser.username,
      role: managerUser.role,
      companyId: company._id.toString(),
    });

    return {
      company,
      project,
      manager: managerUser,
      token,
    };
  }

  async inviteUser({ companyId, managerId, user }) {
    if (!companyId || !managerId || !user) {
      const error = new Error("companyId, managerId, and user are required");
      error.status = 400;
      throw error;
    }

    const existingUser = await User.findOne({
      $or: [{ username: user.username }, { email: user.email }],
    });
    if (existingUser) {
      const error = new Error("Username or email already exists");
      error.status = 409;
      throw error;
    }

    const project = await Project.findOne({ companyId }).sort({ createdAt: 1 });
    if (!project) {
      const error = new Error("No project found for this workspace");
      error.status = 404;
      throw error;
    }

    const newUser = await User.create({
      username: user.username,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: user.role,
      companyId,
      canReview: user.role === ROLES.SENIOR,
      canDeploy: false,
      canApproveDeployment: false,
    });

    project.members.push({ userId: newUser._id, role: user.role });
    await project.save();

    return { user: newUser, project };
  }
}
