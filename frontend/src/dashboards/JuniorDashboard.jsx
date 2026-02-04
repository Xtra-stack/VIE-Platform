import React, { useState, useEffect } from 'react';
import { getSubmissions, createSubmission, getProjects, getSubmission, getBuildLogs, resubmitSubmission } from '../services/api.js';
import CodeViewer from '../components/CodeViewer.jsx';
import SubmissionDetailPage from '../components/SubmissionDetailPage.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import '../styles/BuildStatus.css';

export default function JuniorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailSubmissionId, setDetailSubmissionId] = useState(null);
  const [expandedBuildLogs, setExpandedBuildLogs] = useState({});
  const [buildLogs, setBuildLogs] = useState({});
  const [resubmitModal, setResubmitModal] = useState(null); // { previousSubmissionId, ... }
  const [resubmitForm, setResubmitForm] = useState({
    codeSnippet: '',
    filesChanged: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    sourceBranch: '',
    targetBranch: 'develop',
    title: '',
    description: '',
    codeSnippet: '',
    filesChanged: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [submissionsData, projectsData] = await Promise.all([
        getSubmissions(),
        getProjects(),
      ]);
      setSubmissions(submissionsData || []);
      setProjects(projectsData || []);
      
      // Load build logs for each submission
      const logs = {};
      for (const sub of submissionsData || []) {
        try {
          const buildData = await getBuildLogs(sub._id);
          logs[sub._id] = buildData;
        } catch (err) {
          console.error(`Failed to load builds for ${sub._id}:`, err);
          logs[sub._id] = [];
        }
      }
      setBuildLogs(logs);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      setSubmissions([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const filesArray = formData.filesChanged
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      await createSubmission(
        formData.projectId,
        formData.sourceBranch,
        formData.targetBranch,
        formData.title,
        formData.description,
        formData.codeSnippet,
        filesArray
      );
      setSuccess('Submission created successfully! Build started automatically.');
      setFormData({
        projectId: '',
        sourceBranch: '',
        targetBranch: 'develop',
        title: '',
        description: '',
        codeSnippet: '',
        filesChanged: '',
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create submission');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBuildLogs = (submissionId) => {
    setExpandedBuildLogs(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
  };

  const handleResubmitClick = (submission) => {
    setResubmitModal({
      previousSubmissionId: submission._id,
      title: submission.title,
      rejection: submission.rejectionFeedback,
    });
    setResubmitForm({
      codeSnippet: '',
      filesChanged: '',
    });
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!resubmitForm.codeSnippet.trim()) {
      setError('Please provide updated code');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const filesArray = resubmitForm.filesChanged
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      await resubmitSubmission(
        resubmitModal.previousSubmissionId,
        resubmitForm.codeSnippet,
        filesArray
      );
      setSuccess('Code resubmitted successfully! Build started automatically.');
      setResubmitModal(null);
      setResubmitForm({ codeSnippet: '', filesChanged: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to resubmit');
    } finally {
      setSubmitting(false);
    }
  };

  const getBuildStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return '✅';
      case 'FAILED': return '❌';
      case 'RUNNING': return '⚙️';
      case 'PENDING': return '⏳';
      default: return '⚪';
    }
  };

  const getBuildStatusClass = (status) => {
    return `build-status-${(status || 'pending').toLowerCase()}`;
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2>📤 Submit Code</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Source Branch</label>
            <input
              type="text"
              name="sourceBranch"
              placeholder="e.g., feature/auth-system"
              value={formData.sourceBranch}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Branch</label>
            <input
              type="text"
              name="targetBranch"
              value={formData.targetBranch}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Brief description of changes"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Detailed explanation of your changes"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Code Snippet</label>
            <textarea
              name="codeSnippet"
              placeholder="Paste your code here..."
              value={formData.codeSnippet}
              onChange={handleInputChange}
              rows="12"
              className="code-input"
            />
          </div>

          <div className="form-group">
            <label>Files Changed (one per line)</label>
            <textarea
              name="filesChanged"
              placeholder="src/auth.js&#10;src/utils/helpers.js&#10;tests/auth.test.js"
              value={formData.filesChanged}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Code'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>📋 My Submissions</h2>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          submissions.map((sub) => {
            const latestBuild = buildLogs[sub._id]?.[0];
            const isExpanded = expandedBuildLogs[sub._id];
            const isRejected = sub.status === 'REJECTED';

            return (
              <div key={sub._id} className="submission-item">
                <div className="details">
                  <div className="submission-header">
                    <h3>{sub.title}</h3>
                    <span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span>
                  </div>

                  <p>Branch: {sub.sourceBranch} → {sub.targetBranch}</p>
                  <p>{sub.description}</p>

                  {/* Rejection Feedback Card */}
                  {isRejected && sub.rejectionFeedback && (
                    <div className="rejection-feedback-card">
                      <div className="rejection-header">
                        <span className="rejection-icon">🔴</span>
                        <div className="rejection-info">
                          <h4>Changes Requested</h4>
                          <p className="rejection-meta">
                            by <strong>{sub.rejectionFeedback.reviewerRole}</strong> on{' '}
                            {new Date(sub.rejectionFeedback.rejectedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="rejection-reason">{sub.rejectionFeedback.reason}</p>
                      {sub.rejectionFeedback.fileName && (
                        <p className="rejection-detail">
                          <strong>File:</strong> {sub.rejectionFeedback.fileName}
                        </p>
                      )}
                      {sub.rejectionFeedback.lineNumber && (
                        <p className="rejection-detail">
                          <strong>Line:</strong> {sub.rejectionFeedback.lineNumber}
                        </p>
                      )}
                    </div>
                  )}

                  {latestBuild && (
                    <div className="build-status-section">
                      <div className="build-status-header">
                        <span className={`build-badge ${getBuildStatusClass(latestBuild.status)}`}>
                          {getBuildStatusIcon(latestBuild.status)} Build {latestBuild.status}
                        </span>
                        {latestBuild.testResults && (
                          <span className="test-results">
                            🧪 {latestBuild.testResults.passed}/{latestBuild.testResults.total} tests passed
                            {latestBuild.testResults.coverage && (
                              <> · {latestBuild.testResults.coverage}% coverage</>
                            )}
                          </span>
                        )}
                        {latestBuild.duration && (
                          <span className="build-duration">
                            ⏱️ {Math.floor(latestBuild.duration / 1000)}s
                          </span>
                        )}
                      </div>

                      {latestBuild.status === 'RUNNING' && (
                        <div className="build-progress">
                          <div className="progress-bar">
                            <div className="progress-bar-fill running"></div>
                          </div>
                          <p className="build-message">Build in progress...</p>
                        </div>
                      )}

                      {latestBuild.logs && (
                        <button
                          className="view-logs-btn"
                          onClick={() => toggleBuildLogs(sub._id)}
                        >
                          {isExpanded ? '▼ Hide Logs' : '▶ View Logs'}
                        </button>
                      )}

                      {isExpanded && latestBuild.logs && (
                        <pre className="build-logs">
                          <code>{latestBuild.logs}</code>
                        </pre>
                      )}
                    </div>
                  )}

                  <div className="submission-actions">
                    {isRejected && (
                      <button
                        className="btn-warning"
                        onClick={() => handleResubmitClick(sub)}
                      >
                        🔄 Resubmit Changes
                      </button>
                    )}
                    {(sub.codeSnippet || (sub.codeLines && sub.codeLines.length > 0)) && (
                      <>
                        <button
                          className="btn-secondary"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          👁️ View Code
                        </button>
                        <button
                          className="btn-info"
                          onClick={() => setDetailSubmissionId(sub._id)}
                        >
                          📊 Full Details
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedSubmission && (
        <CodeViewer
          codeLines={selectedSubmission.codeLines || []}
          code={selectedSubmission.codeSnippet}
          filesChanged={selectedSubmission.filesChanged}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {detailSubmissionId && (
        <ErrorBoundary onReset={() => setDetailSubmissionId(null)}>
          <SubmissionDetailPage
            submissionId={detailSubmissionId}
            onClose={() => setDetailSubmissionId(null)}
          />
        </ErrorBoundary>
      )}

      {/* Resubmit Modal */}
      {resubmitModal && (
        <div className="resubmit-modal-overlay" onClick={() => setResubmitModal(null)}>
          <div className="resubmit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="resubmit-modal-header">
              <h2>Resubmit: {resubmitModal.title}</h2>
              <button className="modal-close" onClick={() => setResubmitModal(null)}>✕</button>
            </div>

            {/* Show the rejection feedback */}
            {resubmitModal.rejection && (
              <div className="rejection-context">
                <h4>Feedback from {resubmitModal.rejection.reviewerRole}:</h4>
                <p className="rejection-message">{resubmitModal.rejection.reason}</p>
                {resubmitModal.rejection.fileName && (
                  <p><strong>File:</strong> {resubmitModal.rejection.fileName}</p>
                )}
                {resubmitModal.rejection.lineNumber && (
                  <p><strong>Line:</strong> {resubmitModal.rejection.lineNumber}</p>
                )}
              </div>
            )}

            <form onSubmit={handleResubmit}>
              <div className="form-group">
                <label>Updated Code Snippet</label>
                <textarea
                  placeholder="Paste your updated code here..."
                  value={resubmitForm.codeSnippet}
                  onChange={(e) => setResubmitForm({...resubmitForm, codeSnippet: e.target.value})}
                  rows="12"
                  className="code-input"
                />
              </div>

              <div className="form-group">
                <label>Updated Files Changed (one per line)</label>
                <textarea
                  placeholder="List updated files..."
                  value={resubmitForm.filesChanged}
                  onChange={(e) => setResubmitForm({...resubmitForm, filesChanged: e.target.value})}
                  rows="4"
                />
              </div>

              <div className="resubmit-actions">
                <button type="button" className="btn-secondary" onClick={() => setResubmitModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-success" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Updated Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}    </div>
  );
}