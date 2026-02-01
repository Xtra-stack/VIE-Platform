import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export class AuthService {
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

    const token = signToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return { user, token };
  }
}
