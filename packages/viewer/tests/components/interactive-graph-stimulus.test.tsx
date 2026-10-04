// =============================================================================
// interactive-graph-stimulus.test.tsx — a graded graph's STIMULUS reaches the
// student (graded stimuli, 2026-10-04)
// -----------------------------------------------------------------------------
// Orphan guards for `stimulus` and `stimulusAlt`, bound to what the component
// PRODUCES: the config handed to the board, the printed twin's own drawable
// count, and the DOM. The board itself needs a real browser, so the row that
// counts drawn elements on the live canvas is e2e/student/graph-stimulus.e2e.ts.
//
// Every row starts from a block that went through the REAL sanitizer, because
// "sanitize keeps the field" is half of what is being guarded: a stimulus the
// student never receives is a question nobody can answer.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  setGraphSurface,
} from '../../src/index.js';
import { sanitizeBlock } from '../../src/sanitize/sanitize.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const AXIS = { xMin: -6, xMax: 6, yMin: -6, yMax: 6, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };

const STIMULUS = [
  { kind: 'point', at: [1, 1], label: 'A' },
  { kind: 'point', at: [4, 1], label: 'B' },
  { kind: 'point', at: [2, 4], label: 'C' },
  { kind: 'polygon', vertices: [[1, 1], [4, 1], [2, 4]], filled: false },
  { kind: 'curve', model: { family: 'vertical', x: 0, xTolerance: 0.1 }, style: 'dashed' },
];

function authored(extra: Record<string, unknown> = {}) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    type: 'interactive_graph',
    prompt: [{ type: 'text', text: 'Reflect triangle ABC in the mirror line.', marks: [] }],
    axisConfig: AXIS,
    interaction: { type: 'plot_point', correctPoints: [[-1, 1], [-4, 1], [-2, 4]], tolerance: 0.1 },
    allowNoSolution: false,
    noSolutionCorrect: false,
    builtinFeedback: true,
    mistakeFeedback: [],
    skills: [],
    stimulus: STIMULUS,
    stimulusAlt: 'Triangle ABC and a vertical mirror line',
    ...extra,
  };
}

/** What the student is served: the block after the real sanitizer. */
const served = (extra: Record<string, unknown> = {}) => sanitizeBlock(authored(extra) as never);

function mount(block: unknown) {
  const calls: Record<string, unknown>[] = [];
  setGraphSurface(
    vi.fn(async (_el: HTMLElement, config: unknown) => {
      calls.push(config as Record<string, unknown>);
      return { getResponse: () => ({ points: [], answered: false }), restore: () => {}, setLocked: () => {}, destroy: () => {} };
    }),
  );
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService({}),
  });
  const utils = render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      <InteractiveGraph block={block as never} mode="screen" />
    </ViewerProvider>,
  );
  return { ...utils, calls };
}

afterEach(() => setGraphSurface(null));

describe('sanitize: the stimulus is question material', () => {
  it('survives to the student, and the answer does not', () => {
    const block = served() as unknown as {
      stimulus: unknown[];
      stimulusAlt: string;
      interaction: Record<string, unknown>;
    };
    expect(block.stimulus).toEqual(STIMULUS);
    expect(block.stimulusAlt).toBe('Triangle ABC and a vertical mirror line');
    expect(block.interaction.correctPoints).toBeUndefined();
  });
});

describe('the live board is handed the stimulus', () => {
  it('passes every stimulus drawable, defaulted to slate', async () => {
    const { calls } = mount(served());
    await waitFor(() => expect(calls).toHaveLength(1));
    const stimulus = calls[0]!.stimulus as { kind: string; color?: string }[];
    expect(stimulus.map((d) => d.kind)).toEqual(['point', 'point', 'point', 'polygon', 'curve']);
    expect(stimulus.every((d) => d.color === 'slate')).toBe(true);
  });

  it('passes nothing for a question with no stimulus', async () => {
    const { calls } = mount(served({ stimulus: [], stimulusAlt: undefined }));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]!.stimulus).toBeUndefined();
  });
});

describe('the printed student sheet shows the stimulus', () => {
  const twin = (c: HTMLElement) => c.querySelector('[data-print-svg] svg');

  it('counts exactly the stimulus drawables, and never the answer', () => {
    const { container } = mount(served());
    expect(twin(container)?.getAttribute('data-drawables')).toBe('5');
    // The three image points are the answer; a sixth drawable would be a leak.
  });

  it('a question with no stimulus still prints empty axes', () => {
    const { container } = mount(served({ stimulus: [] }));
    expect(twin(container)?.getAttribute('data-drawables')).toBe('0');
  });

  it('draws the labels and the dashed mirror line', () => {
    const { container } = mount(served());
    const svg = twin(container)!;
    const labels = Array.from(svg.querySelectorAll('text')).map((n) => n.textContent);
    expect(labels).toEqual(expect.arrayContaining(['A', 'B', 'C']));
    expect(svg.querySelector('[stroke-dasharray]')).not.toBeNull();
  });
});

describe('stimulusAlt', () => {
  it('is in the DOM for a screen reader, between the prompt and the graph', () => {
    const { container } = mount(served());
    const alt = container.querySelector('[data-stimulus-alt]');
    expect(alt?.textContent).toBe('The graph shows: Triangle ABC and a vertical mirror line');
  });

  it('is absent when not authored', () => {
    const { container } = mount(served({ stimulusAlt: undefined }));
    expect(container.querySelector('[data-stimulus-alt]')).toBeNull();
  });
});
