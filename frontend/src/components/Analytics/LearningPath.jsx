import React, { useState, useEffect } from 'react';

export default function LearningPath() {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      const response = await fetch('/api/analytics/learning-path', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch learning path');

      const data = await response.json();
      setPath(data.path);
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="learning-path loading">Loading your learning path...</div>;
  }

  if (!path) {
    return <div className="learning-path empty">No learning path data available</div>;
  }

  return (
    <div className="learning-path">
      {/* Current Role */}
      <div className="role-section">
        <h3>Your Current Role</h3>
        <div className="role-badge">{path.currentRole}</div>
      </div>

      {/* Milestones */}
      {path.nextMilestones && path.nextMilestones.length > 0 && (
        <div className="milestones-section">
          <h3>Your Milestones</h3>
          <div className="milestones-timeline">
            {path.nextMilestones.map((milestone, idx) => (
              <div key={idx} className="milestone">
                <div className="milestone-marker">
                  <div className={`marker-dot ${milestone.status}`} />
                </div>
                <div className="milestone-content">
                  <h4>{milestone.name}</h4>
                  <div className="milestone-progress-bar">
                    <div
                      className="milestone-progress-fill"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  <span className="milestone-percent">{milestone.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Levels */}
      {path.skillLevels && path.skillLevels.length > 0 && (
        <div className="skill-levels-section">
          <h3>Skill Development Levels</h3>
          <div className="skill-levels-grid">
            {path.skillLevels.map((skill, idx) => (
              <div key={idx} className="skill-level-card">
                <h4>{skill.skillName}</h4>
                <div className="skill-level-display">
                  <span className="level-number">Level {skill.level}/5</span>
                </div>
                <div className="skill-level-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= skill.level ? 'filled' : ''}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="skill-recommendation">{skill.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Issues */}
      {path.commonIssues && path.commonIssues.length > 0 && (
        <div className="common-issues-section">
          <h3>Areas to Improve (Based on Feedback)</h3>
          <div className="issues-list">
            {path.commonIssues.map((issue, idx) => (
              <div key={idx} className="issue-item">
                <span className="issue-badge">{issue.frequency}x</span>
                <span className="issue-name">{issue.issue.charAt(0).toUpperCase() + issue.issue.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Time */}
      {path.estimatedTime && (
        <div className="estimated-time-section">
          <h3>Estimated Time to Next Milestone</h3>
          <div className="time-estimate">
            <span className="time-value">{path.estimatedTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}
