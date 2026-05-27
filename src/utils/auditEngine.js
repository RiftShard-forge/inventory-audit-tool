// auditEngine.js
// Rule-based audit engine — fully user-defined, no hardcoded logic

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
// PROCESSING STEP RUNNERS
// =================================================================

function runProcessingStep(rows, step, allSources = {}) {
  const { type, columnName, config: stepConfig } = step;

  switch (type) {

    case 'mapValue': {
      if (!columnName) return rows;
      const { mappings = {} } = stepConfig;
      return rows.map(row => {
        const val = row[columnName];
        return { ...row, [columnName]: mappings[val] || val };
      });
    }

    case 'stripText': {
      if (!columnName) return rows;
      const { textToStrip = '' } = stepConfig;
      if (!textToStrip) return rows;
      return rows.map(row => {
        const val = (row[columnName] || '').toString();
        return { ...row, [columnName]: val.replace(textToStrip, '').trim() };
      });
    }

    case 'tagByValue': {
      if (!columnName) return rows;
      const { tagColumn = '_tag', valueTags = {} } = stepConfig;
      return rows.map(row => {
        const val = row[columnName];
        const tag = valueTags[val] || 'other';
        return { ...row, [tagColumn]: tag };
      });
    }

    case 'deduplicateRows': {
      const {
        deduplicateBy = '',
        dateColumn = '',
        tiebreakerColumn = '',
        tiebreakerValue = ''
      } = stepConfig;
      if (!deduplicateBy || !dateColumn) return rows;

      const seen = new Map();
      rows.forEach(row => {
        const key = (row[deduplicateBy] || '').toLowerCase().trim();
        if (!key) return;
        const existing = seen.get(key);
        if (!existing) {
          seen.set(key, row);
        } else {
          const existingDate = new Date(existing[dateColumn] || 0);
          const currentDate = new Date(row[dateColumn] || 0);
          if (currentDate > existingDate) {
            seen.set(key, row);
          } else if (
            currentDate.getTime() === existingDate.getTime() &&
            tiebreakerColumn && tiebreakerValue
          ) {
            // Same date — use tiebreaker: prefer row where tiebreakerColumn matches tiebreakerValue
            const currentVal = (row[tiebreakerColumn] || '').toLowerCase().trim();
            const preferredVal = tiebreakerValue.toLowerCase().trim();
            if (currentVal === preferredVal) seen.set(key, row);
          }
        }
      });
      return Array.from(seen.values());
    }

    case 'flagDuplicates': {
      if (!columnName) return rows;
      const { tagColumn = '_isDuplicate' } = stepConfig;

      // Count occurrences of each value in the column
      const valueCounts = new Map();
      rows.forEach(row => {
        const val = (row[columnName] || '').toString().toLowerCase().trim();
        if (!val) return;
        valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
      });

      // Tag rows where the value appears more than once
      return rows.map(row => {
        const val = (row[columnName] || '').toString().toLowerCase().trim();
        const isDuplicate = (valueCounts.get(val) || 0) > 1;
        return { ...row, [tagColumn]: isDuplicate ? 'true' : 'false' };
      });
    }

    case 'conditionalMap': {
      if (!columnName) return rows;
      const { operator = 'contains', matchValue = '', targetColumn = '', targetValue = '' } = stepConfig;
      if (!matchValue || !targetColumn) return rows;

      return rows.map(row => {
        const src = (row[columnName] || '').toLowerCase().trim();
        const cmp = matchValue.toLowerCase().trim();
        let matches = false;
        if (operator === 'contains') matches = src.includes(cmp);
        else if (operator === 'equals') matches = src === cmp;
        else if (operator === 'starts with') matches = src.startsWith(cmp);
        else if (operator === 'ends with') matches = src.endsWith(cmp);
        return matches ? { ...row, [targetColumn]: targetValue } : row;
      });
    }

    case 'enrichFromLookup': {
      const {
        sourceColumn: keyColumn = '',
        lookupSourceId = '',
        lookupKeyColumn = '',
        lookupValueColumn = '',
        newColumnName = ''
      } = stepConfig;

      if (!keyColumn || !lookupSourceId || !lookupKeyColumn || !lookupValueColumn || !newColumnName) {
        return rows;
      }

     const lookupSource = allSources[lookupSourceId];

      if (!lookupSource || !lookupSource.rows) {
        console.warn(`enrichFromLookup: lookup source "${lookupSourceId}" not loaded`);
        return rows.map(row => ({ ...row, [newColumnName]: '' }));
      }

      // Build a fast lookup map from the lookup source
      const lookupMap = new Map();
      lookupSource.rows.forEach(lr => {
        const key = (lr[lookupKeyColumn] || '').toString().toLowerCase().trim();
        if (key) lookupMap.set(key, lr[lookupValueColumn] || '');
      });

      // Add the new column to each row
      return rows.map(row => {
        const key = (row[keyColumn] || '').toString().toLowerCase().trim();
        const value = lookupMap.get(key) || '';
        return { ...row, [newColumnName]: value };
      });
    }

    default:
      return rows;
  }
}

