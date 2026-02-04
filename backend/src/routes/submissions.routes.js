import { Router } from "express";
import { createSubmission, getSubmission, listSubmissions, mergeSubmission, deploySubmission, resubmitSubmission } from "../controllers/submission.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";
import { notImplemented } from "../utils/notImplemented.js";
import { ActivityLogService } from "../services/activitylog.service.js";

const router = Router();
const activityLogService = new ActivityLogService();

router.get("/", requireAuth, listSubmissions);
router.post("/", requireAuth, requireRole(ROLES.JUNIOR), createSubmission);
router.get("/:submissionId", requireAuth, getSubmission);
router.post("/:submissionId/resubmit", requireAuth, requireRole(ROLES.JUNIOR), resubmitSubmission);
router.post("/:submissionId/merge", requireAuth, requireRole(ROLES.MANAGER), mergeSubmission);
router.post("/:submissionId/deploy", requireAuth, requireRole(ROLES.MANAGER), deploySubmission);
router.get("/:submissionId/activity", requireAuth, async (req, res, next) => {
  try {
    const activity = await activityLogService.getActivityLog(req.params.submissionId);
    return res.status(200).json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
});
router.get("/:submissionId/diff", requireAuth, notImplemented("Get submission diff"));

export default router;
