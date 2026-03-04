import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@hooks': resolve(__dirname, 'src/hooks'),
    },
  },
  
  test: {
    // Enable globals for cleaner test syntax
    globals: true,
    
    // Use jsdom for DOM testing
    environment: 'jsdom',
    
    // Setup files to run before tests
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // Include patterns for test files
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/__tests__/**/*.{test,spec}.{ts,tsx}',
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      '**/*.d.ts',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Include all source files
      include: [
        'src/**/*.{ts,tsx}',
      ],
      
      // Exclude non-testable files
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/__mocks__/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/App.tsx',
      ],
      
      // Thresholds for 100% coverage on critical files
      thresholds: {
        // Global thresholds
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
        // 100% coverage for services
        'src/services/**': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        // 100% coverage for utils
        'src/utils/**': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        // 100% coverage for UI components
        'src/components/UI/**': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
      
      // Enable all coverage reporters
      all: true,
      
      // Clean coverage directory before each run
      clean: true,
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Type checking disabled for now due to path issues
    typecheck: {
      enabled: false,
    },
    
    // Retry failed tests
    retry: 1,
    
    // Output reporters
    reporters: [
      'default',
      ['junit', {
        outputFile: './coverage/junit.xml',
      }],
    ],
    
    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    },
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Mock CSS imports
    css: {
      include: [/\.css$/],
    },
    
    // Pool configuration for parallel tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    
    // Isolate tests
    isolate: true,
    
    // Max concurrency
    maxConcurrency: 5,
  },
  
  // ESBuild configuration
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
    ],
  },
});
