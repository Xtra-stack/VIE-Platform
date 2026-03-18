import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import Unlockable from '../src/models/Unlockable.js';
import MentorshipFeedback from '../src/models/MentorshipFeedback.js';
import { User } from '../src/models/User.js';

const seed = async () => {
  try {
    await connectDatabase();
    logger.info('Seeding career unlockables and sample mentorship feedback...');

    const unlockables = [
      { key: 'extra_attempt', name: 'Extra Submission Attempt', description: 'One additional resubmission allowed without penalty', tags: ['resubmit'] },
      { key: 'private_reviewer', name: 'Private Reviewer', description: 'Request a private senior reviewer session', tags: ['review'] },
      { key: 'resume_review', name: 'Resume Review', description: 'Get a resume review session with a mentor', tags: ['career'] },
    ];

    for (const u of unlockables) {
      const exists = await Unlockable.findOne({ key: u.key });
      if (!exists) {
        await Unlockable.create(u);
        logger.info(`Created unlockable: ${u.key}`);
      } else {
        logger.info(`Unlockable exists: ${u.key}`);
      }
    }

    // Create sample mentorship feedback between two existing users if available
    const users = await User.find().limit(5).lean();
    if (users.length >= 2) {
      const mentor = users[0];
      const mentee = users[1];

      const sample = await MentorshipFeedback.create({
        mentorId: mentor._id,
        menteeId: mentee._id,
        criteria: { readability: 4, tests: 3, architecture: 4 },
        score: 3.66,
        comments: 'Good structure overall; add more unit tests for edge cases.'
      });

      logger.info('Created sample mentorship feedback:', sample._id);
    } else {
      logger.info('Not enough users found to create mentorship sample feedback. Create users first.');
    }

    logger.info('Seed complete.');
    process.exit(0);
  } catch (err) {
    logger.error('Seed failed', err);
    process.exit(1);
  }
};

seed();