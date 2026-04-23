// auditEngine.js
// Rule-based audit engine — fully user-defined, no hardcoded logic

/**
 * Parses a CSV string into header and rows.
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
    header.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });

  return { header, rows };
}

// =================================================================
// PROCESSING MODULE RUNNERS
// These normalize/transform data before auditing
// =================================================================

function runSiteNormalization(rows, moduleConfig) {
  const { mappings = {} } = moduleConfig.config;
  return rows.map(row => {
    const newRow = { ...row };
    Object.keys(newRow).forEach(key => {
      if (mappings[newRow[key]]) {
        newRow[key] = mappings[newRow[key]];
      }
    });
    return newRow;
  });
}

function runEmailNormalization(rows, moduleConfig) {
  const domain = moduleConfig.config.domainToStrip || '';
  if (!domain) return rows;
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

function runStateFilter(rows, moduleConfig) {
  const { activeStates = [], flaggedStates = [], columnMapping = {} } = moduleConfig.config;
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
// PROCESSING STEP RUNNERS
// =================================================================

/**
 * Runs a single processing step against all rows.
 * Types:
 *   mapValue  — replace specific values in a column with mapped values
 *   stripText — remove a substring from values in a column
 *   tagByValue — add a tag column based on value matching
*/
function runProcessingStep(rows, step) {
  const { type, columnName, config: stepConfig } = step;
  if (!columnName) return rows;

  switch (type) {
    case 'mapValue': {
      const { mappings = {} } = stepConfig;
      return rows.map(row => {
        const val = row[columnName];
        return { ...row, [columnName]: mappings[val] || val };
      });
    }
    case 'stripText': {
      const { textToStrip = '' } = stepConfig;
      if (!textToStrip) return rows;
      return rows.map(row => {
        const val = (row[columnName] || '').toString();
        return { ...row, [columnName]: val.replace(textToStrip, '').trim() };
      });
    }
    case 'tagByValue': {
      const { tagColumn = '_tag', valueTags = {} } = stepConfig;
      return rows.map(row => {
        const val = row[columnName];
        const tag = valueTags[val] || 'other';
        return { ...row, [tagColumn]: tag };
      });
    }
    default:
      return rows;
  }
}
// =================================================================
// OPERATOR FUNCTIONS
// Apply comparison logic between two values
// =================================================================

function applyOperator(sourceValue, operator, compareValue) {
  const src = (sourceValue || '').toString().toLowerCase().trim();
  const cmp = (compareValue || '').toString().toLowerCase().trim();

  switch (operator) {
    case 'equals': return src === cmp;
    case 'is not': return src !== cmp;
    case 'contains': return src.includes(cmp);
    case 'does not contain': return !src.includes(cmp);
    case 'starts with': return src.startsWith(cmp);
    case 'ends with': return src.endsWith(cmp);
    case 'is empty': return src === '';
    case 'is not empty': return src !== '';
    default: return src === cmp;
  }
}

// =================================================================
// RULE EVALUATION
// Evaluates a single rule against a single row
// =================================================================

/**
 * Evaluates a rule against a row from the primary source.
 * Rules can compare:
 *   - A column value against a static value
 *   - A column value against a column in another data source (lookup)
 */
function evaluateRule(rule, row, allSources) {
  const {
    sourceId,           // which data source the primary column comes from
    sourceColumn,       // column name in that source
    operator,           // comparison operator
    compareType,        // 'value' or 'lookup'
    compareValue,       // static value to compare against (if compareType === 'value')
    lookupSourceId,     // which source to look up in (if compareType === 'lookup')
    lookupKeyColumn,    // column in lookup source to match by
    lookupValueColumn,  // column in lookup source to get the value from
    matchKeyColumn      // column in primary row to use as the lookup key
  } = rule;

  // Get the source value from the primary row
  const primaryValue = row[sourceColumn] || '';

  if (compareType === 'value') {
    // Simple comparison against a static value
    return applyOperator(primaryValue, operator, compareValue);
  }

  if (compareType === 'lookup') {
    // Cross-reference lookup against another data source
    const lookupSource = allSources[lookupSourceId];
    if (!lookupSource || !lookupSource.rows) return false;

    // The key to match in the lookup source
    const matchKey = (row[matchKeyColumn] || '').toLowerCase().trim();

    // Find the matching row in the lookup source
    const matchedRow = lookupSource.rows.find(lr => {
      const lrKey = (lr[lookupKeyColumn] || '').toLowerCase().trim();
      return lrKey === matchKey;
    });

    if (!matchedRow) {
      // No match found — treat as a special case
      return operator === 'is not found';
    }

    const lookupValue = matchedRow[lookupValueColumn] || '';
    // If compareValue is set, compare lookup result against it
    // Otherwise compare primary value against lookup value
    if (compareValue) {
      return applyOperator(lookupValue, operator, compareValue);
    }
    return applyOperator(primaryValue, operator, lookupValue);
  }

  return false;
}

