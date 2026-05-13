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

function runProcessingStep(rows, step) {
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

    default:
      return rows;
  }
}

// =================================================================
// OPERATOR FUNCTIONS
// =================================================================

function applyOperator(sourceValue, operator, compareValue) {
  const src = (sourceValue || '').toString().toLowerCase().trim();

  // Check if compareValue contains semicolon-separated values
  // Applies to operators that compare against a value (not is empty/is not empty/is not found)
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

  // Single value — original behavior
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
// Compares current Access Rules lists against previous audit data.
// Only supports equals and is not operators.
// Partial string operators (contains, starts with, etc.) are skipped.
// Returns: { deltaAssets[], updatedFilters[] }
// =================================================================

export function runDeltaDetection(globalFilters, previousAudit, processedRows) {
  if (!previousAudit || !previousAudit.sheets) {
    return { deltaAssets: [], updatedFilters: globalFilters };
  }

  const deltaAssets = [];
  const updatedFilters = globalFilters.map(filter => ({ ...filter, values: [...filter.values] }));

  globalFilters.forEach((filter, filterIdx) => {
    const { column, values, label } = filter;
    if (!column || !values || values.length === 0) return;

    // Delta detection only supports exact match operators
    const operator = filter.operator || 'equals';
    if (!['equals', 'is not'].includes(operator)) return;

    const valuesToRemove = [];

    values.forEach(value => {
      const valLower = value.toLowerCase().trim();

      // Find matching rows in current processed data
      const matchingCurrentRows = processedRows.filter(row => {
        const rowVal = (row[column] || '').toString().toLowerCase().trim();
        return operator === 'is not' ? rowVal !== valLower : rowVal === valLower;
      });

      // Find matching rows in previous audit
      const matchingPreviousRows = [];
      Object.entries(previousAudit.sheets).forEach(([tabName, rows]) => {
        if (tabName === 'Summary' || tabName === '⚠ Unaccounted') return;
        rows.forEach(row => {
          const rowVal = (row[column] || '').toString().toLowerCase().trim();
          const matches = operator === 'is not' ? rowVal !== valLower : rowVal === valLower;
          if (matches) matchingPreviousRows.push({ row, tabName });
        });
      });

      if (matchingCurrentRows.length === 0 && matchingPreviousRows.length === 0) {
        // Never existed in either audit — skip
        return;
      }

      if (matchingCurrentRows.length === 0 && matchingPreviousRows.length > 0) {
        // Was in previous audit but gone from current data
        deltaAssets.push({
          [column]: value,
          '_Audit Reason': `Delta: Asset no longer found in current data (was in "${label}" — ${matchingPreviousRows[0].tabName})`,
          '_Delta': 'Missing',
          '_Previous Tab': matchingPreviousRows[0].tabName,
          '_Access Rule': label || filter.id
        });
        valuesToRemove.push(value);
        return;
      }

      if (matchingPreviousRows.length === 0) {
        // Not in previous audit — nothing to compare against, skip
        return;
      }

      // Compare each matching current row against its previous counterpart
      matchingCurrentRows.forEach(currentRow => {
        const currentVal = (currentRow[column] || '').toString().toLowerCase().trim();
        const previousEntry = matchingPreviousRows.find(p =>
          (p.row[column] || '').toString().toLowerCase().trim() === currentVal
        ) || matchingPreviousRows[0];

        const previousRow = previousEntry.row;
        const changes = [];

        Object.keys(currentRow).forEach(col => {
          if (col.startsWith('_')) return;
          const prevVal = (previousRow[col] || '').toString().trim();
          const currVal = (currentRow[col] || '').toString().trim();
          if (prevVal && currVal && prevVal !== currVal) {
            changes.push(`${col} (${prevVal} → ${currVal})`);
          }
        });

        if (changes.length > 0) {
          const reasonDetail = changes.join(', ');
          deltaAssets.push({
            ...currentRow,
            '_Audit Reason': `Delta: ${reasonDetail}`,
            '_Delta': 'Changed',
            '_Previous Tab': previousEntry.tabName,
            '_Access Rule': label || filter.id
          });
          if (!valuesToRemove.includes(value)) valuesToRemove.push(value);
        }
      });
    });

    // Remove flagged values from this filter's values[]
    if (valuesToRemove.length > 0) {
      updatedFilters[filterIdx] = {
        ...updatedFilters[filterIdx],
        values: filter.values.filter(v => !valuesToRemove.includes(v))
      };
    }
  });

  return { deltaAssets, updatedFilters };
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
    .sort((a, b) => (a.severity || 10) - (b.severity || 10));

  // Build category severity map
  const categorySeverity = {};
  applicableRules.forEach(rule => {
    const cat = rule.category || 'Uncategorized';
    const current = categorySeverity[cat] ?? 99;
    categorySeverity[cat] = Math.min(current, rule.severity || 10);
  });

  // STEP 2: Run processing steps per source
  let processedRows = [...primarySource.rows];

  if (processingSteps && processingSteps.length > 0) {
    const selectedStepIds = primarySource.selectedProcessingSteps || [];
    const stepsToRun = processingSteps
      .filter(step => step.enabled && selectedStepIds.includes(step.id))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    stepsToRun.forEach(step => {
      processedRows = runProcessingStep(processedRows, step);
    });
  }

  // Process all other sources using their own selected steps
  const processedSources = { ...allSources };
  if (allSourcesRaw && processingSteps && processingSteps.length > 0) {
    Object.keys(allSourcesRaw).forEach(sourceId => {
      const source = allSourcesRaw[sourceId];
      if (!source || !source.rows) return;
      const selectedStepIds = source.selectedProcessingSteps || [];
      if (selectedStepIds.length === 0) return;

      const stepsToRun = processingSteps
        .filter(step => step.enabled && selectedStepIds.includes(step.id))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      let processedSourceRows = [...source.rows];
      stepsToRun.forEach(step => {
        processedSourceRows = runProcessingStep(processedSourceRows, step);
      });

      processedSources[sourceId] = { ...source, rows: processedSourceRows };
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

      const alreadyAdded = byCategory[category].some(r =>
        r['Computer'] === row['Computer'] &&
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
  let updatedFilters = globalFilters;
  if (previousAudit) {
    const { deltaAssets, updatedFilters: newFilters } = runDeltaDetection(
      globalFilters,
      previousAudit,
      processedRows
    );
    updatedFilters = newFilters;
    deltaAssets.forEach(asset => underInvestigation.push(asset));
    // Recalculate under investigation count
    summary.totalUnderInvestigation = underInvestigation.length;
  }

  return { byCategory, blacklisted, clean, underInvestigation, summary, categorySeverity, updatedFilters };
}