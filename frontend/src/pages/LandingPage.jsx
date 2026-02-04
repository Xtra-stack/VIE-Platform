import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1>VIE Workspace</h1>
        <p>Launch a virtual engineering workspace or sign in to continue.</p>
      </div>

      <div className="landing-actions">
        <div className="landing-card">
          <h2>Login</h2>
          <p>Access your existing workspace and continue your review workflow.</p>
          <button onClick={() => navigate('/login')}>Login</button>
        </div>

        <div className="landing-card">
          <h2>Create Workspace</h2>
          <p>Create a new company workspace, manager account, and project space.</p>
          <button className="secondary" onClick={() => navigate('/workspace/create')}>
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
