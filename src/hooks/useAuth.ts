import { useEffect } from 'react';

import { useAuthStore } from '@stores/authStore';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const {
    user,
    session,
    isLoading,
    error,
    signIn,
    signOut,
    initialize,
    setError,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const isAuthenticated = !!session && !!user;

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    clearError: () => setError(null),
  };
}
