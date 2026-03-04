/* ============================================
   CONFIG
   Application configuration
   ============================================ */

/**
 * App information
 */
export const APP_INFO = {
  name: import.meta.env.VITE_APP_NAME || 'Mission Control | NRJ Morgen',
  shortName: 'Mission Control',
  version: '1.0.0',
  description: 'Real-time mission metrics and analytics for NRJ Morgen',
  author: 'NRJ Morgen Team',
  repository: 'https://github.com/baarli/mission-control-live'
};

/**
 * Environment configuration
 */
export const ENV = {
  isDevelopment: import.meta.env.DEV || import.meta.env.VITE_APP_ENVIRONMENT === 'development',
  isProduction: import.meta.env.PROD || import.meta.env.VITE_APP_ENVIRONMENT === 'production',
  isTest: import.meta.env.MODE === 'test',
  
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugLogging: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true'
  }
};

/**
 * API configuration
 */
export const API_CONFIG = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    timeout: ENV.apiTimeout
  },
  brave: {
    apiKey: import.meta.env.VITE_BRAVE_API_KEY || ''
  }
};

/**
 * UI configuration
 */
export const UI_CONFIG = {
  /**
   * Animation durations (in ms)
   */
  animation: {
    fast: 150,
    normal: 300,
    slow: 500
  },

  /**
   * Toast configuration
   */
  toast: {
    duration: 3000,
    maxVisible: 5
  },

  /**
   * Pagination
   */
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50]
  },

  /**
   * Search configuration
   */
  search: {
    debounceMs: 300,
    minQueryLength: 2,
    maxHistoryItems: 20
  },

  /**
   * Table configuration
   */
  table: {
    defaultSortDirection: 'asc' as const,
    resizeHandleWidth: 4
  },

  /**
   * Date format strings
   */
  dateFormat: {
    display: 'dd.MM.yyyy',
    displayWithTime: 'dd.MM.yyyy HH:mm',
    input: 'yyyy-MM-dd',
    api: 'yyyy-MM-dd',
    iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
  },

  /**
   * Chart colors
   */
  chartColors: [
    '#dc2626', // Red
    '#2563eb', // Blue
    '#16a34a', // Green
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#db2777', // Pink
    '#65a30d'  // Lime
  ]
};

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  auth: 'mc-auth-storage',
  theme: 'mc-theme-storage',
  saksliste: 'mc-saksliste-storage',
  search: 'mc-search-storage',
  stats: 'mc-stats-storage',
  transcriptions: 'mc-transcriptions',
  audioBriefings: 'mc-audio-briefings',
  settings: 'mc-settings'
};

/**
 * LocalStorage size limits (in bytes)
 */
export const STORAGE_LIMITS = {
  maxItemSize: 5 * 1024 * 1024, // 5MB
  warningThreshold: 4 * 1024 * 1024 // Warn at 4MB
};

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

/**
 * Auth configuration
 */
export const AUTH_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  sessionDurationMs: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Export configuration
 */
export const EXPORT_CONFIG = {
  csv: {
    delimiter: ';',
    encoding: 'utf-8-sig' // BOM for Excel compatibility
  },
  json: {
    indent: 2
  },
  pdf: {
    pageSize: 'A4' as const,
    orientation: 'portrait' as const
  },
  docx: {
    defaultTemplate: 'default'
  }
};

/**
 * Skill configuration
 */
export const SKILL_CONFIG = {
  doc: {
    outputDir: 'output/doc',
    tempDir: 'tmp/docs'
  },
  pdf: {
    outputDir: 'output/pdf',
    tempDir: 'tmp/pdfs'
  },
  transcribe: {
    outputDir: 'output/transcribe',
    supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  imagegen: {
    outputDir: 'output/imagegen',
    supportedSizes: ['1024x1024', '1536x1024', '1024x1536'] as const
  },
  speech: {
    outputDir: 'output/speech',
    maxTextLength: 4096,
    maxRequestsPerMinute: 50
  }
};

/**
 * Navigation items
 */
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'saksliste', label: 'Saksliste', icon: 'List', path: '/saksliste' },
  { id: 'search', label: 'Søk', icon: 'Search', path: '/search' },
  { id: 'stats', label: 'Statistikk', icon: 'BarChart3', path: '/stats' },
  { id: 'settings', label: 'Innstillinger', icon: 'Settings', path: '/settings' }
];

/**
 * Feature flags
 */
export const FEATURES = {
  enableSkills: true,
  enableTranscription: true,
  enableImageGeneration: true,
  enableSpeechGeneration: true,
  enablePdfExport: true,
  enableDocxExport: true,
  enableDarkMode: true,
  enableKeyboardShortcuts: true
};

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  search: { key: 'k', ctrl: true, description: 'Åpne søk' },
  newSak: { key: 'n', ctrl: true, description: 'Ny sak' },
  save: { key: 's', ctrl: true, description: 'Lagre' },
  refresh: { key: 'r', ctrl: true, description: 'Oppdater data' },
  toggleTheme: { key: 't', ctrl: true, shift: true, description: 'Bytt tema' },
  logout: { key: 'q', ctrl: true, shift: true, description: 'Logg ut' }
};

/**
 * Get config value with fallback
 */
export function getConfig<T>(path: string, fallback: T): T {
  const keys = path.split('.');
  let current: unknown = { APP_INFO, ENV, API_CONFIG, UI_CONFIG, STORAGE_KEYS };
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return fallback;
    }
  }
  
  return current as T;
}

export default {
  APP_INFO,
  ENV,
  API_CONFIG,
  UI_CONFIG,
  STORAGE_KEYS,
  STORAGE_LIMITS,
  UPLOAD_CONFIG,
  AUTH_CONFIG,
  EXPORT_CONFIG,
  SKILL_CONFIG,
  NAV_ITEMS,
  FEATURES,
  KEYBOARD_SHORTCUTS,
  getConfig
};
