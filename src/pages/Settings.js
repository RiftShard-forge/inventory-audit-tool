import React, { useState } from 'react';
import { resetConfig } from '../config/configManager';

const STYLES = {
  page: { maxWidth: '800px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  tabs: {
    display: 'flex', gap: '8px', marginBottom: '24px',
    borderBottom: '1px solid #2a2d3e', paddingBottom: '0'
  },
  tab: {
    padding: '10px 20px', cursor: 'pointer', fontSize: '14px',
    color: '#6b7280', border: 'none', background: 'none',
    borderBottom: '2px solid transparent', marginBottom: '-1px',
    transition: 'all 0.15s ease'
  },
  tabActive: { color: '#6366f1', borderBottomColor: '#6366f1' },
  section: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px', marginBottom: '16px'
  },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' },
  sectionDesc: { fontSize: '12px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' },
  configRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' },
  configLabel: { fontSize: '12px', color: '#9ca3af', width: '160px', flexShrink: 0 },
  input: {
    flex: 1, padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: '12px', fontWeight: '500',
    color: '#6b7280', padding: '8px 12px',
    borderBottom: '1px solid #2a2d3e'
  },
  td: { padding: '10px 12px', borderBottom: '1px solid #1a1d27', fontSize: '13px' },
  addRow: { display: 'flex', gap: '8px', marginTop: '12px' },
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
    padding: '10px 24px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer', marginTop: '16px'
  },
  savedMsg: { fontSize: '13px', color: '#34d399', marginTop: '10px' },
  dangerBtn: {
    padding: '11px 24px', backgroundColor: '#1f1315', color: '#fca5a5',
    border: '1px solid #7f1d1d', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer'
  },
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
  },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
  tag: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', padding: '3px 8px', fontSize: '12px', color: '#e0e0e0'
  },
  tagRemove: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '14px', lineHeight: '1', padding: '0'
  }
};

// =============================================
// SITE NORMALIZATION TAB
// =============================================
function SiteNormalizationTab({ config, onConfigUpdate }) {
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [saved, setSaved] = useState(false);

  const mappings = config.modulePool?.processing?.siteNormalization?.config?.mappings || {};

  function updateMappings(newMappings) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        processing: {
          ...config.modulePool.processing,
          siteNormalization: {
            ...config.modulePool.processing.siteNormalization,
            config: {
              ...config.modulePool.processing.siteNormalization.config,
              mappings: newMappings
            }
          }
        }
      }
    });
    setSaved(false);
  }

  function handleAdd() {
    if (!newFrom.trim() || !newTo.trim()) return;
    updateMappings({ ...mappings, [newFrom.trim()]: newTo.trim() });
    setNewFrom('');
    setNewTo('');
  }

  function handleRemove(key) {
    const updated = { ...mappings };
    delete updated[key];
    updateMappings(updated);
  }

  function handleEdit(oldKey, field, value) {
    const entries = Object.entries(mappings);
    const newMappings = {};
    entries.forEach(([k, v]) => {
      if (k === oldKey) {
        if (field === 'key') newMappings[value] = v;
        else newMappings[k] = value;
      } else {
        newMappings[k] = v;
      }
    });
    updateMappings(newMappings);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>Site Name Mappings</div>
      <p style={STYLES.sectionDesc}>
        Define how raw site names from your CSV exports are normalized before
        the audit runs. These mappings apply to all asset types that have
        Site Normalization enabled.
      </p>

      <table style={STYLES.table}>
        <thead>
          <tr>
            <th style={STYLES.th}>Raw name in CSV</th>
            <th style={STYLES.th}>Normalized name</th>
            <th style={STYLES.th}></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(mappings).length === 0 && (
            <tr>
              <td style={STYLES.td} colSpan={3}>
                <span style={{ color: '#4b5563' }}>No mappings defined yet.</span>
              </td>
            </tr>
          )}
          {Object.entries(mappings).map(([from, to]) => (
            <tr key={from}>
              <td style={STYLES.td}>
                <input
                  style={STYLES.input}
                  defaultValue={from}
                  onBlur={e => handleEdit(from, 'key', e.target.value)}
                />
              </td>
              <td style={STYLES.td}>
                <input
                  style={STYLES.input}
                  defaultValue={to}
                  onBlur={e => handleEdit(from, 'value', e.target.value)}
                />
              </td>
              <td style={STYLES.td}>
                <button style={STYLES.removeBtn} onClick={() => handleRemove(from)}>×</button>
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
        <button style={STYLES.addBtn} onClick={handleAdd}>+ Add</button>
      </div>

      <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Mappings</button>
      {saved && <div style={STYLES.savedMsg}>✓ Mappings saved successfully.</div>}
    </div>
  );
}

// =============================================
// EMAIL NORMALIZATION TAB
// =============================================
function EmailNormalizationTab({ config, onConfigUpdate }) {
  const [saved, setSaved] = useState(false);
  const emailConfig = config.modulePool?.processing?.emailNormalization?.config || {};

  function handleDomainChange(value) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        processing: {
          ...config.modulePool.processing,
          emailNormalization: {
            ...config.modulePool.processing.emailNormalization,
            config: { ...emailConfig, domainToStrip: value }
          }
        }
      }
    });
    setSaved(false);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>Email Normalization</div>
      <p style={STYLES.sectionDesc}>
        The email domain that gets stripped from user email and last login
        columns before the audit runs. For example, stripping "@company.co"
        turns "john.doe@company.co" into "john.doe" for comparison.
      </p>
      <div style={STYLES.configRow}>
        <span style={STYLES.configLabel}>Domain to strip</span>
        <input
          style={STYLES.input}
          defaultValue={emailConfig.domainToStrip || ''}
          onBlur={e => handleDomainChange(e.target.value)}
          placeholder="e.g. @company.co"
        />
      </div>
      <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save</button>
      {saved && <div style={STYLES.savedMsg}>✓ Saved successfully.</div>}
    </div>
  );
}

