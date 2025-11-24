import React, { useState } from 'react';
import agentAPI from '../services/api';
import SidebarToggle from './Layout/SidebarToggle';
import '../styles/components.css';

import NovaButton from './Nova/NovaButton';
import NovaSelect from './Nova/NovaSelect';

function ApiKeyManager() {
  const [provider, setProvider] = useState('claude');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessageType('error');
      setMessage('Please enter an API key');
      return;
    }

    setLoading(true);
    try {
      await agentAPI.setApiKey(provider, apiKey);
      setMessageType('success');
      setMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key configured successfully`);
      setApiKey('');
      localStorage.setItem(`${provider}_key_configured`, 'true');
    } catch (error) {
      setMessageType('error');
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  return (
    <div className="nova-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
        <SidebarToggle />
        <div className="manager-header" style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#FFF' }}>API Key Configuration</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Configure your API keys for Claude, OpenAI, or Google Gemini</p>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>

      <div className="api-key-manager" style={{ margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="key-form">
          <div className="form-group">
            <label htmlFor="provider">Provider</label>
            <NovaSelect
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={loading}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <option value="claude">Claude 4.5 Sonnet (Anthropic)</option>
              <option value="openai">GPT-5.1 (OpenAI)</option>
              <option value="gemini">Gemini 3 Pro (Google)</option>
            </NovaSelect>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <div className="key-input-wrapper">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                disabled={loading}
                className="key-input"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="toggle-button"
                disabled={loading}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <small className="form-help">
              Your API key is stored locally and never sent to our servers.
            </small>
          </div>

          {message && (
            <div className={`message message-${messageType}`}>
              <span>{message}</span>
              <button
                type="button"
                className="close-button"
                onClick={clearMessage}
              >
                x
              </button>
            </div>
          )}

          <NovaButton
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
          >
            {loading ? 'Configuring...' : 'Configure API Key'}
          </NovaButton>
        </form>

        <div className="provider-info">
          <h3>Getting API Keys</h3>
          <ul>
            <li>
              <strong>Claude:</strong> Get your key from{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="nova-link">
                console.anthropic.com
              </a>
            </li>
            <li>
              <strong>OpenAI:</strong> Get your key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="nova-link">
                platform.openai.com
              </a>
            </li>
            <li>
              <strong>Google Gemini:</strong> Get your key from{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="nova-link">
                Google AI Studio
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyManager;
