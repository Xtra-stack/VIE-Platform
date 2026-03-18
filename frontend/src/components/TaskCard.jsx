import React from 'react';
import '../styles/DashboardComponents.css';

export default function TaskCard({ task, onSelect, onStatusChange, isSelected }) {
  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#d32f2f';
      case 'MEDIUM':
        return '#f57c00';
      case 'LOW':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '#4caf50';
      case 'IN_PROGRESS':
        return '#2196f3';
      case 'PENDING':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <div 
      className={`task-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(task)}
    >
      {/* Priority Badge */}
      <div className="task-card-header">
        <div className="task-priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority || 'MEDIUM'}
        </div>
        <div className="task-title">{task.title || 'Untitled Task'}</div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {/* Metadata Row */}
      <div className="task-meta">
        <div className="task-meta-item">
          <span className="task-meta-label">Assigned by:</span>
          <span className="task-meta-value">{task.assignedBy || 'Unknown'}</span>
        </div>
        {task.totalComments !== undefined && (
          <div className="task-meta-item">
            <span className="task-meta-label">💬 Comments:</span>
            <span className="task-meta-value">{task.totalComments}</span>
          </div>
        )}
      </div>

      {/* Deadline & Status Row */}
      <div className="task-footer">
        <div className={`task-deadline ${isOverdue ? 'overdue' : ''}`}>
          📅 {formatDate(task.deadline)}
        </div>
        <div className="task-status-badge" style={{ backgroundColor: getStatusBadgeColor(task.status) }}>
          {task.status || 'PENDING'}
        </div>
      </div>

      {/* Submission Status */}
      {task.submissionStatus && (
        <div className="task-submission-status">
          ✓ {task.submissionStatus}
        </div>
      )}
    </div>
  );
}
