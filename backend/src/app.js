import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/companies.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import submissionRoutes from "./routes/submissions.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import deploymentRoutes from "./routes/deployments.routes.js";
import buildsRoutes from "./routes/builds.routes.js";
import workspaceRoutes from "./routes/workspaces.routes.js";
import workspaceManagementRoutes from "./routes/workspaceManagement.routes.js";
import demoTrialRoutes from "./routes/demoTrial.routes.js";
import realWorkspaceRoutes from "./routes/realWorkspace.routes.js";
import skillsRoutes from "./routes/skills.routes.js";
import codeEditorRoutes from "./routes/codeEditor.routes.js";
import codeReviewRoutes from "./routes/codeReview.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import codingRoutes from "./routes/coding.routes.js";
import progressionRoutes from "./routes/progression.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import templateRoutes from "./routes/template.routes.js";
import careerRoutes from "./routes/career.routes.js";
import mentorshipRoutes from "./routes/mentorship.routes.js";

const app = express();
const clientOrigin = process.env.CLIENT_URL || "*";
app.use(cors({
  origin: clientOrigin,
  credentials: clientOrigin !== "*",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "vie-backend",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/builds", buildsRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/project-workspaces", workspaceManagementRoutes);
app.use("/api/demo-trial", demoTrialRoutes);
app.use("/api/real-workspace", realWorkspaceRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/code-editor", codeEditorRoutes);
app.use("/api/code-review", codeReviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/progression", progressionRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/mentorship", mentorshipRoutes);

app.use(errorHandler);

export default app;
