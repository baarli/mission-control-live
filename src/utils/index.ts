/* ============================================
   UTILITIES - Barrel Export
   ============================================ */

// Date utilities
export {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFriendlyDate,
  formatDateInput,
  formatDateTimeInput,
  parseDateInput,
  getWeekRange,
  getMonthRange,
  getDateRangeLabel,
  isDateInRange,
  getTimeDescription,
  addDaysToDate,
  subtractDaysFromDate,
  getWeekdayName,
  getShortWeekdayName,
  formatDuration,
  getWeekNumber,
} from './date';

// String utilities
export {
  escapeHtml,
  truncate,
  truncateWords,
  capitalize,
  capitalizeWords,
  slugify,
  cleanWhitespace,
  stripHtml,
  extractExcerpt,
  highlightText,
  escapeRegExp,
  containsIgnoreCase,
  getInitials,
  formatNumber,
  pluralize,
  generateId,
  generateUUID,
  formatBytes,
  repeat,
  pad,
  parseQueryString,
  buildQueryString,
} from './string';

// Validation utilities
export {
  VALIDATION_RULES,
  composeValidators,
  validateObject,
  validateSak,
  validateSearchQuery,
  validateLogin,
  validateSettings,
  validateFile,
  validateDateRange,
  sanitizeInput,
  isEmpty,
  createValidator,
  type ValidationResult,
  type FieldValidator,
} from './validation';

// Theme utilities
export {
  detectSystemTheme,
  prefersReducedMotion,
  prefersHighContrast,
  watchThemeChanges,
  watchReducedMotionChanges,
  generateThemeVariables,
  applyThemeVariables,
  getThemeClasses,
  getMetaThemeColor,
  storeThemePreference,
  getStoredThemePreference,
  clearStoredThemePreference,
  getEffectiveTheme,
  initializeTheme,
  toggleTheme,
  withThemeTransition,
  getChartColorScheme,
} from './theme';

// Export utilities
export {
  exportToCsv,
  exportSakerToCsv,
  exportSearchResultsToCsv,
  exportToJson,
  exportSakerToJson,
  exportStatsToJson,
  exportToText,
  exportSakerToText,
  copyToClipboard,
  copySakerToClipboard,
  downloadBlob,
  parseCsv,
  readFileAsText,
  readFileAsJson,
  generatePrintHtml,
  printContent,
} from './export';

// Re-export from existing utils
export { timeAgo } from './timeAgo';
