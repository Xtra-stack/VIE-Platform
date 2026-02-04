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

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "vie-backend",
  });
});

app.use("/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/builds", buildsRoutes);
app.use("/api/workspaces", workspaceRoutes);

app.use(errorHandler);

export default app;
