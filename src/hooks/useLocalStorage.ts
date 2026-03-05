/* ============================================
   USE LOCALSTORAGE HOOK
   ============================================ */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

// Type for serializer functions
type Serializer<T> = {
  stringify: (value: T) => string;
  parse: (value: string) => T;
};

// Default JSON serializer
const defaultSerializer: Serializer<unknown> = {
  stringify: JSON.stringify,
  parse: JSON.parse,
};

interface UseLocalStorageOptions<T> {
  serializer?: Serializer<T>;
  sync?: boolean; // Sync across tabs
}

/**
 * Hook for persisting state to localStorage
 * @param key - localStorage key
 * @param initialValue - Initial value if no stored value exists
 * @param options - Configuration options
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serializer = defaultSerializer as Serializer<T>, sync = true } = options;

  // Get stored value or initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return serializer.parse(item);
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
    }

    return initialValue;
  }, [key, initialValue, serializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer.stringify(valueToStore));

          // Dispatch custom event for cross-tab sync
          if (sync) {
            window.dispatchEvent(new StorageEvent('storage', { key }));
          }
        }
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, sync]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);

        if (sync) {
          window.dispatchEvent(new StorageEvent('storage', { key }));
        }
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${key}":`, error);
    }
  }, [key, initialValue, sync]);

  // Listen for changes in other tabs
  useEffect(() => {
    if (!sync || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, readValue, sync]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for reading localStorage value with SSR support
 * Uses useSyncExternalStore for better React 18 compatibility
 */
export function useLocalStorageValue<T>(
  key: string,
  initialValue: T,
  serializer: Serializer<T> = defaultSerializer as Serializer<T>
): T {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? serializer.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue, serializer]);

  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          callback();
        }
      };

      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    },
    [key]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useLocalStorage;
