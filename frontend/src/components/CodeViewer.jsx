import React from 'react';

export default function CodeViewer({ codeLines = [], filesChanged = [], onClose }) {
  // Support both codeLines (array) and codeSnippet (string) for backward compatibility
  const lines = Array.isArray(codeLines) 
    ? codeLines 
    : typeof codeLines === 'string' 
      ? codeLines.split('\n').map((content, idx) => ({ lineNumber: idx + 1, content }))
      : [];

  return (
    <div className="code-viewer-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>📄 Code Review</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {filesChanged && filesChanged.length > 0 && (
            <div className="files-section">
              <h3>📁 Files Changed</h3>
              <ul className="files-list">
                {filesChanged.map((file, idx) => (
                  <li key={idx}>{file}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="code-section">
            <h3>💻 Code Snippet</h3>
            {lines && lines.length > 0 ? (
              <div className="code-block">
                <table className="code-table">
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.lineNumber} className="code-line">
                        <td className="line-number">{line.lineNumber}</td>
                        <td className="line-content"><code>{line.content || ' '}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-code">No code provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
