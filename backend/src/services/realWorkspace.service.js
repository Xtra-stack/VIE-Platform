import { Company } from "../models/Company.js";
import { Project } from "../models/Project.js";
import { Workspace } from "../models/Workspace.js";
import { User } from "../models/User.js";
import { ROLES } from "../constants/roles.js";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export class RealWorkspaceService {
  async createOrganization({ adminId, name, slug, timezone, country }) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== ROLES.ADMIN) {
      const error = new Error("Only admins can create organizations");
      error.status = 403;
      throw error;
    }

    if (admin.companyId) {
      const error = new Error("Admin already belongs to an organization");
      error.status = 400;
      throw error;
    }

    const normalizedSlug = slugify(slug || name);
    const existing = await Company.findOne({ slug: normalizedSlug });
    if (existing) {
      const error = new Error("Organization slug already exists");
      error.status = 409;
      throw error;
    }

    const company = await Company.create({
      name,
      slug: normalizedSlug,
      timezone: timezone || "UTC",
      country: country || "",
    });

    admin.companyId = company._id;
    await admin.save();

    return { company, admin };
  }

  async createWorkspace({ adminId, name, projectName, projectSlug, projectType, techArea }) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== ROLES.ADMIN || !admin.companyId) {
      const error = new Error("Admin with organization is required");
      error.status = 403;
      throw error;
    }

    const normalizedProjectSlug = slugify(projectSlug || projectName);

    let project = await Project.findOne({ companyId: admin.companyId, slug: normalizedProjectSlug });
    if (!project) {
      project = await Project.create({
        name: projectName,
        slug: normalizedProjectSlug,
        description: "",
        companyId: admin.companyId,
        members: [{ userId: admin._id, role: ROLES.ADMIN }],
        createdBy: admin._id,
      });
    }

    const workspace = await Workspace.create({
      name,
      projectId: project._id,
      companyId: admin.companyId,
      projectType,
      techArea,
      createdBy: admin._id,
      managerId: null,
      status: "ACTIVE",
    });

    return { workspace, project };
  }

  async assignManager({ adminId, workspaceId, managerUserId }) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== ROLES.ADMIN || !admin.companyId) {
      const error = new Error("Only admins can assign managers");
      error.status = 403;
      throw error;
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || workspace.companyId.toString() !== admin.companyId.toString()) {
      const error = new Error("Workspace not found");
      error.status = 404;
      throw error;
    }

    const manager = await User.findById(managerUserId);
    if (!manager) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    manager.companyId = admin.companyId;
    manager.role = ROLES.MANAGER;
    await manager.save();

    workspace.managerId = manager._id;
    await workspace.save();

    const project = await Project.findById(workspace.projectId);
    if (project) {
      const exists = project.members.some((member) => member.userId.toString() === manager._id.toString());
      if (!exists) {
        project.members.push({ userId: manager._id, role: ROLES.MANAGER });
        await project.save();
      }
    }

    return { workspace, manager };
  }

  async inviteMember({ actorId, fullName, username, email, password, role }) {
    const actor = await User.findById(actorId);
    if (!actor || !actor.companyId) {
      const error = new Error("Invalid actor");
      error.status = 403;
      throw error;
    }

    if (![ROLES.ADMIN, ROLES.MANAGER].includes(actor.role)) {
      const error = new Error("Only admins or managers can invite members");
      error.status = 403;
      throw error;
    }

    if (actor.role === ROLES.MANAGER && ![ROLES.SENIOR, ROLES.JUNIOR].includes(role)) {
      const error = new Error("Managers can invite only Senior or Junior members");
      error.status = 403;
      throw error;
    }

    if (actor.role === ROLES.ADMIN && ![ROLES.MANAGER, ROLES.SENIOR, ROLES.JUNIOR].includes(role)) {
      const error = new Error("Admins can invite Manager, Senior, or Junior members");
      error.status = 400;
      throw error;
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      const error = new Error("Username or email already exists");
      error.status = 409;
      throw error;
    }

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role,
      companyId: actor.companyId,
      canReview: role === ROLES.SENIOR,
      canDeploy: false,
      canApproveDeployment: false,
    });

    return { user };
  }
}
