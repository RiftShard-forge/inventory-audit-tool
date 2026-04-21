import React, { useState } from 'react';

const STYLES = {
  page: { maxWidth: '1000px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #2a2d3e', paddingBottom: '0' },
  tab: {
    padding: '10px 20px', cursor: 'pointer', fontSize: '14px',
    color: '#6b7280', border: 'none', background: 'none',
    borderBottom: '2px solid transparent', marginBottom: '-1px',
    transition: 'all 0.15s ease'
  },
  tabActive: { color: '#6366f1', borderBottomColor: '#6366f1' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '20px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#ffffff' },
  cardDesc: { fontSize: '12px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' },
  badge: { fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid' },
  badgeActive: { color: '#34d399', borderColor: '#064e3b', backgroundColor: '#0f1f17' },
  badgeInactive: { color: '#9ca3af', borderColor: '#374151', backgroundColor: '#1f2937' },
  badgeProcessing: { color: '#38bdf8', borderColor: '#0c4a6e', backgroundColor: '#0c1a2e' },
  badgeAudit: { color: '#a78bfa', borderColor: '#3730a3', backgroundColor: '#1e1b4b' },
  toggle: {
    width: '100%', padding: '9px', borderRadius: '8px',
    border: '1px solid', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.15s ease', marginBottom: '8px'
  },
  toggleActive: { backgroundColor: '#1f1f35', borderColor: '#7f1d1d', color: '#fca5a5' },
  toggleInactive: { backgroundColor: '#0f1f17', borderColor: '#064e3b', color: '#34d399' },
  moduleChips: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' },
  chip: {
    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
    border: '1px solid #2a2d3e', color: '#9ca3af', backgroundColor: '#0f1117',
    cursor: 'pointer', transition: 'all 0.15s ease'
  },
  chipActive: { borderColor: '#6366f1', color: '#6366f1', backgroundColor: '#1e1b4b' },
  divider: { border: 'none', borderTop: '1px solid #2a2d3e', margin: '24px 0' },
  configPanel: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px', marginBottom: '16px'
  },
  configTitle: { fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' },
  configDesc: { fontSize: '12px', color: '#6b7280', marginBottom: '16px' },
  configRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' },
  configLabel: { fontSize: '12px', color: '#9ca3af', width: '140px', flexShrink: 0 },
  input: {
    flex: 1, padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px'
  },
  saveBtn: {
    padding: '10px 20px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', marginTop: '12px'
  },
  savedMsg: { fontSize: '12px', color: '#34d399', marginTop: '8px' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
  tag: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', padding: '3px 8px', fontSize: '12px', color: '#e0e0e0'
  },
  tagRemove: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '14px', lineHeight: '1', padding: '0'
  },
  addRow: { display: 'flex', gap: '8px', marginTop: '8px' },
  addInput: {
    flex: 1, padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px'
  },
  addBtn: {
    padding: '8px 14px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
  }
};

