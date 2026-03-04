/**
 * Test entry point for Mission Control
 * 
 * This file exports all test utilities and mocks for use across the test suite.
 */

// Export setup utilities
export { server, handlers, wait } from './setup';

// Export mocks
export { 
  mockSupabaseClient, 
  mockUser, 
  mockSak, 
  mockSaker, 
  resetSupabaseMocks 
} from '@/__mocks__/supabase';

export { 
  mockSearchResults, 
  mockSearchBrave, 
  mockCalculateEntertainmentScore, 
  resetBraveMocks 
} from '@/__mocks__/brave-api';

export { 
  localStorageMock, 
  setupLocalStorageMock, 
  resetLocalStorageMock,
  setInitialLocalStorage,
} from '@/__mocks__/localStorage';

export { 
  setupMatchMediaMock, 
  resetMatchMediaMock, 
  triggerMatchMediaChange,
  setDarkModePreference,
  setupDefaultMatchMedia,
  type MatchMediaMock,
} from '@/__mocks__/matchMedia';

// Re-export testing-library for convenience
export { render, screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { vi, expect, describe, it, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
