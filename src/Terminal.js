// src/Terminal.js
import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import "./Terminal.css"; // Optional for custom styling

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const xterm = useRef(null);

  useEffect(() => {
    xterm.current = new Terminal();
    xterm.current.open(terminalRef.current);
    xterm.current.writeln(
      'Welcome to the terminal! Type "help" for a list of commands.'
    );

    xterm.current.prompt = () => {
      xterm.current.write("\r\n$ ");
    };

    xterm.current.onData((data) => {
      if (data === "\u0003") {
        xterm.current.write("^C");
        return;
      }
      if (data.charCodeAt(0) === 13) {
        // Enter key
        const command = xterm.current.getInput();
        xterm.current.write("\r\n");
        executeCommand(command);
        xterm.current.prompt();
      } else {
        xterm.current.write(data);
      }
    });

    xterm.current.prompt();

    return () => {
      xterm.current.dispose();
    };
  }, []);

  const executeCommand = (command) => {
    switch (command) {
      case "help":
        xterm.current.writeln(
          "Available commands: help, clear, ls, echo <text>"
        );
        break;
      case "clear":
        xterm.current.clear();
        break;
      case "ls":
        xterm.current.writeln("file1.js");
        xterm.current.writeln("file2.css");
        xterm.current.writeln("index.html");
        break;
      default:
        if (command.startsWith("echo ")) {
          xterm.current.writeln(command.slice(5));
        } else {
          xterm.current.writeln(`Command not found: ${command}`);
        }
    }
  };

  return <div ref={terminalRef} className="terminal" />;
};

export default TerminalComponent;
