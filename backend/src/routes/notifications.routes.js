import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Notification Routes
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * GET /api/notifications
 * Get notifications for current user with filters
 */
router.get('/', NotificationController.getNotifications);

/**
 * GET /api/notifications/summary
 * Get notification summary (unread count, recent, by category)
 */
router.get('/summary', NotificationController.getNotificationSummary);

/**
 * GET /api/notifications/unread/count
 * Get unread notification count
 */
router.get('/unread/count', NotificationController.getUnreadCount);

/**
 * GET /api/notifications/search
 * Search notifications by title/message
 */
router.get('/search', NotificationController.searchNotifications);

/**
 * PUT /api/notifications/:id/read
 * Mark specific notification as read
 */
router.put('/:id/read', NotificationController.markAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', NotificationController.markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete specific notification
 */
router.delete('/:id', NotificationController.deleteNotification);

/**
 * DELETE /api/notifications
 * Delete multiple notifications by IDs
 */
router.delete('/', NotificationController.deleteNotifications);

/**
 * POST /api/notifications/archive
 * Archive old read notifications
 */
router.post('/archive', NotificationController.archiveOldNotifications);

export default router;
