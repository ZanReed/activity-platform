// =============================================================================
// exemplars.test.tsx — the three family templates (S3 V5, rulings D7/D15)
// -----------------------------------------------------------------------------
// paragraph (static) · multiple_choice (auto_gradable) · short_answer
// (recorded). These are the components ~23 others get copied from, so the pins
// here are the family CONTRACTS, not cosmetics — what gets copied is what gets
// tested:
//
//   static      → no state chrome ever, under any check state
//   auto_gradable → ✓/✗ ONLY from the server; feedback only when sent; the
//                   mark never molests the student's work
//   recorded    → never a verdict glyph as judgment, even when the server
//                 (impossibly) sends one
//
// V6's conformance factory generalizes exactly these assertions across every
// bound component; this suite is the hand-written source it generalizes from.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  setMathRenderer,
} from '../../src/index.js';
import type { MockCheckScript } from '../../src/index.js';
import Paragraph from '../../src/blocks/Paragraph.js';
import MultipleChoice from '../../src/blocks/MultipleChoice.js';
import ShortAnswer from '../../src/blocks/ShortAnswer.js';
import Essay from '../../src/blocks/Essay.js';
import { sanitizedBlockFixture } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'sec-1';

function harness(ui: (props: { store: ReturnType<typeof createViewerStore> }) => ReactElement, script: MockCheckScript = {}) {
  const service = createMockCheckService(script);
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  const result = render(
    <ViewerProvider store={store} defaultSectionId={SECTION}>
      {ui({ store })}
    </ViewerProvider>,
  );
  return { ...result, store, service };
}

const mcBlock = sanitizedBlockFixture('multiple_choice') as never as {
  id: string;
  choices: Array<{ id: string }>;
};
const saBlock = sanitizedBlockFixture('short_answer') as never as { id: string };
const esBlock = sanitizedBlockFixture('essay') as never as { id: string };

const pill = () => document.querySelector('[data-state]');

describe('Paragraph — the STATIC template', () => {
  it('renders inline content with marks in a fixed nesting order', () => {
    const block = {
      id: 'p1',
      type: 'paragraph',
      content: [
        { type: 'text', text: 'plain ', marks: [] },
        { type: 'text', text: 'both', marks: [{ type: 'italic' }, { type: 'bold' }] },
      ],
    };
    const { container } = harness(() => <Paragraph block={block as never} mode="screen" />);
    // bold outside italic regardless of the authored array order.
    expect(container.querySelector('strong > em')).toHaveTextContent('both');
    expect(container.querySelector('em > strong')).toBeNull();
  });

  it('renders a hard break and never any state chrome', () => {
    const block = {
      id: 'p2',
      type: 'paragraph',
      content: [
        { type: 'text', text: 'a', marks: [] },
        { type: 'hard_break' },
        { type: 'text', text: 'b', marks: [] },
      ],
    };
    const { container } = harness(() => <Paragraph block={block as never} mode="screen" />);
    expect(container.querySelector('br')).not.toBeNull();
    expect(container.querySelector('[data-state]')).toBeNull();
  });

  it('renders math through the injected engine (the lazy KaTeX seam)', async () => {
    setMathRenderer((latex) => `<span class="katex-stub">${latex}</span>`);
    const block = {
      id: 'p3',
      type: 'paragraph',
      content: [{ type: 'math_inline', latex: 'y = mx + b' }],
    };
    const { container } = harness(() => <Paragraph block={block as never} mode="screen" />);
    expect(container.querySelector('.katex-stub')).toHaveTextContent('y = mx + b');
    setMathRenderer(null);
  });

  it('shows the raw LaTeX as a readable fallback until the chunk resolves', async () => {
    setMathRenderer(null);
    const block = {
      id: 'p4',
      type: 'paragraph',
      content: [{ type: 'math_inline', latex: 'x^2' }],
    };
    const { container } = harness(() => <Paragraph block={block as never} mode="screen" />);
    expect(container.querySelector('[data-math-pending="true"]')).toHaveTextContent('x^2');
    // …and swaps in real KaTeX output once the lazy import lands.
    await waitFor(() =>
      expect(container.querySelector('[data-math="inline"]')).not.toBeNull(),
    );
    expect(container.querySelector('.katex')).not.toBeNull();
    setMathRenderer(null);
  });
});