// =================================================================
// OPERATOR FUNCTIONS
// =================================================================

function applyOperator(sourceValue, operator, compareValue) {
  // Numeric operators — parse both sides as numbers, compare
  const numericOperators = ['greater than', 'less than', 'greater than or equal', 'less than or equal'];
  if (numericOperators.includes(operator)) {
    const srcNum = parseFloat(sourceValue);
    if (isNaN(srcNum)) return false;

    const cmpNum = parseFloat(compareValue);
    if (isNaN(cmpNum)) return false;

    switch (operator) {
      case 'greater than': return srcNum > cmpNum;
      case 'less than': return srcNum < cmpNum;
      case 'greater than or equal': return srcNum >= cmpNum;
      case 'less than or equal': return srcNum <= cmpNum;
      default: return false;
    }
  }

  const src = (sourceValue || '').toString().toLowerCase().trim();

  // Check if compareValue contains semicolon-separated values
  const multiValueOperators = ['equals', 'is not', 'contains', 'does not contain', 'starts with', 'ends with'];
  if (multiValueOperators.includes(operator) && (compareValue || '').toString().includes(';')) {
    const values = compareValue.toString().split(';').map(v => v.trim().toLowerCase()).filter(v => v);
    
    switch (operator) {
      case 'equals': return values.some(cmp => src === cmp);
      case 'is not': return values.every(cmp => src !== cmp);
      case 'contains': return values.some(cmp => src.includes(cmp));
      case 'does not contain': return values.every(cmp => !src.includes(cmp));
      case 'starts with': return values.some(cmp => src.startsWith(cmp));
      case 'ends with': return values.some(cmp => src.endsWith(cmp));
      default: return values.some(cmp => src === cmp);
    }
  }

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
    case 'is not found': return false;
    default: return src === cmp;
  }
}


// =================================================================
// FILTER EVALUATOR
// Evaluates a filter rule against a row.
// Returns 'whitelist', 'blacklist', or null.
// =================================================================

function evaluateFilter(filter, row) {
  const { column, operator, values } = filter;
  if (!column || !values || values.length === 0) return null;

  const rowValue = (row[column] || '').toString().toLowerCase().trim();

  // Check if any of the filter values match
  const matched = values.some(val => {
    const cmp = val.toLowerCase().trim();
    switch (operator) {
      case 'equals': return rowValue === cmp;
      case 'is not': return rowValue !== cmp;
      case 'contains': return rowValue.includes(cmp);
      case 'does not contain': return !rowValue.includes(cmp);
      case 'starts with': return rowValue.startsWith(cmp);
      case 'ends with': return rowValue.endsWith(cmp);
      default: return rowValue === cmp;
    }
  });

  return matched ? filter.type : null;
}

// =================================================================
// SINGLE CONDITION EVALUATOR
// =================================================================

function evaluateCondition(condition, row, allSources) {
  const {
    sourceColumn,
    operator,
    compareType,
    compareValue,
    lookupSourceId,
    lookupKeyColumn,
    lookupValueColumn,
    matchKeyColumn
  } = condition;

  const primaryValue = row[sourceColumn] || '';

  if (compareType === 'value' || !compareType) {
    const resolvedCompareValue = (compareValue && row.hasOwnProperty(compareValue))
      ? row[compareValue]
      : compareValue;
    return applyOperator(primaryValue, operator, resolvedCompareValue);
  }

  if (compareType === 'lookup') {
    const lookupSource = allSources[lookupSourceId];
    if (!lookupSource || !lookupSource.rows) return false;

    const matchKey = (row[matchKeyColumn] || '').toLowerCase().trim();
    const matchedRow = lookupSource.rows.find(lr => {
      const lrKey = (lr[lookupKeyColumn] || '').toLowerCase().trim();
      return lrKey === matchKey;
    });

    if (!matchedRow) return operator === 'is not found';

    const lookupValue = matchedRow[lookupValueColumn] || '';

    if (compareValue) {
      const resolvedCompareValue = (compareValue && row.hasOwnProperty(compareValue))
        ? row[compareValue]
        : compareValue;
      return applyOperator(lookupValue, operator, resolvedCompareValue);
    }

    return applyOperator(primaryValue, operator, lookupValue);
  }

  return false;
}