// =============================================
// ASSET TYPES TAB
// =============================================
function AssetTypesTab({ config, onConfigUpdate }) {
  const [savedMsg, setSavedMsg] = useState('');
  const assetTypes = config.assetTypes || {};
  const modulePool = config.modulePool || {};
  const allProcessingIds = (asset) => 
    asset.availableProcessingModules || Object.keys(modulePool.processing || {});
  const allAuditIds = (asset) => 
    asset.availableAuditModules || Object.keys(modulePool.audit || {});

  function handleToggleAsset(assetId) {
    const updated = {
      ...config,
      assetTypes: {
        ...assetTypes,
        [assetId]: {
          ...assetTypes[assetId],
          enabled: !assetTypes[assetId].enabled
        }
      }
    };
    onConfigUpdate(updated);
  }

  function handleToggleModule(assetId, moduleId, type) {
    const asset = assetTypes[assetId];
    const field = type === 'processing' ? 'selectedProcessingModules' : 'selectedAuditModules';
    const current = asset[field] || [];
    const updated = current.includes(moduleId)
      ? current.filter(m => m !== moduleId)
      : [...current, moduleId];

    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [assetId]: { ...asset, [field]: updated }
      }
    });
    setSavedMsg('');
  }

  function handleSave() {
    onConfigUpdate(config);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div>
      <div style={STYLES.grid}>
        {Object.entries(assetTypes).map(([assetId, asset]) => (
          <div key={assetId} style={STYLES.card}>
            <div style={STYLES.cardHeader}>
              <span style={STYLES.cardTitle}>{asset.name}</span>
              <span style={{ ...STYLES.badge, ...(asset.enabled ? STYLES.badgeActive : STYLES.badgeInactive) }}>
                {asset.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={STYLES.cardDesc}>{asset.description}</p>

            <button
              style={{ ...STYLES.toggle, ...(asset.enabled ? STYLES.toggleActive : STYLES.toggleInactive) }}
              onClick={() => handleToggleAsset(assetId)}
            >
              {asset.enabled ? '⏸ Disable' : '▶ Enable'}
            </button>

            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '12px', marginBottom: '6px' }}>
              🔧 Processing Modules
            </div>
            <div style={STYLES.moduleChips}>
              {allProcessingIds(asset).map(moduleId => {
                const isSelected = (asset.selectedProcessingModules || []).includes(moduleId);
                return (
                  <span
                    key={moduleId}
                    style={{ ...STYLES.chip, ...(isSelected ? STYLES.chipActive : {}) }}
                    onClick={() => handleToggleModule(assetId, moduleId, 'processing')}
                  >
                    {modulePool.processing[moduleId]?.name || moduleId}
                  </span>
                );
              })}
            </div>

            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '12px', marginBottom: '6px' }}>
              🔍 Audit Modules
            </div>
            <div style={STYLES.moduleChips}>
              {allAuditIds(asset).map(moduleId => {
                const isSelected = (asset.selectedAuditModules || []).includes(moduleId);
                return (
                  <span
                    key={moduleId}
                    style={{ ...STYLES.chip, ...(isSelected ? STYLES.chipActive : {}) }}
                    onClick={() => handleToggleModule(assetId, moduleId, 'audit')}
                  >
                    {modulePool.audit[moduleId]?.name || moduleId}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Asset Configuration</button>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
    </div>
  );
}

// =============================================
// PROCESSING MODULES TAB
// =============================================
function ProcessingModulesTab({ config, onConfigUpdate }) {
  const [savedStates, setSavedStates] = useState({});
  const modules = config.modulePool?.processing || {};

  function handleToggleModule(moduleId) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        processing: {
          ...modules,
          [moduleId]: { ...modules[moduleId], enabled: !modules[moduleId].enabled }
        }
      }
    });
  }

  function handleMappingChange(moduleId, oldKey, field, value) {
    const mod = modules[moduleId];
    const entries = Object.entries(mod.config.mappings || {});
    const newMappings = {};
    entries.forEach(([k, v]) => {
      if (k === oldKey) {
        if (field === 'key') newMappings[value] = v;
        else newMappings[k] = value;
      } else {
        newMappings[k] = v;
      }
    });
    updateModuleConfig(moduleId, { ...mod.config, mappings: newMappings });
  }

  function handleAddMapping(moduleId, from, to) {
    if (!from.trim() || !to.trim()) return;
    const mod = modules[moduleId];
    const updated = { ...mod.config.mappings, [from.trim()]: to.trim() };
    updateModuleConfig(moduleId, { ...mod.config, mappings: updated });
  }

  function handleRemoveMapping(moduleId, key) {
    const mod = modules[moduleId];
    const updated = { ...mod.config.mappings };
    delete updated[key];
    updateModuleConfig(moduleId, { ...mod.config, mappings: updated });
  }

  function handleConfigFieldChange(moduleId, field, value) {
    const mod = modules[moduleId];
    updateModuleConfig(moduleId, { ...mod.config, [field]: value });
  }

  function handleListChange(moduleId, field, newList) {
    const mod = modules[moduleId];
    updateModuleConfig(moduleId, { ...mod.config, [field]: newList });
  }

  function updateModuleConfig(moduleId, newConfig) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        processing: {
          ...modules,
          [moduleId]: { ...modules[moduleId], config: newConfig }
        }
      }
    });
    setSavedStates(s => ({ ...s, [moduleId]: false }));
  }

  function handleSave(moduleId) {
    onConfigUpdate(config);
    setSavedStates(s => ({ ...s, [moduleId]: true }));
    setTimeout(() => setSavedStates(s => ({ ...s, [moduleId]: false })), 3000);
  }

  return (
    <div>
      {Object.entries(modules).map(([moduleId, mod]) => (
        <MappingModulePanel
          key={moduleId}
          moduleId={moduleId}
          mod={mod}
          onToggle={() => handleToggleModule(moduleId)}
          onMappingChange={(oldKey, field, value) => handleMappingChange(moduleId, oldKey, field, value)}
          onAddMapping={(from, to) => handleAddMapping(moduleId, from, to)}
          onRemoveMapping={(key) => handleRemoveMapping(moduleId, key)}
          onConfigFieldChange={(field, value) => handleConfigFieldChange(moduleId, field, value)}
          onListChange={(field, list) => handleListChange(moduleId, field, list)}
          onSave={() => handleSave(moduleId)}
          saved={savedStates[moduleId]}
          badgeStyle={STYLES.badgeProcessing}
        />
      ))}
    </div>
  );
}