// =================================================================
// MAIN AUDIT FUNCTION
// =================================================================

/**
 * Runs the full audit for a given asset type.
 *
 * @param {Object} primarySource - The main data source { rows, headers }
 * @param {Object} allSources - All loaded data sources { sourceId: { rows, headers } }
 * @param {Object} assetTypeConfig - The selected asset type config
 * @param {Array} auditRules - All user-defined audit rules
 * @param {Object} processingModules - Processing module configs
 * @returns {Object} results - { byCategory, clean, summary }
 */
export function runAudit(primarySource, allSources, assetTypeConfig, auditRules, processingSteps) {
  const { selectedRules = [], whitelist = [], blacklist = [] } = assetTypeConfig;

  // --- STEP 1: Get applicable rules, sorted by severity (1 first) ---
  const applicableRules = auditRules
    .filter(rule => selectedRules.includes(rule.id))
    .sort((a, b) => (a.severity || 10) - (b.severity || 10));

  // --- STEP 2: Run processing modules on primary source rows ---
  let processedRows = [...primarySource.rows];

  if (processingSteps && processingSteps.length > 0) {
    const selectedStepIds = assetTypeConfig.selectedProcessingSteps || [];
    const stepsToRun = processingSteps
      .filter(step => step.enabled && selectedStepIds.includes(step.id))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    stepsToRun.forEach(step => {
      processedRows = runProcessingStep(processedRows, step);
    });
  }

  // --- STEP 3: Evaluate rules against each row ---
  const byCategory = {}; // { categoryName: [rows] }
  const clean = [];
  const blacklisted = [];

  processedRows.forEach(row => {
    // Check whitelist/blacklist
    const serial = (
      row['Serial Number'] || row['Serial'] ||
      row['Computer'] || row['Asset Tag'] || ''
    ).trim().toLowerCase();

    if (blacklist.some(b => b.trim().toLowerCase() === serial)) {
      blacklisted.push({ ...row, '_Audit Reason': 'Suppressed - Blacklisted' });
      return;
    }

    if (whitelist.some(w => w.trim().toLowerCase() === serial)) {
      clean.push(row);
      return;
    }

    // Evaluate each applicable rule in severity order
    const findings = [];

    for (const rule of applicableRules) {
      try {
        const triggered = evaluateRule(rule, row, allSources);
        if (triggered) {
          findings.push({
            rule,
            reason: rule.flagReason || rule.name
          });
        }
      } catch (e) {
        console.warn(`Rule "${rule.name}" evaluation error:`, e.message);
      }
    }

    if (findings.length === 0) {
      clean.push(row);
      return;
    }

    // Route to categories
    findings.forEach(finding => {
      const category = finding.rule.category || 'Uncategorized';
      if (!byCategory[category]) byCategory[category] = [];
      const existingIndex = byCategory[category].findIndex(r =>
        JSON.stringify(r) === JSON.stringify({ ...row, '_Audit Reason': finding.reason })
      );
      if (existingIndex === -1) {
        byCategory[category].push({
          ...row,
          '_Audit Reason': finding.reason,
          '_Rule': finding.rule.name,
          '_Severity': finding.rule.severity || 10
        });
      }
    });
  });

  // --- STEP 4: Build summary ---
  const totalFlagged = Object.values(byCategory).reduce((sum, rows) => sum + rows.length, 0);
  const summary = {
    totalProcessed: processedRows.length,
    totalFlagged,
    totalBlacklisted: blacklisted.length,
    totalClean: clean.length,
    byCategory: Object.keys(byCategory).reduce((acc, cat) => {
      acc[cat] = byCategory[cat].length;
      return acc;
    }, {})
  };

  return { byCategory, blacklisted, clean, summary };
}