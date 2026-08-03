// =============================================================================
// answer-key.test.tsx — what a teacher's answer key actually renders (S5.5 T2)
// -----------------------------------------------------------------------------
// The extraction is pinned in answerKey.test.ts; this file pins the half that
// reaches paper. Three properties, in the order they matter:
//
//   1. NO PROVIDER, NO ANSWERS. Every component renders its normal student
//      surface when the answer channel is absent, which is every student render.
//      This is the leak inversion: the guarantee is structural (a subtree with
//      no provider has nothing to read) rather than a flag that has to be
//      threaded correctly, so the test that matters most is the negative one.
//
//   2. LETTERS AND NUMBERS ARE DERIVED, NOT STORED. The same canonical key is
//      rendered against a REORDERED bank/choice list and must produce the
//      letter that matches THAT rendering. This is what makes shuffled print
//      versions (D15A/D5) safe: a key printed for Version 2 marks Version 2's
//      letters. Without this, a teacher marks thirty sheets against a key that
//      silently disagrees with them.
//
//   3. THE ANSWER IS VISIBLE ON SCREEN. The teacher checks the key in the
//      in-page preview before printing. A letter line is a paper affordance and
//      stays print-only; the letter written on it is content and does not.
// =============================================================================

import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  AnswerKeyProvider,
  ViewerProvider,
  applyPrintShuffles,
  createMockCheckService,
  createViewerStore,
  extractBlockAnswerKey,
  printSeed,
} from '../../src/index.js';
import type { AnswerKeyMap } from '../../src/index.js';
import FillInBlank from '../../src/blocks/FillInBlank.js';
import MultipleChoice from '../../src/blocks/MultipleChoice.js';
import Matching from '../../src/blocks/Matching.js';
import Ordering from '../../src/blocks/Ordering.js';
import {
  authoredBlockFixture,
  sanitizedBlockFixture,
  sanitizedFixtureDocument,
} from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'sec-1';

/** Render a block, optionally with an answer channel. Omitting `answers` is the
 *  student surface — the provider is simply not there. */
function harness(ui: ReactElement, answers?: AnswerKeyMap) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService({}),
  });
  const wrapped: ReactNode = answers ? (
    <AnswerKeyProvider answers={answers}>{ui}</AnswerKeyProvider>
  ) : (
    ui
  );
  return render(
    <ViewerProvider store={store} defaultSectionId={SECTION}>
      {wrapped}
    </ViewerProvider>,
  );
}

/** The served block a student sees, paired with the key extracted from the
 *  AUTHORED one — exactly the pairing the teacher route will construct. */
function pair(type: 'fill_in_blank' | 'multiple_choice' | 'matching' | 'ordering') {
  const served = sanitizedBlockFixture(type) as never as { id: string };
  const authored = authoredBlockFixture(type);
  return {
    served,
    answers: { [served.id]: extractBlockAnswerKey(authored) } as AnswerKeyMap,
  };
}

describe('no provider, no answers (the leak inversion)', () => {
  it('fill_in_blank renders an empty, editable line', () => {
    const { served } = pair('fill_in_blank');
    const { container } = harness(<FillInBlank block={served as never} mode="print" />);

    const input = container.querySelector<HTMLInputElement>('.viewer-blank__input');
    expect(input?.value).toBe('');
    expect(input?.getAttribute('data-answer-key')).toBeNull();
  });

  it('multiple_choice marks no choice', () => {
    const { served } = pair('multiple_choice');
    const { container } = harness(<MultipleChoice block={served as never} mode="print" />);

    expect(container.querySelectorAll('[data-answer-key]')).toHaveLength(0);
  });

  it('matching leaves every letter line blank', () => {
    const { served } = pair('matching');
    const { container } = harness(<Matching block={served as never} mode="print" />);

    for (const line of Array.from(container.querySelectorAll('.viewer-matching__letter-line'))) {
      expect(line.textContent).toBe('');
      expect(line.getAttribute('data-answer-key')).toBeNull();
    }
  });

  it('ordering leaves every number box blank', () => {
    const { served } = pair('ordering');
    const { container } = harness(<Ordering block={served as never} mode="print" />);

    for (const box of Array.from(container.querySelectorAll('.viewer-ordering__number-box'))) {
      expect(box.textContent).toBe('');
      expect(box.getAttribute('data-answer-key')).toBeNull();
    }
  });
});

