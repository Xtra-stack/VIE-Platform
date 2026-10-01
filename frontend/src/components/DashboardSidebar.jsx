import React from 'react';
import '../styles/DashboardLayout.css';

const roleLabels = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SENIOR: 'Senior Developer',
  JUNIOR: 'Junior Developer',
};

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂', roles: ['OWNER', 'ADMIN', 'MANAGER', 'SENIOR', 'JUNIOR'], section: 'Workspace', route: 'dashboard' },
  { id: 'code-editor', label: 'Code Workspace', icon: '⌘', roles: ['SENIOR', 'JUNIOR'], section: 'Workspace', path: '/code-editor' },
  { id: 'reports', label: 'Reports', icon: '▥', roles: ['OWNER', 'ADMIN', 'MANAGER', 'SENIOR', 'JUNIOR'], section: 'Workspace', path: '/analytics' },
  { id: 'messages', label: 'Notifications', icon: '▱', roles: ['OWNER', 'ADMIN', 'MANAGER', 'SENIOR', 'JUNIOR'], section: 'Workspace', path: '/notifications' },
  { id: 'career', label: 'Career', icon: '◇', roles: ['JUNIOR'], section: 'Manage', path: '/career' },
  { id: 'mentorship', label: 'Mentorship', icon: '♧', roles: ['SENIOR', 'MANAGER'], section: 'Manage', path: '/mentorship' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '▥', roles: ['OWNER', 'ADMIN', 'MANAGER', 'SENIOR', 'JUNIOR'], section: 'Manage', path: '/leaderboard' },
  { id: 'promotions', label: 'Promotion History', icon: '↗', roles: ['OWNER', 'ADMIN', 'MANAGER', 'SENIOR', 'JUNIOR'], section: 'Manage', path: '/promotions' },
];

export default function DashboardSidebar({
  userRole,
  currentPath,
  dashboardPath,
  collapsed,
  open,
  onNavigate,
  onCollapse,
  onClose,
  onLogout,
  displayName,
  roleLabel,
  initials,
}) {
  const visibleItems = navigation.filter((item) => item.roles.includes(userRole));
  const workspaceItems = visibleItems.filter((item) => item.section === 'Workspace');
  const manageItems = visibleItems.filter((item) => item.section === 'Manage');

  const renderItem = (item) => {
    const path = item.route === 'dashboard' ? dashboardPath : item.path;
    const isActive = item.route === 'dashboard'
      ? currentPath === dashboardPath
      : currentPath.startsWith(item.path);

    return (
      <button
        key={item.id}
        type="button"
        className={`sidebar-item ${isActive ? 'active' : ''}`}
        onClick={() => onNavigate(path)}
        title={item.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
        <span className="sidebar-label">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {open && <button type="button" className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`dashboard-sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">V</span>
          <span className="sidebar-brand-copy">
            <strong>VIE</strong>
            <small>Engineering workspace</small>
          </span>
        </div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation">×</button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {workspaceItems.map(renderItem)}
        {manageItems.length > 0 && <div className="sidebar-section-label sidebar-section-secondary">Manage</div>}
        {manageItems.map(renderItem)}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="avatar">{initials}</span>
          <span className="sidebar-user-copy">
            <strong>{displayName}</strong>
            <small>{roleLabel}</small>
          </span>
          <button type="button" className="sidebar-logout" onClick={onLogout} title="Sign out">↪</button>
        </div>
        <button type="button" className="sidebar-collapse" onClick={onCollapse}>
          <span aria-hidden="true">{collapsed ? '»' : '«'}</span>
          <span className="sidebar-label">{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
        </button>
        <div className="sidebar-footer-text">VIE Platform · 1.0</div>
        </div>
      </aside>
    </>
  );
}
