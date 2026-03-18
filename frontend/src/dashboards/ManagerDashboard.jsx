import React, { useState, useEffect } from 'react';
import { getReviews, approveManagerReview, rejectManagerReview, getSubmission, inviteWorkspaceUser, createProjectWorkspace, getProjects, getProjectWorkspaces, createInviteCode } from '../services/api.js';
import CodeViewer from '../components/CodeViewer.jsx';
import { getCompanyId } from '../utils/auth.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import RoleStats from '../components/RoleStats.jsx';

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
          <RoleStats role="MANAGER" />
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

  if (loading) return <div className="loading">Loading approvals...</div>;

  // Filter reviews that are pending manager approval
  const managerReviews = reviews.filter(
    (r) => r.reviewerRole === 'MANAGER' && r.status === 'PENDING'
  );

  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Approve releases and manage learning workspaces"
    >
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {inviteSuccess && <div className="success">{inviteSuccess}</div>}
      {workspaceSuccess && <div className="success">{workspaceSuccess}</div>}
      {workspaceError && <div className="error">{workspaceError}</div>}

      {/* Workspace Creation Section */}
      <div className="card">
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

        {!showWorkspaceForm ? (
          <button onClick={() => setShowWorkspaceForm(true)}>+ Create Workspace</button>
        ) : (
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
                  <option key={proj._id} value={proj._id}>
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
    </DashboardLayout>
  );
}
