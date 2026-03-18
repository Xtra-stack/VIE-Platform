import React from 'react';

export default function NotificationItem({ notification, onRead, onDelete }) {
  const handleRead = () => {
    if (!notification.isRead) {
      onRead(notification._id);
    }
  };

  const handleDelete = () => {
    onDelete(notification._id);
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'SUBMISSION_APPROVED':
        return '✅';
      case 'SUBMISSION_REJECTED':
        return '❌';
      case 'REVIEW_ASSIGNED':
        return '📋';
      case 'REVIEW_COMPLETED':
        return '👀';
      case 'MILESTONE_ACHIEVED':
        return '🏆';
      case 'SKILL_LEVEL_UP':
        return '🚀';
      case 'TEAM_MENTION':
        return '👥';
      case 'FEEDBACK_RECEIVED':
        return '💬';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return '#ff7b72';
      case 'HIGH':
        return '#ff9a00';
      case 'MEDIUM':
        return '#58a6ff';
      case 'LOW':
        return '#8b949e';
      default:
        return '#8b949e';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notifDate.toLocaleDateString();
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={handleRead}
    >
      <div className="notification-icon">
        {getIconByType(notification.type)}
      </div>

      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span
            className="notification-priority-badge"
            style={{ borderLeftColor: getPriorityColor(notification.priority) }}
          >
            {notification.priority}
          </span>
        </div>

        <p className="notification-message">{notification.message}</p>

        {notification.description && (
          <p className="notification-description">{notification.description}</p>
        )}

        <div className="notification-footer">
          <span className="notification-time">{formatTime(notification.createdAt)}</span>
          <span className="notification-category">{notification.category}</span>
        </div>
      </div>

      <div className="notification-actions">
        {notification.actionUrl && (
          <a href={notification.actionUrl} className="notification-action-btn">
            View
          </a>
        )}
        <button
          className="notification-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          title="Delete notification"
        >
          ✕
        </button>
      </div>

      {!notification.isRead && <div className="notification-unread-indicator" />}
    </div>
  );
}