// =============================================
// OS FILTER TAB
// =============================================
function OsFilterTab({ config, onConfigUpdate }) {
  const [saved, setSaved] = useState(false);
  const osConfig = config.modulePool?.processing?.osFilter?.config || {};
  const categories = osConfig.categories || {};

  function handleCategoryChange(category, value) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        processing: {
          ...config.modulePool.processing,
          osFilter: {
            ...config.modulePool.processing.osFilter,
            config: {
              ...osConfig,
              categories: { ...categories, [category]: value }
            }
          }
        }
      }
    });
    setSaved(false);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>OS Filter</div>
      <p style={STYLES.sectionDesc}>
        Map OS category names to the exact OS name strings that appear in
        your ManageEngine CSV. Assets matching these values will be
        segregated into their respective categories in the audit output.
      </p>
      {Object.entries(categories).map(([category, osName]) => (
        <div key={category} style={STYLES.configRow}>
          <span style={STYLES.configLabel}>{category}</span>
          <input
            style={STYLES.input}
            defaultValue={osName}
            onBlur={e => handleCategoryChange(category, e.target.value)}
          />
        </div>
      ))}
      <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save</button>
      {saved && <div style={STYLES.savedMsg}>✓ Saved successfully.</div>}
    </div>
  );
}

// =============================================
// STATE FILTER TAB
// =============================================
function StateFilterTab({ config, onConfigUpdate }) {
  const [saved, setSaved] = useState(false);
  const [newActive, setNewActive] = useState('');
  const [newFlagged, setNewFlagged] = useState('');
  const stateConfig = config.modulePool?.processing?.stateFilter?.config || {};
  const activeStates = stateConfig.activeStates || [];
  const flaggedStates = stateConfig.flaggedStates || [];

  function updateStateConfig(field, newList) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        processing: {
          ...config.modulePool.processing,
          stateFilter: {
            ...config.modulePool.processing.stateFilter,
            config: { ...stateConfig, [field]: newList }
          }
        }
      }
    });
    setSaved(false);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>State Filter</div>
      <p style={STYLES.sectionDesc}>
        Define which asset states are considered active (included in audit)
        and which are flagged (segregated separately in the output).
      </p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
          Active States
        </div>
        <p style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
          Assets with these states will be included in the audit.
        </p>
        <div style={STYLES.tagContainer}>
          {activeStates.map(state => (
            <div key={state} style={STYLES.tag}>
              <span>{state}</span>
              <button
                style={STYLES.tagRemove}
                onClick={() => updateStateConfig('activeStates', activeStates.filter(s => s !== state))}
              >×</button>
            </div>
          ))}
        </div>
        <div style={STYLES.addRow}>
          <input
            style={STYLES.addInput}
            placeholder="Add active state..."
            value={newActive}
            onChange={e => setNewActive(e.target.value)}
          />
          <button style={STYLES.addBtn} onClick={() => {
            if (newActive.trim()) {
              updateStateConfig('activeStates', [...activeStates, newActive.trim()]);
              setNewActive('');
            }
          }}>+ Add</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
          Flagged States
        </div>
        <p style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
          Assets with these states will be segregated into the Flagged output tab.
        </p>
        <div style={STYLES.tagContainer}>
          {flaggedStates.map(state => (
            <div key={state} style={STYLES.tag}>
              <span>{state}</span>
              <button
                style={STYLES.tagRemove}
                onClick={() => updateStateConfig('flaggedStates', flaggedStates.filter(s => s !== state))}
              >×</button>
            </div>
          ))}
        </div>
        <div style={STYLES.addRow}>
          <input
            style={STYLES.addInput}
            placeholder="Add flagged state..."
            value={newFlagged}
            onChange={e => setNewFlagged(e.target.value)}
          />
          <button style={STYLES.addBtn} onClick={() => {
            if (newFlagged.trim()) {
              updateStateConfig('flaggedStates', [...flaggedStates, newFlagged.trim()]);
              setNewFlagged('');
            }
          }}>+ Add</button>
        </div>
      </div>

      <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save</button>
      {saved && <div style={STYLES.savedMsg}>✓ Saved successfully.</div>}
    </div>
  );
}

// =============================================
// RESET TAB
// =============================================
function ResetTab() {
  const [showConfirm, setShowConfirm] = useState(false);

  function handleReset() {
    resetConfig();
    window.location.reload();
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>Reset Configuration</div>
      <p style={STYLES.sectionDesc}>
        This will clear all saved settings including asset configurations,
        module settings, whitelists, blacklists, and site mappings.
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
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function Settings({ config, onConfigUpdate }) {
  const [activeTab, setActiveTab] = useState('site');

  const tabs = [
    { id: 'site', label: '📍 Site Mappings' },
    { id: 'email', label: '✉ Email' },
    { id: 'os', label: '💻 OS Filter' },
    { id: 'state', label: '🔄 State Filter' },
    { id: 'reset', label: '⚠ Reset' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Settings</h2>
      <p style={STYLES.subtitle}>
        Configure processing modules and manage app settings.
      </p>

      <div style={STYLES.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{ ...STYLES.tab, ...(activeTab === tab.id ? STYLES.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'site' && (
        <SiteNormalizationTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'email' && (
        <EmailNormalizationTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'os' && (
        <OsFilterTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'state' && (
        <StateFilterTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'reset' && <ResetTab />}
    </div>
  );
}