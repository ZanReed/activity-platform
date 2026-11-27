import { defineConfig } from 'vitest/config';

// graph-kit's tests pick their environment per file (`// @vitest-environment
// jsdom` where a DOM is needed); this config exists for the pool.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    // Child processes, not worker threads: under Node 24, stopping a worker
    // thread mid-import aborted the whole run (SIGABRT in node::cjs_lexer,
    // 2026-11-27). Forks is vitest's default since v2; stated so it stays.
    pool: 'forks',
  },
});
