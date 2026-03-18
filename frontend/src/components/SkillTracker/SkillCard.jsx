import React from 'react';
import '../../styles/SkillTracker.css';

export default function SkillCard({ skill, variant = 'compact' }) {
  const { name, level, xp, nextLevelXp, progress, taskCount, approvalRate, lastUpdated } = skill;

  const getSkillColor = (skillName) => {
    const colors = {
      'Frontend Development': '#00ff88',
      'Backend Development': '#58a6ff',
      'API Development': '#ffc42e',
      'Testing & QA': '#ff6b6b',
      'DevOps': '#c9d1d9',
      'Documentation': '#a371f7',
      'Communication': '#79c0ff'
    };
    return colors[skillName] || '#9be9c0';
  };

  const lineColor = getSkillColor(name);

  if (variant === 'compact') {
    return (
      <div className="skill-card-compact">
        <div className="skill-header-compact">
          <h4 className="skill-name">{name}</h4>
          <span className="skill-level">Level {level}/5</span>
        </div>
        <div className="skill-bar-wrapper">
          <div className="skill-bar-background">
            <div
              className="skill-bar-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: lineColor
              }}
            ></div>
          </div>
          <span className="skill-xp-text">
            {xp}/{nextLevelXp} XP
          </span>
        </div>
      </div>
    );
  }

  // Expanded variant
  return (
    <div className="skill-card-expanded">
      <div className="skill-card-header">
        <div>
          <h3 className="skill-name-large">{name}</h3>
          <p className="skill-level-large">Level {level} / 5</p>
        </div>
        <div className="skill-level-badge" style={{ borderColor: lineColor }}>
          <span className="badge-level">{level}</span>
        </div>
      </div>

      <div className="skill-progress-section">
        <div className="skill-bar-large">
          <div
            className="skill-bar-fill-large"
            style={{
              width: `${progress}%`,
              backgroundColor: lineColor
            }}
          ></div>
        </div>
        <p className="skill-xp-detail">
          {xp} / {nextLevelXp} XP ({progress}%)
        </p>
      </div>

      <div className="skill-stats-grid">
        <div className="stat-item">
          <span className="stat-label">Tasks Done</span>
          <span className="stat-value">{taskCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Approval Rate</span>
          <span className="stat-value">{approvalRate}%</span>
        </div>
      </div>

      <p className="skill-last-updated">
        Last updated: {new Date(lastUpdated).toLocaleDateString()}
      </p>
    </div>
  );
}
