import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';
import { ROLES } from '../src/constants/roles.js';

const seed = async () => {
  try {
    await connectDatabase();
    logger.info('Seeding demo users...');

    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({ name: 'VIE Platform', slug: 'vie-platform' });
      logger.info('Created fallback company');
    }

    const demoUsers = [
      { username: 'admin_demo', email: 'admin@vie.local', fullName: 'Admin Demo', password: 'Password123!', role: ROLES.ADMIN, companyId: company._id, canReview: true, canApproveDeployment: true },
      { username: 'manager_demo', email: 'manager@vie.local', fullName: 'Manager Demo', password: 'Password123!', role: ROLES.MANAGER, companyId: company._id, canReview: true },
      { username: 'senior_demo', email: 'senior@vie.local', fullName: 'Senior Demo', password: 'Password123!', role: ROLES.SENIOR, companyId: company._id, canReview: true },
      { username: 'junior_demo', email: 'junior@vie.local', fullName: 'Junior Demo', password: 'Password123!', role: ROLES.JUNIOR, companyId: company._id },
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ $or: [{ username: u.username }, { email: u.email }] });
      if (exists) {
        logger.info(`User exists: ${u.username} (${u.email})`);
        continue;
      }

      const created = await User.create(u);
      logger.info(`Created demo user: ${created.username} (${created.role})`);
    }

    logger.info('Demo users seed complete.');
    process.exit(0);
  } catch (err) {
    logger.error('Failed to seed demo users', err);
    process.exit(1);
  }
};

seed();
