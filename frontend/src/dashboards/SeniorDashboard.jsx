import React, { useState, useEffect } from 'react';
import { getReviews, approveReview, rejectReview, getSubmission, getWorkspaceActivityLogs, getProjects } from '../services/api.js';
import ReviewModal from '../components/ReviewModal.jsx';
import ActivityMonitor from '../components/ActivityMonitor.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { ActivityItem, ChartCard, DataTable, EmptyState, LoadingState, PageHeader, ProgressBar, StatCard, StatusBadge } from '../components/DashboardPrimitives.jsx';
import { getUser } from '../utils/auth.js';
import '../styles/SeniorDashboard.css';

export default function SeniorDashboard() {
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [projects, setProjects] = useState([]);
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
      const [reviewsData, projectsData] = await Promise.all([getReviews(), getProjects()]);
      setReviews(reviewsData || []);
      setProjects(projectsData || []);

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
      setProjects([]);
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

  if (loading) {
    return (
      <DashboardLayout title="Senior Developer Dashboard" subtitle="Review code and monitor team activity">
        <LoadingState message="Loading engineering workspace..." />
      </DashboardLayout>
    );
  }

  const pendingReviews = reviews.filter((r) => r.status === 'PENDING');
  const user = getUser();
  const displayName = user?.fullName || user?.name || user?.username || 'Senior Developer';
  const reviewRows = reviews.map((review) => {
    const submission = submissions[review.submissionId];
    return {
      id: review._id || review.submissionId,
      title: submission?.title || 'Submission',
      author: submission?.submittedBy || 'Author unavailable',
      status: review.status || 'UNKNOWN',
      branch: submission?.sourceBranch ? `${submission.sourceBranch} → ${submission.targetBranch || 'main'}` : 'Branch unavailable',
      updatedAt: review.updatedAt || review.reviewedAt || review.createdAt,
    };
  });
  const activities = [
    ...reviews.map((review) => ({
      id: `review-${review._id || review.submissionId}`,
      title: review.status === 'PENDING' ? 'Review awaiting action' : 'Review updated',
      description: submissions[review.submissionId]?.title || 'Submission title unavailable',
      timestamp: review.updatedAt || review.reviewedAt || review.createdAt,
      tone: review.status === 'PENDING' ? 'orange' : 'green',
    })),
    ...Object.values(submissions).map((submission) => ({
      id: `submission-${submission._id}`,
      title: 'Code submission received',
      description: submission.title || 'Submission title unavailable',
      timestamp: submission.submittedAt || submission.createdAt,
      tone: 'blue',
    })),
  ]
    .sort((first, second) => new Date(second.timestamp || 0) - new Date(first.timestamp || 0))
    .slice(0, 5);
  const formatDate = (timestamp) => timestamp
    ? new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Time unavailable';
  const reviewStatusTone = (status) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED' || status === 'CHANGES_REQUESTED') return 'danger';
    if (status === 'PENDING') return 'warning';
    return 'neutral';
  };

  return (
    <DashboardLayout title="Senior Developer Dashboard" subtitle="Review code and monitor team activity">
      <div className="senior-dashboard">
        {error && <div className="dashboard-error">{error}</div>}
        {success && <div className="dashboard-success">{success}</div>}
        {activityError && <div className="dashboard-error">{activityError}</div>}

        <PageHeader
          title={`Good morning, ${displayName} 👋`}
          subtitle="Here are your tasks, reviews and recent engineering activity."
        />

        <div className="senior-data-note">Review and submission totals are live. Task and deployment summaries are not exposed for Senior Developers.</div>

        <section className="senior-kpi-grid" aria-label="Senior Developer KPIs">
          <StatCard title="My Tasks" value="N/A" subtitle="Senior task endpoint unavailable" icon="✓" />
          <StatCard title="Pull Requests" value="N/A" subtitle="Repository PR data unavailable" icon="⑂" />
          <StatCard title="Code Reviews" value={pendingReviews.length} subtitle={pendingReviews.length ? 'Awaiting your review' : 'No pending reviews'} icon="◈" />
          <StatCard title="Deployments" value="N/A" subtitle="Deployment list is not available" icon="⇧" />
        </section>

        <div className="senior-dashboard-grid">
          <ChartCard title="Task Progress" subtitle="Supported task summary is not available for this role">
            <div className="senior-unavailable-summary">
              <ProgressBar label="Task data unavailable" value={0} />
              <p>Task records are currently exposed through the junior-only task endpoint.</p>
            </div>
          </ChartCard>

          <ChartCard title="Developer Workspace" subtitle="Quick access to existing engineering workflows">
            <div className="senior-workspace-actions">
              <button type="button" onClick={() => setActiveTab('team-activity')}>My Tasks <span>→</span></button>
              <button type="button" onClick={() => setActiveTab('reviews')}>Code Review <span>→</span></button>
              <button type="button" onClick={() => window.location.assign('/code-editor')}>Code / Repository <span>→</span></button>
              <button type="button" onClick={() => setActiveTab('team-activity')}>Team Activity <span>→</span></button>
            </div>
          </ChartCard>
        </div>

        <div className="senior-dashboard-grid senior-dashboard-grid-secondary">
          <ChartCard title="My Projects" subtitle="Projects returned by the existing project API">
            {projects.length === 0 ? (
              <EmptyState icon="▦" title="No projects assigned" message="Projects will appear here when they are available to your account." />
            ) : (
              <div className="senior-project-list">
                {projects.map((project) => (
                  <div className="senior-project-row" key={project._id || project.id || project.slug || project.name}>
                    <div>
                      <strong>{project.name || 'Unnamed project'}</strong>
                      <span>{project.description || project.techArea || 'Technology details unavailable'}</span>
                    </div>
                    <button type="button" disabled title="Project detail route is not available">Details unavailable</button>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Recent Activity" subtitle="Review and submission events available to your account">
            {activities.length === 0 ? (
              <EmptyState icon="◷" title="No recent activity" message="Review and submission activity will appear here." />
            ) : (
              <div className="senior-activity-list">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} title={activity.title} description={activity.description} timestamp={formatDate(activity.timestamp)} tone={activity.tone} />
                ))}
              </div>
            )}
          </ChartCard>
        </div>

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

      {activeTab === 'reviews' && (
        <div className="senior-review-section">
      <ChartCard title={`Code Reviews (${pendingReviews.length})`} subtitle="Approve or request changes. Managers retain merge authority.">
        {pendingReviews.length === 0 ? (
          <EmptyState icon="◈" title="No pending reviews" message="New review requests will appear here." />
        ) : (
          pendingReviews.map((review) => {
            const sub = submissions[review.submissionId];
            return (
              <div key={review._id || review.submissionId} className="senior-review-row">
                <div>
                  <h3>{sub?.title || 'Submission'}</h3>
                  <p>{sub?.submittedBy || 'Developer unavailable'} · {sub?.sourceBranch || 'Branch unavailable'}</p>
                </div>
                <StatusBadge status="PENDING" tone="warning" />
                <button onClick={() => openReviewModal(review)}>Review Code</button>
              </div>
            );
          })
        )}
      </ChartCard>

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

      {activeTab === 'team-activity' && (
        <div className="senior-team-section">
          <ChartCard title="Team Activity" subtitle="Monitor activity from your selected workspace.">

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
          </ChartCard>

          {selectedWorkspace && (
            <ActivityMonitor 
              activities={activityLogs.logs} 
              loading={activityLoading}
              error={activityError}
            />
          )}
        </div>
      )}

      <ChartCard title="Review History" subtitle="All review records returned for your account.">
        {reviewRows.length === 0 ? (
          <EmptyState icon="◈" title="No review history" message="Review records will appear when submissions are assigned." />
        ) : (
          <DataTable
            columns={[
              { key: 'title', label: 'Submission' },
              { key: 'author', label: 'Author' },
              { key: 'branch', label: 'Branch' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} tone={reviewStatusTone(row.status)} /> },
              { key: 'updatedAt', label: 'Updated', render: (row) => formatDate(row.updatedAt) },
            ]}
            rows={reviewRows}
          />
        )}
      </ChartCard>
      </div>
    </DashboardLayout>
  );
}
