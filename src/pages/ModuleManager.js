// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import React, { useState } from 'react';
import { addToRuleHistory } from '../config/configManager';

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
  chip: {
    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
    border: '1px solid #2a2d3e', color: '#9ca3af', backgroundColor: '#0f1117',
    cursor: 'pointer', display: 'inline-block', margin: '3px'
  },
  chipActive: { borderColor: '#6366f1', color: '#6366f1', backgroundColor: '#1e1b4b' },
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
  filterCard: {
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '16px', marginBottom: '12px'
  },
  filterHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px'
  },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' },
  tag: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '6px', padding: '3px 8px', fontSize: '11px', color: '#e0e0e0'
  },
  tagRemove: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '14px', lineHeight: '1', padding: '0'
  }
};

const OPERATORS = ['equals', 'is not', 'contains', 'does not contain', 'starts with', 'ends with', 'is empty', 'is not empty', 'is not found'];
const COMPARE_TYPES = [
  { value: 'value', label: 'Static value' },
  { value: 'lookup', label: 'Lookup in source' }
];
const FILTER_OPERATORS = ['equals', 'is not', 'contains', 'does not contain', 'starts with', 'ends with'];

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
// LIVE SENTENCE BUILDER
// =============================================
function buildRuleSentence(rule) {
  if (rule.conditions && rule.conditions.length > 0) {
    const parts = rule.conditions.map((c, i) => {
      const col = c.sourceColumn || '...';
      const src = c.sourceId || '...';
      const op = c.operator || 'equals';

      if (!c.compareType || c.compareType === 'value') {
        const val = c.compareValue || '...';
        return (
          <span key={i}>
            {i > 0 && <strong style={{ color: '#facc15' }}>{' '}{c.connector || 'AND'}{' '}</strong>}
            <strong style={{ color: '#38bdf8' }}>{col}</strong>{' '}from{' '}
            <strong style={{ color: '#38bdf8' }}>{src}</strong>{' '}
            <strong style={{ color: '#6366f1' }}>{op}</strong>{' '}
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
            {i > 0 && <strong style={{ color: '#facc15' }}>{' '}{c.connector || 'AND'}{' '}</strong>}
            <strong style={{ color: '#38bdf8' }}>{searchWith}</strong>{' '}from{' '}
            <strong style={{ color: '#38bdf8' }}>{src}</strong>{' '}— in{' '}
            <strong style={{ color: '#38bdf8' }}>{lookupSrc}</strong>{' '}where{' '}
            <strong style={{ color: '#38bdf8' }}>{lookupKey}</strong>{' '}matches — has{' '}
            <strong style={{ color: '#38bdf8' }}>{lookupVal}</strong>{' '}
            <strong style={{ color: '#6366f1' }}>{op}</strong>{' '}
            <strong style={{ color: '#34d399' }}>{val}</strong>
          </span>
        );
      }
      return null;
    });
    return <span>Flag any row where {parts}</span>;
  }

  const col = rule.sourceColumn || '...';
  const src = rule.sourceId || '...';
  const op = rule.operator || 'equals';

  if (!rule.compareType || rule.compareType === 'value') {
    const val = rule.compareValue || '...';
    return (
      <span>
        Flag any row where{' '}
        <strong style={{ color: '#38bdf8' }}>{col}</strong>{' '}from{' '}
        <strong style={{ color: '#38bdf8' }}>{src}</strong>{' '}
        <strong style={{ color: '#6366f1' }}>{op}</strong>{' '}
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

  function update(changes) { onUpdate({ ...rule, ...changes }); }

  const severityColor = rule.severity <= 3 ? '#f87171' : rule.severity <= 6 ? '#fb923c' : '#6b7280';

  return (
    <div style={STYLES.ruleCard}>
      <div style={STYLES.ruleHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={STYLES.ruleTitle}>{rule.name || 'New Rule'}</span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            backgroundColor: '#1f1315', border: '1px solid #7f1d1d', color: severityColor
          }}>Priority {rule.severity || 5}</span>
          {rule.category && (
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
              backgroundColor: '#1e1b4b', border: '1px solid #3730a3', color: '#a78bfa'
            }}>{rule.category}</span>
          )}
        </div>
        <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '18px' }} onClick={onRemove}>×</button>
      </div>

      <div style={{
        backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
        borderRadius: '6px', padding: '10px 14px', marginBottom: '14px',
        fontSize: '12px', color: '#9ca3af', lineHeight: '1.6'
      }}>
        {buildRuleSentence(rule)}
      </div>

      <div style={STYLES.row}>
        <span style={STYLES.label}>Rule name</span>
        <input style={STYLES.input} value={rule.name || ''} onChange={e => update({ name: e.target.value })} placeholder="e.g. Check terminated users" />
      </div>
      <div style={STYLES.row}>
        <span style={STYLES.label}>Flag reason</span>
        <input style={STYLES.input} value={rule.flagReason || ''} onChange={e => update({ flagReason: e.target.value })} placeholder="Text shown in Audit Reason column..." />
      </div>
      <div style={STYLES.row}>
        <span style={STYLES.label}>Category</span>
        <select style={STYLES.select} value={rule.category || ''} onChange={e => update({ category: e.target.value })}>
          <option value="">— Select category —</option>
          {(categories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
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
      <div style={{ ...STYLES.row, marginBottom: '4px' }}>
        <span style={STYLES.label}>Suppress on match</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={rule.suppressOnMatch !== false}
            onChange={e => update({ suppressOnMatch: e.target.checked })}
            style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            If matched, do not evaluate this asset against lower-priority rules
          </span>
        </label>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #2a2d3e', margin: '12px 0' }} />

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
              placeholder="Column or value..."
            />
          </div>

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
                  placeholder="Type a value or select a column header..."
                />
              </div>
            </>
          )}

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
                  placeholder="Column from primary source to search with..."
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
                  placeholder="Column to match against..."
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
                  placeholder="Column to read from lookup source..."
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
                <DiscoverableInput
                  value={condition.compareValue || ''}
                  onChange={val => {
                    const updated = [...(rule.conditions || [])];
                    updated[idx] = { ...condition, compareValue: val };
                    update({ conditions: updated });
                  }}
                  headers={condition.sourceId && detectedHeaders ? detectedHeaders[condition.sourceId] : []}
                  placeholder="Value or column to compare against..."
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        style={{
          width: '100%', padding: '8px', marginTop: '10px',
          backgroundColor: 'transparent', border: '1px dashed #2a2d3e',
          borderRadius: '6px', color: '#6b7280', cursor: 'pointer', fontSize: '12px'
        }}
        onClick={() => update({
          conditions: [...(rule.conditions || []), {
            sourceId: '', sourceColumn: '', operator: 'equals',
            compareType: 'value', compareValue: '',
            lookupSourceId: '', matchKeyColumn: '',
            lookupKeyColumn: '', lookupValueColumn: ''
          }]
        })}
      >+ Add Condition</button>
    </div>
  );
}

