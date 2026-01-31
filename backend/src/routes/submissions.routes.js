import { Router } from "express";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.get("/", notImplemented("List submissions"));
router.post("/", notImplemented("Create submission"));
router.get("/:submissionId", notImplemented("Get submission"));
router.get("/:submissionId/diff", notImplemented("Get submission diff"));

export default router;
