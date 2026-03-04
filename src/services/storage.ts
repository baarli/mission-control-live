/**
 * Storage service for localStorage operations with error handling
 */

const PREFIX = 'mission_control_';

/**
 * Get localStorage with fallback for SSR/test environments
 */
function getStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // Fallback for SSR/testing
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
}

/**
 * Get an item from localStorage
 */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const storage = getStorage();
    const fullKey = PREFIX + key;
    const item = storage.getItem(fullKey);
    
    if (item === null) {
      return defaultValue;
    }
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage [${key}]:`, error);
    return defaultValue;
  }
}

/**
 * Set an item in localStorage
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const storage = getStorage();
    const fullKey = PREFIX + key;
    storage.setItem(fullKey, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeItem(key: string): boolean {
  try {
    const storage = getStorage();
    const fullKey = PREFIX + key;
    storage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Clear all mission control items from localStorage
 */
export function clearAll(): boolean {
  try {
    const storage = getStorage();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => storage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 */
export function hasItem(key: string): boolean {
  try {
    const storage = getStorage();
    const fullKey = PREFIX + key;
    return storage.getItem(fullKey) !== null;
  } catch (error) {
    console.error(`Error checking localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Get all keys with the mission control prefix
 */
export function getAllKeys(): string[] {
  try {
    const storage = getStorage();
    const keys: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(PREFIX)) {
        keys.push(key.slice(PREFIX.length));
      }
    }
    
    return keys;
  } catch (error) {
    console.error('Error getting keys from localStorage:', error);
    return [];
  }
}

/**
 * Storage keys used in the application
 */
export const StorageKeys = {
  THEME: 'theme',
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  RECENT_SEARCHES: 'recent_searches',
  DASHBOARD_FILTERS: 'dashboard_filters',
} as const;
