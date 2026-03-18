import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminRegister } from '../services/api.js';
import './LoginPage.css';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await adminRegister(form);
      setSuccess('Admin account created. Redirecting to admin login...');
      setTimeout(() => navigate('/admin/login', { replace: true }), 800);
    } catch (err) {
      setError(err.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Create Admin Account</h1>
        <p>Set up your real workspace entry account</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required disabled={loading} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="helper-links">
          <button type="button" className="link-button" onClick={() => navigate('/admin/login')}>
            Already have admin account? Login
          </button>
        </div>
      </div>
    </div>
  );
}
