import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

import type { ReactNode } from 'react';

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
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
