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
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#1a1d27' },
  th: {
    textAlign: 'left', fontSize: '12px', fontWeight: '500',
    color: '#6b7280', padding: '12px 16px',
    borderBottom: '1px solid #2a2d3e'
  },
  tr: { borderBottom: '1px solid #1f2235', transition: 'background 0.1s' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#e0e0e0', verticalAlign: 'middle' },
  tdMuted: { padding: '14px 16px', fontSize: '12px', color: '#6b7280', verticalAlign: 'middle' },
  badge: {
    display: 'inline-block', fontSize: '11px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px', border: '1px solid'
  },
  statRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  stat: { fontSize: '12px' },
  terminated: { color: '#f87171' },
  unaccounted: { color: '#fb923c' },
  blacklisted: { color: '#a78bfa' },
  clean: { color: '#34d399' },
  card: {
    backgroundColor: '#1a1d27', border: '1px solid #2a2d3e',
    borderRadius: '12px', overflow: 'hidden'
  },
  summaryBar: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1px', backgroundColor: '#2a2d3e',
    borderTop: '1px solid #2a2d3e', marginTop: '0'
  },
  summaryCell: {
    backgroundColor: '#0f1117', padding: '16px',
    textAlign: 'center'
  },
  summaryNumber: { fontSize: '22px', fontWeight: '700', marginBottom: '4px' },
  summaryLabel: { fontSize: '11px', color: '#6b7280' }
};

const MODULE_BADGE_COLORS = {
  Workstations: { color: '#6366f1', borderColor: '#3730a3', backgroundColor: '#1e1b4b' },
  Monitors: { color: '#38bdf8', borderColor: '#0c4a6e', backgroundColor: '#0c1a2e' },
  Headsets: { color: '#fb923c', borderColor: '#7c2d12', backgroundColor: '#1f1108' }
};

export default function History({ config }) {
  const history = config.runHistory || [];

  // Calculate lifetime totals
  const totals = history.reduce((acc, entry) => {
    acc.terminated += entry.terminated || 0;
    acc.unaccounted += entry.unaccounted || 0;
    acc.blacklisted += entry.blacklisted || 0;
    acc.clean += entry.clean || 0;
    return acc;
  }, { terminated: 0, unaccounted: 0, blacklisted: 0, clean: 0 });

  if (history.length === 0) {
    return (
      <div style={STYLES.page}>
        <h2 style={STYLES.title}>History</h2>
        <p style={STYLES.subtitle}>A log of all audit runs performed in this browser.</p>
        <div style={STYLES.empty}>
          <div style={STYLES.emptyIcon}>◷</div>
          <div style={STYLES.emptyTitle}>No audit runs yet</div>
          <div style={STYLES.emptyDesc}>
            Run your first audit from the "Run Audit" page and it will appear here.
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

      {/* Lifetime Summary Bar */}
      <div style={{ ...STYLES.card, marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2d3e' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#9ca3af' }}>
            Lifetime Totals — {history.length} run{history.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={STYLES.summaryBar}>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#f87171' }}>{totals.terminated}</div>
            <div style={STYLES.summaryLabel}>Terminated</div>
          </div>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#fb923c' }}>{totals.unaccounted}</div>
            <div style={STYLES.summaryLabel}>Unaccounted</div>
          </div>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#a78bfa' }}>{totals.blacklisted}</div>
            <div style={STYLES.summaryLabel}>Suppressed</div>
          </div>
          <div style={STYLES.summaryCell}>
            <div style={{ ...STYLES.summaryNumber, color: '#34d399' }}>{totals.clean}</div>
            <div style={STYLES.summaryLabel}>Clean</div>
          </div>
        </div>
      </div>

      {/* Run Log Table */}
      <div style={STYLES.card}>
        <table style={STYLES.table}>
          <thead style={STYLES.thead}>
            <tr>
              <th style={STYLES.th}>Date & Time</th>
              <th style={STYLES.th}>Module</th>
              <th style={STYLES.th}>Files Used</th>
              <th style={STYLES.th}>Results</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => {
              const badgeColor = MODULE_BADGE_COLORS[entry.asset] || {
                color: '#9ca3af', borderColor: '#374151', backgroundColor: '#1f2937'
              };
              return (
                <tr key={index} style={STYLES.tr}>
                  <td style={STYLES.tdMuted}>{entry.date}</td>
                  <td style={STYLES.td}>
                    <span style={{ ...STYLES.badge, ...badgeColor }}>
                      {entry.asset}
                    </span>
                  </td>
                  <td style={STYLES.tdMuted}>
                    <div>{entry.meFile}</div>
                    <div>{entry.rosterFile}</div>
                  </td>
                  <td style={STYLES.td}>
                    <div style={STYLES.statRow}>
                      <span style={{ ...STYLES.stat, ...STYLES.terminated }}>
                        ● {entry.terminated} terminated
                      </span>
                      <span style={{ ...STYLES.stat, ...STYLES.unaccounted }}>
                        ● {entry.unaccounted} unaccounted
                      </span>
                      <span style={{ ...STYLES.stat, ...STYLES.blacklisted }}>
                        ● {entry.blacklisted} suppressed
                      </span>
                      <span style={{ ...STYLES.stat, ...STYLES.clean }}>
                        ● {entry.clean} clean
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}