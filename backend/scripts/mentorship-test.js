import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { User } from '../src/models/User.js';
import * as MentorshipService from '../src/services/mentorship.service.js';

const run = async () => {
  try {
    await connectDatabase();
    logger.info('Connected DB for mentorship test');

    // Ensure two users exist
    let users = await User.find().limit(2).lean();
    if (!users || users.length < 2) {
      // Create test users
      const u1 = await User.create({ fullName: 'Mentor Test', username: 'mentor_test', email: 'mentor@test.local', password: 'password123', role: 'SENIOR' });
      const u2 = await User.create({ fullName: 'Mentee Test', username: 'mentee_test', email: 'mentee@test.local', password: 'password123', role: 'JUNIOR' });
      users = [u1, u2];
      logger.info('Created test users');
    }

    const mentor = users[0];
    const mentee = users[1];

    const feedback = await MentorshipService.createFeedback({ mentorId: String(mentor._id), menteeId: String(mentee._id), criteria: { readability: 4, tests: 4, architecture: 3 }, comments: 'Nice job in structure; add tests.' });

    if (feedback && feedback._id) {
      logger.info('Mentorship test succeeded. Feedback id: ' + feedback._id);
      process.exit(0);
    }

    logger.error('Mentorship test failed: no feedback created');
    process.exit(2);
  } catch (err) {
    logger.error('Mentorship test error', err);
    process.exit(1);
  }
};

run();
