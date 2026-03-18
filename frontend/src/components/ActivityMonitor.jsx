import React, { useState, useEffect } from 'react';
import '../styles/ActivityMonitor.css';

export default function ActivityMonitor({ 
  activities = [], 
  loading = false, 
  error = null,
  onFilterChange = null 
}) {
  const [filters, setFilters] = useState({
    action: '',
    role: '',
    entityType: '',
  });

  const [filteredActivities, setFilteredActivities] = useState(activities);

  useEffect(() => {
    let filtered = activities;

    if (filters.action) {
      filtered = filtered.filter(a => a.action === filters.action);
    }
    if (filters.role) {
      filtered = filtered.filter(a => a.role === filters.role);
    }
    if (filters.entityType) {
      filtered = filtered.filter(a => a.entityType === filters.entityType);
    }

    setFilteredActivities(filtered);
  }, [activities, filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'login': '🔓',
      'logout': '🔒',
      'failed_login': '❌',
      'create_workspace': '📁',
      'invite_member': '👥',
      'join_workspace': '➕',
      'task_created': '✏️',
      'task_assigned': '📌',
      'task_updated': '🔄',
      'task_deleted': '🗑️',
      'submission_created': '📤',
      'submission_approved': '✅',
      'submission_rejected': '❌',
      'comment_added': '💬',
      'comment_edited': '✏️',
    };
    return icons[action] || '•';
  };

  const getEntityTypeColor = (entityType) => {
    const colors = {
      'AUTH': '#e74c3c',
      'WORKSPACE': '#3498db',
      'TASK': '#f39c12',
      'SUBMISSION': '#2ecc71',
      'COMMENT': '#9b59b6',
    };
    return colors[entityType] || '#95a5a6';
  };

  const getRoleColor = (role) => {
    const colors = {
      'MANAGER': '#3498db',
      'SENIOR': '#9b59b6',
      'JUNIOR': '#e74c3c',
    };
    return colors[role] || '#95a5a6';
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Unknown';
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

  const getUniqueValues = (field) => {
    const values = new Set();
    activities.forEach(a => {
      if (a[field]) values.add(a[field]);
    });
    return Array.from(values).sort();
  };

  if (loading) {
    return <div className="activity-monitor loading">Loading activities...</div>;
  }

  if (error) {
    return <div className="activity-monitor error">Error loading activities: {error}</div>;
  }

  return (
    <div className="activity-monitor">
      <div className="activity-header">
        <h3>📊 Activity Timeline</h3>
        <div className="activity-filters">
          <select 
            value={filters.role} 
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            {getUniqueValues('role').map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select 
            value={filters.action} 
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="filter-select"
          >
            <option value="">All Actions</option>
            {getUniqueValues('action').map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <select 
            value={filters.entityType} 
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
            className="filter-select"
          >
            <option value="">All Entity Types</option>
            {getUniqueValues('entityType').map(entityType => (
              <option key={entityType} value={entityType}>{entityType}</option>
            ))}
          </select>

          {(filters.role || filters.action || filters.entityType) && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setFilters({ action: '', role: '', entityType: '' });
                if (onFilterChange) onFilterChange({ action: '', role: '', entityType: '' });
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="no-activities">
          {activities.length === 0 ? 'No activities recorded yet' : 'No activities match your filters'}
        </div>
      ) : (
        <div className="activity-timeline">
          {filteredActivities.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <div className="activity-icon">
                {getActionIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-header-row">
                  <span className="actor-name">{activity.userId?.fullName || activity.userId?.username || 'Unknown'}</span>
                  <span 
                    className="role-badge" 
                    style={{ backgroundColor: getRoleColor(activity.role) }}
                  >
                    {activity.role}
                  </span>
                  <span 
                    className="entity-type" 
                    style={{ backgroundColor: getEntityTypeColor(activity.entityType) }}
                  >
                    {activity.entityType}
                  </span>
                  <span className="timestamp" title={new Date(activity.createdAt).toLocaleString()}>
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
                <p className="activity-description">{activity.description}</p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="activity-metadata">
                    <details>
                      <summary>Details</summary>
                      <pre>{JSON.stringify(activity.metadata, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
