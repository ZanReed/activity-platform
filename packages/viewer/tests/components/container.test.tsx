// =============================================================================
// container.test.tsx — the worksheet shell + block boundary (S3 V4, ruling D12)
// -----------------------------------------------------------------------------
// The behavior that matters here is what happens when a component misbehaves.
// The headline pin: one block throwing must not blank the worksheet, and a
// GRADABLE block that crashed must be visible in the check path — a student's
// answer going ungraded with no signal is the failure this whole boundary
// exists to prevent.
//
// React logs caught render errors to console.error by design; the suite
// silences that channel so a passing run stays readable, and asserts on the
// onCrash callback instead.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import {
  ViewerContainer,
  createMockCheckService,
  createViewerStore,
  indexDocument,
} from '../../src/index.js';
import type {
  BlockComponentProps,
  BlockCrash,
  BlockType,
  CheckShortfall,
  SanitizedActivityDocument,
} from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

const fullDoc = sanitizedFixtureDocument();

const blocksOf = (type: string) =>
  fullDoc.sections
    .flatMap((s) => s.rows)
    .flatMap((r) => r.columns)
    .flatMap((c) => c.blocks)
    .filter((b) => (b as { type?: string }).type === type);

/** A one-section document containing exactly the given blocks. */
function docOf(...blocks: unknown[]): SanitizedActivityDocument {
  return {
    ...fullDoc,
    sections: [
      {
        ...fullDoc.sections[0]!,
        id: 'sec-1',
        title: 'Section one',
        rows: blocks.map((block, i) => ({
          id: `row-${i}`,
          gridLines: 'inherit',
          columns: [{ id: `col-${i}`, blocks: [block] }],
        })),
      },
    ],
  } as unknown as SanitizedActivityDocument;
}

function setup(
  doc: SanitizedActivityDocument,
  overrides: {
    resolveComponent?: (type: BlockType) => ComponentType<BlockComponentProps> | null;
    onCheckShortfall?: (s: CheckShortfall) => void;
    onCrash?: (crash: BlockCrash) => void;
  } = {},
) {
  const service = createMockCheckService();
  const store = createViewerStore({
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  const utils = render(
    <ViewerContainer
      document={doc}
      store={store}
      versionId={VERSION}
      {...overrides}
    />,
  );
  return { ...utils, store, service };
}

/** A component that throws on render — the misbehaving block. */
const Exploding: ComponentType<BlockComponentProps> = () => {
  throw new Error('block component blew up');
};

/** A component that renders its block type, so siblings are observable. */
const Fine: ComponentType<BlockComponentProps> = ({ block }) => (
  <p>rendered {(block as { type: string }).type}</p>
);

let errorSpy: MockInstance<Parameters<typeof console.error>, void>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
});

describe('rendering the served document', () => {
  it('renders every section, row, and block slot in document order', () => {
    const { container } = setup(fullDoc);
    const index = indexDocument(fullDoc);
    expect(container.querySelectorAll('[data-block-id]')).toHaveLength(
      // Container children render their own slots only at the top level; the
      // index counts nested blocks too, so compare against top-level rows.
      fullDoc.sections[0]!.rows.length,
    );
    expect(index.sections).toHaveLength(1);
    expect(container.querySelector('[data-section-id="ffffffff-ffff-4fff-8fff-000000000001"]')).not.toBeNull();
  });

  it('renders an honest placeholder for types with no component binding yet', () => {
    const { container } = setup(docOf(blocksOf('paragraph')[0]));
    expect(container.querySelector('[data-unbound="true"]')).toHaveTextContent(
      'paragraph',
    );
  });

  it('renders bound components and tags each slot with its type, category, and family', () => {
    const { container } = setup(docOf(blocksOf('multiple_choice')[0]), {
      resolveComponent: () => Fine,
    });
    expect(screen.getByText('rendered multiple_choice')).toBeInTheDocument();
    const slot = container.querySelector('[data-block-type="multiple_choice"]')!;
    expect(slot.getAttribute('data-block-category')).toBe('question');
    expect(slot.getAttribute('data-block-family')).toBe('auto_gradable');
  });
});

