import React, { useState, useEffect } from 'react';
import SkillCard from './SkillCard.jsx';
import '../../styles/SkillTracker.css';

export default function SkillProgress() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('level');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch skills');

      const data = await response.json();
      setSkills(data.data.skills);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedSkills = [...skills].sort((a, b) => {
    if (sortBy === 'level') return b.level - a.level;
    if (sortBy === 'xp') return b.xp - a.xp;
    if (sortBy === 'approval') return b.approvalRate - a.approvalRate;
    return 0;
  });

  const totalLevel = skills.reduce((sum, s) => sum + s.level, 0);
  const avgLevel = (totalLevel / skills.length).toFixed(1);

  if (loading) {
    return <div className="skill-loading">Loading your skills...</div>;
  }

  if (error) {
    return <div className="skill-error">Error: {error}</div>;
  }

  return (
    <div className="skill-progress-wrapper">
      <div className="skill-header-section">
        <h2>Your Skill Profile</h2>
        <p className="skill-subtitle">Track your growth across all technologies</p>
      </div>

      {/* Summary Stats */}
      <div className="skill-summary-cards">
        <div className="summary-card">
          <span className="summary-label">Total Skills</span>
          <span className="summary-value">{skills.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Avg Level</span>
          <span className="summary-value">{avgLevel}/5</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total XP</span>
          <span className="summary-value">{skills.reduce((sum, s) => sum + s.xp, 0)}</span>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="skill-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="level">Level (Highest)</option>
          <option value="xp">XP (Most)</option>
          <option value="approval">Approval Rate</option>
        </select>
      </div>

      {/* Skills Grid */}
      <div className="skill-progress-container">
        {sortedSkills.map((skill) => (
          <SkillCard key={skill.id || skill.name} skill={skill} variant="compact" />
        ))}
      </div>

      {/* Detailed View Option */}
      <div className="skill-details-section">
        <h3>Detailed Analysis</h3>
        <div className="skill-progress-list">
          {sortedSkills.map((skill) => (
            <SkillCard key={skill.id || skill.name} skill={skill} variant="expanded" />
          ))}
        </div>
      </div>
    </div>
  );
}
