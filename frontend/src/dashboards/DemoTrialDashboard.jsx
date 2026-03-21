import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { getDemoState, submitDemoTask } from '../services/api.js';
import CodeEditor from '../components/CodeEditor.jsx';
import TerminalOutput from '../components/TerminalOutput.jsx';

export default function DemoTrialDashboard() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [workspaceByTask, setWorkspaceByTask] = useState({});
  const workspaceSectionRef = useRef(null);

  const getTaskId = (task) => task?.id || task?._id || '';

  const loadState = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDemoState();
      setState(data);
    } catch (err) {
      setError(err.message || 'Failed to load demo state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    const firstPending = (state?.tasks || []).find((task) => task.status !== 'APPROVED');
    if (firstPending && !selectedTaskId) {
      setSelectedTaskId(getTaskId(firstPending));
    }

    if ((state?.tasks || []).length > 0) {
      setWorkspaceByTask((prev) => {
        const next = { ...prev };
        state.tasks.forEach((task) => {
          const taskId = getTaskId(task);
          if (!taskId || next[taskId]) {
            return;
          }

          next[taskId] = {
              activeFile: 'src/taskSolution.js',
              codeSnippet: `// ${task.title}\nexport function solveTask(input) {\n  // TODO: implement your logic for this problem statement\n  return input;\n}\n`,
              terminalCommand: 'npm test',
              terminalLogs: ['Demo terminal ready', `Problem loaded: ${task.title}`],
            };
        });
        return next;
      });
    }
  }, [state, selectedTaskId]);

  const updateTaskWorkspace = (taskId, updates) => {
    if (!taskId) return;
    setWorkspaceByTask((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {
          activeFile: 'src/taskSolution.js',
          codeSnippet: '',
          terminalCommand: 'npm test',
          terminalLogs: ['Demo terminal ready'],
        }),
        ...updates,
      },
    }));
  };

  const handleSubmitTask = async (taskId) => {
    setError('');

    const taskWorkspace = workspaceByTask[taskId];

    if (!taskWorkspace?.codeSnippet?.trim()) {
      setError('Please write code before submitting this task.');
      return;
    }

    try {
      updateTaskWorkspace(taskId, {
        terminalLogs: [
          ...(taskWorkspace?.terminalLogs || []),
          `Submitting ${taskWorkspace?.activeFile || 'src/taskSolution.js'} for task ${taskId}...`,
          'Review request sent to mentor...',
        ],
      });
      await submitDemoTask(taskId);
      await loadState();
    } catch (err) {
      setError(err.message || 'Failed to submit demo task');
    }
  };

  const runTerminalCommand = () => {
    if (!selectedTaskId) return;

    const current = workspaceByTask[selectedTaskId] || {
      terminalCommand: '',
      terminalLogs: ['Demo terminal ready'],
    };

    const command = current.terminalCommand.trim();
    if (!command) return;

    const outputMap = {
      'npm test': [
        '> vie-demo@1.0.0 test',
        'PASS src/taskSolution.test.js',
        '✓ 3 tests passed',
      ],
      'npm run build': [
        '> vie-demo@1.0.0 build',
        'Building project...',
        '✓ Build completed successfully',
      ],
      'git status': [
        'On branch demo/junior-solution',
        'Changes not staged for commit:',
        'modified: src/taskSolution.js',
      ],
      'node src/taskSolution.js': [
        'Running local script...',
        'Output: task executed successfully',
      ],
    };

    const simulatedOutput = outputMap[command] || [`command not recognized in demo shell: ${command}`];
    updateTaskWorkspace(selectedTaskId, {
      terminalLogs: [...(current.terminalLogs || []), `> ${command}`, ...simulatedOutput],
      terminalCommand: '',
    });
  };

  if (loading) {
    return <div className="loading">Loading demo trial...</div>;
  }

  const tasks = state?.tasks || [];
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || tasks[0] || null;
  const selectedTaskKey = getTaskId(selectedTask);
  const currentWorkspace = selectedTaskKey ? workspaceByTask[selectedTaskKey] : null;
  const events = state?.events || [];
  const approvedCount = tasks.filter((task) => task.status === 'APPROVED').length;
  const submittedCount = tasks.filter((task) => task.status === 'SUBMITTED' || task.status === 'CHANGES_REQUESTED').length;
  const totalCount = tasks.length || 1;
  const completionPercent = Math.round((approvedCount / totalCount) * 100);

  const simulatedSkills = [
    { name: 'Frontend Development', xp: Math.min(100, approvedCount * 35 + submittedCount * 10), level: approvedCount >= 2 ? 2 : 1 },
    { name: 'API Development', xp: Math.min(100, approvedCount * 25 + submittedCount * 12), level: approvedCount >= 3 ? 2 : 1 },
    { name: 'Testing & QA', xp: Math.min(100, approvedCount * 30 + submittedCount * 15), level: approvedCount >= 2 ? 2 : 1 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED': return '#2196F3';
      case 'SUBMITTED': return '#9C27B0';
      case 'CHANGES_REQUESTED': return '#F44336';
      case 'APPROVED': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getNextActionLabel = (task) => {
    if (task.status === 'CHANGES_REQUESTED') return 'Resubmit';
    if (task.status === 'APPROVED') return 'Approved';
    return 'Submit';
  };

  return (
    <DashboardLayout title="Junior Demo Dashboard" subtitle="Simulated junior workflow with instant feedback and skill progression">
      <div>
        {error && <div className="error">{error}</div>}

        <div ref={workspaceSectionRef} className="card">
          <h2>Demo Workspace Overview</h2>
          <p><strong>User:</strong> {state?.user?.fullName} ({state?.user?.role})</p>
          <p><strong>Workspace:</strong> {state?.workspace?.name}</p>
          <p><strong>Project:</strong> {state?.project?.name}</p>
          <p><strong>Session Expires:</strong> {state?.expiresAt ? new Date(state.expiresAt).toLocaleString() : 'N/A'}</p>
        </div>

        <div className="card">
          <h2>Junior Progress Snapshot</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-dark-secondary)' }}>
              <p style={{ margin: 0, color: 'var(--text-grey)', fontSize: '12px' }}>Total Tasks</p>
              <h3 style={{ margin: '6px 0 0 0' }}>{tasks.length}</h3>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-dark-secondary)' }}>
              <p style={{ margin: 0, color: 'var(--text-grey)', fontSize: '12px' }}>Submitted</p>
              <h3 style={{ margin: '6px 0 0 0' }}>{submittedCount}</h3>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-dark-secondary)' }}>
              <p style={{ margin: 0, color: 'var(--text-grey)', fontSize: '12px' }}>Approved</p>
              <h3 style={{ margin: '6px 0 0 0' }}>{approvedCount}</h3>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-dark-secondary)' }}>
              <p style={{ margin: 0, color: 'var(--text-grey)', fontSize: '12px' }}>Completion</p>
              <h3 style={{ margin: '6px 0 0 0' }}>{completionPercent}%</h3>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Coding Environment (Demo)</h2>
          <p style={{ color: 'var(--text-grey)', marginTop: '-6px' }}>
            Practice in a VS Code-like flow: choose file, write code, run terminal commands, then submit.
          </p>

          {selectedTask && (
            <div style={{ marginTop: '10px', marginBottom: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-dark-secondary)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-grey)' }}>Current Problem Statement</p>
              <h3 style={{ margin: '6px 0' }}>{selectedTask.title}</h3>
              <p style={{ margin: 0 }}>{selectedTask.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="taskSelector" style={{ marginRight: '8px' }}>Switch Problem:</label>
            <select
              id="taskSelector"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              {tasks.map((task) => (
                <option key={getTaskId(task)} value={getTaskId(task)}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '14px', marginTop: '14px' }}>
            <div style={{ border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '10px', background: 'var(--bg-dark-secondary)' }}>
              <h3 style={{ marginTop: 0 }}>Files</h3>
              {['src/taskSolution.js', 'src/helpers.js', 'README.md'].map((fileName) => (
                <button
                  key={fileName}
                  type="button"
                  onClick={() => updateTaskWorkspace(selectedTaskId, { activeFile: fileName })}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    marginBottom: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: currentWorkspace?.activeFile === fileName ? '1px solid #1a7f67' : '1px solid var(--border-dark)',
                    background: currentWorkspace?.activeFile === fileName ? 'rgba(26, 127, 103, 0.15)' : 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {fileName}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>{currentWorkspace?.activeFile || 'src/taskSolution.js'}</div>
                <CodeEditor
                  code={currentWorkspace?.codeSnippet || ''}
                  onChange={(value) => updateTaskWorkspace(selectedTaskId, { codeSnippet: value })}
                  language="javascript"
                  placeholder="Write your demo task solution here..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={currentWorkspace?.terminalCommand || ''}
                  onChange={(e) => updateTaskWorkspace(selectedTaskId, { terminalCommand: e.target.value })}
                  placeholder="Try: npm test, npm run build, git status"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={runTerminalCommand}>Run</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => selectedTaskKey && handleSubmitTask(selectedTaskKey)}
                  disabled={!selectedTask || selectedTask.status === 'APPROVED'}
                >
                  {selectedTask?.status === 'CHANGES_REQUESTED' ? 'Submit Updated Code' : 'Submit Code For This Problem'}
                </button>
              </div>

              <TerminalOutput logs={currentWorkspace?.terminalLogs || []} title="Demo Terminal" />
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Assigned Tasks</h2>
          {tasks.map((task) => (
            <div key={getTaskId(task)} className="submission-item">
              <div className="details">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>
                  Status:
                  <strong style={{ color: getStatusColor(task.status), marginLeft: '6px' }}>{task.status}</strong>
                  <span style={{ marginLeft: '10px' }}>· Attempts: {task.attempts}</span>
                </p>
                {task.feedback && <p><strong>Feedback:</strong> {task.feedback}</p>}
              </div>
              <div className="actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTaskId(getTaskId(task));
                    workspaceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Open Workspace
                </button>
                {task.status !== 'APPROVED' && (
                  <button type="button" onClick={() => handleSubmitTask(getTaskId(task))}>
                    {getNextActionLabel(task)}
                  </button>
                )}
                {task.status === 'APPROVED' && <span style={{ color: '#4CAF50', fontWeight: 600 }}>✅ Approved</span>}
              </div>
            </div>
          ))}
          {tasks.length > 0 && (
            <p style={{ marginTop: '10px', color: 'var(--text-grey)' }}>
              Current selected task: <strong>{selectedTaskId || getTaskId(tasks[0])}</strong>
            </p>
          )}
        </div>

        <div className="card">
          <h2>Simulated Skill Growth</h2>
          <p style={{ color: 'var(--text-grey)', marginTop: '-6px' }}>
            Demo preview of how junior skills improve as tasks get approved.
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {simulatedSkills.map((skill) => (
              <div key={skill.name} style={{ display: 'grid', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{skill.name}</strong>
                  <span>Level {skill.level}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#2b2b2b', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${skill.xp}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #1a7f67, #4CAF50)',
                    }}
                  />
                </div>
                <small style={{ color: 'var(--text-grey)' }}>{skill.xp}% progress</small>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Review & Activity Timeline</h2>
          <ul>
            {events.slice().reverse().map((evt, index) => (
              <li key={`${evt.type}-${index}`}>{evt.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
