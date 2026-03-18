import { Router } from "express";
import { getDemoState, startDemoTrial, submitDemoTask } from "../controllers/demoTrial.controller.js";
import { requireDemoAuth } from "../middleware/demoAuth.js";

const router = Router();

router.post("/start", startDemoTrial);
router.get("/state", requireDemoAuth, getDemoState);
router.post("/tasks/:taskId/submit", requireDemoAuth, submitDemoTask);

export default router;
