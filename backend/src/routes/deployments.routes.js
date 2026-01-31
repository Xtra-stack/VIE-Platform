import { Router } from "express";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.get("/", notImplemented("List deployments"));
router.get("/:deploymentId", notImplemented("Get deployment"));
router.post("/:submissionId/deploy", notImplemented("Create deployment"));

export default router;
