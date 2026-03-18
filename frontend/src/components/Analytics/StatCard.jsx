import React from 'react';

export default function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {trend && <p className="stat-trend">{trend}</p>}
      </div>
    </div>
  );
}
