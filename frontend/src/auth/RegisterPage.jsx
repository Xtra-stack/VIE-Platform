import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api.js';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(form);
      setSuccess('Account created successfully. Please login.');
      setForm({
        fullName: '',
        username: '',
        email: '',
        password: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <p className="register-kicker">An Industry Simulation Learning Platform for Developers</p>
        <h1>Create User Account</h1>
        <p>
          Create a simple user account to log in as a team member.
        </p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="register-actions">
          <button className="secondary" onClick={() => navigate('/login')}>Go to Login</button>
          <button className="secondary" onClick={() => navigate('/admin/register')}>Create Workspace (Admin)</button>
          <button className="secondary" onClick={() => navigate('/')}>Back to Landing</button>
        </div>
      </div>
    </div>
  );
}
