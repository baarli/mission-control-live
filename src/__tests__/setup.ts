import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { vi, expect, afterEach, beforeAll, afterAll } from 'vitest';

// Import mocks
import { setupLocalStorageMock, resetLocalStorageMock } from '@/__mocks__/localStorage';
import { setupDefaultMatchMedia, resetMatchMediaMock } from '@/__mocks__/matchMedia';

// ============================================================================
// MSW Server Setup
// ============================================================================

export const handlers = [
  // Brave API mock
  http.get('https://api.search.brave.com/res/v1/*/search', () => {
    return HttpResponse.json({
      results: [
        {
          title: 'Test Result 1',
          description: 'Test description 1',
          url: 'https://example.com/1',
          thumbnail: { src: 'https://example.com/thumb1.jpg' },
        },
        {
          title: 'Test Result 2',
          description: 'Test description 2',
          url: 'https://example.com/2',
        },
      ],
    });
  }),

  // Supabase auth mock
  http.post('https://*.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock_token',
      user: {
        id: 'user_123',
        email: 'test@example.com',
      },
    });
  }),

  // Default fallback
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
];

export const server = setupServer(...handlers);

// ============================================================================
// Global Setup
// ============================================================================

beforeAll(() => {
  // Setup MSW
  server.listen({ onUnhandledRequest: 'warn' });

  // Setup mocks
  setupLocalStorageMock();
  setupDefaultMatchMedia();

  // Setup IntersectionObserver mock
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Setup MediaQueryListEvent mock
  global.MediaQueryListEvent = class MediaQueryListEvent extends Event {
    matches: boolean;
    media: string;

    constructor(type: string, init?: { matches?: boolean; media?: string }) {
      super(type);
      this.matches = init?.matches ?? false;
      this.media = init?.media ?? '';
    }
  } as unknown as typeof MediaQueryListEvent;

  // Setup ResizeObserver mock
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });

  // Mock console methods in test environment
  if (process.env.NODE_ENV === 'test') {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

afterEach(() => {
  // Cleanup React Testing Library
  cleanup();

  // Reset MSW handlers
  server.resetHandlers();

  // Reset mocks
  resetLocalStorageMock();
  resetMatchMediaMock();
  setupDefaultMatchMedia();

  // Clear all mocks
  vi.clearAllMocks();
});

afterAll(() => {
  // Close MSW server
  server.close();

  // Restore console mocks
  if (process.env.NODE_ENV === 'test') {
    vi.restoreAllMocks();
  }
});

// ============================================================================
// Custom Matchers
// ============================================================================

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// ============================================================================
// Global Types
// ============================================================================

declare module 'vitest' {
  interface Assertion {
    toBeWithinRange(floor: number, ceiling: number): void;
  }
  interface AsymmetricMatchersContaining {
    toBeWithinRange(floor: number, ceiling: number): void;
  }
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock file for file input testing
 */
export function createMockFile(name: string, size: number, type: string): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}

/**
 * Mock fetch response
 */
export function mockFetchResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}
