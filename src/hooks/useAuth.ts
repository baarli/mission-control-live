import { useEffect } from 'react';

import { useAuthStore } from '@stores/authStore';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
}
