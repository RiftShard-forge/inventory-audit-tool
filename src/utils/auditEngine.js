// auditEngine.js
// Core audit logic - translates and improves on the Apps Script codebase

/**
 * Parses a CSV string into an array of objects using the header row as keys.
 */
export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return { header: [], rows: [] };

  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    values.push(current.trim());

    const obj = {};
    header.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });

  return { header, rows };
}

/**
 * Builds a fast lookup map from the Rippling roster data.
 * Key: work email (without domain). Value: { status, fullEmail }
 */
export function buildRosterMap(rosterRows) {
  const map = {};
  for (const row of rosterRows) {
    const email = (row['Work email'] || '').toLowerCase().trim();
    const status = (row['Employment status'] || '').trim();
    if (!email) continue;

    const username = email.includes('@') ? email.split('@')[0] : email;

    if (!map[username] || map[username].status === 'Terminated') {
      map[username] = { status, fullEmail: email };
    }
  }
  return map;
}

/**
 * Normalizes a site name using the module's siteMapping config.
 */
export function normalizeSite(siteName, siteMapping) {
  return siteMapping[siteName] || siteName;
}

/**
 * Checks if an asset serial number is in the whitelist or blacklist.
 */
export function checkLists(serial, whitelist, blacklist) {
  const s = (serial || '').trim().toLowerCase();
  const inWhitelist = whitelist.some(w => w.trim().toLowerCase() === s);
  const inBlacklist = blacklist.some(b => b.trim().toLowerCase() === s);
  return { inWhitelist, inBlacklist };
}

/**
 * MAIN AUDIT FUNCTION
 * Runs the audit for a given module against the provided data.
 */
export function runAudit(meDataRows, rosterMap, moduleConfig) {
  const { whitelist = [], blacklist = [], knownModels = [], siteMapping = {} } = moduleConfig;

  const terminated = [];
  const unaccounted = [];
  const blacklisted = [];
  const clean = [];

  for (const row of meDataRows) {
    const serial = (row['Serial Number'] || row['Serial'] || '').trim();
    const userEmail = (row['User Email'] || '').trim().toLowerCase();
    const username = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;

    // Normalize site name
    const siteName = row['Site'] || row['Work location name'] || '';
    row['Site'] = normalizeSite(siteName, siteMapping);

    // Check whitelist/blacklist first
    const { inWhitelist, inBlacklist } = checkLists(serial, whitelist, blacklist);

    if (inBlacklist) {
      blacklisted.push({ ...row, 'Audit Reason': 'Suppressed - Blacklisted Asset' });
      continue;
    }

    if (inWhitelist) {
      clean.push(row);
      continue;
    }

    // Check against roster
    if (!username) {
      unaccounted.push({ ...row, 'Audit Reason': 'No user email on record' });
      continue;
    }

    const rosterEntry = rosterMap[username];

    if (!rosterEntry) {
      unaccounted.push({ ...row, 'Audit Reason': 'User not found in Rippling roster' });
      continue;
    }

    if (rosterEntry.status === 'Terminated') {
      terminated.push({ ...row, 'Audit Reason': 'Terminated User' });
      continue;
    }

    clean.push(row);
  }

  return { terminated, unaccounted, blacklisted, clean };
}