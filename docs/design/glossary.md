# Glossary — the popover, the search, and the store

**Status:** PROPOSED — author concept 2026-09-27; decisions **D1–D8 pending
per-item ruling**. No code before the green light (house rule).

Companion docs: [vocabulary-definitions.md](vocabulary-definitions.md) (the
shipped inline marks, the definitions fence, and the 2026-06-19
tenant-scoping ruling this arc extends), [floating-tool-cluster.md](floating-tool-cluster.md) +
[reference-panel-screen-surface.md](reference-panel-screen-surface.md) (the
student screen-surface rulings any new floating surface obeys).

## The author's concept (2026-09-27, verbatim intent)

A **popover**, replacing the current in-place expansion, with:

1. **Search** — a sidebar listing matches as the student types: title match
   first (priority), words inside the definition second; the default (no
   query) is every entry, alphabetical by title, scrollable.
2. **Cross-links** — any defined term referenced inside another definition
   hyperlinks to that definition.

## 1. Re-derivation against shipped reality (P10)

- **The mark is shipped and richer than its sketch:** `DefinitionMark`
  carries rich `content` (text + inline math) + optional `image`, and
  already reserves `glossaryKey` — the store seam has existed since
  2026-06-19 and costs this arc nothing to honor.
- **The current student rendering is a RULED behavior, not an accident:**
  InlineContent decision 3 — "definitions are a disclosure, not a link";
  the term is a `<button aria-expanded>` and the body renders in place.
  A popover AMENDS that ruling (D6), it does not fix a bug.
- **Print already has a glossary:** the paper surface renders a definitions
  appendix (`print/DefinitionGlossary.tsx`); this arc must not disturb it.
- **The importer already speaks the grammar:** `[[term :: definition]]`,
  the ```definitions fence for rich bodies, `[[term]]` short references —
  and the curriculum catalogue uses them today (12 marks across chain-1).
- **The tenant store is designed, not built:** `glossary_entry`
  (account-scoped, 2026-06-19 — deliberately NOT per-activity), resolution
  at publish vs runtime fetch left open in that doc.
- **The proven mirror pattern:** `pnpm import:batch` now mirrors the
  misconception registry into a platform table on every run — the exact
  shape an importer-fed glossary store would reuse.

## 2. Decisions for the author (yes/no each)

- **D1 — Two doors, one surface.** Tapping a defined term opens THE
  glossary popover pre-focused on that term (search sidebar present); a
  standalone **Glossary tool in the floating tool cluster** (third tool,
  beside the calculator and reference panel) opens the same popover
  unfocused at the default A→Z list. One component, two entries — and the
  cluster's existing summon/dismiss/one-open rulings come free.
- **D2 — v1 scope: the ACTIVITY's terms; the store arrives as an
  AUTHORING reuse pool, importer-fed.** The popover searches and browses
  the terms defined in the open activity's pinned document (plus its
  definitions fence). The `glossary_entry` store lands in the same arc but
  serves AUTHORING first: catalogue definitions are mirrored into it by
  `import:batch` (the misconception-mirror pattern), and a `[[term]]`
  short reference in any file resolves against the pool at import — write
  a definition once, reuse it across the catalogue. Students see the
  cross-ACTIVITY glossary later, when chains/courses give it a natural
  scope; "every term in the account" in a student's popover would surface
  vocabulary from unrelated or unpublished work. (This keeps the
  2026-06-19 option-(a) posture available: store resolution happens at
  import/publish time, so the student wire gains no new fetch.)
- **D3 — Cross-links are computed at import/save, not at render.**
  Whole-word, case-insensitive match of other defined terms inside a
  definition's content; FIRST occurrence per definition only (an
  over-linked paragraph is unreadable); never self-linking. Stored in the
  document (durable, printable as "see TERM"), rendered as in-popover
  navigation — never a page navigation.
- **D4 — Search ranking as authored:** title-prefix > title-substring >
  word-in-definition; no-query default is A→Z by title; matches
  highlighted in the result list; case/diacritic-insensitive; inline math
  in results renders (definitions carry `$math$`).
- **D5 — Layout:** ≥960px, a popover with list sidebar + detail pane (the
  author's sketch); <768px, a bottom sheet with list→detail push and a
  back affordance. 44px targets, `role="dialog"`, focus trap, Esc closes,
  focus returns to the term that opened it.
- **D6 — The disclosure ruling is formally amended:** the term stays a
  button (screen-reader semantics keep "this reveals content"), but
  activation opens the popover focused on that term instead of expanding
  in place. Print is untouched. The InlineContent header comment is
  amended in the same commit (P5).
- **D7 — Link-chains need a way back:** once D3 exists, a student three
  links deep needs Back — an in-popover history stack (Back button +
  keyboard), session-only. Without it, cross-links are a trap, not a
  feature.
- **D8 — The curriculum boundary ask waits for D2's ruling.** If the
  reuse pool is accepted, the ask to the curriculum side is: bless shared
  definitions as a catalogue-root artifact (authored or generated, their
  call — their three-files-one-grammar rule applies), consumed by
  `import:batch` into `glossary_entry`. Filed on the boundary page AFTER
  scope is ruled, not before.

## 3. Additional features noted (author asked; none assumed into scope)

- **A–Z index rail** beside the default list — one tap to a letter beats
  scrolling 100 terms.
- **Looked-up-terms analytics (future):** which terms students actually
  open is real formative signal (the vocabulary version of the
  misconception sensors). MUST ride the 0036 rollup pattern if built —
  never a hot-path counter (standing rule).
- **Recently-viewed terms** (session-local, localStorage — a per-viewer
  convenience, never synced state).
- **Read-aloud / pronunciation** on a term — high value for ESL students;
  future, needs its own a11y/audio pass.
- **Editor parity:** the teacher previews the same popover from the
  editor, so authored definitions are seen as students see them.

## 4. Explicitly out of scope for this arc

A teacher-facing glossary MANAGEMENT surface (the store's writer is the
importer in v1; an editing UI is its own slice); district/org-shared
glossaries (Phase 4 multi-tenancy, per the original doc); auto-suggesting
definitions while authoring (the old doc's future note, unchanged);
student-authored definitions.
