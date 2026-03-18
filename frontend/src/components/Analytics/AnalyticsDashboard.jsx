import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import SkillChart from './SkillChart';
import SubmissionChart from './SubmissionChart';
import QualityMetrics from './QualityMetrics';
import LearningPath from './LearningPath';
import './Analytics.css';

export default function AnalyticsDashboard({ userRole, companyId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.summary);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <h2>Loading Analytics...</h2>
          <p>Preparing your data visualization</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-state">
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const personalAnalytics = analytics?.personal || {};
  const teamAnalytics = analytics?.team || {};
  const companyAnalytics = analytics?.company || {};
  const skillAnalytics = analytics?.skills || {};

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <button onClick={fetchAnalytics} className="btn btn-icon">
          ↻
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          🎯 Skills
        </button>
        <button
          className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          📝 Submissions
        </button>
        {(userRole === 'MANAGER' || userRole === 'SENIOR') && (
          <button
            className={`tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            👥 Team
          </button>
        )}
        <button
          className={`tab ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          🚀 Learning Path
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-section">
          <h2>Personal Overview</h2>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Code Submissions"
              value={personalAnalytics.submissions?.total || 0}
              subtitle="Total submissions"
              icon="📤"
              trend={(personalAnalytics.submissions?.approved || 0) + ' approved'
              }
            />
            <StatCard
              title="Average Code Quality"
              value={personalAnalytics.reviews?.avgQualityScore || 0}
              subtitle="Out of 10"
              icon="⭐"
              trend={`${personalAnalytics.reviews?.approvalRate || 0}% approval rate`}
            />
            <StatCard
              title="Skill Level"
              value={personalAnalytics.skills?.avgLevel || 0}
              subtitle="Average across all skills"
              icon="🎯"
              trend={`${personalAnalytics.skills?.total || 0} skills tracked`}
            />
            <StatCard
              title="Total XP"
              value={personalAnalytics.skills?.totalXp || 0}
              subtitle={`Top: ${personalAnalytics.skills?.topSkill || 'N/A'}`}
              icon="✨"
              trend="XP earned"
            />
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <SkillChart skillData={skillAnalytics.trends || []} />
            <QualityMetrics 
              approved={personalAnalytics.submissions?.approved || 0}
              pending={personalAnalytics.submissions?.pending || 0}
              rejected={personalAnalytics.submissions?.rejected || 0}
            />
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="analytics-section">
          <h2>Skill Development</h2>
          <SkillChart skillData={skillAnalytics.trends || []} detailed={true} />
          
          {skillAnalytics.recommendations && skillAnalytics.recommendations.length > 0 && (
            <div className="recommendations">
              <h3>Recommendations</h3>
              <div className="recommendation-list">
                {skillAnalytics.recommendations.map((rec, idx) => (
                  <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                    <span className="priority-badge">{rec.priority}</span>
                    <div className="recommendation-content">
                      <p className="recommendation-message">{rec.message}</p>
                      <span className="recommendation-type">{rec.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="analytics-section">
          <h2>Submission Analytics</h2>
          <SubmissionChart 
            total={personalAnalytics.submissions?.total || 0}
            approved={personalAnalytics.submissions?.approved || 0}
            pending={personalAnalytics.submissions?.pending || 0}
            rejected={personalAnalytics.submissions?.rejected || 0}
            avgCodeLength={personalAnalytics.submissions?.avgCodeLength || 0}
          />
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (userRole === 'MANAGER' || userRole === 'SENIOR') && (
        <div className="analytics-section">
          <h2>Team Performance</h2>

          <div className="stats-grid">
            <StatCard
              title="Team Members"
              value={teamAnalytics.teamMembers || 0}
              icon="👥"
            />
            <StatCard
              title="Total Submissions"
              value={teamAnalytics.totalSubmissions || 0}
              icon="📤"
            />
            <StatCard
              title="Approval Rate"
              value={`${teamAnalytics.avgApprovalRate || 0}%`}
              icon="✅"
            />
            <StatCard
              title="Avg Code Quality"
              value={teamAnalytics.avgCodeQuality || 0}
              subtitle="Out of 10"
              icon="⭐"
            />
          </div>

          {/* Top Performers */}
          {teamAnalytics.topPerformers && teamAnalytics.topPerformers.length > 0 && (
            <div className="top-performers">
              <h3>Top Performers</h3>
              <div className="performers-list">
                {teamAnalytics.topPerformers.map((performer, idx) => (
                  <div key={idx} className="performer-card">
                    <div className="performer-rank">#{idx + 1}</div>
                    <div className="performer-info">
                      <h4>{performer.username}</h4>
                      <p>{performer.submissions} submissions</p>
                    </div>
                    <div className="performer-metrics">
                      <div className="metric">
                        <span className="label">Quality</span>
                        <span className="value">{performer.avgQuality}/10</span>
                      </div>
                      <div className="metric">
                        <span className="label">Approval</span>
                        <span className="value">{performer.approvalRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Learning Path Tab */}
      {activeTab === 'learning' && (
        <div className="analytics-section">
          <h2>Your Learning Path</h2>
          <LearningPath />
        </div>
      )}
    </div>
  );
}
