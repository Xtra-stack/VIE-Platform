import { Router } from "express";
import { createSubmission, getSubmission, listSubmissions } from "../controllers/submission.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.get("/", requireAuth, listSubmissions);
router.post("/", requireAuth, requireRole(ROLES.JUNIOR), createSubmission);
router.get("/:submissionId", requireAuth, getSubmission);
router.get("/:submissionId/diff", requireAuth, notImplemented("Get submission diff"));

export default router;
