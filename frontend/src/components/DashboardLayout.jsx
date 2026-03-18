import React from 'react';
import { Link } from 'react-router-dom';
import { getRole } from '../utils/auth.js';
import useAuthSession from '../hooks/useAuthSession.js';
import '../styles/DashboardLayout.css';

export default function DashboardLayout({ 
  title, 
  subtitle, 
  children, 
  showTeamStatus = false 
}) {
  const role = getRole();
  const { signOut } = useAuthSession();

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleBadge = () => {
    const roleColors = {
      OWNER: '#9C27B0',
      ADMIN: '#673AB7',
      MANAGER: '#FF9800',
      JUNIOR: '#4CAF50',
      SENIOR: '#2196F3',
    };

    return (
      <span 
        className="role-badge" 
        style={{ backgroundColor: roleColors[role] || '#999' }}
        title={`You are logged in as ${role}`}
      >
        {role}
      </span>
    );
  };

  const themeClass = role === 'ADMIN' ? 'admin-theme' : role === 'MANAGER' ? 'manager-theme' : '';

  return (
    <div className={`dashboard-layout ${themeClass}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="app-branding">
            <h1>VIE</h1>
            <span className="subtitle">Virtual Industry Experience</span>
          </div>
        </div>
        
        <div className="header-center">
          {title && <h2 className="page-title">{title}</h2>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        <div className="header-right">
          {getRoleBadge()}
          <Link to="/promotions" className="promotions-link" title="Promotion history">
            Promotions
          </Link>
          <button 
            onClick={handleLogout} 
            className="logout-btn"
            title="Sign out of VIE"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2026 Virtual Industry Experience. All rights reserved.</p>
      </footer>
    </div>
  );
}
