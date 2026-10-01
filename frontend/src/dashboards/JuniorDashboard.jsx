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
  getCareerProfile,
  getUnlockables,
} from '../services/api.js';
import CodeViewer from '../components/CodeViewer.jsx';
import CodeDiff from '../components/CodeDiff.jsx';
import TerminalOutput from '../components/TerminalOutput.jsx';
import SubmissionDetailPage from '../components/SubmissionDetailPage.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import DashboardLayout from '../components/DashboardLayout.jsx';
import CodeEditorPanel from '../components/CodeEditor/CodeEditorPanel.jsx';
import SimulatedTerminal from '../components/CodeEditor/SimulatedTerminal.jsx';
import { ActivityItem, ChartCard, EmptyState, LoadingState, PageHeader, StatCard, StatusBadge } from '../components/DashboardPrimitives.jsx';
import { getUser } from '../utils/auth.js';
import '../styles/BuildStatus.css';
import '../styles/TerminalOutput.css';
import '../styles/JuniorDashboard.css';

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
  const [learningProfile, setLearningProfile] = useState(null);
  const [learningUnlockables, setLearningUnlockables] = useState([]);
  const [learningLoading, setLearningLoading] = useState(true);
  const [learningError, setLearningError] = useState('');

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
    loadLearning();
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

  const loadLearning = async () => {
    setLearningLoading(true);
    setLearningError('');
    try {
      const [profile, unlockables] = await Promise.all([getCareerProfile(), getUnlockables()]);
      setLearningProfile(profile || null);
      setLearningUnlockables(unlockables || []);
    } catch (err) {
      console.error('Error loading learning data:', err);
      setLearningError(err.message || 'Learning data unavailable');
      setLearningProfile(null);
      setLearningUnlockables([]);
    } finally {
      setLearningLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout title="Junior Developer Dashboard" subtitle="Build, submit, and improve through review cycles">
        <LoadingState message="Loading developer workspace..." />
      </DashboardLayout>
    );
  }

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

  const user = getUser();
  const displayName = user?.fullName || user?.name || user?.username || 'Junior Developer';
  const taskCounts = {
    assigned: tasks.filter((task) => task.status === 'ASSIGNED').length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    completed: tasks.filter((task) => task.status === 'APPROVED').length,
  };
  const latestSubmissions = [...submissions]
    .sort((first, second) => new Date(second.submittedAt || second.createdAt || 0) - new Date(first.submittedAt || first.createdAt || 0))
    .slice(0, 5);
  const recentActivities = [
    ...tasks.map((task) => ({
      id: `task-${task._id}`,
      title: `Task ${task.status === 'APPROVED' ? 'completed' : 'updated'}`,
      description: task.title || 'Task title unavailable',
      timestamp: task.updatedAt || task.createdAt,
      tone: task.status === 'APPROVED' ? 'green' : 'blue',
    })),
    ...latestSubmissions.map((submission) => ({
      id: `submission-${submission._id}`,
      title: 'Code submitted',
      description: submission.title || 'Submission title unavailable',
      timestamp: submission.submittedAt || submission.createdAt,
      tone: submission.status === 'REJECTED' ? 'orange' : 'purple',
    })),
  ]
    .sort((first, second) => new Date(second.timestamp || 0) - new Date(first.timestamp || 0))
    .slice(0, 5);
  const formatDate = (timestamp) => timestamp
    ? new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Date unavailable';
  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const learningItems = Array.isArray(learningProfile?.unlocked)
    ? learningProfile.unlocked
    : learningUnlockables.filter((item) => item.unlocked || item.completed);

  return (
    <DashboardLayout
      title="Junior Developer Dashboard"
      subtitle="Build, submit, and improve through review cycles"
    >
    <div className="junior-dashboard">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {taskError && <div className="error">{taskError}</div>}

      <PageHeader
        title={`Good morning, ${displayName} 👋`}
        subtitle="Continue your tasks, learning and development work."
      />

      <div className="junior-data-note">Live task, submission, and build data is shown below. Progress is only displayed when the existing APIs provide it.</div>

      <section className="junior-kpi-grid" aria-label="Junior Developer KPIs">
        <StatCard title="My Tasks" value={tasks.length} subtitle={tasks.length ? 'Assigned tasks' : 'No assigned tasks yet'} icon="✓" />
        <StatCard title="In Progress" value={tasks.length ? taskCounts.inProgress : 'N/A'} subtitle={tasks.length ? 'Tasks currently underway' : 'No task data'} icon="◷" />
        <StatCard title="Completed" value={tasks.length ? taskCounts.completed : 'N/A'} subtitle={tasks.length ? 'Approved tasks' : 'No task data'} icon="✓" />
        <StatCard title="Builds / Submissions" value={submissions.length} subtitle={submissions.length ? `${Object.values(buildLogs).flat().length} build records loaded` : 'No recent submissions'} icon="⇧" />
      </section>

      <div className="junior-dashboard-grid">
        <ChartCard title="My Tasks" subtitle="Work assigned through the existing workspace task API">
          {tasks.length === 0 ? (
            <EmptyState icon="✓" title="No assigned tasks yet" message="Assigned workspace tasks will appear here." />
          ) : (
            <div className="junior-task-list">
              {tasks.slice(0, 5).map((task) => (
                <div className="junior-task-row" key={task._id}>
                  <span className={`junior-task-check ${task.status === 'APPROVED' ? 'complete' : ''}`}>{task.status === 'APPROVED' ? '✓' : '○'}</span>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.projectType} · {task.techArea}{task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ''}</span>
                  </div>
                  <StatusBadge status={task.status} tone={task.status === 'APPROVED' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'neutral'} />
                </div>
              ))}
            </div>
          )}
          {tasks.length > 5 && <button type="button" className="junior-inline-action" onClick={() => scrollToSection('junior-assigned-tasks')}>View all tasks →</button>}
        </ChartCard>

        <ChartCard title="Coding Workspace" subtitle="Continue work in the existing VIE editor and submission flow">
          <div className="junior-workspace-actions">
            <button type="button" onClick={() => window.location.assign('/code-editor')}>Open Coding Workspace <span>→</span></button>
            <button type="button" onClick={() => scrollToSection('junior-submit-work')}>Submit Work <span>→</span></button>
            <button type="button" onClick={() => scrollToSection('junior-submissions')}>View Submissions <span>→</span></button>
            <button type="button" onClick={() => scrollToSection('junior-submissions')}>View Feedback <span>→</span></button>
          </div>
        </ChartCard>
      </div>

      <div className="junior-dashboard-grid junior-dashboard-grid-secondary">
        <ChartCard title="Learning Progress" subtitle="Career and unlockable data from VIE learning services">
          {learningLoading ? (
            <LoadingState message="Loading learning progress..." />
          ) : learningError ? (
            <EmptyState icon="◇" title="Start your learning journey" message="Learning progress is currently unavailable." />
          ) : learningItems.length === 0 ? (
            <EmptyState icon="◇" title="Start your learning journey" message="Complete work and unlock learning milestones to see progress here." />
          ) : (
            <div className="junior-learning-summary">
              <strong>{learningItems.length} learning milestone{learningItems.length === 1 ? '' : 's'} unlocked</strong>
              <p>Milestones currently returned by the career service. A completion percentage is not available.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Recent Activity" subtitle="Task, submission, and review activity from your workspace">
          {recentActivities.length === 0 ? (
            <EmptyState icon="◷" title="No recent activity" message="Task and submission activity will appear here." />
          ) : (
            <div className="junior-activity-list">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} title={activity.title} description={activity.description} timestamp={formatDate(activity.timestamp)} tone={activity.tone} />
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="My Projects" subtitle="Projects currently returned by the existing project API">
        {projects.length === 0 ? (
          <EmptyState icon="▦" title="No projects assigned" message="Projects will appear here when they are available to your account." />
        ) : (
          <div className="junior-project-list">
            {projects.map((project) => (
              <div className="junior-project-row" key={project._id || project.id || project.slug || project.name}>
                <div><strong>{project.name}</strong><span>{project.description || 'Project details unavailable'}</span></div>
                <StatusBadge status="Available" tone="info" />
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* Assigned Tasks Section */}
      <div className="card" id="junior-assigned-tasks">
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

      <div className="card" id="junior-submit-work">
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

      <div className="card" id="junior-submissions">
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