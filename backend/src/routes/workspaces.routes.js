import { Router } from "express";
import { createWorkspace, inviteUser } from "../controllers/workspace.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post("/", createWorkspace);
router.post("/:companyId/invite", requireAuth, requireRole(ROLES.MANAGER), inviteUser);

export default router;
