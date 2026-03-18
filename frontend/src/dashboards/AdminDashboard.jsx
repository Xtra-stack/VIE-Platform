import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import RoleStats from '../components/RoleStats.jsx';
import {
  createOrganization,
  createRealWorkspace,
  assignWorkspaceManager,
  inviteRealWorkspaceMember,
} from '../services/api.js';

export default function AdminDashboard() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [organization, setOrganization] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [invitedMembers, setInvitedMembers] = useState([]);

  const [orgForm, setOrgForm] = useState({
    name: '',
    slug: '',
    timezone: 'UTC',
    country: '',
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    name: '',
    projectName: '',
    projectSlug: '',
    projectType: 'NEW_FEATURE',
    techArea: 'FULLSTACK',
  });

  const [assignForm, setAssignForm] = useState({ managerUserId: '' });

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'MANAGER',
  });

  const handleCreateOrganization = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await createOrganization(orgForm);
      setOrganization(response.data.company);
      setSuccess('Organization created successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create organization');
    }
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await createRealWorkspace(workspaceForm);
      setWorkspace(response.data.workspace);
      setSuccess('Workspace created successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
    }
  };

  const handleAssignManager = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!workspace?._id) {
        setError('Create a workspace first.');
        return;
      }
      await assignWorkspaceManager(workspace._id, assignForm.managerUserId);
      setSuccess('Manager assigned to workspace.');
    } catch (err) {
      setError(err.message || 'Failed to assign manager');
    }
  };

  const handleInviteMember = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await inviteRealWorkspaceMember(inviteForm);
      setInvitedMembers((prev) => [...prev, response.data.user]);
      setSuccess(`${inviteForm.role} invited successfully.`);
      setInviteForm({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'MANAGER',
      });
    } catch (err) {
      setError(err.message || 'Failed to invite member');
    }
  };

  const managerCandidates = invitedMembers.filter((member) => member.role === 'MANAGER');

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Real Workspace Mode: setup and team orchestration">
      <div>
        <RoleStats role="ADMIN" />
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="card">
          <h2>1) Create Organization</h2>
          <form onSubmit={handleCreateOrganization}>
            <div className="form-group">
              <label>Name</label>
              <input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input value={orgForm.slug} onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <input value={orgForm.timezone} onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input value={orgForm.country} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })} />
            </div>
            <button type="submit">Create Organization</button>
          </form>
          {organization && <p style={{ marginTop: '10px' }}><strong>Created:</strong> {organization.name}</p>}
        </div>

        <div className="card">
          <h2>2) Create Workspace</h2>
          <form onSubmit={handleCreateWorkspace}>
            <div className="form-group">
              <label>Workspace Name</label>
              <input value={workspaceForm.name} onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input value={workspaceForm.projectName} onChange={(e) => setWorkspaceForm({ ...workspaceForm, projectName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Project Slug</label>
              <input value={workspaceForm.projectSlug} onChange={(e) => setWorkspaceForm({ ...workspaceForm, projectSlug: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Project Type</label>
              <select value={workspaceForm.projectType} onChange={(e) => setWorkspaceForm({ ...workspaceForm, projectType: e.target.value })}>
                <option value="NEW_FEATURE">New Feature</option>
                <option value="NEW_PROJECT">New Project</option>
                <option value="BUG_FIX">Bug Fix</option>
                <option value="UPDATE">Update</option>
                <option value="ENHANCEMENT">Enhancement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tech Area</label>
              <select value={workspaceForm.techArea} onChange={(e) => setWorkspaceForm({ ...workspaceForm, techArea: e.target.value })}>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="FULLSTACK">Full Stack</option>
              </select>
            </div>
            <button type="submit">Create Workspace</button>
          </form>
          {workspace && <p style={{ marginTop: '10px' }}><strong>Created:</strong> {workspace.name}</p>}
        </div>

        <div className="card">
          <h2>3) Assign Manager</h2>
          <form onSubmit={handleAssignManager}>
            <div className="form-group">
              <label>Manager User</label>
              <select value={assignForm.managerUserId} onChange={(e) => setAssignForm({ managerUserId: e.target.value })} required>
                <option value="">Select invited manager</option>
                {managerCandidates.map((user) => (
                  <option key={user._id} value={user._id}>{user.fullName} ({user.username})</option>
                ))}
              </select>
            </div>
            <button type="submit">Assign Manager</button>
          </form>
        </div>

        <div className="card">
          <h2>4) Invite Members</h2>
          <form onSubmit={handleInviteMember}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={inviteForm.fullName} onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input value={inviteForm.username} onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={inviteForm.password} onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                <option value="MANAGER">Manager</option>
                <option value="SENIOR">Senior</option>
                <option value="JUNIOR">Junior</option>
              </select>
            </div>
            <button type="submit">Invite Member</button>
          </form>

          {invitedMembers.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <h4>Invited Members</h4>
              <ul>
                {invitedMembers.map((user) => (
                  <li key={user._id}>{user.fullName} - {user.role}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
