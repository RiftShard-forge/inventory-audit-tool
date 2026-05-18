// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import { defaultConfig } from './defaultConfig';

const CONFIG_KEY = 'inventoryAuditConfig';
const HEADERS_KEY = 'detectedHeaders';
const DATA_SOURCES_KEY = 'activeDataSources';
const LIBRARY_KEY = 'inventoryAuditLibrary';

// =================================================================
// MIGRATION HELPER
// Migrates filters from inside assetTypes (old) to top-level (new)
// Safe to run on every load — exits early if already migrated
// =================================================================

function migrateFilters(parsed) {
  // Already has top-level filters — no migration needed
  if (Array.isArray(parsed.filters)) return parsed;

  // Collect filters from inside assetTypes and migrate them up
  const migratedFilters = [];
  const updatedAssetTypes = { ...parsed.assetTypes };

  Object.entries(updatedAssetTypes || {}).forEach(([assetId, asset]) => {
    if (asset.filters && asset.filters.length > 0) {
      asset.filters.forEach(filter => {
        migratedFilters.push({
          ...filter,
          profileIds: [assetId]  // scope to the profile it came from
        });
      });
      // Remove filters from assetType
      updatedAssetTypes[assetId] = { ...asset, filters: undefined };
    }
  });

  return {
    ...parsed,
    filters: migratedFilters,
    assetTypes: updatedAssetTypes
  };
}

// =================================================================
// CONFIG MANAGEMENT
// =================================================================

export function loadConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const migrated = migrateFilters(parsed);
      return {
        ...defaultConfig,
        ...migrated,
        processingSteps: migrated.processingSteps || [],
        auditCategories: migrated.auditCategories || [],
        auditRules: migrated.auditRules || [],
        assetTypes: migrated.assetTypes || {},
        filters: migrated.filters || [],
        runHistory: migrated.runHistory || []
      };
    }
    return defaultConfig;
  } catch (e) {
    console.error('Failed to load config:', e);
    return defaultConfig;
  }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save config:', e);
    return false;
  }
}

export function resetConfig(resetLibrary = false) {
  try {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(HEADERS_KEY);
    localStorage.removeItem(DATA_SOURCES_KEY);
    if (resetLibrary) {
      localStorage.removeItem(LIBRARY_KEY);
    }
    return true;
  } catch (e) {
    console.error('Failed to reset config:', e);
    return false;
  }
}

export function addToHistory(entry) {
  try {
    const config = loadConfig();
    config.runHistory = [entry, ...(config.runHistory || [])].slice(0, 50);
    saveConfig(config);
    return true;
  } catch (e) {
    console.error('Failed to add history entry:', e);
    return false;
  }
}

// =================================================================
// DETECTED HEADERS MANAGEMENT
// =================================================================

export function saveDetectedHeaders(headers) {
  try {
    localStorage.setItem(HEADERS_KEY, JSON.stringify(headers));
    return true;
  } catch (e) {
    console.error('Failed to save detected headers:', e);
    return false;
  }
}

