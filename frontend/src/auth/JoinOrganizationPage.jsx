import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinOrganization } from '../services/api.js';
import { removeToken, setToken } from '../utils/auth.js';
import './JoinOrganizationPage.css';

export default function JoinOrganizationPage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await joinOrganization(inviteCode, formData);
      const data = response.data;

      if (!data?.token || !data?.user) {
        throw new Error('Invalid response from server');
      }

      removeToken();
      setToken(data.token, data.user.role, data.user.companyId, 'REAL');
      setSuccess('Welcome to VIE! Redirecting...');

      const roleMap = {
        OWNER: '/owner/dashboard',
        ADMIN: '/admin/dashboard',
        MANAGER: '/manager/dashboard',
        SENIOR: '/senior/dashboard',
        JUNIOR: '/junior/dashboard',
      };
      const dashboardPath = roleMap[data.user.role] || '/login';

      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to join organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <h1>Join VIE</h1>
        <p>Use your invite code to join an organization.</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              required
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Organization'}
          </button>
        </form>

        <button
          type="button"
          className="secondary"
          onClick={() => navigate('/login')}
          disabled={loading}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
