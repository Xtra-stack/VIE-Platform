import React, { useState, useEffect } from 'react';
import { getReviews, approveManagerReview, rejectManagerReview, getSubmission, inviteWorkspaceUser } from '../services/api.js';
import CodeViewer from '../components/CodeViewer.jsx';
import { getCompanyId } from '../utils/auth.js';

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

  // Form state for manager decisions
  const [decisionForm, setDecisionForm] = useState({
    submissionId: null,
    overallComment: '',
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

  if (loading) return <div className="loading">Loading approvals...</div>;

  // Filter reviews that are pending manager approval
  const managerReviews = reviews.filter(
    (r) => r.reviewerRole === 'MANAGER' && r.status === 'PENDING'
  );

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {inviteSuccess && <div className="success">{inviteSuccess}</div>}

      <div className="card">
        <h2>👥 Invite Team Members</h2>
        <p style={{ color: '#666', marginBottom: '15px' }}>
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
        <h2>✅ Final Approval ({managerReviews.length})</h2>
        <p style={{ color: '#666', marginBottom: '15px' }}>
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
  );
}
