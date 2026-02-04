import React, { useState } from 'react';
import '../styles/DiffViewer.css';

export default function DiffViewer({ 
  codeLines, 
  codeSnippet, 
  filesChanged,
  onAddComment,
  selectedFile,
  onFileSelect 
}) {
  const [hoverLine, setHoverLine] = useState(null);
  const [commentLine, setCommentLine] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Parse code into lines with change types
  const parseCodeLines = () => {
    if (codeLines && Array.isArray(codeLines)) {
      return codeLines.map(line => {
        // Detect change type from line content
        const content = line.content || '';
        let changeType = 'unchanged';
        let displayContent = content;

        if (content.startsWith('+')) {
          changeType = 'added';
          displayContent = content.substring(1);
        } else if (content.startsWith('-')) {
          changeType = 'removed';
          displayContent = content.substring(1);
        } else if (content.startsWith('~') || content.startsWith('!')) {
          changeType = 'modified';
          displayContent = content.substring(1);
        }

        return {
          lineNumber: line.lineNumber,
          content: displayContent,
          changeType,
          originalContent: content
        };
      });
    }

    // Fallback: parse codeSnippet string
    if (codeSnippet) {
      return codeSnippet.split('\n').map((line, idx) => {
        let changeType = 'unchanged';
        let displayContent = line;

        if (line.startsWith('+')) {
          changeType = 'added';
          displayContent = line.substring(1);
        } else if (line.startsWith('-')) {
          changeType = 'removed';
          displayContent = line.substring(1);
        } else if (line.startsWith('~') || line.startsWith('!')) {
          changeType = 'modified';
          displayContent = line.substring(1);
        }

        return {
          lineNumber: idx + 1,
          content: displayContent,
          changeType,
          originalContent: line
        };
      });
    }

    return [];
  };

  const lines = parseCodeLines();

  const handleAddCommentClick = (lineNumber) => {
    setCommentLine(lineNumber);
    setCommentText('');
  };

  const handleSubmitComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(commentLine, commentText);
      setCommentLine(null);
      setCommentText('');
    }
  };

  const handleCancelComment = () => {
    setCommentLine(null);
    setCommentText('');
  };

  // Calculate stats
  const stats = {
    added: lines.filter(l => l.changeType === 'added').length,
    removed: lines.filter(l => l.changeType === 'removed').length,
    modified: lines.filter(l => l.changeType === 'modified').length,
    unchanged: lines.filter(l => l.changeType === 'unchanged').length,
  };

  return (
    <div className="diff-viewer">
      {/* Stats Bar */}
      <div className="diff-stats">
        <span className="stat-item added">+{stats.added} added</span>
        <span className="stat-item removed">-{stats.removed} removed</span>
        {stats.modified > 0 && (
          <span className="stat-item modified">~{stats.modified} modified</span>
        )}
        <span className="stat-item unchanged">{stats.unchanged} unchanged</span>
      </div>

      {/* File Selector */}
      {filesChanged && filesChanged.length > 0 && (
        <div className="diff-file-selector">
          <label>Viewing: </label>
          <select 
            value={selectedFile || 'all'} 
            onChange={(e) => onFileSelect && onFileSelect(e.target.value === 'all' ? null : e.target.value)}
          >
            <option value="all">All files</option>
            {filesChanged.map((file, idx) => (
              <option key={idx} value={file}>{file}</option>
            ))}
          </select>
        </div>
      )}

      {/* Code Table */}
      <div className="diff-code-table">
        <table>
          <tbody>
            {lines.map((line) => (
              <React.Fragment key={line.lineNumber}>
                <tr 
                  className={`diff-line ${line.changeType}`}
                  onMouseEnter={() => setHoverLine(line.lineNumber)}
                  onMouseLeave={() => setHoverLine(null)}
                >
                  <td className="line-number">{line.lineNumber}</td>
                  <td className="line-indicator">
                    {line.changeType === 'added' && '+'}
                    {line.changeType === 'removed' && '-'}
                    {line.changeType === 'modified' && '~'}
                  </td>
                  <td className="line-content">
                    <code>{line.content}</code>
                  </td>
                  <td className="line-actions">
                    {onAddComment && hoverLine === line.lineNumber && (
                      <button 
                        className="add-comment-btn"
                        onClick={() => handleAddCommentClick(line.lineNumber)}
                        title="Add comment to this line"
                      >
                        💬
                      </button>
                    )}
                  </td>
                </tr>

                {/* Inline Comment Input */}
                {commentLine === line.lineNumber && (
                  <tr className="comment-input-row">
                    <td colSpan="4">
                      <div className="inline-comment-form">
                        <textarea
                          placeholder="Add a comment for this line..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          autoFocus
                          rows={3}
                        />
                        <div className="comment-form-actions">
                          <button 
                            className="btn-primary" 
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim()}
                          >
                            Add Comment
                          </button>
                          <button 
                            className="btn-secondary" 
                            onClick={handleCancelComment}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {lines.length === 0 && (
          <div className="empty-state">
            <p>No code changes to display</p>
          </div>
        )}
      </div>

      {/* Files Changed Summary */}
      {filesChanged && filesChanged.length > 0 && (
        <div className="files-summary">
          <h4>📁 Files Changed ({filesChanged.length})</h4>
          <ul>
            {filesChanged.map((file, idx) => (
              <li key={idx}>
                <span className="file-icon">📄</span>
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
