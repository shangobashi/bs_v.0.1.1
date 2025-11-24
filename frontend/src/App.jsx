import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgentChat from './components/AgentChat';
import SwarmSelector from './components/SwarmSelector';
import ApiKeyManager from './components/ApiKeyManager';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import MainLayout from './components/Layout/MainLayout';
// import './styles/theme.css'; // Legacy
// import './styles/theme-toggle.css'; // Legacy
// import './styles/App.css'; // Legacy

import Home from './components/Home';

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<AgentChat />} />
              <Route path="/swarms" element={<SwarmSelector />} />
              <Route path="/settings" element={<ApiKeyManager />} />
            </Routes>
          </MainLayout>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
