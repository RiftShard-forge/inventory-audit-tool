// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import React, { useState } from 'react';
import { runAudit } from '../utils/auditEngine';
import { exportToExcel } from '../utils/exportExcel';
import { addToHistory, loadConfig, saveConfig } from '../config/configManager';

const STYLES = {
  page: { maxWidth: '900px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  section: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px', marginBottom: '20px'
  },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' },
  select: {
    width: '100%', padding: '10px 14px', backgroundColor: '#1a1d27',
    border: '1px solid #2a2d3e', borderRadius: '8px', color: '#e0e0e0',
    fontSize: '14px', cursor: 'pointer'
  },
  runBtn: {
    padding: '13px 32px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginRight: '12px', transition: 'opacity 0.15s'
  },
  downloadBtn: {
    padding: '13px 32px', backgroundColor: '#1a1d27', color: '#e0e0e0',
    border: '1px solid #2a2d3e', borderRadius: '8px', fontSize: '15px',
    fontWeight: '500', cursor: 'pointer'
  },
  disabledBtn: { opacity: 0.4, cursor: 'not-allowed' },
  error: {
    backgroundColor: '#1f1315', border: '1px solid #7f1d1d',
    borderRadius: '8px', padding: '16px', color: '#fca5a5',
    fontSize: '14px', marginTop: '16px'
  },
  warning: {
    backgroundColor: '#1f1a0f', border: '1px solid #78350f',
    borderRadius: '8px', padding: '16px', color: '#fcd34d',
    fontSize: '13px', marginBottom: '16px'
  },
  deltaWarning: {
    backgroundColor: '#1c1108', border: '1px solid #92400e',
    borderRadius: '8px', padding: '16px', marginBottom: '16px',
    fontSize: '13px', color: '#fb923c'
  },
  success: {
    backgroundColor: '#0f1f17', border: '1px solid #064e3b',
    borderRadius: '8px', padding: '16px', color: '#6ee7b7',
    fontSize: '14px', marginTop: '16px'
  },
  confirmBox: {
    backgroundColor: '#1f1315', border: '1px solid #7f1d1d',
    borderRadius: '8px', padding: '16px', marginTop: '12px'
  },
  confirmText: { fontSize: '13px', color: '#fca5a5', marginBottom: '12px', lineHeight: '1.6' },
  confirmBtns: { display: 'flex', gap: '8px' },
  confirmYes: {
    padding: '8px 16px', backgroundColor: '#7f1d1d', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
  },
  confirmNo: {
    padding: '8px 16px', backgroundColor: '#1a1d27', color: '#e0e0e0',
    border: '1px solid #2a2d3e', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
  },
  statsGrid: { display: 'grid', gap: '12px', marginBottom: '20px' },
  statCard: {
    backgroundColor: '#0f1117', borderRadius: '8px',
    padding: '16px', textAlign: 'center'
  },
  statNumber: { fontSize: '28px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },
  categoryCard: {
    backgroundColor: '#0f1117', borderRadius: '8px',
    padding: '16px', marginBottom: '10px'
  },
  categoryHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '10px'
  },
  categoryName: { fontSize: '14px', fontWeight: '500', color: '#ffffff' },
  categoryCount: {
    fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
    backgroundColor: '#1e1b4b', border: '1px solid #3730a3', color: '#a78bfa'
  },
  previewTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: {
    textAlign: 'left', padding: '8px 10px', color: '#6b7280',
    borderBottom: '1px solid #2a2d3e', fontWeight: '500', fontSize: '11px'
  },
  td: { padding: '8px 10px', borderBottom: '1px solid #1a1d27', color: '#e0e0e0' },
  showMore: {
    fontSize: '12px', color: '#6366f1', cursor: 'pointer',
    marginTop: '8px', display: 'inline-block'
  },
  checklist: { marginBottom: '12px' },
  checkItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 0', borderBottom: '1px solid #1a1d27',
    fontSize: '13px'
  },
  checkIcon: { fontSize: '14px', width: '20px', textAlign: 'center' },
  modulesInfo: {
    fontSize: '12px', color: '#6b7280', marginTop: '8px',
    backgroundColor: '#0f1117', borderRadius: '6px', padding: '10px'
  }
};

