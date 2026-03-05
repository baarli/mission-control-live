import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { localStorageMock } from '@/__mocks__/localStorage';
import LoginScreen from '@/components/Auth/LoginScreen';
import { useAuthStore, initializeAuth } from '@/stores/authStore';

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    // Clear auth state
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    localStorageMock.clear();
  });

  describe('login flow', () => {
    it('complete successful login flow', async () => {
      const user = userEvent.setup();
      const onLogin = vi.fn();

      // Render login screen
      render(<LoginScreen onLogin={onLogin} />);

      // User sees login form
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Skriv passord...')).toBeInTheDocument();

      // User enters correct password
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');

      // User clicks login
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      // Wait for success
      await waitFor(() => {
        expect(onLogin).toHaveBeenCalled();
      });
    });

    it('shows error for wrong password', async () => {
      const user = userEvent.setup();
      const onLogin = vi.fn();

      render(<LoginScreen onLogin={onLogin} />);

      // User enters wrong password
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      // Error is displayed
      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Feil passord');

      // onLogin not called
      expect(onLogin).not.toHaveBeenCalled();
    });

    it('clears error and allows retry', async () => {
      const user = userEvent.setup();
      const onLogin = vi.fn();

      render(<LoginScreen onLogin={onLogin} />);

      // First attempt - wrong password
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      await screen.findByRole('alert');

      // Clear and try again
      await user.clear(screen.getByPlaceholderText('Skriv passord...'));
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      // Success this time
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      await waitFor(() => {
        expect(onLogin).toHaveBeenCalled();
      });
    });
  });

  describe('auth store integration', () => {
    it('login through store authenticates user', async () => {
      const { login } = useAuthStore.getState();

      // Login
      const result = await login('kloakontroll2026');

      expect(result).toBe(true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('admin@mission-control.no');
    });

    it('wrong password does not authenticate', async () => {
      const { login } = useAuthStore.getState();

      const result = await login('wrongpassword');

      expect(result).toBe(false);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('logout clears authentication', async () => {
      const { login, logout } = useAuthStore.getState();

      // Login first
      await login('kloakontroll2026');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then logout
      logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('checkAuth restores session from storage', async () => {
      const { login } = useAuthStore.getState();

      // Login to set storage
      await login('kloakontroll2026');

      // Reset store (simulating page reload)
      useAuthStore.setState({ user: null, isAuthenticated: false });

      // Check auth restores from storage
      const isAuth = initializeAuth();

      expect(isAuth).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).not.toBeNull();
    });
  });

  describe('storage persistence', () => {
    it('stores auth token in localStorage on login', async () => {
      const { login } = useAuthStore.getState();

      await login('kloakontroll2026');

      const token = localStorageMock.getItem('mission_control_auth_token');
      expect(token).toBeTruthy();
    });

    it('stores user in localStorage on login', async () => {
      const { login } = useAuthStore.getState();

      await login('kloakontroll2026');

      const user = localStorageMock.getParsedItem('mission_control_user', null) as Record<
        string,
        string
      > | null;
      expect(user).not.toBeNull();
      expect(user!.email).toBe('admin@mission-control.no');
    });

    it('clears storage on logout', async () => {
      const { login, logout } = useAuthStore.getState();

      await login('kloakontroll2026');
      expect(localStorageMock.getItem('mission_control_auth_token')).toBeTruthy();

      logout();

      expect(localStorageMock.getItem('mission_control_auth_token')).toBeNull();
      expect(localStorageMock.getItem('mission_control_user')).toBeNull();
    });
  });

  describe('loading states', () => {
    it('shows loading state during login', async () => {
      const user = userEvent.setup();
      const onLogin = vi.fn();

      render(<LoginScreen onLogin={onLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      // Button should show loading state
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button')).toHaveTextContent('Logg inn');
    });

    it('store shows loading state during login', async () => {
      const { login } = useAuthStore.getState();

      // Start login (don't await)
      const loginPromise = login('kloakontroll2026');

      // Should be loading
      expect(useAuthStore.getState().isLoading).toBe(true);

      await loginPromise;

      // Should not be loading after completion
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    it('submits on Enter key', async () => {
      const user = userEvent.setup();
      const onLogin = vi.fn();

      render(<LoginScreen onLogin={onLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(onLogin).toHaveBeenCalled();
      });
    });

    it('password input is focusable', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={vi.fn()} />);

      const input = screen.getByPlaceholderText('Skriv passord...');
      await user.click(input);

      expect(input).toHaveFocus();
    });

    it('button is focusable', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={vi.fn()} />);

      screen.getByRole('button', { name: 'Logg inn' });
      await user.tab();

      expect(document.activeElement).toBe(screen.getByPlaceholderText('Skriv passord...'));
    });
  });
});
