import React, { useState, useRef, useEffect } from 'react';
import '../../styles/CodeEnvironment.css';

export default function SimulatedTerminal({
  sessionId = 'default',
  onExecuteCommand,
  onLoadHistory,
}) {
  const [history, setHistory] = useState([
    { type: 'output', text: '> Terminal ready' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      if (typeof onLoadHistory !== 'function') {
        return;
      }

      try {
        const entries = await onLoadHistory(sessionId);
        if (cancelled || !Array.isArray(entries) || entries.length === 0) {
          return;
        }

        const lines = [{ type: 'output', text: '> Terminal history loaded' }];
        entries.forEach((entry) => {
          if (entry?.command) {
            lines.push({ type: 'command', text: `$ ${entry.command}` });
          }
          if (entry?.output) {
            lines.push({ type: 'output', text: entry.output });
          }
        });

        setHistory(lines);
      } catch (_error) {
        if (!cancelled) {
          setHistory((prev) => ([
            ...prev,
            { type: 'output', text: '> Failed to load terminal history' },
          ]));
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [onLoadHistory, sessionId]);

  const simulateCommand = (cmd) => {
    const responses = {
      'npm install': `> npm notice created a lockfile as package-lock.json
> added 156 packages in 2.3s
> up to date in 2.4s`,
      'npm start': `> React App started on ${import.meta.env.VITE_API_URL || 'https://your-frontend-domain.vercel.app'}
> Successfully compiled!
    > Great! Now open your deployed URL to see your app.`,
      'npm run build': `> react-scripts build
> Creating an optimized production build...
> Compiled successfully!
> The build folder is ready to be deployed.
> Build size: 234KB`,
      'git commit -m': (m) =>
        `[main abc1234] ${m}
> 1 file changed, 12 insertions(+), 3 deletions(-)`,
      'git push': `> Enumerating objects: 5, done.
> Counting objects: 100% (5/5), done.
> Delta compression using up to 12 threads
> Writing objects: 100% (3/3), 245 bytes | 245.00 KiB/s
> To github.com:user/repo.git
>    9fde3c9..a1b2c3d  main -> main`,
      'clear': 'CLEAR_SCREEN',
      'help': `Available Commands:
  npm install    - Install dependencies
  npm start      - Start development server
  npm run build  - Build for production
  git commit     - Commit changes (use: git commit -m "message")
  git push       - Push to repository
  clear          - Clear terminal
  help           - Show this message`,
      'ls': `src/
  components/
  pages/
  styles/
public/
package.json
package-lock.json
README.md`,
      'pwd': `/home/user/project`
    };

    // Check for git commit with message
    if (cmd.startsWith('git commit -m ')) {
      return responses['git commit -m'](cmd.slice(14).trim());
    }

    return responses[cmd] || `Command not recognized: "${cmd}"`;
  };

  const handleCommand = async () => {
    if (!input.trim()) return;

    const cmd = input.trim();

    // Add command to history
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setHistory([{ type: 'output', text: '> Terminal cleared' }]);
      setInput('');
      return;
    }

    setHistory((prev) => ([
      ...prev,
      { type: 'command', text: `$ ${cmd}` },
    ]));

    setIsExecuting(true);

    try {
      let output;
      if (typeof onExecuteCommand === 'function') {
        const result = await onExecuteCommand(cmd, sessionId);
        output = result?.output || '> Command executed';
      } else {
        output = simulateCommand(cmd);
      }

      setHistory((prev) => ([
        ...prev,
        { type: 'output', text: output },
      ]));
    } catch (_error) {
      const fallbackOutput = simulateCommand(cmd);
      setHistory((prev) => ([
        ...prev,
        { type: 'output', text: '> Remote terminal unavailable, using local simulation' },
        { type: 'output', text: fallbackOutput },
      ]));
    } finally {
      setIsExecuting(false);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="simulated-terminal">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <span className="terminal-status">{isExecuting ? 'Running...' : 'Ready'}</span>
      </div>

      <div className="terminal-output">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`terminal-line ${
              line.type === 'command' ? 'command' : 'output'
            }`}
          >
            {line.text.split('\n').map((t, i) => (
              <div key={i}>{t}</div>
            ))}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <div className="terminal-input-line">
        <span className="terminal-prompt">$</span>
        <input
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command..."
          disabled={isExecuting}
          autoFocus
        />
      </div>
    </div>
  );
}
