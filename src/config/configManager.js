import { defaultConfig } from './defaultConfig';

const CONFIG_KEY = 'inventoryAuditConfig';

export function loadConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
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