import React from 'react';
import '../styles/DashboardComponents.css';

export default function DashboardSidebar({ tabs, activeTab, onTabChange, userRole }) {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'tasks', label: 'Tasks', icon: '✓', showFor: ['JUNIOR', 'SENIOR', 'MANAGER'] },
    { id: 'submissions', label: 'Submissions', icon: '📤', showFor: ['JUNIOR', 'SENIOR'] },
    { id: 'approvals', label: 'Approvals', icon: '✅', showFor: ['SENIOR', 'MANAGER'] },
    { id: 'reviews', label: 'Reviews', icon: '👁️', showFor: ['SENIOR'] },
    { id: 'team', label: 'Team', icon: '👥', showFor: ['SENIOR', 'MANAGER'] },
    { id: 'activity', label: 'Activity', icon: '📊', showFor: ['JUNIOR', 'SENIOR', 'MANAGER'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', showFor: ['JUNIOR', 'SENIOR', 'MANAGER'] },
  ];

  // Filter items based on user role
  const visibleItems = sidebarItems.filter(item => 
    !item.showFor || item.showFor.includes(userRole)
  );

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Menu</div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Version 1.0
        </div>
      </div>
    </aside>
  );
}
