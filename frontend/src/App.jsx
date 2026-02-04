import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import LandingPage from './pages/LandingPage.jsx';
import CreateWorkspacePage from './pages/CreateWorkspacePage.jsx';
import JuniorDashboard from './dashboards/JuniorDashboard';
import SeniorDashboard from './dashboards/SeniorDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import { isAuthenticated, removeToken, getRole } from './utils/auth.js';

function Header({ onLogout }) {
  const navigate = useNavigate();
  const role = getRole();
  
  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <header>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>VIE Dashboard</h1>
          {role && (
            <div className="user-info">
              <span className="role-badge">{role}</span>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="secondary">
          Logout
        </button>
      </div>
    </header>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const role = getRole();
  
  if (!isAuthenticated() || !role) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Header />
      <div className="container">
        {children}
      </div>
    </>
  );
}

export default function App() {
  const authenticated = isAuthenticated();
  const role = getRole();
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Landing Route */}
        <Route
          path="/"
          element={
            authenticated && role
              ? <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />
              : <LandingPage />
          }
        />

        {/* Create Workspace Route */}
        <Route path="/workspace/create" element={<CreateWorkspacePage />} />

        {/* Login Route */}
        <Route 
          path="/login" 
          element={authenticated && role ? <Navigate to={`/${role.toLowerCase()}/dashboard`} replace /> : <LoginPage />} 
        />
        
        {/* Junior Dashboard */}
        <Route 
          path="/junior/dashboard" 
          element={
            <ProtectedRoute requiredRole="JUNIOR">
              <JuniorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Senior Dashboard */}
        <Route 
          path="/senior/dashboard" 
          element={
            <ProtectedRoute requiredRole="SENIOR">
              <SeniorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Manager Dashboard */}
        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute requiredRole="MANAGER">
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect based on auth state */}
        <Route 
          path="*" 
          element={
            authenticated && role 
              ? <Navigate to={`/${role.toLowerCase()}/dashboard`} replace /> 
              : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}
