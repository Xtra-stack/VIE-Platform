import React, { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import '../../styles/CodeReview.css';

export default function PendingReviews({ onReviewComplete }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/code-review/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch pending reviews');

      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const endpoint = reviewData.status === 'APPROVED' 
        ? '/api/code-review/approve'
        : reviewData.status === 'REQUESTED_CHANGES'
        ? '/api/code-review/request-changes'
        : '/api/code-review/reject';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) throw new Error('Failed to submit review');

      // Remove reviewed submission and reset
      setSubmissions(submissions.filter(s => s._id !== reviewData.submissionId));
      setSelectedSubmission(null);
      onReviewComplete?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'large') return (sub.codeLength || 0) > 500;
    if (filter === 'small') return (sub.codeLength || 0) <= 500;
    return true;
  });

  if (selectedSubmission) {
    return (
      <div className="pending-reviews-container">
        <button
          className="btn btn-back"
          onClick={() => setSelectedSubmission(null)}
        >
          ← Back to List
        </button>
        <ReviewForm
          submission={selectedSubmission}
          onSubmit={handleReviewSubmit}
          onCancel={() => setSelectedSubmission(null)}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading pending reviews...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="pending-reviews-container">
        <div className="empty-state">
          <h3>No Pending Reviews</h3>
          <p>All submissions have been reviewed. Great job!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-reviews-container">
      <div className="reviews-header">
        <h2>Pending Reviews</h2>
        <span className="badge badge-info">{filteredSubmissions.length} waiting</span>
      </div>

      {/* Filter */}
      <div className="filter-group">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({submissions.length})
        </button>
        <button
          className={`filter-btn ${filter === 'large' ? 'active' : ''}`}
          onClick={() => setFilter('large')}
        >
          Large ({submissions.filter(s => (s.codeLength || 0) > 500).length})
        </button>
        <button
          className={`filter-btn ${filter === 'small' ? 'active' : ''}`}
          onClick={() => setFilter('small')}
        >
          Small ({submissions.filter(s => (s.codeLength || 0) <= 500).length})
        </button>
      </div>

      {/* Submissions List */}
      <div className="submissions-list">
        {filteredSubmissions.map((submission) => (
          <div key={submission._id} className="submission-card">
            <div className="card-header">
              <h4>{submission.submittedBy?.username || 'Unknown User'}</h4>
              <span className="language-badge">{submission.language?.toUpperCase()}</span>
            </div>

            <div className="card-content">
              <div className="metric">
                <span className="label">Code Length:</span>
                <span className="value">{submission.codeLength || 0} chars</span>
              </div>
              <div className="metric">
                <span className="label">Lines:</span>
                <span className="value">{submission.lineCount || 0}</span>
              </div>
              <div className="metric">
                <span className="label">Submitted:</span>
                <span className="value">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="card-preview">
              <p className="preview-label">Preview:</p>
              <pre className="code-preview">{submission.code?.substring(0, 200)}...</pre>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setSelectedSubmission(submission)}
            >
              Review Submission
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
