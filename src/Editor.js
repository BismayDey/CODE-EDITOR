// src/Editor.js
import React, { useState, useEffect } from "react";
import {
  FaJsSquare,
  FaHtml5,
  FaCss3Alt,
  FaPython,
  FaFile,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";
import "./Editor.css";

const CodingEditor = () => {
  const [files, setFiles] = useState([
    {
      name: "file1.js",
      code: "// JavaScript code here...",
      language: "javascript",
    },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [theme, setTheme] = useState("vs-dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [snippets, setSnippets] = useState([]);
  const [newSnippet, setNewSnippet] = useState("");
  const [snippetName, setSnippetName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [fileTree, setFileTree] = useState([]);

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem("files"));
    if (storedFiles) {
      setFiles(storedFiles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("files", JSON.stringify(files));
  }, [files]);

  const activeFile = files[activeFileIndex];

  const handleTabClick = (index) => setActiveFileIndex(index);

  const handleEditorChange = (value) => {
    const newFiles = [...files];
    newFiles[activeFileIndex].code = value;
    setFiles(newFiles);
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
    // Implement your formatting logic here (e.g., using Prettier)
    const formattedCode = activeFile.code; // Placeholder for actual formatting logic
    handleEditorChange(formattedCode);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const saveFile = () => {
    const blob = new Blob([activeFile.code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = activeFile.name;
    link.click();
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

  return (
    <div className={`editor-container ${theme}`}>
      <div className="editor-options">
        <input
          type="text"
          className="search-bar"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="create-button" onClick={createNewFile}>
          Create File
        </button>
        <input
          type="file"
          accept=".html,.css,.js,.py"
          onChange={loadFile}
          style={{ display: "none" }}
          id="fileUpload"
        />
        <label htmlFor="fileUpload" className="save-button">
          Load File
        </label>
        <button className="save-button" onClick={saveFile}>
          Save File
        </button>
        <button className="preview-toggle" onClick={togglePreview}>
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className="tabs">
        {filteredFiles.map((file, index) => (
          <div key={index} className="tab-container">
            <div
              className={`tab ${activeFileIndex === index ? "active" : ""}`}
              onClick={() => handleTabClick(index)}
            >
              {getFileIcon(file.name)} {file.name}
              <button
                className="rename-button"
                onClick={() => renameFile(index)}
              >
                Rename
              </button>
              <button
                className="delete-button"
                onClick={() => deleteFile(index)}
              >
                Delete
              </button>
            </div>
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
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />

      {showPreview && activeFile.language === "html" && (
        <div className="editor-preview-container">
          <h3>Live Preview</h3>
          <iframe
            srcDoc={activeFile.code}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      <div className="snippet-management">
        <h3>Code Snippets</h3>
        <input
          type="text"
          placeholder="Snippet Name"
          value={snippetName}
          onChange={(e) => setSnippetName(e.target.value)}
        />
        <textarea
          rows="3"
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
    </div>
  );
};

export default CodingEditor;
