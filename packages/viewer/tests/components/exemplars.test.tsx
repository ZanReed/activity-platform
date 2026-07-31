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
import { sanitizedBlockFixture } from '../../src/fixtures/index.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'sec-1';

function harness(ui: (props: { store: ReturnType<typeof createViewerStore> }) => ReactElement, script: MockCheckScript = {}) {
  const service = createMockCheckService(script);
  const store = createViewerStore({
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
});
