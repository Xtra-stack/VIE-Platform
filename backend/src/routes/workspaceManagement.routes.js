import express from "express";
import {
  createProjectWorkspace,
  uploadWorkspaceBaseCode,
  listWorkspaces,
  getWorkspaceDetails,
  getMyTasks,
  updateTask,
  getBaseCodeFiles,
  getWorkingCopyFiles,
  updateWorkingFile,
} from "../controllers/workspaceManagement.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Workspace management (Manager only)
router.post("/", createProjectWorkspace);
router.post("/:workspaceId/base-code", uploadWorkspaceBaseCode);
router.get("/", listWorkspaces);
router.get("/:workspaceId", getWorkspaceDetails);

// Task management
router.get("/tasks/my-tasks", getMyTasks);
router.patch("/tasks/:taskId", updateTask);

// File access
router.get("/:workspaceId/base-code-files", getBaseCodeFiles);
router.get("/:workspaceId/working-copy-files", getWorkingCopyFiles);
router.patch("/:workspaceId/working-files", updateWorkingFile);

export default router;
