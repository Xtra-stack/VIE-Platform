import React from 'react';

export default function QualityMetrics({ approved, pending, rejected }) {
  const total = approved + pending + rejected;

  const qualities = [
    {
      name: 'Code Quality',
      score: 0,
      icon: '💎',
      description: 'Code design and architecture'
    },
    {
      name: 'Readability',
      score: 0,
      icon: '📖',
      description: 'Code clarity and comments'
    },
    {
      name: 'Functionality',
      score: 0,
      icon: '⚙️',
      description: 'Business logic correctness'
    },
    {
      name: 'Efficiency',
      score: 0,
      icon: '⚡',
      description: 'Performance optimization'
    },
    {
      name: 'Documentation',
      score: 0,
      icon: '📝',
      description: 'API and code documentation'
    }
  ];

  return (
    <div className="quality-metrics">
      <h3>Code Quality Metrics</h3>

      {/* Overview Cards */}
      <div className="quality-overview">
        <div className="quality-card approved">
          <div className="quality-number">{approved}</div>
          <div className="quality-label">Approved ✓</div>
        </div>
        <div className="quality-card pending">
          <div className="quality-number">{pending}</div>
          <div className="quality-label">Pending ⟳</div>
        </div>
        <div className="quality-card rejected">
          <div className="quality-number">{rejected}</div>
          <div className="quality-label">Rejected ✕</div>
        </div>
      </div>

      {/* Quality Dimensions */}
      <div className="quality-dimensions">
        <h4>Quality Dimensions</h4>
        <div className="dimensions-grid">
          {qualities.map((quality, idx) => (
            <div key={idx} className="quality-dimension">
              <div className="dimension-icon">{quality.icon}</div>
              <div className="dimension-name">{quality.name}</div>
              <div className="dimension-description">{quality.description}</div>
              <div className="dimension-score">
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${quality.score * 10}%`,
                      backgroundColor: quality.score >= 7 ? '#3fb950' : 
                                      quality.score >= 5 ? '#d29922' : '#ff7b72'
                    }}
                  />
                </div>
                <span className="score-value">{quality.score.toFixed(1)}/10</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
