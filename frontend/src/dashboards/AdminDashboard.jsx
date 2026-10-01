import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import {
  createOrganization,
  createRealWorkspace,
  assignWorkspaceManager,
  inviteRealWorkspaceMember,
  getCompany,
  getProjects,
} from '../services/api.js';
import { getCompanyId, getUser } from '../utils/auth.js';
import { ActivityItem, ChartCard, DataTable, EmptyState, LoadingState, PageHeader, StatCard, StatusBadge } from '../components/DashboardPrimitives.jsx';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [organization, setOrganization] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState('');

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

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setCompanyLoading(true);
    setCompanyError('');
    try {
      const companyId = getCompanyId();
      const [companyResponse, projectsData] = await Promise.all([
        companyId ? getCompany(companyId) : Promise.resolve(null),
        getProjects(),
      ]);
      setOrganization(companyResponse?.data || null);
      setProjects(projectsData || []);
    } catch (err) {
      setCompanyError(err.message || 'Organization data unavailable');
      setProjects([]);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCreateOrganization = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await createOrganization(orgForm);
      setOrganization(response.data.company);
      await loadAdminData();
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
      await loadAdminData();
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
  const user = getUser();
  const displayName = user?.fullName || user?.name || user?.username || 'Admin';
  const createdActivities = [
    ...(organization ? [{ id: 'organization-created', title: 'Organization available', description: organization.name, timestamp: organization.createdAt, tone: 'blue' }] : []),
    ...(workspace ? [{ id: 'workspace-created', title: 'Workspace created', description: workspace.name, timestamp: workspace.createdAt, tone: 'green' }] : []),
    ...invitedMembers.map((member) => ({ id: `member-${member._id || member.username}`, title: 'Member invited', description: `${member.fullName || member.username} · ${member.role}`, timestamp: member.createdAt, tone: 'purple' })),
  ];
  const formatDate = (timestamp) => timestamp
    ? new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date unavailable';
  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Real Workspace Mode: setup and team orchestration">
      <div className="admin-dashboard">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        {companyError && <div className="error">{companyError}</div>}

        <PageHeader
          title={`Good morning, ${displayName} 👋`}
          subtitle="Manage your organization, workspaces and team."
        />

        <div className="admin-data-note">Organization and project totals use live API data. Member and invitation listings are limited by the current Admin API surface.</div>

        <section className="admin-kpi-grid" aria-label="Admin KPIs">
          <StatCard title="Total Members" value={invitedMembers.length || 'N/A'} subtitle={invitedMembers.length ? 'Members invited this session' : 'Member listing unavailable'} icon="♧" />
          <StatCard title="Active Workspaces" value={workspace?.status === 'ACTIVE' ? 1 : 'N/A'} subtitle={workspace ? 'Workspace created this session' : 'Admin workspace list unavailable'} icon="▦" />
          <StatCard title="Teams / Groups" value="N/A" subtitle="Team grouping data unavailable" icon="◇" />
          <StatCard title="Pending Invitations" value="N/A" subtitle="Invitation listing unavailable" icon="✉" />
        </section>

        <div className="admin-dashboard-grid">
          <ChartCard title="Organization Overview" subtitle="Current organization context">
            {companyLoading ? <LoadingState message="Loading organization..." /> : organization ? (
              <div className="admin-overview-list">
                <div><span>Organization</span><strong>{organization.name}</strong></div>
                <div><span>Status</span><StatusBadge status={organization.trialStatus || 'Active'} tone="success" /></div>
                <div><span>Plan</span><strong>{organization.planType || 'Plan unavailable'}</strong></div>
                <div><span>Created</span><strong>{formatDate(organization.createdAt)}</strong></div>
              </div>
            ) : <EmptyState icon="◇" title="No organization context" message="Create an organization to manage its workspace." />}
          </ChartCard>

          <ChartCard title="Workspace Overview" subtitle="Projects returned by the existing Admin-accessible API">
            {projects.length === 0 && !workspace ? (
              <EmptyState icon="▦" title="No workspaces available" message="Create a workspace to establish your organization structure." />
            ) : (
              <div className="admin-workspace-summary">
                <strong>{projects.length || (workspace ? 1 : 0)} project/workspace record{(projects.length || (workspace ? 1 : 0)) === 1 ? '' : 's'}</strong>
                <span>{workspace ? `${workspace.name} · ${workspace.status || 'Status unavailable'}` : 'Workspace details are available after creation.'}</span>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="admin-dashboard-grid admin-dashboard-grid-secondary">
          <ChartCard title="Team Members" subtitle="Members created through the current Admin session">
            {invitedMembers.length === 0 ? <EmptyState icon="♧" title="No member records" message="Invite a Manager, Senior, or Junior to see them here." /> : (
              <div className="admin-member-list">
                {invitedMembers.map((member) => <div className="admin-member-row" key={member._id || member.username}><span className="admin-avatar">{(member.fullName || member.username || 'U').slice(0, 2).toUpperCase()}</span><div><strong>{member.fullName || member.username}</strong><span>{member.email || 'Email unavailable'} · {member.role}</span></div><StatusBadge status="Created" tone="success" /></div>)}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Pending Invitations" subtitle="Invitation records are not listable through the current API">
            <EmptyState icon="✉" title="Invitation list unavailable" message="Use the Invite Members form below to create invitations." />
          </ChartCard>
        </div>

        <div className="admin-dashboard-grid admin-dashboard-grid-secondary">
          <ChartCard title="Recent Activity" subtitle="Events derived from this session's organization actions">
            {createdActivities.length === 0 ? <EmptyState icon="◷" title="No recent activity" message="Organization setup activity will appear here." /> : <div className="admin-activity-list">{createdActivities.map((activity) => <ActivityItem key={activity.id} title={activity.title} description={activity.description} timestamp={formatDate(activity.timestamp)} tone={activity.tone} />)}</div>}
          </ChartCard>
          <ChartCard title="Admin Quick Actions" subtitle="Existing organization controls">
            <div className="admin-quick-actions">
              <button type="button" onClick={() => scrollToSection('admin-create-workspace')}>Create Workspace <span>→</span></button>
              <button type="button" onClick={() => scrollToSection('admin-invite-members')}>Invite Manager <span>→</span></button>
              <button type="button" onClick={() => scrollToSection('admin-invite-members')}>Manage Members <span>→</span></button>
              <button type="button" onClick={() => scrollToSection('admin-create-workspace')}>View Workspaces <span>→</span></button>
            </div>
          </ChartCard>
        </div>

        <div className="card admin-control-card" id="admin-create-organization">
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

        <div className="card admin-control-card" id="admin-create-workspace">
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

        <div className="card admin-control-card">
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

        <div className="card admin-control-card" id="admin-invite-members">
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
