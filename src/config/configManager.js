// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

import { defaultConfig } from './defaultConfig';

const CONFIG_KEY = 'inventoryAuditConfig';
const HEADERS_KEY = 'detectedHeaders';
const DATA_SOURCES_KEY = 'activeDataSources';

// =================================================================
// CONFIG MANAGEMENT
// =================================================================

export function loadConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaultConfig to ensure new fields exist
      return {
        ...defaultConfig,
        ...parsed,
        processingSteps: parsed.processingSteps || [],
        auditCategories: parsed.auditCategories || [],
        auditRules: parsed.auditRules || [],
        assetTypes: parsed.assetTypes || {},
        runHistory: parsed.runHistory || []
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

export function resetConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(HEADERS_KEY);
    localStorage.removeItem(DATA_SOURCES_KEY);
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
// Session-only in the app state, but we track source names here
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