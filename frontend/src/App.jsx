import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import JuniorDashboard from './dashboards/JuniorDashboard';
import SeniorDashboard from './dashboards/SeniorDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import { getUser, isAuthenticated, removeToken } from './utils/auth.js';

function Header({ user, onLogout }) {
  return (
    <header>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>VIE Dashboard</h1>
          {user && (
            <div className="user-info">
              Welcome, <strong>{user.username}</strong>
              <span className="role-badge">{user.role}</span>
            </div>
          )}
        </div>
        <button onClick={onLogout} className="secondary">
          Logout
        </button>
      </div>
    </header>
  );
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function DashboardRouter() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <>
                {user.role === 'JUNIOR' && <JuniorDashboard />}
                {user.role === 'SENIOR' && <SeniorDashboard />}
                {user.role === 'MANAGER' && <ManagerDashboard />}
              </>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
