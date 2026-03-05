/* ============================================
   CONSTANTS - Barrel Export
   ============================================ */

// Categories
export {
  CATEGORIES,
  CATEGORY_MAP,
  CATEGORY_FILTER_OPTIONS,
  getCategory,
  getCategoryLabel,
  getCategoryShortLabel,
  getCategoryColor,
  getCategoryBgColor,
  getCategoryIcon,
  getCategoryIds,
  getCategoriesByOrder,
  getCategoryOptions,
  isValidCategory,
  parseCategory,
  getDefaultCategory,
  groupByCategory,
  countByCategory,
  type CategoryMeta,
} from './categories';

// Prompts
export {
  SEARCH_PROMPTS,
  AI_PROMPTS,
  CONTENT_TEMPLATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIRM_MESSAGES,
  PLACEHOLDERS,
  LABELS,
  getSearchPrompt,
} from './prompts';

// Config
export {
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
  getConfig,
} from './config';

// Routes
export {
  ROUTES,
  ROUTE_META,
  EXTERNAL_LINKS,
  getRouteMeta,
  matchRoute,
  buildRoute,
  getNavRoutes,
  getAuthRoutes,
  getPublicRoutes,
  requiresAuth,
  canAccessRoute,
  extractParams,
  getBreadcrumbs,
  getPageTitle,
  type RouteMeta,
} from './routes';
