/**
 * @vitest-environment jsdom
 */
// =============================================================================
// math-blanks.test.ts — Model B runtime integration (the held-sync-reference path)
// -----------------------------------------------------------------------------
// Exercises scoreBlanksInScope (the shared check + submit primitive) against a
// 'math' blank, using the REAL mathEquivalent handed in via setMathEquivalent —
// so this pins the full runtime seam: attribute reading → 'math' strategy →
// held reference → tri-state result. Plus the A2 unscored-until-loaded behavior
// and a save/restore round-trip proving a math result survives a reload with its
// value intact (the A1b concern — no storage-shape change was needed because the
// held-sync-reference design re-scores at check and stores value+result atomically).
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { mathEquivalent } from '@activity/graph-kit/math-equivalent';
import { scoreBlanksInScope, isUnscoredMathAnswer } from '../blanks.js';
import { setMathEquivalent } from '../strategies.js';
import {
  saveActivityState,
  loadActivityState,
  applyStoredState,
} from '../storage.js';
import type { BlankRef, Refs } from '../refs.js';
import type { RuntimeState, BlankState } from '../state.js';
import type { RuntimeConfig } from '../config.js';

function buildMathBlankRef(
  id: string,
  answers: string[],
  value: string,
  opts: { equivalence?: string; tolerance?: number } = {},
): BlankRef {
  const input = document.createElement('input');
  input.className = 'blank';
  input.setAttribute('data-blank-id', id);
  input.setAttribute('data-blank-answers', answers.join('|'));
  input.setAttribute('data-blank-strategy', 'math');
  if (opts.equivalence) input.setAttribute('data-blank-equivalence', opts.equivalence);
  if (opts.tolerance !== undefined)
    input.setAttribute('data-blank-tolerance', String(opts.tolerance));
  input.value = value;
  document.body.appendChild(input);
  return {
    input,
    hintButton: null,
    mistakeButton: null,
    answers,
    strategy: 'math',
    hintContent: null,
    mistakeFeedback: [],
    blockId: 'b1',
    sectionId: 's1',
    groupId: null,
  };
}

function makeRefs(refs: BlankRef[]): Refs {
  const blanks = new Map<string, BlankRef>();
  for (const ref of refs) blanks.set(ref.input.dataset.blankId ?? '', ref);
  return {
    blanks,
    fillInBlanks: new Map(),
    mcs: new Map(),
    matches: new Map(),
    orderings: new Map(),
    graphs: new Map(),
    graphDisplays: new Map(),
    numberLines: new Map(),
    dataPlots: new Map(),
    freeText: new Map(),
    sections: new Map(),
    popover: null,
  };
}

function makeState(blankIds: string[]): RuntimeState {
  const blanks: Record<string, BlankState> = {};
  for (const id of blankIds) blanks[id] = { result: null, matchedMistake: null };
  return {
    submitted: false,
    attemptNumber: 1,
    studentName: '',
    popover: null,
    sections: {},
    blanks,
    blocks: {},
    mcs: {},
    matches: {},
    orderings: {},
    arrange: null,
    graphs: {},
    numberLines: {},
    dataPlots: {},
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  // Each test decides whether the kit is "loaded". Re-arm per test; the not-ready
  // test runs first and must see it unarmed, so it does NOT call setMathEquivalent.
});

describe('scoreBlanksInScope — math blank, kit NOT loaded', () => {
  it('leaves an answered math blank unscored (null) and flags it as ungraded', () => {
    const ref = buildMathBlankRef('m1', ['2a'], 'a+a');
    const state = makeState(['m1']);
    scoreBlanksInScope(state, makeRefs([ref]), ['m1']);
    expect(state.blanks.m1?.result).toBeNull();
    expect(isUnscoredMathAnswer(ref)).toBe(true); // A2: excluded from the tally
  });

  it('an EMPTY math blank is a normal omission, not an ungraded answer', () => {
    const ref = buildMathBlankRef('m1', ['2a'], '');
    expect(isUnscoredMathAnswer(ref)).toBe(false);
  });
});

describe('scoreBlanksInScope — math blank, kit loaded (real mathEquivalent)', () => {
  beforeEach(() => setMathEquivalent(mathEquivalent));

  it('grades value-equivalence (a+a ≡ 2a) as correct', () => {
    const ref = buildMathBlankRef('m1', ['2a'], 'a+a');
    const state = makeState(['m1']);
    scoreBlanksInScope(state, makeRefs([ref]), ['m1']);
    expect(state.blanks.m1?.result).toBe(true);
    expect(isUnscoredMathAnswer(ref)).toBe(false); // graded now
  });

  it('marks a non-equivalent answer wrong', () => {
    const ref = buildMathBlankRef('m1', ['2a'], '3a');
    const state = makeState(['m1']);
    scoreBlanksInScope(state, makeRefs([ref]), ['m1']);
    expect(state.blanks.m1?.result).toBe(false);
  });

  it('honors exact-form: a+a is wrong when the key demands the literal 2a', () => {
    const ref = buildMathBlankRef('m1', ['2a'], 'a+a', { equivalence: 'exact-form' });
    const state = makeState(['m1']);
    scoreBlanksInScope(state, makeRefs([ref]), ['m1']);
    expect(state.blanks.m1?.result).toBe(false);
  });

  it('re-scores from the live input value (edit → re-check reflects the new value)', () => {
    const ref = buildMathBlankRef('m1', ['2a'], '3a');
    const state = makeState(['m1']);
    const refs = makeRefs([ref]);
    scoreBlanksInScope(state, refs, ['m1']);
    expect(state.blanks.m1?.result).toBe(false);
    ref.input.value = 'a*2'; // student fixes it
    scoreBlanksInScope(state, refs, ['m1']);
    expect(state.blanks.m1?.result).toBe(true);
  });
});

describe('math blank — save/restore round-trip (A1b: no staleness, no storage bump)', () => {
  beforeEach(() => setMathEquivalent(mathEquivalent));

  it('a graded math result survives a reload with its typed value intact', () => {
    const config = {
      activityId: '11111111-1111-1111-1111-111111111111',
      versionNum: 3,
    } as unknown as RuntimeConfig;

    // Student answers, section is checked (scored true), then the blob is saved.
    const ref = buildMathBlankRef('m1', ['2a'], 'a+a');
    const state = makeState(['m1']);
    const refs = makeRefs([ref]);
    scoreBlanksInScope(state, refs, ['m1']);
    expect(state.blanks.m1?.result).toBe(true);
    saveActivityState(config, refs, state);

    // Reload: fresh state, same input element in the DOM, restore the blob.
    const freshState = makeState(['m1']);
    ref.input.value = ''; // simulate a fresh DOM before restore
    const blob = loadActivityState(config);
    expect(blob).not.toBeNull();
    applyStoredState(blob!, refs, freshState);

    // Value AND result restored together — a consistent pair, no re-grade needed.
    expect(ref.input.value).toBe('a+a');
    expect(freshState.blanks.m1?.result).toBe(true);
  });
});
