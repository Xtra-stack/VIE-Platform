import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || env.mongoUri;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not set. Please add it to backend/.env or deployment environment variables.");
  }

  if (mongoUri.includes("<db_password>")) {
    throw new Error("MONGO_URI contains <db_password>. Replace it with your actual MongoDB Atlas password.");
  }

  try {
    await mongoose.connect(mongoUri);
    logger.info("Database connected successfully.");
    return true;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};
