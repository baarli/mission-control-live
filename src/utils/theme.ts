/* ============================================
   THEME UTILITIES
   ============================================ */

import type { Theme } from '../types';

/**
 * Detect system theme preference
 */
export function detectSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Check if system prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if system prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Watch for theme changes
 */
export function watchThemeChanges(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches ? 'light' : 'dark');
  };

  mediaQuery.addEventListener('change', handler);

  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Watch for reduced motion changes
 */
export function watchReducedMotionChanges(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  mediaQuery.addEventListener('change', handler);

  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Generate CSS variables for theme
 */
export function generateThemeVariables(theme: Theme): Record<string, string> {
  const isDark = theme === 'dark';

  return {
    // Background colors
    '--bg-primary': isDark ? '#0f172a' : '#ffffff',
    '--bg-secondary': isDark ? '#1e293b' : '#f8fafc',
    '--bg-tertiary': isDark ? '#334155' : '#e2e8f0',

    // Text colors
    '--text-primary': isDark ? '#f8fafc' : '#0f172a',
    '--text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--text-tertiary': isDark ? '#64748b' : '#94a3b8',

    // Border colors
    '--border-primary': isDark ? '#334155' : '#e2e8f0',
    '--border-secondary': isDark ? '#475569' : '#cbd5e1',

    // Accent colors (NRJ red)
    '--accent-primary': '#dc2626',
    '--accent-primary-hover': '#b91c1c',
    '--accent-secondary': '#fca5a5',

    // Status colors
    '--status-success': isDark ? '#22c55e' : '#16a34a',
    '--status-warning': isDark ? '#f59e0b' : '#d97706',
    '--status-error': isDark ? '#ef4444' : '#dc2626',
    '--status-info': isDark ? '#3b82f6' : '#2563eb',

    // Shadows
    '--shadow-sm': isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow-md': isDark
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--shadow-lg': isDark
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };
}

/**
 * Apply CSS variables to element
 */
export function applyThemeVariables(element: HTMLElement, variables: Record<string, string>): void {
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Get Tailwind classes for theme
 */
export function getThemeClasses(theme: Theme): {
  bg: string;
  text: string;
  border: string;
} {
  const isDark = theme === 'dark';

  return {
    bg: isDark ? 'bg-slate-900' : 'bg-white',
    text: isDark ? 'text-slate-100' : 'text-slate-900',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
  };
}

/**
 * Generate meta theme color
 */
export function getMetaThemeColor(theme: Theme): string {
  return theme === 'dark' ? '#0f172a' : '#ffffff';
}

/**
 * Store theme preference
 */
export function storeThemePreference(theme: Theme): void {
  try {
    localStorage.setItem('mc-theme-preference', theme);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get stored theme preference
 */
export function getStoredThemePreference(): Theme | null {
  try {
    const stored = localStorage.getItem('mc-theme-preference');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

/**
 * Clear stored theme preference
 */
export function clearStoredThemePreference(): void {
  try {
    localStorage.removeItem('mc-theme-preference');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get effective theme (stored or system)
 */
export function getEffectiveTheme(): Theme {
  const stored = getStoredThemePreference();
  if (stored) return stored;

  return detectSystemTheme();
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): Theme {
  const theme = getEffectiveTheme();

  if (typeof document !== 'undefined') {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    root.setAttribute('data-theme', theme);

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', getMetaThemeColor(theme));
    }
  }

  return theme;
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme(currentTheme: Theme): Theme {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

/**
 * Theme transition helper
 */
export function withThemeTransition(callback: () => void): void {
  if (prefersReducedMotion()) {
    callback();
    return;
  }

  if (typeof document === 'undefined') {
    callback();
    return;
  }

  // Add transition class
  document.documentElement.classList.add('theme-transition');

  // Execute callback
  callback();

  // Remove transition class after animation
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 300);
}

/**
 * Get color scheme for charts
 */
export function getChartColorScheme(theme: Theme): string[] {
  const isDark = theme === 'dark';

  return isDark
    ? ['#dc2626', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']
    : ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777'];
}

export default {
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
};