// =============================================
// AUDIT MODULES TAB
// =============================================
function AuditModulesTab({ config, onConfigUpdate }) {
  const [savedStates, setSavedStates] = useState({});
  const modules = config.modulePool?.audit || {};

  function handleToggleModule(moduleId) {
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        audit: {
          ...modules,
          [moduleId]: { ...modules[moduleId], enabled: !modules[moduleId].enabled }
        }
      }
    });
  }

  function handleColumnMappingChange(moduleId, field, value) {
    const mod = modules[moduleId];
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        audit: {
          ...modules,
          [moduleId]: {
            ...mod,
            config: {
              ...mod.config,
              columnMapping: { ...mod.config.columnMapping, [field]: value }
            }
          }
        }
      }
    });
    setSavedStates(s => ({ ...s, [moduleId]: false }));
  }

  function handleListChange(moduleId, field, newList) {
    const mod = modules[moduleId];
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        audit: {
          ...modules,
          [moduleId]: {
            ...mod,
            config: { ...mod.config, [field]: newList }
          }
        }
      }
    });
  }

  function handleSave(moduleId) {
    onConfigUpdate(config);
    setSavedStates(s => ({ ...s, [moduleId]: true }));
    setTimeout(() => setSavedStates(s => ({ ...s, [moduleId]: false })), 3000);
  }

  return (
    <div>
      {Object.entries(modules).map(([moduleId, mod]) => (
        <AuditModulePanel
          key={moduleId}
          moduleId={moduleId}
          mod={mod}
          onToggle={() => handleToggleModule(moduleId)}
          onColumnMappingChange={(field, value) => handleColumnMappingChange(moduleId, field, value)}
          onListChange={(field, list) => handleListChange(moduleId, field, list)}
          onSave={() => handleSave(moduleId)}
          saved={savedStates[moduleId]}
        />
      ))}
    </div>
  );
}

