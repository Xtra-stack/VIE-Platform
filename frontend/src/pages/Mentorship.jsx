import React, { useEffect, useState } from 'react';
import { postMentorshipFeedback, getMenteeFeedback, getMenteeSummary } from '../services/api.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import '../styles/Mentorship.css';

export default function Mentorship() {
  const [form, setForm] = useState({ menteeId: '', submissionId: '', criteria: { readability: 4, tests: 4, architecture: 4 }, comments: '' });
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState({ avgScore: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const loadForMentee = async (menteeId) => {
    try {
      const rows = await getMenteeFeedback(menteeId);
      setFeedbacks(rows || []);
      const s = await getMenteeSummary(menteeId);
      setSummary(s || { avgScore: 0, count: 0 });
    } catch (err) {
      console.warn('Failed to load mentee feedback', err);
    }
  };

  useEffect(() => {
    if (form.menteeId) loadForMentee(form.menteeId);
  }, [form.menteeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postMentorshipFeedback(form);
      setForm((prev) => ({ ...prev, comments: '' }));
      await loadForMentee(form.menteeId);
      alert('Feedback saved');
    } catch (err) {
      console.warn('Failed to post feedback', err);
      alert('Failed to save feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Mentorship" subtitle="Provide structured feedback and scores">
      <div className="mentorship-page">
        <div className="mentorship-form">
          <h3>Give Feedback</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mentee User ID</label>
              <input value={form.menteeId} onChange={(e) => setForm((p)=>({...p, menteeId: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Submission ID (optional)</label>
              <input value={form.submissionId} onChange={(e) => setForm((p)=>({...p, submissionId: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Readability</label>
              <input type="number" min="1" max="5" value={form.criteria.readability} onChange={(e)=>setForm(p=>({...p, criteria:{...p.criteria, readability: Number(e.target.value)}}))} />
            </div>
            <div className="form-group">
              <label>Tests</label>
              <input type="number" min="1" max="5" value={form.criteria.tests} onChange={(e)=>setForm(p=>({...p, criteria:{...p.criteria, tests: Number(e.target.value)}}))} />
            </div>
            <div className="form-group">
              <label>Architecture</label>
              <input type="number" min="1" max="5" value={form.criteria.architecture} onChange={(e)=>setForm(p=>({...p, criteria:{...p.criteria, architecture: Number(e.target.value)}}))} />
            </div>
            <div className="form-group">
              <label>Comments</label>
              <textarea value={form.comments} onChange={(e)=>setForm(p=>({...p, comments: e.target.value}))} />
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Feedback'}</button>
          </form>
        </div>

        <div className="mentorship-list">
          <h3>Mentee Feedback Summary</h3>
          <div>Average Score: {summary.avgScore?.toFixed ? summary.avgScore.toFixed(2) : summary.avgScore} ({summary.count || 0} reviews)</div>
          <div className="feedback-items">
            {feedbacks.map((f) => (
              <div key={f._id} className="feedback-item">
                <div className="meta">By: {f.mentorId} · {new Date(f.createdAt).toLocaleString()}</div>
                <div className="score">Score: {f.score}</div>
                <pre className="criteria">{JSON.stringify(f.criteria, null, 2)}</pre>
                <div className="comments">{f.comments}</div>
              </div>
            ))}
            {feedbacks.length === 0 && <div>No feedback yet for this user.</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
