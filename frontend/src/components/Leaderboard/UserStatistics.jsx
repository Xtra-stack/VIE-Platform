import React, { useState, useEffect } from 'react';
import leaderboardService from '../../services/leaderboard.service';
import './Leaderboard.css';

/**
 * UserStatistics Component
 * Displays current user's rank, statistics, and score breakdown
 */
function UserStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await leaderboardService.getLeaderboardSummary();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = (value, max = 100) => {
    return Math.min((value / max) * 100, 100);
  };

  const getTrendIcon = (direction) => {
    if (direction === 'UP') return '📈';
    if (direction === 'DOWN') return '📉';
    return '➡️';
  };

  if (loading) {
    return <div className="loading">Loading your statistics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!stats) {
    return <div className="empty-state">No statistics available</div>;
  }

  const allTimeData = stats.allTimeRank;
  const monthlyData = stats.monthlyRank;
  const scoreBreakdown = allTimeData?.scoreBreakdown || {};
  const totalScore = allTimeData?.score || 0;

  return (
    <div className="user-stats-container">
      <h2 className="stats-title">📊 Your Statistics</h2>

      {/* Main Stats Cards */}
      <div className="stats-main-grid">
        {/* All Time Rank Card */}
        <div className="stat-prominent-card">
          <div className="card-header">All Time Rank</div>
          <div className="rank-display-large">
            <span className="rank-number">#{allTimeData?.rank || 'N/A'}</span>
            <span className="rank-percentile">Top {Math.round(100 - (allTimeData?.percentileRank || 0))}%</span>
          </div>
          <div className="trend-indicator">
            {getTrendIcon(allTimeData?.trendDirection)} 
            {allTimeData?.previousRank && allTimeData.rank < allTimeData.previousRank 
              ? `↑ ${allTimeData.previousRank - allTimeData.rank} positions` 
              : ''}
          </div>
        </div>

        {/* Monthly Rank Card */}
        <div className="stat-prominent-card">
          <div className="card-header">Monthly Rank</div>
          <div className="rank-display-large">
            <span className="rank-number">#{monthlyData?.rank || 'N/A'}</span>
            <span className="rank-percentile">Top {Math.round(100 - (monthlyData?.percentileRank || 0))}%</span>
          </div>
          <div className="trend-indicator">
            {getTrendIcon(monthlyData?.trendDirection)}
          </div>
        </div>

        {/* Total Score Card */}
        <div className="stat-prominent-card score-card">
          <div className="card-header">Total Score</div>
          <div className="score-display-large">
            <span className="score-number">{Math.round(totalScore)}</span>
            <span className="score-label">/ 100</span>
          </div>
          <div className="score-bar">
            <div 
              className="score-fill"
              style={{ width: `${getScorePercentage(totalScore)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="score-breakdown-section">
        <h3>Score Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-name">Experience (XP)</span>
              <span className="breakdown-weight">35%</span>
            </div>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill xp-fill"
                style={{ width: `${getScorePercentage(scoreBreakdown.xpScore || 0)}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {Math.round(scoreBreakdown.xpScore || 0)} / 100
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-name">Approval Rate</span>
              <span className="breakdown-weight">30%</span>
            </div>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill approval-fill"
                style={{ width: `${getScorePercentage(scoreBreakdown.approvalScore || 0)}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {Math.round(scoreBreakdown.approvalScore || 0)} / 100
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-name">Code Reviews</span>
              <span className="breakdown-weight">20%</span>
            </div>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill review-fill"
                style={{ width: `${getScorePercentage(scoreBreakdown.reviewScore || 0)}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {Math.round(scoreBreakdown.reviewScore || 0)} / 100
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-name">Skills</span>
              <span className="breakdown-weight">10%</span>
            </div>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill skill-fill"
                style={{ width: `${getScorePercentage(scoreBreakdown.skillScore || 0)}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {Math.round(scoreBreakdown.skillScore || 0)} / 100
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-name">Consistency</span>
              <span className="breakdown-weight">5%</span>
            </div>
            <div className="breakdown-bar">
              <div 
                className="breakdown-fill consistency-fill"
                style={{ width: `${getScorePercentage(scoreBreakdown.consistencyScore || 0)}%` }}
              ></div>
            </div>
            <div className="breakdown-value">
              {Math.round(scoreBreakdown.consistencyScore || 0)} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="detailed-stats-section">
        <h3>Detailed Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <span className="stat-name">Submissions</span>
            <span className="stat-value">{allTimeData?.submissionCount || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-name">Approvals</span>
            <span className="stat-value">{allTimeData?.approvalCount || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">❌</span>
            <span className="stat-name">Rejections</span>
            <span className="stat-value">{allTimeData?.rejectionCount || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">💯</span>
            <span className="stat-name">Approval Rate</span>
            <span className="stat-value">{(allTimeData?.approvalRate || 0).toFixed(1)}%</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">👀</span>
            <span className="stat-name">Code Reviews</span>
            <span className="stat-value">{allTimeData?.reviewCount || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-name">Review Quality</span>
            <span className="stat-value">{(allTimeData?.averageReviewQuality || 0).toFixed(1)} / 10</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <span className="stat-name">Skills Learned</span>
            <span className="stat-value">{allTimeData?.skillCount || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <span className="stat-name">Streak</span>
            <span className="stat-value">{allTimeData?.streak?.current || 0} days</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-name">Max Streak</span>
            <span className="stat-value">{allTimeData?.streak?.longest || 0} days</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🎖️</span>
            <span className="stat-name">Achievements</span>
            <span className="stat-value">{stats.achievements?.total || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <span className="stat-name">Max Skill Level</span>
            <span className="stat-value">{allTimeData?.maxSkillLevel || 0} / 5</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <span className="stat-name">Total XP</span>
            <span className="stat-value">{allTimeData?.totalXp || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {stats.achievements?.recent && stats.achievements.recent.length > 0 && (
        <div className="recent-achievements-section">
          <h3>Recent Achievements</h3>
          <div className="recent-achievements-list">
            {stats.achievements.recent.map((achievement, index) => (
              <div key={index} className="recent-achievement-item">
                <span className="recent-achievement-icon">{achievement.icon}</span>
                <div className="recent-achievement-info">
                  <span className="recent-achievement-title">{achievement.title}</span>
                  <span className="recent-achievement-date">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="recent-achievement-xp">+{achievement.xpReward}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserStatistics;