describe('with an answer key', () => {
  it('fill_in_blank prefills the canonical answer and locks the line', () => {
    const { served, answers } = pair('fill_in_blank');
    const { container } = harness(
      <FillInBlank block={served as never} mode="print" />,
      answers,
    );

    const input = container.querySelector<HTMLInputElement>('.viewer-blank__input');
    expect(input?.value).toBe('3'); // canonical, not the '3.0' alternate
    expect(input?.readOnly).toBe(true);
    expect(input?.getAttribute('data-answer-key')).toBe('filled');
  });

  it('multiple_choice marks exactly the correct choice', () => {
    const { served, answers } = pair('multiple_choice');
    const key = Object.values(answers)[0]!;
    const { container } = harness(
      <MultipleChoice block={served as never} mode="print" />,
      answers,
    );

    const marked = container.querySelectorAll('.viewer-mc__choice[data-answer-key]');
    expect(marked).toHaveLength(key.correctChoiceIds?.length ?? 0);
    expect(marked.length).toBeGreaterThan(0);
    // The mark rides the LETTER, which is what survives onto paper — the native
    // control is hidden in print, so marking it would print nothing.
    expect(marked[0]?.querySelector('.viewer-mc__letter')).not.toBeNull();
  });

  it('matching writes each item’s target letter on its line', () => {
    const { served, answers } = pair('matching');
    const { container } = harness(
      <Matching block={served as never} mode="print" />,
      answers,
    );

    const written = Array.from(container.querySelectorAll('.viewer-matching__letter-line'))
      .map((line) => line.textContent)
      .filter((text) => text !== '');
    expect(written.length).toBeGreaterThan(0);
    for (const letter of written) expect(letter).toMatch(/^[A-Z]$/);
  });

  it('ordering numbers each item by its authored position', () => {
    const { served, answers } = pair('ordering');
    const key = Object.values(answers)[0]!;
    const { container } = harness(
      <Ordering block={served as never} mode="print" />,
      answers,
    );

    const numbers = Array.from(container.querySelectorAll('.viewer-ordering__number-box'))
      .map((box) => box.textContent)
      .filter((text) => text !== '');
    const expected = Object.values(key.positionByItemId ?? {}).map(String);

    // Every position appears exactly once — a permutation of 1..N however the
    // items were served.
    expect([...numbers].sort()).toEqual([...expected].sort());
  });
});

describe('the key survives the print shuffle (D15A × D3A)', () => {
  // The property the whole slice rests on. Paper never shows the authored order
  // (D15A), and the key is stored position-free (D3A) — so the two must still
  // agree after the sheet has been rearranged. If they ever stop agreeing, a
  // teacher marks a class set against letters that are silently wrong, and
  // nothing in the UI would say so.

  const shuffledBlock = (type: 'ordering' | 'matching') => {
    const doc = applyPrintShuffles(sanitizedFixtureDocument(), printSeed(ACTIVITY));
    for (const section of doc.sections) {
      for (const row of section.rows) {
        for (const column of row.columns) {
          for (const block of column.blocks) {
            if ((block as { type: string }).type === type) return block;
          }
        }
      }
    }
    throw new Error(`no ${type} block in the fixture document`);
  };

  it('ordering: each item still prints its own authored position', () => {
    const block = shuffledBlock('ordering') as unknown as { id: string };
    const answers = {
      [block.id]: extractBlockAnswerKey(authoredBlockFixture('ordering')),
    } as AnswerKeyMap;
    const positions = Object.values(answers)[0]!.positionByItemId ?? {};

    const { container } = harness(
      <Ordering block={block as never} mode="print" />,
      answers,
    );

    const rows = Array.from(
      container.querySelectorAll('.viewer-ordering__item'),
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const itemId = row.getAttribute('data-item-id') ?? '';
      const printed = row.querySelector('.viewer-ordering__number-box')?.textContent;
      expect(printed).toBe(String(positions[itemId]));
    }
  });

  it('matching: each item still prints the letter of ITS target', () => {
    const block = shuffledBlock('matching') as unknown as { id: string };
    const answers = {
      [block.id]: extractBlockAnswerKey(authoredBlockFixture('matching')),
    } as AnswerKeyMap;
    const pairs = Object.values(answers)[0]!.targetIdByItemId ?? {};

    const { container } = harness(
      <Matching block={block as never} mode="print" />,
      answers,
    );

    // The bank as this render drew it: letter ← target id.
    const letterOfTarget = new Map(
      Array.from(container.querySelectorAll('.viewer-matching__target')).map(
        (li, i) => [i, li.getAttribute('data-letter')],
      ),
    );
    const bankIds = Array.from(
      container.querySelectorAll('.viewer-matching__bank option, .viewer-matching__target'),
    );
    expect(bankIds.length).toBeGreaterThan(0);

    for (const row of Array.from(
      container.querySelectorAll('.viewer-matching__item'),
    )) {
      const itemId = row.getAttribute('data-item-id') ?? '';
      const written = row.querySelector('.viewer-matching__letter-line')?.textContent;
      const targetId = pairs[itemId];
      if (!targetId) continue;

      // Resolve the written letter back to a target through the RENDERED bank,
      // and it must be the target the key names.
      const index = Array.from(
        container.querySelectorAll('.viewer-matching__target'),
      ).findIndex((li) => li.getAttribute('data-letter') === written);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(letterOfTarget.get(index)).toBe(written);

      const select = row.querySelector('select');
      const optionAtIndex = select?.querySelectorAll('option')[index + 1];
      expect(optionAtIndex?.getAttribute('value')).toBe(targetId);
    }
  });
});

