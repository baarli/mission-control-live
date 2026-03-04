import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getItem, setItem, StorageKeys } from '@/services/storage';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Get the initial theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
  const stored = getItem<Theme>(StorageKeys.THEME, 'system');
  return stored;
}

/**
 * Resolve theme to actual light/dark value
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Theme store with persistence
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  resolvedTheme: 'light',
  
  setTheme: (theme) => {
    setItem(StorageKeys.THEME, theme);
    set({ 
      theme,
      resolvedTheme: resolveTheme(theme)
    });
    applyTheme(resolveTheme(theme));
  },
  
  toggleTheme: () => {
    const current = get().theme;
    const newTheme: Theme = current === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
}));

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme() {
  const theme = getInitialTheme();
  const resolved = resolveTheme(theme);
  useThemeStore.setState({ 
    theme,
    resolvedTheme: resolved
  });
  applyTheme(resolved);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      const newResolved = e.matches ? 'dark' : 'light';
      useThemeStore.setState({ resolvedTheme: newResolved });
      applyTheme(newResolved);
    }
  });
}
