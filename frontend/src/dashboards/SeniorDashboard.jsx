import React, { useState, useEffect } from 'react';
import { getReviews, approveReview, rejectReview, getSubmission } from '../services/api.js';

export default function SeniorDashboard() {
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);
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
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    setActionLoading(submissionId);
    setError('');
    setSuccess('');

    try {
      await approveReview(
        submissionId,
        reviewForm.overallComment || 'Approved',
        reviewForm.inlineComments
      );
      setSuccess('Code approved! Escalating to Manager...');
      setReviewForm({ submissionId: null, overallComment: '', inlineComments: [] });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId) => {
    setActionLoading(submissionId);
    setError('');
    setSuccess('');

    try {
      await rejectReview(
        submissionId,
        reviewForm.overallComment || 'Changes requested',
        reviewForm.inlineComments
      );
      setSuccess('Changes requested. Developer will update the code.');
      setReviewForm({ submissionId: null, overallComment: '', inlineComments: [] });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to request changes');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

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
            const isExpanded = expandedId === review.submissionId;

            return (
              <div key={review._id} className="submission-item">
                <div className="details" style={{ flex: 1 }}>
                  <h3>{sub?.title || 'Submission'}</h3>
                  <p>Developer: {sub?.submittedBy}</p>
                  <p>Branch: {sub?.sourceBranch} → {sub?.targetBranch}</p>
                  <p>{sub?.description}</p>

                  {isExpanded && (
                    <div style={{ marginTop: '15px' }}>
                      <textarea
                        placeholder="Enter your review comment..."
                        value={reviewForm.overallComment}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            overallComment: e.target.value,
                          })
                        }
                        style={{ width: '100%', marginBottom: '10px' }}
                      />

                      {review.inlineComments && review.inlineComments.length > 0 && (
                        <div className="inline-comments">
                          <strong>Existing Comments:</strong>
                          {review.inlineComments.map((comment, idx) => (
                            <div key={idx} className="comment">
                              <span className="file-name">{comment.file}</span>
                              <span className="line-num">Line {comment.lineNumber}</span>
                              <p>{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="actions">
                  {!isExpanded ? (
                    <button
                      onClick={() => setExpandedId(review.submissionId)}
                      className="secondary"
                    >
                      Review
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(review.submissionId)}
                        disabled={actionLoading === review.submissionId}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(review.submissionId)}
                        className="danger"
                        disabled={actionLoading === review.submissionId}
                      >
                        ✗ Changes
                      </button>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="secondary"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
