import { Router } from "express";
import { createCompany, getCompany, listCompanies } from "../controllers/company.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/", requireAuth, listCompanies);
router.post("/", requireAuth, requireRole(ROLES.MANAGER), createCompany);
router.get("/:companyId", requireAuth, getCompany);

export default router;
