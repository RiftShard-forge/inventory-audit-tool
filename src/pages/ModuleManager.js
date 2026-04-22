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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '20px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#ffffff' },
  cardDesc: { fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' },
  badge: { fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid' },
  badgeActive: { color: '#34d399', borderColor: '#064e3b', backgroundColor: '#0f1f17' },
  badgeInactive: { color: '#9ca3af', borderColor: '#374151', backgroundColor: '#1f2937' },
  badgeAudit: { color: '#a78bfa', borderColor: '#3730a3', backgroundColor: '#1e1b4b' },
  toggle: {
    width: '100%', padding: '9px', borderRadius: '8px',
    border: '1px solid', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.15s ease', marginBottom: '8px'
  },
  toggleActive: { backgroundColor: '#1f1f35', borderColor: '#7f1d1d', color: '#fca5a5' },
  toggleInactive: { backgroundColor: '#0f1f17', borderColor: '#064e3b', color: '#34d399' },
  moduleChips: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  chip: {
    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
    border: '1px solid #2a2d3e', color: '#9ca3af', backgroundColor: '#0f1117',
    cursor: 'pointer', transition: 'all 0.15s ease'
  },
  chipActive: { borderColor: '#6366f1', color: '#6366f1', backgroundColor: '#1e1b4b' },
  chipProcessing: { borderColor: '#0c4a6e', color: '#38bdf8', backgroundColor: '#0c1a2e' },
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
  select: {
    flex: 1, padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px', cursor: 'pointer'
  },
  operatorSelect: {
    width: '130px', padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#6366f1', fontSize: '13px', cursor: 'pointer', flexShrink: 0
  },
  saveBtn: {
    padding: '10px 20px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', marginTop: '12px'
  },
  addBtn: {
    padding: '10px 20px', backgroundColor: '#1a1d27', color: '#6366f1',
    border: '1px solid #6366f1', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', marginTop: '16px'
  },
  dangerBtn: {
    padding: '6px 12px', backgroundColor: '#1f1315', color: '#fca5a5',
    border: '1px solid #7f1d1d', borderRadius: '6px', fontSize: '12px',
    cursor: 'pointer'
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
  addBtnSmall: {
    padding: '8px 14px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
  },
  editInput: {
    padding: '6px 10px', backgroundColor: '#0f1117',
    border: '1px solid #6366f1', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px', width: '100%', marginBottom: '8px'
  },
  infoBox: {
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '12px', marginBottom: '16px',
    fontSize: '12px', color: '#6b7280', lineHeight: '1.6'
  }
};

const OPERATORS = ['equals', 'is not', 'contains', 'starts with', 'ends with'];

// =============================================
// HELPER: Discoverable text input with dropdown
// =============================================
function DiscoverableInput({ value, onChange, headers, placeholder }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const filtered = headers.filter(h =>
    h.toLowerCase().includes((value || '').toLowerCase()) && h !== value
  );

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        style={STYLES.input}
        value={value || ''}
        onChange={e => { onChange(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder || 'Column name...'}
      />
      {showDropdown && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
          borderRadius: '6px', zIndex: 100, maxHeight: '160px', overflowY: 'auto'
        }}>
          {filtered.map(h => (
            <div
              key={h}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '12px',
                color: '#e0e0e0', borderBottom: '1px solid #2a2d3e'
              }}
              onMouseDown={() => { onChange(h); setShowDropdown(false); }}
            >
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// TAG LIST INPUT
// =============================================
function TagListInput({ label, description, items, onChange }) {
  const [inputVal, setInputVal] = useState('');

  function handleAdd() {
    const trimmed = inputVal.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputVal('');
    }
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>{label}</div>
      <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px' }}>{description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
        {(items || []).length === 0 && <span style={{ fontSize: '11px', color: '#4b5563' }}>None added.</span>}
        {(items || []).map(item => (
          <div key={item} style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
            borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#e0e0e0'
          }}>
            <span>{item}</span>
            <button
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '12px', padding: '0' }}
              onClick={() => onChange(items.filter(i => i !== item))}
            >×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          style={{ flex: 1, padding: '6px 10px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '6px', color: '#e0e0e0', fontSize: '11px' }}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add serial number..."
        />
        <button style={STYLES.addBtnSmall} onClick={handleAdd}>+ Add</button>
      </div>
    </div>
  );
}

// =============================================
// ASSET TYPES TAB
// =============================================
function AssetTypesTab({ config, onConfigUpdate }) {
  const [savedMsg, setSavedMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const assetTypes = config.assetTypes || {};
  const modulePool = config.modulePool || {};
  const allProcessingIds = Object.keys(modulePool.processing || {});
  const allAuditIds = Object.keys(modulePool.audit || {});

  function handleToggleAsset(assetId) {
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [assetId]: { ...assetTypes[assetId], enabled: !assetTypes[assetId].enabled }
      }
    });
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
      assetTypes: { ...assetTypes, [assetId]: { ...asset, [field]: updated } }
    });
  }

  function handleListChange(assetId, listName, newItems) {
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [assetId]: { ...assetTypes[assetId], [listName]: newItems }
      }
    });
  }

  function handleStartEdit(assetId) {
    setEditingId(assetId);
    setEditName(assetTypes[assetId].name);
    setEditDesc(assetTypes[assetId].description || '');
  }

  function handleSaveEdit(assetId) {
    if (!editName.trim()) return;
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [assetId]: { ...assetTypes[assetId], name: editName.trim(), description: editDesc.trim() }
      }
    });
    setEditingId(null);
  }

  function handleDelete(assetId) {
    const updated = { ...assetTypes };
    delete updated[assetId];
    onConfigUpdate({ ...config, assetTypes: updated });
  }

  function handleAddAsset() {
    if (!newName.trim()) return;
    const newId = newName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [newId]: {
          id: newId,
          name: newName.trim(),
          description: newDesc.trim(),
          enabled: true,
          selectedProcessingModules: [],
          selectedAuditModules: [],
          availableProcessingModules: allProcessingIds,
          availableAuditModules: allAuditIds,
          whitelist: [],
          blacklist: []
        }
      }
    });
    setNewName('');
    setNewDesc('');
    setShowAddForm(false);
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
              {editingId === assetId ? (
                <div style={{ flex: 1, marginRight: '8px' }}>
                  <input
                    style={STYLES.editInput}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Asset type name..."
                  />
                  <input
                    style={STYLES.editInput}
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Description..."
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={STYLES.addBtnSmall} onClick={() => handleSaveEdit(assetId)}>✓ Save</button>
                    <button style={{ ...STYLES.addBtnSmall, backgroundColor: '#374151' }} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span style={STYLES.cardTitle}>{asset.name}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ ...STYLES.badge, ...(asset.enabled ? STYLES.badgeActive : STYLES.badgeInactive) }}>
                      {asset.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px' }}
                      onClick={() => handleStartEdit(assetId)}
                      title="Edit"
                    >✏</button>
                    <button
                      style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }}
                      onClick={() => handleDelete(assetId)}
                      title="Delete"
                    >×</button>
                  </div>
                </>
              )}
            </div>

            {editingId !== assetId && (
              <>
                <p style={STYLES.cardDesc}>{asset.description}</p>
                <button
                  style={{ ...STYLES.toggle, ...(asset.enabled ? STYLES.toggleActive : STYLES.toggleInactive) }}
                  onClick={() => handleToggleAsset(assetId)}
                >
                  {asset.enabled ? '⏸ Disable' : '▶ Enable'}
                </button>

                <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '12px', marginBottom: '6px' }}>
                  🔧 Processing Modules
                </div>
                <div style={STYLES.moduleChips}>
                  {allProcessingIds.map(moduleId => {
                    const isSelected = (asset.selectedProcessingModules || []).includes(moduleId);
                    return (
                      <span
                        key={moduleId}
                        style={{ ...STYLES.chip, ...(isSelected ? STYLES.chipProcessing : {}) }}
                        onClick={() => handleToggleModule(assetId, moduleId, 'processing')}
                      >
                        {modulePool.processing[moduleId]?.name || moduleId}
                      </span>
                    );
                  })}
                </div>

                <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '12px', marginBottom: '6px' }}>
                  🔍 Audit Modules
                </div>
                <div style={STYLES.moduleChips}>
                  {allAuditIds.map(moduleId => {
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

                <hr style={{ border: 'none', borderTop: '1px solid #2a2d3e', margin: '16px 0' }} />

                <TagListInput
                  label="✓ Whitelist (Serial Numbers)"
                  description="Always marked clean — skip all audit checks"
                  items={asset.whitelist || []}
                  onChange={items => handleListChange(assetId, 'whitelist', items)}
                />
                <TagListInput
                  label="✕ Blacklist (Serial Numbers)"
                  description="Suppressed from audit — flagged separately"
                  items={asset.blacklist || []}
                  onChange={items => handleListChange(assetId, 'blacklist', items)}
                />
              </>
            )}
          </div>
        ))}

        {/* Add New Asset Type Card */}
        {showAddForm ? (
          <div style={STYLES.card}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
              New Asset Type
            </div>
            <input
              style={STYLES.editInput}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Asset type name (e.g. Laptops)..."
            />
            <input
              style={STYLES.editInput}
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Description..."
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={STYLES.addBtnSmall} onClick={handleAddAsset}>✓ Create</button>
              <button
                style={{ ...STYLES.addBtnSmall, backgroundColor: '#374151' }}
                onClick={() => { setShowAddForm(false); setNewName(''); setNewDesc(''); }}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <div
            style={{
              ...STYLES.card, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', minHeight: '120px',
              border: '2px dashed #2a2d3e', backgroundColor: 'transparent'
            }}
            onClick={() => setShowAddForm(true)}
          >
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>+</div>
              <div style={{ fontSize: '13px' }}>Add Asset Type</div>
            </div>
          </div>
        )}
      </div>

      <button style={{ ...STYLES.saveBtn, marginTop: '24px' }} onClick={handleSave}>
        ✓ Save Asset Configuration
      </button>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
    </div>
  );
}