export function loadDetectedHeaders() {
  try {
    const stored = localStorage.getItem(HEADERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Failed to load detected headers:', e);
    return {};
  }
}

// =================================================================
// DATA SOURCES MANAGEMENT
// =================================================================

export function saveDataSourceNames(sourceNames) {
  try {
    localStorage.setItem(DATA_SOURCES_KEY, JSON.stringify(sourceNames));
    return true;
  } catch (e) {
    console.error('Failed to save data source names:', e);
    return false;
  }
}

export function loadDataSourceNames() {
  try {
    const stored = localStorage.getItem(DATA_SOURCES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load data source names:', e);
    return [];
  }
}

// =================================================================
// CONFIG EXPORT / IMPORT
// =================================================================

export function exportConfig(config) {
  try {
    const library = loadLibrary();
    const exportData = {
      ...config,
      _library: library,
      _exportedAt: new Date().toISOString(),
      _version: '2.4.0'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Failed to export config:', e);
    return false;
  }
}

export function importConfig(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        // Restore library if present in export file
        if (parsed._library) {
          _saveLibrary({
            ruleHistory: parsed._library.ruleHistory || [],
            categoryHistory: parsed._library.categoryHistory || [],
            stepHistory: parsed._library.stepHistory || [],
            filterHistory: parsed._library.filterHistory || []
          });
        }

        // Run migration in case file was exported before filters moved to top level
        const migrated = migrateFilters(parsed);

        const cleaned = {
          ...defaultConfig,
          ...migrated,
          processingSteps: migrated.processingSteps || [],
          auditCategories: migrated.auditCategories || [],
          auditRules: migrated.auditRules || [],
          assetTypes: migrated.assetTypes || {},
          filters: migrated.filters || [],
          runHistory: migrated.runHistory || []
        };
        saveConfig(cleaned);
        resolve(cleaned);
      } catch (err) {
        reject(new Error('Invalid config file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

// =================================================================
// LIBRARY MANAGEMENT
// Completely separate from config — lives in its own localStorage key.
// Config saves can never touch or wipe library entries.
// =================================================================

export function loadLibrary() {
  try {
    const stored = localStorage.getItem(LIBRARY_KEY);
    return stored
      ? { ruleHistory: [], categoryHistory: [], stepHistory: [], filterHistory: [], ...JSON.parse(stored) }
      : { ruleHistory: [], categoryHistory: [], stepHistory: [], filterHistory: [] };
  } catch (e) {
    console.error('Failed to load library:', e);
    return { ruleHistory: [], categoryHistory: [], stepHistory: [] };
  }
}

function _saveLibrary(library) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    return true;
  } catch (e) {
    console.error('Failed to save library:', e);
    return false;
  }
}

export function addToRuleHistory(rule) {
  try {
    const library = loadLibrary();
    const filtered = library.ruleHistory.filter(r => r.name !== rule.name);
    library.ruleHistory = [rule, ...filtered].slice(0, 20);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to save rule to library:', e);
    return false;
  }
}

export function addToCategoryHistory(category) {
  try {
    const library = loadLibrary();
    const filtered = library.categoryHistory.filter(c => c !== category);
    library.categoryHistory = [category, ...filtered].slice(0, 50);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to save category to library:', e);
    return false;
  }
}

export function addToStepHistory(step) {
  try {
    const library = loadLibrary();
    const filtered = library.stepHistory.filter(s => s.name !== step.name);
    library.stepHistory = [step, ...filtered].slice(0, 20);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to save step to library:', e);
    return false;
  }
}

export function deleteFromRuleHistory(name) {
  try {
    const library = loadLibrary();
    library.ruleHistory = library.ruleHistory.filter(r => r.name !== name);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to delete rule from library:', e);
    return false;
  }
}

export function deleteFromCategoryHistory(category) {
  try {
    const library = loadLibrary();
    library.categoryHistory = library.categoryHistory.filter(c => c !== category);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to delete category from library:', e);
    return false;
  }
}

export function deleteFromStepHistory(name) {
  try {
    const library = loadLibrary();
    library.stepHistory = library.stepHistory.filter(s => s.name !== name);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to delete step from library:', e);
    return false;
  }
}

export function addToFilterHistory(filter) {
  try {
    const library = loadLibrary();
    const filtered = (library.filterHistory || []).filter(f => f.label !== filter.label);
    library.filterHistory = [filter, ...filtered].slice(0, 20);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to save filter to library:', e);
    return false;
  }
}

export function deleteFromFilterHistory(label) {
  try {
    const library = loadLibrary();
    library.filterHistory = (library.filterHistory || []).filter(f => f.label !== label);
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to delete filter from library:', e);
    return false;
  }
}

export function syncRulesToLibrary(rules) {
  try {
    const library = loadLibrary();
    let updated = false;
    rules.forEach(rule => {
      const existingIdx = library.ruleHistory.findIndex(r => r.name === rule.name);
      if (existingIdx !== -1) {
        // Rule exists in library — update it in place
        library.ruleHistory[existingIdx] = rule;
        updated = true;
      }
      // If not in library — leave it alone, user must explicitly save to library
    });
    if (updated) return _saveLibrary(library);
    return true;
  } catch (e) {
    console.error('Failed to sync rules to library:', e);
    return false;
  }
}

export function clearRuleHistory() {
  try {
    const library = loadLibrary();
    library.ruleHistory = [];
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to clear rule history:', e);
    return false;
  }
}

export function clearCategoryHistory() {
  try {
    const library = loadLibrary();
    library.categoryHistory = [];
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to clear category history:', e);
    return false;
  }
}

export function clearStepHistory() {
  try {
    const library = loadLibrary();
    library.stepHistory = [];
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to clear step history:', e);
    return false;
  }
}

export function clearFilterHistory() {
  try {
    const library = loadLibrary();
    library.filterHistory = [];
    return _saveLibrary(library);
  } catch (e) {
    console.error('Failed to clear filter history:', e);
    return false;
  }
}