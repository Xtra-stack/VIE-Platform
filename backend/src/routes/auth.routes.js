import { Router } from "express";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.post("/register", notImplemented("Auth register"));
router.post("/login", notImplemented("Auth login"));
router.post("/logout", notImplemented("Auth logout"));
router.post("/refresh", notImplemented("Auth refresh"));

export default router;
