import { Router } from "express";
import { approveReview, listReviews, rejectReview } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/", requireAuth, listReviews);
router.post("/:submissionId/approve", requireAuth, requireRole(ROLES.SENIOR), approveReview);
router.post("/:submissionId/reject", requireAuth, requireRole(ROLES.SENIOR), rejectReview);

router.post("/:submissionId/manager/approve", requireAuth, requireRole(ROLES.MANAGER), approveReview);
router.post("/:submissionId/manager/reject", requireAuth, requireRole(ROLES.MANAGER), rejectReview);

export default router;
