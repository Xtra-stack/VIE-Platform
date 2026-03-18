import { Router } from "express";
import {
  assignManager,
  createOrganization,
  createWorkspace,
  inviteMember,
} from "../controllers/realWorkspace.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post("/organization", requireAuth, requireRole([ROLES.ADMIN]), createOrganization);
router.post("/workspaces", requireAuth, requireRole([ROLES.ADMIN]), createWorkspace);
router.post("/workspaces/:workspaceId/assign-manager", requireAuth, requireRole([ROLES.ADMIN]), assignManager);
router.post("/members/invite", requireAuth, requireRole([ROLES.ADMIN, ROLES.MANAGER]), inviteMember);

export default router;
