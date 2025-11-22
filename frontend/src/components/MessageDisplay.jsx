import React from 'react';
import '../styles/components.css';

// Function to format response text into readable paragraphs
const formatResponseText = (text) => {
  if (!text) return text;

  // Split by double newlines to create paragraph breaks
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  return paragraphs.map((paragraph, idx) => (
    <p key={idx} className="response-paragraph">
      {paragraph.split('\n').map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {line}
          {lineIdx < paragraph.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </p>
  ));
};

function MessageDisplay({ message }) {
  if (message.type === 'user') {
    return (
      <div className="message message-user">
        <div className="message-content">{message.content}</div>
      </div>
    );
  }

  if (message.type === 'agent') {
    return (
      <div className="message message-agent">
        <div className="message-header">
          <span className="agent-label">
            {message.agentName ? `${message.agentName} says:` : (message.provider ? `${message.provider.toUpperCase()} Response` : 'Agent Response')}
          </span>
          {message.streaming && <span className="streaming-indicator">Streaming...</span>}
        </div>
        <div className="message-content">{formatResponseText(message.content)}</div>
        {(message.tokens || message.time) && (
          <div className="message-footer">
            {message.tokens && <span>Tokens: {message.tokens}</span>}
            {message.time && <span>Time: {(message.time / 1000).toFixed(2)}s</span>}
          </div>
        )}
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <div className="message message-error">
        <div className="message-content">Error: {message.content}</div>
      </div>
    );
  }

  return (
    <div className="message message-info">
      <div className="message-content">{message.content}</div>
    </div>
  );
}

export default MessageDisplay;
