// The P-4 guard (shell-size review D4): every EAGER binding is named in
// EAGER_BLOCKS with a reason, and every name there is still an eager binding.
// A new block type is therefore lazy unless someone decides otherwise, here.
import { describe, expect, it } from 'vitest';
import { blockBindings } from '../src/registry/bindings.js';
import type { BlockType } from '../src/index.js';
import { EAGER_BLOCKS } from './eagerBlocks.js';

describe('eager bindings are an allow-list (P-4)', () => {
  const bound = Object.entries(blockBindings) as [BlockType, { loading: string }][];

  it('every eager binding is on EAGER_BLOCKS, with a reason', () => {
    for (const [type, binding] of bound) {
      if (binding.loading !== 'eager') continue;
      const reason = EAGER_BLOCKS[type];
      expect(
        reason,
        `${type} is bound EAGER in registry/bindings.ts but is not on ` +
          'tests/eagerBlocks.ts. New blocks are lazy by default: bind it ' +
          "`loading: 'lazy'`, or add a row with a reason and record its byte " +
          'cost in SHELL_SPEND (scripts/perf-budgets.mjs).',
      ).toBeTruthy();
      expect(reason!.length, type).toBeGreaterThan(10);
    }
  });

  it('every EAGER_BLOCKS row is still an eager binding (no stale rows)', () => {
    for (const type of Object.keys(EAGER_BLOCKS) as BlockType[]) {
      expect(blockBindings[type]?.loading, type).toBe('eager');
    }
  });
});
