// =============================================================================
// blankPopoverLogic.test.ts — the blank-edit popover's pure decision cores
// -----------------------------------------------------------------------------
// The popover's React shell (BlankPopoverHost, BlankEditPopover) is coupled to
// Tiptap / floating-ui / FocusTrap and isn't unit-tested directly; its draft/
// commit/close decisions live in blankPopoverLogic.ts and are pinned here. These
// are the rules with real bug history — the lost-edit-on-close flush, the
// empty-answer guard, the half-finished-feedback drop, the selection dedup.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  computeFlush,
  resolveAnswerBlur,
  resolveAcceptableCommit,
  filterFeedbackForCommit,
  isSameBlankSelection,
  stripList,
  listsEqual,
  type MistakeFeedbackPair,
  type SelectedBlankState,
} from '../editor/components/blankPopoverLogic';
import type { InlineNodes } from '../lib/serialize';

const nodes = (text: string): InlineNodes => [{ type: 'text', text, marks: [] }];
const EMPTY: InlineNodes = [];

describe('stripList / listsEqual', () => {
  it('stripList trims and drops empties', () => {
    expect(stripList(['  a ', '', '  ', 'b'])).toEqual(['a', 'b']);
  });

  it('listsEqual is order-sensitive and length-sensitive', () => {
    expect(listsEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(listsEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(listsEqual(['a'], ['a', 'b'])).toBe(false);
  });
});

describe('computeFlush', () => {
  const base = {
    answer: 'x',
    initialAnswer: 'x',
    acceptable: [] as string[],
    initialAcceptable: [] as string[],
  };

  it('emits nothing when nothing changed', () => {
    const { updates, hasUpdates } = computeFlush(base);
    expect(hasUpdates).toBe(false);
    expect(updates).toEqual({});
  });

  it('commits a changed answer, trimmed', () => {
    const r = computeFlush({ ...base, answer: '  y ' });
    expect(r.hasUpdates).toBe(true);
    expect(r.updates).toEqual({ answer: 'y' });
  });

  it('never commits an empty/whitespace answer (blur reverts it instead)', () => {
    expect(computeFlush({ ...base, answer: '   ' }).hasUpdates).toBe(false);
    expect(computeFlush({ ...base, answer: '' }).hasUpdates).toBe(false);
  });

  it('treats an answer equal after trim as unchanged', () => {
    expect(computeFlush({ ...base, answer: '  x  ' }).hasUpdates).toBe(false);
  });

  it('commits a changed acceptable list, stripped', () => {
    const r = computeFlush({
      ...base,
      acceptable: ['a ', '', 'b'],
      initialAcceptable: ['a'],
    });
    expect(r.updates).toEqual({ acceptableAnswers: ['a', 'b'] });
  });

  it('ignores trailing-empty acceptable rows that strip back to the original', () => {
    const r = computeFlush({
      ...base,
      acceptable: ['a', ''],
      initialAcceptable: ['a'],
    });
    expect(r.hasUpdates).toBe(false);
  });

  it('detects a reorder of acceptable answers as a change', () => {
    const r = computeFlush({
      ...base,
      acceptable: ['b', 'a'],
      initialAcceptable: ['a', 'b'],
    });
    expect(r.updates).toEqual({ acceptableAnswers: ['b', 'a'] });
  });

  it('bundles both fields when both changed', () => {
    const r = computeFlush({
      answer: 'y',
      initialAnswer: 'x',
      acceptable: ['z'],
      initialAcceptable: [],
    });
    expect(r.updates).toEqual({ answer: 'y', acceptableAnswers: ['z'] });
  });
});

describe('resolveAnswerBlur', () => {
  it('reverts on an empty or whitespace-only answer', () => {
    expect(resolveAnswerBlur('', 'x')).toEqual({ action: 'revert' });
    expect(resolveAnswerBlur('   ', 'x')).toEqual({ action: 'revert' });
  });

  it('commits the trimmed value when it changed', () => {
    expect(resolveAnswerBlur('  y ', 'x')).toEqual({
      action: 'commit',
      value: 'y',
    });
  });

  it('is a no-op when unchanged after trim', () => {
    expect(resolveAnswerBlur('  x ', 'x')).toEqual({ action: 'noop' });
  });
});

describe('resolveAcceptableCommit', () => {
  it('reports a change and the stripped list', () => {
    expect(resolveAcceptableCommit([' a', 'b '], ['a'])).toEqual({
      changed: true,
      stripped: ['a', 'b'],
    });
  });

  it('reports no change when the stripped list matches', () => {
    expect(resolveAcceptableCommit(['a', '  '], ['a'])).toEqual({
      changed: false,
      stripped: ['a'],
    });
  });
});

describe('filterFeedbackForCommit', () => {
  it('keeps complete rows and trims the match', () => {
    const rows: MistakeFeedbackPair[] = [
      { match: ' 2x ', feedback: nodes('forgot the constant') },
    ];
    expect(filterFeedbackForCommit(rows)).toEqual([
      { match: '2x', feedback: nodes('forgot the constant') },
    ]);
  });

  it('drops rows missing a match string', () => {
    const rows: MistakeFeedbackPair[] = [{ match: '  ', feedback: nodes('hi') }];
    expect(filterFeedbackForCommit(rows)).toBeUndefined();
  });

  it('drops rows missing feedback content', () => {
    const rows: MistakeFeedbackPair[] = [{ match: '2x', feedback: EMPTY }];
    expect(filterFeedbackForCommit(rows)).toBeUndefined();
  });

  it('returns undefined for an empty input (no empty array in the schema)', () => {
    expect(filterFeedbackForCommit([])).toBeUndefined();
  });

  it('keeps only the complete rows out of a mixed list', () => {
    const rows: MistakeFeedbackPair[] = [
      { match: 'a', feedback: nodes('A') },
      { match: '', feedback: nodes('B') },
      { match: 'c', feedback: EMPTY },
    ];
    expect(filterFeedbackForCommit(rows)).toEqual([
      { match: 'a', feedback: nodes('A') },
    ]);
  });
});

describe('isSameBlankSelection', () => {
  const hint = nodes('hint');
  const mistake: MistakeFeedbackPair[] = [{ match: 'm', feedback: nodes('f') }];
  const make = (over: Partial<SelectedBlankState> = {}): SelectedBlankState => ({
    pos: 3,
    blankId: 'b1',
    answer: 'x',
    acceptableAnswers: ['a'],
    hint,
    mistakeFeedback: mistake,
    interchangeableWithPrevious: false,
    canGroupWithPrevious: false,
    ...over,
  });

  it('is false against a null previous selection', () => {
    expect(isSameBlankSelection(null, make())).toBe(false);
  });

  it('is true for an identical selection (different array ref, equal content)', () => {
    expect(isSameBlankSelection(make(), make({ acceptableAnswers: ['a'] }))).toBe(
      true,
    );
  });

  it('is false when pos, blankId, or answer differ', () => {
    expect(isSameBlankSelection(make(), make({ pos: 4 }))).toBe(false);
    expect(isSameBlankSelection(make(), make({ blankId: 'b2' }))).toBe(false);
    expect(isSameBlankSelection(make(), make({ answer: 'y' }))).toBe(false);
  });

  it('is false when acceptable-answer content differs', () => {
    expect(isSameBlankSelection(make(), make({ acceptableAnswers: ['b'] }))).toBe(
      false,
    );
  });

  it('compares hint and mistakeFeedback by reference (new attr object ⇒ changed)', () => {
    expect(isSameBlankSelection(make(), make({ hint: nodes('hint') }))).toBe(false);
    expect(
      isSameBlankSelection(make(), make({ mistakeFeedback: [{ match: 'm', feedback: nodes('f') }] })),
    ).toBe(false);
  });

  it('is false when the grouping flag or its availability differ', () => {
    expect(
      isSameBlankSelection(make(), make({ interchangeableWithPrevious: true })),
    ).toBe(false);
    expect(
      isSameBlankSelection(make(), make({ canGroupWithPrevious: true })),
    ).toBe(false);
  });
});
