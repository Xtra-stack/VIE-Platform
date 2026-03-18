import React, { useMemo } from 'react';
import '../styles/CodeDiff.css';

// Simple diff algorithm to highlight changed lines
function diffLines(oldCode, newCode) {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const changes = [];

  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] ?? '';
    const newLine = newLines[i] ?? '';
    
    if (oldLine === newLine) {
      changes.push({ type: 'unchanged', oldLine, newLine, lineNum: i + 1 });
    } else {
      changes.push({ type: 'changed', oldLine, newLine, lineNum: i + 1 });
    }
  }

  return changes;
}

function LineNumber({ num }) {
  return <span className="line-number">{num > 0 ? num : ''}</span>;
}

export default function CodeDiff({ oldCode, newCode, title = 'Code Changes' }) {
  const changes = useMemo(() => diffLines(oldCode, newCode), [oldCode, newCode]);

  return (
    <div className="code-diff-container">
      <div className="diff-header">{title}</div>
      <div className="diff-columns">
        <div className="diff-column diff-old">
          <div className="column-title">Previous Code</div>
          <pre className="diff-content">
            {changes.map((change, idx) => (
              <div
                key={idx}
                className={`diff-line ${change.type === 'changed' ? 'removed' : 'unchanged'}`}
              >
                <LineNumber num={change.oldLine ? change.lineNum : 0} />
                <code>{change.oldLine}</code>
              </div>
            ))}
          </pre>
        </div>
        <div className="diff-column diff-new">
          <div className="column-title">New Code</div>
          <pre className="diff-content">
            {changes.map((change, idx) => (
              <div
                key={idx}
                className={`diff-line ${change.type === 'changed' ? 'added' : 'unchanged'}`}
              >
                <LineNumber num={change.newLine ? change.lineNum : 0} />
                <code>{change.newLine}</code>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
