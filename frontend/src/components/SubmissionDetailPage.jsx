import React, { useState, useEffect } from 'react';
import { getSubmission, getActivityLog, mergeSubmission, deploySubmission } from '../services/api.js';
import CodeViewer from './CodeViewer.jsx';
import ActivityTimeline from './ActivityTimeline.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export default function SubmissionDetailPage({ submissionId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [merging, setMerging] = useState(false);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (!submissionId) {
      console.error('SubmissionDetailPage: No submissionId provided');
      setError('No submission ID provided');
      setLoading(false);
      return;
    }
    loadData();
  }, [submissionId]);

  const loadData = async () => {
    if (!submissionId) {
      console.error('loadData: submissionId is missing');
      setError('Submission ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Loading submission details for:', submissionId);
      const [subData, activityData] = await Promise.all([
        getSubmission(submissionId),
        getActivityLog(submissionId),
      ]);
      
      if (!subData) {
        console.error('No submission data returned from API');
        setError('Failed to load submission - no data returned');
        setLoading(false);
        return;
      }

      console.log('Submission data loaded:', subData);
      setSubmission(subData);
      setActivities(activityData?.data || []);
    } catch (err) {
      console.error('Error loading submission details:', err);
      const errorMsg = err?.message || err?.error || 'Failed to load submission details';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!submissionId) {
      console.error('handleMerge: submissionId is missing');
      setError('Submission ID is required');
      return;
    }
    
    setMerging(true);
    setError('');
    try {
      console.log('Merging submission:', submissionId);
      await mergeSubmission(submissionId);
      setSubmission(prev => prev ? { ...prev, mergedAt: new Date() } : null);
      await loadData();
    } catch (err) {
      console.error('Merge failed:', err);
      setError(err?.message || 'Failed to merge');
    } finally {
      setMerging(false);
    }
  };

  const handleDeploy = async () => {
    if (!submissionId) {
      console.error('handleDeploy: submissionId is missing');
      setError('Submission ID is required');
      return;
    }

    setDeploying(true);
    setError('');
    try {
      console.log('Deploying submission:', submissionId);
      await deploySubmission(submissionId);
      setSubmission(prev => prev ? { 
        ...prev, 
        deployedAt: new Date(), 
        status: 'DEPLOYED' 
      } : null);
      await loadData();
    } catch (err) {
      console.error('Deploy failed:', err);
      setError(err?.message || 'Failed to deploy');
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="submission-detail-modal-overlay">
        <div className="submission-detail-modal">
          <div className="loading">Loading submission details...</div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="submission-detail-modal-overlay" onClick={onClose}>
        <div className="submission-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Submission Details</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="error">
              {error || 'Submission not found'}
            </div>
            <button className="close-detail-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={() => loadData()}>
      <div className="submission-detail-modal-overlay" onClick={onClose}>
        <div className="submission-detail-modal" onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="modal-header">
            <div style={{ flex: 1 }}>
              <h2>{submission?.title || 'Submission Details'}</h2>
            </div>
            <span className={`status-badge ${submission?.status?.toLowerCase() || 'pending'}`}>
              {submission?.status || 'Unknown'}
            </span>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {error && <div className="error">{error}</div>}

            {submission ? (
              <>
                <div className="detail-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Branch:</strong> {submission.sourceBranch || 'N/A'} → {submission.targetBranch || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Submitted:</strong> {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                    </div>
                    {submission.mergedAt && (
                      <div className="info-item">
                        <strong>Merged:</strong> {new Date(submission.mergedAt).toLocaleString()}
                      </div>
                    )}
                    {submission.deployedAt && (
                      <div className="info-item">
                        <strong>Deployed:</strong> {new Date(submission.deployedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {submission.description && (
                    <p className="description">{submission.description}</p>
                  )}

                  {submission.codeLines && submission.codeLines.length > 0 && (
                    <button 
                      className="view-code-btn"
                      onClick={() => setShowCode(true)}
                    >
                      👁️ View Code ({submission.codeLines.length} lines)
                    </button>
                  )}
                </div>

                {submission.status === 'MANAGER_APPROVED' && (
                  <div className="action-buttons">
                    {!submission.mergedAt && (
                      <button
                        onClick={handleMerge}
                        disabled={merging}
                        className="action-btn merge-btn"
                      >
                        {merging ? '🔀 Merging...' : '🔀 Merge'}
                      </button>
                    )}
                    {submission.mergedAt && !submission.deployedAt && (
                      <button
                        onClick={handleDeploy}
                        disabled={deploying}
                        className="action-btn deploy-btn"
                      >
                        {deploying ? '🚀 Deploying...' : '🚀 Deploy'}
                      </button>
                    )}
                  </div>
                )}

                {activities && activities.length > 0 ? (
                  <ActivityTimeline activities={activities} />
                ) : (
                  <div className="activity-timeline">
                    <h3>📊 Activity Timeline</h3>
                    <p className="no-activity">No activity yet</p>
                  </div>
                )}

                {showCode && submission.codeLines && (
                  <CodeViewer
                    codeLines={submission.codeLines}
                    filesChanged={submission.filesChanged}
                    onClose={() => setShowCode(false)}
                  />
                )}
              </>
            ) : (
              <div className="error">Unable to display submission details</div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ borderTop: '1px solid #ddd', padding: '15px', textAlign: 'right' }}>
            <button className="close-detail-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
