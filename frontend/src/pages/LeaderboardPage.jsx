import React, { useState } from 'react';
import { LeaderboardTable, AchievementShowcase, UserStatistics } from '../components/Leaderboard';
import './LeaderboardPage.css';

/**
 * Leaderboard Page
 * Main page combining leaderboard, achievements, and user statistics
 */
function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const tabs = [
    { id: 'leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
    { id: 'achievements', label: '🏅 Achievements', icon: '🏅' },
    { id: 'stats', label: '📊 My Statistics', icon: '📊' },
  ];

  return (
    <div className="leaderboard-page">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">VIE Gamification Hub</h1>
        <p className="page-subtitle">Track your progress, unlock achievements, and compete on the leaderboard</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'leaderboard' && (
          <div className="tab-pane active">
            <LeaderboardTable />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="tab-pane active">
            <AchievementShowcase />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-pane active">
            <UserStatistics />
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="page-footer">
        <div className="footer-content">
          <p>Status: All systems operational</p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