// =============================================
// AUDIT MODULES TAB
// =============================================
function AuditModulesTab({ config, onConfigUpdate, detectedHeaders }) {
  const [savedStates, setSavedStates] = useState({});
  const modules = config.modulePool?.audit || {};
  const meHeaders = detectedHeaders?.meData || [];
  const rosterHeaders = detectedHeaders?.rosterData || [];
  const allHeaders = [...new Set([...meHeaders, ...rosterHeaders])];

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

  function handleOperatorChange(moduleId, field, value) {
    const mod = modules[moduleId];
    const operators = mod.config.operators || {};
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        audit: {
          ...modules,
          [moduleId]: {
            ...mod,
            config: { ...mod.config, operators: { ...operators, [field]: value } }
          }
        }
      }
    });
  }

  function handleListChange(moduleId, field, newList) {
    const mod = modules[moduleId];
    onConfigUpdate({
      ...config,
      modulePool: {
        ...config.modulePool,
        audit: {
          ...modules,
          [moduleId]: { ...mod, config: { ...mod.config, [field]: newList } }
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
      {meHeaders.length === 0 && (
        <div style={STYLES.infoBox}>
          💡 Run an audit first to detect your CSV column headers. Once detected, column fields below will show autocomplete suggestions from your actual data.
        </div>
      )}

      {Object.entries(modules).map(([moduleId, mod]) => {
        const columnMapping = mod.config.columnMapping || {};
        const operators = mod.config.operators || {};
        const knownModels = mod.config.knownModels;

        return (
          <div key={moduleId} style={STYLES.configPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <div style={STYLES.configTitle}>{mod.name}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ ...STYLES.badge, ...STYLES.badgeAudit }}>Audit</span>
                <span style={{ ...STYLES.badge, ...(mod.enabled ? STYLES.badgeActive : STYLES.badgeInactive) }}>
                  {mod.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  style={{ ...STYLES.toggle, ...(mod.enabled ? STYLES.toggleActive : STYLES.toggleInactive), width: 'auto', padding: '4px 12px', marginBottom: 0 }}
                  onClick={() => handleToggleModule(moduleId)}
                >
                  {mod.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            <p style={STYLES.configDesc}>{mod.description}</p>

            {/* Column Mappings with operator */}
            {Object.keys(columnMapping).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px', fontWeight: '500' }}>
                  Column Mappings
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '10px' }}>
                  Map each field to a column in your CSV. Start typing to see detected headers.
                </div>
                {Object.entries(columnMapping).map(([field, colName]) => (
                  <div key={field} style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{field}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <DiscoverableInput
                        value={colName}
                        onChange={val => handleColumnMappingChange(moduleId, field, val)}
                        headers={meHeaders.length > 0 ? meHeaders : allHeaders}
                        placeholder={`Column for ${field}...`}
                      />
                      <select
                        style={STYLES.operatorSelect}
                        value={operators[field] || 'equals'}
                        onChange={e => handleOperatorChange(moduleId, field, e.target.value)}
                      >
                        {OPERATORS.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                      <DiscoverableInput
                        value={operators[`${field}_value`] || ''}
                        onChange={val => handleOperatorChange(moduleId, `${field}_value`, val)}
                        headers={rosterHeaders.length > 0 ? rosterHeaders : allHeaders}
                        placeholder="Compare to..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Known Models */}
            {knownModels !== undefined && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
                  Known Models
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
                  Models in this list will not be flagged as outstanding.
                </div>
                <div style={STYLES.tagContainer}>
                  {(knownModels || []).length === 0 && (
                    <span style={{ fontSize: '12px', color: '#4b5563' }}>None added yet.</span>
                  )}
                  {(knownModels || []).map(model => (
                    <div key={model} style={STYLES.tag}>
                      <span>{model}</span>
                      <button style={STYLES.tagRemove} onClick={() => handleListChange(moduleId, 'knownModels', knownModels.filter(m => m !== model))}>×</button>
                    </div>
                  ))}
                </div>
                <div style={STYLES.addRow}>
                  <input
                    style={STYLES.addInput}
                    placeholder="Add model name..."
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleListChange(moduleId, 'knownModels', [...knownModels, e.target.value.trim()]);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <button style={STYLES.saveBtn} onClick={() => handleSave(moduleId)}>✓ Save</button>
            {savedStates[moduleId] && <div style={STYLES.savedMsg}>✓ Saved successfully</div>}
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function ModuleManager({ config, onConfigUpdate, detectedHeaders }) {
  const [activeTab, setActiveTab] = useState('assets');

  const tabs = [
    { id: 'assets', label: '📦 Asset Types' },
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
      {activeTab === 'audit' && (
        <AuditModulesTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />
      )}
    </div>
  );
}