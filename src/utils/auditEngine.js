// auditEngine.js
// Rebuilt audit engine supporting modular processing and audit modules

/**
 * Parses a CSV string into an array of objects using the header row as keys.
 * Handles quoted fields and commas inside quotes.
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
 * Key: username (email without domain). Value: { status, fullEmail }
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

// =================================================================
// PROCESSING MODULES
// These run first and transform/normalize the data before auditing
// =================================================================

/**
 * Normalizes site names using the configured mappings.
 */
function runSiteNormalization(rows, moduleConfig) {
  const { mappings = {} } = moduleConfig.config;
  const siteCol = moduleConfig.config.columnMapping?.site || 'Site';

  return rows.map(row => {
    const rawSite = row[siteCol] || '';
    return {
      ...row,
      [siteCol]: mappings[rawSite] || rawSite
    };
  });
}

/**
 * Strips email domain from configured columns.
 */
function runEmailNormalization(rows, moduleConfig) {
  const domain = moduleConfig.config.domainToStrip || '';
  return rows.map(row => {
    const newRow = { ...row };
    Object.keys(newRow).forEach(key => {
      if (typeof newRow[key] === 'string' && newRow[key].includes('@')) {
        newRow[key] = newRow[key].replace(domain, '').trim();
      }
    });
    return newRow;
  });
}

/**
 * Tags rows by OS category.
 */
function runOsFilter(rows, moduleConfig) {
  const { categories = {}, columnMapping = {} } = moduleConfig.config;
  const osCol = columnMapping.osName || 'OS Name';

  return rows.map(row => {
    const os = row[osCol] || '';
    let osCategory = 'Other';
    Object.entries(categories).forEach(([category, osName]) => {
      if (os === osName) osCategory = category;
    });
    return { ...row, _osCategory: osCategory };
  });
}

/**
 * Tags rows by state category (active vs flagged).
 */
function runStateFilter(rows, moduleConfig) {
  const {
    activeStates = [],
    flaggedStates = [],
    columnMapping = {}
  } = moduleConfig.config;
  const stateCol = columnMapping.state || 'State';

  return rows.map(row => {
    const state = row[stateCol] || '';
    let stateCategory = 'other';
    if (activeStates.includes(state)) stateCategory = 'active';
    if (flaggedStates.includes(state)) stateCategory = 'flagged';
    return { ...row, _stateCategory: stateCategory };
  });
}

// =================================================================
// AUDIT MODULES
// These run after processing and produce flagged rows
// =================================================================

/**
 * Checks if assigned user email is Active or Terminated in Rippling.
 */
function runEmailVsRoster(row, rosterMap, moduleConfig) {
  const emailCol = moduleConfig.config.columnMapping?.userEmail || 'User Email';
  const userEmail = (row[emailCol] || '').toLowerCase().trim();
  const username = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;

  if (!username) return null;

  const rosterEntry = rosterMap[username];
  if (!rosterEntry) return null;

  if (rosterEntry.status === 'Terminated') {
    return { module: 'emailVsRoster', reason: 'Terminated User (assigned email)' };
  }
  return null;
}

/**
 * Checks if last logged in user is Active or Terminated in Rippling.
 */
function runLastLoginVsRoster(row, rosterMap, moduleConfig) {
  const loginCol = moduleConfig.config.columnMapping?.lastLogin || 'Last Logged In User';
  const lastLogin = (row[loginCol] || '').toLowerCase().trim();

  if (!lastLogin || lastLogin === 'defaultuser0') return null;

  const rosterEntry = rosterMap[lastLogin];
  if (!rosterEntry) return null;

  if (rosterEntry.status === 'Terminated') {
    return { module: 'lastLoginVsRoster', reason: 'Terminated User (last login)' };
  }
  return null;
}

/**
 * Checks if assigned email matches last logged in user.
 */
function runEmailVsLastLogin(row, rosterMap, moduleConfig) {
  const emailCol = moduleConfig.config.columnMapping?.userEmail || 'User Email';
  const loginCol = moduleConfig.config.columnMapping?.lastLogin || 'Last Logged In User';

  const userEmail = (row[emailCol] || '').toLowerCase().trim();
  const lastLogin = (row[loginCol] || '').toLowerCase().trim();

  const username = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;

  if (!username || !lastLogin) return null;
  if (lastLogin === 'defaultuser0') return null;

  if (!areUsernamesEquivalent(username, lastLogin)) {
    return { module: 'emailVsLastLogin', reason: 'User Email and Last Login do not match' };
  }
  return null;
}

/**
 * Checks for state conflicts.
 */
function runStateConflict(row, rosterMap, moduleConfig) {
  const {
    invalidAssignedUser = 'defaultuser0',
    invalidAvailableUsers = ['defaultuser0', 'default'],
    columnMapping = {}
  } = moduleConfig.config;

  const stateCol = columnMapping.state || 'State';
  const loginCol = columnMapping.lastLogin || 'Last Logged In User';

  const state = row[stateCol] || '';
  const lastLogin = (row[loginCol] || '').toLowerCase().trim();

  if (state === 'Available' && !invalidAvailableUsers.includes(lastLogin) && lastLogin !== '') {
    return { module: 'stateConflict', reason: 'State is Available but has an active user' };
  }

  if (state === 'Assigned' && lastLogin === invalidAssignedUser) {
    return { module: 'stateConflict', reason: 'State is Assigned but user is defaultuser0' };
  }

  return null;
}

/**
 * Checks if asset has no user email on record.
 */
