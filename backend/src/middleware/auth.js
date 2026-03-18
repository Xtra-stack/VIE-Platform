import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authorization token missing",
    });
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id)
      .select("_id username role companyId isActive")
      .lean();

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};
