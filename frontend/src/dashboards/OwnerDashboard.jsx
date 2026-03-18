import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import RoleStats from '../components/RoleStats.jsx';
import { createInviteCode, getCompany, completeTrial } from '../services/api.js';
import { getCompanyId } from '../utils/auth.js';

const getInviteOptions = (role) => {
  if (role === 'OWNER') {
    return [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'MANAGER', label: 'Manager' },
      { value: 'SENIOR', label: 'Senior' },
      { value: 'JUNIOR', label: 'Junior' },
    ];
  }
  return [];
};

export default function OwnerDashboard() {
  const [company, setCompany] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    role: 'ADMIN',
    email: '',
    expiresInHours: 168,
  });
  const [inviteResult, setInviteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) return;
      const response = await getCompany(companyId);
      setCompany(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load company');
    }
  };

  const handleInviteChange = (event) => {
    const { name, value } = event.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateInvite = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setInviteResult(null);
    setLoading(true);

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        return;
      }

      const response = await createInviteCode(companyId, {
        role: inviteForm.role,
        email: inviteForm.email || undefined,
        expiresInHours: Number(inviteForm.expiresInHours) || 168,
      });

      setInviteResult(response.data);
      setSuccess('Invite code created successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrial = async () => {
    setTrialLoading(true);
    setError('');
    setSuccess('');

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        return;
      }

      const response = await completeTrial(companyId);
      setCompany(response.data);
      setSuccess('Trial marked as completed.');
    } catch (err) {
      setError(err.message || 'Failed to complete trial');
    } finally {
      setTrialLoading(false);
    }
  };

  const inviteOptions = getInviteOptions('OWNER');

  return (
    <DashboardLayout title="Owner Dashboard" subtitle="Manage organization access and lifecycle">
      <div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="card">
          <h2>🏢 Organization Overview</h2>
          {company ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span><strong>Name:</strong> {company.name}</span>
              <span><strong>Plan:</strong> {company.planType}</span>
              <span><strong>Trial Status:</strong> {company.trialStatus}</span>
              <span><strong>Trial Ends:</strong> {company.trialEndsAt ? new Date(company.trialEndsAt).toLocaleDateString() : 'N/A'}</span>
              {company.trialStatus === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={handleCompleteTrial}
                  disabled={trialLoading}
                  style={{ marginTop: '10px', width: 'fit-content' }}
                >
                  {trialLoading ? 'Completing...' : 'Complete Trial'}
                </button>
              )}
            </div>
          ) : (
            <p>Company details unavailable.</p>
          )}
        </div>

        <div className="card">
          <h2>🔑 Invite Codes</h2>
          <p style={{ color: 'var(--text-grey)', marginBottom: '15px' }}>
            Generate invite codes for new admins, managers, seniors, or juniors.
          </p>
          <form onSubmit={handleCreateInvite}>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={inviteForm.role} onChange={handleInviteChange}>
                {inviteOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Email (optional)</label>
              <input
                name="email"
                type="email"
                value={inviteForm.email}
                onChange={handleInviteChange}
                placeholder="limit invite to one email"
              />
            </div>
            <div className="form-group">
              <label>Expires In (hours)</label>
              <input
                name="expiresInHours"
                type="number"
                min="1"
                value={inviteForm.expiresInHours}
                onChange={handleInviteChange}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invite Code'}
            </button>
          </form>

          {inviteResult && (
            <div style={{ marginTop: '16px' }}>
              <strong>Invite Code:</strong> {inviteResult.code}<br />
              <strong>Role:</strong> {inviteResult.role}<br />
              <strong>Expires:</strong> {inviteResult.expiresAt ? new Date(inviteResult.expiresAt).toLocaleString() : 'N/A'}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
