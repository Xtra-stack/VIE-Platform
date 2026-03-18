import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';
import './Notifications.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
  }, [activeFilter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = `/api/notifications?page=${page}&limit=15`;

      if (activeFilter !== 'all') {
        if (activeFilter === 'unread') {
          url += '&isRead=false';
        } else {
          url += `&category=${activeFilter}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      if (page === 1) {
        setNotifications(data.data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.data.notifications]);
      }
      setHasMore(data.data.hasMore);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/notifications/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch summary');

      const data = await response.json();
      setSummary(data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // Refresh summary
      await fetchSummary();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));

      // Refresh summary
      await fetchSummary();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));

      // Refresh summary
      await fetchSummary();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      CODE_REVIEW: '📋 Code Review',
      SKILL: '🚀 Skills',
      ACHIEVEMENT: '🏆 Achievements',
      TEAM: '👥 Team',
      ADMIN: '⚙️ Admin',
    };
    return labels[category] || category;
  };

  return (
    <div className="notification-center-container">
      <div className="notification-center-header">
        <h2>Notifications</h2>
        <div className="notification-center-actions">
          {summary?.unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {summary && (
        <div className="notification-summary">
          <div className="summary-stat">
            <span className="summary-label">Unread</span>
            <span className="summary-value">{summary.unreadCount}</span>
          </div>
          {Object.entries(summary.countByCategory).map(([category, count]) => (
            <div key={category} className="summary-stat">
              <span className="summary-label">{getCategoryLabel(category)}</span>
              <span className="summary-value">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="notification-filters">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('all');
            setPage(1);
          }}
        >
          All
        </button>
        <button
          className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('unread');
            setPage(1);
          }}
        >
          Unread
        </button>
        <button
          className={`filter-btn ${activeFilter === 'CODE_REVIEW' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('CODE_REVIEW');
            setPage(1);
          }}
        >
          Code Review
        </button>
        <button
          className={`filter-btn ${activeFilter === 'SKILL' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('SKILL');
            setPage(1);
          }}
        >
          Skills
        </button>
        <button
          className={`filter-btn ${activeFilter === 'ACHIEVEMENT' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('ACHIEVEMENT');
            setPage(1);
          }}
        >
          Achievements
        </button>
      </div>

      <div className="notification-list">
        {loading && page === 1 ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : error ? (
          <div className="notification-error">Error: {error}</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications yet</p>
            <p className="notification-empty-subtitle">Check back later for updates!</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}

            {hasMore && (
              <button
                className="load-more-btn"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
