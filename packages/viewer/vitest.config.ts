import { defineConfig } from 'vitest/config';

// Two environments, one config (S3 harness ruling D6):
//   - node for the pure suites (registry / tokens / sanitize / handler)
//   - jsdom for anything under tests/components/ — the React component,
//     conformance-factory, and store suites live there. Each of those files
//     says so on its first line (`// @vitest-environment jsdom`), since
//     vitest 4 removed `environmentMatchGlobs`; a file that drops it fails
//     loudly on the first `document` it touches.
// jest-dom matchers register globally via tests/setup.ts (harmless in node).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Child processes, not worker threads: under Node 24, stopping a worker
    // thread mid-import aborted the whole run (SIGABRT in node::cjs_lexer,
    // 2026-11-27). Forks is vitest's default since v2; stated so it stays.
    pool: 'forks',
    setupFiles: ['tests/setup.ts'],
  },
});
