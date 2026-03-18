import React from 'react';

export default function SkillChart({ skillData, detailed = false }) {
  if (!skillData || skillData.length === 0) {
    return (
      <div className="skill-chart">
        <h3>Skills Development</h3>
        <div className="empty-chart">
          <p>No skill data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-chart">
      <h3>Skills Development</h3>
      <div className="skill-list">
        {skillData.map((skill, idx) => (
          <div key={idx} className="skill-item">
            <div className="skill-header">
              <span className="skill-name">{skill.skillName}</span>
              <span className="skill-level">Level {skill.currentLevel}/5</span>
            </div>

            {/* Level Progress Bar */}
            <div className="level-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${skill.progressPercent}%` }}
                />
              </div>
              <span className="progress-text">{skill.progressPercent}%</span>
            </div>

            {/* XP Display */}
            <div className="skill-xp">
              <span className="xp-value">{skill.currentXp} XP</span>
              <span className="xp-next">Next level: {skill.nextLevelXp} XP</span>
            </div>

            {detailed && (
              <div className="skill-details">
                <div className="detail-item">
                  <span className="detail-label">Total Earned:</span>
                  <span className="detail-value">{skill.currentXp} XP</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">
                    {new Date(skill.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