// =============================================
// MAPPING MODULE PANEL (for processing modules)
// =============================================
function MappingModulePanel({
  moduleId, mod, onToggle, onMappingChange, onAddMapping,
  onRemoveMapping, onConfigFieldChange, onListChange, onSave, saved, badgeStyle
}) {
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newItem, setNewItem] = useState('');

  return (
    <div style={STYLES.configPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={STYLES.configTitle}>{mod.name}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ ...STYLES.badge, ...badgeStyle }}>Processing</span>
          <span style={{ ...STYLES.badge, ...(mod.enabled ? STYLES.badgeActive : STYLES.badgeInactive) }}>
            {mod.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            style={{ ...STYLES.toggle, ...(mod.enabled ? STYLES.toggleActive : STYLES.toggleInactive), width: 'auto', padding: '4px 12px', marginBottom: 0 }}
            onClick={onToggle}
          >
            {mod.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      <p style={STYLES.configDesc}>{mod.description}</p>

      {/* Site/Name Mappings */}
      {mod.config.mappings && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            Name Mappings
          </div>
          {Object.entries(mod.config.mappings).map(([from, to]) => (
            <div key={from} style={STYLES.configRow}>
              <input
                style={{ ...STYLES.input, flex: 1 }}
                defaultValue={from}
                onBlur={e => onMappingChange(from, 'key', e.target.value)}
              />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
              <input
                style={{ ...STYLES.input, flex: 1 }}
                defaultValue={to}
                onBlur={e => onMappingChange(from, 'value', e.target.value)}
              />
              <button style={STYLES.tagRemove} onClick={() => onRemoveMapping(from)}>×</button>
            </div>
          ))}
          <div style={STYLES.addRow}>
            <input style={STYLES.addInput} placeholder="Raw name..." value={newFrom} onChange={e => setNewFrom(e.target.value)} />
            <input style={STYLES.addInput} placeholder="Normalized name..." value={newTo} onChange={e => setNewTo(e.target.value)} />
            <button style={STYLES.addBtn} onClick={() => { onAddMapping(newFrom, newTo); setNewFrom(''); setNewTo(''); }}>+ Add</button>
          </div>
        </div>
      )}

      {/* Domain to strip */}
      {mod.config.domainToStrip !== undefined && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            Email Domain to Strip
          </div>
          <input
            style={STYLES.input}
            defaultValue={mod.config.domainToStrip}
            onBlur={e => onConfigFieldChange('domainToStrip', e.target.value)}
          />
        </div>
      )}

      {/* OS Categories */}
      {mod.config.categories && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            OS Categories
          </div>
          {Object.entries(mod.config.categories).map(([category, osName]) => (
            <div key={category} style={STYLES.configRow}>
              <span style={STYLES.configLabel}>{category}</span>
              <input
                style={STYLES.input}
                defaultValue={osName}
                onBlur={e => {
                  const updated = { ...mod.config.categories, [category]: e.target.value };
                  onConfigFieldChange('categories', updated);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Active/Flagged States */}
      {mod.config.activeStates && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            Active States
          </div>
          <div style={STYLES.tagContainer}>
            {mod.config.activeStates.map(state => (
              <div key={state} style={STYLES.tag}>
                <span>{state}</span>
                <button style={STYLES.tagRemove} onClick={() => onListChange('activeStates', mod.config.activeStates.filter(s => s !== state))}>×</button>
              </div>
            ))}
          </div>
          <div style={STYLES.addRow}>
            <input style={STYLES.addInput} placeholder="Add state..." value={newItem} onChange={e => setNewItem(e.target.value)} />
            <button style={STYLES.addBtn} onClick={() => { onListChange('activeStates', [...mod.config.activeStates, newItem]); setNewItem(''); }}>+ Add</button>
          </div>
        </div>
      )}

      <button style={STYLES.saveBtn} onClick={onSave}>✓ Save</button>
      {saved && <div style={STYLES.savedMsg}>✓ Saved successfully</div>}
    </div>
  );
}

// =============================================
// AUDIT MODULE PANEL
// =============================================
function AuditModulePanel({ moduleId, mod, onToggle, onColumnMappingChange, onListChange, onSave, saved }) {
  const [newModel, setNewModel] = useState('');

  return (
    <div style={STYLES.configPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={STYLES.configTitle}>{mod.name}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ ...STYLES.badge, ...STYLES.badgeAudit }}>Audit</span>
          <span style={{ ...STYLES.badge, ...(mod.enabled ? STYLES.badgeActive : STYLES.badgeInactive) }}>
            {mod.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            style={{ ...STYLES.toggle, ...(mod.enabled ? STYLES.toggleActive : STYLES.toggleInactive), width: 'auto', padding: '4px 12px', marginBottom: 0 }}
            onClick={onToggle}
          >
            {mod.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      <p style={STYLES.configDesc}>{mod.description}</p>

      {/* Column Mappings */}
      {mod.config.columnMapping && Object.keys(mod.config.columnMapping).length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            Column Mappings
          </div>
          <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
            Map each field to the exact column header name in your CSV file.
          </div>
          {Object.entries(mod.config.columnMapping).map(([field, colName]) => (
            <div key={field} style={STYLES.configRow}>
              <span style={STYLES.configLabel}>{field}</span>
              <input
                style={STYLES.input}
                defaultValue={colName}
                onBlur={e => onColumnMappingChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Known Models list for outstandingModels module */}
      {mod.config.knownModels !== undefined && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            Known Models
          </div>
          <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
            Models in this list will not be flagged as outstanding.
          </div>
          <div style={STYLES.tagContainer}>
            {(mod.config.knownModels || []).length === 0 && (
              <span style={{ fontSize: '12px', color: '#4b5563' }}>None added yet.</span>
            )}
            {(mod.config.knownModels || []).map(model => (
              <div key={model} style={STYLES.tag}>
                <span>{model}</span>
                <button style={STYLES.tagRemove} onClick={() => onListChange('knownModels', mod.config.knownModels.filter(m => m !== model))}>×</button>
              </div>
            ))}
          </div>
          <div style={STYLES.addRow}>
            <input style={STYLES.addInput} placeholder="Add model name..." value={newModel} onChange={e => setNewModel(e.target.value)} />
            <button style={STYLES.addBtn} onClick={() => { onListChange('knownModels', [...(mod.config.knownModels || []), newModel]); setNewModel(''); }}>+ Add</button>
          </div>
        </div>
      )}

      <button style={STYLES.saveBtn} onClick={onSave}>✓ Save</button>
      {saved && <div style={STYLES.savedMsg}>✓ Saved successfully</div>}
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function ModuleManager({ config, onConfigUpdate }) {
  const [activeTab, setActiveTab] = useState('assets');

  const tabs = [
    { id: 'assets', label: '📦 Asset Types' },
    { id: 'processing', label: '🔧 Processing Modules' },
    { id: 'audit', label: '🔍 Audit Modules' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Module Manager</h2>
      <p style={STYLES.subtitle}>
        Configure asset types and manage the audit module pool.
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

      {activeTab === 'assets' && (
        <AssetTypesTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'processing' && (
        <ProcessingModulesTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'audit' && (
        <AuditModulesTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
    </div>
  );
}