import { defineConfig } from 'vitest/config';

// Two environments, one config (S3 harness ruling D6):
//   - node for the pure suites (registry / tokens / sanitize / handler)
//   - jsdom for anything under tests/components/ — the React component,
//     conformance-factory, and store suites live there.
// jest-dom matchers register globally via tests/setup.ts (harmless in node).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    environmentMatchGlobs: [['tests/components/**', 'jsdom']],
    setupFiles: ['tests/setup.ts'],
  },
});