function runUnaccounted(row, rosterMap, moduleConfig) {
  const emailCol = moduleConfig.config.columnMapping?.userEmail || 'User Email';
  const userEmail = (row[emailCol] || '').trim();

  if (!userEmail) {
    return { module: 'unaccounted', reason: 'No user email on record' };
  }

  const username = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail;
  const rosterEntry = rosterMap[username];

  if (!rosterEntry) {
    return { module: 'unaccounted', reason: 'User not found in Rippling roster' };
  }

  return null;
}

/**
 * Checks if hardware model is in the known models list.
 */
function runOutstandingModels(row, rosterMap, moduleConfig) {
  const { knownModels = [], columnMapping = {} } = moduleConfig.config;
  const modelCol = columnMapping.model || 'Model';
  const model = row[modelCol] || '';

  if (knownModels.length === 0) return null;
  if (!knownModels.includes(model)) {
    return { module: 'outstandingModels', reason: `Unknown model: ${model}` };
  }
  return null;
}

/**
 * Checks if computer prefix matches expected location.
 */
function runLocationMismatch(row, rosterMap, moduleConfig) {
  const { prefixLocationMap = {}, columnMapping = {} } = moduleConfig.config;
  const computerCol = columnMapping.computer || 'Computer';
  const siteCol = columnMapping.site || 'Site';

  const computer = row[computerCol] || '';
  const site = row[siteCol] || '';

  if (Object.keys(prefixLocationMap).length === 0) return null;

  for (const [prefix, expectedSite] of Object.entries(prefixLocationMap)) {
    if (computer.startsWith(prefix) && site !== expectedSite) {
      return {
        module: 'locationMismatch',
        reason: `Computer prefix ${prefix} expected at ${expectedSite} but found at ${site}`
      };
    }
  }
  return null;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Checks if two usernames are equivalent.
 * Handles cases where names have different formatting.
 */
function areUsernamesEquivalent(userA, userB) {
  if (!userA || !userB) return false;
  if (userA === userB) return true;
  if (userA.startsWith(userB) || userB.startsWith(userA)) return true;
  const partsA = userA.split('.').sort();
  const partsB = userB.split('.').sort();
  if (partsA.length !== partsB.length) return false;
  return partsA.join('.') === partsB.join('.');
}

/**
 * Maps module IDs to their runner functions.
 */
const PROCESSING_RUNNERS = {
  siteNormalization: runSiteNormalization,
  emailNormalization: runEmailNormalization,
  osFilter: runOsFilter,
  stateFilter: runStateFilter
};

const AUDIT_RUNNERS = {
  emailVsRoster: runEmailVsRoster,
  lastLoginVsRoster: runLastLoginVsRoster,
  emailVsLastLogin: runEmailVsLastLogin,
  stateConflict: runStateConflict,
  unaccounted: runUnaccounted,
  outstandingModels: runOutstandingModels,
  locationMismatch: runLocationMismatch
};

// =================================================================
// MAIN AUDIT FUNCTION
// =================================================================

/**
 * Runs the full audit for a given asset type.
 * 1. Runs selected processing modules in order
 * 2. Runs selected audit modules on each row
 * 3. Returns categorized results
 */
export function runAudit(meDataRows, rosterMap, assetTypeConfig, modulePool) {
  const {
    selectedProcessingModules = [],
    selectedAuditModules = [],
    whitelist = [],
    blacklist = []
  } = assetTypeConfig;

  // --- STEP 1: Run Processing Modules ---
  let processedRows = [...meDataRows];

  selectedProcessingModules.forEach(moduleId => {
    const moduleConfig = modulePool.processing[moduleId];
    if (!moduleConfig || !moduleConfig.enabled) return;
    const runner = PROCESSING_RUNNERS[moduleId];
    if (runner) {
      processedRows = runner(processedRows, moduleConfig);
    }
  });

  // --- STEP 2: Run Audit Modules on each row ---
  const terminated = [];
  const unaccounted = [];
  const flagged = [];
  const blacklisted = [];
  const clean = [];

  processedRows.forEach(row => {
    // Check whitelist/blacklist first
    const serial = (row['Serial Number'] || row['Serial'] || '').trim().toLowerCase();

    if (blacklist.some(b => b.trim().toLowerCase() === serial)) {
      blacklisted.push({ ...row, 'Audit Reason': 'Suppressed - Blacklisted Asset' });
      return;
    }

    if (whitelist.some(w => w.trim().toLowerCase() === serial)) {
      clean.push(row);
      return;
    }

    // Run each selected audit module
    const findings = [];

    selectedAuditModules.forEach(moduleId => {
      const moduleConfig = modulePool.audit[moduleId];
      if (!moduleConfig || !moduleConfig.enabled) return;
      const runner = AUDIT_RUNNERS[moduleId];
      if (!runner) return;

      const result = runner(row, rosterMap, moduleConfig);
      if (result) findings.push(result);
    });

    // Categorize based on findings
    if (findings.length === 0) {
      clean.push(row);
      return;
    }

    const reasons = findings.map(f => f.reason).join('; ');
    const rowWithReason = { ...row, 'Audit Reason': reasons };

    // Route to correct output bucket
    const moduleIds = findings.map(f => f.module);

    if (moduleIds.includes('emailVsRoster') || moduleIds.includes('lastLoginVsRoster')) {
      terminated.push(rowWithReason);
    } else if (moduleIds.includes('unaccounted')) {
      unaccounted.push(rowWithReason);
    } else {
      flagged.push(rowWithReason);
    }
  });

  return { terminated, unaccounted, flagged, blacklisted, clean };
}