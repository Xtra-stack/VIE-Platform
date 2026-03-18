import React from 'react';
import '../styles/TerminalOutput.css';

export default function TerminalOutput({ logs, title = 'Build Output' }) {
  if (!logs) return null;

  // Parse log content - treat it as raw text but split by lines
  const logLines = typeof logs === 'string' 
    ? logs.split('\n').filter(line => line.trim())
    : logs;

  // Categorize log lines
  const categorizeLog = (line) => {
    if (line.includes('error') || line.includes('ERROR') || line.includes('failed')) {
      return 'error';
    }
    if (line.includes('warning') || line.includes('WARNING') || line.includes('⚠️')) {
      return 'warning';
    }
    if (line.includes('success') || line.includes('SUCCESS') || line.includes('✓') || line.includes('✅')) {
      return 'success';
    }
    if (line.includes('info') || line.includes('INFO') || line.includes('ℹ️')) {
      return 'info';
    }
    return 'normal';
  };

  return (
    <div className="terminal-output-container">
      <div className="terminal-header">
        <span className="terminal-icon">▶ </span>
        <span>{title}</span>
      </div>
      <div className="terminal-lines">
        {logLines.map((line, idx) => {
          const category = categorizeLog(line);
          return (
            <div key={idx} className="terminal-line">
              <span className="terminal-prompt">$</span>
              <span className={`terminal-text ${category}`}>{line}</span>
            </div>
          );
        })}
        {logLines.length === 0 && (
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <span className="terminal-text info">No output available</span>
          </div>
        )}
      </div>
      <div className="terminal-footer">
        <span className="terminal-time">{new Date().toLocaleTimeString()}</span>
        <span>{logLines.length} lines</span>
      </div>
    </div>
  );
}
