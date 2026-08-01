/**
 * @vitest-environment jsdom
 */
// =============================================================================
// grading-parity.test.ts — THE PARITY GATE (ruling T1A / S4-8)
// -----------------------------------------------------------------------------
// Retiring `@activity/renderer` and its inline runtime is conditional on proving
// the server engine marks student work the way the published page does. This
// file is that proof. It takes the golden corpus — pure data, living in the
// viewer package so it outlives this one — and runs every case through the
// PUBLISHED-PAGE path:
//
//     corpus case
//        → a real ActivityDocument
//        → renderActivity()            ← the REAL renderer, not hand-written HTML
//        → jsdom
//        → buildRefs()                 ← the runtime's own DOM walk
//        → the runtime's own scorers
//        → the mark a student sees
//
// RENDERING IS THE WHOLE POINT. The review flagged adapter fidelity as this
// gate's real design problem: hand-writing the HTML would test my belief about
// what the renderer emits, and a mistaken belief would manufacture agreement
// between two things that disagree in production. Going through renderActivity
// means the data-attribute contract itself is under test — if the renderer stops
// emitting `data-blank-answers` the way the runtime reads it, this fails, which
// is exactly what a parity gate should catch.
//
// Both this file and its sibling in the viewer package assert against the
// corpus's OWN expected column, never against each other's output. Two engines
// can agree and both be wrong.
//
// INTENTIONAL DIFFERENCES: a case carrying `runtimeDiffers` is one where a
// ruling deliberately changed behavior (G1 normalization). Those assert the
// RUNTIME's old mark, so the divergence is proven to exist and stays visible —
// a silent regression to the old behavior in the server engine, or a silent
// change here, both fail.
//
// THIS FILE DIES AT S9, with the renderer it exists to retire. The corpus and
// its engine-side half survive as permanent regression pins.
// =============================================================================

import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { mathEquivalent } from '@activity/graph-kit';
import {
  BLANK_CASES,
  CHOICE_CASES,
  MATCHING_CASES,
  ORDERING_CASES,
  type ExpectedVerdict,
} from '@activity/viewer/grading-corpus';
import {
  createEmptyDocument,
  createSection,
  createFillInBlankBlock,
  createMultipleChoiceBlock,
  createMultipleChoiceOption,
  createMatchingBlock,
  createOrderingBlock,
} from '@activity/schema';
import { ActivityDocument as ActivityDocumentSchema } from '@activity/schema';
import type { ActivityDocument } from '@activity/schema';
import { renderActivity } from '../src/index.js';
import { buildRefs } from '../src/runtime/init.js';
import { createInitialState } from '../src/runtime/state.js';
import { scoreBlanksInScope } from '../src/runtime/blanks.js';
import { scoreMcBlocks } from '../src/runtime/mcs.js';
import { scoreMatchBlocks } from '../src/runtime/matches.js';
import { scoreOrderingBlocks } from '../src/runtime/orderings.js';
import { setMathEquivalent } from '../src/runtime/strategies.js';

// A published page LAZY-loads graph-kit and hands the runtime its
// `mathEquivalent` through this seam; until that resolves, a math blank scores
// `null` (unscored — deliberately not "wrong"). Installing it here reproduces
// the loaded state, which is the one a student actually grades in. Without
// this the four math cases come back `unscored` and would look like a parity
// failure when they are really a harness that never finished booting.
//
// The server engine has no equivalent state: it always has the engine, which
// is why its half of the corpus expects real verdicts here.
beforeAll(() => {
  setMathEquivalent(mathEquivalent);
});

let uid = 0;
const nextId = (): string =>
  `00000000-0000-4000-8000-${String(++uid).padStart(12, '0')}`;

beforeEach(() => {
  document.body.innerHTML = '';
});

