/**
 * Mock for window.matchMedia
 * Used for testing theme switching and responsive design
 */

export type MatchMediaQuery = string;

export interface MatchMediaMock {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null;
  addEventListener: (type: 'change', listener: (ev: MediaQueryListEvent) => void) => void;
  removeEventListener: (type: 'change', listener: (ev: MediaQueryListEvent) => void) => void;
  dispatchEvent: (ev: Event) => boolean;
}

/**
 * Default matchMedia mock implementation
 */
class MatchMediaMockImpl implements MatchMediaMock {
  matches = false;
  media = '';
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null = null;
  private listeners: Array<(ev: MediaQueryListEvent) => void> = [];

  constructor(query: string, matches = false) {
    this.media = query;
    this.matches = matches;
  }

  addEventListener(type: 'change', listener: (ev: MediaQueryListEvent) => void): void {
    if (type === 'change') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: 'change', listener: (ev: MediaQueryListEvent) => void): void {
    if (type === 'change') {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  }

  dispatchEvent(_ev: Event): boolean {
    return true;
  }

  /**
   * Trigger change event for testing
   */
  triggerChange(matches: boolean): void {
    this.matches = matches;
    const event = new MediaQueryListEvent('change', { matches, media: this.media });
    this.listeners.forEach(listener => listener(event));
    if (this.onchange) {
      this.onchange.call(this as unknown as MediaQueryList, event);
    }
  }
}

// Store for matchMedia mocks
const matchMediaMocks = new Map<string, MatchMediaMockImpl>();

/**
 * Setup matchMedia mock
 */
export function setupMatchMediaMock(
  queries: Record<string, boolean> = { '(prefers-color-scheme: dark)': false }
) {
  matchMediaMocks.clear();

  Object.entries(queries).forEach(([query, matches]) => {
    matchMediaMocks.set(query, new MatchMediaMockImpl(query, matches));
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      const mock = matchMediaMocks.get(query);
      if (mock) return mock;

      // Return default mock for unknown queries
      const newMock = new MatchMediaMockImpl(query, false);
      matchMediaMocks.set(query, newMock);
      return newMock;
    },
  });
}

/**
 * Reset matchMedia mock
 */
export function resetMatchMediaMock() {
  matchMediaMocks.clear();
}

/**
 * Trigger change event for a specific query
 */
export function triggerMatchMediaChange(query: string, matches: boolean) {
  const mock = matchMediaMocks.get(query);
  if (mock) {
    mock.triggerChange(matches);
  }
}

/**
 * Set dark mode preference
 */
export function setDarkModePreference(isDark: boolean) {
  triggerMatchMediaChange('(prefers-color-scheme: dark)', isDark);
}

/**
 * Default matchMedia setup for tests
 */
export function setupDefaultMatchMedia() {
  setupMatchMediaMock({
    '(prefers-color-scheme: dark)': false,
    '(prefers-color-scheme: light)': true,
    '(min-width: 640px)': true,
    '(min-width: 768px)': true,
    '(min-width: 1024px)': true,
    '(min-width: 1280px)': false,
  });
}
