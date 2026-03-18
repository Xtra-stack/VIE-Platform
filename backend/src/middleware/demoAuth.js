import { demoTrialService } from "../services/demoTrial.service.js";

export const requireDemoAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Demo token missing",
    });
  }

  const session = demoTrialService.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: "Demo session expired or invalid",
    });
  }

  req.demo = {
    token,
    user: session.user,
  };
  return next();
};
