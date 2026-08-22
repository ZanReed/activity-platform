# Definition rich content — block-level definitions

> ⚠ **INFRASTRUCTURE ANNOTATION (drift audit 2026-08-22).** This doc names a `publish-activity` redeploy (four times) and `STORAGE_SCHEMA_VERSION` as live. `publish-activity` died at S9 Drop 1 and `packages/renderer` (with `STORAGE_SCHEMA_VERSION`) at Drop 4 (2026-08-14). Rich definitions reach students through the viewer at `/a/:id` (`packages/viewer/src/blocks/`), and a schema change ships via `pnpm bundle:viewer-server` + `deploy:get-activity`. The text below is left intact as the record of how the feature shipped.

**Status:** COMPLETE 2026-07-27 — all five slices built and browser-verified. Decisions D1–D7
below are author-ruled. §9 records what the build changed about this design. **Waiting on a
`publish-activity` redeploy** before rich definitions reach published pages.

Extends the shipped inline vocabulary-definition feature
([vocabulary-definitions.md](vocabulary-definitions.md)) so a definition can carry the same
*content* alphabet the reference panel can. Prompted by the author: "anything you can do in
reference materials you should be able to do in definitions too."

Phase 4 (tenant glossary store, implicit reuse, auto-suggest) is untouched by this work and
remains future. This design deliberately prefigures it — see §7.

---

## 1. The gap

`DefinitionMark.content` is an **inline** alphabet
(`DefinitionContentInline` = text-with-`SimpleMark` + `math_inline` + `hard_break`), plus one
ad-hoc optional `image` attr. The reference panel is a **block** alphabet — the full `Block`
union, filtered by the `referenceSafe` flag in `slashMenuItems.ts`.

| Reference panel authors | Definition today |
|---|---|
| `paragraph` (many), `heading`, `bullet_list`, `ordered_list` | one flat inline run |
| `math_block` (display equations) | inline `$…$` only |
| `image` with `sizingFields` + crop | one image, no sizing |
| `graph_figure` (static coordinate plane) | — |
| `callout` | — |
| columns / rows | — |

For math vocabulary this is a real miss: "Slope" wants a centered
$$m = \frac{y_2-y_1}{x_2-x_1}$$ and a short property list, and neither is expressible.

**Cost is low where it matters.** The renderer already pre-renders definition content into a
hidden `<template class="js-definition-content">` and the sidecar only clones it
(`definitions.ts` → `bodyEl.replaceChildren(tpl.content.cloneNode(true))`). Block content is
**zero additional runtime bytes** — which matters, since the base runtime is 41.8 KiB against a
40 KiB soft target. The panel's block CSS is already global, so styling is near-free too; only
popover sizing/overflow rules are new.

## 2. Decisions (author-ruled 2026-07-27)

- **D1 — Bounded `DefinitionBlock` union, NOT the full `Block` union.** *Ruled: yes.*
  `DefinitionMark` lives in `TextNode.marks`; `TextNode` lives in every block's `content`. Making
  `content: Block[]` creates the cycle `Block → text → mark → Block` — definitions nested inside
  definitions, at arbitrary depth, for every consumer (renderer, serialize, importer, editor).
  `document.ts:314` already records that the inferred document type outgrew tsc's
  declaration-serialization limit (TS7056) at 14 block-union members and needed a hand-written
  `interface ActivityDocument`; a genuine cycle lands squarely on that. The existing schema
  comment ("which also keeps the schema non-recursive") is load-bearing and stays.
- **D2 — Columns excluded.** *Ruled: agree.* The popover is `min(20rem, 100vw - 2rem)`.
  Side-by-side columns in a 320px floating box anchored to a word are unreadable on a phone. A
  definition that needs two-column layout *is* the reference panel.
- **D3 — `graph_figure` in, `callout` out.** *Ruled.* A static coordinate plane is exactly the
  kind of thing a geometry/algebra definition wants ("these lines are parallel"). A tinted note
  box nested inside a popover that is itself a note box is visual noise with no added meaning.
- **D4 — Print: end-of-worksheet glossary appendix, behind a `meta.print` flag.** *Ruled: (c).*
  Today `.definition-popover` is `display:none` in the print stylesheet (`styles.ts:1709`), so
  definition content does not print at all. That is fine for throwaway text and a bug the moment a
  definition carries a formula and a diagram. This closes item 4 of "What this design does NOT
  decide" in [vocabulary-definitions.md](vocabulary-definitions.md).