function PreviewTable({ rows, maxRows = 5 }) {
  const [showAll, setShowAll] = useState(false);
  if (!rows || rows.length === 0) return null;

  const displayKeys = Object.keys(rows[0]).filter(k => !k.startsWith('_'));
  const auditKeys = Object.keys(rows[0]).filter(k => k.startsWith('_'));
  const allKeys = [...auditKeys, ...displayKeys];
  const displayRows = showAll ? rows : rows.slice(0, maxRows);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={STYLES.previewTable}>
        <thead>
          <tr>
            {allKeys.map(k => (
              <th key={k} style={STYLES.th}>
                {k.startsWith('_') ? k.replace('_', '') : k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i}>
              {allKeys.map(k => (
                <td key={k} style={{
                  ...STYLES.td,
                  color: k.startsWith('_') ? '#a78bfa' : '#e0e0e0',
                  maxWidth: '200px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {row[k] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <span style={STYLES.showMore} onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show less' : `+ ${rows.length - maxRows} more rows`}
        </span>
      )}
    </div>
  );
}

export default function PreviewRun({ config, onConfigUpdate, dataSources, previousAudit }) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedPrimarySource, setSelectedPrimarySource] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  // Delta confirmation state
  const [showDeltaConfirm, setShowDeltaConfirm] = useState(false);
  const [deltaDateMismatch, setDeltaDateMismatch] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);

  const assetTypes = config.assetTypes || {};
  const auditRules = config.auditRules || [];
  const processingSteps = config.processingSteps || [];
  const sourceKeys = Object.keys(dataSources);
  const assetKeys = Object.keys(assetTypes);

  const selectedAssetConfig = assetTypes[selectedAsset];
  const applicableRules = selectedAssetConfig
    ? auditRules.filter(r => (selectedAssetConfig.selectedRules || []).includes(r.id))
    : [];
  const applicableSteps = selectedAssetConfig
    ? processingSteps.filter(s => (selectedAssetConfig.selectedProcessingSteps || []).includes(s.id))
    : [];

  // Check if previous audit date matches most recent history entry
  // Reads fresh from localStorage to always compare against last completed audit
  function checkDeltaDateMatch() {
    if (!previousAudit || !previousAudit.auditDate) return true;
    const freshConfig = loadConfig();
    const history = freshConfig.runHistory || [];
    if (history.length === 0) return true;
    const lastRun = history[0].date;
    const normalize = d => (d || '').toString().trim().slice(0, 16);
    return normalize(previousAudit.auditDate) === normalize(lastRun);
  }

  // Pre-run checklist
  const checks = [
    { label: 'Data sources loaded', ok: sourceKeys.length > 0, detail: `${sourceKeys.length} source(s): ${sourceKeys.join(', ')}` },
    { label: 'Audit Profile selected', ok: !!selectedAsset, detail: selectedAssetConfig?.name || 'None selected' },
    { label: 'Primary source selected', ok: !!selectedPrimarySource, detail: selectedPrimarySource || 'None selected' },
    { label: 'Audit rules configured', ok: applicableRules.length > 0, detail: `${applicableRules.length} rule(s) selected` },
    { label: 'Categories defined', ok: (config.auditCategories || []).length > 0, detail: `${(config.auditCategories || []).length} category(ies)` }
  ];

  const readyToRun = checks.every(c => c.ok);

  function handleRunClick() {
    // If previous audit loaded → show confirmation first
    if (previousAudit) {
      const dateMatch = checkDeltaDateMatch();
      setDeltaDateMismatch(!dateMatch);
      setShowDeltaConfirm(true);
      setPendingRun(true);
      return;
    }
    executeRun(false);
  }

  function handleDeltaConfirm() {
    setShowDeltaConfirm(false);
    setPendingRun(false);
    executeRun(true);
  }

  function handleDeltaCancel() {
    setShowDeltaConfirm(false);
    setPendingRun(false);
  }

  async function executeRun(withDelta) {
    setError('');
    setResults(null);
    setRunning(true);
    const runDate = new Date().toLocaleString();

    try {
      const primarySource = dataSources[selectedPrimarySource];
      if (!primarySource || !primarySource.rows) {
        throw new Error(`Primary source "${selectedPrimarySource}" has no data loaded.`);
      }

      const auditResults = runAudit(
        { ...primarySource, selectedProcessingSteps: primarySource.selectedProcessingSteps || [] },
        dataSources,
        selectedAssetConfig,
        auditRules,
        processingSteps,
        dataSources,
        config.filters || [],
        withDelta ? previousAudit : null
      );

      // Safety Net
      const identifierColumn = selectedAssetConfig.identifierColumn || 'Computer';
      const outputIdentifiers = new Set([
        ...Object.values(auditResults.byCategory).flat(),
        ...auditResults.clean,
        ...auditResults.blacklisted,
        ...(auditResults.underInvestigation || [])
      ].map(row => (row[identifierColumn] || '').trim().toLowerCase()));

      const unaccounted = primarySource.rows.filter(row => {
        const id = (row[identifierColumn] || '').trim().toLowerCase();
        return id && !outputIdentifiers.has(id);
      });

      setResults({
        ...auditResults,
        assetName: selectedAssetConfig.name,
        unaccounted,
        deltaRan: withDelta,
        runDate
      });

      // If delta ran and filters were updated → save updated config
      if (withDelta && auditResults.updatedFilters) {
        const updatedConfig = {
          ...config,
          filters: auditResults.updatedFilters
        };
        saveConfig(updatedConfig);
        onConfigUpdate(updatedConfig);
      }

      addToHistory({
        date: runDate,
        asset: selectedAssetConfig.name,
        sources: sourceKeys.join(', '),
        totalFlagged: auditResults.summary.totalFlagged,
        totalClean: auditResults.summary.totalClean,
        totalBlacklisted: auditResults.summary.totalBlacklisted,
        totalProcessed: auditResults.summary.totalProcessed,
        byCategory: auditResults.summary.byCategory
      });

      // Sync React state with updated history
      const refreshedConfig = loadConfig();
      onConfigUpdate(refreshedConfig);

    } catch (e) {
      setError(`Audit failed: ${e.message}`);
      console.error(e);
    }

    setRunning(false);
  }

  function handleExport() {
    if (!results) return;
    exportToExcel(results.assetName, results);
  }

  // Count delta assets in under investigation
  const deltaCount = results
    ? (results.underInvestigation || []).filter(r => r['_Delta']).length
    : 0;

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Preview & Run</h2>
      <p style={STYLES.subtitle}>
        Configure your audit run, verify everything is ready, then execute.
      </p>

      {/* Delta reference indicator */}
      {previousAudit && (
        <div style={STYLES.deltaWarning}>
          🔄 Delta reference loaded: <strong>{previousAudit.fileName}</strong>
          {previousAudit.auditDate && (
            <span style={{ marginLeft: '8px', color: '#9ca3af' }}>
              · Run date: {previousAudit.auditDate}
            </span>
          )}
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            Delta detection will run automatically. Changed assets will be flagged
            in Under Investigation and removed from their Access Rules lists.
          </div>
        </div>
      )}

      {/* Audit Configuration */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>Audit Configuration</div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
            Audit Profile
          </div>
          <select
            style={STYLES.select}
            value={selectedAsset}
            onChange={e => { setSelectedAsset(e.target.value); setResults(null); }}
          >
            <option value="">— Select audit profile —</option>
            {assetKeys.map(key => (
              <option key={key} value={key}>{assetTypes[key].name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
            Primary Data Source
          </div>
          <select
            style={STYLES.select}
            value={selectedPrimarySource}
            onChange={e => { setSelectedPrimarySource(e.target.value); setResults(null); }}
          >
            <option value="">— Select primary source —</option>
            {sourceKeys.map(key => (
              <option key={key} value={key}>{dataSources[key].name}</option>
            ))}
          </select>
          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>
            The primary source is the main asset list being audited. Other sources are used for lookups.
          </div>
        </div>

        {selectedAssetConfig && (
          <div style={STYLES.modulesInfo}>
            <div>🔧 Processing steps: {applicableSteps.length > 0 ? applicableSteps.map(s => s.name || s.id).join(', ') : 'None selected'}</div>
            <div style={{ marginTop: '4px' }}>🔍 Audit rules: {applicableRules.length > 0 ? applicableRules.map(r => r.name || r.id).join(', ') : 'None selected'}</div>
          </div>
        )}
      </div>

      {/* Pre-run Checklist */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>Pre-run Checklist</div>
        <div style={STYLES.checklist}>
          {checks.map((check, i) => (
            <div key={i} style={STYLES.checkItem}>
              <span style={STYLES.checkIcon}>{check.ok ? '✅' : '❌'}</span>
              <div>
                <div style={{ color: check.ok ? '#e0e0e0' : '#fca5a5', fontWeight: '500' }}>{check.label}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{check.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {!readyToRun && (
          <div style={STYLES.warning}>
            ⚠ Complete all checklist items before running the audit.
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <button
            style={{ ...STYLES.runBtn, ...(!readyToRun || running || pendingRun ? STYLES.disabledBtn : {}) }}
            onClick={handleRunClick}
            disabled={!readyToRun || running || pendingRun}
          >
            {running ? '⏳ Running...' : '▶ Run Audit'}
          </button>

          {results && (
            <button style={STYLES.downloadBtn} onClick={handleExport}>
              ↓ Download .xlsx
            </button>
          )}
        </div>

        {/* Delta confirmation dialog */}
        {showDeltaConfirm && (
          <div style={STYLES.confirmBox}>
            <div style={STYLES.confirmText}>
              {deltaDateMismatch && (
                <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#1f1a0f', borderRadius: '6px', border: '1px solid #78350f', color: '#fcd34d' }}>
                  ⚠ Date mismatch detected. The uploaded file ({previousAudit.auditDate}) does not match
                  your most recent audit ({loadConfig().runHistory?.[0]?.date || 'no history found'}).
                  Are you sure this is the correct previous audit file?
                </div>
              )}
              <strong>⚠ Delta detection will permanently remove assets from your Access Rules.</strong>
              <br />
              Changed or missing assets will be flagged in Under Investigation and removed from
              their Access Rule lists. This cannot be undone within this session.
              <br /><br />
              Do you want to proceed?
            </div>
            <div style={STYLES.confirmBtns}>
              <button style={STYLES.confirmYes} onClick={handleDeltaConfirm}>
                Yes, run with delta detection
              </button>
              <button style={STYLES.confirmNo} onClick={handleDeltaCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && <div style={STYLES.error}>⚠ {error}</div>}
      </div>

      {/* Results Preview */}
      {results && (
        <div style={STYLES.section}>
          <div style={STYLES.sectionTitle}>
            Audit Complete — {results.assetName}
          </div>

          {/* Delta summary banner */}
          {results.deltaRan && deltaCount > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
              fontSize: '13px', fontWeight: '500',
              backgroundColor: '#1c1108', border: '1px solid #92400e', color: '#fb923c'
            }}>
              🔄 Delta detection: {deltaCount} asset{deltaCount !== 1 ? 's' : ''} changed
              status and {deltaCount !== 1 ? 'were' : 'was'} removed from Access Rules.
              See Under Investigation for details.
            </div>
          )}

          {results.deltaRan && deltaCount === 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
              fontSize: '13px', fontWeight: '500',
              backgroundColor: '#0f1f17', border: '1px solid #064e3b', color: '#34d399'
            }}>
              🔄 Delta detection ran — no changes detected in Access Rules assets.
            </div>
          )}

          {/* Summary stats */}
          <div style={{
            ...STYLES.statsGrid,
            gridTemplateColumns: `repeat(${Math.min(3 + Object.keys(results.byCategory).length, 6)}, 1fr)`
          }}>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#34d399' }}>
                {results.summary.totalClean}
              </div>
              <div style={STYLES.statLabel}>Clean</div>
            </div>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#f87171' }}>
                {results.summary.totalFlagged}
              </div>
              <div style={STYLES.statLabel}>Total Flagged</div>
            </div>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#a78bfa' }}>
                {results.summary.totalBlacklisted}
              </div>
              <div style={STYLES.statLabel}>Suppressed</div>
            </div>
            {results.summary.totalUnderInvestigation > 0 && (
              <div style={STYLES.statCard}>
                <div style={{ ...STYLES.statNumber, color: '#fb923c' }}>
                  {results.summary.totalUnderInvestigation}
                </div>
                <div style={STYLES.statLabel}>Under Investigation</div>
              </div>
            )}
            {Object.entries(results.summary.byCategory).map(([cat, count]) => (
              <div key={cat} style={STYLES.statCard}>
                <div style={{ ...STYLES.statNumber, color: '#fb923c' }}>{count}</div>
                <div style={STYLES.statLabel}>{cat}</div>
              </div>
            ))}
          </div>

          {/* Safety Net counter */}
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
            fontSize: '13px', fontWeight: '500',
            backgroundColor: results.unaccounted.length > 0 ? '#1f1315' : '#0f1f17',
            border: `1px solid ${results.unaccounted.length > 0 ? '#7f1d1d' : '#064e3b'}`,
            color: results.unaccounted.length > 0 ? '#fca5a5' : '#6ee7b7'
          }}>
            {results.unaccounted.length > 0
              ? `⚠ Safety Net: ${results.summary.totalProcessed} in — ${results.summary.totalProcessed - results.unaccounted.length} out — ${results.unaccounted.length} asset(s) unaccounted`
              : `✓ Safety Net: ${results.summary.totalProcessed} in — ${results.summary.totalProcessed} out — all assets accounted for`
            }
          </div>

          {/* Category previews */}
          {Object.entries(results.byCategory)
            .sort((a, b) => {
              const sevA = results.categorySeverity?.[a[0]] ?? 99;
              const sevB = results.categorySeverity?.[b[0]] ?? 99;
              return sevA - sevB;
            })
            .map(([category, rows]) => (
              <div key={category} style={STYLES.categoryCard}>
                <div style={STYLES.categoryHeader}>
                  <span style={STYLES.categoryName}>{category}</span>
                  <span style={STYLES.categoryCount}>
                    {rows.length} asset{rows.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <PreviewTable rows={rows} maxRows={3} />
              </div>
            ))}

          {/* Clean preview */}
          {results.clean.length > 0 && (
            <div style={STYLES.categoryCard}>
              <div style={STYLES.categoryHeader}>
                <span style={{ ...STYLES.categoryName, color: '#34d399' }}>Clean</span>
                <span style={{ ...STYLES.categoryCount, backgroundColor: '#0f1f17', borderColor: '#064e3b', color: '#34d399' }}>
                  {results.clean.length} asset{results.clean.length !== 1 ? 's' : ''}
                </span>
              </div>
              <PreviewTable rows={results.clean} maxRows={3} />
            </div>
          )}

          {/* Under Investigation preview */}
          {results.underInvestigation && results.underInvestigation.length > 0 && (
            <div style={STYLES.categoryCard}>
              <div style={STYLES.categoryHeader}>
                <span style={{ ...STYLES.categoryName, color: '#fb923c' }}>🔍 Under Investigation</span>
                <span style={{ ...STYLES.categoryCount, backgroundColor: '#1c1108', borderColor: '#92400e', color: '#fb923c' }}>
                  {results.underInvestigation.length} asset{results.underInvestigation.length !== 1 ? 's' : ''}
                </span>
              </div>
              <PreviewTable rows={results.underInvestigation} maxRows={3} />
            </div>
          )}

          <div style={STYLES.success}>
            ✓ Report ready. Click "Download .xlsx" to save your full audit report.
          </div>
        </div>
      )}
    </div>
  );
}