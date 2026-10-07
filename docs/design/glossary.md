<!-- /autoplan restore point: "/Users/user/.gstack/projects/ZanReed-activity-platform/main-autoplan-restore-20260927-213836.md" -->
## Implementation plan
# Glossary — the popover, the search, and the store

> ⚠ **STATUS ANNOTATION (drift audit 2026-10-07).** This arc **SHIPPED and is
> LIVE since 2026-09-28** (commits `8899bdd`..`92a0c3a`, migration 0043; the
> curriculum side's glossary imported). The status line below is the pre-build
> ruling state, left intact. The build record is in
> [HISTORY.md](../HISTORY.md) → "Glossary LIVE"; one shipped detail recorded
> there and not in this doc: students' reads key on the activity OWNER, not
> the version. No as-built-deltas section was written at ship time.

**Status:** ✅ RULED — D1, D3–D8 accepted as proposed; **D2 RE-RULED by the
author**; **D9 added by the author** (locale-variant capacity; both
2026-09-27, below). **/autoplan review APPROVED at the final gate
(2026-09-27)** — §5–§5d hold the review amendments and the "Final
Approval Gate" section near the end records the five gate rulings (UC1
render-time linkify replaces D3's stored links; L3 bake; T1 as ruled;
T2 "In this activity" group; D9 cross-list). The curriculum-side artifact
does not exist yet (live-probed), so the build is store-empty-tolerant.

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
  unfocused at the default A→Z list. One component, two entries. (**Corrected
  by review:** nothing "comes free" — floating-tool-cluster.md dropped the
  shared host (C2) and the calculator ships its own chrome; the glossary
  tool REUSES ToolCluster's conventions — summon hides while open, × /
  Escape close, focus returns to the opener — and builds its own dialog.
  Whether one-open is enforced across tools is ruled in the design phase.
  The tool is always available, gated only by §5 R5 — no per-activity
  toggle, so no new schema field.)
- **D2 — RE-RULED (author, 2026-09-27): the MASS glossary ships now, as a
  curriculum-side canonical artifact.** The original activity-scoped
  proposal assumed glossary authoring was expensive; the author's
  correction: the curriculum builder is an LLM, so the full course
  glossary is a SINGLE-SESSION artifact that then pays twice — as
  **context** (the builder authors every activity with the glossary in
  hand, keeping terminology logically consistent across all curriculum
  building) and as **another gate** (their CI can refuse a file whose
  `[[term]]` references don't resolve, exactly like the misconception and
  skill registries). Consequences, platform-side:
  - The glossary lives in the curriculum repo (format is THEIR call —
    registry-grammar or generated; their three-files-one-grammar rule
    governs). `import:batch` mirrors the WHOLE glossary into
    `glossary_entry` (the proven misconception-mirror pattern) and
    validates `[[term]]` short references against it, warning on any that
    don't resolve. (The "their CI can refuse" gate above is **superseded
    by D8's correction**: activity files are not in their repo, so the
    reference gate is this side's importer — §5 R2.)
  - The student popover's default A→Z list IS the full course glossary —
    the author's original feature 1, now safe because the pool is curated
    course vocabulary, not arbitrary teacher drafts.
  - An activity-local `[[term :: definition]]` still works and WINS over
    the store entry for that term within its own activity (the teacher's
    voice, locally), per the 2026-06-19 precedence note.
  - Viewer read path: the 2026-06-19 (a)-bake vs (b)-fetch choice resolves
    to **(b), via the store itself** — a course glossary browsable from
    every activity would go stale per-version under baking. Mechanism:
    **superseded by §5 R1 + R7** (the viewer has no owner id, so the read
    is an owner-resolving RPC over an owner-scoped table). No Edge
    Function, no hosted JSON.
- **D3 — Cross-links are computed at import/save, not at render.**
  Whole-word, case-insensitive match of other defined terms inside a
  definition's content; FIRST occurrence per definition only (an
  over-linked paragraph is unreadable); never self-linking. Stored in the
  document (durable, printable as "see TERM"), rendered as in-popover
  navigation — never a page navigation.
- **D4 — Search ranking as authored:** title-prefix > title-substring >
  word-in-definition; no-query default is A→Z by title; matches
  highlighted in the result list; case/diacritic-insensitive; inline math
  in results renders (definitions carry `$math$`). (**Amended by §5b
  GD-4:** terms are plain text by grammar and snippets are plain text, so
  no math renders in the list; a math span shows as "…".)
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
- **D8 — The curriculum boundary ask (SENT 2026-09-27; ACKED same day,
  with one reality correction absorbed):** build the course glossary as a
  canonical repo artifact in one session; use it as authoring context
  thereafter. Platform consumes via `import:batch` → `glossary_entry`.
  ⚠ **The gate split, corrected by the curriculum session:** activity
  `.md` files are NOT in their repo (local folder, no VCS), so their CI
  cannot check `[[term]]` references in activities — **the
  reference-resolution gate is THIS side's importer** (its
  unresolved-`[[term]]` warning; promote it to a `--strict` failure at
  the build, same as binding warnings), plus any pre-handover script
  their side runs. Their CI gates the glossary FILE itself: unique term
  identities, well-formed entries, retire-not-rename. Who-does-what,
  confirmed: definitions are authored curriculum content (builder +
  author write them); the repo side hosts the file, sets the format, adds
  the file checks; locale variants (D9) are in the format from v1.
  Platform constraints unchanged: term + rich definition body (the
  `[[term :: definition]]` alphabet — text + `$inline$` math), stable
  term identity, never-hand-edit-if-generated.

- **D9 — Locale-variant CAPACITY ships in the artifact (author,
  2026-09-27):** each entry may carry optional locale variants of its TERM
  (`gradient` → US `slope`; indices/exponents; trapezium/trapezoid), with
  one stable term identity — variants are display strings, never a second
  entry, so cross-links and `[[term]]` refs survive any display mode.
  **Search always matches variants regardless of display** (a US teacher
  typing "slope" finds "gradient" — this alone is most of the value).
  Definition BODIES stay single-variant (NZ, matching the curriculum): a
  body-text toggle would double the builder's consistency surface for
  little gain, and full content localization is its own future arc (the
  graph's D31 US-alignment arrays are the context for that day, not this
  one). DISPLAY fork deliberately open: v1 may cross-list both forms in
  the entry header ("gradient (US: slope)") with zero settings surface;
  the per-teacher TOGGLE lands when the first American teacher exists
  (the named-external-teacher trigger pattern). Data shape is identical
  either way.

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

## 5. Review amendments — CEO phase (autoplan, 2026-09-27)

