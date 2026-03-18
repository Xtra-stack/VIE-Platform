import React from 'react';
import '../styles/DashboardComponents.css';

export default function ReviewCard({ review, submission, onSelect, isSelected, actions }) {
  const getReviewStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return '#4caf50';
      case 'REJECTED':
        return '#d32f2f';
      case 'PENDING':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getTechArea = (submission) => {
    return submission?.techArea || submission?.domain || 'Frontend';
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

  return (
    <div 
      className={`review-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(review, submission)}
    >
      {/* Header with Title and Status */}
      <div className="review-card-header">
        <div className="review-title">
          {submission?.title || 'Untitled Submission'}
        </div>
        <div 
          className="review-status-badge" 
          style={{ backgroundColor: getReviewStatusColor(review?.status) }}
        >
          {review?.status || 'PENDING'}
        </div>
      </div>

      {/* Developer & Tech Area Info */}
      <div className="review-meta">
        <div className="review-meta-item">
          <span className="review-meta-label">👤 Developer:</span>
          <span className="review-meta-value">{submission?.submittedBy || 'Unknown'}</span>
        </div>
        <div className="review-meta-item">
          <span className="review-meta-label">🔧 Tech Area:</span>
          <span className="review-meta-value">{getTechArea(submission)}</span>
        </div>
      </div>

      {/* Description Preview */}
      {submission?.description && (
        <p className="review-description">
          {submission.description.length > 100 
            ? submission.description.substring(0, 100) + '...' 
            : submission.description}
        </p>
      )}

      {/* Review Metadata */}
      <div className="review-details">
        {review?.reviewedAt && (
          <div className="review-detail-item">
            <span className="review-detail-label">Reviewed:</span>
            <span className="review-detail-value">{formatDate(review.reviewedAt)}</span>
          </div>
        )}
        {review?.reviewedBy && (
          <div className="review-detail-item">
            <span className="review-detail-label">By:</span>
            <span className="review-detail-value">{review.reviewedBy}</span>
          </div>
        )}
      </div>

      {/* Comments Count */}
      {review?.commentCount !== undefined && (
        <div className="review-comment-count">
          💬 {review.commentCount} comment{review.commentCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Action Buttons */}
      {actions && (
        <div className="review-card-actions">
          {actions.map((action, idx) => (
            <button 
              key={idx}
              className={`review-action-btn ${action.className}`}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick?.(review, submission);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
