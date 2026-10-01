import React, { useState, useEffect } from 'react';
import { getReviews, approveManagerReview, rejectManagerReview, getSubmission, inviteWorkspaceUser, createProjectWorkspace, getProjects, getProjectWorkspaces, createInviteCode } from '../services/api.js';
import CodeViewer from '../components/CodeViewer.jsx';
import { getCompanyId, getUser } from '../utils/auth.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { ActivityItem, ChartCard, DataTable, EmptyState, ErrorState, LoadingState, PageHeader, ProgressBar, StatCard, StatusBadge } from '../components/DashboardPrimitives.jsx';
import '../styles/ManagerDashboard.css';

export default function ManagerDashboard() {
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'SENIOR',
  });
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteCodeForm, setInviteCodeForm] = useState({
    role: 'SENIOR',
    email: '',
    expiresInHours: 168,
  });
  const [inviteCodeResult, setInviteCodeResult] = useState(null);
  const [inviteCodeLoading, setInviteCodeLoading] = useState(false);

  // Workspace creation state
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceForm, setWorkspaceForm] = useState({
    name: '',
    projectId: '',
    projectType: 'NEW_FEATURE',
    techArea: 'FULLSTACK',
    assignedJuniors: [],
    assignedSeniors: [],
  });
  const [availableUsers, setAvailableUsers] = useState({
    juniors: [],
    seniors: [],
  });
  const [workspaceSuccess, setWorkspaceSuccess] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  // Form state for manager decisions
  const [decisionForm, setDecisionForm] = useState({
    submissionId: null,
    overallComment: '',
  });

  useEffect(() => {
    loadData();
    loadProjects();
    loadWorkspaces();
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

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const workspacesData = await getProjectWorkspaces();
      setWorkspaces(workspacesData);
    } catch (err) {
      console.error('Error loading workspaces:', err);
    }
  };

  const getInviteRoleOptions = () => {
    return [
      { value: 'SENIOR', label: 'Senior' },
      { value: 'JUNIOR', label: 'Junior' },
    ];
  };

  const handleInviteCodeChange = (e) => {
    const { name, value } = e.target;
    setInviteCodeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateInviteCode = async (e) => {
    e.preventDefault();
    setInviteSuccess('');
    setError('');
    setInviteCodeResult(null);
    setInviteCodeLoading(true);

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        return;
      }

      const response = await createInviteCode(companyId, {
        role: inviteCodeForm.role,
        email: inviteCodeForm.email || undefined,
        expiresInHours: Number(inviteCodeForm.expiresInHours) || 168,
      });
      setInviteCodeResult(response.data);
      setInviteSuccess('Invite code created successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create invite code');
    } finally {
      setInviteCodeLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    setActionLoading(submissionId);
    setError('');
    setSuccess('');

    try {
      await approveManagerReview(submissionId, decisionForm.overallComment || 'Approved for production');
      setSuccess('Code approved for deployment! 🚀');
      setDecisionForm({ submissionId: null, overallComment: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId) => {
    setActionLoading(submissionId);
    setError('');
    setSuccess('');

    try {
      await rejectManagerReview(submissionId, decisionForm.overallComment || 'Rejected');
      setSuccess('Submission rejected. Feedback sent to developer.');
      setDecisionForm({ submissionId: null, overallComment: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setError('');
    setInviteSuccess('');

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        return;
      }

      await inviteWorkspaceUser(companyId, inviteForm);
      setInviteSuccess('User invited successfully.');
      setInviteForm({ fullName: '', username: '', email: '', password: '', role: 'SENIOR' });
    } catch (err) {
      setError(err.message || 'Failed to invite user');
    }
  };

  const handleWorkspaceChange = (e) => {
    const { name, value } = e.target;
    setWorkspaceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setWorkspaceError('');
    setWorkspaceSuccess('');

    try {
      if (!workspaceForm.projectId) {
        setWorkspaceError('Please select a project');
        return;
      }

      await createProjectWorkspace(workspaceForm);
      setWorkspaceSuccess('Workspace created successfully! 🎉');
      setWorkspaceForm({
        name: '',
        projectId: '',
        projectType: 'NEW_FEATURE',
        techArea: 'FULLSTACK',
        assignedJuniors: [],
        assignedSeniors: [],
      });
      setShowWorkspaceForm(false);
      await loadWorkspaces();
    } catch (err) {
      setWorkspaceError(err.message || 'Failed to create workspace');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manager Dashboard" subtitle="Approve releases and manage learning workspaces">
        <LoadingState message="Loading manager workspace..." />
      </DashboardLayout>
    );
  }

  // Filter reviews that are pending manager approval
  const managerReviews = reviews.filter(
    (r) => r.reviewerRole === 'MANAGER' && r.status === 'PENDING'
  );

  const user = getUser();
  const displayName = user?.fullName || user?.name || user?.username || 'Manager';
  const activeWorkspaces = workspaces.filter((workspace) => workspace.status === 'ACTIVE');
  const activeMembers = new Map();
  workspaces.forEach((workspace) => {
    [...(workspace.assignedJuniors || []), ...(workspace.assignedSeniors || [])].forEach((member) => {
      const memberId = member?._id || member?.id || member?.username || member;
      const memberName = member?.fullName || member?.name || member?.username || 'Assigned member';
      if (memberId && !activeMembers.has(String(memberId))) {
        activeMembers.set(String(memberId), { member, memberName, workspaceCount: 0, activeCount: 0 });
      }
      const record = activeMembers.get(String(memberId));
      if (record) {
        record.workspaceCount += 1;
        if (workspace.status === 'ACTIVE') record.activeCount += 1;
      }
    });
  });

  const progressByArea = ['FRONTEND', 'BACKEND', 'FULLSTACK']
    .map((techArea) => {
      const areaWorkspaces = workspaces.filter((workspace) => workspace.techArea === techArea);
      const completed = areaWorkspaces.filter((workspace) => workspace.status === 'COMPLETED').length;
      return {
        label: techArea === 'FULLSTACK' ? 'Full stack' : `${techArea.charAt(0)}${techArea.slice(1).toLowerCase()}`,
        total: areaWorkspaces.length,
        progress: areaWorkspaces.length ? Math.round((completed / areaWorkspaces.length) * 100) : 0,
      };
    })
    .filter((area) => area.total > 0);

  const activities = [
    ...workspaces.map((workspace) => ({
      id: `workspace-${workspace._id || workspace.id || workspace.name}`,
      title: 'Workspace available',
      description: `${workspace.name || 'Unnamed workspace'} · ${workspace.status || 'Status unavailable'}`,
      timestamp: workspace.createdAt,
      tone: workspace.status === 'COMPLETED' ? 'green' : 'blue',
    })),
    ...projects.map((project) => ({
      id: `project-${project._id || project.id || project.name}`,
      title: 'Project available',
      description: project.name || 'Unnamed project',
      timestamp: project.createdAt,
      tone: 'purple',
    })),
    ...reviews.map((review) => ({
      id: `review-${review._id || review.id || review.submissionId}`,
      title: review.status === 'PENDING' ? 'Approval requires attention' : 'Review updated',
      description: review.status || 'Review status unavailable',
      timestamp: review.updatedAt || review.createdAt,
      tone: review.status === 'PENDING' ? 'orange' : 'green',
    })),
  ]
    .sort((first, second) => new Date(second.timestamp || 0) - new Date(first.timestamp || 0))
    .slice(0, 5);

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Time unavailable';
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const workspaceRows = workspaces.map((workspace) => ({
    ...workspace,
    memberCount: (workspace.assignedJuniors?.length || 0) + (workspace.assignedSeniors?.length || 0),
  }));

  return (
    <DashboardLayout title="Manager Dashboard" subtitle="Approve releases and manage learning workspaces">
    <div className="manager-dashboard">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {inviteSuccess && <div className="success">{inviteSuccess}</div>}
      {workspaceSuccess && <div className="success">{workspaceSuccess}</div>}
      {workspaceError && <div className="error">{workspaceError}</div>}

      <PageHeader
        title={`Good morning, ${displayName} 👋`}
        subtitle="Here's an overview of your teams and projects."
        actions={(
          <label className="manager-period-filter">
            <span>View</span>
            <select aria-label="Dashboard date range" defaultValue="7">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="month">This month</option>
            </select>
          </label>
        )}
      />

      <div className="manager-data-note">Current workspace APIs provide live totals. Date range is available for future historical reporting.</div>

      <section className="manager-kpi-grid" aria-label="Manager KPIs">
        <StatCard title="Total Projects" value={projects.length} subtitle="Projects visible to you" icon="▦" />
        <StatCard title="Active Team Members" value={activeMembers.size || 'N/A'} subtitle={activeMembers.size ? 'Members assigned to workspaces' : 'No workspace assignments'} icon="♧" />
        <StatCard title="Tasks Completed" value="N/A" subtitle="No manager task summary available" icon="✓" />
        <StatCard title="Deployments" value="N/A" subtitle="Deployment list is not available" icon="⇧" />
      </section>

      <div className="manager-dashboard-grid manager-dashboard-grid-main">
        <ChartCard title="Project Progress" subtitle="Completion by available workspace tech area">
          {progressByArea.length === 0 ? (
            <EmptyState icon="▦" title="No project progress yet" message="Create a project workspace to see progress here." />
          ) : (
            <div className="manager-progress-list">
              {progressByArea.map((area) => (
                <ProgressBar key={area.label} label={`${area.label} · ${area.total} workspace${area.total === 1 ? '' : 's'}`} value={area.progress} tone={area.label === 'Backend' ? 'purple' : area.label === 'Full stack' ? 'green' : 'blue'} />
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Team Performance" subtitle="Assignment coverage from current workspaces">
          {activeMembers.size === 0 ? (
            <EmptyState icon="♧" title="No team assignments yet" message="Assigned members will appear when a workspace has a team." />
          ) : (
            <div className="manager-team-list">
              {[...activeMembers.values()].map(({ member, memberName, workspaceCount, activeCount }) => (
                <div className="manager-team-row" key={member?._id || member?.id || memberName}>
                  <span className="manager-member-avatar">{memberName.slice(0, 2).toUpperCase()}</span>
                  <div className="manager-member-copy">
                    <strong>{memberName}</strong>
                    <span>{member?.role || 'Developer'} · {workspaceCount} assigned workspace{workspaceCount === 1 ? '' : 's'}</span>
                  </div>
                  <StatusBadge status={activeCount ? 'Active' : 'Assigned'} tone={activeCount ? 'success' : 'neutral'} />
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      <div className="manager-dashboard-grid manager-dashboard-grid-secondary">
        <ChartCard title="Recent Activities" subtitle="Recent records available from workspace, project, and review APIs">
          {activities.length === 0 ? (
            <EmptyState icon="◷" title="No recent activities" message="Workspace and review activity will appear here." />
          ) : (
            <div className="manager-activity-list">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} title={activity.title} description={activity.description} timestamp={formatActivityTime(activity.timestamp)} tone={activity.tone} />
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Pending Approvals" subtitle="Manager actions that require attention">
          {managerReviews.length === 0 ? (
            <EmptyState icon="✓" title="No pending approvals" message="There are no submissions awaiting manager approval." />
          ) : (
            <div className="manager-approval-summary">
              <strong>{managerReviews.length} submission{managerReviews.length === 1 ? '' : 's'} awaiting review</strong>
              <span>Use the Final Approval section below to inspect and decide.</span>
            </div>
          )}
        </ChartCard>
      </div>

      <section className="dashboard-widget manager-workspaces-card">
        <div className="dashboard-widget-header">
          <div>
            <h2>Project Workspaces</h2>
            <p>Manage active delivery workspaces and keep team setup close at hand.</p>
          </div>
          <button type="button" onClick={() => setShowWorkspaceForm((value) => !value)}>{showWorkspaceForm ? 'Close form' : '+ Create Workspace'}</button>
        </div>
        {workspaces.length === 0 ? (
          <div className="manager-workspace-empty"><EmptyState icon="▦" title="No project workspaces" message="Create a workspace to begin assigning delivery work." /></div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Workspace' },
              { key: 'projectType', label: 'Type' },
              { key: 'techArea', label: 'Area' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status || 'Unknown'} tone={row.status === 'ACTIVE' ? 'success' : 'neutral'} /> },
              { key: 'memberCount', label: 'Members' },
            ]}
            rows={workspaceRows}
          />
        )}

      {/* Workspace Creation Section */}
      <div className={`card manager-legacy-workspace-form ${showWorkspaceForm ? 'is-open' : ''}`}>
        <h2>🚀 Project Workspaces</h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
          Create workspaces for new features, bug fixes, or updates with assigned teams.
        </p>
        
        {workspaces.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Active Workspaces ({workspaces.length})</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {workspaces.map((ws) => (
                <div key={ws._id} style={{ padding: '10px', border: '1px solid var(--border-dark)', marginBottom: '8px', borderRadius: '4px' }}>
                  <strong>{ws.name}</strong> 
                  <span style={{ marginLeft: '10px', padding: '2px 8px', background: '#e3f2fd', borderRadius: '12px', fontSize: '12px' }}>
                    {ws.projectType}
                  </span>
                  <span style={{ marginLeft: '5px', padding: '2px 8px', background: '#f3e5f5', borderRadius: '12px', fontSize: '12px' }}>
                    {ws.techArea}
                  </span>
                  <div style={{ fontSize: '13px', color: 'var(--text-grey)', marginTop: '5px' }}>
                    Juniors: {ws.assignedJuniors?.length || 0} | Seniors: {ws.assignedSeniors?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showWorkspaceForm && (
          <form onSubmit={handleCreateWorkspace}>
            <div className="form-group">
              <label>Workspace Name*</label>
              <input
                name="name"
                value={workspaceForm.name}
                onChange={handleWorkspaceChange}
                placeholder="e.g., User Authentication Feature"
                required
              />
            </div>

            <div className="form-group">
              <label>Project*</label>
              <select name="projectId" value={workspaceForm.projectId} onChange={handleWorkspaceChange} required>
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj._id || proj.id || proj.slug || proj.name} value={proj._id || proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Project Type*</label>
              <select name="projectType" value={workspaceForm.projectType} onChange={handleWorkspaceChange}>
                <option value="NEW_FEATURE">New Feature</option>
                <option value="NEW_PROJECT">New Project</option>
                <option value="BUG_FIX">Bug Fix</option>
                <option value="UPDATE">Update</option>
                <option value="ENHANCEMENT">Enhancement</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tech Area*</label>
              <select name="techArea" value={workspaceForm.techArea} onChange={handleWorkspaceChange}>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="FULLSTACK">Full Stack</option>
              </select>
            </div>

            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-grey)', marginBottom: '5px' }}>
                Note: Assign team members after workspace creation using the team management section below.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit">Create Workspace</button>
              <button type="button" className="secondary" onClick={() => setShowWorkspaceForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      </section>

      <div className="manager-legacy-controls">
      <div className="card">
        <h2>👥 Invite Team Members</h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
          Create Senior and Junior accounts for this workspace.
        </p>
        <form onSubmit={handleInviteUser}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="fullName"
              value={inviteForm.fullName}
              onChange={handleInviteChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              value={inviteForm.username}
              onChange={handleInviteChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={inviteForm.email}
              onChange={handleInviteChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={inviteForm.password}
              onChange={handleInviteChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={inviteForm.role} onChange={handleInviteChange}>
              <option value="SENIOR">Senior</option>
              <option value="JUNIOR">Junior</option>
            </select>
          </div>
          <button type="submit">Invite User</button>
        </form>
      </div>

      <div className="card">
        <h2>🔑 Invite Codes</h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
          Generate invite codes to let new members join on their own.
        </p>
        <form onSubmit={handleCreateInviteCode}>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={inviteCodeForm.role} onChange={handleInviteCodeChange}>
              {getInviteRoleOptions().map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Email (optional)</label>
            <input
              name="email"
              type="email"
              value={inviteCodeForm.email}
              onChange={handleInviteCodeChange}
              placeholder="limit invite to one email"
            />
          </div>
          <div className="form-group">
            <label>Expires In (hours)</label>
            <input
              name="expiresInHours"
              type="number"
              min="1"
              value={inviteCodeForm.expiresInHours}
              onChange={handleInviteCodeChange}
            />
          </div>
          <button type="submit" disabled={inviteCodeLoading}>
            {inviteCodeLoading ? 'Creating...' : 'Create Invite Code'}
          </button>
        </form>
        {inviteCodeResult && (
          <div style={{ marginTop: '16px' }}>
            <strong>Invite Code:</strong> {inviteCodeResult.code}<br />
            <strong>Role:</strong> {inviteCodeResult.role}<br />
            <strong>Expires:</strong> {inviteCodeResult.expiresAt ? new Date(inviteCodeResult.expiresAt).toLocaleString() : 'N/A'}
          </div>
        )}
      </div>

      <div className="card">
        <h2>✅ Final Approval ({managerReviews.length})</h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
          These submissions have been reviewed and approved by senior developers. Make final deployment decisions.
        </p>

        {managerReviews.length === 0 ? (
          <p>No submissions awaiting final approval.</p>
        ) : (
          managerReviews.map((review) => {
            const sub = submissions[review.submissionId];
            const isExpanded = expandedId === review.submissionId;

            return (
              <div key={review._id} className="submission-item">
                <div className="details" style={{ flex: 1 }}>
                  <h3>{sub?.title || 'Submission'}</h3>
                  <p>Developer: {sub?.submittedBy}</p>
                  <p>Senior Review: <span className="status-badge approved">Approved</span></p>
                  <p>Branch: {sub?.sourceBranch} → {sub?.targetBranch}</p>
                  <p>{sub?.description}</p>

                  {isExpanded && (
                    <div style={{ marginTop: '15px' }}>
                      {sub?.codeSnippet && (
                        <div className="code-review-section">
                          <h4>📄 Code to Review</h4>
                          <pre className="code-preview">
                            <code>{sub.codeSnippet}</code>
                          </pre>
                          {sub?.filesChanged && sub.filesChanged.length > 0 && (
                            <div className="files-review">
                              <strong>Files Changed:</strong>
                              <ul>
                                {sub.filesChanged.map((file, idx) => (
                                  <li key={idx}>{file}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <textarea
                        placeholder="Enter your decision comment (optional)..."
                        value={decisionForm.overallComment}
                        onChange={(e) =>
                          setDecisionForm({
                            ...decisionForm,
                            overallComment: e.target.value,
                          })
                        }
                        style={{ width: '100%', marginBottom: '10px', marginTop: '10px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="actions">
                  {!isExpanded ? (
                    <button onClick={() => setExpandedId(review.submissionId)} className="secondary">
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
                        ✗ Reject
                      </button>
                      <button onClick={() => setExpandedId(null)} className="secondary">
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

      {selectedSubmission && (
        <CodeViewer
          code={selectedSubmission.codeSnippet}
          filesChanged={selectedSubmission.filesChanged}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
      </div>
    </div>
    </DashboardLayout>
  );
}
