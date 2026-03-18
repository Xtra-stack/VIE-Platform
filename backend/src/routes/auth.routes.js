import { Router } from "express";
import { login, loginAdmin, logout, me, refresh, register, registerAdmin } from "../controllers/auth.controller.js";
import { getUserActivity } from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.get("/activity", requireAuth, getUserActivity);

export default router;
