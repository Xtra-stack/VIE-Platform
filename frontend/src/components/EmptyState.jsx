import React from 'react';
import '../styles/DashboardComponents.css';

export default function EmptyState({ icon = '📭', title = 'No Data', message = 'Nothing to display', action = null }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button className="empty-state-button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