- **R1 Owner-resolving read (CEO-F1).** `ServedActivity` carries no owner,
  so the viewer reads the store through ONE RPC,
  `glossary_for_activity(p_activity_id uuid)` — SECURITY DEFINER, pinned
  `search_path`, returning the activity owner's entries (active AND
  retired, with `retired_at`, so R8's keyed-mark resolution works). **Gate
  = EXACTLY the student read predicate that exists** —
  `get_published_activity`'s (0017): `auth.uid()` not null, activity not
  deleted, `status = 'published'`. No owner/draft branch: the viewer never
  serves drafts (get-activity-handler.ts: "draft content is unreachable
  here"), so there is nothing to preview. NOT `can_read_activity`: that helper is owner-only (0009) and
  is the Activity-Bank landmine. Consequence stated plainly: any
  signed-in user who can open a published activity can read its owner's
  whole glossary — acceptable because entries are course content, never
  student data. The table's one SELECT policy is owner-scoped (R7), so
  the RPC is the ONLY cross-owner read path. Read once per activity
  session and cached client-side; a failed read degrades to
  activity-local terms only — never an error screen, never a blocked
  worksheet — and is retried ONCE, on the next glossary open, then left
  local-only for the page load (a failure is not cached forever, and
  never hammered).
- **R2 Reference gate (CEO-F4).** The importer warns on EVERY `[[term]]`
  that resolves to neither an activity-local definition nor a store entry
  (not only in files that carry a ```definitions fence), naming file,
  term and — when one exists within edit distance 2 over terms and
  variants — the nearest store term; `--strict` fails the run on any.
  **Resolution source:** with `--glossary`, the FILE (it is canonical and
  about to be mirrored); without it, the live store's ACTIVE rows for
  `--owner` (read with the service connection the importer already
  uses), so a flag-less re-import never false-warns on a mirrored term; if
  the table is missing (0043 not applied), local definitions only — a
  printed notice, not a warning, unless `--glossary` was passed (then
  R8's strict rule applies). A
  reference that matches only a RETIRED entry is unresolved (warns) —
  retirement stops new references, it never breaks old marks.
- **R3 Loader seam + proposed format (CEO-F5).** The glossary file is read
  through one `loadGlossary(path)` function (`--glossary <file>`, sibling
  of `--registry`) with a checked-in fixture. The PROPOSED v1 format — the
  author sends it to the boundary page — is the existing ```definitions
  grammar plus optional `key:` (stable identity; defaults to the
  lower-cased term) and `us:` (D9 variant) header lines, so fence, file
  and builder share one grammar. **It is a proposal only** — D8 leaves
  the format to the curriculum side, and the build depends on nothing but
  the `loadGlossary` seam; if they choose otherwise, only the loader
  changes. Loader rules: `body` = the fence parser's `DefinitionBlock[]`
  (the schema type), re-validated with the schema on load and parsed
  (safeParse, bad entry dropped) on read in the viewer; an entry over 16
  KB serialized is skipped with a warning; a duplicate key (including two
  default keys from the same lower-cased term) keeps the first and warns;
  a variant equal to another entry's term or variant is a collision —
  warn, drop that variant. Every loader warning fails `--strict`.
- **R4 Import glossary report (E6 + CEO-F6).** Every run (dry or live)
  prints entries loaded (active / retired), variants, cross-link count
  (per L4), unresolved references, and every activity-local definition
  that shadows a store key, split IDENTICAL (safe to delete) vs DIVERGENT
  (override or drift). Report-only; local-wins stands.
- **R5 Empty index hides the tool (E7).** The glossary tool's summon
  renders nothing when the merged index (store ∪ activity-local) is
  empty (ACTIVE entries only — an all-retired store counts as empty).
  Loading: the summon appears immediately when the activity has
  local terms; otherwise it appears when the store read settles
  non-empty. No spinner (a floating summon causes no layout shift).
- **R6 Session cache.** "Once per activity session" = one in-memory read
  per `activityId` per page load, held by a `createGlossaryCache()`
  instance the student route creates once (tests make fresh instances, so
  "reload refetches" is testable); no TTL, no localStorage.
- **R7 The table (migration 0043).** `glossary_entry(owner_id uuid not
  null references users(id) on delete cascade, key text not null, term
  text not null, variants jsonb not null default '{}', body jsonb not
  null, retired_at timestamptz, updated_at timestamptz not null default
  now(), primary key (owner_id, key))`. RLS forced; ONE SELECT policy
  `to authenticated using (owner_id = auth.uid())` — the owner reads
  their own rows directly, everyone else reads only through R1's RPC, so
  "another owner's rows never returned" is true of the table AND the
  RPC. Writes: service role only (revoke/grant pair, 0042 §L pattern).
  `docs/compliance/data-map.md` + `retention-policy.md` gain the table in
  the same commit (owner_id is person-referencing;
  `data-map-coverage.test.mjs` enforces the first). A `verify-0043.sql`
  joins the verify runner. Ordering (OV-7): the migration is applied live
  BEFORE the viewer change is pushed.
- **R8 Mirror semantics.** The importer writes rows with `owner_id` = the
  resolved `--owner` user (explicit column; the service role has no
  `auth.uid()`), upsert on `(owner_id, key)` with
  `return=representation` (the 0042 empty-201 lesson). A key present in
  the store but absent from the file gets `retired_at = now()` — never
  deleted (retire-not-rename); a returning key clears it. Retired
  entries are excluded from the A→Z list and search but still resolve a
  mark that carries their key. A run WITHOUT `--glossary` leaves the
  store untouched. `--dry-run` computes and REPORTS the upsert and retire
  sets and writes nothing (the importer's existing dry-run promise). The
  mirror runs before activity writes, fail-soft on a
  missing table (the registry-mirror posture) EXCEPT under `--strict`,
  where a failed mirror fails the run (a strict run is the build gate);
  loud on any other error. Marks still resolve from the file when the
  mirror fails.
- **R9 Store-resolved mark shape.** A `[[term]]` with no local
  definition that matches a store term or variant (case-insensitive)
  becomes a `definition` mark carrying `glossaryKey` = the entry's key;
  the displayed text stays as authored. Its `content` is decided by L3
  (pending at the final gate — a BUILD PREREQUISITE): baked snapshot of
  the store body (L3 approved) or empty (L3 declined, which then needs
  its own print/offline answer). Local definitions never carry
  `glossaryKey`, so "local wins" is structural, not a lookup order.
- **R10 Cross-link placement is a BUILD PREREQUISITE (L4).** D3 as
  written stores links in the document, which store entries are not in;
  L4 is ruled at the final gate before any code.
- **R11 D9 display.** The display fork (cross-list vs per-teacher
  toggle) stays OPEN and is asked at the final gate; the data shape is
  identical either way. Recommended v1 if cross-list is chosen: list rows
  and the detail header show the canonical term with a secondary "US:
  slope" line. Either way, variant matches rank in the SAME tier as the
  term they belong to (a variant prefix = a title prefix). `variants` is
  a locale-keyed object of single display strings, e.g. `{"us":
  "slope"}`.
- **R15 Merged index rules.** The popover's index is store (active) ∪
  activity-local definitions. A local definition HIDES the store entry it
  matches (case-insensitive, on term or variant) within that activity —
  one row, the local one, never two. Opening a retired-key mark shows its
  entry in the detail pane with no list row selected (retired entries
  never enter the list or search). Layout 768–959px: the ≥960px popover
  at reduced width with a narrowed list column (design phase finalizes).
- **R16 Payload + perf budget.** Realistic course glossary: 100–300
  entries at ~1 KB of body each, ~100–300 KB JSON (~30–60 KB gz). The
  store read is DEFERRED past first paint (issued at idle after the
  worksheet renders, or immediately on the first term tap / tool open,
  whichever comes first) — never on the worksheet's critical path. The
  RPC returns at most 2,000 rows; the importer warns (and `--strict`
  fails) when a glossary's total serialized body exceeds 1 MB. List rows
  render the term (+ variant line) only — no body rendering in the list;
  definition-tier matches show a short plain-text snippet (R14 text)
  with the match highlighted. At ≤2,000 plain-text rows no virtualization
  is needed; the body renders (lazy `DefinitionBlocks`) only in the
  detail pane. The student-shell perf budget
  (`scripts/check-perf-budget.mjs`) must stay green: the popover chunk is
  lazy, like `DefinitionBlocks` today.
- **R12 Knock-on artifacts.** `docs/markdown-import-format.md` documents
  store resolution and the `--glossary` file; `catalogueAuthoringPrompt.ts`
  teaches that `[[term]]` may reference the course glossary without a
  local fence (then `pnpm prompt:catalogue`; the Notion stamp refresh is
  an author-approved write). The paste-markdown importer has no store:
  it stays local-only (the lookup is an optional ctx injection, absent
  there). The glossary lib (search, index merge, and linkify per L4) is
  pure, imports no graph-kit barrel, and is imported by the importer's
  node-bundled pipeline entry (so the batch importer's bundle build IS
  the barrel-rule check).
- **R14 Search text.** D4's "word-in-definition" tier searches a
  plain-text extraction of the body: text runs, list items, headings and
  image alt text; math (inline and display) and graph figures contribute
  nothing. Case- and diacritic-folded (NFKD, combining marks stripped).
- **R13 Acceptance tests per D-row.** D1: summon + term both open the
  same dialog (component test). D4: ranking tiers, diacritic/case
  folding, highlight (unit). D5: focus trap, Esc, focus return to the
  opener, bottom sheet under 768px (component + one e2e in the student
  lane). D6: the amended header comment lands in the same commit
  (review), AND print is untouched — a print-appendix test over a local
  mark, a store-resolved mark and a retired-key mark. D3 + D7 (per L4):
  linkify rules (first occurrence, whole word, no self) + back stack
  push/pop + keyboard Back (unit + component). D9: variant search hit +
  display per the gate's fork ruling (unit + component). R15: local
  hides matching store entry; retired-key open (unit + component). R16:
  read deferred past first paint (component: no RPC call before the
  worksheet renders; one call on first term tap), perf budget green.
- **R17 Build order, and why the live read stays.** Commits land in this
  order: (1) the pure glossary lib + the popover over ACTIVITY-LOCAL terms
  (complete and useful with no store — the half students feel); (2)
  migration 0043 + verify-0043 + compliance rows; (3) importer loader,
  resolver gate, mirror, report; (4) the viewer's store read. The live
  RPC (R1) stays even though baked marks (L3) cover print and offline:
  the browse list must reflect glossary edits without the author
  republishing every activity (publishing is an author action and clears
  the draft). Strategic value, stated so later work protects it: the
  reference gate (R2) and, later, lookup analytics (E5, deferred) are the
  defensible parts; a glossary popover alone is table stakes.

## 5b. Design rulings — design phase (autoplan, 2026-09-27)

Surface class: OPERATE (a student tool inside a worksheet). Every value
below is a `packages/viewer` token; no literals. The dialog is built new
(the floating tools share conventions, not a host).

- **GD-1 Placement and weight (C1; the modality question is the final
  gate's T1).** ≥960px: the dialog is ANCHORED to its opener — below a
  tapped term, flipping above when there is no room, so the term's own
  line stays visible; above the summon when opened from the tool. No
  scrim at ≥768px (the worksheet stays in view). Under 768px: a bottom
  sheet with a scrim. Until the gate rules T1, D5's focus trap stands
  (`aria-modal="true"`), with light dismiss (outside click closes) added.
- **GD-2 One navigation stack (C2).** The list is the root. EVERY detail
  navigation — a list pick, a search pick, a cross-link — pushes. Back
  pops one level and is hidden at the root. A term open seeds the stack
  `[list, term]`, so Back from it lands on the list. Typing a query never
  touches the stack; closing resets it. Back = a visible button in the
  detail header + `Alt+←`. `Escape` ALWAYS closes (D5) — never Back, and
  Backspace is never bound (it belongs to the search field).
- **GD-3 Opening state (H1).** From a term: search empty; the term's row
  selected and scrolled into view; focus on the detail heading
  (`tabindex="-1"`), so a screen reader reads the term, then the body;
  under 768px the sheet opens at HALF height straight to the detail, with
  a "Browse glossary" button that expands it to the full list. From the
  tool: focus in the search field, the A→Z list, no row selected, and the
  detail pane (≥768px) shows "Pick a word, or search." Under 768px the
  tool opens the list at full height.
- **GD-4 Math in the list (H2).** Terms are plain text by grammar (the
  `term:` line and `[[…]]` text carry no math), so list rows never render
  math. Definition-tier snippets are plain text (R14) and a math span
  shows as "…" — raw `$…$` source never reaches a student. (Amends D4's
  "inline math in results renders".)
- **GD-5 Late merge (H2b).** If the dialog opens before the store read
  settles, the list shows local rows plus one quiet footer row "Loading
  course glossary…". When the read lands, rows merge WITHOUT moving the
  selection or the scroll anchor. A failed read removes the footer
  silently (R1's degrade; no error text for a student).
- **GD-6 Search states (H3).** No match: "No words match “xyz”." plus
  "Did you mean <term>?" when one term or variant is within edit distance
  2 (the same pure function the importer uses). An `aria-live="polite"`
  count ("12 words"), debounced 300ms. Clearing the query restores the
  A→Z list at its previous scroll position.
- **GD-7 The term button after D6 (H4).** `aria-haspopup="dialog"` with
  `aria-expanded` bound to the dialog being open for THAT term;
  `aria-expanded` no longer means "expanded in place". List keyboard:
  ↑/↓ move a roving focus, Enter opens, Home/End jump. Tab order: search
  → list → detail. Focus returns to the ORIGINAL opener on close, however
  long the cross-link chain.
- **GD-8 Tools, size, summon (H5).** The glossary never closes the
  calculator or reference panel (they hold student state); it overlays
  them at `--z-popover` and gives focus back on close. Size ≥960px:
  width `min(44rem, 100vw − 2·--space-4)`, max-height 70vh, list column
  14rem, detail ≥22.5rem; 768–959px: list column 12.5rem, same rules;
  each pane scrolls independently and the search field is sticky. The
  summon is a text button "Glossary" in the existing `.tool-summon`
  style, in the bottom-LEFT corner stacked above the reference summon
  (reading tools left, the doing tool right); at 375px all three summons
  fit, two left and one right.
- **GD-9 Mobile keyboard (H6).** Focusing search expands the sheet to
  full height, sized with `dvh` / `visualViewport` so results sit above
  the on-screen keyboard. No drag gestures in v1 (the reference panel's
  no-drag precedent): × button, scrim tap and Escape close; the half →
  full expansion is the "Browse glossary" button.
- **GD-10 Cross-link look (M1; placement per UC1).** A cross-link is
  accent-coloured with a SOLID underline — distinct from the worksheet
  term's dotted underline — with the `--focus-ring` focus style. Inline
  links take WCAG 2.5.8's inline exemption from the 44px target rule,
  stated here deliberately.
- **GD-11 Retired entries (M2).** A retired entry is reachable only
  through a mark that carries its key; search never returns it. The
  dead end is deliberate (retirement means "stop using this word"), and
  no "retired" label is ever shown to a student.
- **GD-12 Local vs course bodies (M3).** A local body's cross-links reach
  store entries (the merged index). Whether local rows are grouped
  visibly is the final gate's T2.
- **GD-13 Variant hits (M4).** Whatever the D9 display ruling, a row
  matched through a variant shows its variant line with the highlight
  on it — a student always sees why a row matched.
- **GD-14 Highlight (M5).** `<mark>` with `--vw-color-accent-wash`
  background and inherited ink (both themes via tokens). Folded matches
  highlight the ORIGINAL characters (indices mapped through NFKD).
  Snippets are ~80 characters centred on the first match, with ellipses.
- **GD-15 Editor (M6).** No editor change in this arc (E4 deferred). With
  L3 baked, a store-resolved mark looks like any definition in the
  editor; file-backed activities are edited in their `.md`, never in the
  app (standing rule), so the teacher's check is the import report (R4).
- **GD-16 L3-declined fallback (M7).** If L3 is declined and a
  key-only mark is tapped with no store row available, the detail shows
  "This definition isn't available right now." — a gate criterion against
  declining L3.
- **GD-17 Session memory (M8).** The last query and list scroll persist
  in memory for the page load; the navigation stack resets on close.
- **GD-18 Motion and theme.** Open: 120ms opacity + 4px translate
  (ease-out), none under `prefers-reduced-motion`; close: fade only.
  Surfaces `--vw-color-overlay`, `--vw-shadow-window`,
  `--vw-radius-window`, lines `--vw-color-line-strong`; dark mode comes
  from the token layer, nothing theme-specific in the component.

**Interaction states (what the student SEES):**

    FEATURE        | LOADING                    | EMPTY                  | ERROR                   | SUCCESS                  | PARTIAL
    ---------------|----------------------------|------------------------|-------------------------|--------------------------|-------------------------
    summon         | hidden until local terms   | hidden (R5)            | local terms only         | "Glossary" text button   | —
                   | or store settles           |                        |                          |                          |
    term tap       | baked body shows at once   | n/a (a mark always has | baked body; L3-declined: | detail on the term,      | retired key: detail,
                   | (L3); list merges later    | its own body)          | GD-16 line               | row selected             | no row selected
    list           | local rows + "Loading      | —                      | footer vanishes          | A→Z, 44px rows           | local-only after failure
                   | course glossary…" footer   |                        | silently                 |                          |
    search         | —                          | "No words match …" +   | —                        | tiered results, <mark>,  | —
                   |                            | "Did you mean …?"      |                          | live count               |
    cross-link     | —                          | —                      | target missing → plain   | pushes onto the stack    | —
                   |                            |                        | text (never a dead link) |                          |

## 5c. Developer-experience rulings — DX phase (autoplan, 2026-09-27)

Three developers touch this arc: the author running `pnpm import:batch`,
the curriculum builder (an LLM + the author) writing the glossary file,
and a future session debugging "why is the glossary empty here".

- **W-1 A five-minute local hello world (F1).** A checked-in demo pair —
  `scripts/fixtures/glossary/glossary.fixture.md` (the R3 fixture) and a
  one-activity folder referencing two of its terms — with one documented
  command: `pnpm import:batch scripts/fixtures/glossary/demo --owner <local
  teacher> --glossary scripts/fixtures/glossary/glossary.fixture.md
  --dry-run`. The dry run prints the resolved marks and the report (R4)
  with no database write; the store read path's hello world is
  verify-0043, which seeds rows and calls the RPC as a student. Both are
  named in `docs/markdown-import-format.md`.
- **W-2 The proposed format, shown (F2, F5, F14).** Entry identity is an
  `id:` line — REQUIRED, never defaulted from the term (a spelling fix
  must not become a rename), and deliberately NOT `key:`, which already
  means an activity's `source_key` in the meta fence. Column name
  `term_id` (supersedes R7's `key`; the mark's field stays `glossaryKey`).
  An entry without `id:` is a loader error: skipped, and `--strict` fails.
  The doc carries this 3-entry example, which is also the fixture's head:

      ```definitions
      id: gradient
      term: gradient
      us: slope
      How steep a line is: the rise divided by the run.
      ---
      id: y-intercept
      term: y-intercept
      Where a graph crosses the $y$-axis, at $x = 0$.
      ---
      id: rate
      term: rate
      A comparison of two quantities with different units, such as
      $\frac{\text{km}}{\text{h}}$.
      ```

- **W-3 Locale keys are a closed set (F6).** v1 knows exactly one
  variant key, `us`. The loader warns on any other key (strict fails) —
  a new locale is a deliberate format change, not a typo that silently
  ships.
- **W-4 One strict rule for both mirrors (F3).** Under `--strict`, a
  failed mirror fails the run — the glossary mirror AND the existing
  misconception-registry mirror (a strict run is the build gate; a stale
  mirror is a correctness problem). Without `--strict`, both stay
  fail-soft and loud, exactly as the registry mirror is today.
- **W-5 Mass-retire guard (F7).** A live run that would retire more than
  25 entries OR more than 20% of the owner's active entries is refused
  before any write, printing the retire set, unless `--allow-mass-retire`
  is passed. The dry run always prints the full retire set.
- **W-6 Cause first (F8).** When `glossary_entry` does not exist, the
  importer prints ONE line — "glossary_entry is missing (migration 0043
  not applied) — N [[term]] references could not be checked against the
  store; apply 0043 or pass --glossary <file>." — and the per-reference
  warnings are reserved for runs that HAVE a resolution source.
- **W-7 Every loader message locates and fixes (F9).** Format:
  `<file>:<line> <id> — <problem>; <fix>`, e.g. "glossary.md:12 gradient
  — duplicate id (first at line 3); give one entry a different id:".
  The 16 KB, 1 MB and row caps use the same shape.
- **W-8 Suggestions that help (F10).** "Did you mean" scales with length:
  edit distance ≤1 for terms of 5 characters or fewer, ≤2 otherwise; no
  suggestion when two candidates tie. One pure function serves the
  importer (R2) and the viewer's no-match state (GD-6).
- **W-9 One row cap, shared (F11).** `GLOSSARY_MAX_ENTRIES = 2000` is one
  exported constant: the importer warns (strict fails) above it, and the
  RPC orders by `term` and applies the same cap, so any truncation is
  deterministic and never silent at import.
- **W-10 A developer signal for the silent student path (F12).** A failed
  or empty store read logs one `console.warn` naming its cause class
  (`rpc-error`, `not-published`, `no-rows`, `all-retired`, `capped`) with
  the activity id — never student data. The cache exposes `status` for
  tests and debugging.
- **W-11 `usage()` and labelled warnings (F4).** The help text documents
  `--glossary` and `--allow-mass-retire` (and gains the missing
  `--skills-registry` in its synopsis); glossary problems print in their
  own block, "glossary warnings (--strict: these FAIL the run)", beside
  the existing binding and catalogue blocks. A unit test asserts every
  flag `parseArgs` accepts appears in `usage()`.
- **W-12 A report sized to action (F13).** Counts always; unresolved
  references and DIVERGENT shadows listed in full (they need action);
  IDENTICAL shadows as a count, listed in full only on `--dry-run`.
- **W-13 An intentional literal (F15).** A backslash-escaped `\[[…]]`
  renders as literal brackets and is never resolved or warned about. The
  escape mechanism is verified against markdown-it's unescaping in the
  eng phase before it is documented.
- **W-14 "Resolve without mirroring" is the dry run (F16).** Documented:
  `--dry-run --glossary <file>` resolves every reference against the file
  and writes nothing. No new mode.

## 5d. Engineering rulings — eng phase (autoplan, 2026-09-27)

These are the build contract; where they differ from R/GD/W rows above,
the later row wins and says so.

- **EN-1 One jsonb, never a row set (H1).** `supabase/config.toml` sets no
  `[api] max_rows`, so the hosted PostgREST default of 1,000 applies to
  every read, set-returning RPCs included — a 2,000-row cap would
  truncate silently at 1,000. `glossary_for_activity` therefore returns
  ONE `jsonb` (`jsonb_agg(… order by term)`, capped at
  `GLOSSARY_MAX_ENTRIES` inside SQL). verify-0043 seeds 1,001+ entries
  and proves they all arrive.
- **EN-2 Mirroring is one atomic service RPC (L4/L5 + R8).**
  `sync_glossary_entries(p_owner uuid, p_entries jsonb, p_apply boolean)`
  — service_role only — upserts, retires (entries absent from
  `p_entries`), un-retires, stamps `updated_at`, and returns one jsonb
  `{upserted, retired[], unretired[], active_before}` in ONE
  transaction. `p_apply = false` computes the same answer and writes
  nothing (the dry run and the W-5 mass-retire guard both read it). No
  PostgREST upsert, no `in.(…)` URL of ids, no empty-201 trap.
  Supersedes R8's upsert mechanics; R8's semantics stand.
- **EN-3 One resolver (H3).** A single pure `resolveTerm(text, local,
  store)` decides every reference, in both the importer and the viewer:
  find the store entry whose term OR variant matches (case/diacritic
  folded); then, if ANY local definition — fence entry or inline
  `[[x :: y]]` — matches that entry's term or any variant, the LOCAL one
  wins; otherwise the store entry. The importer's pre-pass therefore
  collects inline `::` definitions too, not only fences. The
  `[[slope]]`-with-local-`gradient` case is a named unit test.
- **EN-4 The live body wins once it exists (M1).** The detail pane shows
  the store row for a `glossaryKey` as soon as the read settles; the
  baked body (L3) is shown only before the read settles, after a failed
  read, and on paper. One entry never shows two bodies in one session.
- **EN-5 Keyed marks stay tappable (M2).** A mark carrying `glossaryKey`
  stays a button even when its `content` is empty (GD-16's path). Print
  stays byte-for-byte untouched per the author: a store term reached by
  its term and by a variant prints as two appendix entries with one body
  — accepted, since a student looking up either word finds it.
- **EN-6 No keyboard chord for Back (M3).** `Alt+←` is browser history
  Back on Chromebooks and Windows and word-left in a macOS text field.
  Back is the visible, focusable button only. (Supersedes GD-2's
  `Alt+←`.)
- **EN-7 Focus with tools open (M4).** The calculator and reference
  panel are NON-modal (DECISIONS.md:193-195); the glossary's trap sits
  above them at `--z-popover` and restores focus to its opener on close.
  Component test: calculator open → term tap → glossary → Escape → focus
  on the term, calculator still open with its state.
- **EN-8 Store bodies skip the server sanitize — say so (M5).** Activity
  content passes get-activity's sanitize; RPC bodies do not. That is
  safe only because `DefinitionBlock` admits no blank tokens and no
  prompted math, and the only writer is the service-role importer. A
  loader test and a viewer safeParse test prove a body carrying a blank
  or a prompted `math_inline` is rejected, and the RPC's header comment
  names this dependency so a future `DefinitionBlock` widening re-reads
  it (P5).
- **EN-9 Where the code lives (M6).** The pure lib (`resolveTerm`,
  folding, search tiers, snippets, suggestions, merge, linkify per UC1,
  `GLOSSARY_MAX_ENTRIES`, the row/body parsers) is
  `packages/schema/src/glossary.ts`, exported from the schema barrel —
  already pure zod, already in both the node importer bundle and the
  viewer, so no new subpath and no graph-kit reach. The viewer gets a
  `GlossaryService` interface (`load(activityId)`), injected by the
  app's student route exactly as `httpCheckService` is; the RPC name is
  one exported constant the app and the e2e mock both import (P2).
- **EN-10 Idle scheduling (L1).** `requestIdleCallback` when present,
  else `setTimeout(…, 1500)` — Safari/iPadOS have no idle callback.
- **EN-11 The byte cap refuses on live runs (L2).** Over 1 MB of total
  body, a live run refuses the mirror (activities still import, marks
  still resolve from the file) and `--strict` fails; a dry run warns.
- **EN-12 Mass-retire threshold (L3).** Refused when retiring more than
  25 entries, OR more than 20% of active entries AND more than 5 — a
  four-entry store can still retire one. (Amends W-5.)
- **EN-13 Definer role (L6).** The RPCs are SECURITY DEFINER owned by the
  migration role (bypasses RLS, the house pattern); EXECUTE revoked from
  `public, anon` explicitly. verify-0043's "student gets a published
  activity's rows" row is mutation-tested once by removing the definer
  clause and watching it go red.
- **EN-14 The column is `term_id` everywhere (L7).** R3/R7/R8 wording
  that says `key`, `(owner_id, key)` or "optional `key:`" is superseded
  by W-2 at build time: `primary key (owner_id, term_id)`, required
  `id:`. The boundary-page proposal is the W-2 version.
- **EN-15 One message per unresolved reference (L8).** R2's warning
  replaces `makeDefinition`'s existing fence-only warning; there is never
  a second message for the same reference.
- **EN-16 The escaped literal needs a pre-pass (W-13).** markdown-it
  unescapes `\[` to `[` BEFORE `DEFINITION_SUB` runs on the text token,
  so `\[[x]]` would resolve like `[[x]]`. The escape is honoured the way
  `extractMath` honours `\$`: a raw-source pre-pass swaps `\[[` for a
  private sentinel and the emitter restores literal `[[`.
- **EN-17 The importer's options seam.** `MarkdownImporter` becomes
  `(markdown, options?: { glossary?: GlossaryIndex }) => ImportResult`;
  the paste importer passes nothing and behaves exactly as today (a
  regression test pins that).
- **EN-18 The mark carries the store's term text for print.** A
  store-resolved mark keeps the AUTHORED text as its display (R9); the
  baked `content` is the entry body — nothing else changes in the mark,
  so sanitize, the viewer-server bundle and `SANITIZER_REV` are
  untouched unless UC1 keeps D3's stored links (then EN-19 applies).
- **EN-19 If D3's stored links are kept (UC1 declined).** Storing links
  "in the document" needs a new non-recursive link mark inside
  `DefinitionBlock` text: a schema change, `pnpm bundle:viewer-server`
  in the same commit, a `SANITIZER_REV` bump, a `get-activity` redeploy
  (author action), and an orphan guard bound to rendered output,
  mutation-tested. Recorded here as the cost of keeping D3 as written.

<!-- autoplan-accepted:ceo -->
- R1: the viewer reads the store only through `glossary_for_activity(p_activity_id uuid)` (SECURITY DEFINER, pinned search_path, gated on EXACTLY the 0017 predicate — authenticated, not deleted, published; no owner/draft branch — never can_read_activity; returns the owner's active and retired entries with retired_at); the table's one SELECT policy is owner-scoped (R7); the read is once per activity session and cached; a failed read degrades to activity-local terms with no error screen and is retried once on the next glossary open. Verified by: verify-0043 rows (a student gets a published activity's owner rows; a draft or deleted activity yields none; anon denied; no other owner's rows ever returned) and viewer unit tests for the failed-read degrade and the single retry.
- R2: the importer warns on every `[[term]]` resolving to neither local nor store (fence-less files included), naming file, term and — within edit distance 2 over terms and variants — the nearest store term; `--strict` exits 1 on any; resolution source is the file with --glossary, else the owner's active store rows, else (table missing) local only; a retired-only match is unresolved; a missing table without --glossary is a notice, not a warning. Verified by: importer unit tests for fence-less unresolved, strict exit code measured without a pipe, and the no-glossary run.
- R3: one `loadGlossary(path)` seam behind `--glossary <file>`, a checked-in fixture, and the PROPOSED (proposal-only) v1 format (definitions grammar + optional `key:`/`us:` lines); sending the proposal is an author action. Loader rules per §5 R3 (schema-validated DefinitionBlock[] body, 16 KB cap, duplicate/default-key collision keeps first, variant collision drops the variant, every loader warning fails --strict). Verified by: loader unit tests over the fixture covering each rule.
- R4: every run prints the glossary report (entries active/retired, variants, cross-link count, unresolved refs, shadowing split IDENTICAL/DIVERGENT); report-only. Verified by: importer test asserting each line over a fixture that exercises every category.
- R5: the glossary summon renders nothing when the merged index has no ACTIVE entries; it appears immediately with local terms, else when the store read settles non-empty; no spinner. Verified by: viewer component test (empty store + no local defs → no summon; one local def → summon).
- R6: one in-memory store read per activityId per page load via a createGlossaryCache() instance; no TTL, no localStorage. Verified by: viewer unit test (two opens on one instance → one fetch; a fresh instance → refetch).
- R7: migration 0043 creates glossary_entry exactly as §5 R7 lists (owner_id FK cascade, key, term, variants, body, retired_at, updated_at, pk (owner_id,key)); RLS forced; one SELECT policy `to authenticated using (owner_id = auth.uid())`; service-role writes only; data-map + retention-policy updated in the same commit; verify-0043.sql registered; migration applied live before the viewer push. Verified by: verify-0043 rows (owner reads own; other teacher reads none via table; student reads none via table; anon denied; client insert/update/delete denied) and data-map-coverage.test.mjs green.
- R8: mirror writes owner_id = resolved --owner, upserts on (owner_id,key) with return=representation, retires (never deletes) keys absent from the file and un-retires returning keys, leaves the store untouched without --glossary, reports but writes nothing under --dry-run, runs before activity writes, fail-soft on missing table except under --strict (fails), loud otherwise, marks still resolving from the file; retired entries resolve existing keyed marks but are excluded from list and search. Verified by: importer unit tests over a fake db (upsert payload, retire set, un-retire, no-flag no-op) and a viewer unit test (retired excluded from list, still resolves a keyed mark).
- R9: a store-resolved `[[term]]` becomes a definition mark with glossaryKey = key and the authored display text; local definitions never carry glossaryKey; content per the L3 ruling. Verified by: markdownToTiptap unit tests (local wins, store by term, store by variant, unresolved literal).
- R10: L4 is ruled at the final gate before any code touches cross-links.
- R11: the D9 display fork is asked at the final gate (cross-list recommended for v1); a variant match ranks in the tier of its term either way; `variants` is a locale-keyed object of display strings ({"us":"slope"}). Verified by: search unit test + component test per the fork ruling.
- R15: the merged index is active store ∪ local; a local definition hides the store entry it matches on term or variant (one row); a retired-key mark opens its entry with no list row selected; 768–959px uses the popover layout narrowed. Verified by: index-merge unit test + component test.
- R16: the store read is deferred past first paint (idle, or first term tap / tool open); RPC capped at 2,000 rows; importer warns (strict fails) above 1 MB total body; list rows render term + variant only, definition-tier matches show a plain-text highlighted snippet; bodies render lazily in the detail pane only; the student-shell perf budget stays green. Verified by: component test (no RPC before worksheet render; one on first tap), importer size-cap test, check-perf-budget green.
- R12: markdown-import-format.md and catalogueAuthoringPrompt.ts (+ regenerated doc) updated; paste importer stays local-only; the glossary lib imports no graph-kit barrel and is imported by the importer's node-bundled pipeline entry. Verified by: catalogueAuthoringPrompt drift test, the batch importer's bundle build, and the export-reachability test.
- R13: acceptance tests per D-row as listed in §5 R13 (D1 same dialog, D4 ranking/folding/highlight, D5 trap/Esc/focus-return/bottom-sheet + one student-lane e2e, D6 header amendment in the same commit + print-appendix test over local/store/retired marks, D3+D7 per L4, D9 variant search + cross-list).
- R14: D4's definition-word tier searches text runs, list items, headings and image alt (no math, no figures), NFKD case/diacritic folded. Verified by: search unit tests (math-only body never matches; accented query matches).
- D1 corrected: the glossary tool reuses ToolCluster conventions and builds its own dialog; one-open is a design-phase ruling; always available (R5 gate only), no per-activity toggle. D2's "their CI refuses" gate superseded by D8's correction.
- R17: commits land in order (1) pure lib + popover over activity-local terms, (2) migration 0043 + verify-0043 + compliance rows, (3) importer loader/resolver/mirror/report, (4) viewer store read; the live RPC stays because the browse list must reflect glossary edits without republishing. Verified by: commit order in git log; commit (1) passes its own tests with no store present.
- D2's read-mechanism paragraph is superseded by R1 + R7.
- D1–D9 are otherwise preserved unchanged; pending rows L3, UC1 (L4), T1, T2 and the D9 display fork are build prerequisites ruled at the final gate.
<!-- /autoplan-accepted:ceo -->

<!-- autoplan-accepted:design -->
- GD-1…GD-18 (§5b) are accepted plan requirements: opener-anchored dialog at ≥960px with no scrim at ≥768px, bottom sheet + scrim under 768px, D5's trap kept pending T1 with light dismiss added; one navigation stack (list root, every detail navigation pushes, term open seeds [list, term], Back button + Alt+←, Escape always closes, Backspace never bound, stack resets on close); the per-door opening state (term → detail heading focused, row selected, half-height sheet with "Browse glossary"; tool → search focused, A→Z, "Pick a word, or search."); plain-text list rows and snippets with math shown as "…"; late-merge footer that never moves selection or scroll and vanishes silently on failure; no-match text + "Did you mean" (edit distance ≤2) + debounced polite live count + scroll-restoring clear; aria-haspopup="dialog" + aria-expanded, roving ↑/↓/Enter/Home/End, search → list → detail tab order, focus return to the original opener; overlay at --z-popover without closing other tools; the stated sizes per breakpoint with independent pane scroll and sticky search; "Glossary" text summon bottom-left above the reference summon; full-height sheet on search focus via dvh/visualViewport, no drag; solid-underline accent cross-links with the inline 44px exemption; retired entries search-invisible with no student-facing label; local bodies link into the merged index; variant hits always show the variant line highlighted; <mark> on accent-wash with original-character highlighting and ~80-char snippets; no editor change; the GD-16 L3-declined line; in-memory query/scroll per page load; GD-18 motion + token-only theming. Verified by: component tests for each door's opening state, the stack (push/pop/seed/reset, Alt+←, Escape closes), late merge (selection/scroll unchanged), no-match + live count, aria attributes, focus return after a 3-link chain, variant-hit display, highlight index mapping (unit), reduced motion; one student-lane e2e at 375px (term tap → half sheet → Browse → search keyboard → Escape → focus on the term); tokens guard green with the new CSS.
- D4 amended: no math renders in list rows or snippets (GD-4).
- All CEO accepted requirements (R1–R17) are preserved unchanged; T1 now carries three options for the gate.
<!-- /autoplan-accepted:design -->

<!-- autoplan-accepted:dx -->
- W-1…W-14 (§5c) are accepted plan requirements: a checked-in glossary fixture + one-activity demo folder with a documented dry-run hello-world command, and verify-0043 as the store read's hello world; a REQUIRED `id:` line per glossary entry (never defaulted; missing id = loader error, strict fails), DB column `term_id` (supersedes R7's `key` and R3's default-key rule; the mark field stays glossaryKey), and the 3-entry example in the docs = the fixture's head; a closed locale-key set {us} with a warning (strict fails) on any other key; under --strict a failed mirror fails the run for BOTH the glossary and the misconception-registry mirror, fail-soft and loud otherwise; a live run retiring more than 25 entries or more than 20% of active entries is refused (retire set printed) unless --allow-mass-retire; a single cause-first line when glossary_entry is missing; loader/caps messages formatted `<file>:<line> <id> — <problem>; <fix>`; length-scaled suggestions (≤1 for ≤5 chars, ≤2 otherwise, none on ties) in one pure function shared by the importer and the viewer; one exported GLOSSARY_MAX_ENTRIES = 2000 used by the importer (warn / strict fail) and the RPC (ordered by term, capped); a console.warn cause class on a failed/empty store read plus cache status; usage() documents --glossary/--allow-mass-retire/--skills-registry with a flag-to-usage parity test and a labelled "glossary warnings" block; the report prints counts, full unresolved and DIVERGENT lists, IDENTICAL as a count (full list on --dry-run); a backslash-escaped `\[[…]]` stays literal and unwarned (mechanism verified in eng before documenting); `--dry-run --glossary` documented as resolve-without-mirroring. Verified by: importer unit tests for each rule (missing id, unknown locale key, duplicate id location format, mass-retire refusal + override, missing-table single line, strict exit for both mirrors measured without a pipe, suggestion thresholds incl. ties, row cap, usage parity, report shape on dry vs live, escaped literal), a viewer unit test for the console cause class + cache status, and the documented fixture command run once by hand.
- All CEO and Design accepted requirements are preserved except where W-2 supersedes R7's column name (key → term_id) and R3's defaulted key (→ required id:), stated here.
<!-- /autoplan-accepted:dx -->

<!-- autoplan-accepted:eng -->
- EN-1…EN-19 (§5d) are accepted plan requirements: glossary_for_activity returns ONE jsonb (jsonb_agg ordered by term, capped at GLOSSARY_MAX_ENTRIES in SQL) and verify-0043 proves 1,001+ entries all arrive; mirroring is one atomic service_role RPC sync_glossary_entries(p_owner, p_entries, p_apply) returning {upserted, retired[], unretired[], active_before} with p_apply=false writing nothing and stamping updated_at; one pure resolveTerm (store by term or variant, then local fence OR inline definition matching that entry's term or any variant wins) used by importer and viewer, with the slope/gradient case tested; the detail pane shows the live store body once the read settles (baked body only before, on failure, and on paper); a glossaryKey mark stays a button with empty content; print stays byte-identical (a term and its variant may print as two entries); no Back keyboard chord (visible button only; supersedes GD-2's Alt+←); glossary trap over the non-modal tools with focus restored to the opener (component test with the calculator open); store bodies bypass sanitize and a loader + viewer safeParse test proves a blank/prompted-math body is rejected, noted in the RPC header; the pure lib lives in packages/schema/src/glossary.ts exported from the schema barrel, the viewer takes an injected GlossaryService, and the RPC name is one exported constant shared by the app and the e2e mock; requestIdleCallback with a setTimeout(1500) fallback; the 1 MB body cap refuses the mirror on live runs and fails --strict; mass-retire refused above 25, or above 20% AND 5 (amends W-5); SECURITY DEFINER RPCs with EXECUTE revoked from public/anon and the student-read verify row mutation-tested once; `term_id` / required `id:` everywhere at build (EN-14); R2's warning replaces the old fence-only warning; the `\[[` escape via a raw-source pre-pass modelled on extractMath; MarkdownImporter gains an optional { glossary } options argument with the paste path unchanged; if UC1 is declined, the stored-link mark chain (schema, bundle, SANITIZER_REV, get-activity redeploy, orphan guard) is added to the build. Verified by: the 41-path test diagram in the eng record, including the three CRITICAL regression rows (paste importer unchanged without options; print appendix byte-identical for local-only documents; local-definition tap with an empty store).
- All CEO, Design and DX accepted requirements are preserved except where EN rows state a supersession (GD-2's Alt+←, W-5's threshold, R8's upsert mechanics, the `key` wording per EN-14).
<!-- /autoplan-accepted:eng -->
## Review record

### /autoplan Phase 1 (CEO) — Step 0 (2026-09-27)

**Mode: SELECTIVE EXPANSION** (autoplan override). UI scope YES (popover,
sidebar, dialog, bottom sheet, layout — 6+ refs). DX scope YES
(tool-detected: `import` ×4; the importer CLI + the curriculum builder's
file contract are developer surfaces).

**Pre-review audit (live probes, 2026-09-27):** CI green on `main` (last
completed run 36305354170 success; f4c3c82 in progress). Branch `main`,
clean tree. **The curriculum glossary artifact does NOT exist yet** —
`gh api repos/ZanReed/curriculum/git/trees/main` lists only the four
registries + `channel/boundary-channel.md`, and that channel file carries
no glossary entry (the D8 ack lives on the Notion boundary page, not in
the repo). So the importer's INPUT FORMAT is unknown today; the build must
not guess one silently. The catalogue pilot's 4 files carry **18 definitions-fence
entries for ~8 distinct terms** ("unit rate",
"proportional relationship", "constant of proportionality" are each
defined 3–4 times, once per file) — the exact redundancy + drift risk the
mass glossary exists to remove.

**0A Premise.** Real problem: a student meeting a term has only the one
in-place disclosure the author happened to mark in THIS activity, and the
course's vocabulary is authored N times, per file, with nothing holding
the copies consistent. Target outcome: one curated course glossary,
reachable from every activity (tap a term, or open the tool), searchable,
cross-linked, with the builder writing against it. The plan attacks this
directly (store + popover + gate), not a proxy. Do-nothing cost: ~150
planned files × ~5 local definitions each = ~750 hand-copied definitions
drifting apart, and no way for a student to look up a word the page didn't
mark. Premises D1–D9 are author-ruled and honored as settled; the review
challenges only where shipped reality contradicts a mechanism (below).

**0B Existing leverage** (every sub-problem maps to shipped code):

| Sub-problem | Existing code | Reuse |
|---|---|---|
| Glossary file grammar | `parseDefinitionsFence` (markdownToTiptap.ts:~2857) — `term:` headed, `---` separated, reference-sheet line grammar | **Reuse as the proposed v1 file format** (+ `key:`/variant header lines) — one grammar for fence, file and builder |
| `[[term]]` resolution | `makeDefinition` (markdownToTiptap.ts:~1215) + `ctx.definitions` pre-pass | Add a glossary lookup AFTER the local map (local wins) |
| Unresolved-ref warning | same function; fires only when `ctx.definitions.size > 0` | Widen to "no local AND no store"; `--strict` promotes |
| Store mirror | `syncMisconceptionRegistry` (batch-import.mjs:1856) — `return=representation`, fail-soft, echo-count | Same shape: `syncGlossary` |
| Store RLS posture | `misconception_registry` (0042 §C): one SELECT `to authenticated`, service-role writes, revoke/grant pair | Same, plus `owner_id` (2026-06-19 tenant ruling) |
| Rich body rendering | `DefinitionBlocks` (print/DefinitionGlossary.tsx), lazy in InlineContent | Popover detail pane renders through it |
| Collect a doc's local terms | `collectDefinitions` (print/definitions.ts) — structural walk, dedup by term | Builds the activity-local half of the merged index |
| Floating-tool lifecycle | `ToolCluster.tsx` (summon/pending/failed, focus return) + `ReferencePanelTool.tsx` | D1's third tool rides the same conventions |
| Mark shape | `DefinitionMark.glossaryKey` (schema inline.ts:339) — round-trips editor + serializer already | No schema change needed |

**0C Dream state.**
```
CURRENT                         THIS PLAN                          12-MONTH IDEAL
per-file fences, in-place  -->  course glossary mirrored per   -->  builder authors against the
disclosure, 18 copies of        owner; tap/tool → searchable        glossary; activities carry
~8 terms, no lookup of          cross-linked popover; [[term]]      only [[term]] refs; teacher
unmarked words                  gated at import (--strict)          overrides visible; US display
                                                                    toggle; lookup analytics
                                                                    (0036 rollup) feed formative
                                                                    signal
```
The plan moves directly toward the ideal; nothing in it has to be undone
to reach it.

**Landscape (L1/L2/L3), in-distribution knowledge (no web search run —
the problem is internal-architecture shaped):** L1: glossary lookups in
learning platforms are popovers/side panels with search; cross-links are
standard in reference works. L3: the unusual, correct move here is making
the glossary an AUTHORING INPUT (D2) — the consistency win lands in the
activities, not just the popover. No eureka.

**Findings from Step 0 (drive the ledger):**

- **CEO-F1 (CRITICAL, architecture) — the viewer cannot name whose
  glossary to read.** `ServedActivity` (viewer/client/readClient.ts:58)
  carries `activityId/versionId/title/document` — no owner. A
  tenant-scoped store (`owner_id`) read with a plain `.from()` needs an
  owner id the student surface never has. Remedy: one RPC
  `glossary_for_activity(p_activity_id)` — SECURITY DEFINER, pinned
  `search_path`, gated on `can_read_activity` (glossary content is
  public course text, so a future widening of that helper leaks nothing
  sensitive — the Activity-Bank landmine does not apply), returning the
  owner's entries. The one authenticated SELECT policy stays (editor,
  tooling, verify). Mechanical (P5: explicit; no other correct shape).
- **CEO-F2 (CRITICAL, silent loss) — store-only marks vanish from print
  and offline.** `collectDefinitions` keeps a mark only when its
  `content` is non-empty, and the service worker caches the get-activity
  read path, not PostgREST. A `[[term]]` that resolves to the store as a
  `glossaryKey`-only mark would silently drop out of the printed appendix
  and show nothing offline. Remedy: the importer **bakes a snapshot** of
  the store body into the mark's `content` alongside `glossaryKey`; the
  viewer prefers the LIVE store entry by key and falls back to the baked
  copy. D2's (b) stays the read path; baking is the fallback only. Print
  stays byte-for-byte untouched. TASTE (amends D2's mechanism, not its
  intent).
- **CEO-F3 (feasibility) — D3 "computed at import, not render" cannot
  place a link.** Import can decide WHICH terms a body links to, but
  placing the anchor needs either stored text offsets or a body rewrite
  with a new mark type — and the definition schema's text runs admit only
  `SimpleMark` (a new mark = schema change + sanitize + both bundles +
  editor round-trip: the orphan-risk class). Worse, the correct link set
  depends on the MERGED index (activity-local overrides + store), which
  exists only at view time. Remedy: ONE pure `linkify(body, index,
  selfKey)` (whole-word, case-insensitive, first occurrence, never
  self), run at popover-render time over the merged index and memoized;
  the importer runs the SAME function in its dry-run report (counts +
  dangling-target check). **Candidate USER CHALLENGE** (changes a ruled
  mechanism) — pending the voices.
- **CEO-F4 (gate) — the unresolved warning is narrower than D8 assumes.**
  It fires only when the file has a ```definitions fence
  (`ctx.definitions.size > 0`); a `[[term]]` in a fence-less file stays
  literal SILENTLY. Remedy: warn whenever a reference resolves to neither
  local nor store; `--strict` fails; the warning names file + term + the
  nearest store term (edit distance) so the fix is one keystroke.
  Mechanical.
- **CEO-F5 (boundary) — the input format is unknown and must not be
  guessed silently.** Remedy: a single `loadGlossary(path)` seam in the
  importer, a checked-in fixture, and a PROPOSED v1 format = the existing
  definitions-fence grammar plus optional `key:` and `us:` header lines (the
  builder already writes that grammar in every activity; their
  three-files-one-grammar rule is satisfied for free). Sending the
  proposal to the boundary page is an author action (gate item). Format
  is still THEIR call — if they choose otherwise, only the loader changes.
- **CEO-F6 (consistency) — local-wins keeps the 18 per-file copies
  shadowing the store forever.** Nothing tells the builder that a local
  fence now duplicates (or contradicts) a glossary entry. Remedy: the
  import report lists every local definition that shadows a store key,
  split into IDENTICAL (safe to delete) and DIVERGENT (a real override or
  drift). Report-only, never a failure — local-wins is ruled. Accepted as
  part of E6.

**0G cherry-pick dispositions (auto-decided; author's §3 said "none
assumed into scope", so their five stay deferred unless P2 is
unambiguous):**

| # | Proposal | Effort | Decision | Principle/why |
|---|---|---|---|---|
| E1 | A–Z index rail | S | **DEFERRED → TODOS** | Search already filters by one keystroke; author said none assumed; revisit at ~200 terms |
| E2 | Recently-viewed terms (localStorage) | S | **DEFERRED → TODOS** | Per-viewer convenience, no evidence of need yet |
| E3 | Read-aloud / pronunciation | M | **DEFERRED → TODOS** | Needs its own a11y/audio pass (§3 says so) |
| E4 | Editor parity (teacher previews the popover) | M | **DEFERRED → TODOS** | Editor hosts no viewer surface today; own slice |
| E5 | Looked-up-terms analytics | M | **DEFERRED → TODOS** | Must ride the 0036 rollup pattern; post-launch |
| E6 | Import glossary report: entries, variants, cross-link count, dangling links, unresolved refs, shadowing (F6) | S | **ACCEPTED** | P2: in blast radius (importer), <1d, and it is the observability for the gate D8 makes ours |
| E7 | Glossary-tool summon hidden when the merged index is empty | S | **ACCEPTED** | P1: an empty tool is a dead end; store-empty + no local defs is the launch state for most activities |

**Decision ledger (six-column, continued through the phases):**

| ID/owner | Contract & evidence | Current | Proposed | Status | Approval/scope |
|---|---|---|---|---|---|
| L1/plan | D1–D9 author-ruled 2026-09-27 | as doc | — | approved | author rulings, all items |
| L2/CEO-F1 | viewer lacks owner id (readClient.ts:58) | direct table read | `glossary_for_activity` RPC | approved | autoplan P5 mechanical |
| L3/CEO-F2 | print/offline drop key-only marks (definitions.ts) | key-only mark | key + baked snapshot, live-first | pending → gate | TASTE |
| L4/CEO-F3 | D3 placement infeasible at import | import-stored | one render-time `linkify`, import reports | pending → gate | candidate USER CHALLENGE |
| L5/CEO-F4 | warning gated on fence presence | fence-only | any unresolved ref; strict fails | approved | autoplan P1 mechanical |
| L6/CEO-F5 | artifact absent (live probe) | unspecified | loader seam + fixture + proposed format | approved (letter = author) | autoplan P5; letter at gate |
| L7/E6+F6 | no glossary observability | none | import report incl. shadowing | approved | autoplan P2 |
| L8/E7 | empty tool dead end | always shown | hidden when index empty | approved | autoplan P1 |
| L9/E1–E5 | author §3 "none assumed" | out | TODOS | deferred | autoplan P3, author direction |

**Ledger continuation (after the spec loop and the CEO voice):**

| ID/owner | Contract & evidence | Current | Proposed | Status | Approval/scope |
|---|---|---|---|---|---|
| L4→UC1/D3 | primary CEO-F3 + native F7 agree: placement infeasible at import, wrong for the merged index | D3 import-stored | one pure render-time `linkify` | USER CHALLENGE → gate | never auto-decided |
| L10/T1 | native F2: popover taxes the mid-sentence lookup | D6 popover | keep disclosure, tool = only popover door | TASTE → gate (primary: keep D6 + partial-height sheet) | author ruling stands meanwhile |
| L11/T2 | native F4: whole-course list from activity 1 | full A→Z default | pinned "In this activity" group above full A→Z | TASTE → gate | author ruling stands meanwhile |
| L12/F1 | native F1 phase split vs author's store-empty-tolerant ruling | one arc | build ORDER: lib + popover over local terms first (R17) | approved (order only) | autoplan P6; split rejected (author direction) |
| L13/F5 | co-ownership may fragment an owner-keyed store | owner-keyed | `scope_id` hedge | rejected → TODOS input | house YAGNI rule (P4/P5) |
| L14/D9 | display fork left open by the author | open | cross-list recommended | pending → gate | author's own fork |

### 0H spec-review loop result
3 launches (cap): 5/10 → 6/10 → 6/10. 41 issues found, 30 reviewer-confirmed
fixed; the 11 from launch 3 were applied after the cap (R1 = exactly the
0017 predicate — my first draft invented an owner/draft branch the RPC does
not have; R15 merged-index rules; R16 payload/perf budget; dry-run writes
nothing; failed-read single retry; variants shape; D9 display fork back to
the gate) and are **not reviewer-confirmed** — the eng phase re-checks them.
Launch 2's catch deserves recording: `can_read_activity` is OWNER-ONLY
(0009:157), so the first R1 would have returned nothing to every student and
degraded silently to local terms — the vacuous-green class this repo keeps
paying for. Metrics persisted (spec-review.jsonl). Document approval:
auto-decided **A** (both documents carry the exact decisions).

### 0I Temporal interrogation
- **HOUR 1 (foundations):** the implementer needs R7's column list, R1's
  exact predicate (0017's, not `can_read_activity`), the proposed file
  format (R3) and a fixture — and the knowledge that the artifact does not
  exist, so every store path is exercised by the fixture only.
- **HOUR 2–3 (core logic):** they will hit (a) where the store lookup enters
  `makeDefinition` (an optional ctx seam; the paste importer passes none),
  (b) the three resolution sources (R2), (c) merged-index hiding (R15).
- **HOUR 4–5 (integration):** surprises — the student route has no owner id
  (R1), the SW does not cache PostgREST (hence L3), the deferred read vs
  R5's summon visibility (R16), and one-open between three floating tools.
- **HOUR 6+ (polish/tests):** they will wish they had built the pure lib
  first with its unit tests (search tiers, folding, merge, linkify), and
  mutation-tested R2's strict exit and R1's predicate the day they landed.
- Effort: human ~6–8 days / CC ~1 day of focused build across 4 commits.
- Pending, deliberately (owners named): L3, UC1, T1, T2, D9 fork — final
  gate; one-open across tools, 768–959px detail — design phase; RPC shape
  and verify matrix — eng phase.

### CEO dual voices — consensus and integration

    CEO DUAL VOICES — CONSENSUS TABLE:
      Dimension                              Claude(native)   Codex  Consensus
      1. Premises valid?                     FLAGGED (F2,F3)  —      N/A
      2. Right problem to solve?             YES, sequencing  —      N/A
      3. Scope calibration correct?          OVER (F1,F8)     —      N/A
      4. Alternatives sufficiently explored? NO (F2,F6)       —      N/A
      5. Competitive/market risks covered?   PARTIAL (F9)     —      N/A
      6. 6-month trajectory sound?           COND. (F5)       —      N/A
    Outside coverage UNAVAILABLE (Codex not installed) [single-model]; all
    consensus cells N/A, never CONFIRMED. The native voice is an independent
    fresh-context Claude reviewer; its findings integrate as native findings.

**Finding integration (native voice, 10 findings):**

- **F7 → USER CHALLENGE UC1 (primary CEO-F3 + native F7 agree):** replace
  D3's "computed at import, stored in the document" with ONE pure
  render-time `linkify` (detail pane only; the print appendix may call the
  same function later). Both reviews independently found import-time
  placement infeasible for store entries and wrong for the merged index.
  Never auto-decided; the author's D3 stands unless changed at the gate.
- **F6 → strengthens L3 (TASTE):** recommend bake. The native voice asked
  whether a live RPC is still needed once marks carry bodies; it is — the
  browse list must reflect glossary edits without the author republishing
  every activity (publishing is an author action here, and a publish clears
  the draft). R1's reason is stated explicitly (R17).
- **F2 → TASTE T1 (native only; primary disagrees):** keep the in-place
  disclosure for a term tap and make the tool the only door to the full
  popover. Primary recommends KEEPING D6 (the author's own concept) with a
  design mitigation: under 768px the sheet opens at partial height straight
  to the definition, so the sentence stays visible (design phase owns it).
- **F4 → TASTE T2 (native only):** relevance-scoped default list. Primary
  recommends a pinned "In this activity" group ABOVE the author's full A→Z
  list (hides nothing, honors the ruled default) over replacing the default.
- **F1 → build ORDER adopted, phase SPLIT not adopted:** the author already
  ruled "build store-empty-tolerant"; the split would contradict that. What
  IS adopted: the pure lib + popover over activity-local terms land FIRST,
  so the student-facing half is complete even if the store half waits (R17).
- **F5 → REJECTED hedge, recorded as a co-ownership input:** a speculative
  `scope_id` column breaks "Don't add fields to the schema speculatively";
  the owner-keyed table is the 2026-06-19 ruling and is re-keyable when the
  co-ownership arc has its own design pass (0042 set that precedent for its
  owner predicate). TODOS entry at close.
- **F3 → boundary note, not platform scope:** review cost (not drafting
  cost) is the glossary's real budget, curriculum-side; carried in the
  proposed-format letter (an author action at the gate).
- **F8 → noted for the author, not re-litigated:** the author chose to build
  this now; the build order (R17) limits the bet while usage is 1 student.
- **F9 → doc note (R17):** the defensible value is the reference gate (R2)
  and, later, lookup analytics (E5, deferred) — nothing here forecloses it.
- **F10 → folded into the D9 fork at the gate** (recommend cross-list).

### CEO Sections 1–11 (SELECTIVE EXPANSION; strategy-calibrated, eng owns the implementation-grade pass)

**Section 1 — Architecture.**

    curriculum repo (future)         importer (node)                      Postgres
    glossary file ─loadGlossary─▶ resolve [[term]] ─┬─▶ activities.draft_content
      (fixture today)  (R3)       local ▶ file/store │   (marks: glossaryKey +
                                  (R2, R9)          │    baked body per L3)
                                                    └─▶ glossary_entry (0043, R7)
                                                          owner-scoped SELECT
    student viewer (/a/:id)                                  │
     worksheet ─first paint─▶ idle / first tap ─▶ glossary_for_activity(id)
     InlineContent term ─┐                      (SECURITY DEFINER, 0017 predicate)
     Glossary tool ──────┴─▶ GlossaryDialog ◀── merged index = active store ∪ local
                             list │ detail (lazy DefinitionBlocks) │ back stack

New coupling: viewer → one RPC (the only cross-owner read); importer →
glossary file (seamed). SPOF: the RPC — degrades to local terms + baked
bodies (L3), never blocks the worksheet. Scaling: ≤2,000 rows per owner,
read once per page load; 100x students = 100x one small RPC, no hot-path
writes. Rollback: table and RPC are additive; the viewer change reverts in
one commit; marks carrying `glossaryKey` still render from their baked body
under the old viewer (it ignores the key). Findings: CEO-F1, CEO-F2.

**Section 2 — Error & Rescue Map.**

    CODEPATH                    | WHAT CAN GO WRONG                 | CLASS
    ----------------------------|-----------------------------------|----------------------------
    loadGlossary                | file missing / unreadable         | fs error → exit 1 (path named)
                                | malformed / dup key / variant     | loader warning → skip or
                                |  collision / >16 KB               |  keep-first; --strict fails
    syncGlossary (mirror)       | table missing (pre-0043)          | 404 → notice; strict fails
                                | empty-201 body                    | prevented: return=representation
                                | other HTTP error                  | loud warning; strict fails
    resolve [[term]]            | unresolved                        | warning (+ nearest); strict fails
    glossary_for_activity       | unpublished / deleted / anon      | empty set / permission denied
    viewer store read           | offline / 5xx / timeout           | local-only, retry once next open
    viewer body parse           | row body fails schema             | entry dropped (safeParse)
    DefinitionBlocks chunk      | 404 after deploy                  | Suspense fallback = the term

    CLASS            | RESCUED | ACTION                     | USER SEES
    -----------------|---------|----------------------------|--------------------------------
    fs error         | N (ok)  | exit 1, path named         | importer error, fix obvious
    loader warning   | Y       | skip/keep-first, report    | report line; strict = exit 1
    mirror failure   | Y       | fail-soft / strict fail    | loud notice; marks still resolve
    RPC denied/empty | Y       | local-only index           | local terms only
    read failure     | Y       | retry once, then local     | local terms, no error screen
    bad body         | Y       | drop entry                 | entry absent from the list

No catch-alls; every rescue names its class. 0 CRITICAL GAPS.

**Section 3 — Security & Threat Model.** New surface: one SECURITY DEFINER
RPC, one table. (1) Cross-owner read via the RPC: bounded to published,
non-deleted activities (0017 predicate); content is course vocabulary —
Low/Low, mitigated. (2) IDOR on `p_activity_id`: a guessed published id
yields that owner's public glossary only — accepted, same exposure as the
activity itself. (3) Injection: bodies written only by the service role
from a CI-gated file, rendered via KaTeX `trust:false` and React text;
images follow the path activity definitions already use — Low. (4)
`search_path` pinned; EXECUTE revoked from anon (0016 pattern). (5) No PII
beyond `owner_id`; data-map + retention rows ship with the migration. No
High findings.

**Section 4 — Data Flow & Interaction Edge Cases.**

    FILE ─▶ loadGlossary ─▶ validate (schema, 16 KB, dup, variant) ─▶ mirror upsert/retire ─▶ glossary_entry
      shadow: missing → exit 1 · empty → 0 entries, said so · bad entry → skipped
              dup → keep first · pre-0043 → notice/strict · stale file → retire set shown in dry run
    ACTIVITY.md ─▶ [[term]] ─▶ local? ─▶ file/store? ─▶ mark(key, baked) | literal + warning
    RPC ─▶ rows ─▶ safeParse ─▶ merge (local hides store) ─▶ list / detail
      shadow: nil → local only · empty → R5 hides tool · bad row → dropped · retired → detail only

Async ordering: the only shared mutable state is the per-page cache. A term
tap during an in-flight idle read must JOIN that promise, never start a
second (invariant: ≤1 in-flight read per activity). Proof: a controlled
deferred promise, both orders (tap-then-idle, idle-then-tap) — added to the
eng test plan. Interaction edges: double-tap a term (idempotent), tap a term
while the tool is open (retarget detail, push back stack), Esc mid-search
(close; query not kept), zero results ("No matches" + clear), 300 rows
(plain rows), navigate away (dialog unmounts with the route). 1 item
unhandled in the plan text (the join) → eng phase.

**Section 5 — Code Quality.** DRY holds: file grammar = `parseDefinitionsFence`;
mirror = the registry-mirror shape; bodies = `DefinitionBlocks`; local terms
= `collectDefinitions`. One risk: `collectDefinitions` dedups by TERM and
drops empty content — the merged index must key store-resolved marks by
`glossaryKey`, or two senses collapse (eng item). No over-engineering: no
toggle, no scope column, no virtualization.

**Section 6 — Tests.** Coverage by new thing: pure lib (unit: tiers,
folding, variant tier, merge/hiding, snippet, linkify per UC1), loader
(unit over fixture: every R3 rule), resolver (unit: local wins, file, store,
variant, retired-only, unresolved; strict exit measured without a pipe),
mirror (unit over a fake db: upsert payload, retire, un-retire, no-flag
no-op, dry-run writes nothing), migration (verify-0043 matrix), dialog
(component: both doors, focus trap/return, Esc, back stack, empty hide,
deferred read, retry, join), print (appendix over local/store/retired
marks), one student-lane e2e. 2am-Friday test: verify-0043's "student of a
published activity gets rows" + the e2e tap → definition. Hostile QA: a
`[[term]]` whose store entry retires between two imports. Chaos: RPC 500
while the dialog is open. Flakiness: the idle-deferred read uses a fake
`requestIdleCallback`, never wall time.

**Section 7 — Performance.** R16 is the budget: read deferred past first
paint, ≤2,000 rows, list renders plain text, bodies lazy. The RPC is one
PK-prefix scan (`owner_id` leads the PK). No N+1. Student-shell budget stays
green (dialog chunk lazy). Slowest paths: first tap before the read settles
(≤1 RPC round trip; the baked body shows at once under L3), search over 300
entries (in memory, sub-millisecond).

**Section 8 — Observability.** The importer report (R4) is this feature's
operator dashboard. Viewer: a failed read logs one console warning with the
activity id (no student data). No production metrics — lookup analytics
(E5) deferred by author direction. Runbook: "glossary missing in the
viewer" → run the RPC as the student (verify-0043 shows how) → check
`retired_at` → re-run the importer with `--glossary --dry-run`.

**Section 9 — Deployment & Rollout.** Order: migration 0043 applied live
(author) → verify-0043 live → viewer commit pushed (OV-7). Importer changes
are author-run, not deployed. No Edge Function change: sanitize and the
served document are untouched (the mark already carries `glossaryKey`), so
no bundle regeneration is expected — `pnpm verify`'s drift checks confirm.
Rollback: revert the viewer commit; the table stays inert. Post-deploy:
open a published catalogue activity as the student test account, tap a
term, open the tool.

**Section 10 — Long-term Trajectory.** Reversibility 4/5 (additive table +
RPC; the mark shape already exists). Debt: the owner-keyed scope (F5), one
path dependency recorded for the co-ownership arc. The D9 toggle, lookup
analytics and editor parity all build on this without rework.

**Section 11 — Design & UX.** Full treatment in Phase 2. CEO-level: the
hierarchy is definition-first (a term tap opens the detail on that term),
list second; loading/empty/error/partial states are specified (R5, R15,
R16, R1); mobile is named (D5). Carried to design: F2's reading-flow
concern and one-open across the three floating tools.

### Required outputs (CEO)

**NOT in scope.** DEFERRED → TODOS: E1 A–Z rail, E2 recently viewed, E3
read-aloud, E4 editor parity, E5 lookup analytics (author §3: none
assumed). REJECTED: `scope_id` hedge (F5; YAGNI house rule), phase split
(F1; contradicts the author's store-empty-tolerant ruling). Plus §4's
original exclusions.

**What already exists.** The 0B table: fence parser, `makeDefinition`,
registry mirror, 0042 RLS posture, `DefinitionBlocks`, `collectDefinitions`,
ToolCluster conventions, `glossaryKey` round-trip.

**Dream state delta.** After this plan: store, gate and student surface
exist. Still needed for the 12-month ideal: the curriculum artifact itself,
the builder dropping redundant local fences (R4's IDENTICAL list makes that
mechanical), the US display toggle, lookup analytics.

**Failure Modes Registry.**

    CODEPATH       | FAILURE MODE                 | RESCUED | TEST | USER SEES             | LOGGED
    ---------------|------------------------------|---------|------|-----------------------|-----------
    RPC gate       | wrong predicate (owner-only) | Y*      | Y    | local terms only      | verify red
    store read     | offline / 5xx                | Y       | Y    | local, retry once     | console
    mirror         | table missing                | Y       | Y    | notice / strict fail  | stdout
    resolver       | unresolved [[term]]          | Y       | Y    | literal + warning     | stdout
    print appendix | key-only mark (L3 declined)  | → L3    | Y    | term absent on paper  | —
    body parse     | invalid row                  | Y       | Y    | entry absent          | console

*caught at review, not yet in code — the verify row is its guard. The print
row is the one potential silent loss and is what L3 closes; if L3 is
declined it becomes a CRITICAL GAP until answered.

**Completion Summary.**

    +====================================================================+
    |            MEGA PLAN REVIEW — COMPLETION SUMMARY                   |
    +====================================================================+
    | Mode selected        | SELECTIVE EXPANSION                         |
    | System Audit         | artifact absent; 18 fence copies of ~8 terms|
    | Step 0               | 6 findings; E6+E7 accepted, E1–E5 deferred  |
    | Section 1  (Arch)    | 2 issues found (owner id, print/offline)    |
    | Section 2  (Errors)  | 9 error paths mapped, 0 GAPS                |
    | Section 3  (Security)| 5 issues found, 0 High severity             |
    | Section 4  (Data/UX) | 12 edge cases mapped, 1 unhandled → eng     |
    | Section 5  (Quality) | 1 issue found (dedup by term vs key)        |
    | Section 6  (Tests)   | Diagram produced, 0 gaps                    |
    | Section 7  (Perf)    | 1 issue found (budget → R16)                |
    | Section 8  (Observ)  | 0 gaps found                                |
    | Section 9  (Deploy)  | 1 risk flagged (OV-7 order)                 |
    | Section 10 (Future)  | Reversibility: 4/5, debt items: 1           |
    | Section 11 (Design)  | 1 issue → design phase (reading flow)       |
    +--------------------------------------------------------------------+
    | NOT in scope         | written (7 items)                           |
    | What already exists  | written                                     |
    | Dream state delta    | written                                     |
    | Error/rescue registry| 9 rows, 0 CRITICAL GAPS                     |
    | Failure modes        | 6 total, 0 CRITICAL (1 conditional on L3)   |
    | TODOS.md updates     | 6 items proposed (E1–E5, F5)                |
    | Scope proposals      | 7 proposed, 2 accepted                      |
    | CEO plan             | written (ceo-plans/2026-09-27-glossary.md)  |
    | Outside voice        | codex unavailable (not installed)           |
    | Lake Score           | N/A (no coverage questions asked)           |
    | Diagrams produced    | 4 (architecture, data flow, error, dream)   |
    | Stale diagrams found | 0                                           |
    | Unresolved decisions | 5 (L3, UC1, T1, T2, D9 fork) → final gate   |
    +====================================================================+


<!-- autoplan-accepted:ceo -->
- R1: the viewer reads the store only through `glossary_for_activity(p_activity_id uuid)` (SECURITY DEFINER, pinned search_path, gated on EXACTLY the 0017 predicate — authenticated, not deleted, published; no owner/draft branch — never can_read_activity; returns the owner's active and retired entries with retired_at); the table's one SELECT policy is owner-scoped (R7); the read is once per activity session and cached; a failed read degrades to activity-local terms with no error screen and is retried once on the next glossary open. Verified by: verify-0043 rows (a student gets a published activity's owner rows; a draft or deleted activity yields none; anon denied; no other owner's rows ever returned) and viewer unit tests for the failed-read degrade and the single retry.
- R2: the importer warns on every `[[term]]` resolving to neither local nor store (fence-less files included), naming file, term and — within edit distance 2 over terms and variants — the nearest store term; `--strict` exits 1 on any; resolution source is the file with --glossary, else the owner's active store rows, else (table missing) local only; a retired-only match is unresolved; a missing table without --glossary is a notice, not a warning. Verified by: importer unit tests for fence-less unresolved, strict exit code measured without a pipe, and the no-glossary run.
- R3: one `loadGlossary(path)` seam behind `--glossary <file>`, a checked-in fixture, and the PROPOSED (proposal-only) v1 format (definitions grammar + optional `key:`/`us:` lines); sending the proposal is an author action. Loader rules per §5 R3 (schema-validated DefinitionBlock[] body, 16 KB cap, duplicate/default-key collision keeps first, variant collision drops the variant, every loader warning fails --strict). Verified by: loader unit tests over the fixture covering each rule.
- R4: every run prints the glossary report (entries active/retired, variants, cross-link count, unresolved refs, shadowing split IDENTICAL/DIVERGENT); report-only. Verified by: importer test asserting each line over a fixture that exercises every category.
- R5: the glossary summon renders nothing when the merged index has no ACTIVE entries; it appears immediately with local terms, else when the store read settles non-empty; no spinner. Verified by: viewer component test (empty store + no local defs → no summon; one local def → summon).
- R6: one in-memory store read per activityId per page load via a createGlossaryCache() instance; no TTL, no localStorage. Verified by: viewer unit test (two opens on one instance → one fetch; a fresh instance → refetch).
- R7: migration 0043 creates glossary_entry exactly as §5 R7 lists (owner_id FK cascade, key, term, variants, body, retired_at, updated_at, pk (owner_id,key)); RLS forced; one SELECT policy `to authenticated using (owner_id = auth.uid())`; service-role writes only; data-map + retention-policy updated in the same commit; verify-0043.sql registered; migration applied live before the viewer push. Verified by: verify-0043 rows (owner reads own; other teacher reads none via table; student reads none via table; anon denied; client insert/update/delete denied) and data-map-coverage.test.mjs green.
- R8: mirror writes owner_id = resolved --owner, upserts on (owner_id,key) with return=representation, retires (never deletes) keys absent from the file and un-retires returning keys, leaves the store untouched without --glossary, reports but writes nothing under --dry-run, runs before activity writes, fail-soft on missing table except under --strict (fails), loud otherwise, marks still resolving from the file; retired entries resolve existing keyed marks but are excluded from list and search. Verified by: importer unit tests over a fake db (upsert payload, retire set, un-retire, no-flag no-op) and a viewer unit test (retired excluded from list, still resolves a keyed mark).
- R9: a store-resolved `[[term]]` becomes a definition mark with glossaryKey = key and the authored display text; local definitions never carry glossaryKey; content per the L3 ruling. Verified by: markdownToTiptap unit tests (local wins, store by term, store by variant, unresolved literal).
- R10: L4 is ruled at the final gate before any code touches cross-links.
- R11: the D9 display fork is asked at the final gate (cross-list recommended for v1); a variant match ranks in the tier of its term either way; `variants` is a locale-keyed object of display strings ({"us":"slope"}). Verified by: search unit test + component test per the fork ruling.
- R15: the merged index is active store ∪ local; a local definition hides the store entry it matches on term or variant (one row); a retired-key mark opens its entry with no list row selected; 768–959px uses the popover layout narrowed. Verified by: index-merge unit test + component test.
- R16: the store read is deferred past first paint (idle, or first term tap / tool open); RPC capped at 2,000 rows; importer warns (strict fails) above 1 MB total body; list rows render term + variant only, definition-tier matches show a plain-text highlighted snippet; bodies render lazily in the detail pane only; the student-shell perf budget stays green. Verified by: component test (no RPC before worksheet render; one on first tap), importer size-cap test, check-perf-budget green.
- R12: markdown-import-format.md and catalogueAuthoringPrompt.ts (+ regenerated doc) updated; paste importer stays local-only; the glossary lib imports no graph-kit barrel and is imported by the importer's node-bundled pipeline entry. Verified by: catalogueAuthoringPrompt drift test, the batch importer's bundle build, and the export-reachability test.
- R13: acceptance tests per D-row as listed in §5 R13 (D1 same dialog, D4 ranking/folding/highlight, D5 trap/Esc/focus-return/bottom-sheet + one student-lane e2e, D6 header amendment in the same commit + print-appendix test over local/store/retired marks, D3+D7 per L4, D9 variant search + cross-list).
- R14: D4's definition-word tier searches text runs, list items, headings and image alt (no math, no figures), NFKD case/diacritic folded. Verified by: search unit tests (math-only body never matches; accented query matches).
- D1 corrected: the glossary tool reuses ToolCluster conventions and builds its own dialog; one-open is a design-phase ruling; always available (R5 gate only), no per-activity toggle. D2's "their CI refuses" gate superseded by D8's correction.
- R17: commits land in order (1) pure lib + popover over activity-local terms, (2) migration 0043 + verify-0043 + compliance rows, (3) importer loader/resolver/mirror/report, (4) viewer store read; the live RPC stays because the browse list must reflect glossary edits without republishing. Verified by: commit order in git log; commit (1) passes its own tests with no store present.
- D2's read-mechanism paragraph is superseded by R1 + R7.
- D1–D9 are otherwise preserved unchanged; pending rows L3, UC1 (L4), T1, T2 and the D9 display fork are build prerequisites ruled at the final gate.
<!-- /autoplan-accepted:ceo -->

<!-- autoplan-baseline-edits:ceo {"sourceSha256":"c09f4a625a2ca06b76bf043b2125b931efd9a05d015cebc60fbb128e44005155","replacements":[{"oldText":"**Status:** ✅ RULED — D1, D3–D8 accepted as proposed; **D2 RE-RULED by the\nauthor**; **D9 added by the author** (locale-variant capacity; both\n2026-09-27, below). Next: the curriculum-side glossary artifact\n(D8 ask sent), then the review pipeline before any code drop (the\nai-grading-assist precedent).","newText":"**Status:** ✅ RULED — D1, D3–D8 accepted as proposed; **D2 RE-RULED by the\nauthor**; **D9 added by the author** (locale-variant capacity; both\n2026-09-27, below). **Under /autoplan review (2026-09-27)** — §5 holds the\nreview amendments; the build waits for the final approval gate (L3, L4\nand the D9 display fork are ruled there). The curriculum-side artifact\ndoes not exist yet (live-probed), so the build is store-empty-tolerant."},{"oldText":"  unfocused at the default A→Z list. One component, two entries — and the\n  cluster's existing summon/dismiss/one-open rulings come free.","newText":"  unfocused at the default A→Z list. One component, two entries. (**Corrected\n  by review:** nothing \"comes free\" — floating-tool-cluster.md dropped the\n  shared host (C2) and the calculator ships its own chrome; the glossary\n  tool REUSES ToolCluster's conventions — summon hides while open, × /\n  Escape close, focus returns to the opener — and builds its own dialog.\n  Whether one-open is enforced across tools is ruled in the design phase.\n  The tool is always available, gated only by §5 R5 — no per-activity\n  toggle, so no new schema field.)"},{"oldText":"    `glossary_entry` (the proven misconception-mirror pattern) and\n    validates `[[term]]` short references against it, warning on any that\n    don't resolve.","newText":"    `glossary_entry` (the proven misconception-mirror pattern) and\n    validates `[[term]]` short references against it, warning on any that\n    don't resolve. (The \"their CI can refuse\" gate above is **superseded\n    by D8's correction**: activity files are not in their repo, so the\n    reference gate is this side's importer — §5 R2.)"},{"oldText":"  - Viewer read path: the 2026-06-19 (a)-bake vs (b)-fetch choice resolves\n    to **(b), via the store itself** — a course glossary browsable from\n    every activity would go stale per-version under baking. Mechanism:\n    `glossary_entry` takes the `misconception_registry` posture (one\n    SELECT policy `to authenticated`; the viewer requires sign-in), read\n    once per session and cached client-side. No Edge Function, no hosted\n    JSON.","newText":"  - Viewer read path: the 2026-06-19 (a)-bake vs (b)-fetch choice resolves\n    to **(b), via the store itself** — a course glossary browsable from\n    every activity would go stale per-version under baking. Mechanism:\n    **superseded by §5 R1 + R7** (the viewer has no owner id, so the read\n    is an owner-resolving RPC over an owner-scoped table). No Edge\n    Function, no hosted JSON."},{"oldText":"definitions while authoring (the old doc's future note, unchanged);\nstudent-authored definitions.","newText":"definitions while authoring (the old doc's future note, unchanged);\nstudent-authored definitions.\n\n## 5. Review amendments — CEO phase (autoplan, 2026-09-27)\n\n- **R1 Owner-resolving read (CEO-F1).** `ServedActivity` carries no owner,\n  so the viewer reads the store through ONE RPC,\n  `glossary_for_activity(p_activity_id uuid)` — SECURITY DEFINER, pinned\n  `search_path`, returning the activity owner's entries (active AND\n  retired, with `retired_at`, so R8's keyed-mark resolution works). **Gate\n  = EXACTLY the student read predicate that exists** —\n  `get_published_activity`'s (0017): `auth.uid()` not null, activity not\n  deleted, `status = 'published'`. No owner/draft branch: the viewer never\n  serves drafts (get-activity-handler.ts: \"draft content is unreachable\n  here\"), so there is nothing to preview. NOT `can_read_activity`: that helper is owner-only (0009) and\n  is the Activity-Bank landmine. Consequence stated plainly: any\n  signed-in user who can open a published activity can read its owner's\n  whole glossary — acceptable because entries are course content, never\n  student data. The table's one SELECT policy is owner-scoped (R7), so\n  the RPC is the ONLY cross-owner read path. Read once per activity\n  session and cached client-side; a failed read degrades to\n  activity-local terms only — never an error screen, never a blocked\n  worksheet — and is retried ONCE, on the next glossary open, then left\n  local-only for the page load (a failure is not cached forever, and\n  never hammered).\n- **R2 Reference gate (CEO-F4).** The importer warns on EVERY `[[term]]`\n  that resolves to neither an activity-local definition nor a store entry\n  (not only in files that carry a ```definitions fence), naming file,\n  term and — when one exists within edit distance 2 over terms and\n  variants — the nearest store term; `--strict` fails the run on any.\n  **Resolution source:** with `--glossary`, the FILE (it is canonical and\n  about to be mirrored); without it, the live store's ACTIVE rows for\n  `--owner` (read with the service connection the importer already\n  uses), so a flag-less re-import never false-warns on a mirrored term; if\n  the table is missing (0043 not applied), local definitions only — a\n  printed notice, not a warning, unless `--glossary` was passed (then\n  R8's strict rule applies). A\n  reference that matches only a RETIRED entry is unresolved (warns) —\n  retirement stops new references, it never breaks old marks.\n- **R3 Loader seam + proposed format (CEO-F5).** The glossary file is read\n  through one `loadGlossary(path)` function (`--glossary <file>`, sibling\n  of `--registry`) with a checked-in fixture. The PROPOSED v1 format — the\n  author sends it to the boundary page — is the existing ```definitions\n  grammar plus optional `key:` (stable identity; defaults to the\n  lower-cased term) and `us:` (D9 variant) header lines, so fence, file\n  and builder share one grammar. **It is a proposal only** — D8 leaves\n  the format to the curriculum side, and the build depends on nothing but\n  the `loadGlossary` seam; if they choose otherwise, only the loader\n  changes. Loader rules: `body` = the fence parser's `DefinitionBlock[]`\n  (the schema type), re-validated with the schema on load and parsed\n  (safeParse, bad entry dropped) on read in the viewer; an entry over 16\n  KB serialized is skipped with a warning; a duplicate key (including two\n  default keys from the same lower-cased term) keeps the first and warns;\n  a variant equal to another entry's term or variant is a collision —\n  warn, drop that variant. Every loader warning fails `--strict`.\n- **R4 Import glossary report (E6 + CEO-F6).** Every run (dry or live)\n  prints entries loaded (active / retired), variants, cross-link count\n  (per L4), unresolved references, and every activity-local definition\n  that shadows a store key, split IDENTICAL (safe to delete) vs DIVERGENT\n  (override or drift). Report-only; local-wins stands.\n- **R5 Empty index hides the tool (E7).** The glossary tool's summon\n  renders nothing when the merged index (store ∪ activity-local) is\n  empty (ACTIVE entries only — an all-retired store counts as empty).\n  Loading: the summon appears immediately when the activity has\n  local terms; otherwise it appears when the store read settles\n  non-empty. No spinner (a floating summon causes no layout shift).\n- **R6 Session cache.** \"Once per activity session\" = one in-memory read\n  per `activityId` per page load, held by a `createGlossaryCache()`\n  instance the student route creates once (tests make fresh instances, so\n  \"reload refetches\" is testable); no TTL, no localStorage.\n- **R7 The table (migration 0043).** `glossary_entry(owner_id uuid not\n  null references users(id) on delete cascade, key text not null, term\n  text not null, variants jsonb not null default '{}', body jsonb not\n  null, retired_at timestamptz, updated_at timestamptz not null default\n  now(), primary key (owner_id, key))`. RLS forced; ONE SELECT policy\n  `to authenticated using (owner_id = auth.uid())` — the owner reads\n  their own rows directly, everyone else reads only through R1's RPC, so\n  \"another owner's rows never returned\" is true of the table AND the\n  RPC. Writes: service role only (revoke/grant pair, 0042 §L pattern).\n  `docs/compliance/data-map.md` + `retention-policy.md` gain the table in\n  the same commit (owner_id is person-referencing;\n  `data-map-coverage.test.mjs` enforces the first). A `verify-0043.sql`\n  joins the verify runner. Ordering (OV-7): the migration is applied live\n  BEFORE the viewer change is pushed.\n- **R8 Mirror semantics.** The importer writes rows with `owner_id` = the\n  resolved `--owner` user (explicit column; the service role has no\n  `auth.uid()`), upsert on `(owner_id, key)` with\n  `return=representation` (the 0042 empty-201 lesson). A key present in\n  the store but absent from the file gets `retired_at = now()` — never\n  deleted (retire-not-rename); a returning key clears it. Retired\n  entries are excluded from the A→Z list and search but still resolve a\n  mark that carries their key. A run WITHOUT `--glossary` leaves the\n  store untouched. `--dry-run` computes and REPORTS the upsert and retire\n  sets and writes nothing (the importer's existing dry-run promise). The\n  mirror runs before activity writes, fail-soft on a\n  missing table (the registry-mirror posture) EXCEPT under `--strict`,\n  where a failed mirror fails the run (a strict run is the build gate);\n  loud on any other error. Marks still resolve from the file when the\n  mirror fails.\n- **R9 Store-resolved mark shape.** A `[[term]]` with no local\n  definition that matches a store term or variant (case-insensitive)\n  becomes a `definition` mark carrying `glossaryKey` = the entry's key;\n  the displayed text stays as authored. Its `content` is decided by L3\n  (pending at the final gate — a BUILD PREREQUISITE): baked snapshot of\n  the store body (L3 approved) or empty (L3 declined, which then needs\n  its own print/offline answer). Local definitions never carry\n  `glossaryKey`, so \"local wins\" is structural, not a lookup order.\n- **R10 Cross-link placement is a BUILD PREREQUISITE (L4).** D3 as\n  written stores links in the document, which store entries are not in;\n  L4 is ruled at the final gate before any code.\n- **R11 D9 display.** The display fork (cross-list vs per-teacher\n  toggle) stays OPEN and is asked at the final gate; the data shape is\n  identical either way. Recommended v1 if cross-list is chosen: list rows\n  and the detail header show the canonical term with a secondary \"US:\n  slope\" line. Either way, variant matches rank in the SAME tier as the\n  term they belong to (a variant prefix = a title prefix). `variants` is\n  a locale-keyed object of single display strings, e.g. `{\"us\":\n  \"slope\"}`.\n- **R15 Merged index rules.** The popover's index is store (active) ∪\n  activity-local definitions. A local definition HIDES the store entry it\n  matches (case-insensitive, on term or variant) within that activity —\n  one row, the local one, never two. Opening a retired-key mark shows its\n  entry in the detail pane with no list row selected (retired entries\n  never enter the list or search). Layout 768–959px: the ≥960px popover\n  at reduced width with a narrowed list column (design phase finalizes).\n- **R16 Payload + perf budget.** Realistic course glossary: 100–300\n  entries at ~1 KB of body each, ~100–300 KB JSON (~30–60 KB gz). The\n  store read is DEFERRED past first paint (issued at idle after the\n  worksheet renders, or immediately on the first term tap / tool open,\n  whichever comes first) — never on the worksheet's critical path. The\n  RPC returns at most 2,000 rows; the importer warns (and `--strict`\n  fails) when a glossary's total serialized body exceeds 1 MB. List rows\n  render the term (+ variant line) only — no body rendering in the list;\n  definition-tier matches show a short plain-text snippet (R14 text)\n  with the match highlighted. At ≤2,000 plain-text rows no virtualization\n  is needed; the body renders (lazy `DefinitionBlocks`) only in the\n  detail pane. The student-shell perf budget\n  (`scripts/check-perf-budget.mjs`) must stay green: the popover chunk is\n  lazy, like `DefinitionBlocks` today.\n- **R12 Knock-on artifacts.** `docs/markdown-import-format.md` documents\n  store resolution and the `--glossary` file; `catalogueAuthoringPrompt.ts`\n  teaches that `[[term]]` may reference the course glossary without a\n  local fence (then `pnpm prompt:catalogue`; the Notion stamp refresh is\n  an author-approved write). The paste-markdown importer has no store:\n  it stays local-only (the lookup is an optional ctx injection, absent\n  there). The glossary lib (search, index merge, and linkify per L4) is\n  pure, imports no graph-kit barrel, and is imported by the importer's\n  node-bundled pipeline entry (so the batch importer's bundle build IS\n  the barrel-rule check).\n- **R14 Search text.** D4's \"word-in-definition\" tier searches a\n  plain-text extraction of the body: text runs, list items, headings and\n  image alt text; math (inline and display) and graph figures contribute\n  nothing. Case- and diacritic-folded (NFKD, combining marks stripped).\n- **R13 Acceptance tests per D-row.** D1: summon + term both open the\n  same dialog (component test). D4: ranking tiers, diacritic/case\n  folding, highlight (unit). D5: focus trap, Esc, focus return to the\n  opener, bottom sheet under 768px (component + one e2e in the student\n  lane). D6: the amended header comment lands in the same commit\n  (review), AND print is untouched — a print-appendix test over a local\n  mark, a store-resolved mark and a retired-key mark. D3 + D7 (per L4):\n  linkify rules (first occurrence, whole word, no self) + back stack\n  push/pop + keyboard Back (unit + component). D9: variant search hit +\n  display per the gate's fork ruling (unit + component). R15: local\n  hides matching store entry; retired-key open (unit + component). R16:\n  read deferred past first paint (component: no RPC call before the\n  worksheet renders; one call on first term tap), perf budget green.\n- **R17 Build order, and why the live read stays.** Commits land in this\n  order: (1) the pure glossary lib + the popover over ACTIVITY-LOCAL terms\n  (complete and useful with no store — the half students feel); (2)\n  migration 0043 + verify-0043 + compliance rows; (3) importer loader,\n  resolver gate, mirror, report; (4) the viewer's store read. The live\n  RPC (R1) stays even though baked marks (L3) cover print and offline:\n  the browse list must reflect glossary edits without the author\n  republishing every activity (publishing is an author action and clears\n  the draft). Strategic value, stated so later work protects it: the\n  reference gate (R2) and, later, lookup analytics (E5, deferred) are the\n  defensible parts; a glossary popover alone is table stakes."}]} -->

### Phase 2 (Design) — record

**Step 0.** Initial design completeness **3/10**: the data layer is
specified to the column, the student surface to the sentence — contents are
listed, but not what a student sees at open, how Back works, what the
dialog does to the worksheet, or the list's loading/zero-result states. A
10 names the opening state per door, one navigation model, placement and
weight per breakpoint, every state, and the tokens. DESIGN.md: no repo-root
file; `packages/viewer/DESIGN.md` + `tokens.css` are the student surface's
token system (S0 ruling 5.1A) and everything below is calibrated to it.
Existing leverage: `.tool-summon` + tool corners (left = reading, right =
doing), `--z-popover`, `--vw-shadow-window`/`--vw-radius-window` (the
floating-tool window look), the `.viewer-definition__term` dotted
underline, lazy `DefinitionBlocks`. Mockups: **deliberately skipped**
(designer binary present) — the surface is composed from the shipped
token vocabulary, and a generated image would introduce a fictional one;
the precedent (ai-grading-assist §4b) did the same. Offered at the gate.

**Voices.** Native design voice: completed, INPUT hash matches the design
snapshot (6708df58…), 2 critical + 6 high + 8 medium. Outside (Codex):
unavailable (not installed) [single-model].

    DESIGN OUTSIDE VOICES — LITMUS SCORECARD (OPERATE surface):
      Check                                    Claude(native)  Codex  Consensus
      1. Brand unmistakable in first screen?   N/A (in-app tool) —    N/A
      2. One strong visual anchor?             YES after GD-3    —    N/A
      3. Scannable by headlines only?          YES (term header) —    N/A
      4. Each section has one job?             YES (list/detail) —    N/A
      5. Cards actually necessary?             NO cards used     —    N/A
      6. Motion improves hierarchy?            minimal (GD-18)   —    N/A
      7. Premium without decorative shadows?   YES (one window   —    N/A
                                                shadow token)
      Hard rejections triggered:               none              —    N/A

**Integration.** All 16 structural findings auto-fixed (override: missing
states / broken hierarchy → P5) as GD-1…GD-18 in §5b. The native voice's C1
"non-modal from a term" contradicts D5's author-ruled focus trap, and the
primary disagrees with overriding it here → folded into the existing gate
item **T1** as a third option (see the ledger). M3's "In this activity"
tag is T2 already.

**Passes (before → after):**
- **P1 Information architecture 3 → 8.** First/second/third is now fixed per
  door (GD-3): term → the definition, then its row in context, then search;
  tool → search, then the list, then a detail. One navigation model (GD-2).
  Not 10: T2 (grouping) and T1 (weight) are open at the gate.
- **P2 Interaction states 2 → 9.** The state table in §5b covers summon,
  term tap, list, search and cross-link across loading/empty/error/
  success/partial, plus the late merge (GD-5) and the no-match state
  (GD-6). Not 10: the L3-declined row exists only as a fallback line.
- **P3 Journey 3 → 8.**

      STEP | STUDENT DOES               | FEELS                 | PLAN SPECIFIES
      1    | meets "gradient" mid-task  | unsure, wants a peek  | dotted underline (existing)
      2    | taps it                    | wants the answer NOW  | GD-1 anchored, GD-3 detail first
      3    | reads, sees "rise" linked  | curious               | GD-10 link look, GD-2 push
      4    | follows 2 links deep       | slightly lost         | GD-2 Back → list at root
      5    | Esc                        | back in the sentence  | GD-7 focus returns to the term
      6    | later opens the tool       | browsing, revising    | GD-3 search-first, GD-6 states

  5-second: the definition is on screen immediately (baked body, L3).
  5-minute: Back and Esc never surprise. Long-term: one course vocabulary
  across every activity. Not 10: T1 (does a peek deserve a dialog).
- **P4 AI slop 7 → 9.** OPERATE rules: calm list/detail layout, no cards,
  no icons-in-circles, utility copy ("Pick a word, or search"), one
  accent. Summon is text, matching the shipped "Calculator" summon. No
  hard rejections.
- **P5 Design system 4 → 9.** Every surface, radius, shadow, focus and
  z-value is a named `--vw-*`/`--z-*` token (GD-8, GD-14, GD-18); the
  summon reuses `.tool-summon`; the term underline is untouched. Not 10:
  the dialog is a new component, so its CSS must pass the tokens guard
  (`tests/tokens.test.ts` has no knowledge of it yet).
- **P6 Responsive & a11y 3 → 9.** Three breakpoints ruled (GD-1/GD-8),
  mobile keyboard (GD-9), `aria-haspopup`/`aria-expanded` (GD-7), roving
  list keys, live result count (GD-6), heading focus on term open (GD-3),
  focus return to the original opener, reduced motion (GD-18), inline-link
  target exemption stated (GD-10).
- **P7 Unresolved decisions:** 16 resolved into GD-rows; 0 deferred; open
  at the final gate: T1 (now three options), T2, UC1 (cross-link placement
  — GD-10 is its look either way), D9 display fork.

**NOT in scope (design):** drag/resize of the dialog or sheet (v1 no-drag
precedent); an A–Z rail (E1); recently viewed (E2); pronunciation (E3);
editor preview (E4); a visible "retired" state (GD-11 — deliberate).

**What already exists:** `.tool-summon` and the tool-corner layout,
`--z-popover`, the floating-window token trio, the definition term's
dotted underline, `DefinitionBlocks` for bodies, ToolCluster's focus-return
request/effect pattern (reuse it for GD-7's focus return).

**Completion summary.**

    +====================================================================+
    |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
    +====================================================================+
    | System Audit         | viewer DESIGN.md + tokens; UI scope yes     |
    | Step 0               | 3/10; all 7 dimensions                      |
    | Pass 1  (Info Arch)  | 3/10 → 8/10 after fixes                     |
    | Pass 2  (States)     | 2/10 → 9/10 after fixes                     |
    | Pass 3  (Journey)    | 3/10 → 8/10 after fixes                     |
    | Pass 4  (AI Slop)    | 7/10 → 9/10 after fixes                     |
    | Pass 5  (Design Sys) | 4/10 → 9/10 after fixes                     |
    | Pass 6  (Responsive) | 3/10 → 9/10 after fixes                     |
    | Pass 7  (Decisions)  | 16 resolved, 0 deferred, 4 at the gate      |
    +--------------------------------------------------------------------+
    | NOT in scope         | written (6 items)                           |
    | What already exists  | written                                     |
    | TODOS.md updates     | 0 new (E1–E5 already proposed by CEO)       |
    | Approved Mockups     | 0 generated (deliberate), 0 approved        |
    | Decisions made       | 18 added to plan (GD-1…GD-18)               |
    | Decisions deferred   | 4 → final gate (T1, T2, UC1, D9 fork)       |
    | Overall design score | 2/10 → 8/10                                 |
    +====================================================================+

**Ledger continuation (design):**

| ID/owner | Contract & evidence | Current | Proposed | Status | Approval/scope |
|---|---|---|---|---|---|
| L15/GD-1…18 | native design voice C2, H1–H6, M1–M8 | unspecified | §5b rulings | approved | autoplan design override (structural → P5) |
| L10/T1 (reopened) | native design C1 adds a third option | D6 popover + D5 trap | (A) as ruled + GD-1 mitigations; (B) non-modal peek from a term, modal from the tool; (C) keep in-place disclosure, tool-only popover | TASTE → gate | primary recommends A |

<!-- autoplan-accepted:design -->
- GD-1…GD-18 (§5b) are accepted plan requirements: opener-anchored dialog at ≥960px with no scrim at ≥768px, bottom sheet + scrim under 768px, D5's trap kept pending T1 with light dismiss added; one navigation stack (list root, every detail navigation pushes, term open seeds [list, term], Back button + Alt+←, Escape always closes, Backspace never bound, stack resets on close); the per-door opening state (term → detail heading focused, row selected, half-height sheet with "Browse glossary"; tool → search focused, A→Z, "Pick a word, or search."); plain-text list rows and snippets with math shown as "…"; late-merge footer that never moves selection or scroll and vanishes silently on failure; no-match text + "Did you mean" (edit distance ≤2) + debounced polite live count + scroll-restoring clear; aria-haspopup="dialog" + aria-expanded, roving ↑/↓/Enter/Home/End, search → list → detail tab order, focus return to the original opener; overlay at --z-popover without closing other tools; the stated sizes per breakpoint with independent pane scroll and sticky search; "Glossary" text summon bottom-left above the reference summon; full-height sheet on search focus via dvh/visualViewport, no drag; solid-underline accent cross-links with the inline 44px exemption; retired entries search-invisible with no student-facing label; local bodies link into the merged index; variant hits always show the variant line highlighted; <mark> on accent-wash with original-character highlighting and ~80-char snippets; no editor change; the GD-16 L3-declined line; in-memory query/scroll per page load; GD-18 motion + token-only theming. Verified by: component tests for each door's opening state, the stack (push/pop/seed/reset, Alt+←, Escape closes), late merge (selection/scroll unchanged), no-match + live count, aria attributes, focus return after a 3-link chain, variant-hit display, highlight index mapping (unit), reduced motion; one student-lane e2e at 375px (term tap → half sheet → Browse → search keyboard → Escape → focus on the term); tokens guard green with the new CSS.
- D4 amended: no math renders in list rows or snippets (GD-4).
- All CEO accepted requirements (R1–R17) are preserved unchanged; T1 now carries three options for the gate.
<!-- /autoplan-accepted:design -->

<!-- autoplan-baseline-edits:design {"sourceSha256":"5fea43a60a90af3611f9f239fbdfbfa6649aee26ed26a49a2809a90575b49d66","replacements":[{"oldText":"  highlighted in the result list; case/diacritic-insensitive; inline math\n  in results renders (definitions carry `$math$`).","newText":"  highlighted in the result list; case/diacritic-insensitive; inline math\n  in results renders (definitions carry `$math$`). (**Amended by §5b\n  GD-4:** terms are plain text by grammar and snippets are plain text, so\n  no math renders in the list; a math span shows as \"…\".)"},{"oldText":"  defensible parts; a glossary popover alone is table stakes.","newText":"  defensible parts; a glossary popover alone is table stakes.\n\n## 5b. Design rulings — design phase (autoplan, 2026-09-27)\n\nSurface class: OPERATE (a student tool inside a worksheet). Every value\nbelow is a `packages/viewer` token; no literals. The dialog is built new\n(the floating tools share conventions, not a host).\n\n- **GD-1 Placement and weight (C1; the modality question is the final\n  gate's T1).** ≥960px: the dialog is ANCHORED to its opener — below a\n  tapped term, flipping above when there is no room, so the term's own\n  line stays visible; above the summon when opened from the tool. No\n  scrim at ≥768px (the worksheet stays in view). Under 768px: a bottom\n  sheet with a scrim. Until the gate rules T1, D5's focus trap stands\n  (`aria-modal=\"true\"`), with light dismiss (outside click closes) added.\n- **GD-2 One navigation stack (C2).** The list is the root. EVERY detail\n  navigation — a list pick, a search pick, a cross-link — pushes. Back\n  pops one level and is hidden at the root. A term open seeds the stack\n  `[list, term]`, so Back from it lands on the list. Typing a query never\n  touches the stack; closing resets it. Back = a visible button in the\n  detail header + `Alt+←`. `Escape` ALWAYS closes (D5) — never Back, and\n  Backspace is never bound (it belongs to the search field).\n- **GD-3 Opening state (H1).** From a term: search empty; the term's row\n  selected and scrolled into view; focus on the detail heading\n  (`tabindex=\"-1\"`), so a screen reader reads the term, then the body;\n  under 768px the sheet opens at HALF height straight to the detail, with\n  a \"Browse glossary\" button that expands it to the full list. From the\n  tool: focus in the search field, the A→Z list, no row selected, and the\n  detail pane (≥768px) shows \"Pick a word, or search.\" Under 768px the\n  tool opens the list at full height.\n- **GD-4 Math in the list (H2).** Terms are plain text by grammar (the\n  `term:` line and `[[…]]` text carry no math), so list rows never render\n  math. Definition-tier snippets are plain text (R14) and a math span\n  shows as \"…\" — raw `$…$` source never reaches a student. (Amends D4's\n  \"inline math in results renders\".)\n- **GD-5 Late merge (H2b).** If the dialog opens before the store read\n  settles, the list shows local rows plus one quiet footer row \"Loading\n  course glossary…\". When the read lands, rows merge WITHOUT moving the\n  selection or the scroll anchor. A failed read removes the footer\n  silently (R1's degrade; no error text for a student).\n- **GD-6 Search states (H3).** No match: \"No words match “xyz”.\" plus\n  \"Did you mean <term>?\" when one term or variant is within edit distance\n  2 (the same pure function the importer uses). An `aria-live=\"polite\"`\n  count (\"12 words\"), debounced 300ms. Clearing the query restores the\n  A→Z list at its previous scroll position.\n- **GD-7 The term button after D6 (H4).** `aria-haspopup=\"dialog\"` with\n  `aria-expanded` bound to the dialog being open for THAT term;\n  `aria-expanded` no longer means \"expanded in place\". List keyboard:\n  ↑/↓ move a roving focus, Enter opens, Home/End jump. Tab order: search\n  → list → detail. Focus returns to the ORIGINAL opener on close, however\n  long the cross-link chain.\n- **GD-8 Tools, size, summon (H5).** The glossary never closes the\n  calculator or reference panel (they hold student state); it overlays\n  them at `--z-popover` and gives focus back on close. Size ≥960px:\n  width `min(44rem, 100vw − 2·--space-4)`, max-height 70vh, list column\n  14rem, detail ≥22.5rem; 768–959px: list column 12.5rem, same rules;\n  each pane scrolls independently and the search field is sticky. The\n  summon is a text button \"Glossary\" in the existing `.tool-summon`\n  style, in the bottom-LEFT corner stacked above the reference summon\n  (reading tools left, the doing tool right); at 375px all three summons\n  fit, two left and one right.\n- **GD-9 Mobile keyboard (H6).** Focusing search expands the sheet to\n  full height, sized with `dvh` / `visualViewport` so results sit above\n  the on-screen keyboard. No drag gestures in v1 (the reference panel's\n  no-drag precedent): × button, scrim tap and Escape close; the half →\n  full expansion is the \"Browse glossary\" button.\n- **GD-10 Cross-link look (M1; placement per UC1).** A cross-link is\n  accent-coloured with a SOLID underline — distinct from the worksheet\n  term's dotted underline — with the `--focus-ring` focus style. Inline\n  links take WCAG 2.5.8's inline exemption from the 44px target rule,\n  stated here deliberately.\n- **GD-11 Retired entries (M2).** A retired entry is reachable only\n  through a mark that carries its key; search never returns it. The\n  dead end is deliberate (retirement means \"stop using this word\"), and\n  no \"retired\" label is ever shown to a student.\n- **GD-12 Local vs course bodies (M3).** A local body's cross-links reach\n  store entries (the merged index). Whether local rows are grouped\n  visibly is the final gate's T2.\n- **GD-13 Variant hits (M4).** Whatever the D9 display ruling, a row\n  matched through a variant shows its variant line with the highlight\n  on it — a student always sees why a row matched.\n- **GD-14 Highlight (M5).** `<mark>` with `--vw-color-accent-wash`\n  background and inherited ink (both themes via tokens). Folded matches\n  highlight the ORIGINAL characters (indices mapped through NFKD).\n  Snippets are ~80 characters centred on the first match, with ellipses.\n- **GD-15 Editor (M6).** No editor change in this arc (E4 deferred). With\n  L3 baked, a store-resolved mark looks like any definition in the\n  editor; file-backed activities are edited in their `.md`, never in the\n  app (standing rule), so the teacher's check is the import report (R4).\n- **GD-16 L3-declined fallback (M7).** If L3 is declined and a\n  key-only mark is tapped with no store row available, the detail shows\n  \"This definition isn't available right now.\" — a gate criterion against\n  declining L3.\n- **GD-17 Session memory (M8).** The last query and list scroll persist\n  in memory for the page load; the navigation stack resets on close.\n- **GD-18 Motion and theme.** Open: 120ms opacity + 4px translate\n  (ease-out), none under `prefers-reduced-motion`; close: fade only.\n  Surfaces `--vw-color-overlay`, `--vw-shadow-window`,\n  `--vw-radius-window`, lines `--vw-color-line-strong`; dark mode comes\n  from the token layer, nothing theme-specific in the component.\n\n**Interaction states (what the student SEES):**\n\n    FEATURE        | LOADING                    | EMPTY                  | ERROR                   | SUCCESS                  | PARTIAL\n    ---------------|----------------------------|------------------------|-------------------------|--------------------------|-------------------------\n    summon         | hidden until local terms   | hidden (R5)            | local terms only         | \"Glossary\" text button   | —\n                   | or store settles           |                        |                          |                          |\n    term tap       | baked body shows at once   | n/a (a mark always has | baked body; L3-declined: | detail on the term,      | retired key: detail,\n                   | (L3); list merges later    | its own body)          | GD-16 line               | row selected             | no row selected\n    list           | local rows + \"Loading      | —                      | footer vanishes          | A→Z, 44px rows           | local-only after failure\n                   | course glossary…\" footer   |                        | silently                 |                          |\n    search         | —                          | \"No words match …\" +   | —                        | tiered results, <mark>,  | —\n                   |                            | \"Did you mean …?\"      |                          | live count               |\n    cross-link     | —                          | —                      | target missing → plain   | pushes onto the stack    | —\n                   |                            |                        | text (never a dead link) |                          |"}]} -->

### Phase 2.5 (DX) — record

**Mode: DX POLISH** (autoplan override). Product type: CLI tool (the
importer) + a file-format contract (the glossary file) — primary: CLI.

**Voices.** Native DX voice: completed, INPUT hash matches the DX snapshot
(9c9fa202…), 16 findings (5 high, 10 medium, 1 low-medium). Outside
(Codex): unavailable (not installed) [single-model].

    DX DUAL VOICES — CONSENSUS TABLE:
      Dimension                           Claude(native)  Codex  Consensus
      1. Getting started < 5 min?          NO (F1)         —      N/A
      2. API/CLI naming guessable?         PARTIAL (F5)    —      N/A
      3. Error messages actionable?        PARTIAL (F7-9)  —      N/A
      4. Docs findable & complete?         PARTIAL (F2)    —      N/A
      5. Upgrade path safe?                NO (F7, F14)    —      N/A
      6. Dev environment friction-free?    PARTIAL (F12)   —      N/A
    Missing outside voice → all consensus cells N/A. Single-voice HIGH
    findings flagged: F1, F3, F7, F12, F14 — all auto-fixed below.

**Persona (0A, inferred P6 from CLAUDE.md + STATE):**

    TARGET DEVELOPER PERSONA
    Who:       the author — teacher-developer, sole operator of import:batch
    Context:   between marking sessions, re-importing the catalogue after the
               curriculum builder lands new files; always --dry-run first
    Tolerance: ~10 min for a weekly task; expects one command and a report
               that says what changed and what needs action
    Expects:   --strict to be the build gate; nothing written on --dry-run;
               the file to win (the curriculum side is canonical)

Secondary: the curriculum builder (an LLM) writing the glossary file —
needs one example it can pattern-match and loud, located errors.

**Empathy narrative (0B, predicted, marked as such):** "The curriculum
side says the glossary landed. I run the import with `--glossary` and
`--dry-run`. Today's plan would show me a report — good — but if I'd
pointed at last week's file by mistake, a live run would quietly retire
half the glossary and I'd only notice when a student asks why 'gradient'
vanished. When 0043 isn't applied yet I'd see forty 'unresolved' warnings
and have to guess the one cause. And I'd write `key:` in the glossary
because the meta fence uses `key:`, and the builder would too." (W-5, W-6
and W-2 remove each of those.)

**Competitive benchmark (0C) — in-distribution only (no web research run;
internal tool with no market peers):**

| Tool | Start → result | Time + evidence type | DX choice |
|---|---|---|---|
| this importer, `--registry` (shipped) | registry file → mirrored ids + manifest | ~2 min, observed in repo docs | one flag, one manifest |
| this plan before DX review | glossary file → a store term in the popover | ~20+ min, estimated (5 steps, 3 systems, an author publish) | no fixture path |
| this plan after W-1 | fixture → dry-run report of resolved marks | ~3 min, estimated | one documented command |

TTHW: **~20 min → <5 min target (Competitive)** for the CLI hello world
(fixture dry run); the store read's hello world is verify-0043.
Magical moment (0D): the dry-run report showing "N references resolved to
the course glossary; M local copies are IDENTICAL and safe to delete" —
the moment the builder sees the consolidation pay off. Vehicle: already in
scope (R4 + W-12); no expansion.

**Journey map (0F, after fixes):**

    STAGE           | DEVELOPER DOES                          | FRICTION                   | STATUS
    1. Discover     | reads markdown-import-format.md         | no example (F2)            | fixed (W-2)
    2. Install      | none — the importer ships in-repo       | —                          | ok
    3. Hello World  | runs the documented fixture dry run     | no path (F1)               | fixed (W-1)
    4. Real Usage   | import:batch --glossary --strict        | two strict rules (F3)      | fixed (W-4)
    5. Debug        | reads located warnings / console.warn   | unlocated, silent (F9,F12) | fixed (W-7, W-10)
    6. Upgrade      | new glossary revision → re-import       | mass retire, key drift     | fixed (W-5, W-2)
                    |                                         | (F7, F14)                  |

**First-time developer report (0G):**

    T+0:00  opens markdown-import-format.md, finds the --glossary section and the 3-entry example (W-2)
    T+0:40  copies the fixture command (W-1), runs it
    T+1:30  dry-run prints: 3 entries, 1 variant, 2 references resolved, 0 unresolved, 1 IDENTICAL shadow
    T+2:30  removes `id:` from one entry to test → "glossary.md:7 — missing id:; add an id: line" (W-7)
    T+3:00  succeeded; knows --strict turns that into exit 1 (W-11 usage)

**Passes (before → after):**
- **P1 Getting started 2 → 8** — W-1 fixture command + example; residual:
  the store read has no one-command local demo (verify-0043 stands in).
- **P2 CLI/format design 5 → 8** — `id:` not `key:` (W-2), closed locale
  set (W-3), usage parity test (W-11); residual: `--registry` stays
  ambiguous beside `--skills-registry`/`--glossary` (renaming a shipped
  flag is out of POLISH scope → TODOS candidate).
- **P3 Errors 4 → 9** — cause-first (W-6), located + fix format (W-7),
  scaled suggestions (W-8), mass-retire refusal (W-5), dev signal (W-10).
- **P4 Docs 4 → 8** — example, hello-world command, dry-run-as-resolver
  (W-14); residual: docs are a single long format file.
- **P5 Upgrade 3 → 9** — required stable ids (W-2), retire guard (W-5),
  one row cap (W-9), W-4's single strict rule.
- **P6 Dev environment 6 → 8** — cache `status`, console cause classes
  (W-10), fixture reuse in tests; residual: no local published demo.
- **P7 Community N/A** — internal author-operated tool; honest residual,
  deliberately no investment (the ai-grading-assist precedent).
- **P8 Measurement 5 → 8** — the report IS the per-run measurement; the
  boomerang is the first real import after the curriculum artifact lands.

    +====================================================================+
    |              DX PLAN REVIEW — SCORECARD                             |
    +====================================================================+
    | Dimension            | Score  | Prior  | Trend  |
    | Getting Started      | 8/10   | 2/10   | ↑      |
    | API/CLI/SDK          | 8/10   | 5/10   | ↑      |
    | Error Messages       | 9/10   | 4/10   | ↑      |
    | Documentation        | 8/10   | 4/10   | ↑      |
    | Upgrade Path         | 9/10   | 3/10   | ↑      |
    | Dev Environment      | 8/10   | 6/10   | ↑      |
    | Community            | N/A    | N/A    | —      |
    | DX Measurement       | 8/10   | 5/10   | ↑      |
    +--------------------------------------------------------------------+
    | TTHW                 | <5 min | ~20 min| ↑      |
    | Competitive Rank     | Competitive                                  |
    | Magical Moment       | designed via the dry-run report (R4 + W-12)  |
    | Product Type         | CLI tool + file-format contract              |
    | Mode                 | POLISH                                       |
    | Overall DX           | 8/10   | 2/10   | ↑      |
    +====================================================================+
    | DX PRINCIPLE COVERAGE                                               |
    | Zero Friction      | covered (W-1)                                  |
    | Learn by Doing     | covered (fixture dry run)                      |
    | Fight Uncertainty  | covered (W-6, W-7, W-10)                       |
    | Opinionated + Escape Hatches | covered (--allow-mass-retire, W-13)  |
    | Code in Context    | covered (W-2 example = fixture head)           |
    | Magical Moments    | covered (report)                               |
    +====================================================================+

    DX IMPLEMENTATION CHECKLIST
    [x] Time to hello world < 5 min (W-1)
    [x] Installation is one command (in-repo, none)
    [x] First run produces meaningful output (dry-run report)
    [x] Magical moment delivered via the report
    [x] Every error message has: problem + cause + fix (W-6, W-7)
    [x] CLI naming guessable (--glossary beside --registry; id: not key:)
    [x] Every parameter has a sensible default (store untouched without --glossary)
    [x] Docs have copy-paste examples that work (W-2 = fixture)
    [x] Examples show real use (the demo references real terms)
    [x] Upgrade path documented (retire-not-rename, W-5 guard)
    [x] Breaking changes warn (mass-retire refusal, strict rules)
    [x] TypeScript types (the lib is typed; the loader validates with the schema)
    [x] Works in CI without special configuration (fixture tests run in pnpm test)
    [ ] Community channel — N/A internal

**NOT in scope (DX):** renaming `--registry` → `--misconception-registry`
(a shipped flag; TODOS candidate), a `--glossary-only` mode (W-14 covers
it), a generated glossary manifest file (W-12 prints instead).

**What already exists:** the registry mirror + its manifest, the
`binding warnings` / `catalogue warnings` blocks, `parseArgs` + `usage()`,
`.env.supabase` credential loading, the fence parser W-2's example uses.

**Ledger continuation (DX):**

| ID/owner | Contract & evidence | Current | Proposed | Status | Approval/scope |
|---|---|---|---|---|---|
| L16/W-1…W-14 | native DX voice F1–F16 | unspecified / R3 default key / split strict | §5c rulings | approved | autoplan DX override (P1 errors, P5 naming) |
| L17/W-2 vs R7 | `key:` collides with meta `source_key` | column `key`, defaulted id | required `id:`, column `term_id` | approved | supersedes R7's column name and R3's default |
| L18/W-4 | registry mirror fail-soft under --strict (batch-import.mjs:2669) | registry soft, glossary strict | both strict-fail under --strict | approved | P2 (same block, <1 day); changes shipped registry behavior under --strict only |

<!-- autoplan-accepted:dx -->
- W-1…W-14 (§5c) are accepted plan requirements: a checked-in glossary fixture + one-activity demo folder with a documented dry-run hello-world command, and verify-0043 as the store read's hello world; a REQUIRED `id:` line per glossary entry (never defaulted; missing id = loader error, strict fails), DB column `term_id` (supersedes R7's `key` and R3's default-key rule; the mark field stays glossaryKey), and the 3-entry example in the docs = the fixture's head; a closed locale-key set {us} with a warning (strict fails) on any other key; under --strict a failed mirror fails the run for BOTH the glossary and the misconception-registry mirror, fail-soft and loud otherwise; a live run retiring more than 25 entries or more than 20% of active entries is refused (retire set printed) unless --allow-mass-retire; a single cause-first line when glossary_entry is missing; loader/caps messages formatted `<file>:<line> <id> — <problem>; <fix>`; length-scaled suggestions (≤1 for ≤5 chars, ≤2 otherwise, none on ties) in one pure function shared by the importer and the viewer; one exported GLOSSARY_MAX_ENTRIES = 2000 used by the importer (warn / strict fail) and the RPC (ordered by term, capped); a console.warn cause class on a failed/empty store read plus cache status; usage() documents --glossary/--allow-mass-retire/--skills-registry with a flag-to-usage parity test and a labelled "glossary warnings" block; the report prints counts, full unresolved and DIVERGENT lists, IDENTICAL as a count (full list on --dry-run); a backslash-escaped `\[[…]]` stays literal and unwarned (mechanism verified in eng before documenting); `--dry-run --glossary` documented as resolve-without-mirroring. Verified by: importer unit tests for each rule (missing id, unknown locale key, duplicate id location format, mass-retire refusal + override, missing-table single line, strict exit for both mirrors measured without a pipe, suggestion thresholds incl. ties, row cap, usage parity, report shape on dry vs live, escaped literal), a viewer unit test for the console cause class + cache status, and the documented fixture command run once by hand.
- All CEO and Design accepted requirements are preserved except where W-2 supersedes R7's column name (key → term_id) and R3's defaulted key (→ required id:), stated here.
<!-- /autoplan-accepted:dx -->

<!-- autoplan-baseline-edits:dx {"sourceSha256":"ec7fdb1b57db16e1c874ee0b652049046be731006800da3c42b85ca48f99d75b","replacements":[{"oldText":"                   |                            |                        | text (never a dead link) |                          |","newText":"                   |                            |                        | text (never a dead link) |                          |\n\n## 5c. Developer-experience rulings — DX phase (autoplan, 2026-09-27)\n\nThree developers touch this arc: the author running `pnpm import:batch`,\nthe curriculum builder (an LLM + the author) writing the glossary file,\nand a future session debugging \"why is the glossary empty here\".\n\n- **W-1 A five-minute local hello world (F1).** A checked-in demo pair —\n  `scripts/fixtures/glossary/glossary.fixture.md` (the R3 fixture) and a\n  one-activity folder referencing two of its terms — with one documented\n  command: `pnpm import:batch scripts/fixtures/glossary/demo --owner <local\n  teacher> --glossary scripts/fixtures/glossary/glossary.fixture.md\n  --dry-run`. The dry run prints the resolved marks and the report (R4)\n  with no database write; the store read path's hello world is\n  verify-0043, which seeds rows and calls the RPC as a student. Both are\n  named in `docs/markdown-import-format.md`.\n- **W-2 The proposed format, shown (F2, F5, F14).** Entry identity is an\n  `id:` line — REQUIRED, never defaulted from the term (a spelling fix\n  must not become a rename), and deliberately NOT `key:`, which already\n  means an activity's `source_key` in the meta fence. Column name\n  `term_id` (supersedes R7's `key`; the mark's field stays `glossaryKey`).\n  An entry without `id:` is a loader error: skipped, and `--strict` fails.\n  The doc carries this 3-entry example, which is also the fixture's head:\n\n      ```definitions\n      id: gradient\n      term: gradient\n      us: slope\n      How steep a line is: the rise divided by the run.\n      ---\n      id: y-intercept\n      term: y-intercept\n      Where a graph crosses the $y$-axis, at $x = 0$.\n      ---\n      id: rate\n      term: rate\n      A comparison of two quantities with different units, such as\n      $\\frac{\\text{km}}{\\text{h}}$.\n      ```\n\n- **W-3 Locale keys are a closed set (F6).** v1 knows exactly one\n  variant key, `us`. The loader warns on any other key (strict fails) —\n  a new locale is a deliberate format change, not a typo that silently\n  ships.\n- **W-4 One strict rule for both mirrors (F3).** Under `--strict`, a\n  failed mirror fails the run — the glossary mirror AND the existing\n  misconception-registry mirror (a strict run is the build gate; a stale\n  mirror is a correctness problem). Without `--strict`, both stay\n  fail-soft and loud, exactly as the registry mirror is today.\n- **W-5 Mass-retire guard (F7).** A live run that would retire more than\n  25 entries OR more than 20% of the owner's active entries is refused\n  before any write, printing the retire set, unless `--allow-mass-retire`\n  is passed. The dry run always prints the full retire set.\n- **W-6 Cause first (F8).** When `glossary_entry` does not exist, the\n  importer prints ONE line — \"glossary_entry is missing (migration 0043\n  not applied) — N [[term]] references could not be checked against the\n  store; apply 0043 or pass --glossary <file>.\" — and the per-reference\n  warnings are reserved for runs that HAVE a resolution source.\n- **W-7 Every loader message locates and fixes (F9).** Format:\n  `<file>:<line> <id> — <problem>; <fix>`, e.g. \"glossary.md:12 gradient\n  — duplicate id (first at line 3); give one entry a different id:\".\n  The 16 KB, 1 MB and row caps use the same shape.\n- **W-8 Suggestions that help (F10).** \"Did you mean\" scales with length:\n  edit distance ≤1 for terms of 5 characters or fewer, ≤2 otherwise; no\n  suggestion when two candidates tie. One pure function serves the\n  importer (R2) and the viewer's no-match state (GD-6).\n- **W-9 One row cap, shared (F11).** `GLOSSARY_MAX_ENTRIES = 2000` is one\n  exported constant: the importer warns (strict fails) above it, and the\n  RPC orders by `term` and applies the same cap, so any truncation is\n  deterministic and never silent at import.\n- **W-10 A developer signal for the silent student path (F12).** A failed\n  or empty store read logs one `console.warn` naming its cause class\n  (`rpc-error`, `not-published`, `no-rows`, `all-retired`, `capped`) with\n  the activity id — never student data. The cache exposes `status` for\n  tests and debugging.\n- **W-11 `usage()` and labelled warnings (F4).** The help text documents\n  `--glossary` and `--allow-mass-retire` (and gains the missing\n  `--skills-registry` in its synopsis); glossary problems print in their\n  own block, \"glossary warnings (--strict: these FAIL the run)\", beside\n  the existing binding and catalogue blocks. A unit test asserts every\n  flag `parseArgs` accepts appears in `usage()`.\n- **W-12 A report sized to action (F13).** Counts always; unresolved\n  references and DIVERGENT shadows listed in full (they need action);\n  IDENTICAL shadows as a count, listed in full only on `--dry-run`.\n- **W-13 An intentional literal (F15).** A backslash-escaped `\\[[…]]`\n  renders as literal brackets and is never resolved or warned about. The\n  escape mechanism is verified against markdown-it's unescaping in the\n  eng phase before it is documented.\n- **W-14 \"Resolve without mirroring\" is the dry run (F16).** Documented:\n  `--dry-run --glossary <file>` resolves every reference against the file\n  and writes nothing. No new mode."}]} -->

### Phase 3 (Eng) — record

**Step 0 — Scope challenge (code read, not summarized).** Existing code per
sub-problem is the CEO 0B table, re-verified here against source:
`parseDefinitionsFence` + `DEFINITION_SUB` (markdownToTiptap.ts:512, 2857),
`makeDefinition` (≈1215), `getMarkdownImporter` (255, signature
`(markdown) => ImportResult`), `loadPipeline` (batch-import.mjs:1613,
esbuild `platform: 'node'` over batchImportPipeline.ts),
`syncMisconceptionRegistry` (1856), `collectDefinitions` (print/definitions.ts),
`DefinitionTerm` (InlineContent.tsx:157), `ToolCluster.tsx`,
`ReferencePanelTool.tsx`, `ServedActivity` (readClient.ts:58),
`get_published_activity` (0017:74–94), `can_read_activity` (0009:157,
owner-only), `supabase/config.toml` (no `[api]` block).
Complexity: ~24 files touched, 2 new services (the store RPCs, the viewer
`GlossaryService` seam) → the complexity gate trips. **Structure selector
auto-decided: Original arrangement** (autoplan override "never reduce",
P2) — each file is a distinct concern already named by an accepted row;
no smaller arrangement keeps R1–R17, GD, W and the test contract. No
feature cuts proposed. Search check: in-distribution only (jsonb_agg for
one-row RPC results and SECURITY DEFINER read gates are Layer-1 Postgres
practice; no novel infrastructure). TODOS cross-reference: nothing in
TODOS blocks this plan; the deferred E1–E5, the co-ownership scope note
and the `--registry` rename are written to TODOS.md at this phase.
Distribution: no new artifact — the importer is in-repo, the viewer ships
in the SPA, the migration is author-applied.

**Voices.** Native eng voice: completed, INPUT hash matches the eng
snapshot (2dafacfa…), 3 HIGH + 6 MEDIUM + 8 LOW. Outside (Codex):
unavailable (not installed) [single-model].

    ENG DUAL VOICES — CONSENSUS TABLE:
      Dimension                           Claude(native)  Codex  Consensus
      1. Architecture sound?               YES w/ H1-H3     —      N/A
      2. Test coverage sufficient?         GAPS (listed)    —      N/A
      3. Performance risks addressed?      NO (H1 row cap)  —      N/A
      4. Security threats covered?         MOSTLY (M5, L6)  —      N/A
      5. Error paths handled?              MOSTLY (M1-M4)   —      N/A
      6. Deployment risk manageable?       YES (H2 if D3)   —      N/A
    Missing outside voice → all consensus cells N/A. Single-voice HIGH
    findings flagged and auto-fixed: H1 (EN-1), H3 (EN-3); H2 folded into
    UC1 (EN-19 records the cost if D3 stands).

**Primary (this reviewer's) findings beyond the voice:** the `\[[` escape
is unescaped by markdown-it before `DEFINITION_SUB` runs (EN-16, verified
from the regex comment at markdownToTiptap.ts:508–512 and CommonMark
backslash escapes); the importer needs an options seam (EN-17).

**Section 1 — Architecture.**

    packages/schema                packages/app                          packages/viewer
    ┌──────────────────────┐       ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │ glossary.ts (NEW)    │◀──────│ markdownToTiptap (options    │      │ glossary/GlossaryDialog (NEW)│
    │  resolveTerm, fold,  │       │  seam, EN-17; escape EN-16)  │      │ glossary/useGlossary (NEW)   │
    │  search, snippet,    │◀──────│ batchImportPipeline (re-exp) │      │  merged index, deferred read │
    │  suggest, merge,     │       │ lib/glossaryService (NEW)    │─────▶│  GlossaryService (seam, EN-9)│
    │  linkify, caps,      │       │  supabase.rpc(GLOSSARY_RPC)  │      │ InlineContent (D6 amend)     │
    │  row/body parsers    │◀──────│ routes/StudentViewer (inject)│      │ container/ViewerContainer    │
    └──────────▲───────────┘       └──────────────────────────────┘      │  + glossary summon (R5/GD-8) │
               │                   scripts/batch-import.mjs               └──────────────────────────────┘
               └──────────────────  loadGlossary, resolve, report, ──▶ sync_glossary_entries (0043, EN-2)
                                    mass-retire guard, strict           glossary_for_activity (0043, EN-1)
                                                                        glossary_entry (0043, R7/W-2)
Coupling added: viewer → an injected service (no Supabase import in the
viewer); importer → two service RPCs; schema gains a pure module (no new
deps). Production failure per path: RPC 5xx → local-only (R1); sync RPC
missing → notice / strict fail (W-6, W-4); body schema drift → entry
dropped (R3). 3 findings (H1, H3, M6) → EN-1, EN-3, EN-9.

**Section 2 — Code quality.** DRY: one resolver (EN-3), one suggestion
function (W-8), one cap constant (W-9), fence grammar reused (W-2). The
shared-code rubric: `resolveTerm` has two proven callers (importer
`makeDefinition` path, viewer index merge) with identical contracts →
extraction justified; linkify has one caller (viewer) + one reporting
caller (importer, per UC1) → justified only if UC1 is approved. Fragility:
superseded `key` wording (EN-14); duplicate warning (EN-15). 4 findings,
all folded.

**Section 3 — Test review.** Framework: vitest per package (`pnpm test`),
node:test for `scripts/tests/*.test.mjs`, Playwright lanes for e2e,
verify-*.sql through `scripts/verify-runner.mjs`.

    CODE PATHS                                              USER FLOWS
    [+] schema/glossary.ts                                  [+] Term tap (≥960 / <768)
      ├─ resolveTerm: store-by-term, store-by-variant,        ├─ [GAP→unit+component] detail first, row selected
      │   local-fence wins, local-inline wins,                ├─ [GAP→E2E 375px] half sheet → Browse → search → Esc
      │   slope/gradient (EN-3), retired-only, none           └─ [GAP→component] calculator open + glossary (EN-7)
      ├─ fold/search tiers + variant tier + snippet/mark    [+] Tool open
      ├─ suggest (≤1 / ≤2 / tie → none)                       ├─ [GAP→component] search focused, A→Z, prompt text
      ├─ merge (local hides store; retired excluded)          └─ [GAP→component] zero results + "Did you mean"
      ├─ linkify (first, whole word, no self) [per UC1]     [+] Cross-link chain
      └─ row/body parse (reject blank/prompt, EN-8)           ├─ [GAP→component] push/pop, Back hidden at root
    [+] app markdownToTiptap                                  └─ [GAP→component] Esc after 3 links → focus on term
      ├─ options seam absent → today's output (regression)  [+] Store states
      ├─ [[term]] → store mark (key + baked body)             ├─ [GAP→unit] deferred read (no RPC before render)
      ├─ \[[x]] literal (EN-16)                               ├─ [GAP→unit] join in-flight read (both orders)
      └─ unresolved → ONE warning (EN-15)                     ├─ [GAP→unit] failure → local-only, one retry
    [+] scripts/batch-import.mjs                              ├─ [GAP→unit] late merge keeps selection/scroll
      ├─ loadGlossary: missing id, dup id, locale key,        └─ [GAP→unit] live body beats baked (EN-4)
      │   16 KB, 1 MB, row cap, located messages (W-7)      [+] Print
      ├─ strict exits (both mirrors, measured w/o pipe)       └─ [GAP→unit] appendix over local/store/variant marks
      ├─ mass-retire refusal + override (EN-12)                   byte-identical for local-only docs (regression)
      ├─ missing-table single line (W-6)
      ├─ report shape dry vs live (W-12)
      └─ usage ↔ parseArgs parity (W-11)
    [+] 0043 (verify-0043.sql)
      ├─ RLS posture: owner reads own; others none; anon denied; client writes denied
      ├─ glossary_for_activity: published → rows; draft/deleted → none; 1,001+ rows all returned (EN-1)
      ├─ sync_glossary_entries: upsert, retire, un-retire, dry = no write, service-only
      └─ owner delete cascades (retention)

    COVERAGE: 0/41 paths exist today (all new) | planned: 41/41
    [→E2E]: 1 (375px student flow) | [→EVAL]: none (no LLM surface)
    REGRESSION (CRITICAL): paste importer output unchanged without options (EN-17);
    print appendix byte-identical for docs with only local definitions (D6 "print untouched");
    local-definition tap still shows its body when the store is empty (R17 commit 1).

Regression contract (IRON RULE) — auto-decided under autoplan (exact
prior approval: D6 "print is untouched", R17 "commit 1 passes with no
store"): the three CRITICAL rows above are required, not optional.
Test plan artifact written to
`~/.gstack/projects/ZanReed-activity-platform/user-main-eng-review-test-plan-20260927-*.md`.

**Section 4 — Performance.** No N+1: one RPC per page load (R6), one sync
RPC per import. Memory: ≤2,000 entries × ~1 KB. Slow paths: first term tap
before the read (baked body, 0 RTT), the idle read (1 RTT, off the
critical path), search per keystroke over ≤2,000 folded strings (sub-ms;
fold once at index build, never per keystroke). Index: the PK leads with
`owner_id`, so both RPCs are index scans. 1 finding (H1) → EN-1.

**Failure modes registry (eng).**

    CODEPATH                 | FAILURE                        | TEST | HANDLED | USER SEES          | CRITICAL?
    glossary_for_activity    | >1,000 rows truncated          | Y    | EN-1    | full list          | no (fixed)
    glossary_for_activity    | definer not bypassing RLS      | Y    | EN-13   | local terms only   | no (verify row)
    sync_glossary_entries    | wrong/partial file             | Y    | W-5/EN-12 | refusal + retire set | no
    resolveTerm              | local/variant disagreement     | Y    | EN-3    | one body           | no
    detail pane              | baked vs live body             | Y    | EN-4    | live body          | no
    Back chord               | browser history Back           | Y    | EN-6    | —                  | no (removed)
    \[[ escape               | resolved anyway                | Y    | EN-16   | literal brackets   | no
    store body               | smuggled blank/prompt          | Y    | EN-8    | entry dropped      | no
0 critical gaps.

**NOT in scope (eng):** paging the viewer list (≤2,000 plain rows need
none); a GIN/trigram index (in-memory search); realtime push of glossary
edits (the realtime arc is un-stubbed deliberately later); a print change
(author: print untouched).

**What already exists (eng):** the esbuild node bundle as the barrel
guard (reused as R12's check), `httpCheckService` as the injection
pattern (EN-9), the verify-runner roster, the registry mirror's
fail-soft block (W-4 amends it), `extractMath`'s `\$` pre-pass (EN-16's
model).

**Parallelization.** Lane A: schema lib → viewer dialog (local-only).
Lane B: migration 0043 + verify + compliance (independent of A). Lane C:
importer (needs A's lib). Lane D: viewer store read (needs A + B). Launch
A + B; then C; then D. One author-operated checkout → executed
sequentially in R17's commit order.

**Completion summary (eng).** Step 0: scope accepted as-is · Architecture:
3 issues · Code quality: 4 issues · Tests: diagram produced, 41 planned
paths, 3 critical regression rows · Performance: 1 issue · NOT in scope:
written · What already exists: written · TODOS: 7 items written · Failure
modes: 0 critical gaps · Unresolved: 0 in this review (5 gate items carried
from earlier phases) · Outside voice: codex unavailable · Parallelization:
4 lanes, executed sequentially · Lake score: N/A (no coverage questions).

**Ledger continuation (eng):**

| ID/owner | Contract & evidence | Current | Proposed | Status | Approval/scope |
|---|---|---|---|---|---|
| L19/EN-1…EN-19 | native eng voice H1–H3, M1–M6, L1–L8 + primary (EN-16, EN-17) | as §5–§5c | §5d rulings | approved | autoplan eng override (P5 explicit, P3 pragmatic) |
| L20/scope | complexity gate (~24 files, 2 services) | full scope | original arrangement | approved | autoplan "never reduce" (P2) |
| L4→UC1 (reinforced) | eng voice H2 independently: stored links need a schema change + redeploy chain | D3 stored | render-time linkify | USER CHALLENGE → gate | three voices now agree; never auto-decided |

<!-- autoplan-accepted:eng -->
- EN-1…EN-19 (§5d) are accepted plan requirements: glossary_for_activity returns ONE jsonb (jsonb_agg ordered by term, capped at GLOSSARY_MAX_ENTRIES in SQL) and verify-0043 proves 1,001+ entries all arrive; mirroring is one atomic service_role RPC sync_glossary_entries(p_owner, p_entries, p_apply) returning {upserted, retired[], unretired[], active_before} with p_apply=false writing nothing and stamping updated_at; one pure resolveTerm (store by term or variant, then local fence OR inline definition matching that entry's term or any variant wins) used by importer and viewer, with the slope/gradient case tested; the detail pane shows the live store body once the read settles (baked body only before, on failure, and on paper); a glossaryKey mark stays a button with empty content; print stays byte-identical (a term and its variant may print as two entries); no Back keyboard chord (visible button only; supersedes GD-2's Alt+←); glossary trap over the non-modal tools with focus restored to the opener (component test with the calculator open); store bodies bypass sanitize and a loader + viewer safeParse test proves a blank/prompted-math body is rejected, noted in the RPC header; the pure lib lives in packages/schema/src/glossary.ts exported from the schema barrel, the viewer takes an injected GlossaryService, and the RPC name is one exported constant shared by the app and the e2e mock; requestIdleCallback with a setTimeout(1500) fallback; the 1 MB body cap refuses the mirror on live runs and fails --strict; mass-retire refused above 25, or above 20% AND 5 (amends W-5); SECURITY DEFINER RPCs with EXECUTE revoked from public/anon and the student-read verify row mutation-tested once; `term_id` / required `id:` everywhere at build (EN-14); R2's warning replaces the old fence-only warning; the `\[[` escape via a raw-source pre-pass modelled on extractMath; MarkdownImporter gains an optional { glossary } options argument with the paste path unchanged; if UC1 is declined, the stored-link mark chain (schema, bundle, SANITIZER_REV, get-activity redeploy, orphan guard) is added to the build. Verified by: the 41-path test diagram in the eng record, including the three CRITICAL regression rows (paste importer unchanged without options; print appendix byte-identical for local-only documents; local-definition tap with an empty store).
- All CEO, Design and DX accepted requirements are preserved except where EN rows state a supersession (GD-2's Alt+←, W-5's threshold, R8's upsert mechanics, the `key` wording per EN-14).
<!-- /autoplan-accepted:eng -->

<!-- autoplan-baseline-edits:eng {"sourceSha256":"bb8679ecb9515533fbb3b6c997c68ceac8bd3120629357aed9ac7e271f272e8e","replacements":[{"oldText":"- **W-14 \"Resolve without mirroring\" is the dry run (F16).** Documented:\n  `--dry-run --glossary <file>` resolves every reference against the file\n  and writes nothing. No new mode.","newText":"- **W-14 \"Resolve without mirroring\" is the dry run (F16).** Documented:\n  `--dry-run --glossary <file>` resolves every reference against the file\n  and writes nothing. No new mode.\n\n## 5d. Engineering rulings — eng phase (autoplan, 2026-09-27)\n\nThese are the build contract; where they differ from R/GD/W rows above,\nthe later row wins and says so.\n\n- **EN-1 One jsonb, never a row set (H1).** `supabase/config.toml` sets no\n  `[api] max_rows`, so the hosted PostgREST default of 1,000 applies to\n  every read, set-returning RPCs included — a 2,000-row cap would\n  truncate silently at 1,000. `glossary_for_activity` therefore returns\n  ONE `jsonb` (`jsonb_agg(… order by term)`, capped at\n  `GLOSSARY_MAX_ENTRIES` inside SQL). verify-0043 seeds 1,001+ entries\n  and proves they all arrive.\n- **EN-2 Mirroring is one atomic service RPC (L4/L5 + R8).**\n  `sync_glossary_entries(p_owner uuid, p_entries jsonb, p_apply boolean)`\n  — service_role only — upserts, retires (entries absent from\n  `p_entries`), un-retires, stamps `updated_at`, and returns one jsonb\n  `{upserted, retired[], unretired[], active_before}` in ONE\n  transaction. `p_apply = false` computes the same answer and writes\n  nothing (the dry run and the W-5 mass-retire guard both read it). No\n  PostgREST upsert, no `in.(…)` URL of ids, no empty-201 trap.\n  Supersedes R8's upsert mechanics; R8's semantics stand.\n- **EN-3 One resolver (H3).** A single pure `resolveTerm(text, local,\n  store)` decides every reference, in both the importer and the viewer:\n  find the store entry whose term OR variant matches (case/diacritic\n  folded); then, if ANY local definition — fence entry or inline\n  `[[x :: y]]` — matches that entry's term or any variant, the LOCAL one\n  wins; otherwise the store entry. The importer's pre-pass therefore\n  collects inline `::` definitions too, not only fences. The\n  `[[slope]]`-with-local-`gradient` case is a named unit test.\n- **EN-4 The live body wins once it exists (M1).** The detail pane shows\n  the store row for a `glossaryKey` as soon as the read settles; the\n  baked body (L3) is shown only before the read settles, after a failed\n  read, and on paper. One entry never shows two bodies in one session.\n- **EN-5 Keyed marks stay tappable (M2).** A mark carrying `glossaryKey`\n  stays a button even when its `content` is empty (GD-16's path). Print\n  stays byte-for-byte untouched per the author: a store term reached by\n  its term and by a variant prints as two appendix entries with one body\n  — accepted, since a student looking up either word finds it.\n- **EN-6 No keyboard chord for Back (M3).** `Alt+←` is browser history\n  Back on Chromebooks and Windows and word-left in a macOS text field.\n  Back is the visible, focusable button only. (Supersedes GD-2's\n  `Alt+←`.)\n- **EN-7 Focus with tools open (M4).** The calculator and reference\n  panel are NON-modal (DECISIONS.md:193-195); the glossary's trap sits\n  above them at `--z-popover` and restores focus to its opener on close.\n  Component test: calculator open → term tap → glossary → Escape → focus\n  on the term, calculator still open with its state.\n- **EN-8 Store bodies skip the server sanitize — say so (M5).** Activity\n  content passes get-activity's sanitize; RPC bodies do not. That is\n  safe only because `DefinitionBlock` admits no blank tokens and no\n  prompted math, and the only writer is the service-role importer. A\n  loader test and a viewer safeParse test prove a body carrying a blank\n  or a prompted `math_inline` is rejected, and the RPC's header comment\n  names this dependency so a future `DefinitionBlock` widening re-reads\n  it (P5).\n- **EN-9 Where the code lives (M6).** The pure lib (`resolveTerm`,\n  folding, search tiers, snippets, suggestions, merge, linkify per UC1,\n  `GLOSSARY_MAX_ENTRIES`, the row/body parsers) is\n  `packages/schema/src/glossary.ts`, exported from the schema barrel —\n  already pure zod, already in both the node importer bundle and the\n  viewer, so no new subpath and no graph-kit reach. The viewer gets a\n  `GlossaryService` interface (`load(activityId)`), injected by the\n  app's student route exactly as `httpCheckService` is; the RPC name is\n  one exported constant the app and the e2e mock both import (P2).\n- **EN-10 Idle scheduling (L1).** `requestIdleCallback` when present,\n  else `setTimeout(…, 1500)` — Safari/iPadOS have no idle callback.\n- **EN-11 The byte cap refuses on live runs (L2).** Over 1 MB of total\n  body, a live run refuses the mirror (activities still import, marks\n  still resolve from the file) and `--strict` fails; a dry run warns.\n- **EN-12 Mass-retire threshold (L3).** Refused when retiring more than\n  25 entries, OR more than 20% of active entries AND more than 5 — a\n  four-entry store can still retire one. (Amends W-5.)\n- **EN-13 Definer role (L6).** The RPCs are SECURITY DEFINER owned by the\n  migration role (bypasses RLS, the house pattern); EXECUTE revoked from\n  `public, anon` explicitly. verify-0043's \"student gets a published\n  activity's rows\" row is mutation-tested once by removing the definer\n  clause and watching it go red.\n- **EN-14 The column is `term_id` everywhere (L7).** R3/R7/R8 wording\n  that says `key`, `(owner_id, key)` or \"optional `key:`\" is superseded\n  by W-2 at build time: `primary key (owner_id, term_id)`, required\n  `id:`. The boundary-page proposal is the W-2 version.\n- **EN-15 One message per unresolved reference (L8).** R2's warning\n  replaces `makeDefinition`'s existing fence-only warning; there is never\n  a second message for the same reference.\n- **EN-16 The escaped literal needs a pre-pass (W-13).** markdown-it\n  unescapes `\\[` to `[` BEFORE `DEFINITION_SUB` runs on the text token,\n  so `\\[[x]]` would resolve like `[[x]]`. The escape is honoured the way\n  `extractMath` honours `\\$`: a raw-source pre-pass swaps `\\[[` for a\n  private sentinel and the emitter restores literal `[[`.\n- **EN-17 The importer's options seam.** `MarkdownImporter` becomes\n  `(markdown, options?: { glossary?: GlossaryIndex }) => ImportResult`;\n  the paste importer passes nothing and behaves exactly as today (a\n  regression test pins that).\n- **EN-18 The mark carries the store's term text for print.** A\n  store-resolved mark keeps the AUTHORED text as its display (R9); the\n  baked `content` is the entry body — nothing else changes in the mark,\n  so sanitize, the viewer-server bundle and `SANITIZER_REV` are\n  untouched unless UC1 keeps D3's stored links (then EN-19 applies).\n- **EN-19 If D3's stored links are kept (UC1 declined).** Storing links\n  \"in the document\" needs a new non-recursive link mark inside\n  `DefinitionBlock` text: a schema change, `pnpm bundle:viewer-server`\n  in the same commit, a `SANITIZER_REV` bump, a `get-activity` redeploy\n  (author action), and an orphan guard bound to rendered output,\n  mutation-tested. Recorded here as the cost of keeping D3 as written."}]} -->




<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|----------|
| 1 | CEO | Owner-resolving RPC (R1) | Mechanical | P5 | viewer has no owner id | direct table read |
| 2 | CEO | Gate on 0017 predicate, not can_read_activity | Mechanical | P1 | can_read_activity is owner-only (0009:157) | can_read_activity |
| 3 | CEO | Widen the unresolved warning; strict fails (R2) | Mechanical | P1 | fence-less files were silent | fence-only warning |
| 4 | CEO | Loader seam + proposal-only format (R3) | Mechanical | P5 | artifact absent; format is theirs | guessing a format |
| 5 | CEO | E6 report + E7 hidden summon | Mechanical | P2/P1 | in blast radius, <1 day | — |
| 6 | CEO | E1–E5 deferred to TODOS | Mechanical | P3 | author: none assumed | adding them now |
| 7 | CEO | Bake snapshot into marks (L3) | TASTE → gate | P1 | print + offline would lose store terms | key-only marks |
| 8 | CEO | Render-time linkify (UC1) | USER CHALLENGE → gate | — | 3 reviewers: D3 can't place links at import | — |
| 9 | CEO | Build order local-popover first (R17) | Mechanical | P6 | shippable half first | phase split (contradicts author) |
| 10 | CEO | No scope_id hedge | Mechanical | P4/P5 | YAGNI house rule | speculative column |
| 11 | Design | GD-1…GD-18 structural rulings | Mechanical | P5 | missing states / hierarchy | leaving to implementer |
| 12 | Design | Term-tap weight (T1, 3 options) | TASTE → gate | — | author ruled D5/D6; native voice disagrees | — |
| 13 | Design | "In this activity" group (T2) | TASTE → gate | — | relevance vs author's full-list default | — |
| 14 | Design | Mockups skipped | Mechanical | P5 | shipped token vocabulary is the reference | generated images |
| 15 | DX | W-1…W-14 | Mechanical | P1/P5 | errors, naming, upgrade safety | — |
| 16 | DX | Required `id:`, column term_id | Mechanical | P5 | `key:` means source_key already | defaulted key |
| 17 | DX | Both mirrors strict-fail under --strict | Mechanical | P2 | one rule per command | split semantics |
| 18 | Eng | EN-1 one-jsonb RPC | Mechanical | P1 | 1,000-row PostgREST default | set-returning RPC |
| 19 | Eng | EN-2 atomic sync RPC | Mechanical | P5 | no URL limits, no empty-201, atomic | PostgREST upsert + PATCH |
| 20 | Eng | EN-3 one resolver | Mechanical | P4 | importer/viewer disagreed on local-wins | two rules |
| 21 | Eng | EN-6 no Back chord | Mechanical | P5 | Alt+← = browser Back on Chromebooks | Alt+← |
| 22 | Eng | EN-16 escape pre-pass | Mechanical | P1 | markdown-it unescapes \[ first | regex-only escape |
| 23 | Eng | Original arrangement at complexity gate | Mechanical | P2 | never reduce | smaller arrangement |
| 24 | All | D9 display fork | author fork → gate | — | the author left it open | — |

## Final Approval Gate — APPROVED (author, 2026-09-27)

The author chose **"Approve all recommendations"** at the gate (D1). That rules:

- **UC1 → render-time linkify.** D3's "computed at import, stored in the
  document" is REPLACED: one pure `linkify` (whole word, case/diacritic
  folded, first occurrence per definition, never self) runs when a
  definition is shown, over the merged index. The importer reports link
  counts with the same function. EN-19's stored-link chain does NOT apply.
- **L3 → bake.** A store-resolved mark carries `glossaryKey` + a snapshot
  of the store body in `content`; the live row wins once the read settles
  (EN-4). GD-16's fallback line remains only as a defensive path.
- **T1 → (A)** the dialog as ruled (D5/D6) with GD-1's mitigations:
  anchored to the term, no scrim at ≥768px, half-height sheet under 768px.
- **T2 → yes:** an "In this activity" group pinned ABOVE the full A→Z list
  (hides nothing; the author's default list is unchanged below it).
- **D9 display → cross-list:** the canonical term with a secondary
  "US: slope" line in list rows and the detail header; no settings.

Build order R17. Author actions carried to STATE at build close: apply
0043 live before the viewer push (OV-7); send the W-2 proposed format to
the boundary page; refresh the Notion stamp after the authoring-prompt
regeneration.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` (via /autoplan) | Scope & strategy | 1 | CLEAR | 7 proposals, 2 accepted, 5 deferred |
| Outside Review | codex (not installed) | Independent 2nd opinion | 1 | unavailable | no completed external review |
| Eng Review | `/plan-eng-review` (via /autoplan) | Architecture & tests (required) | 1 | CLEAR | 17 issues, 0 critical gaps (all folded into EN-1…EN-19) |
| Design Review | `/plan-design-review` (via /autoplan) | UI/UX gaps | 1 | CLEAR | score: 2/10 → 8/10, 18 decisions |
| DX Review | `/plan-devex-review` (via /autoplan) | Developer experience gaps | 1 | CLEAR | score: 2/10 → 8/10, TTHW: ~20 min → <5 min |

- **OUTSIDE COVERAGE:** codex — CEO, design, DX, eng: unavailable (CLI not installed). Every phase ran an independent fresh-context Claude reviewer (native, in-host); no outside-coverage credit.
- **VERDICT:** CEO + DESIGN + DX + ENG CLEARED at the final gate — ready to implement.

NO UNRESOLVED DECISIONS
