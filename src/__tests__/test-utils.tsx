import {
  render,
  RenderOptions,
  RenderResult,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
  cleanup,
} from '@testing-library/react';
import { ReactElement } from 'react';
import type { ReactNode } from 'react';

export { screen, fireEvent, waitFor, act, within, cleanup };

/* eslint-disable react-refresh/only-export-components */
// Custom provider wrapper
function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Add providers here: QueryClientProvider, ThemeProvider, etc. */}
      {children}
    </>
  );
}

/**
 * Custom render function that wraps components with providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export { customRender as render };
