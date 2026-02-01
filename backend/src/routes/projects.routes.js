import { Router } from "express";
import { addProjectMember, createProject, getProject, listProjects } from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.get("/", requireAuth, listProjects);
router.post("/", requireAuth, requireRole(ROLES.MANAGER), createProject);
router.get("/:projectId", requireAuth, getProject);
router.post("/:projectId/members", requireAuth, requireRole(ROLES.MANAGER), addProjectMember);

router.get("/:projectId/branches", requireAuth, notImplemented("List branches"));
router.post("/:projectId/branches", requireAuth, notImplemented("Create branch"));
router.delete("/:projectId/branches/:branchName", requireAuth, notImplemented("Delete branch"));

export default router;
