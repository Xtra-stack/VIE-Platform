import { Company } from "../models/Company.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { InternalRepository } from "../models/InternalRepository.js";
import { OrganizationInvite } from "../models/OrganizationInvite.js";
import { ROLES } from "../constants/roles.js";
import { canInviteRole } from "../constants/roles.js";
import { signToken } from "../utils/jwt.js";
import crypto from "crypto";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export class WorkspaceService {
  async generateInviteCode() {
    for (let index = 0; index < 5; index += 1) {
      const candidate = crypto.randomBytes(4).toString("hex").toUpperCase();
      const exists = await OrganizationInvite.findOne({ code: candidate });
      if (!exists) {
        return candidate;
      }
    }

    const error = new Error("Could not generate invite code");
    error.status = 500;
    throw error;
  }

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

  async createInviteCode({ companyId, inviterId, inviterRole, role, email = null, expiresInHours = 168 }) {
    if (!companyId || !inviterId || !inviterRole || !role) {
      const error = new Error("companyId, inviterId, inviterRole, and role are required");
      error.status = 400;
      throw error;
    }

    if (!canInviteRole(inviterRole, role)) {
      const error = new Error("You cannot invite this role");
      error.status = 403;
      throw error;
    }

    const company = await Company.findById(companyId);
    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }

    const code = await this.generateInviteCode();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invite = await OrganizationInvite.create({
      code,
      companyId,
      invitedBy: inviterId,
      role,
      email: email || undefined,
      expiresAt,
    });

    return invite;
  }

  async joinWithInvite({ inviteCode, user }) {
    const normalizedCode = (inviteCode || "").trim().toUpperCase();
    if (!normalizedCode) {
      const error = new Error("inviteCode is required");
      error.status = 400;
      throw error;
    }

    const invite = await OrganizationInvite.findOne({ code: normalizedCode });
    if (!invite) {
      const error = new Error("Invalid invite code");
      error.status = 404;
      throw error;
    }

    if (invite.status !== "PENDING") {
      const error = new Error("Invite is no longer available");
      error.status = 400;
      throw error;
    }

    if (new Date() > invite.expiresAt) {
      invite.status = "EXPIRED";
      await invite.save();
      const error = new Error("Invite code has expired");
      error.status = 400;
      throw error;
    }

    if (invite.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
      const error = new Error("Invite code does not match this email");
      error.status = 403;
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

    const newUser = await User.create({
      username: user.username,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: invite.role,
      companyId: invite.companyId,
      canReview: invite.role === ROLES.SENIOR,
      canDeploy: false,
      canApproveDeployment: false,
    });

    const project = await Project.findOne({ companyId: invite.companyId }).sort({ createdAt: 1 });
    if (project) {
      project.members.push({ userId: newUser._id, role: invite.role });
      await project.save();
    }

    invite.status = "ACCEPTED";
    invite.acceptedBy = newUser._id;
    invite.acceptedAt = new Date();
    await invite.save();

    const token = signToken({
      id: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role,
      companyId: newUser.companyId ? newUser.companyId.toString() : null,
    });

    return {
      invite,
      user: newUser,
      token,
    };
  }
}
