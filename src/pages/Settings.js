// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import React, { useState, useEffect } from 'react';
import { resetConfig, exportConfig, importConfig, addToCategoryHistory, addToStepHistory, loadLibrary, deleteFromRuleHistory, deleteFromCategoryHistory, deleteFromStepHistory } from '../config/configManager';

const STYLES = {
  page: { maxWidth: '900px' },
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
  sectionDesc: { fontSize: '12px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' },
  input: {
    padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px', width: '100%'
  },
  select: {
    padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px', cursor: 'pointer', width: '100%'
  },
  row: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' },
  label: { fontSize: '12px', color: '#9ca3af', width: '120px', flexShrink: 0 },
  addBtn: {
    padding: '9px 16px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
  },
  saveBtn: {
    padding: '10px 24px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer', marginTop: '16px'
  },
  removeBtn: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '18px', lineHeight: '1', padding: '4px'
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
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    borderRadius: '20px', padding: '4px 12px', fontSize: '12px', margin: '4px',
    border: '1px solid'
  },
  stepCard: {
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '16px', marginBottom: '12px'
  },
  stepHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px'
  },
  stepTitle: { fontSize: '14px', fontWeight: '500', color: '#ffffff' },
  stepType: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
    backgroundColor: '#1e1b4b', border: '1px solid #3730a3', color: '#a78bfa'
  },
  mapRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  mapInput: {
    flex: 1, padding: '7px 10px', backgroundColor: '#1a1d27',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '12px'
  },
  addCard: {
    border: '2px dashed #2a2d3e', borderRadius: '8px', padding: '20px',
    textAlign: 'center', cursor: 'pointer', color: '#6b7280',
    fontSize: '13px', marginTop: '8px'
  },
  infoBox: {
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '12px', marginBottom: '16px',
    fontSize: '12px', color: '#6b7280', lineHeight: '1.6'
  }
};

const STEP_TYPES = [
  { value: 'mapValue', label: 'Map Value', desc: 'Replace specific values in a column with normalized values (e.g. "Base Site" → "Santo Domingo Office")' },
  { value: 'stripText', label: 'Strip Text', desc: 'Remove a substring from all values in a column (e.g. strip "@company.co" from emails)' },
  { value: 'tagByValue', label: 'Tag by Value', desc: 'Add a new tag column based on the value of another column (e.g. tag rows by OS type)' }
];

