import React, { useState, useEffect } from 'react';
import leaderboardService from '../../services/leaderboard.service';
import './Leaderboard.css';

/**
 * AchievementShowcase Component
 * Displays user's achievements as an interactive grid with filtering
 */
function AchievementShowcase() {
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const rarityColors = {
    COMMON: '#808080',
    UNCOMMON: '#00AA00',
    RARE: '#0055FF',
    EPIC: '#AA00FF',
    LEGENDARY: '#FFAA00',
  };

  useEffect(() => {
    fetchUserAchievements();
  }, []);

  useEffect(() => {
    filterAchievements();
  }, [achievements, filter]);

  const fetchUserAchievements = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await leaderboardService.getUserAchievements();
      setAchievements(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const filterAchievements = () => {
    if (filter === 'ALL') {
      setFilteredAchievements(achievements);
    } else {
      setFilteredAchievements(achievements.filter(a => a.rarity === filter));
    }
  };

  const getRarityStats = () => {
    const stats = {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0,
    };
    achievements.forEach(a => {
      if (stats.hasOwnProperty(a.rarity)) {
        stats[a.rarity]++;
      }
    });
    return stats;
  };

  const rarityStats = getRarityStats();
  const totalXpEarned = achievements.reduce((sum, a) => sum + (a.xpReward || 0), 0);

  return (
    <div className="achievements-container">
      <h2 className="achievements-title">🏅 Achievements</h2>

      {/* Stats Section */}
      <div className="achievements-stats">
        <div className="stat-card">
          <span className="stat-label">Total Achievements</span>
          <span className="stat-value">{achievements.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total XP Earned</span>
          <span className="stat-value">+{totalXpEarned}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Legendary</span>
          <span className="stat-value" style={{ color: rarityColors.LEGENDARY }}>
            {rarityStats.LEGENDARY}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Epic</span>
          <span className="stat-value" style={{ color: rarityColors.EPIC }}>
            {rarityStats.EPIC}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filter Buttons */}
      <div className="rarity-filter">
        <button
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({achievements.length})
        </button>
        {Object.entries(rarityColors).map(([rarity, color]) => (
          <button
            key={rarity}
            className={`filter-btn ${filter === rarity ? 'active' : ''}`}
            style={{
              borderColor: color,
              color: filter === rarity ? color : '#666',
            }}
            onClick={() => setFilter(rarity)}
          >
            {rarity} ({rarityStats[rarity]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading achievements...</div>
      ) : filteredAchievements.length > 0 ? (
        <>
          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement._id}
                className="achievement-card"
                style={{ borderColor: rarityColors[achievement.rarity] }}
                onClick={() => setSelectedAchievement(achievement)}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-rarity" style={{ color: rarityColors[achievement.rarity] }}>
                  {achievement.rarity}
                </div>
                <div className="achievement-xp">+{achievement.xpReward} XP</div>
                <div className="achievement-date">
                  {achievement.unlockedAt 
                    ? new Date(achievement.unlockedAt).toLocaleDateString()
                    : 'Locked'}
                </div>
              </div>
            ))}
          </div>

          {/* Achievement Modal */}
          {selectedAchievement && (
            <div className="achievement-modal" onClick={() => setSelectedAchievement(null)}>
              <div className="achievement-modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedAchievement(null)}
                >
                  ✕
                </button>
                <div className="modal-icon">{selectedAchievement.icon}</div>
                <h3 className="modal-title">{selectedAchievement.title}</h3>
                <p className="modal-description">{selectedAchievement.description}</p>
                <div className="modal-details">
                  <div className="detail-item">
                    <span className="detail-label">Rarity:</span>
                    <span 
                      className="detail-value"
                      style={{ color: rarityColors[selectedAchievement.rarity] }}
                    >
                      {selectedAchievement.rarity}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">XP Reward:</span>
                    <span className="detail-value">+{selectedAchievement.xpReward}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Unlocked:</span>
                    <span className="detail-value">
                      {selectedAchievement.unlockedAt
                        ? new Date(selectedAchievement.unlockedAt).toLocaleDateString()
                        : 'Not yet'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Players:</span>
                    <span className="detail-value">{selectedAchievement.stats?.userCount || 0} unlocked</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🎯</span>
          <span className="empty-text">No achievements yet. Keep coding to unlock them!</span>
        </div>
      )}
    </div>
  );
}

export default AchievementShowcase;
