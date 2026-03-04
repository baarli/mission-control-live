/* ============================================
   USE THEME HOOK
   ============================================ */

import { useEffect, useCallback } from 'react';
import { 
  useThemeStore, 
  useTheme as useThemeValue, 
  useToggleTheme as useToggleThemeFn,
  useSetTheme as useSetThemeFn,
  initializeTheme 
} from '../stores/themeStore';
import type { Theme } from '../types';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setDark: () => void;
  setLight: () => void;
  resetToSystem: () => void;
}

export function useTheme(): UseThemeReturn {
  const theme = useThemeValue();
  const toggleThemeFn = useToggleThemeFn();
  const setThemeFn = useSetThemeFn();
  const resetToSystem = useThemeStore((state) => state.resetToSystem);

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const setDark = useCallback(() => {
    setThemeFn('dark');
  }, [setThemeFn]);

  const setLight = useCallback(() => {
    setThemeFn('light');
  }, [setThemeFn]);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return {
    theme,
    isDark,
    isLight,
    toggleTheme: toggleThemeFn,
    setTheme: setThemeFn,
    setDark,
    setLight,
    resetToSystem
  };
}

// Hook for applying theme to specific elements
export function useThemedClass(baseClass: string, darkClass?: string, lightClass?: string): string {
  const { theme, isDark, isLight } = useTheme();
  
  let result = baseClass;
  if (isDark && darkClass) {
    result += ` ${darkClass}`;
  }
  if (isLight && lightClass) {
    result += ` ${lightClass}`;
  }
  
  return result;
}

// Hook for system preference detection
export function useSystemThemePreference(): Theme {
  const systemPreference = useThemeStore((state) => state.systemPreference);
  return systemPreference;
}

export default useTheme;
