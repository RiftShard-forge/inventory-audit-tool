// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import React, { useState } from 'react';
import { runAudit } from '../utils/auditEngine';
import { exportToExcel } from '../utils/exportExcel';
import { addToHistory } from '../config/configManager';

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
  success: {
    backgroundColor: '#0f1f17', border: '1px solid #064e3b',
    borderRadius: '8px', padding: '16px', color: '#6ee7b7',
    fontSize: '14px', marginTop: '16px'
  },
  statsGrid: {
    display: 'grid', gap: '12px', marginBottom: '20px'
  },
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

export default function PreviewRun({ config, onConfigUpdate, dataSources }) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedPrimarySource, setSelectedPrimarySource] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

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

  // Pre-run checklist
  const checks = [
    { label: 'Data sources loaded', ok: sourceKeys.length > 0, detail: `${sourceKeys.length} source(s): ${sourceKeys.join(', ')}` },
    { label: 'Audit Profile selected', ok: !!selectedAsset, detail: selectedAssetConfig?.name || 'None selected' },
    { label: 'Primary source selected', ok: !!selectedPrimarySource, detail: selectedPrimarySource || 'None selected' },
    { label: 'Audit rules configured', ok: applicableRules.length > 0, detail: `${applicableRules.length} rule(s) selected` },
    { label: 'Categories defined', ok: (config.auditCategories || []).length > 0, detail: `${(config.auditCategories || []).length} category(ies)` }
  ];

  const readyToRun = checks.every(c => c.ok);

  async function handleRun() {
    setError('');
    setResults(null);
    setRunning(true);

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
        dataSources
      );

      // Safety Net — find assets from input that didn't land anywhere in output
      const outputIdentifiers = new Set([
        ...Object.values(auditResults.byCategory).flat(),
        ...auditResults.clean,
        ...auditResults.blacklisted
      ].map(row => (
        row['Serial Number'] || row['Serial'] || row['Computer'] || row['Asset Tag'] || ''
      ).trim().toLowerCase()));

      const unaccounted = primarySource.rows.filter(row => {
        const id = (
          row['Serial Number'] || row['Serial'] || row['Computer'] || row['Asset Tag'] || ''
        ).trim().toLowerCase();
        return id && !outputIdentifiers.has(id);
      });

      setResults({ ...auditResults, assetName: selectedAssetConfig.name, unaccounted });

      addToHistory({
        date: new Date().toLocaleString(),
        asset: selectedAssetConfig.name,
        sources: sourceKeys.join(', '),
        totalFlagged: auditResults.summary.totalFlagged,
        totalClean: auditResults.summary.totalClean,
        totalBlacklisted: auditResults.summary.totalBlacklisted,
        totalProcessed: auditResults.summary.totalProcessed,
        byCategory: auditResults.summary.byCategory
      });

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

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Preview & Run</h2>
      <p style={STYLES.subtitle}>
        Configure your audit run, verify everything is ready, then execute.
      </p>

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
            style={{ ...STYLES.runBtn, ...(!readyToRun || running ? STYLES.disabledBtn : {}) }}
            onClick={handleRun}
            disabled={!readyToRun || running}
          >
            {running ? '⏳ Running...' : '▶ Run Audit'}
          </button>

          {results && (
            <button style={STYLES.downloadBtn} onClick={handleExport}>
              ↓ Download .xlsx
            </button>
          )}
        </div>

        {error && <div style={STYLES.error}>⚠ {error}</div>}
      </div>

      {/* Results Preview */}
      {results && (
        <div style={STYLES.section}>
          <div style={STYLES.sectionTitle}>
            Audit Complete — {results.assetName}
          </div>

          {/* Summary stats */}
          <div style={{
            ...STYLES.statsGrid,
            gridTemplateColumns: `repeat(${Math.min(3 + Object.keys(results.byCategory).length, 6)}, 1fr)`
          }}>
            <div style={STYLES.statCard}>
              <div style={{ ...STYLES.statNumber, color: '#34d399' }}>
                {results.summary.totalClean}
              </div>
              <div style={STYLES.statLabel}>Uncategorized</div>
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

          {/* Category previews — sorted by severity */}
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

          {/* Uncategorized preview (formerly Clean) */}
          {results.clean.length > 0 && (
            <div style={STYLES.categoryCard}>
              <div style={STYLES.categoryHeader}>
                <span style={{ ...STYLES.categoryName, color: '#34d399' }}>Uncategorized</span>
                <span style={{ ...STYLES.categoryCount, backgroundColor: '#0f1f17', borderColor: '#064e3b', color: '#34d399' }}>
                  {results.clean.length} asset{results.clean.length !== 1 ? 's' : ''}
                </span>
              </div>
              <PreviewTable rows={results.clean} maxRows={3} />
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