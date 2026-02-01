import React, { useState, useEffect } from 'react';
import { getSubmissions, createSubmission, getProjects } from '../services/api.js';

export default function JuniorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    sourceBranch: '',
    targetBranch: 'develop',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [submissionsData, projectsData] = await Promise.all([
        getSubmissions(),
        getProjects(),
      ]);
      setSubmissions(submissionsData || []);
      setProjects(projectsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await createSubmission(
        formData.projectId,
        formData.sourceBranch,
        formData.targetBranch,
        formData.title,
        formData.description
      );
      setSuccess('Submission created successfully!');
      setFormData({
        projectId: '',
        sourceBranch: '',
        targetBranch: 'develop',
        title: '',
        description: '',
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2>📤 Submit Code</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Source Branch</label>
            <input
              type="text"
              name="sourceBranch"
              placeholder="e.g., feature/auth-system"
              value={formData.sourceBranch}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Branch</label>
            <input
              type="text"
              name="targetBranch"
              value={formData.targetBranch}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Brief description of changes"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Detailed explanation of your changes"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Code'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>📋 My Submissions</h2>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub._id} className="submission-item">
              <div className="details">
                <h3>{sub.title}</h3>
                <p>Status: <span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span></p>
                <p>Branch: {sub.sourceBranch} → {sub.targetBranch}</p>
                <p>{sub.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
