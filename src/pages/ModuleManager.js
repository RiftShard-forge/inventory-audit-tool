import React from 'react';

const STYLES = {
  page: { maxWidth: '900px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  comingSoon: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '48px', textAlign: 'center'
  },
  comingSoonTitle: { fontSize: '16px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' },
  comingSoonDesc: { fontSize: '13px', color: '#6b7280' }
};

export default function ModuleManager({ config, onConfigUpdate }) {
  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Module Manager</h2>
      <p style={STYLES.subtitle}>
        Manage asset types and configure audit modules.
      </p>
      <div style={STYLES.comingSoon}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙</div>
        <div style={STYLES.comingSoonTitle}>Being rebuilt</div>
        <div style={STYLES.comingSoonDesc}>
          The Module Manager is being rebuilt with the new modular architecture.
          Asset types, module pool, and per-asset module selection coming shortly.
        </div>
      </div>
    </div>
  );
}