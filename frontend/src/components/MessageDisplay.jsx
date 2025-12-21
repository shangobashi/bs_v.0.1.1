import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/components.css';

import { sanitizeErrorMessage } from '../utils/errorUtils';

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

        {message.thoughts && (
          <div className="agent-thoughts-container">
            <details open={message.streaming}>
              <summary>Thinking Process</summary>
              <div className="agent-thoughts-content">
                <ReactMarkdown>{message.thoughts}</ReactMarkdown>
              </div>
            </details>
          </div>
        )}

        <div className="message-content">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
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
        <div className="message-content">{sanitizeErrorMessage(message.content)}</div>
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