// =================================================================
// RULE EVALUATOR
// =================================================================

function evaluateRule(rule, row, allSources) {
  if (rule.conditions && rule.conditions.length > 0) {
    let result = false;
    let currentGroupResult = true;

    rule.conditions.forEach((condition, idx) => {
      let condResult = false;
      try {
        condResult = evaluateCondition(condition, row, allSources);
      } catch (e) {
        console.warn(`Condition error in rule "${rule.name}":`, e.message);
      }

      if (idx === 0) {
        currentGroupResult = condResult;
        result = condResult;
      } else {
        const connector = condition.connector || 'AND';
        if (connector === 'AND') {
          currentGroupResult = currentGroupResult && condResult;
          result = currentGroupResult;
        } else if (connector === 'OR') {
          result = result || condResult;
          currentGroupResult = condResult;
        }
      }
    });

    return result;
  }

  try {
    return evaluateCondition(rule, row, allSources);
  } catch (e) {
    console.warn(`Rule "${rule.name}" evaluation error:`, e.message);
    return false;
  }
}

// =================================================================
// DELTA DETECTION
// Compares assets listed in Access Rules against previous audit data.
// Detects column-level changes between previous and current state.
//
// Scope:
// - Runs only on Access Rules whose column === profile.identifierColumn
// - Runs on all rule types (whitelist, blacklist, watchlist)
// - Tracks each value (e.g. serial number) listed in the rule's values[]
// - Compares all non-metadata columns (skips _ prefixed columns)
// - Missing from current data → flagged as Missing
// - Any column changed → flagged with old → new details
// - Asset is NOT removed from Access Rule values[] (manual review)
//
// Returns: { deltaAssets[] }
// =================================================================

export function runDeltaDetection(globalFilters, previousAudit, processedRows, identifierColumn) {
  if (!previousAudit || !previousAudit.sheets) {
    return { deltaAssets: [] };
  }
  if (!identifierColumn) {
    console.warn('runDeltaDetection: no identifierColumn provided, skipping');
    return { deltaAssets: [] };
  }

  const deltaAssets = [];

  // Build a flat map of all previous-audit rows keyed by identifier value.
  // Skips Summary and Unaccounted tabs.
  const previousByIdentifier = new Map();
  Object.entries(previousAudit.sheets).forEach(([tabName, rows]) => {
    if (tabName === 'Summary' || tabName === '⚠ Unaccounted') return;
    rows.forEach(row => {
      const key = (row[identifierColumn] || '').toString().toLowerCase().trim();
      if (!key) return;
      // First occurrence wins. If an asset appears in multiple tabs in the
      // previous audit, this won't happen in practice for whitelist bypass
      // (always Clean), but we handle defensively.
      if (!previousByIdentifier.has(key)) {
        previousByIdentifier.set(key, { row, tabName });
      }
    });
  });

  // Build a flat map of current processed rows keyed by identifier value.
  const currentByIdentifier = new Map();
  processedRows.forEach(row => {
    const key = (row[identifierColumn] || '').toString().toLowerCase().trim();
    if (!key) return;
    currentByIdentifier.set(key, row);
  });

  // For each Access Rule whose column targets the identifier column,
  // walk its values[] and look for deltas.
  globalFilters.forEach(filter => {
    if (filter.column !== identifierColumn) return;
    if (!filter.values || filter.values.length === 0) return;
    if ((filter.operator || 'equals') !== 'equals') return;

    filter.values.forEach(value => {
      const key = value.toString().toLowerCase().trim();
      if (!key) return;

      const previousEntry = previousByIdentifier.get(key);
      const currentRow = currentByIdentifier.get(key);

      // Case 1: asset was in previous audit but not in current data
      if (previousEntry && !currentRow) {
        deltaAssets.push({
          [identifierColumn]: value,
          '_Audit Reason': `Asset listed in "${filter.label || filter.id}" is no longer present in current data`,
          '_Delta Type': 'Missing',
          '_Previous Tab': previousEntry.tabName,
          '_Access Rule': filter.label || filter.id
        });
        return;
      }

      // Case 2: asset is in both audits — compare column-by-column
      if (previousEntry && currentRow) {
        const previousRow = previousEntry.row;
        const changes = [];

        // Walk every key on the current row that is not metadata.
        Object.keys(currentRow).forEach(col => {
          if (col.startsWith('_')) return;
          const prevVal = (previousRow[col] !== undefined && previousRow[col] !== null)
            ? previousRow[col].toString().trim()
            : '';
          const currVal = (currentRow[col] !== undefined && currentRow[col] !== null)
            ? currentRow[col].toString().trim()
            : '';
          if (prevVal !== currVal) {
            changes.push(`${col} (${prevVal || 'empty'} → ${currVal || 'empty'})`);
          }
        });

        // Also walk previous-row keys in case columns existed before but are gone now
        Object.keys(previousRow).forEach(col => {
          if (col.startsWith('_')) return;
          if (Object.prototype.hasOwnProperty.call(currentRow, col)) return;
          const prevVal = (previousRow[col] !== undefined && previousRow[col] !== null)
            ? previousRow[col].toString().trim()
            : '';
          if (prevVal) {
            changes.push(`${col} (${prevVal} → removed)`);
          }
        });

        if (changes.length > 0) {
          deltaAssets.push({
            ...currentRow,
            '_Audit Reason': `Tracked asset changed: ${changes.join(', ')}`,
            '_Delta Type': 'Changed',
            '_Previous Tab': previousEntry.tabName,
            '_Access Rule': filter.label || filter.id
          });
        }
        // No changes = no delta entry. Asset still appears in its normal output tab.
        return;
      }

      // Case 3: asset was not in previous audit (new addition to the list).
      // No delta — nothing to compare against.
    });
  });

  return { deltaAssets };
}

