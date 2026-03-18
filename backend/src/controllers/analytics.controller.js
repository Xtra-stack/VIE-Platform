import * as AnalyticsService from '../services/analytics.service.js';
import { logger } from '../config/logger.js';

export const postMetric = async (req, res) => {
  try {
    const { type, value = 1, meta = {} } = req.body;
    if (!type) return res.status(400).json({ error: 'type required' });
    const doc = await AnalyticsService.recordMetric(type, Number(value), meta);
    return res.json({ success: true, data: doc });
  } catch (err) {
    logger.error('postMetric error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const summary = await AnalyticsService.getSummary(days);
    return res.json({ success: true, data: summary });
  } catch (err) {
    logger.error('getSummary error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const analytics = await AnalyticsService.getUserDashboard(userId);
    return res.json({ success: true, analytics });
  } catch (error) {
    logger.error(`Get user dashboard error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getTeamAnalytics = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { taskId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'User must belong to a company' });
    const analytics = await AnalyticsService.getTeamAnalytics(companyId, taskId);
    return res.json({ success: true, analytics });
  } catch (error) {
    logger.error(`Get team analytics error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getCompanyAnalytics = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: 'User must belong to a company' });
    const analytics = await AnalyticsService.getCompanyAnalytics(companyId);
    return res.json({ success: true, analytics });
  } catch (error) {
    logger.error(`Get company analytics error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getSkillTrends = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const { skillName } = req.query;
    const trends = await AnalyticsService.getSkillTrends(userId, skillName);
    return res.json({ success: true, trends });
  } catch (error) {
    logger.error(`Get skill trends error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getQualityMetrics = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { limit = 10 } = req.query;
    const metrics = await AnalyticsService.getQualityMetrics(taskId, parseInt(limit));
    return res.json({ success: true, metrics });
  } catch (error) {
    logger.error(`Get quality metrics error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getLearningPath = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const path = await AnalyticsService.getLearningPath(userId);
    return res.json({ success: true, path });
  } catch (error) {
    logger.error(`Get learning path error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getComparisonAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: 'User must belong to a company' });
    const comparison = await AnalyticsService.getComparisonAnalytics(userId, companyId);
    return res.json({ success: true, comparison });
  } catch (error) {
    logger.error(`Get comparison analytics error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const companyId = req.user?.companyId;
    const role = req.user?.role;

    const summary = {};
    summary.personal = await AnalyticsService.getUserDashboard(userId);

    if (companyId && ['MANAGER', 'SENIOR'].includes(role)) {
      summary.team = await AnalyticsService.getTeamAnalytics(companyId);
      if (role === 'MANAGER') summary.company = await AnalyticsService.getCompanyAnalytics(companyId);
    }

    summary.skills = await AnalyticsService.getSkillTrends(userId);

    return res.json({ success: true, summary });
  } catch (error) {
    logger.error(`Get analytics summary error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const exportAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const companyId = req.user?.companyId;
    const { format = 'json', type = 'personal' } = req.query;

    let data = {};
    if (type === 'personal') data = await AnalyticsService.getUserDashboard(userId);
    else if (type === 'team' && companyId) data = await AnalyticsService.getTeamAnalytics(companyId);

    if (format === 'csv') {
      const csv = JSON.stringify(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
      res.json(data);
    }
  } catch (error) {
    logger.error(`Export analytics error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
