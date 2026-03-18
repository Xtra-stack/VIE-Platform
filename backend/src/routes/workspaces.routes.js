import { Router } from "express";
import {
	createWorkspace,
	inviteUser,
	createInviteCode,
	joinOrganizationByInvite,
} from "../controllers/workspace.controller.js";
import { getWorkspaceActivity, getTeamStatus, getActivityStats, getUserActivity } from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireMinRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post("/", createWorkspace);
router.post("/join/:inviteCode", joinOrganizationByInvite);
router.post("/:companyId/invite", requireAuth, requireMinRole(ROLES.MANAGER), inviteUser);
router.post("/:companyId/invite-code", requireAuth, requireMinRole(ROLES.MANAGER), createInviteCode);

// Activity tracking routes
router.get("/:workspaceId/activity", requireAuth, getWorkspaceActivity);
router.get("/:workspaceId/team-status", requireAuth, getTeamStatus);
router.get("/:workspaceId/activity-stats", requireAuth, getActivityStats);

export default router;
