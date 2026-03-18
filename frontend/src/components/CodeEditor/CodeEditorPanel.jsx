import React, { useState, useEffect, useRef } from 'react';
import '../../styles/CodeEnvironment.css';

export default function CodeEditorPanel({ currentFile, content, onChange, language = 'javascript', onRun, onSubmit }) {
  const [fontsize, setFontsize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [MonacoEditor, setMonacoEditor] = useState(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Try to dynamically import @monaco-editor/react if available
    import('@monaco-editor/react')
      .then((mod) => {
        if (mounted) setMonacoEditor(() => mod.default);
      })
      .catch(() => {
        // Monaco not available; fall back to textarea
      });

    return () => { mounted = false; };
  }, []);

  const lines = content.split('\n');

  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div className="code-editor-panel">
      <div className="editor-toolbar">
        <span className="editor-filename">{currentFile || 'untitled.js'}</span>
        <div className="editor-controls">
          <select
            value={fontsize}
            onChange={(e) => setFontsize(Number(e.target.value))}
            className="editor-select"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>
          <label className="editor-checkbox">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
            />
            Lines
          </label>
          <button
            className="btn-primary editor-run"
            onClick={() => {
              if (typeof onRun === 'function') onRun(`node ${currentFile || 'index.js'}`);
            }}
            title="Run"
          >
            ▶ Run
          </button>
          <button
            className="btn-primary editor-submit"
            onClick={() => {
              if (typeof onSubmit === 'function') onSubmit({ file: currentFile, content });
            }}
            title="Submit"
          >
            ⤴ Submit
          </button>
        </div>
      </div>

      <div className="editor-container">
        {showLineNumbers && (
          <div className="line-numbers" style={{ fontSize: fontsize }}>
            {lines.map((_, i) => (
              <div key={i} className="line-number">{i + 1}</div>
            ))}
          </div>
        )}

        <div className="editor-mount" style={{ flex: 1 }}>
          {MonacoEditor ? (
            <MonacoEditor
              height="60vh"
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={content}
              onChange={handleEditorChange}
              options={{ fontSize: fontsize, minimap: { enabled: false } }}
              editorDidMount={(editor) => { monacoRef.current = editor; }}
            />
          ) : (
            <textarea
              className="code-editor"
              value={content}
              onChange={(e) => handleEditorChange(e.target.value)}
              style={{ fontSize: `${fontsize}px`, fontFamily: "'JetBrains Mono', 'Consolas', monospace" }}
              spellCheck="false"
              wrap="off"
            />
          )}
        </div>
      </div>

      <div className="editor-status">
        <span>{lines.length} lines</span>
        <span>{content.length} chars</span>
        <span className="language-badge">{language.toUpperCase()}</span>
      </div>
    </div>
  );
}
