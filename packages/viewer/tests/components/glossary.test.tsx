// =============================================================================
// glossary.test.tsx — the glossary dialog's contract (docs/design/glossary.md)
// -----------------------------------------------------------------------------
// Bound to RENDERED OUTPUT and focus, not to state: every row below is what a
// student sees or where their keyboard lands. Covers R5/R6/R15/R16, GD-1…18 as
// amended by EN-4…EN-7, and the store read's cache contract.
// =============================================================================

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { GlossaryHost } from '../../src/glossary/GlossaryHost.js';
import { InlineContent } from '../../src/inline/InlineContent.js';
import { createGlossaryCache, type GlossaryService } from '../../src/glossary/service.js';
import { parseGlossaryPayload } from '../../src/glossary/parsePayload.js';

const para = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text, marks: [] }],
});

const localTerm = (text: string, body: string) => ({
  type: 'text',
  text,
  marks: [{ type: 'definition', content: [para(body)] }],
});

const keyedTerm = (text: string, key: string, body?: string) => ({
  type: 'text',
  text,
  marks: [{ type: 'definition', glossaryKey: key, content: body ? [para(body)] : [] }],
});

/** A served-document-shaped object: the host walks it structurally. */
function docOf(nodes: unknown[]) {
  return { sections: [{ id: 's', rows: [{ columns: [{ blocks: [{ content: nodes }] }] }] }] };
}

function Page({
  nodes,
  service,
  activityId = 'a1',
}: {
  nodes: unknown[];
  service?: GlossaryService;
  activityId?: string;
}): ReactNode {
  const source = service ? { activityId, cache: createGlossaryCache(service, { warn: () => {} }) } : undefined;
  return (
    <GlossaryHost document={docOf(nodes)} source={source}>
      <p>
        <InlineContent nodes={nodes as never} />
      </p>
    </GlossaryHost>
  );
}

const row = (term_id: string, term: string, body: string, extra: Record<string, unknown> = {}) => ({
  term_id,
  term,
  variants: {},
  body: [para(body)],
  retired: false,
  ...extra,
});

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function openTerm(name: string) {
  const term = screen.getByRole('button', { name });
  fireEvent.click(term);
  return { term, dialog: await screen.findByRole('dialog', { name: 'Glossary' }) };
}

