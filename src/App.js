import React, { useState } from 'react';
import { loadConfig, saveConfig, loadDetectedHeaders } from './config/configManager';
import RunAudit from './pages/RunAudit';
import ModuleManager from './pages/ModuleManager';
import Settings from './pages/Settings';
import History from './pages/History';
import './App.css';

const NAV_ITEMS = [
  { id: 'run', label: '▶ Run Audit' },
  { id: 'modules', label: '⚙ Modules' },
  { id: 'settings', label: '☰ Settings' },
  { id: 'history', label: '◷ History' }
];

export default function App() {
  const [activePage, setActivePage] = useState('run');
  const [config, setConfig] = useState(() => loadConfig());
  const [detectedHeaders, setDetectedHeaders] = useState(() => loadDetectedHeaders());

  function handleConfigUpdate(newConfig) {
    saveConfig(newConfig);
    setConfig(newConfig);
  }

  function renderPage() {
    switch (activePage) {
      case 'run':
        return <RunAudit config={config} onConfigUpdate={handleConfigUpdate} onHeadersDetected={setDetectedHeaders} />;
      case 'modules':
        return <ModuleManager config={config} onConfigUpdate={handleConfigUpdate} detectedHeaders={detectedHeaders} />;
      case 'settings':
        return <Settings config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'history':
        return <History config={config} />;
      default:
        return <RunAudit config={config} onConfigUpdate={handleConfigUpdate} onHeadersDetected={setDetectedHeaders} />;
    }
  }

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Audit Tool</h1>
          <p>Asset Inventory Manager</p>
        </div>
        <ul className="nav-list">
          {NAV_ITEMS.map(item => (
            <li
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <p>v1.0.0</p>
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}