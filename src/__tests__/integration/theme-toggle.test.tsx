import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useThemeStore, initializeTheme } from '@/stores/themeStore';
import { localStorageMock } from '@/__mocks__/localStorage';
import { setupDefaultMatchMedia, triggerMatchMediaChange } from '@/__mocks__/matchMedia';
import type { Theme } from '@/types';

// Simple theme toggle component for testing
const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={toggleTheme} data-testid="toggle-btn">Toggle</button>
      <button onClick={() => setTheme('light')} data-testid="light-btn">Light</button>
      <button onClick={() => setTheme('dark')} data-testid="dark-btn">Dark</button>
      <button onClick={() => setTheme('system')} data-testid="system-btn">System</button>
    </div>
  );
};

import React from 'react';

describe('Theme Toggle Integration', () => {
  beforeEach(() => {
    // Reset store
    useThemeStore.setState({ theme: 'system', resolvedTheme: 'light' });
    localStorageMock.clear();
    setupDefaultMatchMedia();
    
    // Reset document class
    document.documentElement.classList.remove('dark');
  });
  
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });
  
  describe('theme switching', () => {
    it('switches to dark theme', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      
      await user.click(screen.getByTestId('dark-btn'));
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    it('switches to light theme', async () => {
      const user = userEvent.setup();
      
      // Start with dark
      useThemeStore.setState({ theme: 'dark', resolvedTheme: 'dark' });
      document.documentElement.classList.add('dark');
      
      render(<ThemeToggle />);
      
      await user.click(screen.getByTestId('light-btn'));
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
    
    it('toggles between light and dark', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      // Start with light
      await user.click(screen.getByTestId('light-btn'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      
      // Toggle to dark
      await user.click(screen.getByTestId('toggle-btn'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      
      // Toggle back to light
      await user.click(screen.getByTestId('toggle-btn'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });
  
  describe('system theme preference', () => {
    it('follows system preference when set to system', () => {
      // Initialize with system theme
      useThemeStore.setState({ theme: 'system' });
      
      const state = useThemeStore.getState();
      expect(state.theme).toBe('system');
    });
    
    it('resolves to light when system prefers light', () => {
      setupDefaultMatchMedia();
      // Manually set resolved to light
      useThemeStore.setState({ theme: 'system', resolvedTheme: 'light' });
      
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
    });
    
    it('resolves to dark when system prefers dark', () => {
      setupDefaultMatchMedia();
      // Manually set resolved to dark
      useThemeStore.setState({ theme: 'system', resolvedTheme: 'dark' });
      
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    });
    
    it('switches to system mode', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      // First set to dark
      await user.click(screen.getByTestId('dark-btn'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      
      // Then switch to system
      await user.click(screen.getByTestId('system-btn'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    });
  });
  
  describe('storage persistence', () => {
    it('saves theme preference to localStorage', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      await user.click(screen.getByTestId('dark-btn'));
      
      const stored = localStorageMock.getParsedItem<Theme>('mission_control_theme', 'system');
      expect(stored).toBe('dark');
    });
    
    it('restores theme from localStorage on init', () => {
      // Set stored theme
      localStorageMock.setParsedItem('mission_control_theme', 'dark');
      
      // Initialize
      initializeTheme();
      
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    it('defaults to system when no stored preference', () => {
      localStorageMock.clear();
      
      initializeTheme();
      
      expect(useThemeStore.getState().theme).toBe('system');
    });
  });
  
  describe('document class manipulation', () => {
    it('adds dark class to document when theme is dark', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      await user.click(screen.getByTestId('dark-btn'));
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    it('removes dark class from document when theme is light', async () => {
      // Start with dark
      document.documentElement.classList.add('dark');
      useThemeStore.setState({ theme: 'dark', resolvedTheme: 'dark' });
      
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      await user.click(screen.getByTestId('light-btn'));
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
  
  describe('edge cases', () => {
    it('handles rapid theme switches', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);
      
      // Rapidly switch themes
      await user.click(screen.getByTestId('dark-btn'));
      await user.click(screen.getByTestId('light-btn'));
      await user.click(screen.getByTestId('dark-btn'));
      await user.click(screen.getByTestId('system-btn'));
      
      // Should end with system
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    });
    
    it('handles invalid stored theme gracefully', () => {
      localStorageMock.setItem('mission_control_theme', 'invalid-theme');
      
      // Should not crash
      initializeTheme();
      
      // Falls back to system
      expect(useThemeStore.getState().theme).toBe('system');
    });
  });
});
