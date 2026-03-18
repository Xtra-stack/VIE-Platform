import Notification from '../models/Notification.js';
import { logger } from '../config/logger.js';

/**
 * Notification Service
 * Handles creating, retrieving, and managing user notifications
 */

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(
    userId,
    type,
    title,
    message,
    category,
    options = {}
  ) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        category,
        priority: options.priority || 'MEDIUM',
        description: options.description,
        relatedId: options.relatedId,
        relatedModel: options.relatedModel,
        actionUrl: options.actionUrl,
        sender: options.sender,
        metadata: options.metadata || {},
      });

      await notification.save();
      logger.info(`Notification created for user ${userId}: ${type}`);
      return notification;
    } catch (error) {
      logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get notifications for a user with filters
   */
  static async getNotifications(userId, filters = {}) {
    try {
      const {
        isRead,
        type,
        category,
        priority,
        limit = 20,
        skip = 0,
      } = filters;

      const query = { userId };

      if (isRead !== undefined) {
        query.isRead = isRead;
      }

      if (type) {
        query.type = Array.isArray(type) ? { $in: type } : type;
      }

      if (category) {
        query.category = Array.isArray(category) ? { $in: category } : category;
      }

      if (priority) {
        query.priority = priority;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username fullName avatar')
        .lean();

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      logger.error(`Failed to fetch notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        isRead: false,
      });
      return count;
    } catch (error) {
      logger.error(`Failed to get unread count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error(`Failed to mark notification as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
      return result.modifiedCount;
    } catch (error) {
      logger.error(`Failed to mark all as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!result) {
        throw new Error('Notification not found');
      }

      logger.info(`Notification deleted: ${notificationId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to delete notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  static async deleteNotifications(notificationIds, userId) {
    try {
      const result = await Notification.deleteMany({
        _id: { $in: notificationIds },
        userId,
      });

      logger.info(`Deleted ${result.deletedCount} notifications for user ${userId}`);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Failed to delete notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive old read notifications (soft delete)
   */
  static async archiveOldNotifications(userId, daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        userId,
        isRead: true,
        createdAt: { $lt: cutoffDate },
      });

      logger.info(`Archived ${result.deletedCount} old notifications for user ${userId}`);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Failed to archive notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify on submission approval
   */
  static async notifySubmissionApproved(submission, approverName) {
    try {
      const actionUrl = `/submissions/${submission._id}`;
      await this.createNotification(
        submission.userId,
        'SUBMISSION_APPROVED',
        'Your submission was approved! 🎉',
        `Your code submission has been approved by ${approverName}. Great work!`,
        'CODE_REVIEW',
        {
          priority: 'HIGH',
          relatedId: submission._id,
          relatedModel: 'CodeSubmission',
          actionUrl,
          sender: submission.approvedBy,
          metadata: { submissionId: submission._id, taskId: submission.taskId },
        }
      );
    } catch (error) {
      logger.error(`Failed to notify submission approval: ${error.message}`);
    }
  }

  /**
   * Notify on submission rejection
   */
  static async notifySubmissionRejected(submission, feedback, reviewerName) {
    try {
      const actionUrl = `/submissions/${submission._id}?feedback=true`;
      await this.createNotification(
        submission.userId,
        'SUBMISSION_REJECTED',
        'Your submission needs revision',
        `Your submission was rejected with feedback from ${reviewerName}. Review the comments and resubmit.`,
        'CODE_REVIEW',
        {
          priority: 'HIGH',
          description: feedback?.summary || 'Please review the feedback and make improvements.',
          relatedId: submission._id,
          relatedModel: 'CodeSubmission',
          actionUrl,
          sender: submission.rejectedBy,
          metadata: {
            submissionId: submission._id,
            taskId: submission.taskId,
            feedbackCount: feedback?.commentCount || 0,
          },
        }
      );
    } catch (error) {
      logger.error(`Failed to notify submission rejection: ${error.message}`);
    }
  }

  /**
   * Notify on review assignment
   */
  static async notifyReviewAssigned(review, taskTitle) {
    try {
      const actionUrl = `/reviews/${review._id}`;
      await this.createNotification(
        review.reviewerId,
        'REVIEW_ASSIGNED',
        'New code review assigned',
        `You've been assigned to review code for task: "${taskTitle}"`,
        'CODE_REVIEW',
        {
          priority: 'MEDIUM',
          relatedId: review._id,
          relatedModel: 'Review',
          actionUrl,
          sender: review.assignedBy,
          metadata: { reviewId: review._id, taskId: review.taskId },
        }
      );
    } catch (error) {
      logger.error(`Failed to notify review assignment: ${error.message}`);
    }
  }

  /**
   * Notify on review completion
   */
  static async notifyReviewCompleted(submission, review, reviewerName) {
    try {
      const actionUrl = `/submissions/${submission._id}?review=true`;
      await this.createNotification(
        submission.userId,
        'REVIEW_COMPLETED',
        'Your submission has been reviewed',
        `${reviewerName} completed the review of your submission. Check feedback now!`,
        'CODE_REVIEW',
        {
          priority: 'MEDIUM',
          relatedId: review._id,
          relatedModel: 'Review',
          actionUrl,
          sender: review.reviewerId,
          metadata: { reviewId: review._id, submissionId: submission._id },
        }
      );
    } catch (error) {
      logger.error(`Failed to notify review completion: ${error.message}`);
    }
  }

  /**
   * Notify on skill level up
   */
  static async notifySkillLevelUp(userId, skillName, newLevel) {
    try {
      const actionUrl = '/analytics?tab=skills';
      await this.createNotification(
        userId,
        'SKILL_LEVEL_UP',
        `You advanced to Level ${newLevel} in ${skillName}! 🚀`,
        `Congratulations! You've reached Level ${newLevel} in ${skillName}. Keep up the great work!`,
        'SKILL',
        {
          priority: 'HIGH',
          actionUrl,
          metadata: { skillName, newLevel },
        }
      );
    } catch (error) {
      logger.error(`Failed to notify skill level up: ${error.message}`);
    }
  }

  /**
   * Notify on milestone achievement
   */
  static async notifyMilestoneAchieved(userId, milestoneName, milestone) {
    try {
      const actionUrl = '/analytics?tab=learning-path';
      await this.createNotification(
        userId,
        'MILESTONE_ACHIEVED',
        `Milestone Achieved: ${milestoneName}! 🏆`,
        `You've successfully achieved the milestone: "${milestoneName}". You're making excellent progress!`,
        'ACHIEVEMENT',
        {
          priority: 'HIGH',
          actionUrl,
          metadata: { milestoneName, milestone },
        }
      );
    } catch (error) {
      logger.error(`Failed to notify milestone achievement: ${error.message}`);
    }
  }

  /**
   * Bulk create notifications for multiple users
   */
  static async bulkCreateNotifications(userIds, type, title, message, category, options = {}) {
    try {
      const notifications = userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        category,
        priority: options.priority || 'MEDIUM',
        description: options.description,
        metadata: options.metadata || {},
      }));

      const result = await Notification.insertMany(notifications);
      logger.info(`Created ${result.length} bulk notifications`);
      return result;
    } catch (error) {
      logger.error(`Failed to bulk create notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get notification summary for dashboard
   */
  static async getNotificationSummary(userId) {
    try {
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      const recentNotifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const countByCategory = await Notification.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      return {
        unreadCount,
        recentNotifications,
        countByCategory: Object.fromEntries(
          countByCategory.map((item) => [item._id, item.count])
        ),
      };
    } catch (error) {
      logger.error(`Failed to get notification summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search notifications
   */
  static async searchNotifications(userId, searchTerm, filters = {}) {
    try {
      const query = {
        userId,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { message: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return notifications;
    } catch (error) {
      logger.error(`Failed to search notifications: ${error.message}`);
      throw error;
    }
  }
}

export default NotificationService;