describe('MultipleChoice — the AUTO_GRADABLE template', () => {
  it('groups choices in a fieldset whose legend is the prompt (its a11y story)', () => {
    const { container } = harness(() => <MultipleChoice block={mcBlock as never} mode="screen" />);
    expect(container.querySelector('fieldset > legend')).toHaveTextContent(
      'What is the slope',
    );
    expect(screen.getAllByRole('radio')).toHaveLength(mcBlock.choices.length);
  });

  it('records the selection in the store by BLOCK id', () => {
    const { store } = harness(() => <MultipleChoice block={mcBlock as never} mode="screen" />);
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    expect(store.getState().responses.choices[mcBlock.id]).toEqual([
      mcBlock.choices[0]!.id,
    ]);
  });

  it('single-select replaces rather than accumulates', () => {
    const { store } = harness(() => <MultipleChoice block={mcBlock as never} mode="screen" />);
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    fireEvent.click(screen.getAllByRole('radio')[1]!);
    expect(store.getState().responses.choices[mcBlock.id]).toEqual([
      mcBlock.choices[1]!.id,
    ]);
  });

  it('shows NO verdict before the server has spoken', () => {
    harness(() => <MultipleChoice block={mcBlock as never} mode="screen" />);
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    expect(pill()).toBeNull();
  });

  it('shows ✓ only from the server verdict, announced via aria-live', async () => {
    const { store } = harness(
      () => <MultipleChoice block={mcBlock as never} mode="screen" />,
      { verdicts: { [mcBlock.id]: 'correct' } },
    );
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    await store.checkSection(SECTION, { choices: [mcBlock.id] });

    await waitFor(() => expect(pill()).toHaveAttribute('data-state', 'correct'));
    expect(pill()).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent('Correct');
  });

  it('an incorrect verdict marks the attempt and NEVER changes the selection', async () => {
    const { store } = harness(
      () => <MultipleChoice block={mcBlock as never} mode="screen" />,
      { verdicts: { [mcBlock.id]: 'incorrect' } },
    );
    const chosen = screen.getAllByRole('radio')[2]!;
    fireEvent.click(chosen);
    await store.checkSection(SECTION, { choices: [mcBlock.id] });

    await waitFor(() => expect(pill()).toHaveAttribute('data-state', 'incorrect'));
    // "The mark never molests the work" — family spec rule 2.
    expect(chosen).toBeChecked();
    expect(store.getState().responses.choices[mcBlock.id]).toEqual([
      mcBlock.choices[2]!.id,
    ]);
  });

  it('renders feedback only when the server sent it (hintless ✗ is mark-only)', async () => {
    const { store } = harness(
      () => <MultipleChoice block={mcBlock as never} mode="screen" />,
      { verdicts: { [mcBlock.id]: 'incorrect' } },
    );
    fireEvent.click(screen.getAllByRole('radio')[1]!);
    await store.checkSection(SECTION, { choices: [mcBlock.id] });
    await waitFor(() => expect(pill()).not.toBeNull());
    expect(document.querySelector('[data-feedback="server"]')).toBeNull();
  });

  it('renders server feedback when present', async () => {
    const { store } = harness(
      () => <MultipleChoice block={mcBlock as never} mode="screen" />,
      {
        verdicts: { [mcBlock.id]: 'incorrect' },
        feedback: {
          [mcBlock.id]: [
            { type: 'text', text: '4 is the y-intercept.', marks: [] },
          ],
        },
      },
    );
    fireEvent.click(screen.getAllByRole('radio')[1]!);
    await store.checkSection(SECTION, { choices: [mcBlock.id] });
    await waitFor(() =>
      expect(screen.getByText('4 is the y-intercept.')).toBeInTheDocument(),
    );
  });

  it('discloses the solution only after the server releases it (7.4A)', async () => {
    const { store } = harness(
      () => <MultipleChoice block={mcBlock as never} mode="screen" />,
      {
        solutions: {
          [mcBlock.id]: [{ type: 'text', text: 'The slope is 3.', marks: [] }],
        },
      },
    );
    expect(screen.queryByText('Show solution')).toBeNull();

    await store.checkSection(SECTION, { choices: [mcBlock.id] });
    await waitFor(() => expect(screen.getByText('Show solution')).toBeInTheDocument());
    // Collapsed by default.
    expect(document.querySelector('details')).not.toHaveAttribute('open');
  });

  it('carries no answer key in its rendered output (the server stripped it)', () => {
    const { container } = harness(() => <MultipleChoice block={mcBlock as never} mode="screen" />);
    expect(JSON.stringify(mcBlock)).not.toContain('"correct"');
    expect(container.innerHTML).not.toContain('correct');
  });
});

