import React, { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditorPanel from './CodeEditorPanel';
import SimulatedTerminal from './SimulatedTerminal';
import { createSubmission, executeTerminalCommand } from '../../services/api';
import '../../styles/CodeEnvironment.css';

export default function CodeEnvironmentWrapper() {
  const [files, setFiles] = useState({
    'src': {
      'index.js': { filename: 'index.js', content: '// Your code here\nconsole.log("Hello World");' },
      'utils.js': { filename: 'utils.js', content: '// Utility functions\nexport const sum = (a, b) => a + b;' }
    },
    'package.json': { 
      filename: 'package.json', 
      content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {}\n}' 
    }
  });

  const [currentFile, setCurrentFile] = useState('src/index.js');
  const [content, setContent] = useState(files['src']['index.js'].content);
  const [language, setLanguage] = useState('javascript');
  const [terminalVisible, setTerminalVisible] = useState(true);

  // Get current file content
  const getCurrentFileObject = () => {
    const parts = currentFile.split('/');
    let obj = files;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    return obj[parts[parts.length - 1]];
  };

  const handleFileSelect = (filename) => {
    setCurrentFile(filename);
    const parts = filename.split('/');
    let obj = files;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    const file = obj[parts[parts.length - 1]];
    setContent(file?.content || '');

    // Set language based on extension
    const ext = filename.split('.').pop();
    const langMap = {
      js: 'javascript',
      jsx: 'jsx',
      py: 'python',
      java: 'java',
      css: 'css',
      html: 'html',
      json: 'json'
    };
    setLanguage(langMap[ext] || 'javascript');
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    // Save to state
    const parts = currentFile.split('/');
    let obj = files;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]].content = newContent;
    setFiles({ ...files });
  };

  // Persist workspace to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('codeEnvFiles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setFiles(parsed);
          // try to restore current file content
          if (!parsed[currentFile]) {
            const firstKey = Object.keys(parsed)[0];
            if (firstKey) setCurrentFile(firstKey);
          } else {
            const obj = parsed;
            const parts = currentFile.split('/');
            let o = obj;
            for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]] || {};
            setContent(o[parts[parts.length - 1]]?.content || '');
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('codeEnvFiles', JSON.stringify(files));
    } catch (_e) {}
  }, [files]);

  const handleFileCreate = (name) => {
    const newFiles = { ...files };
    newFiles[name] = { filename: name, content: '' };
    setFiles(newFiles);
  };

  const handleFileDelete = (name) => {
    const newFiles = { ...files };
    delete newFiles[name];
    setFiles(newFiles);
    if (currentFile === name) {
      setCurrentFile('src/index.js');
      setContent(files['src']?.['index.js']?.content || '');
    }
  };

  const handleCodeSubmit = () => {
    // Create a lightweight submission using workspace contents
    const title = `Workspace submission - ${currentFile}`;
    const description = `Submitted from in-browser workspace: ${currentFile}`;
    const codeSnippet = content.slice(0, 1000);
    const filesChanged = [{ filename: currentFile, content }];

    createSubmission(null, 'workspace', 'main', title, description, codeSnippet, filesChanged, null)
      .then((res) => {
        console.log('Submission result:', res?.data || res);
        alert('Submission created successfully');
      })
      .catch((err) => {
        console.warn('Submission failed', err);
        alert('Submission failed; see console');
      });
  };

  const handleRun = async (command) => {
    try {
      const result = await executeTerminalCommand(command, 'workspace-session');
      // Return an object with output to match SimulatedTerminal expectations
      return { output: result?.output || (typeof result === 'string' ? result : '> OK') };
    } catch (err) {
      console.warn('Execute terminal command failed', err);
      return { output: '> Remote terminal unavailable' };
    }
  };

  return (
    <div className="code-environment-container">
      {/* File Explorer */}
      <FileExplorer
        files={files}
        currentFile={currentFile}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileDelete={handleFileDelete}
      />

      {/* Main Editor Area */}
      <div className="code-environment-main">
        {/* Code Editor */}
        <CodeEditorPanel
          currentFile={currentFile}
          content={content}
          onChange={handleContentChange}
          language={language}
        />

        {/* Terminal */}
        {terminalVisible && (
          <SimulatedTerminal
            sessionId="workspace-session"
            onExecuteCommand={handleRun}
            onLoadHistory={async () => []}
          />
        )}
      </div>
    </div>
  );
}
