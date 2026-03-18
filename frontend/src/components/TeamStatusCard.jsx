import React from 'react';
import '../styles/TeamStatus.css';

export default function TeamStatusCard({ teamStatus = [], loading = false, error = null }) {
  if (loading) {
    return <div className="team-status loading">Loading team status...</div>;
  }

  if (error) {
    return <div className="team-status error">Error loading team status: {error}</div>;
  }

  if (!teamStatus || teamStatus.length === 0) {
    return <div className="team-status empty">No team members found</div>;
  }

  const formatRelativeTime = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    const colors = {
      MANAGER: '#3498db',
      SENIOR: '#9b59b6',
      JUNIOR: '#e74c3c',
    };
    return colors[role] || '#95a5a6';
  };

  return (
    <div className="team-status-container">
      <h3>👥 Live Team Status</h3>
      <div className="team-grid">
        {teamStatus.map((member) => (
          <div key={member._id} className="team-card">
            <div className="team-header">
              <div className="member-info">
                <div className="member-avatar">
                  {member.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="member-details">
                  <h4>{member.fullName}</h4>
                  <p className="member-email">{member.username}</p>
                </div>
              </div>
              <div className="status-indicator">
                <span 
                  className={`online-status ${member.isOnline ? 'online' : 'offline'}`}
                  title={member.isOnline ? 'Online' : 'Offline'}
                />
              </div>
            </div>

            <div className="team-body">
              <div className="role-badge" style={{ backgroundColor: getRoleColor(member.role) }}>
                {member.role}
              </div>

              <div className="last-active">
                <span className="label">Last Active:</span>
                <span className="value">{formatRelativeTime(member.lastActiveAt)}</span>
              </div>

              {member.currentTask && (
                <div className="current-task">
                  <span className="label">Current Task:</span>
                  <div className="task-info">
                    <p className="task-title">{member.currentTask.title}</p>
                    {member.currentTask.deadline && (
                      <p className="task-deadline">
                        Due: {new Date(member.currentTask.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
