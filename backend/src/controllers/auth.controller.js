import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    const result = await authService.login({ username, password });

    if (!result) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};