- **D5 — Editor: popover for simple, dialog for rich, hard-gated.** *Ruled: yes.* See §5 — the
  gate is a data-loss guard, not an ergonomic preference.
- **D6 — Import: a ` ```definitions ` fence + `[[term]]` reference, reusing the reference
  fence's line grammar; `[[term :: definition]]` unchanged.** *Ruled: works great.* See §6.
- **D7 — `DefinitionMark.image` is folded into an `image` block.** *Recommended here, needs a
  yes/no.* Once `image` is a legal `DefinitionBlock`, keeping the separate `image` attr means two
  ways to express one thing. Proposal: migrate legacy `image` into a trailing `image` block in the
  existing `Mark` preprocess and drop the attr. The popover keeps its current one-image control as
  sugar that reads/writes that trailing block, so the simple-case UX is unchanged.

## 3. Schema

```ts
// packages/schema/src/inline.ts

// A definition's block alphabet: the reference panel's *content* blocks, minus
// columns (D2) and callout (D3), minus every question/interactive block. All
// inline content uses DefinitionContentInline (which carries SimpleMark only),
// so the union is NON-RECURSIVE by construction — a definition can never
// contain another definition. See D1.
export const DefinitionBlock = z.discriminatedUnion('type', [
  DefinitionParagraphBlock,   // content: DefinitionContentInline[]
  DefinitionHeadingBlock,     // level 1-3, content: DefinitionContentInline[]
  DefinitionBulletListBlock,
  DefinitionOrderedListBlock,
  MathBlock,                  // reused verbatim — carries latex only, no inline content
  ImageBlock,                 // reused verbatim — sizingFields + crop come along
  GraphFigureBlock,           // reused verbatim — axis + drawables, no inline content
]);

