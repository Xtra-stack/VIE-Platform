import { User } from "../models/User.js";
import { signRefreshToken, signToken, verifyRefreshToken } from "../utils/jwt.js";
import { CompanyService } from "./company.service.js";
import { ROLES } from "../constants/roles.js";

export class AuthService {
  constructor() {
    this.companyService = new CompanyService();
  }

  async login({ username, password }) {
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true,
    });

    if (!user) {
      return null;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return null;
    }

    user.lastLogin = new Date();
    await user.save();

    if (user.companyId) {
      await this.companyService.ensureTrialStatus(user.companyId);
    }

    const token = signToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : null,
    });

    const refreshToken = signRefreshToken({
      id: user._id.toString(),
      type: "refresh",
    });

    return { user, token, refreshToken };
  }

  async registerAdmin({ fullName, username, email, password }) {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const error = new Error("Username or email already exists");
      error.status = 409;
      throw error;
    }

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role: ROLES.ADMIN,
      isActive: true,
      canReview: false,
      canDeploy: false,
      canApproveDeployment: false,
    });

    const token = signToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: null,
    });

    const refreshToken = signRefreshToken({
      id: user._id.toString(),
      type: "refresh",
    });

    return { user, token, refreshToken };
  }

  async register({ fullName, username, email, password }) {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const error = new Error("Username or email already exists");
      error.status = 409;
      throw error;
    }

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role: ROLES.JUNIOR,
      isActive: true,
      canReview: false,
      canDeploy: false,
      canApproveDeployment: false,
    });

    const token = signToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: null,
    });

    const refreshToken = signRefreshToken({
      id: user._id.toString(),
      type: "refresh",
    });

    return { user, token, refreshToken };
  }

  async loginAdmin({ username, password }) {
    const result = await this.login({ username, password });
    if (!result) {
      return null;
    }

    if (result.user.role !== ROLES.ADMIN) {
      const error = new Error("Admin credentials required");
      error.status = 403;
      throw error;
    }

    return result;
  }

  async getCurrentUser(userId) {
    const user = await User.findOne({ _id: userId, isActive: true });
    if (!user) {
      return null;
    }

    if (user.companyId) {
      await this.companyService.ensureTrialStatus(user.companyId);
    }

    return user;
  }

  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded?.type !== "refresh" || !decoded?.id) {
      const error = new Error("Invalid refresh token");
      error.status = 401;
      throw error;
    }

    const user = await User.findOne({ _id: decoded.id, isActive: true });
    if (!user) {
      const error = new Error("Invalid refresh token");
      error.status = 401;
      throw error;
    }

    const token = signToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : null,
    });

    const newRefreshToken = signRefreshToken({
      id: user._id.toString(),
      type: "refresh",
    });

    return {
      token,
      refreshToken: newRefreshToken,
      user,
    };
  }
}
