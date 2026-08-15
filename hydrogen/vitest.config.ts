/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/components/**/*.tsx',
        'app/context/**/*.tsx',
        'app/lib/**/*.ts',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/*.d.ts',
        'app/components/icons/**',
        // Server-side infrastructure files that require framework mocking
        'app/lib/context.ts',
        'app/lib/session.ts',
        // GraphQL fragments - just string constants, no logic to test
        'app/lib/fragments.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 82,
        statements: 90,
      },
    },
    alias: {
      '~/': new URL('./app/', import.meta.url).pathname,
      '@test/': new URL('./test/', import.meta.url).pathname,
    },
  },
});
