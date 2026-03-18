import React, { useState, useEffect, useRef } from 'react';
import './Notifications.css';

export default function NotificationBell({ onNotificationCenterOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread/count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchRecentNotifications = async () => {
    if (recentNotifications.length > 0) return; // Already loaded

    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentNotifications(data.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching recent notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setRecentNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleOpenCenter = () => {
    setIsOpen(false);
    onNotificationCenterOpen?.();
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

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className={`notification-bell-btn ${isOpen ? 'active' : ''}`}
        onClick={handleBellClick}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Recent Notifications</h3>
            <button
              className="dropdown-view-all"
              onClick={handleOpenCenter}
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="dropdown-loading">Loading...</div>
          ) : recentNotifications.length === 0 ? (
            <div className="dropdown-empty">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="dropdown-list">
              {recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`dropdown-item ${notification.isRead ? 'read' : 'unread'}`}
                >
                  <span className="dropdown-icon">{getIconByType(notification.type)}</span>

                  <div className="dropdown-content">
                    <p className="dropdown-title">{notification.title}</p>
                    <p className="dropdown-message">{notification.message}</p>
                  </div>

                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="dropdown-action"
                      onClick={(e) => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification._id, e);
                        }
                        setIsOpen(false);
                      }}
                    >
                      →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="dropdown-footer">
            <button
              className="view-all-btn"
              onClick={handleOpenCenter}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
