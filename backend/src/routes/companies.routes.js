import { Router } from "express";
import { createCompany, getCompany, listCompanies, completeTrial } from "../controllers/company.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireMinRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/", requireAuth, listCompanies);
router.post("/", requireAuth, requireMinRole(ROLES.MANAGER), createCompany);
router.get("/:companyId", requireAuth, getCompany);
router.post("/:companyId/trial/complete", requireAuth, requireMinRole(ROLES.ADMIN), completeTrial);

export default router;
