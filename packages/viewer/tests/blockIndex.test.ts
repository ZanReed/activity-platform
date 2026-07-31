// =============================================================================
// blockIndex.test.ts — the served-document → check-payload walk (S3 V4)
// -----------------------------------------------------------------------------
// This walk decides what reaches the grader. Its failure mode is silent and
// severe — an id it misses is a student answer that is never checked and never
// reported — so the pins here are about COVERAGE, not shape:
//
//   - every response-bearing fixture block contributes ids in the right
//     category (driven off the generated fixtures, so a new block type with a
//     fixture is exercised automatically);
//   - blanks nested inside a container (faded_worked_example steps) attribute
//     to the nested block, not the container;
//   - math gaps count as blanks wherever they appear;
//   - display-mode instances contribute nothing (they take no input);
//   - graph-family gradables route into the `graphs` category (wire v2), and
//     the `unsupported` escape hatch stays empty-but-live for the next block
//     type that lands ahead of its wire bump.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { indexDocument, registeredBlockTypes, familyOf } from '../src/index.js';
import {
  authoredBlockFixture,
  sanitizedFixtureDocument,
} from '../src/fixtures/index.js';
import type { SanitizedActivityDocument } from '../src/index.js';

const doc = sanitizedFixtureDocument();
const index = indexDocument(doc);
const only = index.sections[0]!; // the fixture document is one section

/** Build a one-block document around a sanitized block (for isolation cases). */
function docWith(block: unknown): SanitizedActivityDocument {
  return {
    ...doc,
    sections: [
      {
        ...doc.sections[0]!,
        id: 'section-under-test',
        rows: [
          {
            id: 'row-1',
            gridLines: 'inherit',
            columns: [{ id: 'col-1', blocks: [block] }],
          },
        ],
      },
    ],
  } as unknown as SanitizedActivityDocument;
}

const blockOf = (type: string) =>
  doc.sections
    .flatMap((s) => s.rows)
    .flatMap((r) => r.columns)
    .flatMap((c) => c.blocks)
    .filter((b) => (b as { type?: string }).type === type);

describe('category coverage', () => {
  it('routes each response-bearing type into its wire category', () => {
    const mc = blockOf('multiple_choice')[0] as { id: string };
    const matching = blockOf('matching')[0] as { id: string };
    const ordering = blockOf('ordering')[0] as { id: string };
    const essay = blockOf('essay')[0] as { id: string };
    const shortAnswer = blockOf('short_answer')[0] as { id: string };
    const selfExp = blockOf('self_explanation')[0] as { id: string };

    expect(only.items.choices).toContain(mc.id);
    expect(only.items.matches).toContain(matching.id);
    expect(only.items.orderings).toContain(ordering.id);
    expect(only.items.freeText).toEqual(
      expect.arrayContaining([essay.id, shortAnswer.id, selfExp.id]),
    );
  });

  it('collects blank ids from fill_in_blank content', () => {
    const authored = authoredBlockFixture('fill_in_blank') as unknown as {
      content: Array<{ type: string; id?: string }>;
    };
    const blankId = authored.content.find((n) => n.type === 'blank')!.id!;
    expect(only.items.blanks).toContain(blankId);
  });

  it('counts math gaps as blanks (math_block prompts)', () => {
    const authored = authoredBlockFixture('math_block') as unknown as {
      prompts: Array<{ id: string }>;
    };
    expect(only.items.blanks).toContain(authored.prompts[0]!.id);
  });

  it('finds a prompted math_inline anywhere in content, not only where declared', () => {
    const paragraphWithGap = {
      id: 'para-with-gap',
      type: 'paragraph',
      content: [
        { type: 'text', text: 'so ', marks: [] },
        {
          type: 'math_inline',
          latex: 'x = \\placeholder[gDeep]{}',
          prompts: [{ id: 'gDeep' }],
        },
      ],
    };
    const isolated = indexDocument(docWith(paragraphWithGap));
    expect(isolated.sections[0]!.items.blanks).toEqual(['gDeep']);
  });
});

