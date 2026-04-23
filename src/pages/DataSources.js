import React, { useState } from 'react';
import { parseCsv } from '../utils/auditEngine';

const STYLES = {
  page: { maxWidth: '900px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '20px'
  },
  cardLoaded: {
    backgroundColor: '#0f1f17', border: '1px solid #064e3b',
    borderRadius: '12px', padding: '20px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff' },
  dropzone: {
    border: '2px dashed #2a2d3e', borderRadius: '8px', padding: '24px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s ease',
    backgroundColor: '#0f1117', marginBottom: '8px'
  },
  dropzoneActive: { borderColor: '#6366f1', backgroundColor: '#1e1f35' },
  dropzoneLoaded: { borderColor: '#064e3b', backgroundColor: '#0a1a10' },
  headerPills: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' },
  headerPill: {
    fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
    backgroundColor: '#0f1117', border: '1px solid #2a2d3e', color: '#9ca3af'
  },
  removeBtn: {
    background: 'none', border: 'none', color: '#6b7280',
    cursor: 'pointer', fontSize: '18px', lineHeight: '1'
  },
  addCard: {
    border: '2px dashed #2a2d3e', borderRadius: '12px', padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', minHeight: '160px',
    backgroundColor: 'transparent', transition: 'all 0.15s ease'
  },
  input: {
    width: '100%', padding: '8px 12px', backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e', borderRadius: '6px',
    color: '#e0e0e0', fontSize: '13px', marginBottom: '8px'
  },
  saveBtn: {
    padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff',
    border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
    marginRight: '8px'
  },
  cancelBtn: {
    padding: '8px 16px', backgroundColor: '#1a1d27', color: '#9ca3af',
    border: '1px solid #2a2d3e', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
  },
  infoBox: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '8px', padding: '16px', marginBottom: '24px',
    fontSize: '13px', color: '#6b7280', lineHeight: '1.6'
  },
  badge: {
    fontSize: '11px', fontWeight: '500', padding: '3px 10px',
    borderRadius: '20px', border: '1px solid',
    color: '#34d399', borderColor: '#064e3b', backgroundColor: '#0f1f17'
  },
  rowCount: { fontSize: '11px', color: '#6b7280', marginTop: '6px' },
  divider: { border: 'none', borderTop: '1px solid #2a2d3e', margin: '14px 0' },
  chip: {
    fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
    border: '1px solid #2a2d3e', color: '#9ca3af', backgroundColor: '#0f1117',
    cursor: 'pointer', display: 'inline-block', margin: '3px'
  },
  chipActive: { borderColor: '#0c4a6e', color: '#38bdf8', backgroundColor: '#0c1a2e' },
  stepsLabel: { fontSize: '11px', color: '#38bdf8', marginBottom: '6px', fontWeight: '500' }
};

