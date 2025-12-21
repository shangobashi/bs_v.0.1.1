import React, { useState, useEffect } from 'react';
import agentAPI from '../services/api';
import SidebarToggle from './Layout/SidebarToggle';
import '../styles/components.css';

import NovaButton from './Nova/NovaButton';
import NovaDropdown from './Nova/NovaDropdown';

function ApiKeyManager() {
  const [model, setModel] = useState('Claude Opus 4.1');
  const [provider, setProvider] = useState('claude');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [configuredProviders, setConfiguredProviders] = useState([]);

  useEffect(() => {
    checkConfiguredKeys();
  }, []);

  const checkConfiguredKeys = () => {
    const providers = ['claude', 'openai', 'gemini', 'openrouter', 'ollama'];
    const configured = providers.filter(p => localStorage.getItem(`${p}_key_configured`) === 'true');
    setConfiguredProviders(configured);
  };

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
      checkConfiguredKeys();
    } catch (error) {
      setMessageType('error');
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async (providerToRemove) => {
    if (window.confirm(`Are you sure you want to remove the API key for ${providerToRemove}?`)) {
      try {
        // We set it to empty string to "remove" it on backend
        await agentAPI.setApiKey(providerToRemove, '');
        localStorage.removeItem(`${providerToRemove}_key_configured`);
        checkConfiguredKeys();
        setMessageType('success');
        setMessage(`${providerToRemove} key removed successfully`);
      } catch (error) {
        setMessageType('error');
        setMessage(`Error removing key: ${error.message}`);
      }
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
            <label htmlFor="model">Model</label>
            <NovaDropdown
              value={model}
              onChange={(val) => {
                setModel(val);
                const v = val.toLowerCase();
                // Map model to provider
                if (v.includes('claude')) setProvider('claude');
                else if (v.includes('gpt-5') || v.includes('gpt-4')) setProvider('openai');
                else if (v.includes('gemini')) setProvider('gemini');
                else if (v.includes('gpt-oss')) setProvider('openrouter');
                else if (v.includes('moonshotai') || v.includes('kimi')) setProvider('openrouter');
                else if (v.includes('qwen') || v.includes('deepseek') || v.includes('llama')) {
                  // Heuristic: OpenRouter models usually have '/' (e.g. qwen/qwen...)
                  // Local/Ollama models usually don't (e.g. qwen2, llama3)
                  if (v.includes('/') || v.includes(':free')) {
                    setProvider('openrouter');
                  } else {
                    setProvider('ollama');
                  }
                }
              }}
              options={[
                { value: 'Claude Opus 4.5', label: 'Claude Opus 4.5' },
                { value: 'Claude Sonnet 4.5', label: 'Claude Sonnet 4.5' },
                { value: 'GPT-5-High', label: 'GPT-5-High' },
                { value: 'GPT-5-Low', label: 'GPT-5-Low' },
                { value: 'Gemini 3', label: 'Gemini 3' },
                { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (Free)' },
                { value: 'qwen/qwen-2.5-coder-32b-instruct:free', label: 'Qwen 2.5 Coder 32B (Free)' },
                { value: 'moonshotai/kimi-k2-0711:free', label: 'Kimi K2 (Free)' },
                { value: 'qwen2', label: 'Qwen 2 (Local)' },
                { value: 'deepseek-coder-v2', label: 'Deepseek Coder V2 (Local)' },
                { value: 'llama3', label: 'Llama 3 (Local)' }
              ]}
              style={{ height: '42px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key / Base URL</label>
            <div className="key-input-wrapper">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key or Ollama Base URL"
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
            {loading ? 'Configuring...' : 'Configure'}
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
            <li>
              <strong>OpenRouter (for Llama 3.3, Qwen 2.5, Kimi):</strong> Get your key from{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="nova-link">
                openrouter.ai
              </a>
            </li>
            <li>
              <strong>Local Models (Ollama):</strong> No key required. Enter your Ollama Base URL (default: <code>http://localhost:11434</code>) in the API Key field.
            </li>
          </ul>
        </div>

        {configuredProviders.length > 0 && (
          <div className="stored-keys-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
            <h3 style={{ color: '#FFF', marginBottom: '1rem' }}>Stored API Keys</h3>
            <div className="stored-keys-list">
              {configuredProviders.map((prov) => (
                <div key={prov} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.2)',
                  marginBottom: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {prov === 'openrouter' ? 'OpenRouter (Free Models)' : prov === 'ollama' ? 'Ollama (Local)' : prov}
                  </span>
                  <NovaButton
                    variant="secondary"
                    onClick={() => handleRemoveKey(prov)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                  >
                    Remove
                  </NovaButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiKeyManager;
