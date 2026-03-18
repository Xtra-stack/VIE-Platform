import React, { useState, useEffect } from 'react';
import { getReviews, approveReview, rejectReview, getSubmission, getWorkspaceActivityLogs } from '../services/api.js';
import ReviewModal from '../components/ReviewModal.jsx';
import ActivityMonitor from '../components/ActivityMonitor.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import RoleStats from '../components/RoleStats.jsx';

export default function SeniorDashboard() {
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Activity tracking state
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews', 'team-activity'
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activityLogs, setActivityLogs] = useState({ logs: [], total: 0, page: 1, pages: 1 });
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  // Form state for review actions
  const [reviewForm, setReviewForm] = useState({
    submissionId: null,
    overallComment: '',
    inlineComments: [],
  });

  useEffect(() => {
    loadData();
    loadWorkspaces();
  }, []);

  // Load activity when tab is changed or workspace is selected
  useEffect(() => {
    if (activeTab === 'team-activity' && selectedWorkspace) {
      loadActivityData();
    }
  }, [activeTab, selectedWorkspace]);

  const loadWorkspaces = async () => {
    try {
      // This would need a getWorkspacesForSenior API endpoint, for now using placeholder
      // In real implementation, get workspaces where user is a SENIOR
      setWorkspaces([] );
    } catch (err) {
      console.error('Error loading workspaces:', err);
    }
  };

  const loadActivityData = async () => {
    setActivityLoading(true);
    setActivityError('');
    try {
      const logsData = await getWorkspaceActivityLogs(selectedWorkspace, 1, 50, { role: 'JUNIOR' });
      setActivityLogs(logsData);
    } catch (err) {
      console.error('Error loading activity data:', err);
      setActivityError(err.message || 'Failed to load activity data');
    } finally {
      setActivityLoading(false);
    }
  };

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
    <DashboardLayout 
      title="Senior Developer Dashboard" 
      subtitle="Review code and monitor team activity"
    >
      <div>
        <RoleStats role="SENIOR" />
        {error && <div className="dashboard-error">{error}</div>}
        {success && <div className="dashboard-success">{success}</div>}
        {activityError && <div className="dashboard-error">{activityError}</div>}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`dashboard-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            👁️ Code Reviews
          </button>
          <button 
            onClick={() => setActiveTab('team-activity')}
            className={`dashboard-tab ${activeTab === 'team-activity' ? 'active' : ''}`}
          >
            📊 Team Activity
          </button>
        </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>

      <div className="card">
        <h2>👁️ Code Reviews ({pendingReviews.length})</h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
          ⚠️ <strong>Review Role:</strong> You can approve or request changes, but CANNOT merge code. 
          Only Managers have merge authority.
        </p>
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
      )}

      {/* Team Activity Tab */}
      {activeTab === 'team-activity' && (
        <div>
          <div className="card">
            <h2>📊 Team Activity</h2>
            <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
              Monitor the activity of your junior developers.
            </p>

            <div className="form-group">
              <label>Select Workspace*</label>
              <select 
                value={selectedWorkspace || ''} 
                onChange={(e) => setSelectedWorkspace(e.target.value)}
              >
                <option value="">Choose a workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws._id} value={ws._id}>
                    {ws.name} ({ws.projectType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedWorkspace && (
            <ActivityMonitor 
              activities={activityLogs.logs} 
              loading={activityLoading}
              error={activityError}
            />
          )}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
