import { logger } from '../config/logger.js';
import { User } from '../models/User.js';
import CodeSnapshot from '../models/CodeSnapshot.js';
import TerminalLog from '../models/TerminalLog.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import Skill from '../models/Skill.js';
import crypto from 'crypto';

class CodingService {
  /**
   * Execute simulated terminal command
   * Returns realistic fake output based on command type
   */
  static async executeSimulatedCommand(userId, workspaceId, command, sessionId) {
    try {
      const { output, exitCode, commandType, executionTime } = this._generateFakeOutput(command);

      // Log the command
      const terminalLog = await TerminalLog.create({
        userId,
        workspaceId,
        command,
        output,
        commandType,
        exitCode,
        success: exitCode === 0,
        executionTimeMs: executionTime,
        sessionId,
        isSimulated: true,
      });

      logger.info(`[CodingService] Simulated command executed: ${command}`, {
        userId,
        sessionId,
        exitCode,
      });

      return {
        command,
        output,
        exitCode,
        success: exitCode === 0,
        executionTimeMs: executionTime,
        terminalLogId: terminalLog._id,
      };
    } catch (error) {
      logger.error('[CodingService] Error executing simulated command', {
        error: error.message,
        userId,
        command,
      });
      throw error;
    }
  }

  /**
   * Generate realistic fake output based on command
   * Supports npm, git, build, test, deploy commands
   */
  static _generateFakeOutput(command) {
    const lower = command.toLowerCase().trim();
    const executionTime = Math.random() * 3000 + 500; // 500-3500ms

    // npm commands
    if (lower.startsWith('npm install') || lower.startsWith('npm i')) {
      return {
        output: `
added 142 packages, and audited 145 packages in 2s

6 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities`,
        exitCode: 0,
        commandType: 'npm',
        executionTime: Math.random() * 4000 + 1000,
      };
    }

    if (lower.startsWith('npm start') || lower.startsWith('npm run dev')) {
      return {
        output: `
> vie-backend@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.0.1
[nodemon] to restart at any time, enter \`rs\`
[nodemon] watching path(s): src/**
[nodemon] watching extensions: js,json
[nodemon] starting \`node src/server.js\`
[VIE Server] 🚀 Server running on configured PORT
[VIE Server] 📡 Database connected`,
        exitCode: 0,
        commandType: 'npm',
        executionTime: 1200,
      };
    }

    if (lower.startsWith('npm run build')) {
      return {
        output: `
> vie-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.js     245.67 kB │ gzip: 78.92 kB

✓ built in 3.45s`,
        exitCode: 0,
        commandType: 'build',
        executionTime: 3450,
      };
    }

    if (lower.startsWith('npm test')) {
      return {
        output: `
PASS  src/__tests__/user.test.js
  User Service
    ✓ creates new user (125ms)
    ✓ validates email format (34ms)
    ✓ hashes password correctly (89ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Execution:   1.234s`,
        exitCode: 0,
        commandType: 'test',
        executionTime: 1234,
      };
    }

    // git commands
    if (lower.startsWith('git clone')) {
      return {
        output: `Cloning into 'repository'...
remote: Enumerating objects: 1234, done.
remote: Counting objects: 100% (1234/1234), done.
remote: Compressing objects: 100% (456/456), done.
remote: Total 1234 (delta 789), reused 1000 (delta 700)
Receiving objects: 100% (1234/1234), 2.34 MiB | 5.67 MiB/s, done.
Resolving deltas: 100% (789/789), done.`,
        exitCode: 0,
        commandType: 'git',
        executionTime: 2340,
      };
    }

    if (lower.startsWith('git commit')) {
      return {
        output: `[main a1b2c3d] Fix authentication logic
 2 files changed, 45 insertions(+), 12 deletions(-)`,
        exitCode: 0,
        commandType: 'git',
        executionTime: 234,
      };
    }

    if (lower.startsWith('git push')) {
      return {
        output: `Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Delta compression using up to 8 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 534 bytes | 534.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1/1), done.
To github.com:user/repo.git
   a1b2c3d..e1f2g3h  main -> main`,
        exitCode: 0,
        commandType: 'git',
        executionTime: 1567,
      };
    }

    if (lower.startsWith('git status')) {
      return {
        output: `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`,
        exitCode: 0,
        commandType: 'git',
        executionTime: 123,
      };
    }

    // Deploy command
    if (lower.startsWith('npm run deploy') || lower === 'deploy') {
      return {
        output: `
Deploying application...
✓ Building assets
✓ Running migrations
✓ Deploying to production
✓ Health check passed

Deployment successful! 🎉
App running at: https://vie-app.vercel.app`,
        exitCode: 0,
        commandType: 'deploy',
        executionTime: 5600,
      };
    }

    // Default: unknown command
    return {
      output: `command not found: ${command}`,
      exitCode: 127,
      commandType: 'general',
      executionTime: 100,
    };
  }

