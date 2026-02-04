import BuildLog from '../models/BuildLog.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import { ActivityLogService } from './activitylog.service.js';

const activityLogService = new ActivityLogService();

class BuildService {
  /**
   * Trigger a build for a code submission
   */
  async triggerBuild(submissionId, userId, buildType = 'FULL') {
    try {
      // Create build log entry
      const buildLog = new BuildLog({
        submissionId,
        buildType,
        status: 'QUEUED'
      });
      await buildLog.save();

      // Update submission with build reference
      await CodeSubmission.findByIdAndUpdate(submissionId, {
        buildStatus: 'RUNNING',
        buildStartedAt: new Date(),
        $push: { buildLogs: buildLog._id }
      });

      // Log activity
      await activityLogService.logAction({
        actorId: userId,
        actorRole: 'JUNIOR_DEV',
        actionType: 'BUILD_STARTED',
        entityType: 'BUILD',
        entityId: buildLog._id,
        message: `Build ${buildType} started for submission`,
        details: { submissionId, buildType }
      });

      // Start async build (simulated)
      this.runBuild(buildLog._id, submissionId, buildType);

      return buildLog;
    } catch (error) {
      console.error('Failed to trigger build:', error);
      throw error;
    }
  }

  /**
   * Simulate running a build (runs asynchronously)
   */
  async runBuild(buildLogId, submissionId, buildType) {
    const buildLog = await BuildLog.findById(buildLogId);
    if (!buildLog) return;

    try {
      await buildLog.start();

      // Simulate build time (2-5 seconds)
      const buildTime = Math.floor(Math.random() * 3000) + 2000;
      await this.delay(buildTime);

      // Simulate build steps
      const logs = this.generateBuildLogs(buildType);
      
      // Randomly determine success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;

      // Generate test results if applicable
      let testResults = null;
      if (buildType === 'TEST' || buildType === 'FULL') {
        testResults = this.generateTestResults(isSuccess);
      }

      // Complete build
      await buildLog.complete(isSuccess, logs, testResults);

      // Update submission
      await CodeSubmission.findByIdAndUpdate(submissionId, {
        buildStatus: isSuccess ? 'SUCCESS' : 'FAILED',
        buildCompletedAt: new Date(),
        testResults: testResults
      });

      // Log activity
      await activityLogService.logAction({
        actorId: null,
        actorRole: 'SYSTEM',
        actionType: isSuccess ? 'BUILD_SUCCESS' : 'BUILD_FAILED',
        entityType: 'BUILD',
        entityId: buildLogId,
        message: `Build ${isSuccess ? 'completed successfully' : 'failed'}`,
        details: { submissionId, buildType, duration: buildLog.duration }
      });

    } catch (error) {
      console.error('Build execution failed:', error);
      await buildLog.fail(error.message, 'Build process encountered an error');
      
      await CodeSubmission.findByIdAndUpdate(submissionId, {
        buildStatus: 'FAILED',
        buildCompletedAt: new Date()
      });
    }
  }

  /**
   * Get build logs for a submission
   */
  async getBuildLogs(submissionId) {
    return await BuildLog.find({ submissionId }).sort({ createdAt: -1 });
  }

  /**
   * Get specific build log
   */
  async getBuildLog(buildLogId) {
    return await BuildLog.findById(buildLogId);
  }

  /**
   * Retry a failed build
   */
  async retryBuild(buildLogId, userId) {
    const oldBuild = await BuildLog.findById(buildLogId);
    if (!oldBuild) {
      throw new Error('Build log not found');
    }

    return await this.triggerBuild(
      oldBuild.submissionId,
      userId,
      oldBuild.buildType
    );
  }

  // Helper methods

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateBuildLogs(buildType) {
    const timestamp = () => new Date().toISOString();
    
    let logs = `[${timestamp()}] Starting ${buildType} build...\n`;
    logs += `[${timestamp()}] Node version: v18.17.0\n`;
    logs += `[${timestamp()}] NPM version: 9.6.7\n`;
    logs += `[${timestamp()}] ────────────────────────────────\n\n`;

    if (buildType === 'BUILD' || buildType === 'FULL') {
      logs += `[${timestamp()}] 📦 Installing dependencies...\n`;
      logs += `[${timestamp()}] ✓ Dependencies installed (234 packages)\n`;
      logs += `[${timestamp()}] ────────────────────────────────\n\n`;
      
      logs += `[${timestamp()}] 🔨 Compiling source code...\n`;
      logs += `[${timestamp()}] ✓ Compiled successfully\n`;
      logs += `[${timestamp()}] ✓ Generated 3 bundles\n`;
      logs += `[${timestamp()}]   - main.js (245 KB)\n`;
      logs += `[${timestamp()}]   - vendor.js (892 KB)\n`;
      logs += `[${timestamp()}]   - styles.css (34 KB)\n`;
      logs += `[${timestamp()}] ────────────────────────────────\n\n`;
    }

    if (buildType === 'LINT' || buildType === 'FULL') {
      logs += `[${timestamp()}] 🔍 Running linter...\n`;
      logs += `[${timestamp()}] ✓ No linting errors found\n`;
      logs += `[${timestamp()}] ────────────────────────────────\n\n`;
    }

    if (buildType === 'TEST' || buildType === 'FULL') {
      logs += `[${timestamp()}] 🧪 Running tests...\n`;
      logs += `[${timestamp()}] ✓ Test suite passed\n`;
      logs += `[${timestamp()}] ────────────────────────────────\n\n`;
    }

    logs += `[${timestamp()}] ✅ Build completed successfully!\n`;
    
    return logs;
  }

  generateTestResults(isSuccess) {
    if (!isSuccess) {
      return {
        total: 47,
        passed: 42,
        failed: 5,
        skipped: 0,
        coverage: 73.2
      };
    }

    return {
      total: 47,
      passed: 47,
      failed: 0,
      skipped: 0,
      coverage: 87.5
    };
  }

  /**
   * Generate preview artifacts for frontend code
   */
  async generatePreview(submissionId) {
    // This would normally compile and serve the code
    // For now, we'll just create a placeholder
    const buildLog = await BuildLog.findOne({ 
      submissionId, 
      status: 'SUCCESS' 
    }).sort({ createdAt: -1 });

    if (!buildLog) {
      throw new Error('No successful build found for preview');
    }

    // In a real system, we'd:
    // 1. Compile the code to static assets
    // 2. Store them in a temp directory
    // 3. Serve via HTTP server
    // 4. Return the preview URL

    return {
      url: `/preview/${submissionId}`,
      available: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }
}

export default new BuildService();
