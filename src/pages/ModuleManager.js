// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import React, { useState } from 'react';
import { addToRuleHistory, addToFilterHistory } from '../config/configManager';

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
const FILTER_TYPES = [
  { value: 'whitelist', label: '✓ Uncategorized Rule', color: '#34d399', border: '#064e3b', bg: '#0f1f17' },
  { value: 'blacklist', label: '✕ Suppression Rule', color: '#fca5a5', border: '#7f1d1d', bg: '#1f1315' },
  { value: 'watchlist', label: '🔍 Investigation Rule', color: '#fb923c', border: '#92400e', bg: '#1c1108' }
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

  const severityColor = rule.severity <= 6 ? '#f87171' : rule.severity <= 12 ? '#fb923c' : '#6b7280';

  return (
    <div style={STYLES.ruleCard}>
      <div style={STYLES.ruleHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={STYLES.ruleTitle}>{rule.name || 'New Rule'}</span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            backgroundColor: '#1f1315', border: '1px solid #7f1d1d', color: severityColor
          }}>Priority {rule.severity || 20}</span>
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
        <span style={STYLES.label}>Priority (1-20)</span>
        <input
          style={{ ...STYLES.input, width: '80px', flex: 'none' }}
          type="number" min="1" max="20"
          value={rule.severity || 20}
          onChange={e => update({ severity: parseInt(e.target.value) || 20 })}
        />
        <span style={{ fontSize: '12px', color: '#4b5563' }}>1 = highest priority, runs first (max 20)</span>
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
                  placeholder="Value, or separate multiple with ; (e.g. Terminated; Damaged)"
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
          enabled: true, selectedProcessingSteps: [], selectedRules: []
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
          Use the Access Rules tab to configure whitelist, blacklist and watch list rules.
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
// FILTER CARD
// =============================================
function FilterCard({ filter, assetTypes, headers, checked, onToggleCheck, onUpdate, onRemove }) {
  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const filterType = FILTER_TYPES.find(t => t.value === filter.type) || FILTER_TYPES[0];
  const borderColor = filterType.border;
  const labelColor = filterType.color;
  const bgColor = filterType.bg;
  const typeLabel = filterType.label;

  function handleSingleAdd() {
    if (!singleInput.trim()) return;
    const trimmed = singleInput.trim();
    if (filter.values.includes(trimmed)) return;
    onUpdate({ values: [...filter.values, trimmed] });
    setSingleInput('');
  }

  function handleBulkAdd() {
    if (!bulkInput.trim()) return;
    const newValues = bulkInput
      .split(';')
      .map(v => v.trim())
      .filter(v => v && !filter.values.includes(v));
    if (newValues.length === 0) return;
    onUpdate({ values: [...filter.values, ...newValues] });
    setBulkInput('');
  }

  function handleRemoveValue(val) {
    onUpdate({ values: filter.values.filter(v => v !== val) });
  }

  function handleToggleProfile(profileId) {
    const current = filter.profileIds || [];
    const updated = current.includes(profileId)
      ? current.filter(id => id !== profileId)
      : [...current, profileId];
    onUpdate({ profileIds: updated });
  }

  const profileKeys = Object.keys(assetTypes);
  const isAllProfiles = !filter.profileIds || filter.profileIds.length === 0;

  return (
    <div style={{ ...STYLES.filterCard, borderColor, backgroundColor: bgColor, marginBottom: '12px' }}>
      <div style={STYLES.filterHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: labelColor }}>{typeLabel}</span>
          {filter.label && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{filter.label}</span>}
          <span style={{
            fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
            backgroundColor: isAllProfiles ? '#1e1b4b' : '#0c1a2e',
            border: `1px solid ${isAllProfiles ? '#3730a3' : '#0c4a6e'}`,
            color: isAllProfiles ? '#a78bfa' : '#38bdf8'
          }}>
            {isAllProfiles ? 'All Profiles' : `${filter.profileIds.length} profile(s)`}
          </span>
          <span style={{ fontSize: '10px', color: '#4b5563' }}>{filter.values.length} value(s)</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={checked || false}
            onChange={onToggleCheck}
            style={{ cursor: 'pointer', accentColor: '#6366f1' }}
          />
          <button
            style={{ background: 'none', border: '1px solid #2a2d3e', color: '#6b7280', cursor: 'pointer', fontSize: '11px', borderRadius: '4px', padding: '3px 8px' }}
            onClick={() => setCollapsed(!collapsed)}
          >{collapsed ? '▼ Expand' : '▲ Collapse'}</button>
          <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }} onClick={onRemove}>×</button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div style={STYLES.row}>
            <span style={STYLES.label}>Filter name</span>
            <input
              style={STYLES.input}
              value={filter.label || ''}
              onChange={e => onUpdate({ label: e.target.value })}
              placeholder="e.g. Old Laptops, Decommissioned Devices..."
            />
          </div>

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

          <div style={STYLES.row}>
            <span style={STYLES.label}>Operator</span>
            <select
              style={{ ...STYLES.select, width: '160px', flex: 'none' }}
              value={filter.operator || 'equals'}
              onChange={e => onUpdate({ operator: e.target.value })}
            >
              {FILTER_OPERATORS.map(op => {
                const deltaSupported = ['equals', 'is not'].includes(op);
                return (
                  <option key={op} value={op} disabled={!deltaSupported}>
                    {op}{!deltaSupported ? ' (delta not supported)' : ''}
                  </option>
                );
              })}
            </select>
            <span style={{ fontSize: '10px', color: '#4b5563', marginLeft: '8px' }}>
              Delta detection supports equals and is not only
            </span>
          </div>

          <div style={{ marginTop: '12px', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
              Applies to
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
              <span
                style={{ ...STYLES.chip, ...(isAllProfiles ? { borderColor: '#6366f1', color: '#6366f1', backgroundColor: '#1e1b4b' } : {}) }}
                onClick={() => onUpdate({ profileIds: [] })}
              >
                🌐 All Profiles
              </span>
              {profileKeys.map(key => {
                const isSelected = (filter.profileIds || []).includes(key);
                return (
                  <span
                    key={key}
                    style={{ ...STYLES.chip, ...(isSelected ? { borderColor: '#0c4a6e', color: '#38bdf8', backgroundColor: '#0c1a2e' } : {}) }}
                    onClick={() => handleToggleProfile(key)}
                  >
                    {assetTypes[key].name}
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: '10px', color: '#4b5563' }}>
              "All Profiles" applies this filter to every audit run. Click specific profiles to target only those.
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
              Values ({filter.values.length})
            </div>
            <div style={STYLES.tagContainer}>
              {filter.values.length === 0 && (
                <span style={{ fontSize: '11px', color: '#4b5563' }}>No values added yet.</span>
              )}
              {filter.values.map(val => (
                <div key={val} style={STYLES.tag}>
                  <span>{val}</span>
                  <button style={STYLES.tagRemove} onClick={() => handleRemoveValue(val)}>×</button>
                </div>
              ))}
            </div>

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
                  onClick={handleBulkAdd}
                >+ Bulk Add</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================
// FILTERS TAB
// =============================================
function FiltersTab({ config, onConfigUpdate, detectedHeaders }) {
  const [savedMsg, setSavedMsg] = useState('');

  const assetTypes = config.assetTypes || {};
  const filters = config.filters || [];
  const headers = detectedHeaders ? Object.values(detectedHeaders).flat() : [];

  function updateFilters(newFilters) {
    onConfigUpdate({ ...config, filters: newFilters });
  }

  function handleAddFilter(type) {
    const newFilter = {
      id: `filter_${Date.now()}`,
      type,
      column: '',
      operator: 'equals',
      values: [],
      label: '',
      profileIds: []
    };
    updateFilters([...filters, newFilter]);
  }

  function handleUpdateFilter(filterId, changes) {
    updateFilters(filters.map(f => f.id === filterId ? { ...f, ...changes } : f));
  }

  function handleRemoveFilter(filterId) {
    updateFilters(filters.filter(f => f.id !== filterId));
  }

  const [checkedFilters, setCheckedFilters] = useState([]);

  function handleToggleCheck(filterId) {
    setCheckedFilters(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  }

  function handleSaveToLibrary() {
    const toSave = filters.filter(f => checkedFilters.includes(f.id) && f.label);
    if (toSave.length === 0) {
      setSavedMsg('⚠ No rules selected. Add a filter name and check the box first.');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    toSave.forEach(filter => addToFilterHistory(filter));
    setSavedMsg(`✓ ${toSave.length} access rule(s) saved to library`);
    setCheckedFilters([]);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleSave() {
    onConfigUpdate(config);
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  return (
    <div>
      <div style={STYLES.infoBox}>
        💡 Access Rules control how assets are routed before audit rules run.
        Each rule targets specific profiles or all profiles. First matching rule wins per asset.<br /><br />
        <span style={{ color: '#34d399' }}>✓ Uncategorized Rule</span> — asset skips all audit rules, lands in <strong style={{ color: '#e0e0e0' }}>Clean</strong> tab<br />
        <span style={{ color: '#fca5a5' }}>✕ Suppression Rule</span> — asset is <strong style={{ color: '#e0e0e0' }}>suppressed entirely</strong> from audit output<br />
        <span style={{ color: '#fb923c' }}>🔍 Investigation Rule</span> — asset removed from audit flow, appears in <strong style={{ color: '#e0e0e0' }}>Under Investigation</strong> tab
      </div>

      {filters.length === 0 && (
        <div style={{ ...STYLES.ruleCard, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛡</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '6px' }}>No access rules yet</div>
          <div style={{ fontSize: '12px' }}>Add a whitelist, blacklist, or watch list rule below.</div>
        </div>
      )}

      {filters.map(filter => (
        <FilterCard
          key={filter.id}
          filter={filter}
          assetTypes={assetTypes}
          headers={headers}
          checked={checkedFilters.includes(filter.id)}
          onToggleCheck={() => handleToggleCheck(filter.id)}
          onUpdate={changes => handleUpdateFilter(filter.id, changes)}
          onRemove={() => handleRemoveFilter(filter.id)}
        />
      ))}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          style={{ ...STYLES.addBtnSmall, padding: '9px 16px', fontSize: '13px' }}
          onClick={() => handleAddFilter('whitelist')}
        >+ Add Uncategorized Rule</button>
        <button
          style={{ ...STYLES.addBtnSmall, padding: '9px 16px', fontSize: '13px', backgroundColor: '#7f1d1d', border: '1px solid #991b1b' }}
          onClick={() => handleAddFilter('blacklist')}
        >+ Add Suppression Rule</button>
        <button
          style={{ ...STYLES.addBtnSmall, padding: '9px 16px', fontSize: '13px', backgroundColor: '#92400e', border: '1px solid #b45309' }}
          onClick={() => handleAddFilter('watchlist')}
        >🔍 Add Investigation Rule</button>
        {filters.length > 0 && (
          <button style={{ ...STYLES.saveBtn, marginTop: '0' }} onClick={handleSave}>✓ Save</button>
        )}
        {filters.length > 0 && (
          <button
            style={{ ...STYLES.saveBtn, marginTop: '0', backgroundColor: '#0c1a2e', border: '1px solid #0c4a6e', color: '#38bdf8' }}
            onClick={handleSaveToLibrary}
          >★ Save checked to Library</button>
        )}
      </div>
      {savedMsg && <div style={STYLES.savedMsg}>{savedMsg}</div>}
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
      name: '', flagReason: '', category: '', severity: 20,
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

      {rules.sort((a, b) => (a.severity || 20) - (b.severity || 20)).map(rule => (
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
                    color: rule.severity <= 6 ? '#f87171' : rule.severity <= 12 ? '#fb923c' : '#6b7280'
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
    { id: 'filters', label: '🛡 Access Rules' }
  ];

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Module Manager</h2>
      <p style={STYLES.subtitle}>Define audit profiles, build audit rules, and configure access rules.</p>

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