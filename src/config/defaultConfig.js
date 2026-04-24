// Copyright (c) 2026 RiftShard-forge. All Rights Reserved.
// Unauthorized copying, distribution, or use is strictly prohibited.

export const defaultConfig = {

  // =================================================================
  // PROCESSING STEPS
  // User-defined data transformation steps.
  // Run before audit rules to normalize/clean data.
  // Types: 'mapValue', 'stripText', 'tagByValue'
  // =================================================================
  processingSteps: [],

  // =================================================================
  // AUDIT CATEGORIES
  // Global list — each becomes a tab in the output xlsx.
  // =================================================================
  auditCategories: [],

  // =================================================================
  // AUDIT RULES
  // User-defined rules. Run in severity order (1 = highest).
  // =================================================================
  auditRules: [],

  // =================================================================
  // ASSET TYPES
  // User-defined. Each selects processing steps + audit rules.
  // =================================================================
  assetTypes: {},

  // =================================================================
  // RUN HISTORY
  // =================================================================
  runHistory: []
};