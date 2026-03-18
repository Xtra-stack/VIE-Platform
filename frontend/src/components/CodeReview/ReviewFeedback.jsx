import React, { useState, useEffect } from 'react';
import '../../styles/CodeReview.css';

export default function ReviewFeedback({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState(null);

  useEffect(() => {
    fetchReviewHistory();
  }, [userId]);

  const fetchReviewHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/code-review/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch review history');

      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'APPROVED') return 'badge-success';
    if (status === 'REQUESTED_CHANGES') return 'badge-warning';
    if (status === 'REJECTED') return 'badge-danger';
    return 'badge-info';
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return '✓';
    if (status === 'REQUESTED_CHANGES') return '⟳';
    if (status === 'REJECTED') return '✕';
    return '?';
  };

  if (loading) {
    return <div className="loading">Loading review feedback...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="review-feedback-container">
        <div className="empty-state">
          <h3>No Review Feedback Yet</h3>
          <p>Submit some code to get feedback from your reviewers!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-feedback-container">
      <h2>My Review Feedback</h2>

      <div className="feedback-list">
        {history.map((item) => (
          <div key={item.submission._id} className="feedback-item">
            <div className="feedback-header">
              <div className="feedback-title">
                <span className={`status-badge ${getStatusBadgeClass(item.review?.status)}`}>
                  {getStatusIcon(item.review?.status)} {item.review?.status?.replace(/_/g, ' ')}
                </span>
                <span className="language-badge">{item.submission.language?.toUpperCase()}</span>
              </div>
              <span className="feedback-date">
                {new Date(item.review?.reviewedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="feedback-summary">
              <div className="metric">
                <span className="label">Reviewed by:</span>
                <span className="value">{item.review?.reviewerId?.username}</span>
              </div>
              <div className="metric">
                <span className="label">Quality Score:</span>
                <span className="value">
                  {item.review?.scores?.codeQuality || 'N/A'}/10
                </span>
              </div>
            </div>

            <button
              className="btn btn-expand"
              onClick={() =>
                setExpandedReview(
                  expandedReview === item.submission._id ? null : item.submission._id
                )
              }
            >
              {expandedReview === item.submission._id ? 'Hide Details' : 'View Details'}
            </button>

            {expandedReview === item.submission._id && (
              <div className="feedback-details">
                <div className="scores-breakdown">
                  <h4>Quality Scores</h4>
                  <div className="scores-grid">
                    <div className="score-item">
                      <span className="score-label">Code Quality:</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${(item.review?.scores?.codeQuality || 0) * 10}%`
                          }}
                        />
                      </div>
                      <span className="score-value">
                        {item.review?.scores?.codeQuality || 0}/10
                      </span>
                    </div>

                    <div className="score-item">
                      <span className="score-label">Readability:</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${(item.review?.scores?.readability || 0) * 10}%`
                          }}
                        />
                      </div>
                      <span className="score-value">
                        {item.review?.scores?.readability || 0}/10
                      </span>
                    </div>

                    <div className="score-item">
                      <span className="score-label">Functionality:</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${(item.review?.scores?.functionality || 0) * 10}%`
                          }}
                        />
                      </div>
                      <span className="score-value">
                        {item.review?.scores?.functionality || 0}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="feedback-text">
                  <h4>Feedback</h4>
                  <p>{item.review?.feedback}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
