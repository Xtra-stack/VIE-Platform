import React, { useEffect, useRef } from 'react';
import '../styles/CodeEditor.css';

export default function CodeEditor({ code, onChange, language = 'javascript', placeholder = 'Paste your code here...' }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea to fit content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(300, textareaRef.current.scrollHeight) + 'px';
    }
  }, [code]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="code-editor-container">
      <textarea
        ref={textareaRef}
        className="code-editor-textarea"
        value={code}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck="false"
        data-language={language}
      />
      <pre className="code-editor-highlight">
        <code>{code}</code>
      </pre>
    </div>
  );
}
