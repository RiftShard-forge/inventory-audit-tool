import React from 'react';

const STYLES = {
  page: { maxWidth: '900px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  empty: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', padding: '48px', textAlign: 'center'
  },
  emptyIcon: { fontSize: '40px', marginBottom: '16px' },
  emptyTitle: { fontSize: '16px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' },
  emptyDesc: { fontSize: '13px', color: '#6b7280' },
  card: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', overflow: 'hidden', marginBottom: '24px'
  },
  summaryHeader: { padding: '16px 20px', borderBottom: '1px solid #2a2d3e' },
  summaryHeaderText: { fontSize: '14px', fontWeight: '500', color: '#9ca3af' },
  summaryBar: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px', backgroundColor: '#2a2d3e'
  },
  summaryCell: { backgroundColor: '#0f1117', padding: '16px', textAlign: 'center' },
  summaryNumber: { fontSize: '22px', fontWeight: '700', marginBottom: '4px' },
  summaryLabel: { fontSize: '11px', color: '#6b7280' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#1a1d27' },
  th: {
    textAlign: 'left', fontSize: '12px', fontWeight: '500',
    color: '#6b7280', padding: '12px 16px', borderBottom: '1px solid #2a2d3e'
  },
  tr: { borderBottom: '1px solid #1f2235' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#e0e0e0', verticalAlign: 'top' },
  tdMuted: { padding: '14px 16px', fontSize: '12px', color: '#6b7280', verticalAlign: 'top' },
  badge: {
    display: 'inline-block', fontSize: '11px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px', border: '1px solid',
    color: '#6366f1', borderColor: '#3730a3', backgroundColor: '#1e1b4b'
  },
  categoryPill: {
    display: 'inline-block', fontSize: '11px', padding: '2px 8px',
    borderRadius: '4px', backgroundColor: '#1e1b4b',
    border: '1px solid #3730a3', color: '#a78bfa', margin: '2px'
  },
  statRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }
};

export default function History({ config }) {
  const history = config.runHistory || [];

  const totals = history.reduce((acc, entry) => {
    acc.totalProcessed += entry.totalProcessed || 0;
    acc.totalFlagged += entry.totalFlagged || 0;
    acc.totalClean += entry.totalClean || 0;
    return acc;
  }, { totalProcessed: 0, totalFlagged: 0, totalClean: 0 });

  if (history.length === 0) {
    return (
      <div style={STYLES.page}>
        <h2 style={STYLES.title}>History</h2>
        <p style={STYLES.subtitle}>A log of all audit runs performed in this browser.</p>
        <div style={STYLES.empty}>
          <div style={STYLES.emptyIcon}>◷</div>
          <div style={STYLES.emptyTitle}>No audit runs yet</div>
          <div style={STYLES.emptyDesc}>
            Configure your rules and run your first audit from the Preview & Run page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.page}>
      <h2 style={STYLES.title}>History</h2>
      <p style={STYLES.subtitle}>
        A log of all audit runs performed in this browser. Stores up to 50 runs.
      </p>

      {/* Lifetime Summary */}
      <div style={STYLES.card}>
        <div style={STYLES.summaryHeader}>
          <span style={STYLES.summaryHeaderText}>
            Lifetime Totals — {history.length} run{history.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={STYLES.summaryBar}>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#e0e0e0' }}>{totals.totalProcessed}</div>
            <div style={STYLES.summaryLabel}>Total Processed</div>
          </div>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#f87171' }}>{totals.totalFlagged}</div>
            <div style={STYLES.summaryLabel}>Total Flagged</div>
          </div>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#34d399' }}>{totals.totalClean}</div>
            <div style={STYLES.summaryLabel}>Total Clean</div>
          </div>
        </div>
      </div>

      {/* Run Log */}
      <div style={STYLES.card}>
        <table style={STYLES.table}>
          <thead style={STYLES.thead}>
            <tr>
              <th style={STYLES.th}>Date & Time</th>
              <th style={STYLES.th}>Asset Type</th>
              <th style={STYLES.th}>Sources Used</th>
              <th style={STYLES.th}>Results</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index} style={STYLES.tr}>
                <td style={STYLES.tdMuted}>{entry.date}</td>
                <td style={STYLES.td}>
                  <span style={STYLES.badge}>{entry.asset}</span>
                </td>
                <td style={STYLES.tdMuted}>
                  {(entry.sources || '').split(', ').map(s => (
                    <div key={s}>{s}</div>
                  ))}
                </td>
                <td style={STYLES.td}>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#34d399' }}>● {entry.totalClean} clean</span>
                    {' · '}
                    <span style={{ color: '#f87171' }}>● {entry.totalFlagged} flagged</span>
                    {entry.totalBlacklisted > 0 && (
                      <span style={{ color: '#a78bfa' }}>{' · '}● {entry.totalBlacklisted} suppressed</span>
                    )}
                  </div>
                  {entry.byCategory && Object.entries(entry.byCategory).map(([cat, count]) => (
                    <span key={cat} style={STYLES.categoryPill}>
                      {cat}: {count}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}