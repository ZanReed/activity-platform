import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Child processes, not worker threads: under Node 24, stopping a worker
    // thread mid-import aborted the whole run (SIGABRT in node::cjs_lexer,
    // 2026-11-27). Forks is vitest's default since v2; stated so it stays.
    pool: 'forks',
  },
});
