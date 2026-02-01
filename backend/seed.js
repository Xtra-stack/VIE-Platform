import mongoose from "mongoose";
import { connectDatabase } from "./src/config/database.js";
import { logger } from "./src/config/logger.js";
import { Company } from "./src/models/Company.js";
import { User } from "./src/models/User.js";
import { ROLES } from "./src/constants/roles.js";

const seedData = async () => {
  try {
    await connectDatabase();

    logger.info("Starting seed process...");

    // Check if company exists
    const existingCompany = await Company.findOne();
    let company;

    if (existingCompany) {
      logger.info(`Company already exists: ${existingCompany.name}`);
      company = existingCompany;
    } else {
      company = await Company.create({
        name: "Acme Corp",
        slug: "acme-corp",
        timezone: "America/Los_Angeles",
        country: "USA",
        maxProjects: 10,
        maxUsers: 100,
      });
      logger.info(`✓ Created company: ${company.name}`);
    }

    // Check if users exist
    const existingUsers = await User.countDocuments();

    if (existingUsers > 0) {
      logger.info(`Users already exist (${existingUsers} found). Skipping user creation.`);
    } else {
      const users = [
        {
          username: "manager1",
          email: "manager@acme.com",
          password: "password123",
          fullName: "Alex Manager",
          role: ROLES.MANAGER,
          companyId: company._id,
          department: "Engineering",
          canReview: true,
          canDeploy: true,
          canApproveDeployment: true,
        },
        {
          username: "senior1",
          email: "senior@acme.com",
          password: "password123",
          fullName: "Sarah Senior",
          role: ROLES.SENIOR,
          companyId: company._id,
          department: "Engineering",
          canReview: true,
          canDeploy: false,
          canApproveDeployment: false,
        },
        {
          username: "junior1",
          email: "junior@acme.com",
          password: "password123",
          fullName: "Jamie Junior",
          role: ROLES.JUNIOR,
          companyId: company._id,
          department: "Engineering",
          canReview: false,
          canDeploy: false,
          canApproveDeployment: false,
        },
      ];

      for (const userData of users) {
        const user = await User.create(userData);
        logger.info(`✓ Created user: ${user.username} (${user.role})`);
      }
    }

    logger.info("\nSeed completed successfully!");
    logger.info("\nTest credentials:");
    logger.info("  Manager: manager1 / password123");
    logger.info("  Senior:  senior1  / password123");
    logger.info("  Junior:  junior1  / password123");
    logger.info("\nYou can now login via POST /auth/login");

    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
