import NotificationService from '../services/notification.service.js';
import { logger } from '../config/logger.js';

/**
 * Notification Controller
 * Handles HTTP requests for notification management
 */

class NotificationController {
  /**
   * Get notifications for current user
   * GET /api/notifications
   */
  static async getNotifications(req, res) {
    try {
      const { isRead, type, category, priority, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const filters = { isRead, type, category, priority, limit, skip };

      // Remove undefined filters
      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key]
      );

      const result = await NotificationService.getNotifications(
        req.user.id,
        filters
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Failed to get notifications: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      });
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread/count
   */
  static async getUnreadCount(req, res) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);

      return res.json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      logger.error(`Failed to get unread count: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message,
      });
    }
  }

  /**
   * Get notification summary
   * GET /api/notifications/summary
   */
  static async getNotificationSummary(req, res) {
    try {
      const summary = await NotificationService.getNotificationSummary(
        req.user.id
      );

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error(`Failed to get notification summary: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notification summary',
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(id, req.user.id);

      return res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      logger.error(`Failed to mark as read: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      });
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  static async markAllAsRead(req, res) {
    try {
      const count = await NotificationService.markAllAsRead(req.user.id);

      return res.json({
        success: true,
        message: `Marked ${count} notifications as read`,
        data: { markedCount: count },
      });
    } catch (error) {
      logger.error(`Failed to mark all as read: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error.message,
      });
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      await NotificationService.deleteNotification(id, req.user.id);

      return res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      logger.error(`Failed to delete notification: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message,
      });
    }
  }

  /**
   * Delete multiple notifications
   * DELETE /api/notifications
   */
  static async deleteNotifications(req, res) {
    try {
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of notification IDs',
        });
      }

      const deletedCount = await NotificationService.deleteNotifications(
        notificationIds,
        req.user.id
      );

      return res.json({
        success: true,
        message: `Deleted ${deletedCount} notifications`,
        data: { deletedCount },
      });
    } catch (error) {
      logger.error(`Failed to delete notifications: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notifications',
        error: error.message,
      });
    }
  }

  /**
   * Search notifications
   * GET /api/notifications/search
   */
  static async searchNotifications(req, res) {
    try {
      const { q, category, type } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search term (q) is required',
        });
      }

      const results = await NotificationService.searchNotifications(
        req.user.id,
        q,
        { category, type }
      );

      return res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error(`Failed to search notifications: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to search notifications',
        error: error.message,
      });
    }
  }

  /**
   * Archive old notifications
   * POST /api/notifications/archive
   */
  static async archiveOldNotifications(req, res) {
    try {
      const { daysOld = 30 } = req.body;

      const archivedCount = await NotificationService.archiveOldNotifications(
        req.user.id,
        daysOld
      );

      return res.json({
        success: true,
        message: `Archived ${archivedCount} old notifications`,
        data: { archivedCount },
      });
    } catch (error) {
      logger.error(`Failed to archive notifications: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to archive notifications',
        error: error.message,
      });
    }
  }
}

export default NotificationController;
