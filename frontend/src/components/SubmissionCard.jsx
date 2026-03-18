import React from 'react';
import '../styles/DashboardComponents.css';

export default function SubmissionCard({ submission, onSelect, isSelected }) {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return '#4caf50';
      case 'REJECTED':
        return '#d32f2f';
      case 'PENDING_REVIEW':
        return '#ff9800';
      case 'PENDING_MANAGER_REVIEW':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const getTechArea = (submission) => {
    return submission.techArea || submission.domain || 'Frontend';
  };

  return (
    <div 
      className={`submission-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(submission)}
    >
      {/* Header with Title and Status */}
      <div className="submission-card-header">
        <div className="submission-title">{submission.title || 'Untitled Submission'}</div>
        <div 
          className="submission-status-badge" 
          style={{ backgroundColor: getStatusColor(submission.status) }}
        >
          {submission.status?.replace(/_/g, ' ') || 'PENDING'}
        </div>
      </div>

      {/* Tech Area & Branch Info */}
      <div className="submission-meta">
        <div className="submission-meta-item">
          <span className="submission-meta-label">🔧 Tech Area:</span>
          <span className="submission-meta-value">{getTechArea(submission)}</span>
        </div>
        {submission.sourceBranch && (
          <div className="submission-meta-item">
            <span className="submission-meta-label">🌿 Branch:</span>
            <span className="submission-meta-value">{submission.sourceBranch}</span>
          </div>
        )}
      </div>

      {/* Description Preview */}
      {submission.description && (
        <p className="submission-description">
          {submission.description.length > 100 
            ? submission.description.substring(0, 100) + '...' 
            : submission.description}
        </p>
      )}

      {/* Footer with Date and Action Count */}
      <div className="submission-footer">
        <div className="submission-date">
          📅 {formatDate(submission.submittedAt || submission.createdAt)}
        </div>
        {submission.reviewCount !== undefined && (
          <div className="submission-action-count">
            👁️ {submission.reviewCount} review{submission.reviewCount !== 1 ? 's' : ''}
          </div>
        )}
        {submission.approvalCount !== undefined && (
          <div className="submission-action-count">
            ✓ {submission.approvalCount} approval{submission.approvalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Build Status if available */}
      {submission.buildStatus && (
        <div className="submission-build-status">
          <div className={`build-indicator ${submission.buildStatus.toLowerCase()}`}></div>
          <span>{submission.buildStatus}</span>
        </div>
      )}
    </div>
  );
}
