import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  serverUrl: process.env.SERVER_URL || "http://localhost:3000",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/vie",
  jwtSecret: process.env.JWT_SECRET || "change-me",
};
