// =============================================================================
// runtime-doc-contract.test.ts — RUNTIME.md keeps a section per interactive block
// -----------------------------------------------------------------------------
// The add-a-block-type checklist (README) says: "If the block is interactive,
// RUNTIME.md's data-attribute contract gains a section." That step was silently
// skipped for TWO block families in a row (number_line, data_plot shipped with
// their runtime wiring but no RUNTIME.md section) because nothing failed when it
// was missed — unlike the columns/dashboard guards in
// app/src/__tests__/blockTypeGuards.test.ts. This guard closes that gap the same
// way: it enumerates the schema's Block union and forces an explicit answer for
// every type.
//
// Two assertions:
//   1. EXHAUSTIVE CLASSIFICATION — every member of the Block union is listed in
//      exactly one of INTERACTIVE / CONTAINER below. A newly added block type is
//      in neither, so the test fails until someone classifies it (the same
//      forcing function as a `never` exhaustiveness check).
//   2. CONTRACT SECTION — every INTERACTIVE type has a data-attribute-contract
//      section in RUNTIME.md (detected by its `data-block-type="<type>"` code
//      sample, which every such section carries).
//
// "Interactive" = the runtime reads type-specific data-* attributes off the
// block (answer key, config, interaction type) and wires behavior to it.
// "Container" = content or a pure wrapper the runtime never reads type-specific
// attributes from — `problem` is the canonical case (a question-category shell
// scored through its child blanks, no attributes of its own).
// =============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { Block } from '@activity/schema';

// The block types whose runtime wiring reads type-specific data-* attributes —
// each MUST have a data-attribute-contract section in RUNTIME.md.
const INTERACTIVE = new Set<string>([
  'fill_in_blank',
  'interactive_graph',
  'multiple_choice',
  'matching',
  'ordering',
  'number_line',
  'data_plot',
  // Ungraded, but INTERACTIVE: the runtime reads the block's textarea value
  // (keyed by data-block-id) to persist + submit it, so it carries a
  // data-attribute contract and a RUNTIME.md section. short_answer + essay are
  // the manually-graded siblings — same capture, same contract section.
  'self_explanation',
  'short_answer',
  'essay',
]);

// Content / pure-container block types the runtime never reads type-specific
// attributes from — no contract section required. `problem` is a
// question-category shell whose scoring rides its child blanks.
const CONTAINER = new Set<string>([
  'paragraph',
  'heading',
  'math_block',
  'image',
  'callout',
  'problem',
  'bullet_list',
  'ordered_list',
  'columns',
  'learning_objectives',
  'worked_example',
  // Scaffold shell whose scoring rides its child fill_in_blank blanks — the
  // runtime reads no type-specific attributes off the frame itself (like
  // `problem`), so no RUNTIME.md contract section is required.
  'faded_worked_example',
]);

// Discriminator literals of the Block discriminated union, read at runtime.
const blockTypes: string[] = (
  Block as unknown as { options: readonly unknown[] }
).options.map(
  (opt) => (opt as { shape: { type: { value: string } } }).shape.type.value,
);

const runtimeMd = readFileSync(
  fileURLToPath(new URL('../../RUNTIME.md', import.meta.url)),
  'utf8',
);

describe('RUNTIME.md data-attribute contract coverage', () => {
  it('every Block union member is classified as interactive or container', () => {
    // A new block type lands in neither set → this fails, forcing a deliberate
    // choice (and, if interactive, a RUNTIME.md section).
    const unclassified = blockTypes.filter(
      (t) => !INTERACTIVE.has(t) && !CONTAINER.has(t),
    );
    expect(
      unclassified,
      `Block type(s) not classified in runtime-doc-contract.test.ts. Add each to ` +
        `INTERACTIVE (and give it a RUNTIME.md contract section) or CONTAINER.`,
    ).toEqual([]);
  });

  it('the classification sets do not name types absent from the schema', () => {
    // Keeps the sets from rotting after a block type is removed/renamed.
    const known = new Set(blockTypes);
    const stale = [...INTERACTIVE, ...CONTAINER].filter((t) => !known.has(t));
    expect(stale, 'stale block-type name(s) in the classification sets').toEqual(
      [],
    );
  });

  it.each([...INTERACTIVE])(
    'RUNTIME.md has a data-attribute-contract section for %s',
    (type) => {
      expect(
        runtimeMd.includes(`data-block-type="${type}"`),
        `RUNTIME.md is missing the data-attribute contract section for the ` +
          `interactive block type "${type}" (expected a code sample containing ` +
          `data-block-type="${type}"). Add the section — it's an add-a-block-type ` +
          `checklist step.`,
      ).toBe(true);
    },
  );
});
