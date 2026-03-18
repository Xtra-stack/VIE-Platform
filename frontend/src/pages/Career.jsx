import React, { useEffect, useState } from 'react';
import { getUnlockables, getCareerProfile, unlockItem } from '../services/api.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import '../styles/Career.css';

export default function Career() {
  const [unlockables, setUnlockables] = useState([]);
  const [profile, setProfile] = useState({ unlocked: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [u, p] = await Promise.all([getUnlockables(), getCareerProfile()]);
        if (!mounted) return;
        setUnlockables(u || []);
        setProfile(p || { unlocked: [] });
      } catch (err) {
        console.error('Failed to load career data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleUnlock = async (key) => {
    try {
      const res = await unlockItem(key);
      if (res?.data?.profile) setProfile(res.data.profile);
      else if (res?.profile) setProfile(res.profile);
      else {
        // optimistic update
        setProfile((prev) => ({ ...prev, unlocked: Array.from(new Set([...(prev.unlocked||[]), key])) }));
      }
    } catch (err) {
      console.warn('unlock failed', err);
      alert('Unlock failed: ' + (err.message || 'server error'));
    }
  };

  return (
    <DashboardLayout title="Career Mode" subtitle="Unlockable perks and progression rewards">
      <div className="career-page">
        {loading ? <div>Loading...</div> : (
          <div className="unlockables-grid">
            {unlockables.length === 0 && <div>No unlockables available.</div>}
            {unlockables.map((u) => {
              const isUnlocked = (profile.unlocked || []).includes(u.key);
              return (
                <div key={u.key} className={`unlock-card ${isUnlocked ? 'unlocked' : ''}`}>
                  <h3>{u.name}</h3>
                  <p className="desc">{u.description}</p>
                  <div className="meta">Criteria: {JSON.stringify(u.criteria || {})}</div>
                  <div className="actions">
                    {isUnlocked ? (
                      <button disabled>Unlocked ✓</button>
                    ) : (
                      <button onClick={() => handleUnlock(u.key)}>Unlock</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