// =============================================
// PROCESSING STEP CARD
// =============================================
function ProcessingStepCard({ step, onUpdate, onRemove, detectedHeaders }) {
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newTagVal, setNewTagVal] = useState('');
  const [newTagLabel, setNewTagLabel] = useState('');

  const headers = detectedHeaders ? Object.values(detectedHeaders).flat() : [];

  function update(changes) { onUpdate({ ...step, ...changes }); }
  function updateConfig(changes) { onUpdate({ ...step, config: { ...step.config, ...changes } }); }

  function addMapping() {
    if (!newFrom.trim() || !newTo.trim()) return;
    updateConfig({ mappings: { ...step.config.mappings, [newFrom.trim()]: newTo.trim() } });
    setNewFrom(''); setNewTo('');
  }

  function removeMapping(key) {
    const updated = { ...step.config.mappings };
    delete updated[key];
    updateConfig({ mappings: updated });
  }

  function addTag() {
    if (!newTagVal.trim() || !newTagLabel.trim()) return;
    updateConfig({ valueTags: { ...step.config.valueTags, [newTagVal.trim()]: newTagLabel.trim() } });
    setNewTagVal(''); setNewTagLabel('');
  }

  function removeTag(key) {
    const updated = { ...step.config.valueTags };
    delete updated[key];
    updateConfig({ valueTags: updated });
  }

  return (
    <div style={STYLES.stepCard}>
      <div style={STYLES.stepHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={STYLES.stepTitle}>{step.name || 'Unnamed Step'}</span>
          <span style={STYLES.stepType}>
            {STEP_TYPES.find(t => t.value === step.type)?.label || step.type}
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            backgroundColor: step.enabled ? '#0f1f17' : '#1f2937',
            border: `1px solid ${step.enabled ? '#064e3b' : '#374151'}`,
            color: step.enabled ? '#34d399' : '#9ca3af', cursor: 'pointer'
          }} onClick={() => update({ enabled: !step.enabled })}>
            {step.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <button style={STYLES.removeBtn} onClick={onRemove}>×</button>
      </div>

      <div style={STYLES.row}>
        <span style={STYLES.label}>Step name</span>
        <input style={STYLES.input} value={step.name || ''} onChange={e => update({ name: e.target.value })} placeholder="e.g. Normalize site names" />
      </div>
      <div style={STYLES.row}>
        <span style={STYLES.label}>Apply to column</span>
        <input style={STYLES.input} value={step.columnName || ''} onChange={e => update({ columnName: e.target.value })} placeholder="Header name from your CSV..." list={`headers-${step.id}`} />
        <datalist id={`headers-${step.id}`}>{headers.map(h => <option key={h} value={h} />)}</datalist>
      </div>
      <div style={STYLES.row}>
        <span style={STYLES.label}>Run order</span>
        <input style={{ ...STYLES.input, width: '80px', flex: 'none' }} type="number" min="1" value={step.order || 1} onChange={e => update({ order: parseInt(e.target.value) || 1 })} />
        <span style={{ fontSize: '12px', color: '#4b5563' }}>Lower number runs first</span>
      </div>

      {step.type === 'mapValue' && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>Value Mappings</div>
          <div style={STYLES.infoBox}>Define what values should be replaced. Left = raw value in CSV, Right = normalized value.</div>
          {Object.entries(step.config.mappings || {}).map(([from, to]) => (
            <div key={from} style={STYLES.mapRow}>
              <input style={STYLES.mapInput} defaultValue={from} readOnly />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
              <input style={STYLES.mapInput} defaultValue={to} readOnly />
              <button style={STYLES.removeBtn} onClick={() => removeMapping(from)}>×</button>
            </div>
          ))}
          <div style={STYLES.mapRow}>
            <input style={STYLES.mapInput} placeholder="Raw value..." value={newFrom} onChange={e => setNewFrom(e.target.value)} />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
            <input style={STYLES.mapInput} placeholder="Normalized value..." value={newTo} onChange={e => setNewTo(e.target.value)} />
            <button style={STYLES.addBtn} onClick={addMapping}>+ Add</button>
          </div>
        </div>
      )}

      {step.type === 'stripText' && (
        <div style={{ marginTop: '12px' }}>
          <div style={STYLES.row}>
            <span style={STYLES.label}>Text to strip</span>
            <input style={STYLES.input} value={step.config.textToStrip || ''} onChange={e => updateConfig({ textToStrip: e.target.value })} placeholder="e.g. @company.co" />
          </div>
        </div>
      )}

      {step.type === 'tagByValue' && (
        <div style={{ marginTop: '12px' }}>
          <div style={STYLES.row}>
            <span style={STYLES.label}>Tag column name</span>
            <input style={STYLES.input} value={step.config.tagColumn || ''} onChange={e => updateConfig({ tagColumn: e.target.value })} placeholder="e.g. _osCategory" />
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500', marginTop: '8px' }}>Value → Tag Mappings</div>
          {Object.entries(step.config.valueTags || {}).map(([val, tag]) => (
            <div key={val} style={STYLES.mapRow}>
              <input style={STYLES.mapInput} defaultValue={val} readOnly />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
              <input style={STYLES.mapInput} defaultValue={tag} readOnly />
              <button style={STYLES.removeBtn} onClick={() => removeTag(val)}>×</button>
            </div>
          ))}
          <div style={STYLES.mapRow}>
            <input style={STYLES.mapInput} placeholder="Column value..." value={newTagVal} onChange={e => setNewTagVal(e.target.value)} />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
            <input style={STYLES.mapInput} placeholder="Tag label..." value={newTagLabel} onChange={e => setNewTagLabel(e.target.value)} />
            <button style={STYLES.addBtn} onClick={addTag}>+ Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// PROCESSING TAB
// =============================================
function ProcessingTab({ config, onConfigUpdate, detectedHeaders }) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [collapsedSteps, setCollapsedSteps] = useState({});
  const [checkedSteps, setCheckedSteps] = useState([]);
  const steps = config.processingSteps || [];

  function handleToggleCheck(stepId) {
    setCheckedSteps(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  }

  function handleSaveToLibrary() {
    const toSave = steps.filter(s => checkedSteps.includes(s.id) && s.name);
    if (toSave.length === 0) {
      setSavedMsg('⚠ No steps selected. Check the boxes next to steps you want to save.');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    toSave.forEach(step => addToStepHistory(step));
    setSavedMsg(`✓ ${toSave.length} step(s) saved to library`);
    setCheckedSteps([]);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleAddStep(type) {
    const id = `step_${Date.now()}`;
    const stepConfig = type === 'mapValue' ? { mappings: {} } : type === 'stripText' ? { textToStrip: '' } : { tagColumn: '_tag', valueTags: {} };
    onConfigUpdate({ ...config, processingSteps: [...steps, { id, name: '', type, columnName: '', enabled: true, order: steps.length + 1, config: stepConfig }] });
    setShowTypeSelector(false);
    setSaved(false);
  }

  function handleUpdateStep(stepId, updatedStep) {
    onConfigUpdate({ ...config, processingSteps: steps.map(s => s.id === stepId ? updatedStep : s) });
    setSaved(false);
  }

  function handleRemoveStep(stepId) {
    onConfigUpdate({ ...config, processingSteps: steps.filter(s => s.id !== stepId) });
    setCheckedSteps(prev => prev.filter(id => id !== stepId));
    setSaved(false);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div style={STYLES.infoBox}>
        💡 Processing steps run before audit rules to clean and normalize your data.
        Steps run in the order number you assign. Lower = runs first.
        Each asset type selects which steps apply to it in Module Manager.
      </div>

      {steps.length === 0 && (
        <div style={{ ...STYLES.section, textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔧</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>No processing steps defined yet</div>
          <div style={{ fontSize: '13px' }}>Add a step to normalize your data before auditing.</div>
        </div>
      )}

      {steps.sort((a, b) => (a.order || 0) - (b.order || 0)).map(step => (
        <div key={step.id}>
          {collapsedSteps[step.id] ? (
            <div style={{
              backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={checkedSteps.includes(step.id)} onChange={() => handleToggleCheck(step.id)} style={{ cursor: 'pointer', accentColor: '#6366f1' }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff' }}>{step.name || 'Unnamed Step'}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1e1b4b', border: '1px solid #3730a3', color: '#a78bfa' }}>
                  {STEP_TYPES.find(t => t.value === step.type)?.label || step.type}
                </span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: step.enabled ? '#0f1f17' : '#1f2937', border: `1px solid ${step.enabled ? '#064e3b' : '#374151'}`, color: step.enabled ? '#34d399' : '#9ca3af' }}>
                  {step.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <span style={{ fontSize: '11px', color: '#4b5563' }}>Order: {step.order || 1} · {step.columnName || 'No header set'}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button style={{ background: 'none', border: '1px solid #2a2d3e', color: '#6b7280', cursor: 'pointer', fontSize: '11px', borderRadius: '4px', padding: '3px 8px' }}
                  onClick={() => setCollapsedSteps(prev => ({ ...prev, [step.id]: false }))}>▼ Expand</button>
                <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleRemoveStep(step.id)}>×</button>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={checkedSteps.includes(step.id)} onChange={() => handleToggleCheck(step.id)} style={{ cursor: 'pointer', accentColor: '#6366f1' }} />
                <button style={{ background: 'none', border: '1px solid #2a2d3e', color: '#6b7280', cursor: 'pointer', fontSize: '11px', borderRadius: '4px', padding: '3px 8px' }}
                  onClick={() => setCollapsedSteps(prev => ({ ...prev, [step.id]: true }))}>▲ Collapse</button>
              </div>
              <ProcessingStepCard step={step} onUpdate={updated => handleUpdateStep(step.id, updated)} onRemove={() => handleRemoveStep(step.id)} detectedHeaders={detectedHeaders} />
            </div>
          )}
        </div>
      ))}

      {showTypeSelector ? (
        <div style={STYLES.section}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '16px' }}>Select step type:</div>
          {STEP_TYPES.map(type => (
            <div key={type.value} style={{ padding: '14px 16px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => handleAddStep(type.value)}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>{type.label}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{type.desc}</div>
            </div>
          ))}
          <button style={{ ...STYLES.saveBtn, backgroundColor: '#374151', marginTop: '8px' }} onClick={() => setShowTypeSelector(false)}>Cancel</button>
        </div>
      ) : (
        <div style={STYLES.addCard} onClick={() => setShowTypeSelector(true)}>+ Add Processing Step</div>
      )}

      {steps.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Processing Steps</button>
            <button style={{ ...STYLES.saveBtn, backgroundColor: '#0c1a2e', border: '1px solid #0c4a6e', color: '#38bdf8' }} onClick={handleSaveToLibrary}>★ Save checked to Library</button>
          </div>
          {saved && <div style={STYLES.savedMsg}>✓ Saved successfully.</div>}
          {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
        </>
      )}
    </div>
  );
}

// =============================================
// CATEGORIES TAB
// =============================================
function CategoriesTab({ config, onConfigUpdate }) {
  const [newCategory, setNewCategory] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [checkedCategories, setCheckedCategories] = useState([]);
  const categories = config.auditCategories || [];

  function handleAdd() {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    onConfigUpdate({ ...config, auditCategories: [...categories, trimmed] });
    setNewCategory('');
  }

  function handleRemove(cat) {
    onConfigUpdate({ ...config, auditCategories: categories.filter(c => c !== cat) });
    setCheckedCategories(prev => prev.filter(c => c !== cat));
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleToggleCheck(cat) {
    setCheckedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function handleSaveToLibrary() {
    if (checkedCategories.length === 0) {
      setSavedMsg('⚠ No categories selected. Check the boxes next to categories you want to save.');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    checkedCategories.forEach(cat => addToCategoryHistory(cat));
    setSavedMsg(`✓ ${checkedCategories.length} category(ies) saved to library`);
    setCheckedCategories([]);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>Audit Categories</div>
      <p style={STYLES.sectionDesc}>
        Define categories for your audit rules. Each category becomes a separate
        tab in your exported .xlsx report. Examples: Terminated, Unaccounted,
        State Conflict, Location Mismatch.
      </p>

      <div style={{ marginBottom: '16px', minHeight: '40px' }}>
        {categories.length === 0 && <p style={{ fontSize: '13px', color: '#4b5563' }}>No categories defined yet.</p>}
        {categories.map(cat => (
          <span key={cat} style={{
            ...STYLES.pill,
            backgroundColor: checkedCategories.includes(cat) ? '#0c1a2e' : '#1e1b4b',
            borderColor: checkedCategories.includes(cat) ? '#0c4a6e' : '#3730a3',
            color: checkedCategories.includes(cat) ? '#38bdf8' : '#a78bfa'
          }}>
            <input type="checkbox" checked={checkedCategories.includes(cat)} onChange={() => handleToggleCheck(cat)} style={{ cursor: 'pointer', accentColor: '#6366f1' }} />
            {cat}
            <button style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '14px', padding: '0' }} onClick={() => handleRemove(cat)}>×</button>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={{ ...STYLES.input, flex: 1 }} placeholder="New category name..." value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button style={STYLES.addBtn} onClick={handleAdd}>+ Add</button>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Categories</button>
        <button style={{ ...STYLES.saveBtn, backgroundColor: '#0c1a2e', border: '1px solid #0c4a6e', color: '#38bdf8' }} onClick={handleSaveToLibrary}>★ Save checked to Library</button>
      </div>
      {saved && <div style={STYLES.savedMsg}>✓ Categories saved.</div>}
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
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
        Clears all saved settings — asset types, audit rules, processing steps,
        categories, and run history. Cannot be undone. Your library is preserved.
      </p>
      <button style={STYLES.dangerBtn} onClick={() => setShowConfirm(true)}>⚠ Reset All Settings</button>
      {showConfirm && (
        <div style={STYLES.confirmBox}>
          <p style={STYLES.confirmText}>Are you sure? This cannot be undone.</p>
          <div style={STYLES.confirmBtns}>
            <button style={STYLES.confirmYes} onClick={handleReset}>Yes, reset everything</button>
            <button style={STYLES.confirmNo} onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// CONFIG TAB
// =============================================
function ConfigTab({ config, onConfigUpdate }) {
  const [importMsg, setImportMsg] = useState('');
  const [importError, setImportError] = useState('');

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportMsg(''); setImportError('');
    try {
      const newConfig = await importConfig(file);
      onConfigUpdate(newConfig);
      setImportMsg('✓ Config imported successfully. All rules, categories and steps restored.');
    } catch (err) {
      setImportError(`⚠ ${err.message}`);
    }
    e.target.value = '';
  }

  return (
    <div style={STYLES.section}>
      <div style={STYLES.sectionTitle}>Configuration Backup</div>
      <p style={STYLES.sectionDesc}>
        Export your entire configuration (rules, categories, processing steps, asset types)
        to a .json file. Import it any time to restore everything in one click —
        useful after deployments or when setting up a new machine.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={STYLES.saveBtn} onClick={() => exportConfig(config)}>↓ Export Config</button>
        <label style={{ ...STYLES.saveBtn, backgroundColor: '#1a1d27', border: '1px solid #2a2d3e', color: '#e0e0e0', cursor: 'pointer', display: 'inline-block' }}>
          ↑ Import Config
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>
      {importMsg && <div style={{ ...STYLES.savedMsg, marginTop: '12px' }}>{importMsg}</div>}
      {importError && <div style={{ fontSize: '13px', color: '#fca5a5', marginTop: '12px' }}>{importError}</div>}
    </div>
  );
}

// =============================================
// LIBRARY TAB
// =============================================
function LibraryTab({ config, onConfigUpdate }) {
  const [library, setLibrary] = useState({ ruleHistory: [], categoryHistory: [], stepHistory: [] });
  const [savedMsg, setSavedMsg] = useState('');

  // Load library from its own separate localStorage key on mount
  useEffect(() => {
    setLibrary(loadLibrary());
  }, []);

  function handleRestoreRule(rule) {
    const restored = { ...rule, id: `rule_${Date.now()}` };
    onConfigUpdate({ ...config, auditRules: [...(config.auditRules || []), restored] });
    setSavedMsg(`✓ Rule "${rule.name}" restored to Audit Rules`);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleRestoreCategory(cat) {
    if ((config.auditCategories || []).includes(cat)) return;
    onConfigUpdate({ ...config, auditCategories: [...(config.auditCategories || []), cat] });
    setSavedMsg(`✓ Category "${cat}" restored`);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleRestoreStep(step) {
    const restored = { ...step, id: `step_${Date.now()}` };
    onConfigUpdate({ ...config, processingSteps: [...(config.processingSteps || []), restored] });
    setSavedMsg(`✓ Step "${step.name}" restored to Processing`);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleDeleteRule(name) {
    deleteFromRuleHistory(name);
    setLibrary(prev => ({ ...prev, ruleHistory: prev.ruleHistory.filter(r => r.name !== name) }));
  }

  function handleDeleteCategory(cat) {
    deleteFromCategoryHistory(cat);
    setLibrary(prev => ({ ...prev, categoryHistory: prev.categoryHistory.filter(c => c !== cat) }));
  }

  function handleDeleteStep(name) {
    deleteFromStepHistory(name);
    setLibrary(prev => ({ ...prev, stepHistory: prev.stepHistory.filter(s => s.name !== name) }));
  }

  const isEmpty = library.ruleHistory.length === 0 && library.categoryHistory.length === 0 && library.stepHistory.length === 0;

  return (
    <div>
      {isEmpty && (
        <div style={{ ...STYLES.section, textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>Your library is empty</div>
          <div style={{ fontSize: '13px' }}>Check the boxes next to rules, steps, or categories and click "★ Save checked to Library".</div>
        </div>
      )}

      {savedMsg && <div style={{ ...STYLES.savedMsg, marginBottom: '12px' }}>{savedMsg}</div>}

      {library.ruleHistory.length > 0 && (
        <div style={STYLES.section}>
          <div style={STYLES.sectionTitle}>🔍 Saved Rules</div>
          <p style={STYLES.sectionDesc}>Click Restore to add a rule back to the Audit Rules tab.</p>
          {library.ruleHistory.map((rule, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '6px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>{rule.name}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  Priority {rule.severity} · {rule.category || 'No category'} · {(rule.conditions || []).length} condition(s)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ ...STYLES.addBtn, padding: '5px 12px', fontSize: '12px' }} onClick={() => handleRestoreRule(rule)}>+ Restore</button>
                <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleDeleteRule(rule.name)}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {library.categoryHistory.length > 0 && (
        <div style={STYLES.section}>
          <div style={STYLES.sectionTitle}>🏷 Saved Categories</div>
          <p style={STYLES.sectionDesc}>Click + to restore a category to the active list.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {library.categoryHistory.map((cat, idx) => {
              const active = (config.auditCategories || []).includes(cat);
              return (
                <span key={idx} style={{ ...STYLES.pill, backgroundColor: active ? '#1f2937' : '#0c1a2e', borderColor: active ? '#374151' : '#0c4a6e', color: active ? '#6b7280' : '#38bdf8' }}>
                  <span style={{ cursor: active ? 'default' : 'pointer' }} onClick={() => handleRestoreCategory(cat)}>
                    {cat} {active ? '✓' : '+'}
                  </span>
                  <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '12px', padding: '0' }} onClick={() => handleDeleteCategory(cat)}>×</button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {library.stepHistory.length > 0 && (
        <div style={STYLES.section}>
          <div style={STYLES.sectionTitle}>🔧 Saved Processing Steps</div>
          <p style={STYLES.sectionDesc}>Click Restore to add a step back to Processing.</p>
          {library.stepHistory.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '6px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>{step.name || 'Unnamed Step'}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  {STEP_TYPES.find(t => t.value === step.type)?.label || step.type} · {step.columnName || 'No column'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ ...STYLES.addBtn, padding: '5px 12px', fontSize: '12px' }} onClick={() => handleRestoreStep(step)}>+ Restore</button>
                <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleDeleteStep(step.name)}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function Settings({ config, onConfigUpdate, detectedHeaders }) {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: '🏷 Categories' },
    { id: 'processing', label: '🔧 Processing' },
    { id: 'config', label: '💾 Config' },
    { id: 'library', label: '📚 Library' },
    { id: 'reset', label: '⚠ Reset' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Settings</h2>
      <p style={STYLES.subtitle}>Manage audit categories and configure data processing steps.</p>

      <div style={STYLES.tabs}>
        {tabs.map(tab => (
          <button key={tab.id} style={{ ...STYLES.tab, ...(activeTab === tab.id ? STYLES.tabActive : {}) }} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && <CategoriesTab config={config} onConfigUpdate={onConfigUpdate} />}
      {activeTab === 'processing' && <ProcessingTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />}
      {activeTab === 'config' && <ConfigTab config={config} onConfigUpdate={onConfigUpdate} />}
      {activeTab === 'library' && <LibraryTab config={config} onConfigUpdate={onConfigUpdate} />}
      {activeTab === 'reset' && <ResetTab />}
    </div>
  );
}