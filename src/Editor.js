// src/Editor.js
import React, { useState, useEffect } from "react";
import {
  FaJsSquare,
  FaHtml5,
  FaCss3Alt,
  FaPython,
  FaFile,
  FaCog,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";
import "./Editor.css";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserHtml from "prettier/parser-html";
import parserCss from "prettier/parser-postcss";

const CodingEditor = () => {
  const [files, setFiles] = useState([
    {
      name: "file1.js",
      code: "// JavaScript code here...",
      language: "javascript",
    },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "vs-dark"
  );
  const [fontSize, setFontSize] = useState(
    parseInt(localStorage.getItem("fontSize")) || 14
  );
  const [fontFamily, setFontFamily] = useState(
    localStorage.getItem("fontFamily") || "Monaco"
  );
  const [showLineNumbers, setShowLineNumbers] = useState(
    localStorage.getItem("showLineNumbers") === "true"
  );
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("autoSave") === "true"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [snippets, setSnippets] = useState([]);
  const [newSnippet, setNewSnippet] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // State for settings panel
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]); // For version control

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem("files"));
    if (storedFiles) {
      setFiles(storedFiles);
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
    const savedFontSize = parseInt(localStorage.getItem("fontSize"));
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
    const savedFontFamily = localStorage.getItem("fontFamily");
    if (savedFontFamily) {
      setFontFamily(savedFontFamily);
    }
    const savedShowLineNumbers =
      localStorage.getItem("showLineNumbers") === "true";
    if (savedShowLineNumbers !== undefined) {
      setShowLineNumbers(savedShowLineNumbers);
    }
    const savedAutoSave = localStorage.getItem("autoSave") === "true";
    if (savedAutoSave !== undefined) {
      setAutoSave(savedAutoSave);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("fontFamily", fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem("showLineNumbers", showLineNumbers);
  }, [showLineNumbers]);

  useEffect(() => {
    localStorage.setItem("autoSave", autoSave);
  }, [autoSave]);

  const activeFile = files[activeFileIndex];

  const handleTabClick = (index) => setActiveFileIndex(index);

  const handleEditorChange = (value) => {
    const newFiles = [...files];
    newFiles[activeFileIndex].code = value;
    setFiles(newFiles);
    setUndoStack([...undoStack, newFiles[activeFileIndex].code]); // Save to undo stack
    setRedoStack([]); // Clear redo stack on new change
    if (autoSave) {
      saveFile(); // Auto-save feature
    }
  };

  const createNewFile = () => {
    const newFileName = prompt("Enter new file name (e.g., file2.js):");
    if (newFileName) {
      setFiles([
        ...files,
        { name: newFileName, code: "", language: getFileLanguage(newFileName) },
      ]);
      setActiveFileIndex(files.length);
    }
  };

  const deleteFile = (index) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      if (activeFileIndex === index) {
        setActiveFileIndex(0); // Switch to the first file if the active one is deleted
      }
    }
  };

  const renameFile = (index) => {
    const newFileName = prompt("Enter new file name:", files[index].name);
    if (newFileName) {
      const newFiles = [...files];
      newFiles[index].name = newFileName;
      setFiles(newFiles);
    }
  };

  const getFileLanguage = (fileName) => {
    const extension = fileName.split(".").pop();
    switch (extension) {
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "html":
        return "html";
      case "py":
        return "python";
      default:
        return "plaintext";
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop();
    switch (extension) {
      case "js":
        return <FaJsSquare />;
      case "css":
        return <FaCss3Alt />;
      case "html":
        return <FaHtml5 />;
      case "py":
        return <FaPython />;
      default:
        return <FaFile />;
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addSnippet = () => {
    if (snippetName && newSnippet) {
      setSnippets([...snippets, { name: snippetName, code: newSnippet }]);
      setSnippetName("");
      setNewSnippet("");
    }
  };

  const insertSnippet = (code) => {
    const newFiles = [...files];
    newFiles[activeFileIndex].code += code;
    setFiles(newFiles);
  };

  const formatCode = () => {
    const formattedCode = prettier.format(activeFile.code, {
      parser: activeFile.language === "html" ? "html" : activeFile.language,
      plugins: [parserBabel, parserHtml, parserCss],
    });
    handleEditorChange(formattedCode);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const undoChange = () => {
    if (undoStack.length > 0) {
      const previousCode = undoStack.pop();
      setRedoStack([...redoStack, activeFile.code]); // Save current code to redo stack
      const newFiles = [...files];
      newFiles[activeFileIndex].code = previousCode;
      setFiles(newFiles);
    }
  };

  const redoChange = () => {
    if (redoStack.length > 0) {
      const nextCode = redoStack.pop();
      setUndoStack([...undoStack, activeFile.code]); // Save current code to undo stack
      const newFiles = [...files];
      newFiles[activeFileIndex].code = nextCode;
      setFiles(newFiles);
    }
  };

  const loadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFiles([
          ...files,
          {
            name: file.name,
            code: content,
            language: getFileLanguage(file.name),
          },
        ]);
        setActiveFileIndex(files.length);
      };
      reader.readAsText(file);
    }
  };

  const saveFile = () => {
    const fileToSave = activeFile;
    const blob = new Blob([fileToSave.code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileToSave.name;
    link.click();
  };

  // Version Control Functionality
  const saveVersion = () => {
    setVersionHistory([
      ...versionHistory,
      { name: activeFile.name, code: activeFile.code },
    ]);
    alert("Version saved!");
  };

  const restoreVersion = (version) => {
    const newFiles = [...files];
    const index = newFiles.findIndex((file) => file.name === version.name);
    if (index !== -1) {
      newFiles[index].code = version.code;
      setFiles(newFiles);
      alert(`Restored ${version.name} to version.`);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value));
  };

  const handleFontFamilyChange = (e) => {
    setFontFamily(e.target.value);
  };

  const handleShowLineNumbersChange = (e) => {
    setShowLineNumbers(e.target.checked);
  };

  const handleAutoSaveChange = (e) => {
    setAutoSave(e.target.checked);
  };

  return (
    <div className="editor-container" tabIndex="0">
      <div className="editor-options">
        <input
          type="text"
          className="search-bar"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="preview-toggle" onClick={togglePreview}>
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
        <button className="create-button" onClick={createNewFile}>
          New File
        </button>
        <input
          type="file"
          onChange={loadFile}
          style={{ display: "none" }}
          id="file-input"
        />
        <label htmlFor="file-input" className="create-button">
          Upload File
        </label>
        <button className="create-button" onClick={saveFile}>
          Save File
        </button>
        <button className="create-button" onClick={saveVersion}>
          Save Version
        </button>
        <button className="preview-toggle" onClick={toggleSettings}>
          <FaCog /> Settings
        </button>
        <button className="create-button" onClick={undoChange}>
          Undo
        </button>
        <button className="create-button" onClick={redoChange}>
          Redo
        </button>
        <button className="create-button" onClick={formatCode}>
          Format Code
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h3>Settings</h3>
          <div>
            <label>Theme:</label>
            <select value={theme} onChange={handleThemeChange}>
              <option value="vs-dark">Dark</option>
              <option value="vs">Light</option>
              <option value="hc-black">High Contrast</option>
            </select>
          </div>
          <div>
            <label>Font Size:</label>
            <input
              type="number"
              value={fontSize}
              onChange={handleFontSizeChange}
              min="10"
              max="30"
            />
          </div>
          <div>
            <label>Font Family:</label>
            <select value={fontFamily} onChange={handleFontFamilyChange}>
              <option value="Monaco">Monaco</option>
              <option value="Courier New">Courier New</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={handleShowLineNumbersChange}
              />
              Show Line Numbers
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={handleAutoSaveChange}
              />
              Enable Auto Save
            </label>
          </div>
          <button className="close-settings" onClick={toggleSettings}>
            Close
          </button>
        </div>
      )}

      <div className="tabs">
        {filteredFiles.map((file, index) => (
          <div
            key={index}
            className={`tab ${index === activeFileIndex ? "active" : ""}`}
            onClick={() => handleTabClick(index)}
          >
            {getFileIcon(file.name)} {file.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(index);
              }}
              className="delete-button"
            >
              X
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                renameFile(index);
              }}
              className="rename-button"
            >
              Rename
            </button>
          </div>
        ))}
      </div>

      <Editor
        height="60vh"
        language={activeFile.language}
        value={activeFile.code}
        onChange={handleEditorChange}
        theme={theme}
        options={{
          fontSize: fontSize,
          fontFamily: fontFamily,
          lineNumbers: showLineNumbers ? "on" : "off",
          automaticLayout: true,
          minimap: { enabled: false },
          suggestOnTriggerCharacters: true, // Enable IntelliSense
        }}
      />

      {showPreview && (
        <div className="editor-preview-container">
          <h3>Live Preview</h3>
          <iframe
            srcDoc={activeFile.language === "html" ? activeFile.code : ""}
            title="preview"
            sandbox="allow-scripts"
          />
        </div>
      )}

      <div className="snippet-management">
        <input
          type="text"
          className="snippet-name-input"
          placeholder="Snippet Name"
          value={snippetName}
          onChange={(e) => setSnippetName(e.target.value)}
        />
        <textarea
          rows="3"
          className="snippet-textarea"
          placeholder="Snippet Code"
          value={newSnippet}
          onChange={(e) => setNewSnippet(e.target.value)}
        />
        <button onClick={addSnippet} className="create-button">
          Add Snippet
        </button>
        <div className="snippets">
          {snippets.map((snippet, index) => (
            <div key={index} className="snippet">
              <span>{snippet.name}</span>
              <button
                onClick={() => insertSnippet(snippet.code)}
                className="create-button"
              >
                Insert
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="version-control">
        <h4>Version History</h4>
        {versionHistory.map((version, index) => (
          <div key={index} className="version">
            <span>{version.name}</span>
            <button
              onClick={() => restoreVersion(version)}
              className="restore-button"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodingEditor;
