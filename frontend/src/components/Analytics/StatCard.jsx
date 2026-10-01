import React from 'react';

export default function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="stat-card dashboard-stat-card">
      <div className="stat-icon dashboard-stat-icon">{icon}</div>
      <div className="stat-content dashboard-stat-content">
        <h3 className="stat-title dashboard-stat-title">{title}</h3>
        <div className="stat-value dashboard-stat-value">{value}</div>
        {subtitle && <p className="stat-subtitle dashboard-stat-subtitle">{subtitle}</p>}
        {trend && <p className="stat-trend dashboard-stat-trend">{trend}</p>}
      </div>
    </div>
  );
}
