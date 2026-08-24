// =============================================================================
// checkGroups.test.ts — the checkpoint fold (activity flow modes, F1)
// -----------------------------------------------------------------------------
// The fold decides where Check buttons render and what each one covers. Its
// failure mode is the one this slice exists to prevent: a section that no
// button covers is a section whose answers are never graded and never
// recorded, silently.
//
// ⚠ THESE ARE THE FOLD'S OWN PINS, NOT THE COVERAGE GUARD. A property test
// over a fold that assigns sections by construction proves the construction,
// not the product (OV#16) — guard 5 lives in the component suite
// (components/check-groups.test.tsx) and binds to the RENDERED DOM. What is
// pinned here is the shape: where boundaries fall, and that `single` and the
// implicit end checkpoint behave as R1 says.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { checkGroups, sectionsInGroup } from '../src/container/checkGroups.js';
import type { DocumentIndex, SectionIndex } from '../src/container/blockIndex.js';

/** A minimal indexed section — the fold reads only id + isCheckpoint. */
function section(id: string, isCheckpoint = false): SectionIndex {
  return { sectionId: id, isCheckpoint, items: {}, blockIds: [], unsupported: [] };
}

function indexOf(...sections: SectionIndex[]): DocumentIndex {
  return {
    sections,
    bySection: Object.fromEntries(sections.map((s) => [s.sectionId, s])),
    unsupported: [],
  };
}

const idsOf = (groups: ReturnType<typeof checkGroups>) =>
  groups.map((g) => g.sections.map((s) => s.sectionId));

describe('R1 — a checkpoint checks everything since the previous one', () => {
  it('groups [plain, checkpoint, plain, plain] into two groups', () => {
    const index = indexOf(
      section('a'),
      section('b', true),
      section('c'),
      section('d'),
    );
    expect(idsOf(checkGroups(index, 'free'))).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('anchors each group on its last section — the checkpoint', () => {
    const index = indexOf(section('a'), section('b', true), section('c'));
    expect(checkGroups(index, 'free').map((g) => g.id)).toEqual(['b', 'c']);
  });

  it('a document with no checkpoint at all is exactly one Check at the end', () => {
    const index = indexOf(section('a'), section('b'), section('c'));
    expect(idsOf(checkGroups(index, 'free'))).toEqual([['a', 'b', 'c']]);
  });

  it('a checkpoint ON the last section does not mint an empty trailing group', () => {
    const index = indexOf(section('a'), section('b', true));
    expect(idsOf(checkGroups(index, 'free'))).toEqual([['a', 'b']]);
  });

  it('consecutive checkpoints each get their own single-section group', () => {
    const index = indexOf(section('a', true), section('b', true));
    expect(idsOf(checkGroups(index, 'free'))).toEqual([['a'], ['b']]);
  });

  it('an empty document has nothing to check', () => {
    expect(checkGroups(indexOf(), 'free')).toEqual([]);
  });

  it('locked groups exactly as free does — the mode changes freezing, not scope', () => {
    const index = indexOf(section('a'), section('b', true), section('c'));
    expect(idsOf(checkGroups(index, 'locked'))).toEqual(
      idsOf(checkGroups(index, 'free')),
    );
  });
});

describe('R2 — single ignores every marker', () => {
  it('collapses a marked document to one end-of-activity group', () => {
    const index = indexOf(
      section('a'),
      section('b', true),
      section('c', true),
      section('d'),
    );
    expect(idsOf(checkGroups(index, 'single'))).toEqual([['a', 'b', 'c', 'd']]);
  });

  it('single ≡ free with every marker stripped (OV#12, spelled out)', () => {
    const marked = indexOf(section('a'), section('b', true), section('c'));
    const stripped = indexOf(section('a'), section('b'), section('c'));
    expect(idsOf(checkGroups(marked, 'single'))).toEqual(
      idsOf(checkGroups(stripped, 'free')),
    );
  });
});

describe('no section is ever left out of the fold', () => {
  // The fold half of the invariant. The DOM half — the one that actually
  // proves a student can check every section — is guard 5 in
  // components/check-groups.test.tsx.
  const shapes: boolean[][] = [
    [],
    [false],
    [true],
    [false, false],
    [true, false],
    [false, true],
    [true, true],
    [false, true, false, false],
    [true, false, true, false, true],
    [false, false, false, true],
  ];

  for (const mode of ['free', 'locked', 'single'] as const) {
    it(`covers every section exactly once, in order (${mode})`, () => {
      for (const shape of shapes) {
        const index = indexOf(
          ...shape.map((cp, i) => section(`s${i}`, cp)),
        );
        const groups = checkGroups(index, mode);
        expect(groups.flatMap((g) => g.sections.map((s) => s.sectionId))).toEqual(
          shape.map((_, i) => `s${i}`),
        );
        expect(groups.every((g) => g.sections.length > 0)).toBe(true);
      }
    });
  }
});

describe('sectionsInGroup', () => {
  it('maps every section to the sibling ids its Check covers', () => {
    const index = indexOf(section('a'), section('b', true), section('c'));
    const map = sectionsInGroup(checkGroups(index, 'free'));
    expect(map.a).toEqual(['a', 'b']);
    expect(map.b).toEqual(['a', 'b']);
    expect(map.c).toEqual(['c']);
  });
});
