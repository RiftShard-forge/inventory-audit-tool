import React, { useState } from 'react';
import { resetConfig } from '../config/configManager';

const STYLES = {
  page: { maxWidth: '800px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  section: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '24px', marginBottom: '20px'
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  sectionDesc: { fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' },
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
  comingSoon: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '48px', textAlign: 'center',
    marginBottom: '20px'
  },
  comingSoonTitle: { fontSize: '16px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' },
  comingSoonDesc: { fontSize: '13px', color: '#6b7280' }
};

export default function Settings({ config, onConfigUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);

  function handleReset() {
    resetConfig();
    window.location.reload();
  }

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>Settings</h2>
      <p style={STYLES.subtitle}>
        Configure processing modules, site mappings, and manage app settings.
      </p>

      {/* Processing Module Settings - Coming Soon */}
      <div style={STYLES.comingSoon}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙</div>
        <div style={STYLES.comingSoonTitle}>Processing Module Settings</div>
        <div style={STYLES.comingSoonDesc}>
          Site normalization, email normalization, OS filter, and state filter
          configuration will be available here. Currently being rebuilt as part
          of the new modular architecture.
        </div>
      </div>

      {/* Reset Section */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>Reset Configuration</div>
        <p style={STYLES.sectionDesc}>
          This will clear all saved settings including asset configurations,
          module settings, whitelists, blacklists, and site mappings.
          Run history will also be cleared. This action cannot be undone.
        </p>
        <button style={STYLES.dangerBtn} onClick={() => setShowConfirm(true)}>
          ⚠ Reset All Settings
        </button>

        {showConfirm && (
          <div style={STYLES.confirmBox}>
            <p style={STYLES.confirmText}>
              Are you sure? This will delete all your configurations and cannot be undone.
            </p>
            <div style={STYLES.confirmBtns}>
              <button style={STYLES.confirmYes} onClick={handleReset}>
                Yes, reset everything
              </button>
              <button style={STYLES.confirmNo} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}