describe('ShortAnswer — the RECORDED template', () => {
  it('labels the textarea with the prompt (its a11y story)', () => {
    harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    expect(
      screen.getByRole('textbox', { name: /y-intercept mean/ }),
    ).toBeInTheDocument();
  });

  it('records typing into the freeText response map', () => {
    const { store } = harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Where the line crosses the y-axis.' },
    });
    expect(store.getState().responses.freeText[saBlock.id]).toBe(
      'Where the line crosses the y-axis.',
    );
  });

  it('shows the recorded receipt after a check — never a verdict', async () => {
    const { store } = harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'my answer' } });
    await store.checkSection(SECTION, { freeText: [saBlock.id] });

    await waitFor(() => expect(pill()).toHaveAttribute('data-state', 'recorded'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Recorded — your teacher will review',
    );
  });

  it('refuses to show ✓/✗ EVEN IF a verdict somehow arrives (family spec)', async () => {
    // Defense in depth: the mock and the server both force 'recorded' for free
    // text, so this asserts the COMPONENT would not render a judgment either.
    const { store } = harness(
      () => <ShortAnswer block={saBlock as never} mode="screen" />,
      { verdicts: { [saBlock.id]: 'incorrect' } },
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } });
    await store.checkSection(SECTION, { freeText: [saBlock.id] });

    await waitFor(() => expect(pill()).not.toBeNull());
    expect(pill()).toHaveAttribute('data-state', 'recorded');
    expect(document.body.textContent).not.toContain('Try again');
    expect(document.querySelector('[data-state="incorrect"]')).toBeNull();
  });

  it('never leaks the teacher rubric into the student surface', () => {
    const { container } = harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    expect(JSON.stringify(saBlock)).not.toContain('rubric');
    expect(container.innerHTML).not.toContain('maxPoints');
  });

  it('never leaks the authored answer or solution either', () => {
    // The served block has both stripped (registry, ruling E3). Asserted on the
    // FIXTURE as well as the render because that is where the sanitizer's work
    // is observable — the component could not print what is not there.
    const { container } = harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    expect('answer' in saBlock).toBe(false);
    expect('solution' in saBlock).toBe(false);
    expect(container.querySelector('.viewer-written-key')).toBeNull();
  });
});

// =============================================================================
// The post-check solution reveal on the recorded pair (T5, ruling E9)
// -----------------------------------------------------------------------------
// Same semantics as every other solution-bearing block, and the ORDER is the
// ruling: the attempt is recorded BEFORE the explanation becomes available, so
// a student cannot read the solution and then answer. `solution` is stripped
// from the served document and arrives on SectionCheckResult.solutions, which
// walk.ts collects GENERICALLY — these blocks added no grading-engine code to
// get here, which is precisely why E2 chose `solution` as the field name.
// =============================================================================
describe('ShortAnswer / Essay — the solution reveal', () => {
  it.each([
    ['short_answer', ShortAnswer, saBlock],
    ['essay', Essay, esBlock],
  ] as const)('%s discloses only after the check releases it', async (_label, Component, block) => {
    const { store } = harness(
      () => <Component block={block as never} mode="screen" />,
      {
        solutions: {
          [block.id]: [{ type: 'text', text: 'Name the rate of change.', marks: [] }],
        },
      },
    );
    expect(screen.queryByText('Show solution')).toBeNull();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'my answer' } });
    await store.checkSection(SECTION, { freeText: [block.id] });

    await waitFor(() => expect(screen.getByText('Show solution')).toBeInTheDocument());
    // Collapsed by default — a reveal the student opens, not one thrust at them.
    expect(document.querySelector('details')).not.toHaveAttribute('open');
    expect(document.body.textContent).toContain('Name the rate of change.');
  });

  it('stays absent when the author omitted a solution', () => {
    // E9's escape hatch: authors omit `solution:` on revision-sensitive
    // questions, and the box is then simply not there.
    harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    expect(screen.queryByText('Show solution')).toBeNull();
  });
});

