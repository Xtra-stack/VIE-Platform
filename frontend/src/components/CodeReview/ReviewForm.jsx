import React, { useState } from 'react';
import '../../styles/CodeReview.css';

export default function ReviewForm({ submission, onSubmit, onCancel }) {
  const [status, setStatus] = useState('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState({
    codeQuality: 5,
    readability: 5,
    functionality: 5,
    efficiency: 5,
    documentation: 5
  });
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (category, value) => {
    setScores({
      ...scores,
      [category]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        submissionId: submission._id,
        status,
        feedback,
        scores
      });
    } finally {
      setLoading(false);
    }
  };

  const avgScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  return (
    <div className="review-form">
      <h3>Review Submission</h3>

      {/* Submission Info */}
      <div className="review-submission-info">
        <div className="info-row">
          <span className="label">Submitted by:</span>
          <span className="value">{submission.submittedBy?.username || 'Unknown'}</span>
        </div>
        <div className="info-row">
          <span className="label">Language:</span>
          <span className="value language-badge">{submission.language?.toUpperCase()}</span>
        </div>
        <div className="info-row">
          <span className="label">Lines of Code:</span>
          <span className="value">{submission.codeLength || 0} chars</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Status Selection */}
        <div className="form-group">
          <label htmlFor="status">Review Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-control"
          >
            <option value="APPROVED">✓ Approved</option>
            <option value="REQUESTED_CHANGES">⟳ Request Changes</option>
            <option value="REJECTED">✕ Rejected</option>
          </select>
        </div>

        {/* Scoring */}
        <div className="review-scores">
          <h4>Quality Scores (1-10)</h4>

          {Object.entries(scores).map(([category, value]) => (
            <div key={category} className="score-item">
              <label htmlFor={`score-${category}`}>
                {category
                  .replace(/([A-Z])/g, ' $1')
                  .trim()
                  .charAt(0)
                  .toUpperCase() +
                  category
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .slice(1)}
              </label>
              <div className="score-input-wrapper">
                <input
                  type="range"
                  id={`score-${category}`}
                  min="1"
                  max="10"
                  value={value}
                  onChange={(e) => handleScoreChange(category, parseInt(e.target.value))}
                  className="score-slider"
                />
                <span className="score-display">{value}/10</span>
              </div>
            </div>
          ))}

          <div className="avg-score">
            <strong>Average Score:</strong>
            <span className={`badge badge-${avgScore >= 7 ? 'success' : 'warning'}`}>
              {avgScore}/10
            </span>
          </div>
        </div>

        {/* Feedback */}
        <div className="form-group">
          <label htmlFor="feedback">Review Feedback</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback for the submission..."
            className="form-control feedback-textarea"
            required
            rows="6"
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !feedback.trim()}
            className={`btn btn-${status === 'APPROVED' ? 'success' : status === 'REQUESTED_CHANGES' ? 'warning' : 'danger'}`}
          >
            {loading ? 'Submitting...' : `${status.split('_')[0]} Submission`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