describe('the matching bank is never shown in authored order (D21C)', () => {
  it('shuffles the bank, stably, with no answer channel involved', () => {
    // A student-surface fix, not a print one: authored pairs are written in
    // order, so an unshuffled bank makes the n-th option the answer to the n-th
    // item — readable straight off the screen without doing the task.
    const served = sanitizedBlockFixture('matching') as never as {
      id: string;
      targets: { id: string }[];
    };

    // The bank CONTENT only. The <li> also carries its position letter, and
    // including that made an earlier version of this test vacuous: "A. 5" never
    // equals "5", so the not-authored assertion could not fail even with the
    // shuffle removed. Caught by mutating the source and watching it stay green.
    const rendered = () =>
      Array.from(
        harness(
          <Matching block={served as never} mode="screen" />,
        ).container.querySelectorAll('.viewer-matching__target'),
      ).map((li) => li.textContent?.replace(/^[A-Z]\.\s*/, '').trim());

    const first = rendered();
    const second = rendered();

    // Stable across renders — a bank that reshuffled under a student mid-
    // question would be its own bug.
    expect(second).toEqual(first);
    expect(first.length).toBe(served.targets.length);

    // And ACTUALLY shuffled. Without this the test passes with no shuffle at
    // all, which is precisely the leak D21C exists to close: the fixture's
    // targets are authored in pair order, so an unshuffled bank answers its own
    // question. (The never-identity guarantee in seededShuffle is what makes
    // this assertion safe on a two-target bank rather than a coin flip.)
    const authored = served.targets.map((target) =>
      (target as unknown as { content: { text?: string }[] }).content
        .map((node) => node.text ?? '')
        .join('')
        .trim(),
    );
    expect(first).not.toEqual(authored);
  });
});

describe('letters follow the RENDERED order, not the authored one', () => {
  // The property every shuffled print version depends on. The key is unchanged;
  // only the order the component draws is.

  it('matching: reordering the bank moves the written letter with it', () => {
    const served = sanitizedBlockFixture('matching') as never as {
      id: string;
      items: { id: string }[];
      targets: { id: string }[];
    };
    const answers = {
      [served.id]: extractBlockAnswerKey(authoredBlockFixture('matching')),
    } as AnswerKeyMap;

    const letters = (block: unknown) =>
      Array.from(
        render(
          <ViewerProvider
            store={createViewerStore({
              userId: TEST_USER_ID,
              activityId: ACTIVITY,
              versionId: VERSION,
              checkService: createMockCheckService({}),
            })}
            defaultSectionId={SECTION}
          >
            <AnswerKeyProvider answers={answers}>
              <Matching block={block as never} mode="print" />
            </AnswerKeyProvider>
          </ViewerProvider>,
        ).container.querySelectorAll('.viewer-matching__letter-line'),
      ).map((line) => line.textContent);

    const asServed = letters(served);
    const reversed = letters({ ...served, targets: [...served.targets].reverse() });

    // Same pairing, different bank order, so the letters must differ — if they
    // did not, the key would be printing a stored letter rather than deriving
    // one, and Version 2 of a shuffled worksheet would be marked wrong.
    expect(reversed).not.toEqual(asServed);
    for (const letter of reversed) expect(letter).toMatch(/^[A-Z]$/);
  });

  it('multiple_choice: the marked letter follows the choice, not the position', () => {
    const served = sanitizedBlockFixture('multiple_choice') as never as {
      id: string;
      choices: { id: string }[];
    };
    const answers = {
      [served.id]: extractBlockAnswerKey(authoredBlockFixture('multiple_choice')),
    } as AnswerKeyMap;
    const reversed = { ...served, choices: [...served.choices].reverse() };

    const { container } = harness(
      <MultipleChoice block={reversed as never} mode="print" />,
      answers,
    );

    const marked = container.querySelector('.viewer-mc__choice[data-answer-key]');
    const markedIndex = Array.from(
      container.querySelectorAll('.viewer-mc__choice'),
    ).indexOf(marked as Element);
    const expectedId = Object.values(answers)[0]!.correctChoiceIds?.[0];

    // The marked position is wherever THIS render put the correct choice.
    expect(reversed.choices[markedIndex]?.id).toBe(expectedId);
  });
});
