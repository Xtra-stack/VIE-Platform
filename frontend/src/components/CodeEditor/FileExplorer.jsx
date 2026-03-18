import React, { useState } from 'react';
import '../../styles/CodeEnvironment.css';

export default function FileExplorer({ files, onFileSelect, onFileCreate, onFileDelete, currentFile }) {
  const [expanded, setExpanded] = useState(new Set(['root']));
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const toggleFolder = (name) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpanded(newExpanded);
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const organizeFilesByFolder = (fileList) => {
    const structure = {};
    fileList.forEach((file) => {
      const parts = file.filename.split('/');
      let current = structure;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = file;
    });
    return structure;
  };

  const renderFileTree = (obj, path = '') => {
    return Object.entries(obj).map(([name, value]) => {
      const isFile = value.filename;
      const fullPath = isFile ? value.filename : `${path}${name}/`;
      const isSelected = currentFile === fullPath;

      if (isFile) {
        return (
          <div
            key={fullPath}
            className={`file-explorer-item file ${isSelected ? 'active' : ''}`}
            onClick={() => onFileSelect(fullPath)}
            onContextMenu={(e) => {
              e.preventDefault();
              onFileDelete(fullPath);
            }}
          >
            <span className="file-icon">📄</span>
            <span className="file-name">{name}</span>
          </div>
        );
      } else {
        const isExp = expanded.has(fullPath);
        return (
          <div key={fullPath} className="file-explorer-folder">
            <div
              className="file-explorer-item folder"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="folder-icon">{isExp ? '📂' : '📁'}</span>
              <span className="folder-name">{name}</span>
            </div>
            {isExp && (
              <div className="folder-contents">
                {renderFileTree(value, fullPath)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  const fileStructure = organizeFilesByFolder(files);

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Files</h3>
        <button
          className="btn-icon"
          onClick={() => setIsCreating(!isCreating)}
          title="New file"
        >
          ➕
        </button>
      </div>

      {isCreating && (
        <div className="file-create-input">
          <input
            type="text"
            placeholder="filename.js"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
            autoFocus
          />
          <button onClick={handleCreateFile} className="btn-small">
            Create
          </button>
        </div>
      )}

      <div className="file-explorer-content">
        {files.length === 0 ? (
          <div className="empty-state">No files yet</div>
        ) : (
          renderFileTree(fileStructure)
        )}
      </div>
    </div>
  );
}
