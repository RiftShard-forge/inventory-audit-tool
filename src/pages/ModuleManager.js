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
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#ffffff' },
  cardDesc: { fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' },
  badge: { fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid' },
  badgeActive: { color: '#34d399', borderColor: '#064e3b', backgroundColor: '#0f1f17' },
  badgeInactive: { color: '#9ca3af', borderColor: '#374151', backgroundColor: '#1f2937' },
  toggle: {
    width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px'
  },
  toggleActive: { backgroundColor: '#1f1f35', borderColor: '#7f1d1d', color: '#fca5a5' },
  toggleInactive: { backgroundColor: '#0f1f17', borderColor: '#064e3b', color: '#34d399' },
  chip: {
    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
    border: '1px solid #2a2d3e', color: '#9ca3af', backgroundColor: '#0f1117',
    cursor: 'pointer', display: 'inline-block', margin: '3px'
  },
  chipActive: { borderColor: '#6366f1', color: '#6366f1', backgroundColor: '#1e1b4b' },
  chipProcessing: { borderColor: '#0c4a6e', color: '#38bdf8', backgroundColor: '#0c1a2e' },
  saveBtn: {
    padding: '10px 20px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', marginTop: '16px'
  },
  addBtnSmall: {
    padding: '6px 12px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
  },
  cancelBtnSmall: {
    padding: '6px 12px', backgroundColor: '#374151', color: '#e0e0e0',
    border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
  },
  editInput: {
    padding: '7px 10px', backgroundColor: '#0f1117', border: '1px solid #6366f1',
    borderRadius: '6px', color: '#e0e0e0', fontSize: '13px',
    width: '100%', marginBottom: '8px'
  },
  input: {
    padding: '8px 12px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', color: '#e0e0e0', fontSize: '13px', width: '100%'
  },
  select: {
    padding: '8px 12px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', color: '#e0e0e0', fontSize: '13px',
    cursor: 'pointer', width: '100%'
  },
  savedMsg: { fontSize: '12px', color: '#34d399', marginTop: '8px' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' },
  tag: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', padding: '3px 8px', fontSize: '11px', color: '#e0e0e0'
  },
  tagRemove: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '14px', lineHeight: '1', padding: '0'
  },
  addRow: { display: 'flex', gap: '8px', marginTop: '6px' },
  addInput: {
    flex: 1, padding: '7px 10px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '12px'
  },
  ruleCard: {
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '16px', marginBottom: '10px'
  },
  ruleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  ruleTitle: { fontSize: '13px', fontWeight: '500', color: '#ffffff' },
  row: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  label: { fontSize: '12px', color: '#9ca3af', width: '110px', flexShrink: 0 },
  infoBox: {
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '12px', marginBottom: '16px',
    fontSize: '12px', color: '#6b7280', lineHeight: '1.6'
  },
  operatorSelect: {
    padding: '8px 10px', backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', color: '#6366f1', fontSize: '12px',
    cursor: 'pointer', width: '130px', flexShrink: 0
  },
  lookupBox: {
    backgroundColor: '#0a0d14', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '16px', marginTop: '4px'
  },
  lookupLabel: {
    fontSize: '11px', color: '#6b7280', marginBottom: '12px',
    fontWeight: '500', letterSpacing: '0.05em'
  }
};

const OPERATORS = ['equals', 'is not', 'contains', 'does not contain', 'starts with', 'ends with', 'is empty', 'is not empty', 'is not found'];
const COMPARE_TYPES = [
  { value: 'value', label: 'Static value' },
  { value: 'lookup', label: 'Lookup in source' }
];

