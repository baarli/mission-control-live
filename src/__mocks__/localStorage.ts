/**
 * In-memory localStorage mock for testing
 */
class LocalStorageMock {
  private store: Record<string, string> = {};
  
  get length(): number {
    return Object.keys(this.store).length;
  }
  
  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
  
  clear(): void {
    this.store = {};
  }
  
  /**
   * Get all keys matching a prefix
   */
  getKeysWithPrefix(prefix: string): string[] {
    return Object.keys(this.store).filter(key => key.startsWith(prefix));
  }
  
  /**
   * Get parsed item as JSON
   */
  getParsedItem<T>(key: string, defaultValue: T): T {
    const item = this.getItem(key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }
  
  /**
   * Set item as JSON
   */
  setParsedItem<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }
}

// Global localStorage mock instance
export const localStorageMock = new LocalStorageMock();

/**
 * Setup localStorage mock for tests
 */
export function setupLocalStorageMock() {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

/**
 * Reset localStorage mock
 */
export function resetLocalStorageMock() {
  localStorageMock.clear();
}

/**
 * Helper to set initial localStorage data
 */
export function setInitialLocalStorage(data: Record<string, unknown>) {
  resetLocalStorageMock();
  Object.entries(data).forEach(([key, value]) => {
    localStorageMock.setParsedItem(key, value);
  });
}
