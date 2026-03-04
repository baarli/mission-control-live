import { create } from 'zustand';

import { getItem, setItem, removeItem, StorageKeys } from '@/services/storage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

const MOCK_USER: User = {
  id: 'user_1',
  email: 'admin@mission-control.no',
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const CORRECT_PASSWORD = 'kloakontroll2026';

/**
 * Auth store for managing authentication state
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (password: string) => {
    set({ isLoading: true });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === CORRECT_PASSWORD) {
      setItem(StorageKeys.AUTH_TOKEN, 'mock_token_' + Date.now());
      setItem(StorageKeys.USER, MOCK_USER);
      set({ 
        user: MOCK_USER, 
        isAuthenticated: true,
        isLoading: false 
      });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },
  
  logout: () => {
    removeItem(StorageKeys.AUTH_TOKEN);
    removeItem(StorageKeys.USER);
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },
  
  checkAuth: () => {
    const token = getItem<string | null>(StorageKeys.AUTH_TOKEN, null);
    const user = getItem<User | null>(StorageKeys.USER, null);
    
    if (token && user) {
      set({ 
        user, 
        isAuthenticated: true 
      });
      return true;
    }
    
    set({ 
      user: null, 
      isAuthenticated: false 
    });
    return false;
  },
}));

/**
 * Initialize auth state from storage
 */
export function initializeAuth() {
  return useAuthStore.getState().checkAuth();
}
