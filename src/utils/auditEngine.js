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
    case 'is not found': return false;
    default: return src === cmp;
  }
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
    // Check if compareValue is a column header in the same source row
    // If the row has a key matching compareValue, use that column's value
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

    if (!matchedRow) {
      return operator === 'is not found';
    }

    const lookupValue = matchedRow[lookupValueColumn] || '';

    if (compareValue) {
      return applyOperator(lookupValue, operator, compareValue);
    }
    return applyOperator(primaryValue, operator, lookupValue);
  }

  return false;
}

// =================================================================
// RULE EVALUATOR — supports multiple conditions with AND logic
// =================================================================

function evaluateRule(rule, row, allSources) {
  // New multi-condition format
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

  // Legacy single-condition format (backwards compatible)
  try {
    return evaluateCondition(rule, row, allSources);
  } catch (e) {
    console.warn(`Rule "${rule.name}" evaluation error:`, e.message);
    return false;
  }
}

// =================================================================
// MAIN AUDIT FUNCTION
// =================================================================

export function runAudit(primarySource, allSources, assetTypeConfig, auditRules, processingSteps, allSourcesRaw) {
  const { selectedRules = [], whitelist = [], blacklist = [] } = assetTypeConfig;

  // STEP 1: Get applicable rules sorted by severity
  const applicableRules = auditRules
    .filter(rule => selectedRules.includes(rule.id))
    .sort((a, b) => (a.severity || 10) - (b.severity || 10));

  // STEP 2: Run processing steps per source
  // Primary source uses its own selected steps
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

  // STEP 3: Evaluate rules against each row
  const byCategory = {};
  const clean = [];
  const blacklisted = [];

  processedRows.forEach(row => {
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

    const findings = [];

    for (const rule of applicableRules) {
      try {
        const triggered = evaluateRule(rule, row, processedSources);
        if (triggered) {
          findings.push({ rule, reason: rule.flagReason || rule.name });
          if (rule.suppressOnMatch !== false) {
            break; // Suppress on match — stop evaluating lower priority rules
          }
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
    totalClean: clean.length,
    byCategory: Object.keys(byCategory).reduce((acc, cat) => {
      acc[cat] = byCategory[cat].length;
      return acc;
    }, {})
  };

  return { byCategory, blacklisted, clean, summary };
}