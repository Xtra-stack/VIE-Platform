import mongoose from "mongoose";
import { connectDatabase } from "./src/config/database.js";
import { logger } from "./src/config/logger.js";
import { Company } from "./src/models/Company.js";
import { User } from "./src/models/User.js";
import { Project } from "./src/models/Project.js";
import { InternalRepository } from "./src/models/InternalRepository.js";
import { CodeSubmission } from "./src/models/CodeSubmission.js";
import { Review } from "./src/models/Review.js";
import { ROLES } from "./src/constants/roles.js";
import { SUBMISSION_STATUS, REVIEW_STATUS } from "./src/constants/status.js";

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
    let manager1, senior1, junior1;

    if (existingUsers > 0) {
      logger.info(`Users already exist (${existingUsers} found). Skipping user creation.`);
      // Fetch users for demo workflow
      manager1 = await User.findOne({ username: "manager1" });
      senior1 = await User.findOne({ username: "senior1" });
      junior1 = await User.findOne({ username: "junior1" });
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
        if (user.username === "manager1") manager1 = user;
        if (user.username === "senior1") senior1 = user;
        if (user.username === "junior1") junior1 = user;
      }
    }

    logger.info("\nTest credentials:");
    logger.info("  Manager: manager1 / password123");
    logger.info("  Senior:  senior1  / password123");
    logger.info("  Junior:  junior1  / password123");
    logger.info("\nYou can now login via POST /auth/login");

    // ========== DEMO WORKFLOW SEEDING (Optional) ==========
    const demoMode = process.env.DEMO_SEED === "true";

    if (demoMode) {
      logger.info("\n========== DEMO MODE: Creating submission workflow ==========");

      // 1. Create or fetch project
      let project = await Project.findOne({ slug: "demo-project", companyId: company._id });

      if (!project) {
        logger.info("📁 Creating demo project...");
        project = await Project.create({
          name: "Demo Web App",
          slug: "demo-project",
          description: "Sample project for workflow demo",
          companyId: company._id,
          createdBy: manager1._id,
          members: [
            { userId: manager1._id, role: ROLES.MANAGER },
            { userId: senior1._id, role: ROLES.SENIOR },
            { userId: junior1._id, role: ROLES.JUNIOR },
          ],
          mainBranch: "main",
          branchProtection: {
            mainBranchLocked: true,
            requireReview: true,
            requiredReviewers: 1,
          },
          cicdEnabled: true,
          testCommand: "npm test",
          deploymentEnvironments: [
            { name: "staging", branch: "develop" },
            { name: "production", branch: "main" },
          ],
        });
        logger.info(`✓ Created demo project: ${project.name}`);
      } else {
        logger.info("📁 Demo project already exists, skipping creation.");
      }

      // 2. Create or fetch repository
      let repo = await InternalRepository.findOne({ projectId: project._id, isActive: true });

      if (!repo) {
        logger.info("🗂️  Creating internal repository...");
        repo = await InternalRepository.create({
          projectId: project._id,
          repositoryPath: `/repositories/acme-corp/demo-project`,
          defaultBranch: "main",
          isActive: true,
        });
        logger.info(`✓ Created repository at: ${repo.repositoryPath}`);
      } else {
        logger.info("🗂️  Repository already exists, skipping creation.");
      }

      // 3. Create or fetch submission
      let submission = await CodeSubmission.findOne({
        projectId: project._id,
        submittedBy: junior1._id,
        title: "Add user authentication feature",
      });

      if (!submission) {
        logger.info("📤 Creating sample submission by Junior...");
        submission = await CodeSubmission.create({
          projectId: project._id,
          repositoryId: repo._id,
          submittedBy: junior1._id,
          sourceBranch: "feature/auth-system",
          targetBranch: "develop",
          title: "Add user authentication feature",
          description: "Implements JWT-based user authentication with role-based access control.",
          status: SUBMISSION_STATUS.AWAITING_REVIEW,
          submittedAt: new Date(),
        });
        logger.info(`✓ Created submission: "${submission.title}" (ID: ${submission._id})`);
      } else {
        logger.info("📤 Submission already exists, skipping creation.");
      }

      // 4. Create or fetch Senior review
      let seniorReview = await Review.findOne({
        submissionId: submission._id,
        reviewerRole: ROLES.SENIOR,
      });

      if (!seniorReview) {
        logger.info("👁️  Creating Senior review...");
        seniorReview = await Review.create({
          submissionId: submission._id,
          projectId: project._id,
          reviewerId: senior1._id,
          reviewerRole: ROLES.SENIOR,
          status: REVIEW_STATUS.APPROVED,
          overallComment: "Great implementation! Code quality is excellent, tests are comprehensive.",
          inlineComments: [
            {
              lineNumber: 42,
              file: "src/auth/jwt.js",
              comment: "Consider adding token refresh logic for better UX.",
            },
          ],
          decision: "APPROVED",
          requestedAt: new Date(),
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(),
        });
        logger.info(`✓ Senior review created: APPROVED`);

        // Update submission status after Senior approval
        submission.status = SUBMISSION_STATUS.AWAITING_MANAGER_APPROVAL;
        await submission.save();
        logger.info(`✓ Submission status updated to: AWAITING_MANAGER_APPROVAL`);
      } else {
        logger.info("👁️  Senior review already exists, skipping creation.");
      }

      // 5. Create or fetch Manager review
      let managerReview = await Review.findOne({
        submissionId: submission._id,
        reviewerRole: ROLES.MANAGER,
      });

      if (!managerReview) {
        logger.info("✅ Creating Manager final review...");
        managerReview = await Review.create({
          submissionId: submission._id,
          projectId: project._id,
          reviewerId: manager1._id,
          reviewerRole: ROLES.MANAGER,
          status: REVIEW_STATUS.APPROVED,
          overallComment: "Approved for production deployment. Well done team!",
          decision: "APPROVED",
          requestedAt: new Date(Date.now() - 1800000),
          startedAt: new Date(Date.now() - 1800000),
          completedAt: new Date(),
        });
        logger.info(`✓ Manager review created: APPROVED`);

        // Update submission to MANAGER_APPROVED
        submission.status = SUBMISSION_STATUS.MANAGER_APPROVED;
        submission.resolvedAt = new Date();
        await submission.save();
        logger.info(`✓ Submission status updated to: MANAGER_APPROVED`);
      } else {
        logger.info("✅ Manager review already exists, skipping creation.");
      }

      logger.info("\n========== DEMO WORKFLOW COMPLETE ==========");
      logger.info("Submission Flow: JUNIOR → SENIOR → MANAGER");
      logger.info(`  Junior Submission: ${submission._id}`);
      logger.info(`  Senior Review: APPROVED`);
      logger.info(`  Manager Review: APPROVED`);
      logger.info(`  Final Status: ${submission.status}`);
    } else {
      logger.info("\n💡 Tip: Run with DEMO_SEED=true to create end-to-end submission workflow demo");
      logger.info("   Example: DEMO_SEED=true npm run seed");
    }

    logger.info("\nSeed completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
