import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getRole, getUser } from '../utils/auth.js';
import useAuthSession from '../hooks/useAuthSession.js';
import DashboardSidebar from './DashboardSidebar.jsx';
import '../styles/DashboardLayout.css';

export default function DashboardLayout({ 
  title, 
  subtitle, 
  children,
}) {
  const role = getRole();
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    await signOut();
  };

  const roleLabels = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    SENIOR: 'Senior Developer',
    JUNIOR: 'Junior Developer',
  };

  const roleLabel = roleLabels[role] || 'Team Member';
  const displayName = user?.fullName || user?.name || user?.username || 'VIE User';
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dashboardPaths = {
    OWNER: '/owner/dashboard',
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/dashboard',
    SENIOR: '/senior/dashboard',
    JUNIOR: '/junior/dashboard',
  };

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
    setSidebarOpen(false);
  };

  const themeClass = role === 'ADMIN' ? 'admin-theme' : role === 'MANAGER' ? 'manager-theme' : '';

  return (
    <div className={`dashboard-layout ${themeClass} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <DashboardSidebar
        userRole={role}
        currentPath={location.pathname}
        dashboardPath={dashboardPaths[role] || '/'}
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        onNavigate={handleNavigate}
        onCollapse={() => setSidebarCollapsed((value) => !value)}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        displayName={displayName}
        roleLabel={roleLabel}
        initials={initials}
      />

      <div className="dashboard-surface">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <span />
              <span />
              <span />
            </button>
            <div className="breadcrumb" aria-label="Breadcrumb">
              <span className="breadcrumb-root">Workspace</span>
              <span className="breadcrumb-divider">/</span>
              <span className="breadcrumb-current">{title || 'Dashboard'}</span>
            </div>
          </div>

          <div className="header-center">
            <label className="global-search">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search workspace"
                aria-label="Search workspace"
              />
              <span className="search-shortcut">/</span>
            </label>
          </div>

          <div className="header-right">
            <Link to="/notifications" className="header-icon-button" title="Notifications" aria-label="Notifications">
              <span aria-hidden="true">◔</span>
            </Link>
            <Link to="/notifications" className="header-icon-button" title="Messages" aria-label="Messages">
              <span aria-hidden="true">▱</span>
            </Link>
            <div className="profile-menu-wrap">
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
              >
                <span className="avatar avatar-small">{initials}</span>
                <span className="profile-trigger-copy">
                  <strong>{displayName}</strong>
                  <small>{roleLabel}</small>
                </span>
                <span className="profile-chevron" aria-hidden="true">⌄</span>
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-heading">Signed in as</div>
                  <strong>{displayName}</strong>
                  <span>{roleLabel}</span>
                  <Link to="/promotions" onClick={() => setProfileOpen(false)}>Promotion history</Link>
                  <button type="button" onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-content-header">
            <div>
              {title && <h1 className="page-title">{title}</h1>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            <span className="role-badge" title={`You are logged in as ${roleLabel}`}>{roleLabel}</span>
          </div>
          {children}
        </main>

        <footer className="dashboard-footer">
          <p>&copy; 2026 Virtual Industry Experience</p>
          <Link to="/promotions">Promotion history</Link>
        </footer>
      </div>
    </div>
  );
}
