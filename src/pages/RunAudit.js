import React, { useState } from 'react';
import { parseCsv, buildRosterMap, runAudit } from '../utils/auditEngine';
import { exportToExcel } from '../utils/exportExcel';
import { addToHistory, saveDetectedHeaders } from '../config/configManager';

const STYLES = {
  page: { maxWidth: '800px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  section: { marginBottom: '24px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#9ca3af', marginBottom: '8px', display: 'block' },
  dropzone: {
    border: '2px dashed #2a2d3e', borderRadius: '8px', padding: '32px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s ease',
    backgroundColor: '#1a1d27', marginBottom: '12px'
  },
  dropzoneActive: { borderColor: '#6366f1', backgroundColor: '#1e1f35' },
  fileName: { fontSize: '13px', color: '#6366f1', marginTop: '8px' },
  select: {
    width: '100%', padding: '10px 14px', backgroundColor: '#1a1d27',
    border: '1px solid #2a2d3e', borderRadius: '8px', color: '#e0e0e0',
    fontSize: '14px', cursor: 'pointer'
  },
  button: {
    padding: '12px 28px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', marginRight: '12px'
  },
  buttonDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  buttonSecondary: {
    padding: '12px 28px', backgroundColor: '#1a1d27', color: '#e0e0e0',
    border: '1px solid #2a2d3e', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer'
  },
  results: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '24px', marginTop: '24px'
  },
  resultsTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' },
  statCard: { backgroundColor: '#0f1117', borderRadius: '8px', padding: '16px', textAlign: 'center' },
  statNumber: { fontSize: '24px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '11px', color: '#6b7280' },
  error: {
    backgroundColor: '#1f1315', border: '1px solid #7f1d1d',
    borderRadius: '8px', padding: '16px', color: '#fca5a5',
    fontSize: '14px', marginTop: '16px'
  },
  success: {
    backgroundColor: '#0f1f17', border: '1px solid #064e3b',
    borderRadius: '8px', padding: '16px', color: '#6ee7b7',
    fontSize: '14px', marginTop: '16px'
  },
  modulesList: {
    fontSize: '12px', color: '#6b7280', marginTop: '12px',
    padding: '12px', backgroundColor: '#0f1117', borderRadius: '6px'
  }
};

function Dropzone({ label, file, onFile }) {
  const [active, setActive] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }

  function handleChange(e) {
    if (e.target.files[0]) onFile(e.target.files[0]);
  }

  return (
    <div style={STYLES.section}>
      <span style={STYLES.label}>{label}</span>
      <div
        style={{ ...STYLES.dropzone, ...(active ? STYLES.dropzoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setActive(true); }}
        onDragLeave={() => setActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-${label}`).click()}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Drop your CSV file here or click to browse
        </div>
        {file && <div style={STYLES.fileName}>✓ {file.name}</div>}
        <input
          id={`file-${label}`}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default function RunAudit({ config, onConfigUpdate, onHeadersDetected }) {
  const [meFile, setMeFile] = useState(null);
  const [rosterFile, setRosterFile] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const enabledAssets = Object.entries(config.assetTypes || {})
    .map(([key, asset]) => ({ key, name: asset.name }));

  const selectedAssetConfig = selectedAsset
    ? config.assetTypes[selectedAsset]
    : null;

  async function handleRun() {
     // Auto-disable all other asset types when running
    const updatedAssetTypes = {};
    Object.entries(config.assetTypes || {}).forEach(([key, asset]) => {
      updatedAssetTypes[key] = { ...asset, enabled: key === selectedAsset };
    });
    onConfigUpdate({ ...config, assetTypes: updatedAssetTypes });
    setError('');
    setResults(null);

    if (!meFile || !rosterFile) {
      setError('Please upload both the MEData CSV and the Rippling roster CSV.');
      return;
    }
    if (!selectedAsset) {
      setError('Please select an asset type.');
      return;
    }

    setRunning(true);

    try {
      const [meText, rosterText] = await Promise.all([
        meFile.text(),
        rosterFile.text()
      ]);

      const { header: meHeaders, rows: meRows } = parseCsv(meText);
      const { header: rosterHeaders, rows: rosterRows } = parseCsv(rosterText);

      // Store detected headers for use in Module Manager column mapping
      const newHeaders = { meData: meHeaders, rosterData: rosterHeaders };
      saveDetectedHeaders(newHeaders);
      if (onHeadersDetected) onHeadersDetected(newHeaders);

      const rosterMap = buildRosterMap(rosterRows);
      const auditResults = runAudit(
        meRows,
        rosterMap,
        selectedAssetConfig,
        config.modulePool
      );

      setResults({ ...auditResults, assetName: selectedAssetConfig.name });

      addToHistory({
        date: new Date().toLocaleString(),
        asset: selectedAssetConfig.name,
        meFile: meFile.name,
        rosterFile: rosterFile.name,
        terminated: auditResults.terminated.length,
        unaccounted: auditResults.unaccounted.length,
        flagged: auditResults.flagged.length,
        blacklisted: auditResults.blacklisted.length,
        clean: auditResults.clean.length
      });

    } catch (e) {
      setError(`Audit failed: ${e.message}`);
    }

    setRunning(false);
  }

  function handleExport() {
    if (!results) return;
    exportToExcel(results.assetName, results);
  }

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Run Audit</h2>
      <p style={STYLES.subtitle}>
        Upload your data files, select an asset type, and run the audit.
      </p>

      <Dropzone label="MEData CSV" file={meFile} onFile={setMeFile} />
      <Dropzone label="Rippling Roster CSV" file={rosterFile} onFile={setRosterFile} />

      <div style={STYLES.section}>
        <span style={STYLES.label}>Asset Type</span>
        <select
          style={STYLES.select}
          value={selectedAsset}
          onChange={e => setSelectedAsset(e.target.value)}
        >
          <option value="">— Select an asset type —</option>
          {enabledAssets.map(asset => (
            <option key={asset.key} value={asset.key}>{asset.name}</option>
          ))}
        </select>
      </div>

      {selectedAssetConfig && (
        <div style={STYLES.modulesList}>
          <strong style={{ color: '#9ca3af' }}>Active modules for {selectedAssetConfig.name}:</strong>
          <div style={{ marginTop: '6px' }}>
            🔧 Processing: {selectedAssetConfig.selectedProcessingModules.join(', ')}
          </div>
          <div style={{ marginTop: '4px' }}>
            🔍 Audit: {selectedAssetConfig.selectedAuditModules.join(', ')}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          style={{ ...STYLES.button, ...(running ? STYLES.buttonDisabled : {}) }}
          onClick={handleRun}
          disabled={running}
        >
          {running ? 'Running...' : '▶ Run Audit'}
        </button>

        {results && (
          <button style={STYLES.buttonSecondary} onClick={handleExport}>
            ↓ Download .xlsx
          </button>
        )}
      </div>

      {error && <div style={STYLES.error}>⚠ {error}</div>}

      {results && (
        <div style={STYLES.results}>
          <div style={STYLES.resultsTitle}>
            Audit Complete — {results.assetName}
          </div>
          <div style={STYLES.statsGrid}>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#f87171' }}>
                {results.terminated.length}
              </div>
              <div style={STYLES.statLabel}>Terminated</div>
            </div>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#fb923c' }}>
                {results.unaccounted.length}
              </div>
              <div style={STYLES.statLabel}>Unaccounted</div>
            </div>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#facc15' }}>
                {results.flagged.length}
              </div>
              <div style={STYLES.statLabel}>Flagged</div>
            </div>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#a78bfa' }}>
                {results.blacklisted.length}
              </div>
              <div style={STYLES.statLabel}>Suppressed</div>
            </div>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#34d399' }}>
                {results.clean.length}
              </div>
              <div style={STYLES.statLabel}>Clean</div>
            </div>
          </div>
          <div style={STYLES.success}>
            ✓ Report ready. Click "Download .xlsx" to save your audit report.
          </div>
        </div>
      )}
    </div>
  );
}