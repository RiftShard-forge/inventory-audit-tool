export const defaultConfig = {

  // =================================================================
  // PROCESSING MODULES
  // These run first and normalize/transform data before auditing.
  // Configured in Settings page.
  // =================================================================
  processingModules: {
    siteNormalization: {
      id: 'siteNormalization',
      name: 'Site Normalization',
      description: 'Normalizes raw site names from CSV to standardized names.',
      enabled: true,
      config: {
        mappings: {}
      }
    },
    emailNormalization: {
      id: 'emailNormalization',
      name: 'Email Normalization',
      description: 'Strips email domain from user email columns.',
      enabled: true,
      config: {
        domainToStrip: ''
      }
    },
    osFilter: {
      id: 'osFilter',
      name: 'OS Filter',
      description: 'Tags assets by operating system category.',
      enabled: false,
      config: {
        categories: {},
        columnMapping: { osName: 'OS Name' }
      }
    },
    stateFilter: {
      id: 'stateFilter',
      name: 'State Filter',
      description: 'Tags assets by their state (Assigned, Available, Damaged, etc.).',
      enabled: false,
      config: {
        activeStates: ['Assigned', 'Available'],
        flaggedStates: ['Damaged', 'Decommissioned'],
        columnMapping: { state: 'State' }
      }
    }
  },

  // =================================================================
  // AUDIT CATEGORIES
  // Global list of categories that audit rules can be assigned to.
  // Each category becomes a tab in the output xlsx.
  // =================================================================
  auditCategories: [],

  // =================================================================
  // AUDIT RULES
  // User-defined rules. Each rule defines what to check and how.
  // Rules run in severity order (1 = highest priority, runs first).
  // =================================================================
  auditRules: [],

  // =================================================================
  // ASSET TYPES
  // User-defined asset types. Each selects which rules apply to it.
  // =================================================================
  assetTypes: {},

  // =================================================================
  // RUN HISTORY
  // =================================================================
  runHistory: []
};