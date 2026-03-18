import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiry });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiry });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};
