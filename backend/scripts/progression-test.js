import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../src/models/User.js';
import Skill from '../src/models/Skill.js';
import ProgressionService from '../src/services/progression.service.js';

async function run() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/vie-dev';
  await mongoose.connect(mongoUrl, { autoIndex: true });
  console.log('Connected to DB for progression test');

  // Create a test user
  const user = await User.create({
    username: `prog_test_${Date.now()}`,
    email: `prog_test_${Date.now()}@example.com`,
    fullName: 'Progression Test User',
    password: 'TestPass123!',
    role: 'JUNIOR',
    isActive: true
  });

  // Seed skills with high XP to trigger promotion
  const skills = await Promise.all([
    Skill.create({ userId: user._id, skillName: 'Backend Development', xp: 500, level: 3, approvalRate: 80 }),
    Skill.create({ userId: user._id, skillName: 'API Development', xp: 500, level: 3, approvalRate: 80 })
  ]);

  console.log('Seeded user and skills. Evaluating promotion...');

  const result = await ProgressionService.evaluatePromotion(user._id);
  console.log('Promotion result:', result);

  // Reload user
  const updated = await User.findById(user._id);
  console.log('Updated user role:', updated.role);

  // Cleanup
  await Skill.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(user._id);

  await mongoose.disconnect();
  console.log('Progression test complete');
}

run().catch((err) => {
  console.error('Progression test failed:', err);
  process.exit(1);
});