// =============================================================================
// Released teacher feedback on the recorded family (0034 G5 + design ruling D6)
// -----------------------------------------------------------------------------
// The family's rule is "never a verdict glyph, never a score" — and this card
// renders a score. These rows pin the DISTINCTION that makes that legal:
// attribution comes first, the numbers are text data, and nothing about the
// card belongs to the auto-graded vocabulary. If a future change makes teacher
// feedback look like machine judgment, one of these fails.
// =============================================================================
describe('ShortAnswer — released teacher feedback', () => {
  const FEEDBACK = {
    feedbackText: 'Nice reasoning. Name the rate of change next time.',
    criteria: [
      { criterionId: 'c1', earned: 4, maxPoints: 4, feedbackText: 'Clear.' },
      { criterionId: 'c2', earned: 1, maxPoints: 2 },
    ],
    attemptNumber: 3,
    activityVersionId: VERSION,
    stale: false,
    hasGrader: true,
  };

  async function withFeedback(overrides: Partial<typeof FEEDBACK> = {}) {
    const h = harness(() => <ShortAnswer block={saBlock as never} mode="screen" />, {
      released: {
        graded: true,
        blocks: { [saBlock.id]: { ...FEEDBACK, ...overrides } },
      },
    });
    await h.store.loadReleasedFeedback();
    return h;
  }

  it('renders nothing until feedback is released', () => {
    harness(() => <ShortAnswer block={saBlock as never} mode="screen" />);
    expect(document.querySelector('[data-released-feedback]')).toBeNull();
  });

  it('leads with the human, then the score', async () => {
    await withFeedback();
    await waitFor(() =>
      expect(document.querySelector('[data-released-feedback]')).not.toBeNull(),
    );
    const card = document.querySelector('[data-released-feedback]') as HTMLElement;
    // Attribution BEFORE any number: the eye hits the teacher first (D6 rule 2).
    const text = card.textContent ?? '';
    expect(text.indexOf('Feedback from your teacher')).toBeLessThan(text.indexOf('4/4'));
    expect(text).toContain('Nice reasoning.');
    expect(text).toContain('1/2');
  });

  it('never uses the auto-graded vocabulary (D6 rules 3 and 4)', async () => {
    await withFeedback();
    const card = document.querySelector('[data-released-feedback]') as HTMLElement;
    // No glyphs: ✓/✗ are the auto-graded family's property, even meaning
    // "criterion met". No state-chrome tokens either — a score is data here.
    expect(card.textContent).not.toContain('✓');
    expect(card.textContent).not.toContain('✗');
    expect(card.querySelector('[data-state]')).toBeNull();
    expect(card.querySelector('.viewer-state-pill')).toBeNull();
    // No total: the card shows what the teacher entered, not a computed grade.
    expect(card.textContent).not.toContain('5/6');
  });

  it('sits outside the state-chrome row, never inside the pill', async () => {
    await withFeedback();
    const pillEl = document.querySelector('.viewer-state-pill');
    const card = document.querySelector('[data-released-feedback]');
    expect(card).not.toBeNull();
    expect(pillEl?.contains(card as Node)).not.toBe(true);
  });

  it('flips the recorded pill label once a teacher has reviewed (D11)', async () => {
    const { store } = await withFeedback();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'my answer' } });
    await store.checkSection(SECTION, { freeText: [saBlock.id] });
    await waitFor(() => expect(pill()).toHaveAttribute('data-state', 'recorded'));
    // The STATE stays recorded — the union is closed at four — but the promise
    // stops claiming a review that already happened.
    expect(pill()?.textContent).toContain('Reviewed by your teacher');
    expect(pill()?.textContent).not.toContain('your teacher will review');
  });

  it('says "a former teacher" when the grading account is gone', async () => {
    await withFeedback({ hasGrader: false });
    const card = document.querySelector('[data-released-feedback]') as HTMLElement;
    expect(card.textContent).toContain('Feedback from a former teacher');
  });

  it('notes a revision without alarming (G2 staleness, student voice)', async () => {
    await withFeedback({ stale: true });
    const card = document.querySelector('[data-released-feedback]') as HTMLElement;
    expect(card.textContent).toContain('revised your answer since this feedback');
    expect(card.querySelector('[role="alert"]')).toBeNull();
  });

  it('tags an earlier-version grade instead of mapping it (G6)', async () => {
    await withFeedback({ activityVersionId: 'a-different-version' });
    const card = document.querySelector('[data-released-feedback]') as HTMLElement;
    expect(card.textContent).toContain('On an earlier version of this worksheet');
  });

  it('CRITICAL: a failing feedback read leaves the worksheet intact', async () => {
    // The G14 guarantee at the component boundary: the store's loader swallows
    // the failure, so the block renders exactly as it does with no feedback —
    // no error state, no missing textarea, nothing for a student to hit.
    const service = createMockCheckService({});
    service.fetchReleasedFeedback = async () => {
      throw new Error('offline');
    };
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: service,
    });
    render(
      <ViewerProvider store={store} defaultSectionId={SECTION}>
        <ShortAnswer block={saBlock as never} mode="screen" />
      </ViewerProvider>,
    );
    await expect(store.loadReleasedFeedback()).resolves.toBeUndefined();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(document.querySelector('[data-released-feedback]')).toBeNull();
  });
});
