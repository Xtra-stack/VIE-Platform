import React from 'react';

export default function SubmissionChart({ total, approved, pending, rejected, avgCodeLength }) {
  const getPercentage = (value) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const chartData = [
    { label: 'Approved', value: approved, percentage: getPercentage(approved), color: '#3fb950' },
    { label: 'Pending', value: pending, percentage: getPercentage(pending), color: '#d29922' },
    { label: 'Rejected', value: rejected, percentage: getPercentage(rejected), color: '#ff7b72' }
  ];

  return (
    <div className="submission-chart">
      <div className="chart-header">
        <h3>Submission Status Breakdown</h3>
        <div className="total-badge">{total} total</div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="submission-status">
        <div className="status-bar">
          {chartData.map((item, idx) => (
            <div
              key={idx}
              className="status-segment"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                minWidth: item.percentage > 0 ? '4px' : '0'
              }}
              title={`${item.label}: ${item.value}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="status-legend">
          {chartData.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: item.color }}
              />
              <span className="legend-label">
                {item.label}: {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="submission-stats">
        <div className="stat-item">
          <span className="stat-label">Avg Code Length</span>
          <span className="stat-display">{avgCodeLength} chars</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Approval Rate</span>
          <span className="stat-display">{getPercentage(approved)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Success Ratio</span>
          <span className="stat-display">
            {total > 0 ? ((approved / total) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
