import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("Database connected.");
    return true;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};
