// =============================================================================
// conformance.test.tsx — runs the family suite over every bound component
// -----------------------------------------------------------------------------
// The roster comes from the REGISTRY, not from a list maintained here: bind a
// component and its conformance suite runs on the next test run, with nothing
// to remember. That is the D4 magic moment, and it is also the anti-drift
// mechanism — a component cannot ship having quietly skipped its family's
// contract.
//
// Lives under tests/components/ so it inherits the jsdom environment.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  boundBlockTypes,
  registerFamilyConformance,
} from '../conformance/familyConformance.js';
import { blockRegistry, registeredBlockTypes } from '../../src/index.js';

const bound = boundBlockTypes();

describe('conformance roster', () => {
  it('runs against every registry entry that has a component binding', () => {
    // Not a fixed list: this asserts the roster IS the bound set, so a new
    // binding is covered automatically and an unbound one is not demanded.
    // Every bound type is a REAL registry type (the bindings map is keyed
    // separately now, so this is also the guard that it cannot drift).
    const expected = registeredBlockTypes.filter((type) => bound.includes(type));
    expect(bound.every((type) => registeredBlockTypes.includes(type))).toBe(true);
    expect([...bound].sort()).toEqual([...expected].sort());
    expect(bound.length).toBeGreaterThan(0);
  });

  it('covers all three checked-state families (the D15 trio)', () => {
    const families = new Set(bound.map((type) => blockRegistry[type].family));
    expect([...families].sort()).toEqual([
      'auto_gradable',
      'recorded',
      'static',
    ]);
  });
});

for (const type of bound) {
  registerFamilyConformance(type);
}
