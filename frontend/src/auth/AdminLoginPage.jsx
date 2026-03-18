import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api.js';
import { removeToken, setToken } from '../utils/auth.js';
import './LoginPage.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setError('Username/email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await adminLogin(normalizedUsername, password);
      removeToken();
      setToken(response.token, response.role, response.companyId, 'REAL', {
        remember: rememberMe,
        refreshToken: response.refreshToken,
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>VIE Admin</h1>
        <p>Sign in to manage real workspaces</p>

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
            {loading ? 'Signing in...' : 'Admin Login'}
          </button>
        </form>

        <div className="helper-links">
          <button type="button" className="link-button" onClick={() => navigate('/admin/register')}>
            Create admin account
          </button>
          <button type="button" className="link-button" onClick={() => navigate('/login')}>
            Team member login
          </button>
        </div>
      </div>
    </div>
  );
}