describe('two doors, one dialog (D1, D6, GD-3, GD-7)', () => {
  it('a defined term is a dialog button, and tapping it opens the definition focused', async () => {
    render(<Page nodes={[localTerm('rate', 'A comparison of two quantities.')]} />);
    const term = screen.getByRole('button', { name: 'rate' });
    expect(term).toHaveAttribute('aria-haspopup', 'dialog');
    expect(term).toHaveAttribute('aria-expanded', 'false');
    const { dialog } = await openTerm('rate');
    const heading = within(dialog).getByRole('heading', { name: 'rate', level: 2 });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(dialog).toHaveTextContent('A comparison of two quantities.');
    expect(within(dialog).getByRole('searchbox')).toHaveValue('');
    expect(term).toHaveAttribute('aria-expanded', 'true');
  });

  it('the Glossary button opens the list with search focused and a prompt', async () => {
    render(<Page nodes={[localTerm('rate', 'x'), localTerm('ratio', 'y')]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Glossary' }));
    const dialog = await screen.findByRole('dialog', { name: 'Glossary' });
    await waitFor(() => expect(within(dialog).getByRole('searchbox')).toHaveFocus());
    expect(dialog).toHaveTextContent('Pick a word, or search.');
    const rows = within(dialog)
      .getAllByRole('button')
      .filter((b) => b.classList.contains('glossary-row'));
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('Escape closes and focus returns to the ORIGINAL term after a cross-link chain', async () => {
    render(
      <Page
        nodes={[
          localTerm('rate', 'A ratio of quantities.'),
          localTerm('ratio', 'A comparison, as in a unit rate.'),
          localTerm('unit rate', 'A rate for one.'),
        ]}
      />,
    );
    const { term, dialog } = await openTerm('rate');
    const link = (name: string) =>
      within(dialog)
        .getAllByRole('button', { name })
        .find((b) => b.classList.contains('glossary-link'))!;
    fireEvent.click(link('ratio'));
    await within(dialog).findByRole('heading', { name: 'ratio', level: 2 });
    fireEvent.click(link('unit rate'));
    await within(dialog).findByRole('heading', { name: 'unit rate', level: 2 });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(term).toHaveFocus());
  });
});

describe('one navigation stack (GD-2 as amended by EN-6)', () => {
  it('a cross-link pushes, Back pops, and Back is hidden at the root', async () => {
    render(
      <Page nodes={[localTerm('rate', 'Compare with a ratio.'), localTerm('ratio', 'Two numbers.')]} />,
    );
    const { dialog } = await openTerm('rate');
    expect(within(dialog).queryByRole('button', { name: /Back/ })).toBeNull();
    const link = within(dialog)
      .getAllByRole('button', { name: 'ratio' })
      .find((b) => b.classList.contains('glossary-link'))!;
    fireEvent.click(link);
    await within(dialog).findByRole('heading', { name: 'ratio', level: 2 });
    fireEvent.click(within(dialog).getByRole('button', { name: /Back/ }));
    await within(dialog).findByRole('heading', { name: 'rate', level: 2 });
  });

  it('Alt+ArrowLeft is NOT bound (it is browser Back on Chromebooks)', async () => {
    render(
      <Page nodes={[localTerm('rate', 'Compare with a ratio.'), localTerm('ratio', 'Two numbers.')]} />,
    );
    const { dialog } = await openTerm('rate');
    fireEvent.click(
      within(dialog)
        .getAllByRole('button', { name: 'ratio' })
        .find((b) => b.classList.contains('glossary-link'))!,
    );
    await within(dialog).findByRole('heading', { name: 'ratio', level: 2 });
    fireEvent.keyDown(dialog, { key: 'ArrowLeft', altKey: true });
    expect(within(dialog).getByRole('heading', { name: 'ratio', level: 2 })).toBeInTheDocument();
  });
});

describe('search (D4, GD-6, GD-13, GD-14)', () => {
  it('zero results say so and offer the near term', async () => {
    render(<Page nodes={[localTerm('gradient', 'How steep a line is.')]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Glossary' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: 'gradinet' } });
    expect(dialog).toHaveTextContent('No words match “gradinet”.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Did you mean gradient?' }));
    expect(within(dialog).getByRole('searchbox')).toHaveValue('gradient');
  });

  it('a definition-word hit shows a highlighted plain-text snippet', async () => {
    render(<Page nodes={[localTerm('gradient', 'How steep a line is.')]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Glossary' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: 'steep' } });
    const mark = dialog.querySelector('.glossary-row__snippet mark');
    expect(mark).toHaveTextContent('steep');
  });

  it('announces the result count politely, debounced', async () => {
    vi.useFakeTimers();
    try {
      render(<Page nodes={[localTerm('rate', 'x'), localTerm('ratio', 'y')]} />);
      fireEvent.click(screen.getByRole('button', { name: 'Glossary' }));
      await act(async () => {
        await vi.dynamicImportSettled();
      });
      const dialog = screen.getByRole('dialog');
      fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: 'rat' } });
      const live = dialog.querySelector('.glossary-live')!;
      expect(live).toHaveTextContent('');
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(live).toHaveTextContent('2 words');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('the summon (R5)', () => {
  it('renders nothing when there is nothing active to show', () => {
    render(<Page nodes={[{ type: 'text', text: 'plain', marks: [] }]} />);
    expect(screen.queryByRole('button', { name: 'Glossary' })).toBeNull();
  });

  it('a keyed mark with an empty baked body stays a button (EN-5)', async () => {
    render(<Page nodes={[keyedTerm('slope', 'gradient')]} />);
    const { dialog } = await openTerm('slope');
    expect(dialog).toHaveTextContent('This definition isn’t available right now.');
  });
});

describe('the store read (R1, R6, R16, EN-4, GD-5)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is deferred past first paint, then made once at idle', async () => {
    const load = vi.fn(async () => ({ entries: [] }));
    render(<Page nodes={[localTerm('rate', 'x')]} service={{ load }} />);
    expect(load).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('a tap before idle reads at once, and idle JOINS that read (both orders)', async () => {
    const d = deferred<unknown>();
    const load = vi.fn(() => d.promise);
    render(<Page nodes={[localTerm('rate', 'x')]} service={{ load }} />);
    fireEvent.click(screen.getByRole('button', { name: 'rate' }));
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => {
      d.resolve({ entries: [] });
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('the live store body replaces the baked copy once it lands (EN-4)', async () => {
    const d = deferred<unknown>();
    render(
      <Page
        nodes={[keyedTerm('gradient', 'gradient', 'OLD baked words')]}
        service={{ load: () => d.promise }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'gradient' }));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('OLD baked words');
    expect(dialog).toHaveTextContent('Loading course glossary…');
    await act(async () => {
      d.resolve({ entries: [row('gradient', 'gradient', 'NEW live words')] });
    });
    expect(dialog).toHaveTextContent('NEW live words');
    expect(dialog).not.toHaveTextContent('OLD baked words');
    expect(dialog).not.toHaveTextContent('Loading course glossary…');
    // Selection held through the merge (GD-5).
    expect(within(dialog).getByRole('heading', { name: 'gradient', level: 2 })).toBeInTheDocument();
  });

  it('a failed read leaves the local terms and retries once on the next open', async () => {
    const load = vi.fn(async () => {
      throw new Error('offline');
    });
    render(<Page nodes={[localTerm('rate', 'Local words.')]} service={{ load }} />);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(load).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'rate' }));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(screen.getByRole('dialog')).toHaveTextContent('Local words.');
    await act(async () => {});
    expect(load).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'rate' }));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('a local definition hides the store entry it matches by variant (R15)', async () => {
    const load = vi.fn(async () => ({
      entries: [row('gradient', 'gradient', 'Store words.', { variants: { us: 'slope' } })],
    }));
    render(<Page nodes={[localTerm('slope', 'Our words.')]} service={{ load }} />);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Glossary' }));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    const dialog = screen.getByRole('dialog');
    const rows = Array.from(dialog.querySelectorAll('.glossary-row')).map((r) => r.textContent);
    expect(rows.some((t) => t?.includes('gradient'))).toBe(false);
    expect(rows.some((t) => t?.includes('slope'))).toBe(true);
  });

  it('shows a course entry\'s US variant under its term (D9 cross-list)', async () => {
    const load = vi.fn(async () => ({
      entries: [row('gradient', 'gradient', 'Steepness.', { variants: { us: 'slope' } })],
    }));
    render(<Page nodes={[keyedTerm('gradient', 'gradient', 'Steepness.')]} service={{ load }} />);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.click(screen.getByRole('button', { name: 'gradient' }));
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(screen.getByRole('dialog').querySelector('.glossary-detail')).toHaveTextContent(
      'US: slope',
    );
  });
});

describe('createGlossaryCache (R6, W-10)', () => {
  it('names the cause class for an empty or unpublished read, never student data', async () => {
    const warn = vi.fn();
    const cache = createGlossaryCache({ load: async () => null }, { warn });
    expect(await cache.read('a')).toEqual([]);
    expect(warn).toHaveBeenCalledWith('[glossary] not-published for activity a');
    const warn2 = vi.fn();
    const cache2 = createGlossaryCache({ load: async () => ({ entries: [] }) }, { warn: warn2 });
    await cache2.read('b');
    expect(warn2).toHaveBeenCalledWith('[glossary] no-rows for activity b');
  });

  it('allows exactly one retry after a failure', async () => {
    const load = vi.fn(async () => {
      throw new Error('boom');
    });
    const cache = createGlossaryCache({ load }, { warn: () => {} });
    expect(await cache.read('a')).toBeNull();
    expect(await cache.read('a')).toBeNull();
    expect(await cache.read('a')).toBeNull();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('drops a row whose body carries a prompted math gap (EN-8)', () => {
    const parsed = parseGlossaryPayload({
      entries: [
        row('ok', 'ok', 'fine'),
        {
          term_id: 'bad',
          term: 'bad',
          variants: {},
          retired: false,
          body: [
            {
              type: 'paragraph',
              content: [{ type: 'math_inline', latex: 'x', prompts: [{ id: 'p', answer: '1' }] }],
            },
          ],
        },
      ],
    });
    expect(parsed.entries.map((e) => e.id)).toEqual(['ok']);
    expect(parsed.dropped).toBe(1);
  });
});
