import { Router } from "express";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.get("/", notImplemented("List reviews"));
router.post("/:submissionId/approve", notImplemented("Approve submission"));
router.post("/:submissionId/reject", notImplemented("Reject submission"));

export default router;