describe('containers and nesting', () => {
  it('attributes a nested step’s blanks to the step, not the container', () => {
    const faded = blockOf('faded_worked_example')[0] as unknown as {
      id: string;
      content: Array<{ id: string; content: Array<{ type: string; id?: string }> }>;
    };
    const step = faded.content[0]!;
    const nestedBlankId = step.content.find((n) => n.type === 'blank')!.id!;

    const isolated = indexDocument(docWith(faded));
    const section = isolated.sections[0]!;

    // The blank is collected once, and the container itself contributes none.
    expect(section.items.blanks).toEqual([nestedBlankId]);
    // Both the container and its child are known blocks in the section.
    expect(section.blockIds).toEqual(
      expect.arrayContaining([faded.id, step.id]),
    );
  });

  it('descends into worked_example children (nested math gaps included)', () => {
    const worked = blockOf('worked_example')[0] as unknown as { id: string };
    const isolated = indexDocument(docWith(worked));
    expect(isolated.sections[0]!.items.blanks).toEqual(['g2']);
  });
});

describe('non-input and unsupported instances', () => {
  it('display-mode graph and data_plot instances contribute nothing', () => {
    for (const type of ['interactive_graph', 'data_plot']) {
      const display = blockOf(type).find(
        (b) =>
          (b as { interaction?: { type?: string } }).interaction?.type === 'display',
      )!;
      expect(familyOf(display as never), type).toBe('static');
      const isolated = indexDocument(docWith(display));
      expect(isolated.sections[0]!.items, type).toEqual({});
      expect(isolated.sections[0]!.unsupported, type).toEqual([]);
    }
  });

  it('gradable graph-family blocks route into the graphs category (wire v2)', () => {
    const gradableGraph = blockOf('interactive_graph').find(
      (b) =>
        (b as { interaction?: { type?: string } }).interaction?.type === 'plot_point',
    ) as { id: string };
    const isolated = indexDocument(docWith(gradableGraph));
    expect(isolated.sections[0]!.items.graphs).toEqual([gradableGraph.id]);
    expect(isolated.sections[0]!.unsupported).toEqual([]);
  });

  it('every gradable graph-family block reaches the grader', () => {
    const expected = registeredBlockTypes
      .filter((t) => ['interactive_graph', 'number_line', 'data_plot'].includes(t))
      .flatMap((t) => blockOf(t))
      .filter((b) => familyOf(b as never) !== 'static')
      .map((b) => (b as { id: string }).id);
    expect([...(only.items.graphs ?? [])].sort()).toEqual([...expected].sort());
    expect(expected.length).toBeGreaterThan(0);
  });

  it('the unsupported roster is EMPTY at wire v2 — and that is a claim, not an omission', () => {
    // Every gradable type now has a wire category. The mechanism stays for the
    // next block type that lands ahead of its wire bump; if this ever goes
    // non-empty, some student's work has no way to reach the grader and the
    // container is required to say so.
    expect(index.unsupported).toEqual([]);
  });

  it('purely static content contributes no ids at all', () => {
    for (const type of ['paragraph', 'heading', 'image', 'callout', 'graph_figure']) {
      const isolated = indexDocument(docWith(blockOf(type)[0]));
      expect(isolated.sections[0]!.items, type).toEqual({});
    }
  });
});

describe('structure', () => {
  it('indexes by section id and preserves document order', () => {
    expect(index.bySection[only.sectionId]).toBe(only);
    expect(only.blockIds.length).toBeGreaterThan(registeredBlockTypes.length);
  });

  it('no id is claimed by two categories', () => {
    const all = [
      ...(only.items.blanks ?? []),
      ...(only.items.choices ?? []),
      ...(only.items.matches ?? []),
      ...(only.items.orderings ?? []),
      ...(only.items.freeText ?? []),
    ];
    expect(new Set(all).size).toBe(all.length);
  });
});
