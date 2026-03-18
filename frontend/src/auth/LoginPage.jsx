import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { setToken, removeToken } from '../utils/auth.js';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setError('Username/email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await login(normalizedUsername, password);
      removeToken();
      setToken(response.token, response.role, response.companyId, 'REAL', {
        remember: rememberMe,
        refreshToken: response.refreshToken,
      });
      
      // Redirect based on role
      const roleMap = {
        OWNER: '/owner/dashboard',
        ADMIN: '/admin/dashboard',
        MANAGER: '/manager/dashboard',
        JUNIOR: '/junior/dashboard',
        SENIOR: '/senior/dashboard',
      };
      const dashboardPath = roleMap[response.role];
      if (!dashboardPath) {
        removeToken();
        setError('Invalid role returned from server. Please contact support.');
        return;
      }
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>VIE</h1>
        <p>Team Member Login (Real Workspace Mode)</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="remember-row">
            <label className="remember-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Keep me signed in
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="helper-links">
          <button type="button" className="link-button" onClick={() => navigate('/register')}>
            Create simple account
          </button>
          <button type="button" className="link-button" onClick={() => navigate('/join')}>
            Have an invite code? Join your organization
          </button>
          <button type="button" className="link-button" onClick={() => navigate('/admin/login')}>
            Admin login
          </button>
          <button type="button" className="link-button" onClick={() => navigate('/admin/register')}>
            Create workspace (admin signup)
          </button>
        </div>

      </div>
    </div>
  );
}
