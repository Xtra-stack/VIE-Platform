import React, { useState, useEffect } from 'react';
import {
  getSubmissions,
  createSubmission,
  getProjects,
  getSubmission,
  getBuildLogs,
  resubmitSubmission,
  getMyTasks,
  updateTaskStatus,
  executeTerminalCommand,
  getTerminalHistory,
} from '../services/api.js';
import CodeViewer from '../components/CodeViewer.jsx';
import CodeDiff from '../components/CodeDiff.jsx';
import TerminalOutput from '../components/TerminalOutput.jsx';
import SubmissionDetailPage from '../components/SubmissionDetailPage.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import CodeEditorPanel from '../components/CodeEditor/CodeEditorPanel.jsx';
import SimulatedTerminal from '../components/CodeEditor/SimulatedTerminal.jsx';
import RoleStats from '../components/RoleStats.jsx';
import '../styles/BuildStatus.css';
import '../styles/TerminalOutput.css';

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
  const [showCodeDiff, setShowCodeDiff] = useState(null); // submissionId for showing diff
  const [resubmitForm, setResubmitForm] = useState({
    codeSnippet: '',
    filesChanged: '',
  });

  const workspaceTemplate = {
    'src/taskSolution.js': '',
    'src/helpers.js': '// helper functions\n',
    'README.md': '# Task notes\n',
  };

  const [submitWorkspace, setSubmitWorkspace] = useState({
    currentFile: 'src/taskSolution.js',
    files: { ...workspaceTemplate },
    showTerminal: true,
  });

  const [resubmitWorkspace, setResubmitWorkspace] = useState({
    currentFile: 'src/taskSolution.js',
    files: { ...workspaceTemplate },
    showTerminal: true,
  });

  // Task management state
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskError, setTaskError] = useState('');

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
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setFormData((prev) => ({
        ...prev,
        projectId: selectedTask.projectId?._id || selectedTask.projectId || prev.projectId,
        title: selectedTask.title || prev.title,
        description: selectedTask.description || prev.description,
      }));
    }
  }, [selectedTask]);

  useEffect(() => {
    setSubmitWorkspace((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [prev.currentFile]: formData.codeSnippet || '',
      },
    }));
  }, [formData.codeSnippet]);

  useEffect(() => {
    setResubmitWorkspace((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [prev.currentFile]: resubmitForm.codeSnippet || '',
      },
    }));
  }, [resubmitForm.codeSnippet]);

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

  const loadTasks = async () => {
    try {
      const tasksData = await getMyTasks();
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTaskError(err.message || 'Failed to load tasks');
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setSuccess(`Task status updated to ${newStatus}`);
      await loadTasks();
    } catch (err) {
      setTaskError(err.message || 'Failed to update task status');
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
        filesArray,
        selectedTask?._id || null
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
      setSubmitWorkspace({
        currentFile: 'src/taskSolution.js',
        files: { ...workspaceTemplate },
        showTerminal: true,
      });
      setSelectedTask(null);
      await loadData();
      await loadTasks();
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
    const originalCode = submission.codeSnippet || '';
    setResubmitModal({
      previousSubmissionId: submission._id,
      title: submission.title,
      rejection: submission.rejectionFeedback,
      originalCode,
    });
    setResubmitForm({
      codeSnippet: originalCode,
      filesChanged: '',
    });
    setResubmitWorkspace({
      currentFile: 'src/taskSolution.js',
      files: {
        ...workspaceTemplate,
        'src/taskSolution.js': originalCode,
      },
      showTerminal: true,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED': return '#2196F3';
      case 'IN_PROGRESS': return '#FF9800';
      case 'SUBMITTED': return '#9C27B0';
      case 'CHANGES_REQUESTED': return '#F44336';
      case 'APPROVED': return '#4CAF50';
      default: return '#757575';
    }
  };

  const submitFileList = Object.keys(submitWorkspace.files || {});
  const resubmitFileList = Object.keys(resubmitWorkspace.files || {});

  const handleSubmitFileSelect = (fileName) => {
    setSubmitWorkspace((prev) => ({ ...prev, currentFile: fileName }));
    setFormData((prev) => ({
      ...prev,
      codeSnippet: submitWorkspace.files[fileName] || '',
    }));
  };

  const handleSubmitCodeChange = (newContent) => {
    setSubmitWorkspace((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [prev.currentFile]: newContent,
      },
    }));
    setFormData((prev) => ({ ...prev, codeSnippet: newContent }));
  };

  const handleResubmitFileSelect = (fileName) => {
    setResubmitWorkspace((prev) => ({ ...prev, currentFile: fileName }));
    setResubmitForm((prev) => ({
      ...prev,
      codeSnippet: resubmitWorkspace.files[fileName] || '',
    }));
  };

  const handleResubmitCodeChange = (newContent) => {
    setResubmitWorkspace((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [prev.currentFile]: newContent,
      },
    }));
    setResubmitForm((prev) => ({ ...prev, codeSnippet: newContent }));
  };

  const executeWorkspaceCommand = async (command, sessionId) => {
    return await executeTerminalCommand(command, sessionId);
  };

  const loadWorkspaceTerminalHistory = async (sessionId) => {
    const terminalData = await getTerminalHistory(100);
    return (terminalData.history || []).filter((entry) => entry.sessionId === sessionId);
  };

  return (
    <DashboardLayout
      title="Junior Developer Dashboard"
      subtitle="Build, submit, and improve through review cycles"
    >
    <div>
      <RoleStats role="JUNIOR" />
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {taskError && <div className="error">{taskError}</div>}

      {/* Assigned Tasks Section */}
      <div className="card">
        <h2>📋 Assigned Tasks</h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
          Your assigned workspace tasks with status tracking.
        </p>

        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-grey-dark)' }}>No tasks assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((task) => (
              <div 
                key={task._id} 
                style={{ 
                  padding: '15px', 
                  border: '1px solid var(--border-dark)', 
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-dark-secondary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{task.title}</h3>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--text-grey)' }}>
                      {task.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: '#e3f2fd', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {task.projectType}
                      </span>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: '#f3e5f5', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {task.techArea}
                      </span>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: getStatusColor(task.status), 
                        color: 'white',
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {task.status === 'ASSIGNED' && (
                      <button 
                        onClick={() => handleTaskStatusUpdate(task._id, 'IN_PROGRESS')}
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        Start Work
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => setSelectedTask(task)}
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        Submit Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>📤 Submit Code</h2>
        {selectedTask && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(61, 220, 151, 0.12)',
            border: '1px solid rgba(61, 220, 151, 0.25)',
          }}>
            <strong>Submitting for task:</strong> {selectedTask.title}
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              style={{ marginLeft: '12px', padding: '4px 10px', fontSize: '12px' }}
            >
              Clear
            </button>
          </div>
        )}
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
            <label>💻 Coding Environment</label>
            <p style={{ color: 'var(--text-grey)', marginBottom: '10px' }}>
              Work in a file-based editor with terminal simulation before submitting.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {submitFileList.map((fileName) => (
                <button
                  key={fileName}
                  type="button"
                  className={submitWorkspace.currentFile === fileName ? '' : 'secondary'}
                  onClick={() => handleSubmitFileSelect(fileName)}
                >
                  {fileName}
                </button>
              ))}
              <button
                type="button"
                className="secondary"
                onClick={() => setSubmitWorkspace((prev) => ({ ...prev, showTerminal: !prev.showTerminal }))}
              >
                {submitWorkspace.showTerminal ? 'Hide Terminal' : 'Show Terminal'}
              </button>
            </div>

            <CodeEditorPanel
              currentFile={submitWorkspace.currentFile}
              content={submitWorkspace.files[submitWorkspace.currentFile] || ''}
              onChange={handleSubmitCodeChange}
              language="javascript"
            />

            {submitWorkspace.showTerminal && (
              <div style={{ marginTop: '12px' }}>
                <SimulatedTerminal
                  sessionId="junior-submit"
                  onExecuteCommand={executeWorkspaceCommand}
                  onLoadHistory={loadWorkspaceTerminalHistory}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>📁 Files Changed (one per line)</label>
            <textarea
              name="filesChanged"
              placeholder="src/taskSolution.js&#10;src/helpers.js&#10;README.md"
              value={formData.filesChanged}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <button type="submit" disabled={submitting} style={{ marginTop: '12px' }}>
            {submitting ? '⏳ Submitting...' : '✅ Submit Code'}
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
                              <> · <span style={{ 
                                color: latestBuild.testResults.passedThreshold === false ? '#f44336' : 'inherit',
                                fontWeight: latestBuild.testResults.passedThreshold === false ? 'bold' : 'normal'
                              }}>
                                {latestBuild.testResults.coverage}% coverage
                                {latestBuild.testResults.passedThreshold === false && 
                                  ` (⚠️ Min: ${latestBuild.testResults.coverageThreshold}%)`
                                }
                              </span></>
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
                        <>
                          <pre className="build-logs">
                            <code>{latestBuild.logs}</code>
                          </pre>
                          <TerminalOutput logs={latestBuild.logs} title="Build Logs" />
                        </>
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
                    {sub.previousSubmission && (
                      <button
                        className="btn-secondary"
                        onClick={() => setShowCodeDiff(sub._id)}
                      >
                        🔀 View Diff
                      </button>
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
                <label>💻 Updated Coding Environment</label>
                <p style={{ color: 'var(--text-grey)', marginBottom: '10px' }}>
                  Edit your previous code in the workspace environment and resubmit.
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {resubmitFileList.map((fileName) => (
                    <button
                      key={fileName}
                      type="button"
                      className={resubmitWorkspace.currentFile === fileName ? '' : 'secondary'}
                      onClick={() => handleResubmitFileSelect(fileName)}
                    >
                      {fileName}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setResubmitWorkspace((prev) => ({ ...prev, showTerminal: !prev.showTerminal }))}
                  >
                    {resubmitWorkspace.showTerminal ? 'Hide Terminal' : 'Show Terminal'}
                  </button>
                </div>

                <CodeEditorPanel
                  currentFile={resubmitWorkspace.currentFile}
                  content={resubmitWorkspace.files[resubmitWorkspace.currentFile] || ''}
                  onChange={handleResubmitCodeChange}
                  language="javascript"
                />

                {resubmitWorkspace.showTerminal && (
                  <div style={{ marginTop: '12px' }}>
                    <SimulatedTerminal
                      sessionId={`junior-resubmit-${resubmitModal.previousSubmissionId}`}
                      onExecuteCommand={executeWorkspaceCommand}
                      onLoadHistory={loadWorkspaceTerminalHistory}
                    />
                  </div>
                )}
              </div>

              {resubmitModal.originalCode && (
                <div className="form-group">
                  <label>🔀 Old vs Updated Code</label>
                  <CodeDiff
                    oldCode={resubmitModal.originalCode}
                    newCode={resubmitForm.codeSnippet}
                    title="Resubmission Changes"
                  />
                </div>
              )}

              <div className="form-group">
                <label>📁 Updated Files Changed (one per line)</label>
                <textarea
                  placeholder="src/taskSolution.js&#10;src/helpers.js"
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
                  {submitting ? '⏳ Submitting...' : '✅ Submit Updated Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Diff Modal */}
      {showCodeDiff && submissions.find(s => s._id === showCodeDiff) && (
        <div className="code-diff-modal-overlay" onClick={() => setShowCodeDiff(null)}>
          <div className="code-diff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="code-diff-modal-header">
              <h2>Code Changes Comparison</h2>
              <button className="modal-close" onClick={() => setShowCodeDiff(null)}>✕</button>
            </div>
            <div className="code-diff-modal-body">
              <CodeDiff
                oldCode={submissions.find(s => s._id === showCodeDiff)?.previousSubmission?.codeSnippet || ''}
                newCode={submissions.find(s => s._id === showCodeDiff)?.codeSnippet || ''}
                title="Changes in this submission"
              />
            </div>
          </div>
        </div>
      )}    </div>
    </DashboardLayout>
  );
}