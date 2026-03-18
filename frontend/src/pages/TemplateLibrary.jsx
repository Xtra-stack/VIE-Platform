import React, { useEffect, useState } from 'react';
import { getTemplates, generateTemplate } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import '../styles/TemplateLibrary.css';

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getTemplates();
        if (!mounted) return;
        setTemplates(data || []);
      } catch (err) {
        console.error('Failed to load templates', err);
        if (!mounted) return;
        setTemplates([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const openInWorkspace = async (tpl) => {
    // If server supports generation, request generated files, else use tpl.files
    let payload = tpl;
    try {
      const generated = await generateTemplate(tpl._id);
      if (generated && generated.files) payload = generated;
    } catch (_e) {
      // fallback to template data
    }

    const filesObj = {};
    (payload.files || []).forEach((f) => {
      filesObj[f.filename] = f.content || '';
    });

    try {
      localStorage.setItem('codeEnvFiles', JSON.stringify(filesObj));
      // set default current file
      localStorage.setItem('codeEnvCurrentFile', Object.keys(filesObj)[0] || 'src/index.js');
    } catch (e) {
      console.warn('Failed to persist template to localStorage', e);
    }

    navigate('/code-editor');
  };

  return (
    <div className="template-library">
      <h2>Project Templates</h2>
      {loading ? (
        <div>Loading templates...</div>
      ) : (
        <div className="template-list">
          {templates.length === 0 && <div>No templates available</div>}
          {templates.map((t) => (
            <div key={t._id} className="template-card">
              <h3>{t.name}</h3>
              <p className="template-desc">{t.description}</p>
              <div className="template-tags">{(t.tags || []).map(tag => (<span key={tag} className="tag">{tag}</span>))}</div>
              <div className="template-actions">
                <button onClick={() => openInWorkspace(t)}>Open in Workspace</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
