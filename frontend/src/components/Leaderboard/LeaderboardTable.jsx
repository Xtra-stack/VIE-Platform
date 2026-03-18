import React, { useState, useEffect } from 'react';
import leaderboardService from '../../services/leaderboard.service';
import './Leaderboard.css';

/**
 * LeaderboardTable Component
 * Displays paginated leaderboard rankings with filtering by period
 */
function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('ALL_TIME');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });

  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchLeaderboard();
  }, [period, page, month]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');

      let data;
      if (period === 'MONTHLY') {
        const monthToFetch = month || currentMonth;
        data = await leaderboardService.getMonthlyLeaderboard(monthToFetch, page);
        setMonth(monthToFetch);
      } else if (period === 'QUARTERLY') {
        data = await leaderboardService.getQuarterlyLeaderboard(page);
      } else if (period === 'YEARLY') {
        data = await leaderboardService.getYearlyLeaderboard(page);
      } else {
        data = await leaderboardService.getAllTimeLeaderboard(page);
      }

      setLeaderboard(data.leaderboard || []);
      setTotalPages(Math.ceil((data.total || 0) / PAGE_SIZE));
    } catch (err) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setPage(1);
    if (newPeriod === 'MONTHLY') {
      setMonth(currentMonth);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#333';
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Leaderboard</h2>

      {/* Period Selector */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === 'ALL_TIME' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('ALL_TIME')}
        >
          All Time
        </button>
        <button
          className={`period-btn ${period === 'MONTHLY' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('MONTHLY')}
        >
          Monthly
        </button>
        <button
          className={`period-btn ${period === 'QUARTERLY' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('QUARTERLY')}
        >
          Quarterly
        </button>
        <button
          className={`period-btn ${period === 'YEARLY' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('YEARLY')}
        >
          Yearly
        </button>
      </div>

      {/* Month Selector (for Monthly period) */}
      {period === 'MONTHLY' && (
        <div className="month-selector">
          <label htmlFor="month-input">Select Month:</label>
          <input
            id="month-input"
            type="month"
            value={month || currentMonth}
            onChange={handleMonthChange}
          />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : (
        <>
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-col">Rank</th>
                  <th className="name-col">Player</th>
                  <th className="score-col">Score</th>
                  <th className="xp-col">XP</th>
                  <th className="submissions-col">Submissions</th>
                  <th className="approval-col">Approval %</th>
                  <th className="reviews-col">Reviews</th>
                  <th className="percentile-col">Percentile</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <tr key={entry._id} className={`leaderboard-row ${index < 3 ? 'top-rank' : ''}`}>
                      <td className="rank-col" style={{ color: getRankColor(entry.rank) }}>
                        <span className="rank-display">
                          {getMedalEmoji(entry.rank)} #{entry.rank}
                        </span>
                      </td>
                      <td className="name-col">
                        <span className="player-name">{entry.userId?.fullName || 'Anonymous'}</span>
                        <span className="player-role">{entry.userId?.role}</span>
                      </td>
                      <td className="score-col">
                        <span className="score-value">{Math.round(entry.score || 0)}</span>
                      </td>
                      <td className="xp-col">{entry.totalXp}</td>
                      <td className="submissions-col">{entry.submissionCount}</td>
                      <td className="approval-col">
                        <span className={`approval-badge ${entry.approvalRate >= 80 ? 'high' : 'normal'}`}>
                          {(entry.approvalRate || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="reviews-col">{entry.reviewCount}</td>
                      <td className="percentile-col">
                        <span className="percentile-badge">{Math.round(entry.percentileRank || 0)}%</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No leaderboard data available for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              ← Previous
            </button>

            <span className="page-info">
              Page {page} of {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LeaderboardTable;
