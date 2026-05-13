# Vocabulary definitions — Phase 2 design

**Status:** design captured, not implemented. This document holds the shape decided in a Stage 9c-era conversation so that whoever picks up Phase 2 (probably future-me) has the rationale alongside the code shape. When Phase 2 lands, the Zod definition migrates into the schema package as a real export and this doc gets either deleted or moved to an `archive/` subdirectory.

See ROADMAP.md "Phase 2 — Polish the loop" for the user-visible framing and "Phase 4 — Multi-tenancy" for the glossary extension.

## Why a mark, not a node

A mark is the right shape because the defined text is *still text* — it participates in line-wrapping, can have other marks layered on it (bold, italic), and the editor UX is "select text, click Define" rather than "insert a custom block." Nodes are for content that owns its own layout; marks are for properties of text runs.

## Proposed schema

\`\`\`typescript
// packages/schema/src/marks/definition.ts (PHASE 2)
// =============================================================================
// DefinitionMark — inline mark for vocabulary definitions
// =============================================================================

import { z } from 'zod';

export const DefinitionMark = z.object({
  type: z.literal('definition'),
  attrs: z.object({
    // Phase 2: literal definition typed by the teacher inline.
    definition: z.string().optional(),
    // Phase 4+: stable key into ActivityMeta.glossary. When present,
    // glossaryKey takes priority over definition at render time.
    glossaryKey: z.string().optional(),
  }).refine(
    (a) => Boolean(a.definition) || Boolean(a.glossaryKey),
    { message: 'definition mark must carry either definition or glossaryKey' }
  ),
});

export type DefinitionMark = z.infer<typeof DefinitionMark>;
\`\`\`

## Phase 4 — ActivityMeta extension

\`\`\`typescript
// In document.ts when Phase 4 lands.
glossary: z.record(
  z.string(),                   // stable key, e.g. "factor-noun", "factor-verb"
  z.object({
    term: z.string(),           // display term ("factor")
    definition: z.string(),     // full definition text
  })
).default({}),
\`\`\`

Stable key, not term, for the same reason `blank.id` is stable: two senses of "factor" need separate entries, and renaming a term in the editor shouldn't break every reference to it.

## Data-attribute contract (renderer output)

\`\`\`html
<span class="definition"
      data-definition="..."      <!-- HTML-entity-escaped string  -->
      data-glossary-key="..."    <!-- Phase 4+; optional in Phase 2 -->
      tabindex="0"
      role="button"
      aria-haspopup="dialog">factor</span>
\`\`\`

This is additive to the frozen data-attribute contract. Attribute names are chosen now so the Phase 4 glossary layer doesn't require a rename.

## Runtime behavior

On init, query `.definition` spans and attach click/tap + keydown handlers (Enter/Space to open, Esc to close). Popover positioned via floating-ui. Focus returns to the trigger on close (managed dialog pattern). Definition text is read from `data-definition` (Phase 2) or resolved via a glossary map passed in at init time (Phase 4).

## What this design does NOT decide

1. **Tiptap mark UI affordance** — toolbar button vs. slash menu vs. context menu. Probably toolbar button next to bold/italic, but depends on what the toolbar looks like by the time Phase 2 lands.
2. **Popover library specifics** — floating-ui or @floating-ui/react? The runtime side is vanilla (can't pull in React); the editor side can use whichever fits the rest of the app.
3. **Definition editing UX** — inline edit (click the marked word, edit popover appears) vs. side panel. Probably inline with a "see all definitions" panel as a Phase 4 extension.
4. **Print behavior** — definitions as inline footnotes, bottom-of-page appendix, or just hidden. Decide at Stage 11 / Phase 2 implementation.
5. **Mobile/touch interaction** — tap-triggers-popover is cleaner than hover, and hover-on-desktop creates a dual interaction model. Probably tap-only across platforms, with the underline + cursor change communicating affordance.

None of these affect the schema or the data-attribute contract, so they're safe to defer.
