import mongoose from "mongoose";
import { connectDatabase } from "./src/config/database.js";
import { logger } from "./src/config/logger.js";
import { Company } from "./src/models/Company.js";

const seedData = async () => {
  try {
    await connectDatabase();

    logger.info("🔄 Starting database seed process...");

    // Ensure company exists
    const existingCompany = await Company.findOne();

    if (existingCompany) {
      logger.info(`✅ Company exists: "${existingCompany.name}"`);
    } else {
      const company = await Company.create({
        name: "VIE Platform",
        slug: "vie-platform",
        timezone: "UTC",
        country: "Global",
        maxProjects: 100,
        maxUsers: 1000,
      });
      logger.info(`✅ Created company: "${company.name}"`);
    }

    logger.info("\n📌 Database initialization complete.");
    logger.info("ℹ️  Users must be created via the application's signup/invitation flow.");
    logger.info("🚀 Ready for development!\n");

    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
