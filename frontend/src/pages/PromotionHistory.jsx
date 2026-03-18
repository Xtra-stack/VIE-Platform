import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/api.js';
import { getPromotionHistory } from '../services/api.js';
import DashboardLayout from '../components/DashboardLayout.jsx';

export default function PromotionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user || !user._id) return;
        const data = await getPromotionHistory(user._id);
        if (!active) return;
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load promotion history', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout title="Promotion History" subtitle="Your role changes and milestones">
      <div style={{ padding: 12 }}>
        {loading ? (
          <div>Loading promotion history...</div>
        ) : history.length === 0 ? (
          <div>No promotions yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {history.map((h) => (
              <li key={h._id} style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{h.newRole}</strong>
                  <small>{new Date(h.createdAt).toLocaleString()}</small>
                </div>
                <div style={{ color: 'var(--text-grey)', marginTop: 6 }}>{h.reason || h.description || 'Promotion'}</div>
                {h.metadata ? <pre style={{ marginTop: 8 }}>{JSON.stringify(h.metadata)}</pre> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
