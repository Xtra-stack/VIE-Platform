import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../services/api.js';
import '../styles/RoleStats.css';

export default function RoleStats({ role }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAnalyticsSummary(7);
        if (!mounted) return;
        setMetrics(data || []);
      } catch (err) {
        if (!mounted) return;
        setMetrics([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [role]);

  const pickKeysForRole = (r) => {
    switch (r) {
      case 'JUNIOR': return ['tasks_assigned', 'submissions'];
      case 'SENIOR': return ['reviews_pending', 'approvals'];
      case 'MANAGER': return ['approvals', 'deploys'];
      case 'ADMIN': return ['users_created', 'promotions'];
      case 'OWNER': return ['users_created', 'promotions'];
      default: return [];
    }
  };

  const keys = pickKeysForRole(role);

  const shown = metrics.filter(m => keys.length === 0 ? true : keys.includes(m.type));

  return (
    <div className="role-stats">
      <div className="role-stats-header">Key Metrics</div>
      {loading ? (
        <div className="role-stats-loading">Loading...</div>
      ) : (
        <div className="role-stats-grid">
          {shown.length === 0 && <div className="role-stats-empty">No metrics available</div>}
          {shown.map((m) => (
            <div key={m.type} className="role-stat-card">
              <div className="role-stat-type">{m.type}</div>
              <div className="role-stat-total">{m.total}</div>
              <div className="role-stat-count">events: {m.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