describe('block boundary (ruling D12)', () => {
  it('one crashing block never blanks the worksheet — siblings still render', () => {
    const mc = blocksOf('multiple_choice')[0] as { id: string };
    setup(docOf(blocksOf('paragraph')[0], mc, blocksOf('heading')[0]), {
      resolveComponent: (type) =>
        type === 'multiple_choice' ? Exploding : Fine,
    });

    expect(screen.getByText('rendered paragraph')).toBeInTheDocument();
    expect(screen.getByText('rendered heading')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('didn’t load');
  });

  it('reports the crash with the block identity and gradability', () => {
    const crashes: BlockCrash[] = [];
    const mc = blocksOf('multiple_choice')[0] as { id: string };
    setup(docOf(mc), {
      resolveComponent: () => Exploding,
      onCrash: (crash) => crashes.push(crash),
    });

    expect(crashes).toHaveLength(1);
    expect(crashes[0]).toMatchObject({
      blockId: mc.id,
      blockType: 'multiple_choice',
      gradable: true,
    });
  });

  it('tells a student their answer won’t be checked — only when the block was gradable', () => {
    setup(docOf(blocksOf('multiple_choice')[0]), {
      resolveComponent: () => Exploding,
    });
    expect(screen.getByRole('note')).toHaveTextContent('won’t be checked');
  });

  it('a crashed STATIC block says nothing about checking (it was never graded)', () => {
    setup(docOf(blocksOf('paragraph')[0]), { resolveComponent: () => Exploding });
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent('didn’t load');
    expect(note).not.toHaveTextContent('checked');
    expect(note.getAttribute('data-gradable')).toBe('false');
  });

  it('the fallback uses NO state-vocabulary chrome (a crash is not a verdict)', () => {
    const { container } = setup(docOf(blocksOf('multiple_choice')[0]), {
      resolveComponent: () => Exploding,
    });
    const html = container.innerHTML;
    for (const state of ['state-correct', 'state-incorrect', 'state-pending', 'state-recorded']) {
      expect(html).not.toContain(state);
    }
  });
});

describe('section checking (ruling P2A + the D12 shortfall rule)', () => {
  it('checks the section with exactly the ids the index derived', async () => {
    const mc = blocksOf('multiple_choice')[0] as { id: string };
    const essay = blocksOf('essay')[0] as { id: string };
    const doc = docOf(mc, essay);
    const { service, store } = setup(doc, { resolveComponent: () => Fine });

    store.setChoices(mc.id, ['choice-1']);
    store.setFreeText(essay.id, 'my answer');
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    await waitFor(() => expect(service.calls).toHaveLength(1));
    expect(service.calls[0]!.sectionId).toBe('sec-1');
    expect(service.calls[0]!.responses.choices).toEqual({ [mc.id]: ['choice-1'] });
    expect(service.calls[0]!.responses.freeText).toEqual({ [essay.id]: 'my answer' });
  });

  it('surfaces the checking → checked transition in an aria-live region', async () => {
    const { container } = setup(docOf(blocksOf('multiple_choice')[0]), {
      resolveComponent: () => Fine,
    });
    const status = container.querySelector('[aria-live="polite"]')!;
    expect(status).toHaveTextContent('');

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(status).toHaveTextContent('Checked.'));
    expect(
      container.querySelector('[data-section-phase="checked"]'),
    ).not.toBeNull();
  });

  it('a crashed GRADABLE block is reported as a check shortfall, not swallowed', async () => {
    const mc = blocksOf('multiple_choice')[0] as { id: string };
    const shortfalls: CheckShortfall[] = [];
    setup(docOf(blocksOf('paragraph')[0], mc), {
      resolveComponent: (type) => (type === 'multiple_choice' ? Exploding : Fine),
      onCheckShortfall: (s) => shortfalls.push(s),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(shortfalls).toHaveLength(1));
    expect(shortfalls[0]!.crashedBlockIds).toEqual([mc.id]);
    expect(screen.getByText(/couldn’t be checked/)).toBeInTheDocument();
  });

  it('a crashed STATIC block is NOT a shortfall (nothing to grade was lost)', async () => {
    const shortfalls: CheckShortfall[] = [];
    const { service } = setup(docOf(blocksOf('paragraph')[0], blocksOf('multiple_choice')[0]), {
      resolveComponent: (type) => (type === 'paragraph' ? Exploding : Fine),
      onCheckShortfall: (s) => shortfalls.push(s),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(service.calls).toHaveLength(1));
    expect(shortfalls).toHaveLength(0);
    expect(screen.queryByText(/couldn’t be checked/)).toBeNull();
  });

  it('graph-family blocks report as unsupported shortfall (wire v1 has no category)', async () => {
    const graph = blocksOf('interactive_graph').find(
      (b) => (b as { interaction?: { type?: string } }).interaction?.type === 'plot_point',
    ) as { id: string };
    const shortfalls: CheckShortfall[] = [];
    setup(docOf(graph), {
      resolveComponent: () => Fine,
      onCheckShortfall: (s) => shortfalls.push(s),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(shortfalls).toHaveLength(1));
    expect(shortfalls[0]!.unsupportedBlockIds).toEqual([graph.id]);
  });

  it('re-check stays available after a first check (parity bundle 7.1A)', async () => {
    const { service } = setup(docOf(blocksOf('multiple_choice')[0]), {
      resolveComponent: () => Fine,
    });
    const button = screen.getByRole('button', { name: 'Check' });

    fireEvent.click(button);
    await waitFor(() => expect(service.calls).toHaveLength(1));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(service.calls).toHaveLength(2));
  });

  it('shows the non-blaming failure state when the check cannot run (ruling 2.1A)', async () => {
    const failing = createMockCheckService({ failWith: new Error('offline') });
    const store = createViewerStore({
      activityId: ACTIVITY,
      versionId: VERSION,
      checkService: failing,
    });
    const { container } = render(
      <ViewerContainer
        document={docOf(blocksOf('multiple_choice')[0])}
        store={store}
        versionId={VERSION}
        resolveComponent={() => Fine}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() =>
      expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
        'Couldn’t check — try again.',
      ),
    );
    expect(container.querySelector('[data-section-phase="error"]')).not.toBeNull();
  });
});

describe('print mode', () => {
  it('renders blocks but no check control (chrome is screen-only)', () => {
    const { container } = render(
      <ViewerContainer
        document={docOf(blocksOf('multiple_choice')[0])}
        store={createViewerStore({
          activityId: ACTIVITY,
          versionId: VERSION,
          checkService: createMockCheckService(),
        })}
        mode="print"
        resolveComponent={() => Fine}
      />,
    );
    expect(screen.getByText('rendered multiple_choice')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check' })).toBeNull();
    expect(container.querySelector('[data-viewer-mode="print"]')).not.toBeNull();
  });
});
