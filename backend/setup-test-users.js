import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from './src/config/env.js';
import { User } from './src/models/User.js';
import { Company } from './src/models/Company.js';

async function setupTestUsers() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('[INFO] Database connected.');

    // Get seeded company
    let company = await Company.findOne({ name: 'VIE Platform' });
    if (!company) {
      company = await Company.findOne();
    }
    if (!company) {
      console.log('[ERROR] Company not found. Run npm run seed first.');
      process.exit(1);
    }

    console.log('[INFO] Setting up test users...');

    // Create manager1
    const hashedManagerPwd = await bcrypt.hash('manager123', 10);
    const manager = await User.findOneAndUpdate(
      { username: 'manager1', email: 'manager1@company.com' },
      {
        username: 'manager1',
        email: 'manager1@company.com',
        password: hashedManagerPwd,
        fullName: 'Manager One',
        role: 'MANAGER',
        companyId: company._id,
        department: 'Management',
        isActive: true,
        firstLogin: false,
        mustChangePassword: false,
        canReview: false,
      },
      { upsert: true, new: true }
    );
    console.log('✅ Manager user created/updated:', manager.email);

    // Create senior1
    const hashedSeniorPwd = await bcrypt.hash('senior123', 10);
    const senior = await User.findOneAndUpdate(
      { username: 'senior1', email: 'senior1@company.com' },
      {
        username: 'senior1',
        email: 'senior1@company.com',
        password: hashedSeniorPwd,
        fullName: 'Senior Developer',
        role: 'SENIOR',
        companyId: company._id,
        department: 'Engineering',
        isActive: true,
        firstLogin: false,
        mustChangePassword: false,
        canReview: true,
      },
      { upsert: true, new: true }
    );
    console.log('✅ Senior user created/updated:', senior.email);

    // Create junior1
    const hashedJuniorPwd = await bcrypt.hash('junior123', 10);
    const junior = await User.findOneAndUpdate(
      { username: 'junior1', email: 'junior1@company.com' },
      {
        username: 'junior1',
        email: 'junior1@company.com',
        password: hashedJuniorPwd,
        fullName: 'Junior Developer',
        role: 'JUNIOR',
        companyId: company._id,
        department: 'Engineering',
        isActive: true,
        firstLogin: false,
        mustChangePassword: false,
        canReview: false,
      },
      { upsert: true, new: true }
    );
    console.log('✅ Junior user created/updated:', junior.email);

    console.log('\n✅ Test users ready!');
    console.log('\nTest Credentials:');
    console.log('  Manager: manager1 / manager123');
    console.log('  Senior:  senior1 / senior123');
    console.log('  Junior:  junior1 / junior123');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

setupTestUsers();