// =================================================================
// MAIN AUDIT FUNCTION
// =================================================================

export function runAudit(primarySource, allSources, assetTypeConfig, auditRules, processingSteps, allSourcesRaw, globalFilters = [], previousAudit = null) {
  const { selectedRules = [] } = assetTypeConfig;
  const profileId = assetTypeConfig.id || '';

  // Get applicable filters for this profile
  // A filter applies if profileIds is empty (all profiles) or contains this profile's id
  const filters = globalFilters.filter(f =>
    !f.profileIds || f.profileIds.length === 0 || f.profileIds.includes(profileId)
  );

  // STEP 1: Get applicable rules sorted by severity
  const applicableRules = auditRules
    .filter(rule => selectedRules.includes(rule.id))
    .sort((a, b) => (a.severity ?? Infinity) - (b.severity ?? Infinity));

  // Build category severity map
  const categorySeverity = {};
  applicableRules.forEach(rule => {
    const cat = rule.category || 'Uncategorized';
    const current = categorySeverity[cat] ?? Infinity;
    categorySeverity[cat] = Math.min(current, rule.severity ?? Infinity);
  });

  // STEP 2: Run processing steps per source — TWO PASSES
  // Pass 1: single-source steps (each source independently)
  // Pass 2: cross-source steps (run after all sources fully processed)
  // This ensures cross-source steps like enrichFromLookup can see fully processed lookup sources.

  const CROSS_SOURCE_STEP_TYPES = ['enrichFromLookup'];
  const isCrossSourceStep = step => CROSS_SOURCE_STEP_TYPES.includes(step.type);

  // Helper: run a subset of steps on a row array
  function runStepsOnRows(rows, allStepIds, filterFn, allSrc) {
    if (!processingSteps || processingSteps.length === 0) return rows;
    const stepsToRun = processingSteps
      .filter(step => step.enabled && allStepIds.includes(step.id) && filterFn(step))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    let result = rows;
    stepsToRun.forEach(step => {
      result = runProcessingStep(result, step, allSrc);
    });
    return result;
  }

  // -------- PASS 1: single-source steps on primary source --------
  let processedRows = [...primarySource.rows];
  const primaryStepIds = primarySource.selectedProcessingSteps || [];
  processedRows = runStepsOnRows(processedRows, primaryStepIds, step => !isCrossSourceStep(step), allSourcesRaw || {});

  // -------- PASS 1: single-source steps on all other sources --------
  const processedSources = { ...allSources };
  if (allSourcesRaw) {
    Object.keys(allSourcesRaw).forEach(sourceId => {
      const source = allSourcesRaw[sourceId];
      if (!source || !source.rows) return;
      const stepIds = source.selectedProcessingSteps || [];
      if (stepIds.length === 0) {
        processedSources[sourceId] = source;
        return;
      }
      const processedSourceRows = runStepsOnRows([...source.rows], stepIds, step => !isCrossSourceStep(step), allSourcesRaw);
      processedSources[sourceId] = { ...source, rows: processedSourceRows };
    });
  }

  // -------- PASS 2: cross-source steps now run with all sources fully prepared --------
  // For cross-source steps, we pass processedSources (the fully-processed map) so lookups work.
  processedRows = runStepsOnRows(processedRows, primaryStepIds, step => isCrossSourceStep(step), processedSources);

  if (allSourcesRaw) {
    Object.keys(allSourcesRaw).forEach(sourceId => {
      const source = allSourcesRaw[sourceId];
      if (!source || !source.rows) return;
      const stepIds = source.selectedProcessingSteps || [];
      if (stepIds.length === 0) return;
      const updatedRows = runStepsOnRows([...processedSources[sourceId].rows], stepIds, step => isCrossSourceStep(step), processedSources);
      processedSources[sourceId] = { ...processedSources[sourceId], rows: updatedRows };
    });
  }

  // STEP 3: Evaluate filters and rules against each row
  const byCategory = {};
  const clean = [];
  const blacklisted = [];
  const underInvestigation = [];

  processedRows.forEach(row => {

    // Evaluate filter rules first (whitelist/blacklist)
    // First matching filter wins — same priority logic as audit rules
    let filterResult = null;
    for (const filter of filters) {
      const result = evaluateFilter(filter, row);
      if (result) { filterResult = result; break; }
    }

    if (filterResult === 'blacklist') {
      blacklisted.push({ ...row, '_Audit Reason': 'Suppressed - Blacklisted' });
      return;
    }

    if (filterResult === 'watchlist') {
      underInvestigation.push({ ...row, '_Audit Reason': 'Under Investigation' });
      return;
    }

    if (filterResult === 'whitelist') {
      clean.push(row);
      return;
    }

    // No filter matched — run audit rules
    const findings = [];

    for (const rule of applicableRules) {
      try {
        const triggered = evaluateRule(rule, row, processedSources);
        if (triggered) {
          findings.push({ rule, reason: rule.flagReason || rule.name });
          if (rule.suppressOnMatch !== false) break;
        }
      } catch (e) {
        console.warn(`Rule "${rule.name}" error:`, e.message);
      }
    }

    if (findings.length === 0) {
      clean.push(row);
      return;
    }

    findings.forEach(finding => {
      const category = finding.rule.category || 'Uncategorized';
      if (!byCategory[category]) byCategory[category] = [];

      const identifierColumn = assetTypeConfig.identifierColumn || 'Computer';
      const alreadyAdded = byCategory[category].some(r =>
        r[identifierColumn] === row[identifierColumn] &&
        r['_Rule'] === finding.rule.name
      );

      if (!alreadyAdded) {
        byCategory[category].push({
          ...row,
          '_Audit Reason': finding.reason,
          '_Rule': finding.rule.name,
          '_Severity': finding.rule.severity || 10
        });
      }
    });
  });

  // STEP 4: Build summary
  const totalFlagged = Object.values(byCategory).reduce((sum, rows) => sum + rows.length, 0);
  const summary = {
    totalProcessed: processedRows.length,
    totalFlagged,
    totalBlacklisted: blacklisted.length,
    totalUnderInvestigation: underInvestigation.length,
    totalClean: clean.length,
    byCategory: Object.keys(byCategory).reduce((acc, cat) => {
      acc[cat] = byCategory[cat].length;
      return acc;
    }, {})
  };

  // STEP 5: Delta detection — runs if previous audit is loaded
  // Produces a separate deltaAssets bucket for the "Delta Flag Changes" output tab.
  // Does NOT modify Access Rule values[] (manual review preferred over auto-removal).
  let deltaAssets = [];
  if (previousAudit) {
    const identifierColumn = assetTypeConfig.identifierColumn || 'Computer';
    console.log('DELTA DEBUG:', {
      assetTypeConfigKeys: Object.keys(assetTypeConfig || {}),
      identifierColumnFromConfig: assetTypeConfig?.identifierColumn,
      identifierColumnResolved: identifierColumn,
      previousAuditExists: !!previousAudit,
      previousAuditSheetsKeys: previousAudit?.sheets ? Object.keys(previousAudit.sheets) : 'no sheets',
      globalFiltersCount: globalFilters?.length || 0,
      filtersWithComputerColumn: globalFilters?.filter(f => f.column === identifierColumn).map(f => ({ label: f.label, values: f.values?.length })) || []
    });
    const result = runDeltaDetection(
      globalFilters,
      previousAudit,
      processedRows,
      identifierColumn
    );
    deltaAssets = result.deltaAssets;
    summary.totalDelta = deltaAssets.length;
  }

  return { byCategory, blacklisted, clean, underInvestigation, deltaAssets, summary, categorySeverity, updatedFilters: globalFilters };
}