import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../../services/api.js';
import '../../styles/Analytics.css';

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAnalyticsSummary(7);
        if (!mounted) return;
        setSummary(data || []);
      } catch (_e) {
        if (!mounted) return;
        setSummary([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="analytics-dashboard">
      <h2>Performance Analytics (7d)</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="analytics-cards">
          {summary.length === 0 && <div>No metrics available</div>}
          {summary.map((s) => (
            <div key={s.type} className="analytics-card">
              <div className="analytics-type">{s.type}</div>
              <div className="analytics-total">Total: {s.total}</div>
              <div className="analytics-count">Events: {s.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
