import React, { useState } from 'react';
import { resetConfig } from '../config/configManager';

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

  const headers = detectedHeaders
    ? Object.values(detectedHeaders).flat()
    : [];

  function update(changes) {
    onUpdate({ ...step, ...changes });
  }

  function updateConfig(changes) {
    onUpdate({ ...step, config: { ...step.config, ...changes } });
  }

  function addMapping() {
    if (!newFrom.trim() || !newTo.trim()) return;
    const updated = { ...step.config.mappings, [newFrom.trim()]: newTo.trim() };
    updateConfig({ mappings: updated });
    setNewFrom(''); setNewTo('');
  }

  function removeMapping(key) {
    const updated = { ...step.config.mappings };
    delete updated[key];
    updateConfig({ mappings: updated });
  }

  function addTag() {
    if (!newTagVal.trim() || !newTagLabel.trim()) return;
    const updated = { ...step.config.valueTags, [newTagVal.trim()]: newTagLabel.trim() };
    updateConfig({ valueTags: updated });
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
            color: step.enabled ? '#34d399' : '#9ca3af',
            cursor: 'pointer'
          }}
            onClick={() => update({ enabled: !step.enabled })}
          >
            {step.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <button style={STYLES.removeBtn} onClick={onRemove}>×</button>
      </div>

      {/* Step name */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Step name</span>
        <input
          style={STYLES.input}
          value={step.name || ''}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Normalize site names"
        />
      </div>

      {/* Column to apply to */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Apply to column</span>
        <input
          style={STYLES.input}
          value={step.columnName || ''}
          onChange={e => update({ columnName: e.target.value })}
          placeholder="Header name from your CSV..."
          list={`headers-${step.id}`}
        />
        <datalist id={`headers-${step.id}`}>
          {headers.map(h => <option key={h} value={h} />)}
        </datalist>
      </div>

      {/* Order */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Run order</span>
        <input
          style={{ ...STYLES.input, width: '80px', flex: 'none' }}
          type="number"
          min="1"
          value={step.order || 1}
          onChange={e => update({ order: parseInt(e.target.value) || 1 })}
        />
        <span style={{ fontSize: '12px', color: '#4b5563' }}>Lower number runs first</span>
      </div>

      {/* mapValue config */}
      {step.type === 'mapValue' && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500' }}>
            Value Mappings
          </div>
          <div style={STYLES.infoBox}>
            Define what values should be replaced. Left = raw value in CSV, Right = normalized value.
          </div>
          {Object.entries(step.config.mappings || {}).map(([from, to]) => (
            <div key={from} style={STYLES.mapRow}>
              <input style={STYLES.mapInput} defaultValue={from} readOnly />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
              <input style={STYLES.mapInput} defaultValue={to} readOnly />
              <button style={STYLES.removeBtn} onClick={() => removeMapping(from)}>×</button>
            </div>
          ))}
          <div style={STYLES.mapRow}>
            <input
              style={STYLES.mapInput}
              placeholder="Raw value..."
              value={newFrom}
              onChange={e => setNewFrom(e.target.value)}
              list={`headers-map-${step.id}`}
            />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
            <input
              style={STYLES.mapInput}
              placeholder="Normalized value..."
              value={newTo}
              onChange={e => setNewTo(e.target.value)}
            />
            <button style={STYLES.addBtn} onClick={addMapping}>+ Add</button>
          </div>
        </div>
      )}

      {/* stripText config */}
      {step.type === 'stripText' && (
        <div style={{ marginTop: '12px' }}>
          <div style={STYLES.row}>
            <span style={STYLES.label}>Text to strip</span>
            <input
              style={STYLES.input}
              value={step.config.textToStrip || ''}
              onChange={e => updateConfig({ textToStrip: e.target.value })}
              placeholder="e.g. @company.co"
            />
          </div>
        </div>
      )}

      {/* tagByValue config */}
      {step.type === 'tagByValue' && (
        <div style={{ marginTop: '12px' }}>
          <div style={STYLES.row}>
            <span style={STYLES.label}>Tag column name</span>
            <input
              style={STYLES.input}
              value={step.config.tagColumn || ''}
              onChange={e => updateConfig({ tagColumn: e.target.value })}
              placeholder="e.g. _osCategory"
            />
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '500', marginTop: '8px' }}>
            Value → Tag Mappings
          </div>
          {Object.entries(step.config.valueTags || {}).map(([val, tag]) => (
            <div key={val} style={STYLES.mapRow}>
              <input style={STYLES.mapInput} defaultValue={val} readOnly />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
              <input style={STYLES.mapInput} defaultValue={tag} readOnly />
              <button style={STYLES.removeBtn} onClick={() => removeTag(val)}>×</button>
            </div>
          ))}
          <div style={STYLES.mapRow}>
            <input
              style={STYLES.mapInput}
              placeholder="Column value..."
              value={newTagVal}
              onChange={e => setNewTagVal(e.target.value)}
            />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>→</span>
            <input
              style={STYLES.mapInput}
              placeholder="Tag label..."
              value={newTagLabel}
              onChange={e => setNewTagLabel(e.target.value)}
            />
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
  const steps = config.processingSteps || [];

  function handleAddStep(type) {
    const id = `step_${Date.now()}`;
    const defaultConfig = type === 'mapValue'
      ? { mappings: {} }
      : type === 'stripText'
        ? { textToStrip: '' }
        : { tagColumn: '_tag', valueTags: {} };

    const newStep = {
      id,
      name: '',
      type,
      columnName: '',
      enabled: true,
      order: steps.length + 1,
      config: defaultConfig
    };

    onConfigUpdate({ ...config, processingSteps: [...steps, newStep] });
    setShowTypeSelector(false);
    setSaved(false);
  }

  function handleUpdateStep(stepId, updatedStep) {
    onConfigUpdate({
      ...config,
      processingSteps: steps.map(s => s.id === stepId ? updatedStep : s)
    });
    setSaved(false);
  }

  function handleRemoveStep(stepId) {
    onConfigUpdate({
      ...config,
      processingSteps: steps.filter(s => s.id !== stepId)
    });
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
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
            No processing steps defined yet
          </div>
          <div style={{ fontSize: '13px' }}>
            Add a step to normalize your data before auditing.
            Examples: map site names, strip email domains, tag by OS type.
          </div>
        </div>
      )}

      {steps
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(step => (
          <ProcessingStepCard
            key={step.id}
            step={step}
            onUpdate={updated => handleUpdateStep(step.id, updated)}
            onRemove={() => handleRemoveStep(step.id)}
            detectedHeaders={detectedHeaders}
          />
        ))}

      {showTypeSelector ? (
        <div style={STYLES.section}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '16px' }}>
            Select step type:
          </div>
          {STEP_TYPES.map(type => (
            <div
              key={type.value}
              style={{
                padding: '14px 16px', backgroundColor: '#0f1117',
                border: '1px solid #2a2d3e', borderRadius: '8px',
                marginBottom: '8px', cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
              onClick={() => handleAddStep(type.value)}
            >
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>
                {type.label}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{type.desc}</div>
            </div>
          ))}
          <button
            style={{ ...STYLES.saveBtn, backgroundColor: '#374151', marginTop: '8px' }}
            onClick={() => setShowTypeSelector(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={STYLES.addCard} onClick={() => setShowTypeSelector(true)}>
          + Add Processing Step
        </div>
      )}

      {steps.length > 0 && (
        <>
          <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Processing Steps</button>
          {saved && <div style={STYLES.savedMsg}>✓ Saved successfully.</div>}
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
  const categories = config.auditCategories || [];

  function handleAdd() {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    onConfigUpdate({ ...config, auditCategories: [...categories, trimmed] });
    setNewCategory('');
    setSaved(false);
  }

  function handleRemove(cat) {
    onConfigUpdate({ ...config, auditCategories: categories.filter(c => c !== cat) });
  }

  function handleSave() {
    onConfigUpdate(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
        {categories.length === 0 && (
          <p style={{ fontSize: '13px', color: '#4b5563' }}>No categories defined yet.</p>
        )}
        {categories.map(cat => (
          <span key={cat} style={{
            ...STYLES.pill,
            backgroundColor: '#1e1b4b', borderColor: '#3730a3', color: '#a78bfa'
          }}>
            {cat}
            <button
              style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '14px', padding: '0' }}
              onClick={() => handleRemove(cat)}
            >×</button>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          style={{ ...STYLES.input, flex: 1 }}
          placeholder="New category name..."
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button style={STYLES.addBtn} onClick={handleAdd}>+ Add</button>
      </div>

      <button style={STYLES.saveBtn} onClick={handleSave}>✓ Save Categories</button>
      {saved && <div style={STYLES.savedMsg}>✓ Categories saved.</div>}
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
        categories, and run history. Cannot be undone.
      </p>
      <button style={STYLES.dangerBtn} onClick={() => setShowConfirm(true)}>
        ⚠ Reset All Settings
      </button>
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
// MAIN COMPONENT
// =============================================
export default function Settings({ config, onConfigUpdate, detectedHeaders }) {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: '🏷 Categories' },
    { id: 'processing', label: '🔧 Processing' },
    { id: 'reset', label: '⚠ Reset' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Settings</h2>
      <p style={STYLES.subtitle}>
        Manage audit categories and configure data processing steps.
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

      {activeTab === 'categories' && (
        <CategoriesTab config={config} onConfigUpdate={onConfigUpdate} />
      )}
      {activeTab === 'processing' && (
        <ProcessingTab
          config={config}
          onConfigUpdate={onConfigUpdate}
          detectedHeaders={detectedHeaders}
        />
      )}
      {activeTab === 'reset' && <ResetTab />}
    </div>
  );
}