  /**
   * Save code submission with skill updates
   */
  static async submitCode(userId, projectId, codeContent, language, fileName) {
    try {
      // Create code snapshot
      const checksumHash = crypto
        .createHash('sha256')
        .update(codeContent)
        .digest('hex');

      const codeSnapshot = await CodeSnapshot.create({
        userId,
        workspaceId: projectId, // Simplified for MVP
        code: codeContent,
        language,
        fileName,
        checksumHash,
        lineCount: codeContent.split('\n').length,
      });

      logger.info('[CodingService] Code snapshot created', {
        userId,
        snapshotId: codeSnapshot._id,
        language,
      });

      return {
        success: true,
        codeSnapshotId: codeSnapshot._id,
        lineCount: codeSnapshot.lineCount,
      };
    } catch (error) {
      logger.error('[CodingService] Error submitting code', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Award XP to user skills based on submission approval
   */
  static async updateSkillsFromApproval(submissionId, approvalRate = 100) {
    try {
      const submission = await CodeSubmission.findById(submissionId).populate('submittedBy projectId');

      if (!submission) {
        throw new Error('Submission not found');
      }

      const userId = submission.submittedBy._id;
      const baseXP = Math.round((approvalRate / 100) * 50); // Max 50 XP per approval

      // Map project/skill relationship (simplified; in production, use task.skillsRequired)
      const skillsToUpdate = [
        'Backend',
        'API Development',
        'Testing'
      ];

      const skillUpdates = [];

      for (const skillName of skillsToUpdate) {
        const skill = await Skill.findOne({ userId, skillName });

        if (skill) {
          const levelBefore = skill.level;
          const result = skill.awardXP(baseXP, 'task_completion');

          await skill.save();

          skillUpdates.push({
            skillName,
            xpAwarded: baseXP,
            levelBefore,
            levelAfter: skill.level,
            leveledUp: result.leveledUp,
          });

          logger.info('[CodingService] Skill XP awarded', {
            userId,
            skillName,
            xpAwarded: baseXP,
            newLevel: skill.level,
          });
        }
      }

      // Update submission with skill tracking
      submission.skillsAffected = skillUpdates;
      await submission.save();

      return {
        success: true,
        skillsUpdated: skillUpdates,
        totalXpAwarded: baseXP * skillsToUpdate.length,
      };
    } catch (error) {
      logger.error('[CodingService] Error updating skills', {
        error: error.message,
        submissionId,
      });
      throw error;
    }
  }

  /**
   * Get user's skill progress
   */
  static async getUserSkills(userId) {
    try {
      const skills = await Skill.find({ userId }).sort({ level: -1, xp: -1 });

      const skillsWithProgress = skills.map((skill) => ({
        _id: skill._id,
        skillName: skill.skillName,
        level: skill.level,
        xp: skill.xp,
        nextLevelXp: skill.nextLevelXp,
        progressPercent: skill.getProgressPercent(),
        approvalRate: skill.approvalRate,
        taskCount: skill.taskCount,
        growthHistory: skill.growthHistory.slice(-10), // Last 10 entries
      }));

      return {
        success: true,
        skills: skillsWithProgress,
        totalXp: skills.reduce((sum, s) => sum + s.xp, 0),
        maxLevel: Math.max(...skills.map((s) => s.level), 0),
      };
    } catch (error) {
      logger.error('[CodingService] Error fetching user skills', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get terminal history for user
   */
  static async getTerminalHistory(userId, workspaceId, limit = 50) {
    try {
      const history = await TerminalLog.find({
        userId,
        workspaceId,
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        history: history.reverse(), // Return in chronological order
        count: history.length,
      };
    } catch (error) {
      logger.error('[CodingService] Error fetching terminal history', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }
}

export default CodingService;
