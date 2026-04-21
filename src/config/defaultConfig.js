export const defaultConfig = {

  // =================================================================
  // MODULE POOL
  // All available audit and processing modules.
  // These are the building blocks that Asset Types draw from.
  // =================================================================

  modulePool: {

    // --- PROCESSING MODULES (always run first) ---
    processing: {
      siteNormalization: {
        id: 'siteNormalization',
        name: 'Site Normalization',
        description: 'Normalizes raw site names from CSV to standardized names.',
        enabled: true,
        config: {
          mappings: {
            'Base Site': 'Santo Domingo Office (New)',
            'Santo Domingo Office (Old)': 'Santo Domingo Office (New)',
            'Bogota': 'CO1 - Bogota'
          }
        }
      },
      emailNormalization: {
        id: 'emailNormalization',
        name: 'Email Normalization',
        description: 'Strips email domain from user email and last login columns.',
        enabled: true,
        config: {
          domainToStrip: '@hirehoratio.co'
        }
      },
      osFilter: {
        id: 'osFilter',
        name: 'OS Filter',
        description: 'Segregates assets by operating system into categories.',
        enabled: true,
        config: {
          categories: {
            'Windows 10': 'Microsoft Windows 10 Pro',
            'Windows 11': 'Microsoft Windows 11 Pro'
          },
          columnMapping: {
            osName: 'OS Name'
          }
        }
      },
      stateFilter: {
        id: 'stateFilter',
        name: 'State Filter',
        description: 'Segregates assets by their state (Assigned, Available, Damaged, etc.).',
        enabled: true,
        config: {
          activeStates: ['Assigned', 'Available'],
          flaggedStates: ['Damaged', 'Decommissioned'],
          columnMapping: {
            state: 'State'
          }
        }
      }
    },

    // --- AUDIT MODULES (run after processing) ---
    audit: {
      emailVsRoster: {
        id: 'emailVsRoster',
        name: 'Email vs Roster',
        description: 'Checks if the assigned user email is Active or Terminated in Rippling.',
        enabled: true,
        config: {
          columnMapping: {
            userEmail: 'User Email'
          }
        }
      },
      lastLoginVsRoster: {
        id: 'lastLoginVsRoster',
        name: 'Last Login vs Roster',
        description: 'Checks if the last logged in user is Active or Terminated in Rippling.',
        enabled: true,
        config: {
          columnMapping: {
            lastLogin: 'Last Logged In User'
          }
        }
      },
      emailVsLastLogin: {
        id: 'emailVsLastLogin',
        name: 'Email vs Last Login',
        description: 'Checks if the assigned email matches the last logged in user.',
        enabled: true,
        config: {
          columnMapping: {
            userEmail: 'User Email',
            lastLogin: 'Last Logged In User'
          }
        }
      },
      stateConflict: {
        id: 'stateConflict',
        name: 'State Conflict',
        description: 'Flags assets where State and user assignment contradict each other.',
        enabled: true,
        config: {
          invalidAssignedUser: 'defaultuser0',
          invalidAvailableUsers: ['defaultuser0', 'default'],
          columnMapping: {
            state: 'State',
            lastLogin: 'Last Logged In User'
          }
        }
      },
      duplicateAssignment: {
        id: 'duplicateAssignment',
        name: 'Duplicate Assignment',
        description: 'Flags users with more than one asset assigned.',
        enabled: true,
        config: {
          columnMapping: {
            userEmail: 'User Email'
          }
        }
      },
      unaccounted: {
        id: 'unaccounted',
        name: 'Unaccounted',
        description: 'Flags assets with no user email on record.',
        enabled: true,
        config: {
          columnMapping: {
            userEmail: 'User Email'
          }
        }
      },
      outstandingModels: {
        id: 'outstandingModels',
        name: 'Outstanding Models',
        description: 'Flags hardware models not in the known models list.',
        enabled: true,
        config: {
          knownModels: [],
          columnMapping: {
            model: 'Model'
          }
        }
      },
      locationMismatch: {
        id: 'locationMismatch',
        name: 'Location Mismatch',
        description: 'Flags assets where computer prefix does not match expected location.',
        enabled: true,
        config: {
          prefixLocationMap: {},
          columnMapping: {
            computer: 'Computer',
            site: 'Site'
          }
        }
      }
    }
  },

  // =================================================================
  // ASSET TYPES
  // Each asset type selects modules from the pool above.
  // =================================================================

  assetTypes: {
    workstations: {
      id: 'workstations',
      name: 'Workstations',
      enabled: true,
      description: 'Laptop and desktop assets managed in ManageEngine.',
      selectedProcessingModules: [
        'siteNormalization',
        'emailNormalization',
        'osFilter',
        'stateFilter'
      ],
      selectedAuditModules: [
        'emailVsRoster',
        'lastLoginVsRoster',
        'emailVsLastLogin',
        'stateConflict',
        'unaccounted',
        'outstandingModels',
        'locationMismatch'
      ],
      availableProcessingModules: [
        'siteNormalization',
        'emailNormalization',
        'osFilter',
        'stateFilter'
      ],
      availableAuditModules: [
        'emailVsRoster',
        'lastLoginVsRoster',
        'emailVsLastLogin',
        'stateConflict',
        'duplicateAssignment',
        'unaccounted',
        'outstandingModels',
        'locationMismatch'
      ],
      whitelist: [],
      blacklist: []
    },
    monitors: {
      id: 'monitors',
      name: 'Monitors',
      enabled: true,
      description: 'Monitor assets managed in ManageEngine.',
      selectedProcessingModules: [
        'siteNormalization',
        'emailNormalization'
      ],
      availableProcessingModules: [
        'siteNormalization',
        'emailNormalization'
      ],
      availableAuditModules: [
        'emailVsRoster',
        'unaccounted',
        'duplicateAssignment',
        'outstandingModels'
      ],
      whitelist: [],
      blacklist: []
    },
    headsets: {
      id: 'headsets',
      name: 'Headsets',
      enabled: true,
      description: 'Headset assets managed in ManageEngine.',
      selectedProcessingModules: [
        'siteNormalization',
        'emailNormalization'
      ],
      availableProcessingModules: [
        'siteNormalization',
        'emailNormalization'
      ],
      availableAuditModules: [
        'emailVsRoster',
        'unaccounted',
        'duplicateAssignment',
        'outstandingModels'
      ],
      whitelist: [],
      blacklist: []
    }
  },

  // =================================================================
  // RUN HISTORY
  // =================================================================
  runHistory: []
};