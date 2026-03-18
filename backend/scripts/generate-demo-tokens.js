import { connectDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';
import { User } from '../src/models/User.js';
import { signToken, signRefreshToken } from '../src/utils/jwt.js';

const USERS = ['admin_demo', 'manager_demo', 'senior_demo', 'junior_demo'];

const run = async () => {
  try {
    await connectDatabase();
    logger.info('Connected DB for token generation');

    for (const username of USERS) {
      const user = await User.findOne({ username }).lean();
      if (!user) {
        logger.warn(`User not found: ${username}`);
        continue;
      }

      const payload = {
        id: String(user._id),
        username: user.username,
        role: user.role,
        companyId: user.companyId ? String(user.companyId) : null,
      };

      const token = signToken(payload);
      const refreshToken = signRefreshToken({ id: String(user._id), type: 'refresh' });

      console.log('---');
      console.log(`username: ${user.username}`);
      console.log(`role: ${user.role}`);
      console.log(`token: ${token}`);
      console.log(`refreshToken: ${refreshToken}`);
    }

    process.exit(0);
  } catch (err) {
    logger.error('Token generation failed', err);
    process.exit(1);
  }
};

run();
