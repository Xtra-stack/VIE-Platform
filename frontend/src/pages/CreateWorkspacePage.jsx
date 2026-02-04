import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace, inviteWorkspaceUser } from '../services/api.js';
import { setToken, getCompanyId } from '../utils/auth.js';
import './CreateWorkspacePage.css';

export default function CreateWorkspacePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [invites, setInvites] = useState([]);

  const [formData, setFormData] = useState({
    companyName: '',
    companySlug: '',
    projectName: '',
    projectSlug: '',
    timezone: 'UTC',
    country: '',
    managerFullName: '',
    managerUsername: '',
    managerEmail: '',
    managerPassword: '',
  });

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'SENIOR',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        companySlug: formData.companySlug || undefined,
        projectName: formData.projectName,
        projectSlug: formData.projectSlug || undefined,
        timezone: formData.timezone,
        country: formData.country,
        manager: {
          fullName: formData.managerFullName,
          username: formData.managerUsername,
          email: formData.managerEmail,
          password: formData.managerPassword,
        },
      };

      const response = await createWorkspace(payload);
      const data = response.data;

      setWorkspace(data);
      setToken(data.token, data.manager.role, data.manager.companyId);
      setSuccess('Workspace created! You can now invite seniors and juniors.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const companyId = getCompanyId() || workspace?.company?._id;
      if (!companyId) {
        setError('Company ID missing. Please log in as manager.');
        setLoading(false);
        return;
      }

      const response = await inviteWorkspaceUser(companyId, inviteForm);
      setInvites((prev) => [...prev, response.data.user]);
      setSuccess('Invitation created successfully.');
      setInviteForm({ fullName: '', username: '', email: '', password: '', role: 'SENIOR' });
    } catch (err) {
      setError(err.message || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <div className="workspace-card">
        <div className="workspace-header">
          <h1>Create Workspace</h1>
          <p>Set up a new company workspace and manager account.</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleCreateWorkspace} className="workspace-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Slug (optional)</label>
                <input
                  name="companySlug"
                  value={formData.companySlug}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Slug (optional)</label>
                <input
                  name="projectSlug"
                  value={formData.projectSlug}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <input
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="workspace-section">
              <h3>Manager Account</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="managerFullName"
                    value={formData.managerFullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    name="managerUsername"
                    value={formData.managerUsername}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="managerEmail"
                    type="email"
                    value={formData.managerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    name="managerPassword"
                    type="password"
                    value={formData.managerPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="workspace-actions">
              <button type="button" className="secondary" onClick={() => navigate('/')}
                disabled={loading}
              >
                Back
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="workspace-step">
            <div className="workspace-summary">
              <h3>Workspace Ready</h3>
              <p><strong>Company:</strong> {workspace?.company?.name}</p>
              <p><strong>Project:</strong> {workspace?.project?.name}</p>
              <p><strong>Repository:</strong> {workspace?.project?.repositoryPath}</p>
            </div>

            <form onSubmit={handleInvite} className="workspace-form">
              <h3>Invite Seniors & Juniors</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="fullName" value={inviteForm.fullName} onChange={handleInviteChange} required />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input name="username" value={inviteForm.username} onChange={handleInviteChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={inviteForm.email} onChange={handleInviteChange} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input name="password" type="password" value={inviteForm.password} onChange={handleInviteChange} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={inviteForm.role} onChange={handleInviteChange}>
                    <option value="SENIOR">Senior</option>
                    <option value="JUNIOR">Junior</option>
                  </select>
                </div>
              </div>

              <div className="workspace-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Inviting...' : 'Invite User'}
                </button>
              </div>
            </form>

            {invites.length > 0 && (
              <div className="workspace-invites">
                <h4>Invited Users</h4>
                <ul>
                  {invites.map((user) => (
                    <li key={user._id}>
                      {user.fullName} ({user.role}) – {user.username}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="workspace-actions">
              <button className="secondary" onClick={() => navigate('/login')}>
                Go to Login
              </button>
              <button onClick={() => navigate('/manager/dashboard')}>
                Go to Manager Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