/** Wrap blocks into a renderable single-section document. */
function documentWith(blocks: unknown[]): ActivityDocument {
  const doc = createEmptyDocument({ title: 'parity' });
  const section = createSection('Parity');
  section.rows[0]!.columns[0]!.blocks = blocks as never;
  doc.sections = [section];
  // Parse through the real schema so every default (marks, flags, tolerances)
  // is applied exactly as it would be for an authored document. Hand-built
  // objects would drift from what the renderer actually receives in
  // production, which is the adapter-fidelity trap this gate exists to avoid.
  return ActivityDocumentSchema.parse(doc);
}

/** Render through the REAL renderer and install the result in jsdom. */
function mount(doc: ActivityDocument): void {
  const html = renderActivity(doc, {
    submissionEndpoint: 'https://example.test/ingest',
  } as never);
  // renderActivity returns a full page; jsdom only needs the body contents.
  const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  document.body.innerHTML = bodyMatch?.[1] ?? html;
}

function verdictOf(value: boolean | null | undefined): ExpectedVerdict {
  if (value === null || value === undefined) return 'unscored';
  return value ? 'correct' : 'incorrect';
}

// ---- blanks -----------------------------------------------------------------

describe('parity — blanks', () => {
  it.each(BLANK_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const block = createFillInBlankBlock();
    block.id = nextId();
    const blankIds: string[] = [];

    block.content = testCase.blanks.flatMap((b, i) => {
      const id = nextId();
      blankIds.push(id);
      const [answer, ...acceptable] = b.answers;
      return [
        { type: 'text' as const, text: i === 0 ? 'Solve: ' : ' and ' },
        {
          type: 'blank' as const,
          id,
          answer: answer ?? '',
          acceptableAnswers: acceptable,
          ...(b.answerType ? { answerType: b.answerType } : {}),
          ...(b.tolerance !== undefined ? { tolerance: b.tolerance } : {}),
          ...(b.equivalence ? { equivalence: b.equivalence } : {}),
          interchangeableWithPrevious: b.interchangeableWithPrevious ?? false,
        },
      ];
    }) as never;

    mount(documentWith([block]));

    const refs = buildRefs(document);
    const state = createInitialState(refs);

    // Type the student's answers into the rendered inputs.
    blankIds.forEach((id, i) => {
      const ref = refs.blanks.get(id);
      expect(ref, `renderer emitted no blank for ${id}`).toBeDefined();
      (ref!.input as HTMLInputElement).value = testCase.typed[i] ?? '';
    });

    scoreBlanksInScope(state, refs, blankIds);

    const actual = blankIds.map((id) => verdictOf(state.blanks[id]?.result));
    const expected = testCase.runtimeDiffers?.runtimeExpect ?? testCase.expect;

    expect(
      actual,
      testCase.runtimeDiffers
        ? `INTENTIONAL DIVERGENCE — ${testCase.runtimeDiffers.because}`
        : undefined,
    ).toEqual(expected);
  });
});

// ---- multiple choice --------------------------------------------------------

describe('parity — multiple choice', () => {
  it.each(CHOICE_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const block = createMultipleChoiceBlock();
    block.id = nextId();
    block.multiSelect = testCase.multiSelect;
    const idMap = new Map<string, string>();
    block.choices = testCase.choices.map((c) => {
      const option = createMultipleChoiceOption();
      option.id = nextId();
      idMap.set(c.id, option.id);
      option.correct = c.correct;
      option.content = [{ type: 'text', text: `choice ${c.id}` }] as never;
      return option;
    });

    mount(documentWith([block]));

    const refs = buildRefs(document);
    const state = createInitialState(refs);
    const ref = refs.mcs.get(block.id);
    expect(ref, 'renderer emitted no multiple_choice').toBeDefined();

    // Check the student's selections on the rendered inputs.
    for (const chosen of testCase.selected) {
      const realId = idMap.get(chosen)!;
      const index = ref!.choiceIds.indexOf(realId);
      expect(index, `rendered block is missing choice ${chosen}`).toBeGreaterThan(-1);
      (ref!.inputs[index] as HTMLInputElement).checked = true;
    }
    // The runtime rebuilds `selected` from the DOM in document order.
    state.mcs[block.id]!.selected = ref!.choiceIds.filter(
      (_, i) => (ref!.inputs[i] as HTMLInputElement).checked,
    );

    scoreMcBlocks(state, refs, [block.id]);
    expect(verdictOf(state.mcs[block.id]?.result)).toBe(testCase.expect);
  });
});

