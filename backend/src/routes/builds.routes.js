import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import BuildService from '../services/build.service.js';

const router = express.Router();

/**
 * GET /api/builds/:submissionId
 * Get all builds for a submission
 */
router.get('/:submissionId', requireAuth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const builds = await BuildService.getBuildLogs(submissionId);
    
    res.json({
      success: true,
      data: builds
    });
  } catch (error) {
    console.error('Get builds error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch build logs',
      message: error.message || 'Failed to fetch build logs'
    });
  }
});

/**
 * GET /api/builds/log/:buildId
 * Get specific build log details
 */
router.get('/log/:buildId', requireAuth, async (req, res) => {
  try {
    const { buildId } = req.params;
    const build = await BuildService.getBuildLog(buildId);
    
    if (!build) {
      return res.status(404).json({
        success: false,
        error: 'Build log not found',
        message: 'Build log not found'
      });
    }
    
    res.json({
      success: true,
      data: build
    });
  } catch (error) {
    console.error('Get build log error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch build log',
      message: error.message || 'Failed to fetch build log'
    });
  }
});

/**
 * POST /api/builds/:submissionId/retry
 * Retry a failed build
 */
router.post('/:submissionId/retry', requireAuth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;
    
    const newBuild = await BuildService.triggerBuild(submissionId, userId, 'FULL');
    
    res.json({
      success: true,
      message: 'Build restarted',
      data: newBuild
    });
  } catch (error) {
    console.error('Retry build error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retry build',
      message: error.message || 'Failed to retry build'
    });
  }
});

/**
 * GET /api/builds/:submissionId/preview
 * Get preview URL for successful build
 */
router.get('/:submissionId/preview', requireAuth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const preview = await BuildService.generatePreview(submissionId);
    
    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('Generate preview error:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Preview not available',
      message: error.message || 'Preview not available'
    });
  }
});

export default router;