// =============================================
// DISCOVERABLE INPUT
// =============================================
function DiscoverableInput({ value, onChange, headers, placeholder, style }) {
  const [show, setShow] = useState(false);
  const filtered = (headers || []).filter(h =>
    h.toLowerCase().includes((value || '').toLowerCase()) && h !== value
  );

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        style={{ ...STYLES.input, ...style }}
        value={value || ''}
        onChange={e => { onChange(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder={placeholder}
      />
      {show && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
          borderRadius: '6px', maxHeight: '150px', overflowY: 'auto'
        }}>
          {filtered.map(h => (
            <div
              key={h}
              style={{ padding: '7px 12px', cursor: 'pointer', fontSize: '12px', color: '#e0e0e0', borderBottom: '1px solid #2a2d3e' }}
              onMouseDown={() => { onChange(h); setShow(false); }}
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
      {label && <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>{label}</div>}
      {description && <div style={{ fontSize: '10px', color: '#4b5563', marginBottom: '6px' }}>{description}</div>}
      <div style={STYLES.tagContainer}>
        {(items || []).length === 0 && <span style={{ fontSize: '11px', color: '#4b5563' }}>None added.</span>}
        {(items || []).map(item => (
          <div key={item} style={STYLES.tag}>
            <span>{item}</span>
            <button style={STYLES.tagRemove} onClick={() => onChange(items.filter(i => i !== item))}>×</button>
          </div>
        ))}
      </div>
      <div style={STYLES.addRow}>
        <input
          style={STYLES.addInput}
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
// LIVE SENTENCE BUILDER
// =============================================
function buildRuleSentence(rule) {
  // Multi-condition rule
  if (rule.conditions && rule.conditions.length > 0) {
    const parts = rule.conditions.map((c, i) => {
      const col = c.sourceColumn || '...';
      const src = c.sourceId || '...';
      const op = c.operator || 'equals';

      if (!c.compareType || c.compareType === 'value') {
        const val = c.compareValue || '...';
        return (
          <span key={i}>
            {i > 0 && (
              <strong style={{ color: '#facc15' }}>
                {' '}{c.connector || 'AND'}{' '}
              </strong>
            )}
            <strong style={{ color: '#38bdf8' }}>{col}</strong>
            {' '}from{' '}
            <strong style={{ color: '#38bdf8' }}>{src}</strong>
            {' '}
            <strong style={{ color: '#6366f1' }}>{op}</strong>
            {' '}
            <strong style={{ color: '#34d399' }}>{val}</strong>
          </span>
        );
      }

      if (c.compareType === 'lookup') {
        const searchWith = c.matchKeyColumn || '...';
        const lookupSrc = c.lookupSourceId || '...';
        const lookupKey = c.lookupKeyColumn || '...';
        const lookupVal = c.lookupValueColumn || '...';
        const val = c.compareValue || '...';
        return (
          <span key={i}>
            {i > 0 && (
              <strong style={{ color: '#facc15' }}>
                {' '}{c.connector || 'AND'}{' '}
              </strong>
            )}
            <strong style={{ color: '#38bdf8' }}>{searchWith}</strong>
            {' '}from{' '}
            <strong style={{ color: '#38bdf8' }}>{src}</strong>
            {' '}— in{' '}
            <strong style={{ color: '#38bdf8' }}>{lookupSrc}</strong>
            {' '}where{' '}
            <strong style={{ color: '#38bdf8' }}>{lookupKey}</strong>
            {' '}matches — has{' '}
            <strong style={{ color: '#38bdf8' }}>{lookupVal}</strong>
            {' '}
            <strong style={{ color: '#6366f1' }}>{op}</strong>
            {' '}
            <strong style={{ color: '#34d399' }}>{val}</strong>
          </span>
        );
      }
      return null;
    });

    return <span>Flag any row where {parts}</span>;
  }

  // Single condition (legacy)
  const col = rule.sourceColumn || '...';
  const src = rule.sourceId || '...';
  const op = rule.operator || 'equals';

  if (!rule.compareType || rule.compareType === 'value') {
    const val = rule.compareValue || '...';
    return (
      <span>
        Flag any row where{' '}
        <strong style={{ color: '#38bdf8' }}>{col}</strong>
        {' '}from{' '}
        <strong style={{ color: '#38bdf8' }}>{src}</strong>
        {' '}
        <strong style={{ color: '#6366f1' }}>{op}</strong>
        {' '}
        <strong style={{ color: '#34d399' }}>{val}</strong>
      </span>
    );
  }

  if (rule.compareType === 'lookup') {
    const searchWith = rule.matchKeyColumn || '...';
    const lookupSrc = rule.lookupSourceId || '...';
    const lookupKey = rule.lookupKeyColumn || '...';
    const lookupVal = rule.lookupValueColumn || '...';
    const val = rule.compareValue || '...';
    return (
      <span>
        Flag any row where{' '}
        <strong style={{ color: '#38bdf8' }}>{searchWith}</strong>
        {' '}from{' '}
        <strong style={{ color: '#38bdf8' }}>{src}</strong>
        {' '}— searching{' '}
        <strong style={{ color: '#38bdf8' }}>{lookupSrc}</strong>
        {' '}where{' '}
        <strong style={{ color: '#38bdf8' }}>{lookupKey}</strong>
        {' '}matches — has{' '}
        <strong style={{ color: '#38bdf8' }}>{lookupVal}</strong>
        {' '}
        <strong style={{ color: '#6366f1' }}>{op}</strong>
        {' '}
        <strong style={{ color: '#34d399' }}>{val}</strong>
      </span>
    );
  }

  return <span style={{ color: '#4b5563' }}>Fill in the fields below to build your rule...</span>;
}

// =============================================
// RULE BUILDER
// =============================================
function RuleBuilder({ rule, onUpdate, onRemove, detectedHeaders, categories }) {
  const sourceOptions = detectedHeaders ? Object.keys(detectedHeaders) : [];

  function update(changes) {
    onUpdate({ ...rule, ...changes });
  }

  const severityColor = rule.severity <= 3 ? '#f87171' : rule.severity <= 6 ? '#fb923c' : '#6b7280';

  return (
    <div style={STYLES.ruleCard}>
      {/* Rule header */}
      <div style={STYLES.ruleHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={STYLES.ruleTitle}>{rule.name || 'New Rule'}</span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            backgroundColor: '#1f1315', border: '1px solid #7f1d1d', color: severityColor
          }}>
            Priority {rule.severity || 5}
          </span>
          {rule.category && (
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
              backgroundColor: '#1e1b4b', border: '1px solid #3730a3', color: '#a78bfa'
            }}>
              {rule.category}
            </span>
          )}
        </div>
        <button
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px' }}
          onClick={onRemove}
        >×</button>
      </div>

      {/* Live sentence */}
      <div style={{
        backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
        borderRadius: '6px', padding: '10px 14px', marginBottom: '14px',
        fontSize: '12px', color: '#9ca3af', lineHeight: '1.6'
      }}>
        {buildRuleSentence(rule)}
      </div>

      {/* Rule name */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Rule name</span>
        <input style={STYLES.input} value={rule.name || ''} onChange={e => update({ name: e.target.value })} placeholder="e.g. Check terminated users" />
      </div>

      {/* Flag reason */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Flag reason</span>
        <input style={STYLES.input} value={rule.flagReason || ''} onChange={e => update({ flagReason: e.target.value })} placeholder="Text shown in Audit Reason column..." />
      </div>

      {/* Category */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Category</span>
        <select style={STYLES.select} value={rule.category || ''} onChange={e => update({ category: e.target.value })}>
          <option value="">— Select category —</option>
          {(categories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Priority */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Priority (1-10)</span>
        <input
          style={{ ...STYLES.input, width: '80px', flex: 'none' }}
          type="number" min="1" max="10"
          value={rule.severity || 5}
          onChange={e => update({ severity: parseInt(e.target.value) || 5 })}
        />
        <span style={{ fontSize: '12px', color: '#4b5563' }}>1 = highest priority, runs first</span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #2a2d3e', margin: '12px 0' }} />

      {/* Conditions */}
      {(rule.conditions || []).map((condition, idx) => (
        <div key={idx} style={{
          backgroundColor: '#0a0d14', border: '1px solid #2a2d3e',
          borderRadius: '8px', padding: '16px', marginTop: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {idx === 0 ? (
              <span style={{ fontSize: '11px', color: '#facc15', fontWeight: '500' }}>WHEN</span>
            ) : (
              <select
                style={{
                  backgroundColor: '#1a1d27', border: '1px solid #facc15',
                  borderRadius: '4px', color: '#facc15', fontSize: '11px',
                  fontWeight: '500', cursor: 'pointer', padding: '2px 6px'
                }}
                value={condition.connector || 'AND'}
                onChange={e => {
                  const updated = [...(rule.conditions || [])];
                  updated[idx] = { ...condition, connector: e.target.value };
                  update({ conditions: updated });
                }}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            )}
            <button
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }}
              onClick={() => update({ conditions: (rule.conditions || []).filter((_, i) => i !== idx) })}
            >×</button>
          </div>

          {/* Source */}
          <div style={STYLES.row}>
            <span style={STYLES.label}>Source</span>
            <select style={{ ...STYLES.select, width: '130px', flex: 'none' }}
              value={condition.sourceId || ''}
              onChange={e => {
                const updated = [...(rule.conditions || [])];
                updated[idx] = { ...condition, sourceId: e.target.value };
                update({ conditions: updated });
              }}
            >
              <option value="">Data source...</option>
              {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <DiscoverableInput
              value={condition.sourceColumn || ''}
              onChange={val => {
                const updated = [...(rule.conditions || [])];
                updated[idx] = { ...condition, sourceColumn: val };
                update({ conditions: updated });
              }}
              headers={condition.sourceId && detectedHeaders ? detectedHeaders[condition.sourceId] : []}
              placeholder="Header to check..."
            />
          </div>

          {/* Compare type */}
          <div style={STYLES.row}>
            <span style={STYLES.label}>Compare to</span>
            <select style={{ ...STYLES.select, width: '140px', flex: 'none' }}
              value={condition.compareType || 'value'}
              onChange={e => {
                const updated = [...(rule.conditions || [])];
                updated[idx] = { ...condition, compareType: e.target.value };
                update({ conditions: updated });
              }}
            >
              {COMPARE_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
            </select>
          </div>

          {/* Static value */}
          {(!condition.compareType || condition.compareType === 'value') && (
            <>
              <div style={STYLES.row}>
                <span style={STYLES.label}>Operator</span>
                <select style={STYLES.operatorSelect}
                  value={condition.operator || 'equals'}
                  onChange={e => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, operator: e.target.value };
                    update({ conditions: updated });
                  }}
                >
                  {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
              <div style={STYLES.row}>
                <span style={STYLES.label}>Value</span>
                <DiscoverableInput
                  value={condition.compareValue || ''}
                  onChange={val => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, compareValue: val };
                    update({ conditions: updated });
                  }}
                  headers={condition.sourceId && detectedHeaders ? detectedHeaders[condition.sourceId] : []}
                  placeholder="Type a value or select a header from the same source..."
                />
              </div>
            </>
          )}

          {/* Lookup */}
          {condition.compareType === 'lookup' && (
            <div style={{ marginTop: '8px' }}>
              <div style={STYLES.row}>
                <span style={STYLES.label}>Search using</span>
                <DiscoverableInput
                  value={condition.matchKeyColumn || ''}
                  onChange={val => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, matchKeyColumn: val };
                    update({ conditions: updated });
                  }}
                  headers={condition.sourceId && detectedHeaders ? detectedHeaders[condition.sourceId] : []}
                  placeholder="e.g. User Email — the header I will search with"
                />
              </div>
              <div style={STYLES.row}>
                <span style={STYLES.label}>Search in</span>
                <select style={{ ...STYLES.select, width: '130px', flex: 'none' }}
                  value={condition.lookupSourceId || ''}
                  onChange={e => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, lookupSourceId: e.target.value };
                    update({ conditions: updated });
                  }}
                >
                  <option value="">source...</option>
                  {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <DiscoverableInput
                  value={condition.lookupKeyColumn || ''}
                  onChange={val => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, lookupKeyColumn: val };
                    update({ conditions: updated });
                  }}
                  headers={condition.lookupSourceId && detectedHeaders ? detectedHeaders[condition.lookupSourceId] : []}
                  placeholder="e.g. Work email — the header to match against"
                />
              </div>
              <div style={STYLES.row}>
                <span style={STYLES.label}>Check if</span>
                <DiscoverableInput
                  value={condition.lookupValueColumn || ''}
                  onChange={val => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, lookupValueColumn: val };
                    update({ conditions: updated });
                  }}
                  headers={condition.lookupSourceId && detectedHeaders ? detectedHeaders[condition.lookupSourceId] : []}
                  placeholder="e.g. Employment status — the header to read"
                />
                <select style={STYLES.operatorSelect}
                  value={condition.operator || 'equals'}
                  onChange={e => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, operator: e.target.value };
                    update({ conditions: updated });
                  }}
                >
                  {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <input
                  style={{ ...STYLES.input, flex: 1 }}
                  value={condition.compareValue || ''}
                  onChange={e => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, compareValue: e.target.value };
                    update({ conditions: updated });
                  }}
                  placeholder="e.g. Terminated — the expected value"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add condition button */}
      <button
        style={{
          width: '100%', padding: '8px', marginTop: '10px',
          backgroundColor: 'transparent', border: '1px dashed #2a2d3e',
          borderRadius: '6px', color: '#6b7280', cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={() => update({
          conditions: [...(rule.conditions || []), {
            sourceId: '', sourceColumn: '', operator: 'equals',
            compareType: 'value', compareValue: '',
            lookupSourceId: '', matchKeyColumn: '',
            lookupKeyColumn: '', lookupValueColumn: ''
          }]
        })}
      >
        + Add Condition
      </button>
    </div>
  );
}

// =============================================
// ASSET TYPES TAB
// =============================================
function AssetTypesTab({ config, onConfigUpdate, detectedHeaders }) {
  const [savedMsg, setSavedMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const assetTypes = config.assetTypes || {};
  const processingSteps = config.processingSteps || [];
  const auditRules = config.auditRules || [];

  function handleToggleAsset(assetId) {
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [assetId]: { ...assetTypes[assetId], enabled: !assetTypes[assetId].enabled }
      }
    });
  }

  function handleToggleStep(assetId, stepId) {
    const asset = assetTypes[assetId];
    const current = asset.selectedProcessingSteps || [];
    const updated = current.includes(stepId)
      ? current.filter(s => s !== stepId)
      : [...current, stepId];
    onConfigUpdate({
      ...config,
      assetTypes: { ...assetTypes, [assetId]: { ...asset, selectedProcessingSteps: updated } }
    });
  }

  function handleToggleRule(assetId, ruleId) {
    const asset = assetTypes[assetId];
    const current = asset.selectedRules || [];
    const updated = current.includes(ruleId)
      ? current.filter(r => r !== ruleId)
      : [...current, ruleId];
    onConfigUpdate({
      ...config,
      assetTypes: { ...assetTypes, [assetId]: { ...asset, selectedRules: updated } }
    });
  }

  function handleListChange(assetId, listName, newItems) {
    onConfigUpdate({
      ...config,
      assetTypes: { ...assetTypes, [assetId]: { ...assetTypes[assetId], [listName]: newItems } }
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
    const newId = `asset_${Date.now()}`;
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [newId]: {
          id: newId, name: newName.trim(), description: newDesc.trim(),
          enabled: true, selectedProcessingSteps: [], selectedRules: [],
          whitelist: [], blacklist: []
        }
      }
    });
    setNewName(''); setNewDesc(''); setShowAddForm(false);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div>
      {Object.keys(assetTypes).length === 0 && (
        <div style={STYLES.infoBox}>
          💡 Create your first asset type to get started. An asset type represents
          a category of assets you want to audit (e.g. Workstations, Monitors, Headsets).
          Each asset type selects which processing steps and audit rules apply to it.
        </div>
      )}

      <div style={STYLES.grid}>
        {Object.entries(assetTypes).map(([assetId, asset]) => (
          <div key={assetId} style={STYLES.card}>
            <div style={STYLES.cardHeader}>
              {editingId === assetId ? (
                <div style={{ flex: 1 }}>
                  <input style={STYLES.editInput} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Asset type name..." />
                  <input style={STYLES.editInput} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description..." />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={STYLES.addBtnSmall} onClick={() => handleSaveEdit(assetId)}>✓ Save</button>
                    <button style={STYLES.cancelBtnSmall} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span style={STYLES.cardTitle}>{asset.name}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ ...STYLES.badge, ...(asset.enabled ? STYLES.badgeActive : STYLES.badgeInactive) }}>
                      {asset.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px' }} onClick={() => handleStartEdit(assetId)}>✏</button>
                    <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleDelete(assetId)}>×</button>
                  </div>
                </>
              )}
            </div>

            {editingId !== assetId && (
              <>
                <p style={STYLES.cardDesc}>{asset.description || 'No description.'}</p>
                <button
                  style={{ ...STYLES.toggle, ...(asset.enabled ? STYLES.toggleActive : STYLES.toggleInactive) }}
                  onClick={() => handleToggleAsset(assetId)}
                >
                  {asset.enabled ? '⏸ Disable' : '▶ Enable'}
                </button>

                <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px', fontWeight: '500' }}>
                  🔧 Processing Steps
                </div>
                {processingSteps.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
                    No processing steps defined yet. Add them in Settings → Processing.
                  </div>
                ) : (
                  <div style={{ marginBottom: '10px' }}>
                    {processingSteps.map(step => {
                      const isSelected = (asset.selectedProcessingSteps || []).includes(step.id);
                      return (
                        <span
                          key={step.id}
                          style={{ ...STYLES.chip, ...(isSelected ? STYLES.chipProcessing : {}) }}
                          onClick={() => handleToggleStep(assetId, step.id)}
                        >
                          {step.name || step.id}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#a78bfa', marginBottom: '6px', fontWeight: '500' }}>
                  🔍 Audit Rules
                </div>
                {auditRules.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
                    No audit rules defined yet. Add them in the Audit Rules tab.
                  </div>
                ) : (
                  <div style={{ marginBottom: '10px' }}>
                    {auditRules.map(rule => {
                      const isSelected = (asset.selectedRules || []).includes(rule.id);
                      return (
                        <span
                          key={rule.id}
                          style={{ ...STYLES.chip, ...(isSelected ? STYLES.chipActive : {}) }}
                          onClick={() => handleToggleRule(assetId, rule.id)}
                        >
                          {rule.name || rule.id}
                        </span>
                      );
                    })}
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid #2a2d3e', margin: '12px 0' }} />

                <TagListInput
                  label="✓ Whitelist (Serial Numbers)"
                  description="Always marked clean"
                  items={asset.whitelist || []}
                  onChange={items => handleListChange(assetId, 'whitelist', items)}
                />
                <TagListInput
                  label="✕ Blacklist (Serial Numbers)"
                  description="Suppressed from audit"
                  items={asset.blacklist || []}
                  onChange={items => handleListChange(assetId, 'blacklist', items)}
                />
              </>
            )}
          </div>
        ))}

        {showAddForm ? (
          <div style={STYLES.card}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>New Asset Type</div>
            <input style={STYLES.editInput} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAsset()} placeholder="Asset type name..." autoFocus />
            <input style={STYLES.editInput} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description..." />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={STYLES.addBtnSmall} onClick={handleAddAsset}>✓ Create</button>
              <button style={STYLES.cancelBtnSmall} onClick={() => { setShowAddForm(false); setNewName(''); setNewDesc(''); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div
            style={{ ...STYLES.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '120px', border: '2px dashed #2a2d3e', backgroundColor: 'transparent' }}
            onClick={() => setShowAddForm(true)}
          >
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>+</div>
              <div style={{ fontSize: '13px' }}>Add Asset Type</div>
            </div>
          </div>
        )}
      </div>

      <button style={{ ...STYLES.saveBtn, marginTop: '24px' }} onClick={handleSave}>✓ Save Asset Configuration</button>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
    </div>
  );
}

// =============================================
// AUDIT RULES TAB
// =============================================
function AuditRulesTab({ config, onConfigUpdate, detectedHeaders }) {
  const [savedMsg, setSavedMsg] = useState('');
  const rules = config.auditRules || [];
  const categories = config.auditCategories || [];

  function handleAddRule() {
    const newRule = {
      id: `rule_${Date.now()}`,
      name: '', flagReason: '', category: '', severity: 5,
      conditions: []
    };
    onConfigUpdate({ ...config, auditRules: [...rules, newRule] });
  }

  function handleUpdateRule(ruleId, updatedRule) {
    onConfigUpdate({
      ...config,
      auditRules: rules.map(r => r.id === ruleId ? updatedRule : r)
    });
    setSavedMsg('');
  }

  function handleRemoveRule(ruleId) {
    onConfigUpdate({ ...config, auditRules: rules.filter(r => r.id !== ruleId) });
  }

  function handleSave() {
    onConfigUpdate(config);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div>
      <div style={STYLES.infoBox}>
        💡 Audit rules define what to check during an audit. Each rule compares a header
        value using an operator against either a static value or a lookup from another
        data source. Rules run in priority order (1 = first). Each rule is assigned
        to a category which becomes a tab in your output report.
        {categories.length === 0 && (
          <span style={{ color: '#fca5a5' }}> ⚠ Add categories in Settings → Categories first.</span>
        )}
      </div>

      {rules.length === 0 && (
        <div style={{ ...STYLES.ruleCard, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '6px' }}>No audit rules yet</div>
          <div style={{ fontSize: '12px' }}>Click "Add Rule" to create your first audit rule.</div>
        </div>
      )}

      {rules
        .sort((a, b) => (a.severity || 5) - (b.severity || 5))
        .map(rule => (
          <RuleBuilder
            key={rule.id}
            rule={rule}
            onUpdate={updated => handleUpdateRule(rule.id, updated)}
            onRemove={() => handleRemoveRule(rule.id)}
            detectedHeaders={detectedHeaders}
            categories={categories}
          />
        ))}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button style={STYLES.saveBtn} onClick={handleAddRule}>+ Add Rule</button>
        {rules.length > 0 && (
          <button style={{ ...STYLES.saveBtn, backgroundColor: '#374151' }} onClick={handleSave}>
            ✓ Save Rules
          </button>
        )}
      </div>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
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
    { id: 'rules', label: '🔍 Audit Rules' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Module Manager</h2>
      <p style={STYLES.subtitle}>Define asset types and build audit rules.</p>

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
        <AssetTypesTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />
      )}
      {activeTab === 'rules' && (
        <AuditRulesTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />
      )}
    </div>
  );
}