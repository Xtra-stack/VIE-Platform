import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import JoinOrganizationPage from './auth/JoinOrganizationPage';
import AdminLoginPage from './auth/AdminLoginPage';
import AdminRegisterPage from './auth/AdminRegisterPage';
import JuniorDashboard from './dashboards/JuniorDashboard';
import SeniorDashboard from './dashboards/SeniorDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import DemoTrialDashboard from './dashboards/DemoTrialDashboard';
import CodeEnvironmentWrapper from './components/CodeEditor/CodeEnvironmentWrapper';
import LandingPage from './pages/LandingPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PromotionHistory from './pages/PromotionHistory';
import { AnalyticsDashboard } from './components/Analytics';
import { NotificationCenter } from './components/Notifications';
import TemplateLibrary from './pages/TemplateLibrary';
import Career from './pages/Career';
import Mentorship from './pages/Mentorship';
import { getToken, isAuthenticated, getRole, removeToken, setToken, getAuthMode } from './utils/auth.js';
import { getCurrentUser, getDemoState } from './services/api.js';

const getDashboardPath = (role, mode = 'REAL') => {
  if (mode === 'DEMO') {
    return '/demo/dashboard';
  }

  const roleMap = {
    OWNER: '/owner/dashboard',
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/dashboard',
    JUNIOR: '/junior/dashboard',
    SENIOR: '/senior/dashboard',
  };

  return roleMap[role] || null;
};

function ProtectedRoute({ children, requiredRole, requiredMode = 'REAL', sessionReady }) {
  const role = getRole();
  const mode = getAuthMode();
  const dashboardPath = getDashboardPath(role, mode);

  if (!sessionReady) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated() || !dashboardPath || mode !== requiredMode) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredMode === 'REAL' && requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  const [sessionRole, setSessionRole] = useState(getRole());
  const [sessionMode, setSessionMode] = useState(getAuthMode());
  const [sessionReady, setSessionReady] = useState(!isAuthenticated());
  const authenticated = isAuthenticated();
  const dashboardPath = getDashboardPath(sessionRole, sessionMode);

  useEffect(() => {
    document.title = 'VIE - Virtual Industry Experience';
  }, []);

  useEffect(() => {
    if (authenticated && sessionRole && !dashboardPath) {
      removeToken();
    }
  }, [authenticated, sessionRole, dashboardPath]);

  useEffect(() => {
    let active = true;

    const refreshSession = async () => {
      if (!isAuthenticated()) {
        if (active) {
          setSessionRole(null);
          setSessionMode('REAL');
          setSessionReady(true);
        }
        return;
      }

      const mode = getAuthMode();
      if (active) {
        setSessionMode(mode);
      }

      try {
        if (mode === 'DEMO') {
          const demo = await getDemoState();
          if (!active) return;

          if (demo?.user?.role) {
            setToken(getToken(), demo.user.role, null, 'DEMO');
            setSessionRole(demo.user.role);
            setSessionMode('DEMO');
          } else {
            removeToken();
            setSessionRole(null);
            setSessionMode('REAL');
          }

          return;
        }

        const user = await getCurrentUser();
        if (!active) return;

        if (user?.role) {
          setToken(getToken(), user.role, user.companyId, 'REAL');
          setSessionRole(user.role);
          setSessionMode('REAL');
        } else {
          removeToken();
          setSessionRole(null);
          setSessionMode('REAL');
        }
      } catch (error) {
        if (active) {
          removeToken();
          setSessionRole(null);
          setSessionMode('REAL');
        }
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    };

    refreshSession();

    return () => {
      active = false;
    };
  }, []);
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/"
          element={authenticated && dashboardPath ? <Navigate to={dashboardPath} replace /> : <LandingPage />}
        />

        {/* Login Route */}
        <Route 
          path="/login" 
          element={authenticated && dashboardPath ? <Navigate to={dashboardPath} replace /> : <LoginPage />} 
        />

        <Route
          path="/admin/login"
          element={authenticated && dashboardPath ? <Navigate to={dashboardPath} replace /> : <AdminLoginPage />}
        />

        <Route
          path="/admin/register"
          element={authenticated && dashboardPath ? <Navigate to={dashboardPath} replace /> : <AdminRegisterPage />}
        />

        <Route
          path="/register"
          element={authenticated && dashboardPath ? <Navigate to={dashboardPath} replace /> : <RegisterPage />}
        />

        <Route
          path="/join"
          element={authenticated && dashboardPath ? <Navigate to={dashboardPath} replace /> : <JoinOrganizationPage />}
        />
        
        {/* Junior Dashboard */}
        <Route 
          path="/junior/dashboard" 
          element={
            <ProtectedRoute requiredRole="JUNIOR" requiredMode="REAL" sessionReady={sessionReady}>
              <JuniorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Senior Dashboard */}
        <Route 
          path="/senior/dashboard" 
          element={
            <ProtectedRoute requiredRole="SENIOR" requiredMode="REAL" sessionReady={sessionReady}>
              <SeniorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Manager Dashboard */}
        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute requiredRole="MANAGER" requiredMode="REAL" sessionReady={sessionReady}>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute requiredRole="OWNER" requiredMode="REAL" sessionReady={sessionReady}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN" requiredMode="REAL" sessionReady={sessionReady}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/demo/dashboard"
          element={
            <ProtectedRoute requiredMode="DEMO" sessionReady={sessionReady}>
              <DemoTrialDashboard />
            </ProtectedRoute>
          }
        />

        {/* Code Environment - For testing coding features */}
        <Route
          path="/code-editor"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <CodeEnvironmentWrapper />
            </ProtectedRoute>
          }
        />

        {/* Analytics Dashboard */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Template Library */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <TemplateLibrary />
            </ProtectedRoute>
          }
        />

        {/* Career Mode */}
        <Route
          path="/career"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <Career />
            </ProtectedRoute>
          }
        />

        {/* Mentorship Feedback */}
        <Route
          path="/mentorship"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <Mentorship />
            </ProtectedRoute>
          }
        />

        {/* Notification Center */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <NotificationCenter />
            </ProtectedRoute>
          }
        />

        {/* Promotion History */}
        <Route
          path="/promotions"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <PromotionHistory />
            </ProtectedRoute>
          }
        />

        {/* Leaderboard Page */}
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute requiredMode="REAL" sessionReady={sessionReady}>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect based on auth state */}
        <Route 
          path="*" 
          element={
            authenticated && dashboardPath 
              ? <Navigate to={dashboardPath} replace /> 
              : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}