function DropzoneCard({ source, onFileLoad, onRemove, onStepToggle, processingSteps }) {
  const [active, setActive] = useState(false);
  const isLoaded = !!source.file;

  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const { header, rows } = parseCsv(e.target.result);
      onFileLoad(source.id, file.name, header, rows);
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setActive(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div style={isLoaded ? STYLES.cardLoaded : STYLES.card}>
      <div style={STYLES.cardHeader}>
        <span style={STYLES.cardTitle}>{source.name}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isLoaded && <span style={STYLES.badge}>Loaded</span>}
          <button style={STYLES.removeBtn} onClick={() => onRemove(source.id)}>×</button>
        </div>
      </div>

      <div
        style={{
          ...STYLES.dropzone,
          ...(active ? STYLES.dropzoneActive : {}),
          ...(isLoaded ? STYLES.dropzoneLoaded : {})
        }}
        onDragOver={e => { e.preventDefault(); setActive(true); }}
        onDragLeave={() => setActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-${source.id}`).click()}
      >
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>
          {isLoaded ? '✓' : '📂'}
        </div>
        <div style={{ fontSize: '12px', color: isLoaded ? '#34d399' : '#6b7280' }}>
          {isLoaded ? source.fileName : 'Drop CSV here or click to browse'}
        </div>
        <input
          id={`file-${source.id}`}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {isLoaded && (
        <>
          <div style={STYLES.rowCount}>
            {source.rows.length} rows · {source.headers.length} headers
          </div>
          <div style={STYLES.headerPills}>
            {source.headers.map(h => (
              <span key={h} style={STYLES.headerPill}>{h}</span>
            ))}
          </div>
        </>
      )}

      {/* Processing Steps selector */}
      {processingSteps && processingSteps.length > 0 && (
        <>
          <div style={STYLES.divider} />
          <div style={STYLES.stepsLabel}>🔧 Processing Steps</div>
          <div>
            {processingSteps.map(step => {
              const isSelected = (source.selectedProcessingSteps || []).includes(step.id);
              return (
                <span
                  key={step.id}
                  style={{ ...STYLES.chip, ...(isSelected ? STYLES.chipActive : {}) }}
                  onClick={() => onStepToggle(source.id, step.id)}
                >
                  {step.name || step.id}
                </span>
              );
            })}
          </div>
          {(source.selectedProcessingSteps || []).length > 0 && (
            <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '6px' }}>
              {(source.selectedProcessingSteps || []).length} step(s) will run on this source before audit
            </div>
          )}
        </>
      )}

      {processingSteps && processingSteps.length === 0 && isLoaded && (
        <>
          <div style={STYLES.divider} />
          <div style={{ fontSize: '11px', color: '#4b5563' }}>
            No processing steps defined yet. Add them in Settings → Processing.
          </div>
        </>
      )}
    </div>
  );
}

export default function DataSources({ dataSources, onDataSourcesUpdate, processingSteps }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');

  const sources = Object.values(dataSources);
  const loadedCount = sources.filter(s => s.file).length;

  function handleAddSource() {
    if (!newName.trim()) return;
    const id = newName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const updated = {
      ...dataSources,
      [id]: {
        id, name: newName.trim(), file: null,
        fileName: null, headers: [], rows: [],
        selectedProcessingSteps: []
      }
    };
    onDataSourcesUpdate(updated);
    setNewName('');
    setShowAddForm(false);
  }

  function handleFileLoad(sourceId, fileName, headers, rows) {
    const updated = {
      ...dataSources,
      [sourceId]: { ...dataSources[sourceId], file: true, fileName, headers, rows }
    };
    onDataSourcesUpdate(updated);
  }

  function handleRemove(sourceId) {
    const updated = { ...dataSources };
    delete updated[sourceId];
    onDataSourcesUpdate(updated);
  }

  function handleStepToggle(sourceId, stepId) {
    const source = dataSources[sourceId];
    const current = source.selectedProcessingSteps || [];
    const updated = current.includes(stepId)
      ? current.filter(s => s !== stepId)
      : [...current, stepId];
    onDataSourcesUpdate({
      ...dataSources,
      [sourceId]: { ...source, selectedProcessingSteps: updated }
    });
  }

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Data Sources</h2>
      <p style={STYLES.subtitle}>
        Add your data sources, drop in CSV exports, and select which
        processing steps apply to each source.
      </p>

      {sources.length === 0 && (
        <div style={STYLES.infoBox}>
          💡 Start by adding a data source — give it a name (e.g. "workstations"
          or "rpdata") then drop in your CSV file. Select which processing steps
          apply to each source to normalize data before auditing.
          Uploaded data is session-only.
        </div>
      )}

      {loadedCount > 0 && loadedCount === sources.length && sources.length > 0 && (
        <div style={{
          ...STYLES.infoBox,
          backgroundColor: '#0f1f17', borderColor: '#064e3b', color: '#34d399'
        }}>
          ✓ All {loadedCount} source{loadedCount !== 1 ? 's' : ''} loaded and ready.
          Go to Preview & Run to execute your audit.
        </div>
      )}

      <div style={STYLES.grid}>
        {sources.map(source => (
          <DropzoneCard
            key={source.id}
            source={source}
            onFileLoad={handleFileLoad}
            onRemove={handleRemove}
            onStepToggle={handleStepToggle}
            processingSteps={processingSteps || []}
          />
        ))}

        {showAddForm ? (
          <div style={STYLES.card}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
              New Data Source
            </div>
            <input
              style={STYLES.input}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSource()}
              placeholder="Source name (e.g. workstations, rpdata)..."
              autoFocus
            />
            <div>
              <button style={STYLES.saveBtn} onClick={handleAddSource}>✓ Add</button>
              <button style={STYLES.cancelBtn} onClick={() => { setShowAddForm(false); setNewName(''); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={STYLES.addCard} onClick={() => setShowAddForm(true)}>
            <div style={{ fontSize: '28px', color: '#6b7280' }}>+</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Add Data Source</div>
          </div>
        )}
      </div>
    </div>
  );
}