// =============================================
// AUDIT PROFILES TAB
// =============================================
function AuditProfilesTab({ config, onConfigUpdate, detectedHeaders }) {
  const [savedMsg, setSavedMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const assetTypes = config.assetTypes || {};
  const auditRules = config.auditRules || [];

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
          filters: []
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
          💡 Create your first audit profile to get started. An audit profile defines
          which processing steps and audit rules apply to a specific type of audit.
          Use the Filters tab to configure whitelist and blacklist rules per profile.
        </div>
      )}

      <div style={STYLES.grid}>
        {Object.entries(assetTypes).map(([assetId, asset]) => (
          <div key={assetId} style={STYLES.card}>
            <div style={STYLES.cardHeader}>
              {editingId === assetId ? (
                <div style={{ flex: 1 }}>
                  <input style={STYLES.editInput} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Profile name..." />
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
                    <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px' }} onClick={() => handleStartEdit(assetId)}>✏</button>
                    <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleDelete(assetId)}>×</button>
                  </div>
                </>
              )}
            </div>

            {editingId !== assetId && (
              <>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' }}>
                  {asset.description || 'No description.'}
                </p>
                <div style={{ fontSize: '11px', color: '#a78bfa', marginBottom: '6px', fontWeight: '500' }}>
                  🔍 Audit Rules
                </div>
                {auditRules.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
                    No audit rules defined yet. Add them in the Audit Rules tab.
                  </div>
                ) : (
                  <div style={{ marginBottom: '8px' }}>
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
                <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px' }}>
                  {(asset.filters || []).length} filter rule(s) — manage in Filters tab
                </div>
              </>
            )}
          </div>
        ))}

        {showAddForm ? (
          <div style={STYLES.card}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>New Audit Profile</div>
            <input style={STYLES.editInput} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAsset()} placeholder="Profile name..." autoFocus />
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
              <div style={{ fontSize: '13px' }}>Add Audit Profile</div>
            </div>
          </div>
        )}
      </div>

      <button style={{ ...STYLES.saveBtn, marginTop: '24px' }} onClick={handleSave}>✓ Save Audit Profiles</button>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
    </div>
  );
}

