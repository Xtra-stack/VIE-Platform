import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import companyRoutes from "./routes/companies.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import submissionRoutes from "./routes/submissions.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import deploymentRoutes from "./routes/deployments.routes.js";

const app = express();

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

app.use(errorHandler);

export default app;
