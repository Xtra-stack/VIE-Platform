import React from 'react';
import StatCard from './Analytics/StatCard.jsx';
import EmptyState from './EmptyState.jsx';
import TaskCard from './TaskCard.jsx';

export { StatCard, EmptyState, TaskCard };

export function ChartCard({ title, subtitle, children, action = null }) {
  return (
    <section className="dashboard-widget dashboard-panel chart-card">
      <div className="dashboard-widget-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProgressBar({ value = 0, label, tone = 'blue' }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="progress-bar-wrap dashboard-progress">
      {(label || progress > 0) && (
        <div className="progress-bar-label">
          <span>{label}</span>
          <strong>{progress}%</strong>
        </div>
      )}
      <div className="progress-bar-track dashboard-progress-track">
        <span className={`progress-bar-value ${tone}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function StatusBadge({ status, tone = 'neutral' }) {
  return <span className={`dashboard-status-badge dashboard-badge ${tone}`}>{status}</span>;
}

export function PageHeader({ title, subtitle, actions = null }) {
  return (
    <div className="dashboard-page-header dashboard-section-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="dashboard-page-actions">{actions}</div>}
    </div>
  );
}

export function DataTable({ columns = [], rows = [], emptyMessage = 'No records found.' }) {
  return (
    <div className="dashboard-table-wrap dashboard-data-table">
      {rows.length === 0 ? (
        <div className="dashboard-table-empty">{emptyMessage}</div>
      ) : (
        <table className="dashboard-table dashboard-enterprise-table">
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={row.id || row._id || index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div>
  );
}

export function ActivityItem({ title, description, timestamp, tone = 'blue' }) {
  return (
    <div className="activity-item dashboard-activity-item">
      <span className={`activity-marker ${tone}`} />
      <div><strong>{title}</strong>{description && <p>{description}</p>}</div>
      {timestamp && <time>{timestamp}</time>}
    </div>
  );
}

export function TaskItem({ title, project, status, dueDate }) {
  return (
    <div className="task-item dashboard-task-item">
      <div><strong>{title}</strong>{project && <span>{project}</span>}</div>
      {status && <StatusBadge status={status} />}
      {dueDate && <time>{dueDate}</time>}
    </div>
  );
}

export function LoadingState({ message = 'Loading workspace...' }) {
  return <div className="dashboard-state loading-state"><span className="state-spinner" />{message}</div>;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return <div className="dashboard-state error-state"><strong>{message}</strong>{onRetry && <button type="button" onClick={onRetry}>Try again</button>}</div>;
}