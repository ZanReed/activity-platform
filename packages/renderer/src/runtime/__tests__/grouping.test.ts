/**
 * @vitest-environment jsdom
 */
// =============================================================================
// grouping.test.ts — order-independent blank groups (consume-once matching)
// -----------------------------------------------------------------------------
// Exercises scoreBlanksInScope, the shared primitive behind both the section
// check and the submit gather. The core property: a group's answers count in
// any order, but each correct answer satisfies only ONE blank — so (2,3) and
// (3,2) both score full marks while (2,2) does not. Slots keep their own answer
// lists (we match against per-slot lists, never a flattened pool), so the
// per-blank acceptableAnswers/strategy machinery composes unchanged.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { scoreBlanksInScope } from '../blanks.js';
import type { BlankRef, Refs } from '../refs.js';
import type { RuntimeState, BlankState } from '../state.js';

function buildBlankRef(
  blankId: string,
  answers: string[],
  value: string,
  groupId: string | null,
): BlankRef {
  const input = document.createElement('input');
  input.className = 'blank';
  input.setAttribute('data-blank-id', blankId);
  input.setAttribute('data-blank-answers', answers.join('|'));
  input.value = value;
  document.body.appendChild(input);
  return {
    input,
    hintButton: null,
    mistakeButton: null,
    answers,
    strategy: 'list',
    hintContent: null,
    mistakeFeedback: [],
    blockId: 'block-1',
    sectionId: 'sec-1',
    groupId,
  };
}

function makeRefs(refs: BlankRef[]): Refs {
  const blanks = new Map<string, BlankRef>();
  for (const ref of refs) blanks.set(ref.input.dataset.blankId ?? '', ref);
  return {
    blanks,
    fillInBlanks: new Map(),
    mcs: new Map(),
    graphs: new Map(),
    graphDisplays: new Map(),
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
    graphs: {},
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

/**
 * Score a 2-blank group with distinct answers (the factoring case) and return
 * [resultA, resultB]. Blank A's answer is `ansA`, blank B's is `ansB`.
 */
function scorePair(
  vA: string,
  vB: string,
  ansA: string[] = ['2'],
  ansB: string[] = ['3'],
): Array<boolean | null> {
  const a = buildBlankRef('a', ansA, vA, 'grp');
  const b = buildBlankRef('b', ansB, vB, 'grp');
  const state = makeState(['a', 'b']);
  scoreBlanksInScope(state, makeRefs([a, b]), ['a', 'b']);
  return [state.blanks['a']?.result ?? null, state.blanks['b']?.result ?? null];
}

describe('scoreBlanksInScope — order-independent groups', () => {
  it('accepts the authored order', () => {
    expect(scorePair('2', '3')).toEqual([true, true]);
  });

  it('accepts the swapped order', () => {
    expect(scorePair('3', '2')).toEqual([true, true]);
  });

  it('rejects a duplicate the consume-once rule cannot satisfy twice', () => {
    // Both "2": one fills the {2} slot, the other has nothing left to match.
    expect(scorePair('2', '2')).toEqual([true, false]);
    expect(scorePair('3', '3')).toEqual([true, false]);
  });

  it('tiebreaks duplicates by document order — the first stays correct', () => {
    expect(scorePair('2', '2')).toEqual([true, false]);
  });

  it('leaves an empty group member unscored (null), not wrong', () => {
    expect(scorePair('3', '')).toEqual([true, null]); // 3 fills the {3} slot
    expect(scorePair('', '2')).toEqual([null, true]); // 2 fills the {2} slot
  });

  it('marks a non-empty wrong value incorrect, the valid partner correct', () => {
    expect(scorePair('9', '2')).toEqual([false, true]);
  });

  it("respects each slot's own acceptableAnswers when matching", () => {
    // Slot A accepts x^3 or x*x*x; slot B accepts 5x. Swapped, with an alternate
    // spelling, still resolves: x*x*x → slot A, 5x → slot B.
    expect(scorePair('5x', 'x*x*x', ['x^3', 'x*x*x'], ['5x'])).toEqual([
      true,
      true,
    ]);
  });

  it('handles a 3-blank group (partial credit on a duplicate)', () => {
    const a = buildBlankRef('a', ['2'], '2', 'grp');
    const b = buildBlankRef('b', ['3'], '2', 'grp'); // duplicate 2, no slot left
    const c = buildBlankRef('c', ['5'], '5', 'grp');
    const state = makeState(['a', 'b', 'c']);
    scoreBlanksInScope(state, makeRefs([a, b, c]), ['a', 'b', 'c']);
    expect(state.blanks['a']?.result).toBe(true);
    expect(state.blanks['b']?.result).toBe(false);
    expect(state.blanks['c']?.result).toBe(true);
  });

  it('scores solo blanks independently and groups consume-once, in one scope', () => {
    const solo = buildBlankRef('s', ['7'], '7', null); // ungrouped, correct
    const a = buildBlankRef('a', ['2'], '3', 'grp'); // swapped pair…
    const b = buildBlankRef('b', ['3'], '2', 'grp'); // …both correct
    const state = makeState(['s', 'a', 'b']);
    scoreBlanksInScope(state, makeRefs([solo, a, b]), ['s', 'a', 'b']);
    expect(state.blanks['s']?.result).toBe(true);
    expect(state.blanks['a']?.result).toBe(true);
    expect(state.blanks['b']?.result).toBe(true);
  });
});
