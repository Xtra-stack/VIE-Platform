import { Router } from "express";
import { notImplemented } from "../utils/notImplemented.js";

const router = Router();

router.get("/", notImplemented("List projects"));
router.post("/", notImplemented("Create project"));
router.get("/:projectId", notImplemented("Get project"));
router.get("/:projectId/branches", notImplemented("List branches"));
router.post("/:projectId/branches", notImplemented("Create branch"));
router.delete("/:projectId/branches/:branchName", notImplemented("Delete branch"));

export default router;