// =============================================
// FILTERS TAB
// =============================================
function FiltersTab({ config, onConfigUpdate, detectedHeaders }) {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [bulkType, setBulkType] = useState('whitelist');

  const assetTypes = config.assetTypes || {};
  const profileKeys = Object.keys(assetTypes);
  const headers = detectedHeaders ? Object.values(detectedHeaders).flat() : [];

  // Auto-select first profile if only one exists
  const activeProfile = selectedProfile || profileKeys[0] || '';
  const profile = assetTypes[activeProfile];
  const filters = profile?.filters || [];

  function updateFilters(newFilters) {
    onConfigUpdate({
      ...config,
      assetTypes: {
        ...assetTypes,
        [activeProfile]: { ...assetTypes[activeProfile], filters: newFilters }
      }
    });
  }

  function handleAddFilter(type) {
    const newFilter = {
      id: `filter_${Date.now()}`,
      type, // 'whitelist' or 'blacklist'
      column: '',
      operator: 'equals',
      values: [],
      label: ''
    };
    updateFilters([...filters, newFilter]);
  }

  function handleUpdateFilter(filterId, changes) {
    updateFilters(filters.map(f => f.id === filterId ? { ...f, ...changes } : f));
  }

  function handleRemoveFilter(filterId) {
    updateFilters(filters.filter(f => f.id !== filterId));
  }

  function handleAddValue(filterId, value) {
    const filter = filters.find(f => f.id === filterId);
    if (!filter || !value.trim()) return;
    const trimmed = value.trim();
    if (filter.values.includes(trimmed)) return;
    handleUpdateFilter(filterId, { values: [...filter.values, trimmed] });
  }

  function handleRemoveValue(filterId, value) {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;
    handleUpdateFilter(filterId, { values: filter.values.filter(v => v !== value) });
  }

  function handleBulkAdd(filterId) {
    const filter = filters.find(f => f.id === filterId);
    if (!filter || !bulkInput.trim()) return;
    const newValues = bulkInput
      .split(';')
      .map(v => v.trim())
      .filter(v => v && !filter.values.includes(v));
    if (newValues.length === 0) return;
    handleUpdateFilter(filterId, { values: [...filter.values, ...newValues] });
    setBulkInput('');
    setSavedMsg(`✓ Added ${newValues.length} value(s)`);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  if (profileKeys.length === 0) {
    return (
      <div style={STYLES.infoBox}>
        💡 Create an Audit Profile first in the Audit Profiles tab, then come back here to configure its filters.
      </div>
    );
  }

  return (
    <div>
      <div style={STYLES.infoBox}>
        💡 Filters let you whitelist or blacklist rows based on any column condition.
        Whitelisted rows are always marked Uncategorized regardless of rules.
        Blacklisted rows are suppressed from the audit entirely.
        Each audit profile has its own independent filter set.
      </div>

      {/* Profile selector */}
      {profileKeys.length > 1 && (
        <div style={{ ...STYLES.row, marginBottom: '20px' }}>
          <span style={{ ...STYLES.label, width: '140px' }}>Audit Profile</span>
          <select
            style={STYLES.select}
            value={activeProfile}
            onChange={e => setSelectedProfile(e.target.value)}
          >
            {profileKeys.map(key => (
              <option key={key} value={key}>{assetTypes[key].name}</option>
            ))}
          </select>
        </div>
      )}

      {profileKeys.length === 1 && (
        <div style={{ fontSize: '13px', color: '#a78bfa', marginBottom: '16px', fontWeight: '500' }}>
          🎯 {assetTypes[activeProfile]?.name}
        </div>
      )}

      {/* Filter cards */}
      {filters.length === 0 && (
        <div style={{ ...STYLES.ruleCard, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔽</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '6px' }}>No filters yet</div>
          <div style={{ fontSize: '12px' }}>Add a whitelist or blacklist filter below.</div>
        </div>
      )}

      {filters.map(filter => (
        <FilterCard
          key={filter.id}
          filter={filter}
          headers={headers}
          bulkInput={bulkInput}
          setBulkInput={setBulkInput}
          onUpdate={changes => handleUpdateFilter(filter.id, changes)}
          onRemove={() => handleRemoveFilter(filter.id)}
          onAddValue={value => handleAddValue(filter.id, value)}
          onRemoveValue={value => handleRemoveValue(filter.id, value)}
          onBulkAdd={() => handleBulkAdd(filter.id)}
        />
      ))}

      {/* Add buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button
          style={{ ...STYLES.addBtnSmall, padding: '9px 16px', fontSize: '13px' }}
          onClick={() => handleAddFilter('whitelist')}
        >
          + Add Whitelist Rule
        </button>
        <button
          style={{ ...STYLES.addBtnSmall, padding: '9px 16px', fontSize: '13px', backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}
          onClick={() => handleAddFilter('blacklist')}
        >
          + Add Blacklist Rule
        </button>
        <div style={{ width: '100%', marginTop: '8px', fontSize: '11px', color: '#4b5563', lineHeight: '1.8' }}>
          <span style={{ color: '#34d399' }}>✓ Whitelist</span> — row passes all rules and is always marked <strong style={{ color: '#e0e0e0' }}>Uncategorized</strong> (excluded from flagging)<br />
          <span style={{ color: '#fca5a5' }}>✕ Blacklist</span> — row is <strong style={{ color: '#e0e0e0' }}>suppressed entirely</strong> from the audit output
        </div>
        {filters.length > 0 && (
          <button style={{ ...STYLES.saveBtn, marginTop: '0' }} onClick={handleSave}>✓ Save Filters</button>
        )}
      </div>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
    </div>
  );
}

// =============================================
// FILTER CARD
// =============================================
function FilterCard({ filter, headers, bulkInput, setBulkInput, onUpdate, onRemove, onAddValue, onRemoveValue, onBulkAdd }) {
  const [singleInput, setSingleInput] = useState('');
  const isWhitelist = filter.type === 'whitelist';

  const borderColor = isWhitelist ? '#064e3b' : '#7f1d1d';
  const labelColor = isWhitelist ? '#34d399' : '#fca5a5';
  const bgColor = isWhitelist ? '#0f1f17' : '#1f1315';
  const typeLabel = isWhitelist ? '✓ Whitelist' : '✕ Blacklist';

  function handleSingleAdd() {
    if (!singleInput.trim()) return;
    onAddValue(singleInput.trim());
    setSingleInput('');
  }

  return (
    <div style={{ ...STYLES.filterCard, borderColor, backgroundColor: bgColor }}>
      <div style={STYLES.filterHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: labelColor }}>{typeLabel}</span>
          {filter.label && (
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{filter.label}</span>
          )}
        </div>
        <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={onRemove}>×</button>
      </div>

      {/* Label */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Filter name</span>
        <input
          style={STYLES.input}
          value={filter.label || ''}
          onChange={e => onUpdate({ label: e.target.value })}
          placeholder="e.g. Old Thinkpads, Decommissioned Devices..."
        />
      </div>

      {/* Column */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Column</span>
        <input
          style={STYLES.input}
          value={filter.column || ''}
          onChange={e => onUpdate({ column: e.target.value })}
          placeholder="Column to check (e.g. Model, Serial Number, Site...)"
          list={`filter-headers-${filter.id}`}
        />
        <datalist id={`filter-headers-${filter.id}`}>
          {headers.map(h => <option key={h} value={h} />)}
        </datalist>
      </div>

      {/* Operator */}
      <div style={STYLES.row}>
        <span style={STYLES.label}>Operator</span>
        <select
          style={{ ...STYLES.select, width: '160px', flex: 'none' }}
          value={filter.operator || 'equals'}
          onChange={e => onUpdate({ operator: e.target.value })}
        >
          {FILTER_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      </div>

      {/* Values */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
          Values ({filter.values.length})
        </div>

        {/* Existing values */}
        <div style={STYLES.tagContainer}>
          {filter.values.length === 0 && (
            <span style={{ fontSize: '11px', color: '#4b5563' }}>No values added yet.</span>
          )}
          {filter.values.map(val => (
            <div key={val} style={STYLES.tag}>
              <span>{val}</span>
              <button style={STYLES.tagRemove} onClick={() => onRemoveValue(val)}>×</button>
            </div>
          ))}
        </div>

        {/* Single add */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <input
            style={{ ...STYLES.input, flex: 1, fontSize: '12px', padding: '7px 10px' }}
            value={singleInput}
            onChange={e => setSingleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSingleAdd()}
            placeholder="Add single value..."
          />
          <button style={STYLES.addBtnSmall} onClick={handleSingleAdd}>+ Add</button>
        </div>

        {/* Bulk add */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
            Bulk add — separate with semicolons (e.g. HH2-ABC123; HH2-DEF456; ThinkPad T450)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              style={{ ...STYLES.input, flex: 1, fontSize: '12px', padding: '7px 10px' }}
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder="Value1; Value2; Value3..."
            />
            <button
              style={{ ...STYLES.addBtnSmall, backgroundColor: '#374151' }}
              onClick={onBulkAdd}
            >+ Bulk Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// AUDIT RULES TAB
// =============================================
function AuditRulesTab({ config, onConfigUpdate, detectedHeaders }) {
  const [collapsedRules, setCollapsedRules] = useState({});
  const [savedMsg, setSavedMsg] = useState('');
  const [checkedRules, setCheckedRules] = useState([]);
  const rules = config.auditRules || [];
  const categories = config.auditCategories || [];

  function handleToggleCheck(ruleId) {
    setCheckedRules(prev =>
      prev.includes(ruleId) ? prev.filter(id => id !== ruleId) : [...prev, ruleId]
    );
  }

  function handleAddRule() {
    const newRule = {
      id: `rule_${Date.now()}`,
      name: '', flagReason: '', category: '', severity: 5,
      suppressOnMatch: true, conditions: []
    };
    onConfigUpdate({ ...config, auditRules: [...rules, newRule] });
  }

  function handleUpdateRule(ruleId, updatedRule) {
    onConfigUpdate({ ...config, auditRules: rules.map(r => r.id === ruleId ? updatedRule : r) });
    setSavedMsg('');
  }

  function handleRemoveRule(ruleId) {
    onConfigUpdate({ ...config, auditRules: rules.filter(r => r.id !== ruleId) });
    setCheckedRules(prev => prev.filter(id => id !== ruleId));
  }

  function handleSave() {
    onConfigUpdate(config);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleSaveToLibrary() {
    const toSave = rules.filter(r => checkedRules.includes(r.id) && r.name);
    if (toSave.length === 0) return;
    toSave.forEach(rule => addToRuleHistory(rule));
    setSavedMsg(`✓ ${toSave.length} rule(s) saved to library`);
    setCheckedRules([]);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div>
      <div style={STYLES.infoBox}>
        💡 Audit rules define what to check during an audit. Each rule compares a column
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

      {rules.sort((a, b) => (a.severity || 5) - (b.severity || 5)).map(rule => (
        <div key={rule.id}>
          {collapsedRules[rule.id] ? (
            <div style={{
              backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff' }}>{rule.name || 'New Rule'}</span>
                {rule.severity && (
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    backgroundColor: '#1f1315', border: '1px solid #7f1d1d',
                    color: rule.severity <= 3 ? '#f87171' : rule.severity <= 6 ? '#fb923c' : '#6b7280'
                  }}>Priority {rule.severity}</span>
                )}
                {rule.category && (
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    backgroundColor: '#1e1b4b', border: '1px solid #3730a3', color: '#a78bfa'
                  }}>{rule.category}</span>
                )}
                <span style={{ fontSize: '11px', color: '#4b5563' }}>{(rule.conditions || []).length} condition(s)</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={checkedRules.includes(rule.id)} onChange={() => handleToggleCheck(rule.id)} style={{ cursor: 'pointer', accentColor: '#6366f1' }} />
                <button
                  style={{ background: 'none', border: '1px solid #2a2d3e', color: '#6b7280', cursor: 'pointer', fontSize: '11px', borderRadius: '4px', padding: '3px 8px' }}
                  onClick={() => setCollapsedRules(prev => ({ ...prev, [rule.id]: false }))}
                >▼ Expand</button>
                <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={() => handleRemoveRule(rule.id)}>×</button>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', right: '40px', zIndex: 10, display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={checkedRules.includes(rule.id)} onChange={() => handleToggleCheck(rule.id)} style={{ cursor: 'pointer', accentColor: '#6366f1' }} />
                <button
                  style={{ background: 'none', border: '1px solid #2a2d3e', color: '#6b7280', cursor: 'pointer', fontSize: '11px', borderRadius: '4px', padding: '3px 8px' }}
                  onClick={() => setCollapsedRules(prev => ({ ...prev, [rule.id]: true }))}
                >▲ Collapse</button>
              </div>
              <RuleBuilder
                rule={rule}
                onUpdate={updated => handleUpdateRule(rule.id, updated)}
                onRemove={() => handleRemoveRule(rule.id)}
                detectedHeaders={detectedHeaders}
                categories={categories}
              />
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button style={STYLES.saveBtn} onClick={handleAddRule}>+ Add Rule</button>
        {rules.length > 0 && (
          <button style={{ ...STYLES.saveBtn, backgroundColor: '#374151' }} onClick={handleSave}>✓ Save Rules</button>
        )}
        {rules.length > 0 && (
          <button
            style={{ ...STYLES.saveBtn, backgroundColor: '#0c1a2e', border: '1px solid #0c4a6e', color: '#38bdf8' }}
            onClick={handleSaveToLibrary}
          >★ Save checked to Library</button>
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
    { id: 'assets', label: '🎯 Audit Profiles' },
    { id: 'rules', label: '🔍 Audit Rules' },
    { id: 'filters', label: '🔽 Filters' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Module Manager</h2>
      <p style={STYLES.subtitle}>Define audit profiles, build audit rules, and configure filters.</p>

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
        <AuditProfilesTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />
      )}
      {activeTab === 'rules' && (
        <AuditRulesTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />
      )}
      {activeTab === 'filters' && (
        <FiltersTab config={config} onConfigUpdate={onConfigUpdate} detectedHeaders={detectedHeaders} />
      )}
    </div>
  );
}