// ---- matching ---------------------------------------------------------------

describe('parity — matching', () => {
  it.each(MATCHING_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const block = createMatchingBlock();
    block.id = nextId();

    const itemIdMap = new Map<string, string>();
    const targetIdMap = new Map<string, string>();
    block.items = testCase.itemIds.map((i) => {
      const id = nextId();
      itemIdMap.set(i, id);
      return { id, content: [{ type: 'text', text: i }] } as never;
    });
    const targetNames = [...new Set(Object.values(testCase.key))];
    block.targets = targetNames.map((t) => {
      const id = nextId();
      targetIdMap.set(t, id);
      return { id, content: [{ type: 'text', text: t }] } as never;
    });
    block.key = Object.fromEntries(
      Object.entries(testCase.key).map(([i, t]) => [
        itemIdMap.get(i)!,
        targetIdMap.get(t)!,
      ]),
    );

    mount(documentWith([block]));

    const refs = buildRefs(document);
    const state = createInitialState(refs);
    expect(refs.matches.get(block.id), 'renderer emitted no matching').toBeDefined();

    state.matches[block.id]!.pairs = Object.fromEntries(
      Object.entries(testCase.pairs).map(([i, t]) => [
        itemIdMap.get(i)!,
        targetIdMap.get(t) ?? t,
      ]),
    );

    scoreMatchBlocks(state, refs, [block.id]);
    const result = state.matches[block.id]!;
    expect(verdictOf(result.result)).toBe(testCase.expect);
    expect(result.earned).toBe(testCase.expectEarned);
    expect(result.total).toBe(testCase.expectTotal);
  });
});

// ---- ordering ---------------------------------------------------------------

describe('parity — ordering', () => {
  it.each(ORDERING_CASES.map((c) => [c.name, c] as const))('%s', (_name, testCase) => {
    const block = createOrderingBlock();
    block.id = nextId();
    const idMap = new Map<string, string>();
    block.items = testCase.authoredOrder.map((name) => {
      const id = nextId();
      idMap.set(name, id);
      return { id, content: [{ type: 'text', text: name }] } as never;
    });

    mount(documentWith([block]));

    const refs = buildRefs(document);
    const state = createInitialState(refs);
    expect(refs.orderings.get(block.id), 'renderer emitted no ordering').toBeDefined();

    const orderState = state.orderings[block.id]!;
    orderState.order = testCase.submitted.map((n) => idMap.get(n)!);
    // The runtime's omission rule is a `moved` flag; the corpus expresses the
    // same thing as "did the student's arrangement differ from what we served".
    orderState.moved =
      testCase.submitted.join() !== testCase.servedOrder.join() ||
      testCase.servedOrder.join() === testCase.authoredOrder.join();

    scoreOrderingBlocks(state, refs, [block.id]);
    expect(verdictOf(orderState.result)).toBe(testCase.expect);
  });
});

// ---- the gate itself --------------------------------------------------------

describe('the gate is not vacuous', () => {
  it('runs a non-trivial number of cases through the real renderer', () => {
    const total =
      BLANK_CASES.length +
      CHOICE_CASES.length +
      MATCHING_CASES.length +
      ORDERING_CASES.length;
    expect(total).toBeGreaterThan(30);
  });

  it('exercises at least one deliberate divergence from the server engine', () => {
    // If this ever hits zero, either the rulings were reverted or someone
    // deleted the cases that record them — both worth failing over.
    expect(BLANK_CASES.filter((c) => c.runtimeDiffers).length).toBeGreaterThan(0);
  });
});
