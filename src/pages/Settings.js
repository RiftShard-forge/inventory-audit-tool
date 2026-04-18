import React, { useState } from 'react';
import { resetConfig } from '../config/configManager';

const STYLES = {
  page: { maxWidth: '800px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  section: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px', marginBottom: '20px'
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  sectionDesc: { fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: '12px', fontWeight: '500',
    color: '#6b7280', padding: '8px 12px',
    borderBottom: '1px solid #2a2d3e'
  },
  td: { padding: '10px 12px', borderBottom: '1px solid #1a1d27', fontSize: '13px' },
  input: {
    width: '100%', padding: '7px 10px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px'
  },
  moduleSelector: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  selectorBtn: {
    padding: '7px 14px', borderRadius: '8px', border: '1px solid #2a2d3e',
    backgroundColor: '#1a1d27', color: '#9ca3af', fontSize: '13px',
    cursor: 'pointer'
  },
  selectorBtnActive: { backgroundColor: '#2a2d3e', color: '#ffffff', borderColor: '#6366f1' },
  addRow: { display: 'flex', gap: '8px', marginTop: '16px' },
  addInput: {
    flex: 1, padding: '9px 14px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '8px',
    color: '#e0e0e0', fontSize: '13px'
  },
  addBtn: {
    padding: '9px 16px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
  },
  removeBtn: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '18px', lineHeight: '1'
  },
  saveBtn: {
    padding: '11px 24px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer', marginTop: '16px'
  },
  dangerBtn: {
    padding: '11px 24px', backgroundColor: '#1f1315', color: '#fca5a5',
    border: '1px solid #7f1d1d', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer'
  },
  savedMsg: { fontSize: '13px', color: '#34d399', marginTop: '12px' },
  confirmBox: {
    backgroundColor: '#1f1315', border: '1px solid #7f1d1d',
    borderRadius: '8px', padding: '16px', marginTop: '16px'
  },
  confirmText: { fontSize: '13px', color: '#fca5a5', marginBottom: '12px' },
  confirmBtns: { display: 'flex', gap: '8px' },
  confirmYes: {
    padding: '8px 16px', backgroundColor: '#7f1d1d', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
  },
  confirmNo: {
    padding: '8px 16px', backgroundColor: '#1a1d27', color: '#e0e0e0',
    border: '1px solid #2a2d3e', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
  }
};

export default function Settings({ config, onConfigUpdate }) {
  const [activeModule, setActiveModule] = useState('workstations');
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');

  const moduleKeys = Object.keys(config.modules);
  const mod = config.modules[activeModule];
  const siteMapping = mod.siteMapping || {};

  function handleMappingChange(oldKey, field, value) {
    const entries = Object.entries(siteMapping);
    const newMapping = {};
    entries.forEach(([k, v]) => {
      if (k === oldKey) {
        if (field === 'key') newMapping[value] = v;
        else newMapping[k] = value;
      } else {
        newMapping[k] = v;
      }
    });
    updateMapping(newMapping);
  }

  function handleAddMapping() {
    if (!newFrom.trim() || !newTo.trim()) return;
    const updated = { ...siteMapping, [newFrom.trim()]: newTo.trim() };
    updateMapping(updated);
    setNewFrom('');
    setNewTo('');
  }

  function handleRemoveMapping(key) {
    const updated = { ...siteMapping };
    delete updated[key];
    updateMapping(updated);
  }

  function updateMapping(newMapping) {
    const updated = {
      ...config,
      modules: {
        ...config.modules,
        [activeModule]: { ...mod, siteMapping: newMapping }
      }
    };
    onConfigUpdate(updated);
    setSaved(false);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    resetConfig();
    window.location.reload();
  }

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Settings</h2>
      <p style={STYLES.subtitle}>
        Configure site name mappings per module and manage app settings.
      </p>

      {/* Site Mapping Section */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>Site Name Mappings</div>
        <p style={STYLES.sectionDesc}>
          Define how raw site names from your CSV exports should be normalized.
          For example, "Base Site" becomes "Santo Domingo Office (New)".
          These mappings are applied automatically during every audit run.
        </p>

        <div style={STYLES.moduleSelector}>
          {moduleKeys.map(key => (
            <button
              key={key}
              style={{
                ...STYLES.selectorBtn,
                ...(activeModule === key ? STYLES.selectorBtnActive : {})
              }}
              onClick={() => { setActiveModule(key); setSaved(false); }}
            >
              {config.modules[key].name}
            </button>
          ))}
        </div>

        <table style={STYLES.table}>
          <thead>
            <tr>
              <th style={STYLES.th}>Raw name in CSV</th>
              <th style={STYLES.th}>Normalized name</th>
              <th style={STYLES.th}></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(siteMapping).length === 0 && (
              <tr>
                <td style={STYLES.td} colSpan={3}>
                  <span style={{ color: '#4b5563' }}>No mappings defined yet.</span>
                </td>
              </tr>
            )}
            {Object.entries(siteMapping).map(([from, to]) => (
              <tr key={from}>
                <td style={STYLES.td}>
                  <input
                    style={STYLES.input}
                    defaultValue={from}
                    onBlur={e => handleMappingChange(from, 'key', e.target.value)}
                  />
                </td>
                <td style={STYLES.td}>
                  <input
                    style={STYLES.input}
                    defaultValue={to}
                    onBlur={e => handleMappingChange(from, 'value', e.target.value)}
                  />
                </td>
                <td style={STYLES.td}>
                  <button
                    style={STYLES.removeBtn}
                    onClick={() => handleRemoveMapping(from)}
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={STYLES.addRow}>
          <input
            style={STYLES.addInput}
            placeholder="Raw site name (from CSV)..."
            value={newFrom}
            onChange={e => setNewFrom(e.target.value)}
          />
          <input
            style={STYLES.addInput}
            placeholder="Normalized name..."
            value={newTo}
            onChange={e => setNewTo(e.target.value)}
          />
          <button style={STYLES.addBtn} onClick={handleAddMapping}>+ Add</button>
        </div>

        <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Settings</button>
        {saved && <div style={STYLES.savedMsg}>✓ Settings saved successfully.</div>}
      </div>

      {/* Reset Section */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>Reset Configuration</div>
        <p style={STYLES.sectionDesc}>
          This will clear all saved settings including module configurations,
          known models, whitelists, blacklists, and site mappings.
          Run history will also be cleared. This action cannot be undone.
        </p>
        <button style={STYLES.dangerBtn} onClick={() => setShowConfirm(true)}>
          ⚠ Reset All Settings
        </button>

        {showConfirm && (
          <div style={STYLES.confirmBox}>
            <p style={STYLES.confirmText}>
              Are you sure? This will delete all your configurations and cannot be undone.
            </p>
            <div style={STYLES.confirmBtns}>
              <button style={STYLES.confirmYes} onClick={handleReset}>
                Yes, reset everything
              </button>
              <button style={STYLES.confirmNo} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}