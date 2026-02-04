import React from 'react';

export default function ActivityTimeline({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return <p className="no-activity">No activity yet</p>;
  }

  const getActionIcon = (actionType) => {
    const icons = {
      'submit': '📤',
      'approve': '✅',
      'reject': '❌',
      'merge': '🔀',
      'deploy': '🚀',
      'login': '🔓',
      'logout': '🔒',
    };
    return icons[actionType] || '•';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="activity-timeline">
      <h3>📊 Activity Timeline</h3>
      <div className="timeline">
        {activities.map((activity, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-marker">
              <span className="action-icon">{getActionIcon(activity.actionType)}</span>
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <strong>{activity.actorId?.username || 'Unknown'}</strong>
                <span className="role-badge">{activity.actorRole}</span>
                <span className="timestamp">{formatDate(activity.timestamp)}</span>
              </div>
              <p className="timeline-message">{activity.message}</p>
              {activity.details && Object.keys(activity.details).length > 0 && (
                <div className="timeline-details">
                  {Object.entries(activity.details).map(([key, value]) => (
                    <span key={key} className="detail-item">
                      <strong>{key}:</strong> {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
