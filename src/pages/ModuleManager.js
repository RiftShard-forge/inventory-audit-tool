import React, { useState } from 'react';

const STYLES = {
  page: { maxWidth: '900px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff' },
  badge: {
    fontSize: '11px', fontWeight: '500', padding: '3px 10px',
    borderRadius: '20px', border: '1px solid'
  },
  badgeActive: { color: '#34d399', borderColor: '#064e3b', backgroundColor: '#0f1f17' },
  badgeInactive: { color: '#9ca3af', borderColor: '#374151', backgroundColor: '#1f2937' },
  cardDesc: { fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' },
  toggle: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: '1px solid', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.15s ease'
  },
  toggleActive: {
    backgroundColor: '#1f1f35', borderColor: '#7f1d1d',
    color: '#fca5a5'
  },
  toggleInactive: {
    backgroundColor: '#0f1f17', borderColor: '#064e3b',
    color: '#34d399'
  },
  divider: { border: 'none', borderTop: '1px solid #2a2d3e', margin: '32px 0' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' },
  moduleSelector: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  selectorBtn: {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #2a2d3e',
    backgroundColor: '#1a1d27', color: '#9ca3af', fontSize: '13px',
    cursor: 'pointer', transition: 'all 0.15s ease'
  },
  selectorBtnActive: {
    backgroundColor: '#2a2d3e', color: '#ffffff',
    borderColor: '#6366f1'
  },
  configPanel: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px'
  },
  configSection: { marginBottom: '28px' },
  configLabel: { fontSize: '13px', fontWeight: '500', color: '#9ca3af', marginBottom: '12px', display: 'block' },
  configDesc: { fontSize: '12px', color: '#4b5563', marginBottom: '12px' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  tag: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e',
    borderRadius: '6px', padding: '4px 10px', fontSize: '13px', color: '#e0e0e0'
  },
  tagRemove: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '16px', lineHeight: '1', padding: '0'
  },
  inputRow: { display: 'flex', gap: '8px' },
  input: {
    flex: 1, padding: '9px 14px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '8px',
    color: '#e0e0e0', fontSize: '13px'
  },
  addBtn: {
    padding: '9px 16px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    cursor: 'pointer', whiteSpace: 'nowrap'
  },
  saveBtn: {
    padding: '11px 24px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer', marginTop: '8px'
  },
  savedMsg: { fontSize: '13px', color: '#34d399', marginTop: '12px' }
};

const MODULE_DESCRIPTIONS = {
  workstations: 'Audits laptop and desktop assets against the Rippling roster. Flags terminated users and unaccounted devices.',
  monitors: 'Audits monitor assets against the Rippling roster. Identifies monitors assigned to terminated or unknown users.',
  headsets: 'Audits headset assets against the Rippling roster. Flags headsets assigned to terminated or unknown users.'
};

function TagInput({ label, description, items, onChange }) {
  const [inputVal, setInputVal] = useState('');

  function handleAdd() {
    const trimmed = inputVal.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputVal('');
    }
  }

  function handleRemove(item) {
    onChange(items.filter(i => i !== item));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div style={STYLES.configSection}>
      <span style={STYLES.configLabel}>{label}</span>
      {description && <p style={STYLES.configDesc}>{description}</p>}
      <div style={STYLES.tagContainer}>
        {items.length === 0 && (
          <span style={{ fontSize: '13px', color: '#4b5563' }}>None added yet.</span>
        )}
        {items.map(item => (
          <div key={item} style={STYLES.tag}>
            <span>{item}</span>
            <button style={STYLES.tagRemove} onClick={() => handleRemove(item)}>×</button>
          </div>
        ))}
      </div>
      <div style={STYLES.inputRow}>
        <input
          style={STYLES.input}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <button style={STYLES.addBtn} onClick={handleAdd}>+ Add</button>
      </div>
    </div>
  );
}

export default function ModuleManager({ config, onConfigUpdate }) {
  const [activeModule, setActiveModule] = useState('workstations');
  const [saved, setSaved] = useState(false);

  const moduleKeys = Object.keys(config.modules);
  const mod = config.modules[activeModule];

  function handleToggle(key) {
    const updated = {
      ...config,
      modules: {
        ...config.modules,
        [key]: { ...config.modules[key], enabled: !config.modules[key].enabled }
      }
    };
    onConfigUpdate(updated);
  }

  function handleListChange(listName, newItems) {
    const updated = {
      ...config,
      modules: {
        ...config.modules,
        [activeModule]: { ...mod, [listName]: newItems }
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

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Module Manager</h2>
      <p style={STYLES.subtitle}>
        Enable or disable audit modules and configure their settings.
      </p>

      {/* Module Status Cards */}
      <div style={STYLES.grid}>
        {moduleKeys.map(key => {
          const m = config.modules[key];
          return (
            <div key={key} style={STYLES.card}>
              <div style={STYLES.cardHeader}>
                <span style={STYLES.cardTitle}>{m.name}</span>
                <span style={{
                  ...STYLES.badge,
                  ...(m.enabled ? STYLES.badgeActive : STYLES.badgeInactive)
                }}>
                  {m.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p style={STYLES.cardDesc}>{MODULE_DESCRIPTIONS[key]}</p>
              <button
                style={{
                  ...STYLES.toggle,
                  ...(m.enabled ? STYLES.toggleActive : STYLES.toggleInactive)
                }}
                onClick={() => handleToggle(key)}
              >
                {m.enabled ? '⏸ Disable Module' : '▶ Enable Module'}
              </button>
            </div>
          );
        })}
      </div>

      <hr style={STYLES.divider} />

      {/* Per-Module Configuration */}
      <h3 style={STYLES.sectionTitle}>Module Configuration</h3>

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

      <div style={STYLES.configPanel}>
        <TagInput
          label="Known Models"
          description="Assets with these model names will not be flagged as outstanding. Add new models as your fleet grows."
          items={mod.knownModels}
          onChange={items => handleListChange('knownModels', items)}
        />

        <TagInput
          label="Whitelist (Serial Numbers)"
          description="Assets with these serial numbers will always be marked as clean, skipping all audit checks."
          items={mod.whitelist}
          onChange={items => handleListChange('whitelist', items)}
        />

        <TagInput
          label="Blacklist (Serial Numbers)"
          description="Assets with these serial numbers will be suppressed from the audit and flagged separately."
          items={mod.blacklist}
          onChange={items => handleListChange('blacklist', items)}
        />

        <button style={STYLES.saveBtn} onClick={handleSave}>
          ✓ Save Configuration
        </button>
        {saved && <div style={STYLES.savedMsg}>✓ Configuration saved successfully.</div>}
      </div>
    </div>
  );
}