import React, { useState } from 'react';
import { loadConfig, saveConfig, loadDetectedHeaders, saveDetectedHeaders } from './config/configManager';
import DataSources from './pages/DataSources';
import ModuleManager from './pages/ModuleManager';
import Settings from './pages/Settings';
import PreviewRun from './pages/PreviewRun';
import History from './pages/History';
import './App.css';

const NAV_ITEMS = [
  { id: 'sources', label: '📂 Data Sources' },
  { id: 'modules', label: '📦 Module Manager' },
  { id: 'settings', label: '⚙ Settings' },
  { id: 'run', label: '▶ Preview & Run' },
  { id: 'history', label: '◷ History' }
];

export default function App() {
  const [activePage, setActivePage] = useState('sources');
  const [config, setConfig] = useState(() => loadConfig());
  const [detectedHeaders, setDetectedHeaders] = useState(() => loadDetectedHeaders());

  // dataSources holds the actual uploaded file data — session only
  // Structure: { sourceName: { name, headers, rows } }
  const [dataSources, setDataSources] = useState({});

  function handleConfigUpdate(newConfig) {
    saveConfig(newConfig);
    setConfig(newConfig);
  }

  function handleHeadersUpdate(newHeaders) {
    saveDetectedHeaders(newHeaders);
    setDetectedHeaders(newHeaders);
  }

  function handleDataSourcesUpdate(newSources) {
    setDataSources(newSources);
    // Save just the names to localStorage for persistence
    const names = Object.keys(newSources).reduce((acc, key) => {
      acc[key] = { name: newSources[key].name };
      return acc;
    }, {});
    handleHeadersUpdate(
      Object.keys(newSources).reduce((acc, key) => {
        acc[key] = newSources[key].headers;
        return acc;
      }, {})
    );
  }

  function renderPage() {
    switch (activePage) {
      case 'sources':
        return (
          <DataSources
            dataSources={dataSources}
            onDataSourcesUpdate={handleDataSourcesUpdate}
          />
        );
      case 'modules':
        return (
          <ModuleManager
            config={config}
            onConfigUpdate={handleConfigUpdate}
            detectedHeaders={detectedHeaders}
          />
        );
      case 'settings':
        return (
          <Settings
            config={config}
            onConfigUpdate={handleConfigUpdate}
          />
        );
      case 'run':
        return (
          <PreviewRun
            config={config}
            onConfigUpdate={handleConfigUpdate}
            dataSources={dataSources}
          />
        );
      case 'history':
        return <History config={config} />;
      default:
        return (
          <DataSources
            dataSources={dataSources}
            onDataSourcesUpdate={handleDataSourcesUpdate}
          />
        );
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
          <p>v2.0.0</p>
          {Object.keys(dataSources).length > 0 && (
            <p style={{ color: '#34d399', fontSize: '10px', marginTop: '4px' }}>
              ● {Object.keys(dataSources).length} source{Object.keys(dataSources).length !== 1 ? 's' : ''} loaded
            </p>
          )}
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}