// seed-vars.test.ts — the list spec's `text` spellings (2026-11-20). Display
// shows `text`, grading binds `values`; the refinement is what keeps the two
// from ever disagreeing about the number.
import { describe, expect, it } from 'vitest';
import { SeedVarSpec } from '../src/seed-vars.js';

describe('SeedVarSpec list text', () => {
  it('accepts one spelling per value, each the same number, and keeps it through parse', () => {
    const r = SeedVarSpec.safeParse({ kind: 'list', values: [1.5, 3], text: ['1.50', '3.00'] });
    expect(r.success).toBe(true);
    expect(r.success && r.data.kind === 'list' ? r.data.text : null).toEqual(['1.50', '3.00']);
    expect(SeedVarSpec.safeParse({ kind: 'list', values: [1.5] }).success).toBe(true);
  });
  it('refuses a length mismatch, a different number, or a blank spelling', () => {
    expect(SeedVarSpec.safeParse({ kind: 'list', values: [1.5, 2], text: ['1.50'] }).success).toBe(false);
    expect(SeedVarSpec.safeParse({ kind: 'list', values: [1.5], text: ['1.55'] }).success).toBe(false);
    expect(SeedVarSpec.safeParse({ kind: 'list', values: [0], text: [' '] }).success).toBe(false);
  });
});
