import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AgentChat from './components/AgentChat';
import SwarmSelector from './components/SwarmSelector';
import ApiKeyManager from './components/ApiKeyManager';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';
import './styles/theme-toggle.css';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <header className="app-header">
            <div className="header-content">
              <div className="logo-section">
                <h1 className="app-title">BluePads Global</h1>
                <p className="app-subtitle">Interact with +60 in-house agents across 5 specialized swarms</p>
              </div>
              <nav className="app-nav">
                <Link
                  to="/"
                  className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </Link>
                <Link
                  to="/swarms"
                  className={`nav-link ${activeTab === 'swarms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('swarms')}
                >
                  Swarms
                </Link>
                <Link
                  to="/settings"
                  className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<AgentChat />} />
              <Route path="/chat" element={<AgentChat />} />
              <Route path="/swarms" element={<SwarmSelector />} />
              <Route path="/settings" element={<ApiKeyManager />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <div className="footer-content">
              <p>SwarmAgents WebUI MVP v0.1.0</p>
              <p className="footer-tagline">
                "I am because we are" - Ubuntu Philosophy
              </p>
              <p className="footer-info">
                Powered by BluePadsGlobal's 50 humanized agents across 4 specialized swarms
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
