// =============================================================================
// blockIndex-unsupported.test.ts — the roster's LIVENESS proof (2026-11-26)
// -----------------------------------------------------------------------------
// `unsupported` is the list of blocks that take an answer the wire cannot
// carry. It was declared, aggregated and test-pinned EMPTY, and the branch that
// should fill it fell through in silence, so it could never be anything else:
// a safeguard with no way to fire (policy P3). This forces it to fire once, by
// teaching the registry lookup about a block type that does not exist yet.
// =============================================================================

import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/registry/registry.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/registry/registry.js')>();
  return {
    ...actual,
    familyOf: (block: { type: string }) =>
      block.type === 'future_widget' ? 'auto_gradable' : actual.familyOf(block as never),
  };
});

const { indexDocument } = await import('../src/container/blockIndex.js');

const docOf = (blocks: unknown[]) =>
  ({
    sections: [
      { id: 's1', rows: [{ id: 'r1', columns: [{ id: 'c1', blocks }] }] },
    ],
  }) as never;

describe('a gradable block the wire cannot carry', () => {
  it('is named in the roster, per section and for the document', () => {
    const index = indexDocument(docOf([{ id: 'w1', type: 'future_widget' }]));
    expect(index.sections[0]!.unsupported).toEqual(['w1']);
    expect(index.unsupported).toEqual(['w1']);
    expect(index.sections[0]!.items).toEqual({});
  });

  it('is NOT named when its answer travels in-band, as a blank does', () => {
    const index = indexDocument(
      docOf([
        {
          id: 'w2',
          type: 'future_widget',
          content: [{ type: 'blank', id: 'blank-1' }],
        },
      ]),
    );
    expect(index.unsupported).toEqual([]);
    expect(index.sections[0]!.items.blanks).toEqual(['blank-1']);
  });

  it('a real in-band type with nothing to fill in is not reported', () => {
    // A fill-in-the-blank sentence with no blank yet is still "gradeable" by
    // type, and has neither in-band ids nor child blocks. It takes no answer.
    const index = indexDocument(
      docOf([
        { id: 'f1', type: 'fill_in_blank', content: [{ type: 'text', text: 'No blank yet.' }] },
        { id: 'f2', type: 'faded_worked_example', title: 'Empty', steps: [] },
      ]),
    );
    expect(index.unsupported).toEqual([]);
  });
});
