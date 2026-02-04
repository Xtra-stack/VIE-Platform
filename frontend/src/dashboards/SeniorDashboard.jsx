import React, { useState, useEffect } from 'react';
import { getReviews, approveReview, rejectReview, getSubmission } from '../services/api.js';
import ReviewModal from '../components/ReviewModal.jsx';

export default function SeniorDashboard() {
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Form state for review actions
  const [reviewForm, setReviewForm] = useState({
    submissionId: null,
    overallComment: '',
    inlineComments: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const reviewsData = await getReviews();
      setReviews(reviewsData || []);

      // Load submission details for each review
      const submissionsMap = {};
      for (const review of reviewsData || []) {
        if (!submissionsMap[review.submissionId]) {
          try {
            const sub = await getSubmission(review.submissionId);
            submissionsMap[review.submissionId] = sub;
          } catch (err) {
            console.error('Failed to load submission:', err);
          }
        }
      }
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
      setSubmissions({});
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId, comment, inlineComments) => {
    try {
      await approveReview(submissionId, comment || 'Approved', inlineComments);
      setSuccess('Code approved! Escalating to Manager...');
      await loadData();
      setReviewModalOpen(false);
      setSelectedSubmission(null);
    } catch (err) {
      setError(err.message || 'Failed to approve review');
      throw err;
    }
  };

  const handleReject = async (submissionId, comment, inlineComments, fileName, lineNumber) => {
    try {
      await rejectReview(submissionId, comment || 'Changes requested', inlineComments, fileName, lineNumber);
      setSuccess('Rejection sent. Developer will address the feedback.');
      await loadData();
      setReviewModalOpen(false);
      setSelectedSubmission(null);
    } catch (err) {
      setError(err.message || 'Failed to reject submission');
      throw err;
    }
  };

  const handleComment = async (submissionId, comment, inlineComments) => {
    console.log('Comment added:', { submissionId, comment, inlineComments });
    return Promise.resolve();
  };

  const openReviewModal = async (review) => {
    const sub = submissions[review.submissionId];
    if (sub) {
      setSelectedSubmission(sub);
      setReviewModalOpen(true);
    }
  };

  if (loading) return <div className="loading">Loading reviews...</div>;

  const pendingReviews = reviews.filter((r) => r.status === 'PENDING');

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2>👁️ Code Reviews ({pendingReviews.length})</h2>
        {pendingReviews.length === 0 ? (
          <p>No pending reviews.</p>
        ) : (
          pendingReviews.map((review) => {
            const sub = submissions[review.submissionId];
            return (
              <div key={review._id} className="submission-item">
                <div className="details" style={{ flex: 1 }}>
                  <h3>{sub?.title || 'Submission'}</h3>
                  <p>Developer: {sub?.submittedBy}</p>
                  <p>Branch: {sub?.sourceBranch} → {sub?.targetBranch}</p>
                  <p>{sub?.description}</p>
                </div>
                <div className="actions">
                  <button onClick={() => openReviewModal(review)} className="primary">
                    📋 Review Code
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {reviewModalOpen && selectedSubmission && (
        <ReviewModal
          submission={selectedSubmission}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSubmission(null);
          }}
          onApprove={handleApprove}
          onRequestChanges={handleReject}
          onReject={handleReject}
          onComment={handleComment}
          userRole="SENIOR_DEV"
        />
      )}
    </div>
  );
}
