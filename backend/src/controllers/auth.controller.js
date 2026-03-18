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
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body || {};

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "fullName, username, email, and password are required",
      });
    }

    const result = await authService.registerAdmin({
      fullName,
      username,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      data: {
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body || {};

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "fullName, username, email, and password are required",
      });
    }

    const result = await authService.register({
      fullName,
      username,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      data: {
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    const result = await authService.loginAdmin({ username, password });
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
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "refreshToken is required",
      });
    }

    const result = await authService.refreshToken(refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