export const DefinitionMark = z.object({
  type: z.literal('definition'),
  content: z.array(DefinitionBlock).default([]),
  glossaryKey: z.string().optional(),   // Phase 4, unchanged
  // image: REMOVED — migrated to a trailing ImageBlock (D7)
});
```

`GraphFigureBlock` is reused **verbatim**; every other member is definition-local. See §9.1 — the
build corrected this design's original claim that math and image could be reused too.

### Legacy upgrade

`Mark`'s `z.preprocess` already upgrades two older shapes (bare-string marks; the pre-rich
`definition: string`). It gains a third step, applied last so it composes with both:

1. `content` is an **inline** array (the shipped Phase-2 shape) → wrap in one
   `{ type: 'paragraph', content: [...] }`.
2. `image` attr present → append `{ type: 'image', src, alt }` and delete the attr (D7).

Both are pure read-time upgrades of stored documents. **No `schemaVersion` bump** — definition
content never travels the submission wire (it is pre-rendered into the published page's
`<template>`, and `submissions.responses` has no definition channel), so neither
`STORAGE_SCHEMA_VERSION` nor the ingest wire version moves. `publish-activity` needs a redeploy to
reach published pages; `ingest-submission` does not.

## 4. Renderer + runtime

- `renderText`'s `case 'definition'` swaps `renderInlineNodes(mark.content)` for the block
  renderer over `DefinitionBlock[]`. The `<template class="js-definition-content">` wrapper, the
  `data-definition` plain-text fallback, `data-glossary-key`, and every ARIA attribute are
  **unchanged** — the data-attribute contract is additive-only and this touches none of it.
- `definitionPlainText` walks blocks instead of inline nodes for the `data-definition` fallback
  (paragraphs joined by spaces; `math_block` / `image` / `graph_figure` skipped, as inline math
  already is).
- **The sidecar `definitions.ts` needs no change at all.** It clones an opaque template. This is
  the whole reason the feature is cheap.
- `styles.ts`: `.definition-popover` widens (`min(28rem, 100vw - 2rem)`, `max-height: 60vh`, it
  already scrolls) and gains scoping rules under `.definition-popover-body` so panel-scale
  headings and block math read correctly at popover scale.

### Print (D4)

A new `meta.print.printDefinitionGlossary` flag (optional, defaults **off** — matching the
`printReferencePanel` precedent). When on, `document.ts` emits an end-of-worksheet
`<aside class="definition-glossary" data-block-category="scaffold">` listing each distinct defined
term and its rendered content, in document order, deduplicated by term. `.definition-popover` stays
`display:none` in print — the appendix is the paper surface, the popover is the screen surface.

Collecting the terms is a pure walk over the document the renderer already has in hand, so this
stays inside the pure-renderer constraint (JSON-in, HTML-string-out, no I/O).

## 5. Editor (D5)

**The gate is a correctness requirement.** `DefinitionEditPopover.commitAndClose` writes
`contentRef.current` over the entire `content` attr on *every* exit path — Done, Escape, and
outside-click alike. An inline-only popover editing a multi-block definition would therefore
silently discard every block after the first on a stray Escape. So:

- **Popover (`DefinitionEditPopover`)** stays exactly as it is today — `InlineRichTextEditor` plus
  the one-image control — and is **editable only when `content` is empty or a single `paragraph`
  block** (plus, per D7, an optional trailing `image` block). It reads/writes paragraph 1's inline
  content and that trailing image; nothing else can be reached, so nothing else can be clobbered.
- **When content is richer**, the popover renders a **read-only preview** plus an `Edit…` button.
  No editable field, so no commit path exists to lose data through.
- **`Expand`** is present unconditionally, so a simple definition can be promoted at will.
- **Dialog (`DefinitionEditDialog`, new)** hosts a constrained block editor — effectively
  `ReferencePanelEditor` with the `DefinitionBlock` extension set and a `variant="definition"`
  toolbar. Commits on explicit Save; Cancel discards.

Why a dialog and not a bigger popover: an anchored popover hosting a nested ProseMirror instance
is this repo's documented landmine — per-chip `BlankEditPopover` mounting broke widespread editor
behavior in Drop 1 of Stage 13.5 (a standing "don't" in CLAUDE.md), and the deferred "one-click
switch between chips" item is deferred over precisely the FocusTrap/selection entanglement a
nested editor would inherit. A modal dialog is unanchored, owns its own focus, and is torn down on
close, so it inherits none of it.

`DefinitionPopoverHost` keeps its single-host, selection-driven lifecycle unchanged; it gains only
the branch that decides popover-editable vs. popover-preview vs. dialog-open. The
`updateDefinition` command's signature changes from `(content, image)` to `(content)`.

## 6. Markdown import (D6)

The inline `[[term :: definition]]` grammar cannot carry blocks, so it is **kept unchanged** for
one-liners (no breaking change, no re-authoring of existing markdown) and joined by a fence.

````markdown
```definitions
term: Slope
Steepness of a line — rise over run.
$$m = \frac{y_2 - y_1}{x_2 - x_1}$$
graph: line y=2x
---
term: Intercept
Where the line crosses an axis.
- x-intercept: crosses the x-axis
- y-intercept: crosses the y-axis
```

The **[[Slope]]** of this line is 2, and its [[intercept]] is 0.
````

- **Entries** are separated by `---`; each is headed by a `term:` line.
- **Body lines use the reference fence's existing line grammar verbatim** — `$$…$$`, `-` / `1.`
  list runs, `#`–`###` headings, images, back-to-back `graph:` runs sharing one grid, `axes:`
  windowing the next figure. This is a **shared parser**, not a second one: the line loop inside
  `parseReferenceFence` is extracted to a `parseContentLines(src, ctx, opts)` helper that both
  fences call, with `opts` naming the allowed block set (so `callout` is rejected in a definition
  per D3, and the warning text stays surface-specific).
- **`[[term]]` with no `::`** resolves against the fence by case-insensitive term match and marks
  that occurrence. Two-pass: fences collected first, references resolved after, so order in the
  document does not matter.
- **Unresolved `[[Foo]]`** keeps its literal text and adds a warning — matching the existing
  no-`::`/empty-term behavior.
- Resolution **copies** the content onto each mark (Phase 2 has no glossary store to point at),
  which is consistent with how the inline form already works.

Registered in `importFormatRegistry.ts` so the anti-drift guard forces `markdownImportPrompt.ts`
and `docs/markdown-import-format.md` to stay in sync — the fence rides the existing source-scan +
converter + prompt/doc bindings. The `[[term]]` reference form is a *mark*, not a fence, so like
the existing `[[term :: definition]]` it is guarded by a `markdownImportPrompt` CLAIM rather than
by the registry.

## 7. Relationship to Phase 4

The fence gives **activity-local define-once/mark-many** — a term is authored once and referenced
by many `[[term]]` occurrences. That is the same ergonomics the Phase-4 tenant glossary promises,
one scope down, and it arrives without a store, a migration, or an RLS policy.

It also stays inside the design's hard "never": marking is **teacher-explicit** (`[[Slope]]` is
typed by hand), so nothing is auto-defined at render or publish and no term is blanket-marked. The
existing `glossaryKey` field is untouched and still reserved.

