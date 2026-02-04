import React, { useState, useEffect, useRef } from 'react';
import DiffViewer from './DiffViewer.jsx';
import '../styles/ReviewModal.css';

export default function ReviewModal({ 
  submission, 
  onClose, 
  onApprove, 
  onRequestChanges, 
  onReject,
  onComment,
  userRole 
}) {
  const [comment, setComment] = useState('');
  const [inlineComments, setInlineComments] = useState([]);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' | 'files' | 'activity'
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false); // Show additional reject fields
  const [rejectFile, setRejectFile] = useState(''); // Optional file name
  const [rejectLine, setRejectLine] = useState(''); // Optional line number
  const modalRef = useRef(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on outside click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddInlineComment = (lineNumber, text) => {
    setInlineComments([...inlineComments, { 
      lineNumber, 
      comment: text,
      file: selectedFile || 'main'
    }]);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(submission._id, comment, inlineComments);
      onClose();
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!comment.trim()) {
      alert('Please provide a comment when requesting changes');
      return;
    }
    setLoading(true);
    try {
      await onRequestChanges(submission._id, comment, inlineComments);
      onClose();
    } catch (err) {
      console.error('Request changes failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setLoading(true);
    try {
      await onReject(
        submission._id, 
        comment, 
        inlineComments,
        rejectFile || null,
        rejectLine ? parseInt(rejectLine) : null
      );
      onClose();
    } catch (err) {
      console.error('Reject failed:', err);
      alert('Failed to reject submission: ' + err.message);
    } finally {
      setLoading(false);
      setShowRejectForm(false);
    }
  };

  const handleCommentOnly = async () => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }
    setLoading(true);
    try {
      await onComment(submission._id, comment, inlineComments);
      setComment('');
      setInlineComments([]);
      alert('Comment added successfully');
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return null;

  return (
    <div className="review-modal-overlay" onClick={handleOverlayClick}>
      <div className="review-modal" ref={modalRef}>
        {/* Header */}
        <div className="review-modal-header">
          <div className="modal-title">
            <h2>{submission.title}</h2>
            <span className="submission-meta">
              {submission.submittedBy} · {submission.sourceBranch} → {submission.targetBranch}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="review-tabs">
          <button 
            className={activeTab === 'diff' ? 'active' : ''} 
            onClick={() => setActiveTab('diff')}
          >
            📋 Code Changes
          </button>
          <button 
            className={activeTab === 'files' ? 'active' : ''} 
            onClick={() => setActiveTab('files')}
          >
            📁 Files ({submission.filesChanged?.length || 0})
          </button>
          <button 
            className={activeTab === 'activity' ? 'active' : ''} 
            onClick={() => setActiveTab('activity')}
          >
            📊 Activity
          </button>
        </div>

        {/* Body - Scrollable Content */}
        <div className="review-modal-body">
          {activeTab === 'diff' && (
            <DiffViewer 
              codeLines={submission.codeLines}
              codeSnippet={submission.codeSnippet}
              filesChanged={submission.filesChanged}
              onAddComment={userRole === 'SENIOR_DEV' ? handleAddInlineComment : null}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          )}

          {activeTab === 'files' && (
            <div className="files-list">
              {submission.filesChanged?.map((file, idx) => (
                <div 
                  key={idx} 
                  className={`file-item ${selectedFile === file ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFile(file);
                    setActiveTab('diff');
                  }}
                >
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file}</span>
                  <span className="file-stats">
                    +{submission.linesAdded || 0} -{submission.linesRemoved || 0}
                  </span>
                </div>
              ))}
              {(!submission.filesChanged || submission.filesChanged.length === 0) && (
                <p className="empty-state">No files changed</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">📤</span>
                <span className="activity-text">
                  <strong>{submission.submittedBy}</strong> submitted this code
                </span>
                <span className="activity-time">{new Date(submission.createdAt).toLocaleString()}</span>
              </div>
              {submission.reviews?.map((review, idx) => (
                <div key={idx} className="activity-item">
                  <span className="activity-icon">{review.status === 'APPROVED' ? '✅' : '💬'}</span>
                  <span className="activity-text">
                    <strong>{review.reviewer}</strong> {review.status}
                  </span>
                  <span className="activity-time">{new Date(review.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inline Comments Section */}
          {inlineComments.length > 0 && (
            <div className="inline-comments-preview">
              <h4>Your Comments ({inlineComments.length})</h4>
              {inlineComments.map((ic, idx) => (
                <div key={idx} className="inline-comment-item">
                  <span className="comment-line">Line {ic.lineNumber}</span>
                  <span className="comment-file">{ic.file}</span>
                  <p>{ic.comment}</p>
                  <button 
                    className="remove-comment"
                    onClick={() => setInlineComments(inlineComments.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Always Visible */}
        <div className="review-modal-footer">
          <div className="comment-box">
            <textarea
              placeholder="Add a comment (optional for approve, required for request changes/reject)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            
            {/* Optional: Show reject details form when user clicks reject */}
            {showRejectForm && userRole !== 'JUNIOR' && (
              <div className="reject-details-form">
                <h4>Additional Rejection Details (Optional)</h4>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="File name (e.g., src/App.jsx)"
                    value={rejectFile}
                    onChange={(e) => setRejectFile(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Line number"
                    value={rejectLine}
                    onChange={(e) => setRejectLine(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            
            {userRole === 'SENIOR_DEV' && (
              <>
                <button 
                  className="btn-comment" 
                  onClick={handleCommentOnly}
                  disabled={loading || !comment.trim()}
                >
                  💬 Comment
                </button>
                <button 
                  className="btn-warning" 
                  onClick={handleRequestChanges}
                  disabled={loading}
                >
                  🔄 Request Changes
                </button>
                <button 
                  className={`btn-danger ${showRejectForm ? 'active' : ''}`} 
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  disabled={loading}
                >
                  {showRejectForm ? '✓ Ready' : '✗ Reject'}
                </button>
                {showRejectForm && (
                  <button 
                    className="btn-danger-confirm"
                    onClick={handleReject}
                    disabled={loading || !comment.trim()}
                  >
                    Confirm Reject
                  </button>
                )}
                <button 
                  className="btn-success" 
                  onClick={handleApprove}
                  disabled={loading}
                >
                  ✓ Approve
                </button>
              </>
            )}

            {userRole === 'MANAGER' && (
              <>
                <button 
                  className="btn-comment" 
                  onClick={handleCommentOnly}
                  disabled={loading || !comment.trim()}
                >
                  💬 Comment
                </button>
                <button 
                  className={`btn-danger ${showRejectForm ? 'active' : ''}`} 
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  disabled={loading}
                >
                  {showRejectForm ? '✓ Ready' : '✗ Reject'}
                </button>
                {showRejectForm && (
                  <button 
                    className="btn-danger-confirm"
                    onClick={handleReject}
                    disabled={loading || !comment.trim()}
                  >
                    Confirm Reject
                  </button>
                )}
                <button 
                  className="btn-success" 
                  onClick={handleApprove}
                  disabled={loading}
                >
                  ✓ Final Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
