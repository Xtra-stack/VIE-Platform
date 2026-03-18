import React, { useState } from 'react';
import PendingReviews from './PendingReviews';
import ReviewFeedback from './ReviewFeedback';
import '../../styles/CodeReview.css';

export default function CodeReviewPanel({ currentUserId, userRole }) {
  const [activeTab, setActiveTab] = useState(userRole === 'SENIOR' || userRole === 'MANAGER' ? 'reviews' : 'feedback');
  const [reviewCount, setReviewCount] = useState(0);

  const handleReviewComplete = () => {
    // Decrease review count, could trigger notifications
    if (reviewCount > 0) {
      setReviewCount(reviewCount - 1);
    }
  };

  return (
    <div className="code-review-panel">
      <div className="review-tabs">
        {(userRole === 'SENIOR' || userRole === 'MANAGER') && (
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <span className="tab-label">Pending Reviews</span>
            {reviewCount > 0 && <span className="tab-badge">{reviewCount}</span>}
          </button>
        )}

        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <span className="tab-label">My Feedback</span>
        </button>
      </div>

      <div className="review-tabs-content">
        {activeTab === 'reviews' && (userRole === 'SENIOR' || userRole === 'MANAGER') && (
          <PendingReviews onReviewComplete={handleReviewComplete} />
        )}

        {activeTab === 'feedback' && (
          <ReviewFeedback userId={currentUserId} />
        )}
      </div>
    </div>
  );
}