When Phase 4 lands, promoting these is the same scriptable transform the original design already
describes — collect distinct `(term, content)` pairs into `glossary_entry`, add `glossaryKey` to
each mark — with the fence entries as a ready-made per-activity seed.

## 8. Slice plan

1. **Schema** — `DefinitionBlock` union, `DefinitionMark.content` retype, the two preprocess
   upgrade steps, `image` attr removal. Tests: legacy inline-content upgrade, legacy `image`
   upgrade, legacy `definition: string` still upgrades (composition), non-recursion pinned.
2. **Renderer + styles** — block rendering into the template, `definitionPlainText` over blocks,
   popover sizing/scoping CSS. Byte-identity test for a single-paragraph definition against the
   current output. `pnpm bundle:renderer` + commit the bundle in the same commit.
3. **Print appendix** — `meta.print.printDefinitionGlossary`, the term walk, the appendix render,
   the drawer control.
4. **Editor** — `DefinitionEditDialog` + the popover's editable/preview gate + `Expand`,
   `updateDefinition` signature change, `variant="definition"` toolbar. The gate wants an explicit
   test that a multi-block definition survives Escape/outside-click on the popover.
5. **Import** — extract `parseContentLines` from `parseReferenceFence` (behaviour-preserving,
   pinned by the existing reference-fence tests first), add the ` ```definitions ` fence, the
   `[[term]]` reference resolution, the registry entry, the prompt + format-doc sections.

Slices 1–2 are the load-bearing pair; 3, 4, and 5 are independent of each other and can land in
any order after them. Queue a `publish-activity` redeploy once slice 2 lands.


---

## 9. What the build changed (slices 1–2, 2026-07-27)

Four things this design got wrong or left out, corrected in code and recorded here so the next
slice starts from the truth.

### 9.1 Only `graph_figure` is reusable verbatim — math and image are not

The design claimed `MathBlock`, `ImageBlock`, and `GraphFigureBlock` could all be reused as-is
because "none carries `InlineNode` content." That is false for two of the three:

- **`MathBlock`** carries `solution?: InlineNode[]` (and `prompts`). The `solution` field is
  exactly the recursive edge D1 exists to avoid, and `prompts` are in-equation gradeable gaps —
  meaningless in a definition. Replaced by a local `DefinitionMathBlock` (`latex` + sizing only,
  no `labelFields`: a definition block is never numbered).
- **`ImageBlock`** is inline-free, but requires a uuid `id` (see 9.3). Replaced by a local
  `DefinitionImageBlock` that still reuses the shared `sizingFields` and `CropRect`, so crop and
  width behave identically. `caption` was dropped as YAGNI.

### 9.2 A leaf module had to be extracted first (`graph-primitives.ts`)

Admitting `graph_figure` into `DefinitionBlock` means `inline.ts` imports `blocks/graph-figure.ts`,
which imported `blocks/interactive-graph.ts`, which imports `inline.ts`. That cycle is **fatal, not
cosmetic**: `interactive-graph.ts` evaluates `z.array(InlineNode)` at module scope, so a
partially-initialized `inline.js` throws a TDZ `ReferenceError` at import time.

Fix: `AxisConfig`, `EndpointStyle`, `CurveDomain`, the `FunctionModel` family, `DrawableColor`, and
`Drawable` moved to a new leaf `packages/schema/src/graph-primitives.ts` (zod-only).
`blocks/interactive-graph.ts` re-exports all of them, so every existing import path and identity is
unchanged; `blocks/graph-figure.ts` imports from the leaf. Behaviour-preserving — the full schema
suite passed before any definition change was layered on.

This is good hygiene independent of definitions: those primitives were already shared by
`multiple_choice`, `matching`, `number_line`, and `data_plot`.

### 9.3 TS7056 fired, exactly as D1 predicted — and forced optional ids

Adding a 7-member block union inside a mark reachable from every block's inline content overflowed
tsc's declaration-serialization limit, failing the build in five downstream files
(`blocks/index.ts`, `document.ts` ×2, `layout.ts` ×2). Fixed at the tightest boundary — explicit
`interface`s for the definition block shapes plus a named `DefinitionBlock` union type with a
`z.ZodType<…>` annotation — rather than annotating the five call sites. `DefinitionMark` itself
stays a plain `z.object` (a `discriminatedUnion` member must be a real `ZodObject`); the named
union alias is what keeps its inferred type small.

Separately, **`id` is optional on every definition-local block**. Required uuids would force
`crypto.randomUUID()` inside the legacy upgrades, so parsing one stored document twice would yield
different ids and break re-serialization byte-identity. Nothing addresses a definition block
anyway. Renderers emit `data-block-id` only when an id is present (`blockIdAttr`).

### 9.4 Sanitizer granularity is now per-block, not per-inline-node

`sanitizeDefinitionContent` validates whole `DefinitionBlock`s, so a block containing one malformed
inline node now drops **entirely** rather than shedding just that node. Safe (nothing malformed
reaches output) and only reachable through hand-corrupted Tiptap attrs — the definition dialog
cannot author these shapes — but it is a real behaviour change from the old per-node sanitizer, and
it is pinned by tests. Restoring per-node granularity would mean a sanitizer per block type; not
worth it for a paranoia path, but this is the place to revisit if it ever bites.

One implementation, not two: the schema exports `upgradeDefinitionMark`, and the app's serializer
calls it, so a stale Tiptap attr (inline content and/or the old `image`) is interpreted exactly as a
stored document would be.

### 9.5 Verified

Rendered a real page through `renderActivity` (paragraph + display equation + heading + list with
inline math + graph figure) and drove it in the browser: popover opens on click, KaTeX and the
static graph SVG both render, the card scrolls at `max-height: 60vh`, the figure centers, Escape
closes and returns focus, the single-paragraph definition still works, and the `data-definition`
plain-text fallback flattens prose while skipping math and figures. Console clean.

The definitions sidecar is **unchanged at 1.9 KiB** and the base runtime **unchanged at 41.8 KiB** —
the `<template>` seam means block content costs the runtime nothing, as predicted in §1.

### 9.6 Slice 3 (print) — the appendix collects by a structural walk

The design said "a pure walk over the document." The build made that concrete and chose a
STRUCTURAL walk over the plain data rather than a typed per-block visitor, because a definition
mark rides any text node and text nodes live in far more places than the block list suggests:
blank hints, per-answer mistake feedback, MC prompts/choices/feedback/solutions, matching and
ordering sides, list items at any depth, callouts, worked and faded examples, math-block solutions,
graph prompts, and the reference panel. An exhaustive typed walker would be long AND would silently
miss the next block type somebody adds; the structural walk cannot, and costs nothing per new type.

Dedup is by term, case-insensitive, first occurrence wins — so two senses of one word collapse on
paper. That is what the reserved `glossaryKey` is for at Phase 4, and it beats printing "factor"
twice with no way to tell the entries apart. Order is alphabetical: an appendix is looked up, not
read through.

### 9.7 Slice 4 (editor) — the gate is `definitionShape.ts`

"Simple" is defined as an optional leading paragraph plus an optional trailing image — exactly what
the popover represents losslessly, and exactly what the legacy upgrades produce, so **no existing
definition turns read-only**. Order matters: an image BEFORE a paragraph is rejected, because
accepting it would silently reorder the author's content on the next save.

The popover keeps its one-image control as D7 promised, reading and writing that trailing block.
`DefinitionPopoverHost` mounts exactly ONE surface at a time, so there is never a second live
draft. The dialog does not register the `Definition` mark, which enforces non-recursion at the
editor level too.

A new `definitionSafe` slash-item flag drives the Insert menu. It is orthogonal to
`referenceSafe`/`referenceOnly`, and had to be: `graph_figure` is `referenceOnly` yet belongs in a
definition, while columns and callout are `referenceSafe` yet do not (D2/D3).

### 9.8 Slice 5 (import) — the fence is a third kind of side channel

`parseContentLines` is the shared grammar, extracted behaviour-preservingly from
`parseReferenceFence`. Two-pass resolution is done by pre-scanning markdown-it's **token list**
(not a second fence regex over the raw source) inside `tokensToBlocks`, so fence detection is
exactly what the real parse does.

The registry needed a new concept: `reference` routes blocks to `ImportResult.referencePanel`, but
`definitions` contributes blocks **nowhere** — its content reaches the document only inside a mark.
Hence `FenceSpec.definitions` + `probeTerm`, and a guard branch that appends a `[[term]]` reference
and looks for the blockType inside the resulting mark's content. The guard behaved as designed: it
failed the build until the prompt and the format doc taught the fence.

### 9.9 Still open

- **`publish-activity` redeploy** is required before a rich definition reaches a published page
  (renderer bundle changed). Queued in STATE.md.
- **Import cannot author a definition's image sizing or crop.** The fence accepts
  `![alt](url)`; width/align/crop stay editor-only, like everywhere else in the importer.
- **A term split across adjacent text nodes** (different marks on parts of it) yields one glossary
  entry per fragment. Niche; noted rather than solved.
