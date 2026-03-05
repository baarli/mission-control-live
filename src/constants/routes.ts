/* ============================================
   ROUTES
   Route definitions for Mission Control
   ============================================ */

/**
 * Route paths
 */
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  LOGOUT: '/logout',

  // Main routes
  HOME: '/',
  DASHBOARD: '/',
  SAKSLISTE: '/saksliste',
  SEARCH: '/search',
  STATS: '/stats',
  SETTINGS: '/settings',

  // Detail routes
  SAK_DETAIL: '/saksliste/:id',
  SAK_EDIT: '/saksliste/:id/edit',

  // Utility routes
  NOT_FOUND: '/404',
  WILDCARD: '*',
} as const;

/**
 * Route metadata for navigation
 */
export interface RouteMeta {
  path: string;
  label: string;
  icon: string;
  requiresAuth: boolean;
  showInNav: boolean;
  order?: number;
}

/**
 * Route metadata map
 */
export const ROUTE_META: Record<string, RouteMeta> = {
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    requiresAuth: true,
    showInNav: true,
    order: 1,
  },
  [ROUTES.SAKSLISTE]: {
    path: ROUTES.SAKSLISTE,
    label: 'Saksliste',
    icon: 'List',
    requiresAuth: true,
    showInNav: true,
    order: 2,
  },
  [ROUTES.SEARCH]: {
    path: ROUTES.SEARCH,
    label: 'Søk',
    icon: 'Search',
    requiresAuth: true,
    showInNav: true,
    order: 3,
  },
  [ROUTES.STATS]: {
    path: ROUTES.STATS,
    label: 'Statistikk',
    icon: 'BarChart3',
    requiresAuth: true,
    showInNav: true,
    order: 4,
  },
  [ROUTES.SETTINGS]: {
    path: ROUTES.SETTINGS,
    label: 'Innstillinger',
    icon: 'Settings',
    requiresAuth: true,
    showInNav: true,
    order: 5,
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    label: 'Logg inn',
    icon: 'LogIn',
    requiresAuth: false,
    showInNav: false,
  },
};

/**
 * Get route by path
 */
export function getRouteMeta(path: string): RouteMeta | undefined {
  // Handle dynamic routes
  for (const [key, meta] of Object.entries(ROUTE_META)) {
    if (path === key || matchRoute(path, key)) {
      return meta;
    }
  }
  return undefined;
}

/**
 * Check if a path matches a route pattern
 */
export function matchRoute(path: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern.replace(/:([^/]+)/g, '([^/]+)').replace(/\*/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Build route with parameters
 */
export function buildRoute(route: string, params: Record<string, string | number>): string {
  let builtRoute = route;

  for (const [key, value] of Object.entries(params)) {
    builtRoute = builtRoute.replace(`:${key}`, String(value));
  }

  return builtRoute;
}

/**
 * Get navigation routes (sorted by order)
 */
export function getNavRoutes(): RouteMeta[] {
  return Object.values(ROUTE_META)
    .filter(route => route.showInNav)
    .sort((a, b) => (a.order || 99) - (b.order || 99));
}

/**
 * Get routes requiring authentication
 */
export function getAuthRoutes(): RouteMeta[] {
  return Object.values(ROUTE_META).filter(route => route.requiresAuth);
}

/**
 * Get public routes (no auth required)
 */
export function getPublicRoutes(): RouteMeta[] {
  return Object.values(ROUTE_META).filter(route => !route.requiresAuth);
}

/**
 * Check if route requires auth
 */
export function requiresAuth(path: string): boolean {
  const meta = getRouteMeta(path);
  return meta?.requiresAuth ?? true;
}

/**
 * Route guard helper
 */
export function canAccessRoute(
  path: string,
  isAuthenticated: boolean
): { allowed: boolean; redirectTo?: string } {
  const needsAuth = requiresAuth(path);

  if (needsAuth && !isAuthenticated) {
    return { allowed: false, redirectTo: ROUTES.LOGIN };
  }

  if (!needsAuth && isAuthenticated && path === ROUTES.LOGIN) {
    return { allowed: false, redirectTo: ROUTES.DASHBOARD };
  }

  return { allowed: true };
}

/**
 * Extract parameters from path
 */
export function extractParams(pattern: string, path: string): Record<string, string> | null {
  const paramNames: string[] = [];
  const regexPattern = pattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });

  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);

  if (!match) return null;

  return paramNames.reduce(
    (acc, name, index) => {
      acc[name] = match[index + 1] ?? '';
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Get breadcrumb path
 */
export function getBreadcrumbs(path: string): Array<{ label: string; path?: string }> {
  const breadcrumbs: Array<{ label: string; path?: string }> = [];

  // Always add home
  breadcrumbs.push({ label: 'Dashboard', path: ROUTES.DASHBOARD });

  // Add specific routes based on path
  if (path.startsWith('/saksliste')) {
    if (path === '/saksliste') {
      breadcrumbs.push({ label: 'Saksliste' });
    } else {
      breadcrumbs.push({ label: 'Saksliste', path: ROUTES.SAKSLISTE });

      const params = extractParams(ROUTES.SAK_DETAIL, path);
      if (params) {
        breadcrumbs.push({ label: `Sak ${params.id}` });
      }
    }
  } else if (path.startsWith('/search')) {
    breadcrumbs.push({ label: 'Søk' });
  } else if (path.startsWith('/stats')) {
    breadcrumbs.push({ label: 'Statistikk' });
  } else if (path.startsWith('/settings')) {
    breadcrumbs.push({ label: 'Innstillinger' });
  }

  return breadcrumbs;
}

/**
 * Route titles for document title
 */
export function getPageTitle(path: string): string {
  const meta = getRouteMeta(path);
  const baseTitle = 'Mission Control | NRJ Morgen';

  if (meta && meta.label && meta.path !== '/') {
    return `${meta.label} | ${baseTitle}`;
  }

  return baseTitle;
}

/**
 * External links
 */
export const EXTERNAL_LINKS = {
  nrj: 'https://www.nrj.no',
  supabase: 'https://supabase.com',
  github: 'https://github.com/baarli/mission-control-live',
  braveSearch: 'https://brave.com/search',
};

export default {
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
};
