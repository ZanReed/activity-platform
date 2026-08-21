# The native TABLE block

**Status:** ✅ **BUILT 2026-08-21 — all four slices shipped.** (Was: ENG-REVIEWED — CLEAR (AMENDED), build next.) Read each slice's **AS BUILT** note before citing the plan above it: five rulings changed shape at build time, and T4 changed outright. Fifteen rulings: five from
the review proper (1B wrapped cells · 2A derived gradability · 3A deploy ordering · 4A caption cut ·
5A full test matrix), four cross-model tension amendments from the outside voice (T1 degrade-mask ·
T2 ```table fence · T3 capability-before-content · T4 republish script), and six adopted
outside-voice additions (D7.1 paste hardening · D7.2 blank-id dedup · D7.3 freeze completeness ·
D7.4 import fingerprint · D7.5 lettering single-source · D7.6 bundle follow-on policy). The outside
voice (Claude subagent; Codex not installed) found the review's own §7 sequencing story had three
holes — the degraded interim **leaked answers as literal `{{…}}` text**, the frozen syntax could not
express `headerColumn`, and the upgrade re-import only reaches drafts. All three are closed below.
**D7 (cells hold blanks) was author-ruled before this review and was not reopened.**

**Build order (D2 ruling): Slice 0 (the freeze) is buildable immediately and is what the
150-activity catalogue authoring waits on. Slices 1–3 follow, each CI-green.**

---

## 1. The measured reality (P10 — re-derived against shipped code, 2026-08-21)

### 1a. Four independent walks already do the work — and they all stop the same way

A blank inside a table cell has to be found by four separate pieces of code. All four already
find in-band blanks **structurally, at any depth**, with no per-type field list:

| Walk | File | What it produces | Stops at |
|---|---|---|---|
| Sanitizer, layer 3 | `viewer/src/sanitize/sanitize.ts` `stripInBandSecrets` | strips answer keys before serving | **nothing — fully unconditional** |
| Client check payload | `viewer/src/container/blockIndex.ts` `collectInBandIds` | which ids the student's client submits | `looksLikeBlockArray` |
| Server grading keys | `viewer/src/server/grading/walk.ts` `collectInBandKeys` | what each id is worth | `looksLikeBlockArray` |
| Teacher answer key | `viewer/src/answer-key/extract.ts` `collectInBand` | the printed key | `looksLikeBlockArray` |

**[verified]** — all four read; additionally verified at review: the grading `visit()` runs
`collectInBandKeys` on EVERY block **before** its per-type switch, so a type unknown to the switch
still yields its keys, and the client's `unsupported` roster resolves through `familyOf`, which the
registry entry satisfies. `walk.ts`'s own header states the intent: *"a new block type that embeds
blanks is gradable the day it renders, with no registry edit."*

**So D7's "no wire bump" claim is stronger than TODOS wrote it:** grading, checking, sanitizing and
the answer key need **zero new code** — provided §1b holds, and R1's guard proves it at OUTPUT.

### 1b. The one landmine, and it is a silent-mis-grade, not a leak

`looksLikeBlockArray` (`blockIndex.ts:107`) returns true for an array whose every element has
**both a string `id` and a string `type`**, excluding the four inline types. **[verified]**

* Rows/cells shaped `{ id, cells: […] }` / `{ id, content: […] }` — **no `type` field** — are
  invisible to the heuristic, so all four walks descend. Correct behaviour, free.
* Rows/cells with a `type` field — the reflex shape — make three of the four walks **skip the
  table**, and `childBlocksOf` mis-attributes rows as blocks.

The asymmetry decides how the guard is written: **the sanitizer never stops at block arrays, so the
wrong shape never leaks an answer. It silently fails to grade one** — submitted, stored, never
scored, which `walk.ts` calls "the worst kind."

### 1c. The editor has two precedents, and they are not interchangeable

| | `Matching` (attrs blob) | `FillInBlank` (PM content) |
|---|---|---|
| Sub-content lives in | ProseMirror **attrs** | ProseMirror **content**, `(text \| mathInline \| blank)*` |
| Edited by | nested `InlineRichTextEditor` per row | the main editor itself |
| Can hold a blank? | **No** | **Yes** |

**[verified]** `InlineRichTextEditor` does not register the `Blank` node, and blank editing is the
selection-driven `BlankPopoverHost` at the main editor root (a CLAUDE.md standing constraint). An
attrs-blob table cannot host blanks without a second popover architecture. A PM-node table gets
blank authoring, the mark toolbar, math insertion, and the popover host **unchanged**. This decided
R5.

### 1d. The importer already parses pipe tables and throws the result away — and the throw-away LEAKS

**[verified by probe]** The importer's `new MarkdownIt({html:false, linkify:false})` uses the
default preset — GFM tables **on**. `| Item | Cost |\n|---|---|\n| Apples | {{3}} |` parses to the
full table token tree with `{{3}}` intact as inline text. A stray `|` in prose still parses as a
paragraph.

`markdownToTiptap.ts:653` degrades the table to ONE plain paragraph via `collectText` → `textRun` —
which is **"a plain (mark-free, blank-free) inline run"** (its own comment). ⚠ **Outside-voice
finding #1, verified: the `{{3}}` blank spec survives as literal student-visible text — the answer,
on screen and on paper**, for any table-bearing activity published before the block ships. Closed by
ruling T1 (Slice 0 masks it). *(Also: the file's header comment at :25 claims `|` isn't special
because "tables off" — false, fixed in Slice 0.)*

### 1e. Budget headroom is real but not generous

**[verified]** No table extension installed. The ProseMirror chunk (editor-only; absence-guarded
out of the student shell) is capped **292 KiB gz**, measured **265.2** — ~27 KiB headroom.
**[unmeasured]** `@tiptap/extension-table`'s gz cost. R6 is gated on measuring it, with D7.6's
follow-on policy pre-committed. *(Search check: in Tiptap v3 the four table packages merged into
ONE `@tiptap/extension-table` exposing `TableKit` — same `@tiptap/*` v3 family, so the
don't-mix-versions rule is satisfiable.)*

### 1f. The README checklist has one stale star

**[verified]** README's schema step cites `ColumnCellBlock` in `blocks/columns.ts` + a
`columns.test.ts` guard — neither exists since the universal-container arc; `Column.blocks` is
`Block[]`, so schema-side column placement is automatic. The **editor-side** star is live: the node
name joins the `column` content expression (`extensions/Columns.ts:886`), guarded by
`blockTypeGuards.test.ts` (which also demands a `representativeBlock` case). README fix is a Slice-1
task.

---

## 2. Rulings — schema

**R1. Rows and cells are TYPELESS structural records, and a guard binds that to OUTPUT.**

```
TableBlock {
  id, type: 'table',
  headerRow: boolean,        // R1b
  headerColumn: boolean,     // R1b
  columnAligns?: ('left'|'center'|'right')[],   // D7.3 — parsed from :---:, rendered by viewer+print
  showCellLabels: boolean,   // R4 — mirrors showStepLabels
  rows: [ { id, cells: [ { id, content: FillInBlankInline[] } ] } ],
  ...labelFields
}
```

No `type` on rows/cells — §1b is the reason, recorded as a comment in the schema file. **No
`caption` field (ruling 4A):** nothing in v1 authors, imports, or renders one — a dead declaration
is this repo's most-repeated defect class. Additive later WITH its full consumer set.

**The guard binds to OUTPUT** (5A's quartet, see §7): a table fixture with a cell blank must
surface that blank's key from the grading walk, the client index, and the answer-key extract — not
a test restating the schema shape.

**R1b. Two header booleans, not per-cell flags.** `headerRow` + `headerColumn`. Transposed tables
(`x` down the left) are common in Algebra I, and R10's a11y naming needs the axis. A header cell
mid-table is deliberately inexpressible.

**R2. Cell content is exactly `FillInBlankInline[]` — no nested blocks.** Text, marks, inline math,
hard breaks, blanks. Keeps the schema non-recursive (the TS7056 lesson in `inline.ts`) and every
cell walkable. Images-in-cells deferred (NOT in scope).

**R3. Grouping is POSITIONAL, row-major.** `interchangeableWithPrevious` groups with the previous
blank in document order — in a table, the previous cell left-to-right, top-to-bottom.
`blankGroupsByBlock` already groups per owning block, so this works unchanged. **The trap (answers
down a COLUMN are not adjacent) is documented in the format doc as part of the D7.3 freeze**, not
just here.

**R4. Numbering copies `faded_worked_example`; gradability is DERIVED (ruling 2A).** One problem
number for the table; blank cells letter `(a)`, `(b)`… via the D7.5 shared helper;
`showCellLabels` toggles the letters. Family/category/numbering resolve through a new
`case 'table'` in `isGradeable` (`block-predicates.ts`): **any cell contains a blank token** — the
exact `math_block` precedent (`(block.prompts?.length ?? 0) > 0`), policed by the existing
block-predicates guard against the editor's `problemNumberAt` mirror. No authored flag: a flag can
drift from content, and every drift is a phantom question or an unnumbered one. Registry:
`numbered: 'when_gradable'`.

**D7.5. Lettering is single-sourced in schema.** One helper beside `stepLetter` (row-major blank
enumeration → letters), consumed by the editor gutter, the viewer labels/a11y names, and the
printed answer key. Three hand-rolled copies is the drift N9 was written to end. *(Perf note:
`isGradeable('table')` scans cells inside render-path helpers — fine at worksheet scale; memoize
only if the perf lane ever objects.)*

---

## 3. Rulings — editor

**R5. Real ProseMirror nodes, and cells WRAP their content (ruling 1B).** `table` / `tableRow` /
`tableCell`, where each cell holds **exactly one restricted paragraph-like node** (`tableCellPara`,
content `(text | mathInline | blank)*`) — because prosemirror-tables' selection/paste machinery is
written against block-content cells, and bare-inline cells are off its paved path. Serialize
flattens the wrapper so the wire shape stays exactly R1's `content: FillInBlankInline[]` (reuse the
flattening idiom `InlineRichTextEditor.docToInline` already has — DRY). Blank authoring, the
single popover host, marks and math all work unchanged (§1c).

**R6. Adopt `@tiptap/extension-table` (TableKit), GATED + with a follow-on policy (D7.6).**
Blocking pre-build step: install on a scratch branch, `pnpm build`, read the ProseMirror chunk row.
**Pre-committed decision rule:** if post-adoption headroom is **< ~10 KiB gz**, either raise the cap
deliberately (with written ledger reasoning, per the budget file's own discipline) or split tables
into a lazily-registered editor chunk — the measurement picks the branch; a green number does not
close the question. If adoption lands over ~285 total, flip to hand-rolled nodes and R6 is
re-ruled.

Interactions to check during the build (known-hostile neighbours): `InsertZones`,
`StrictGridNormalize`/`strictGrid`, `dragHandleNested`, `RowSeamCaret`, the `column` node's
`isolating: true`.

**D7.1. Paste hardening.** Merge commands disabled and `colspan`/`rowspan` attrs stripped at node
config — a pasted merged table must not render merged while serializing unmerged (silent
see/save divergence). E2E: external paste (Sheets/Docs HTML), Enter-in-cell, plus a
flatten/unflatten round-trip pin (the wrapper asymmetry is where the bug will live).

**D7.2. Blank-id dedup on row/cell copy-paste.** Duplicating a row must remint blank ids —
duplicate ids double-attribute in the key map and client index (silent mis-grade). Verify current
paste behavior, add the remint transform if needed, pin with a test either way.

**R7. Slash-menu entry + `Columns.ts` content expression + `representativeBlock`** (§1f).

---

## 4. Rulings — viewer, print, sanitize, deploy

**R8. Sanitize spec `{ strip: [], inlineBlankSecrets: true }` — NOT `childBlocks`** (cells are not
blocks). Both server bundles regenerate; both functions redeploy.

**T3 (supersedes 3A's narrower form). CAPABILITY BEFORE CONTENT — the deploy invariant.** Both Edge
Functions (get-activity + check-activity) are deployed and verified (`list_edge_functions`)
**before the first table block exists in any draft, whichever path writes it** — the editor (so:
before the Slice-2 SPA push lands, since a push is a deploy) AND the batch importer (so: before the
Slice-3 upgrading `import:batch` run). An old server bundle meeting a table-bearing document fails
its schema parse / hits `sanitize.ts:282`'s fail-closed throw → a live 500 on activity open. Same
family as OV-7; the importer is the second author the first ruling missed.

**R9. New print treatment `'data-table'`.** Ruled grid, `breakInside: 'avoid'`, blank cells
neutralize to bare writing lines scoped inside their cell, `columnAligns` honored. Wider than the
page: **cap and shrink type, never clip or rotate** (ruled here, not discovered in a classroom).
`printExpectations` rows + screenshot baselines (Linux-authoritative).

**R10. Registry entry; fixtures one per variant (blank-bearing, read-only, header-column); a11y
story.** A blank input in a cell is named by its **row header + column header** (falling back to
the sub-part letter when the axis has no header), sourced from R1b's booleans.

---

## 5. Rulings — import (the FROZEN contract, Slice 0)

**R11 (amended T2 + D7.3). Two forms, both frozen now:**

1. **A bare GFM pipe table** — imports as `headerRow: true, headerColumn: false`. The natural
   syntax; authors type exactly what GitHub renders.
2. **A ` ```table ` fence wrapping the pipe rows**, with a `header:` key — `row` (default) |
   `column` | `both` | `none` — for transposed and headerless tables. Same fence-with-options
   grammar as ```mc / ```match; no new grammar concept. (GFM cannot express a header column, and
   the file-wins re-import would clobber hand-set axes forever — the freeze exists to catch
   exactly this.)

Sub-rulings, all resolved (a frozen contract carries no either/ors):
* **Alignment `:---:` — parse and store** as per-column `columnAligns`, rendered by viewer and
  print (right-aligned number columns are real in math tables — the field has consumers, so it
  passes the no-dead-fields bar).
* **`{{answer}}` inside a cell** → a BlankToken in that cell's content, riding the existing blank
  grammar unchanged.
* **Caption: none.** A paragraph above the table is the caption.
* **The R3 row-major grouping note ships in `docs/markdown-import-format.md`** — the doc the
  catalogue is written against — not only here.
* `docs/markdown-import-format.md` + `markdownImportPrompt.ts` + the importer move together (their
  existing drift guard forces the trio).

**T1. The interim degrade branch MASKS blank specs.** Until Slice 3 replaces it, the
`table_open` degrade renders `{{…}}` spans as underlines (keeping the warning) — a degraded
published table must never show the answer. Ships in Slice 0, before bulk authoring. *(Also fixes
the false "tables off" header comment at `markdownToTiptap.ts:25`.)*

**D7.4. The no-hand-edit condition gets a mechanical guard.** The importer records a fingerprint of
the Tiptap JSON it wrote (never the serialized ActivityDocument — CLAUDE.md's fingerprint rule);
on re-run, a draft that no longer matches was edited in the app, and the importer **refuses to
clobber that file without `--force`**, naming the drifted activities. Ships in Slice 0 — the
hand-edit window opens the moment bulk authoring starts.

**T4. A scoped republish script closes the upgrade loop.** The importer never publishes (its ruled
stance — unchanged). A separate author-run script republishes **only rows with a `source_path`
that are ALREADY published and whose draft changed in the upgrade run**, via the same
`publish_activity` RPC, with a dry-run print first. It refreshes existing publish decisions, never
makes new ones. Ships in Slice 3; the importer README's "never publishes" line gets a careful
amendment naming the refresh-vs-publish distinction.

---

## 6. Build plan — four slices (D2 ruling)

```
Slice 0  FREEZE  ✅ SHIPPED 2026-08-21 (author action: `supabase db push` for 0039)
  ├─ format doc + AI prompt: both table forms, header: key, alignment,
  │    {{blank}}-in-cell, R3 row-major note        (drift guard forces the trio)
  ├─ T1  degrade-branch masks {{…}} + fix :25 comment
  ├─ D7.4 import fingerprint + refuse-on-drift (--force)
  └─ bundle capability-inventory §4.B update (TODOS.md item, bundled here)

Slice 1  SCHEMA + VIEWER + SERVER  ✅ SHIPPED 2026-08-21 (2 author actions: deploy both functions · generate the table print baseline)
  ├─ TableBlock + factory + isGradeable('table') + D7.5 lettering helper
  ├─ registry entry + component + fixtures + a11y + numbering
  ├─ R9 print treatment + printExpectations + baselines
  ├─ R1 output-bound quartet (tests)
  ├─ bundles regenerate; ⟪AUTHOR⟫ deploy get-activity + check-activity,
  │    verify list_edge_functions             ← T3 GATE: before Slice 2 push
  └─ README checklist star fix (§1f)

Slice 2  EDITOR  ✅ SHIPPED 2026-08-21 (T3 gate discharged first: both functions live)
  ├─ R6 measurement + policy → TableKit (or hand-rolled)
  ├─ R5 nodes + tableCellPara wrap + serialize flatten/unflatten
  ├─ D7.1 paste hardening · D7.2 blank-id dedup
  └─ R7 slash menu + Columns expression + representativeBlock

Slice 3  IMPORT MAPPING + UPGRADE  ✅ SHIPPED 2026-08-21 (author: re-run import:batch, then report:stale)
  ├─ table_open → table node (replaces T1's masked degrade)
  ├─ CRITICAL regression pin: degraded imports upgrade on re-run
  ├─ ⟪AUTHOR⟫ upgrading import:batch run   ← T3 GATE already satisfied
  └─ T4 republish script (dry-run first; ⟪AUTHOR⟫ runs it)
```

**AS BUILT — Slice 0, 2026-08-21.** Three things the plan did not predict, all
found while building and all recorded here rather than in a commit message:

1. **The leak was wider than the outside voice found.** T1 was written as a fix
   to the `table_open` branch. In fact EVERY degrade path ends at
   `rawTextParagraph(node.token.content)` — unknown fences (```table itself),
   code blocks, raw HTML, and each fence parser's failed-parse fallback — and
   all of them emitted author source verbatim. The mask therefore went into the
   degrade EMITTERS (`maskBlankSpecs`, keyed on `parseBlankSpec` so it hides
   exactly what would have become a blank), which covers the paths that do not
   exist yet. Proven through the real esbuild-bundled node pipeline, not only
   vitest — this repo has a documented trap where vitest is green about code
   that cannot run under node.
2. **The drift guard forbids registering ```table before Slice 3.**
   `importFormatRegistry.test.ts` scrapes the parser for
   `node.token.info === '<tag>'` and requires every scraped tag to be a
   registered fence whose example imports with **no warnings**. So the fence is
   taught in the doc + prompt (and named in the prompt's allowlist, which is
   phrased as a prohibition) while deliberately staying out of `FENCES`. It
   joins the registry in Slice 3, when it can honour the contract. A
   tag-specific dispatch branch would have to claim a capability that does not
   exist — so the unknown-fence warning was made to name its tag instead.
3. **D7.4 needed a migration (0039).** The fingerprint cannot be file-derived —
   `tiptapToActivity` re-mints UUIDs every call — so it records what the
   importer WROTE and compares against what is THERE NOW, which is stored state.
   It hashes a KEY-SORTED serialization because `jsonb` does not preserve key
   order; without that the guard would report drift on every row of every run
   and be switched off within a day. NULL means "no fingerprint yet", so the
   guard self-arms on first re-import instead of needing a backfill.

**AS BUILT — Slice 1, 2026-08-21.** The quartet holds: `tests/tableWalks.test.ts` proves the
grading walk, the client index and the answer-key extract each return a cell blank's key, and it
DEMONSTRATES the landmine (give rows a `type` and the grading walk skips the table while the
sanitizer still strips — nothing leaks, nothing is graded, no alarm sounds). Four corrections the
plan did not anticipate:

1. **`tableBlankIds` takes a STRUCTURAL shape, not `TableBlock`.** The viewer receives the
   sanitized projection, whose blank tokens have had `answer`/`acceptableAnswers` stripped and are
   therefore not assignable to the authored type. That non-assignability IS the answer-key
   guarantee showing up in the type system, so the helper asks for `{rows?: {cells?: {content?:
   {type?, id?}[]}[]}[]}` and serves the authored document, the served one and the printed key from
   one implementation.
2. **It also had to become defensive.** `isGradeable` runs inside render-path helpers
   (`familyOf`/`categoryOf`/`pageLabel`) that are called against hollow blocks; a predicate that
   throws there takes the page down to answer "is this gradable?". Caught by the registry guard.
3. **The integrity gate needed a table case after all.** A malformed BLANK in a cell was already
   flagged by the in-band walk (no new code, as designed), but a malformed SKELETON — `rows:
   'nope'`, a `cells` object — yielded no keys at all, so the section would "check" successfully
   with the student's table answers unscored. That is the failure the gate exists for, one level
   down from the section-level `rows` check. It adds no inventory, only problems.
4. **The editor's numbering-bridge guard demanded an exemption, so it was made SELF-REMOVING.**
   A table is page-numbered but has no editor node until Slice 2, and a hand-listed exemption would
   have outlived its reason (this repo's most-repeated defect). The exemption is now DERIVED from
   whether the editor's ProseMirror schema has the node, with a loud roster test naming the
   temporary state — so Slice 2 lifts it automatically and has to acknowledge it.

Also: `serialize.ts` gained `case 'table' → null` (the union is exhaustive there, so Slice 1 does
not compile without it). It is safe ONLY because of the slice order — nothing can put a table in a
draft until Slice 2 or 3 — and it says so in a comment that calls itself a bug if read later.

**AS BUILT — Slice 2, 2026-08-21.** R6's measurement decided it, exactly as
pre-committing intended: `@tiptap/extension-table` costs **+15.2 KiB gz**
(265.9 → 281.1 against a 292 cap). Not over 285, so no pivot to hand-rolled;
**10.9 KiB of headroom survives**, a hair above D7.6's ~10 KiB threshold, so
neither the cap raise nor the lazy split fired. Recorded in the budget ledger
with the note that the NEXT `@tiptap/*` family bump is the one to measure before,
not after — and that when the margin does go, R6 already chose the lazy-chunk
branch, so it needs doing rather than re-deciding.

Four departures from the stock kit, each forced by making the editor able to
express exactly what the schema can express and nothing more:

1. **Cells hold one `tableCellPara`, not `block+`** (R5/1B as planned) — and the
   wrapper is minted and flattened in `serialize.ts`, so no `tableCellPara` ever
   reaches a stored document (pinned by Q15).
2. **No `tableHeader` node is registered** — NOT in the plan, and it follows from
   R1b. Stock TableKit registers one, which would let a document express a header
   cell in the middle of a table; the schema deliberately cannot say that, because
   header-ness is two booleans on the block. A pasted `<th>` parses into an
   ordinary cell instead. This forced a second edit the plan did not predict:
   the stock row's content is `(tableCell | tableHeader)*`, and an unregistered
   name in a content expression is a hard schema-build error, so `TableRow` is
   extended to `tableCell+`.
3. **colspan/rowspan are pinned to 1** (D7.1) rather than removed — removing them
   breaks prosemirror-tables' TableMap outright. `parseHTML` forces 1 and
   `renderHTML` emits nothing, so a merged paste can never render merged while
   saving unmerged, and fixTables repairs the ragged row. Q12 pastes a real
   merged Sheets-shaped table and asserts all three properties.
4. **The reference-panel editor needed all FOUR nodes**, not just `table`. Its
   constrained schema shares the `column` content expression, and a node whose own
   expression names another fails on the first missing link — the error surfaces
   three levels from the edit that caused it.

**D7.2 was a real, pre-existing defect and the fix is general.** Blank ids are
preserved by serialize (correctly — they are response keys) and `duplicateBlock`
copies node JSON verbatim, so duplicating ANY blank-bearing block already minted
two blanks claiming one key: the viewer renders both inputs from
`responses.blanks[id]`, so typing in one fills the other, and nothing throws.
Tables only change the odds, by making "duplicate this row" routine. Fixed as a
document-level repair pass (`BlankIdUniqueness`) rather than a paste handler,
because a duplicate can arrive by paste, Duplicate, a table row command, or an
undo — guarding the document covers the ones nobody has written yet. It
deliberately ignores EMPTY ids: an empty id is not a collision, serialize mints
one at save, and firing on every fresh insertion would replace a node under a
live NodeSelection for no benefit.

**One thing this slice did NOT touch, and a caller should know:** the editor lane
was already red before it started (`advanced-drawer.e2e.ts`, proved in a clean
worktree at `a54d391`), and CI has never run that lane at all. Filed in TODOS.md
rather than fixed here.

## 7. Test matrix (ruling 5A — the plan's test requirements)

**Forced automatically by existing guards** (do not re-write): registry entry, fixture-per-variant,
census key, column placement + `representativeBlock` round-trip, family conformance suite, sentinel
leak scan over the new fixtures, block-predicates agreement, format-doc/prompt/importer drift trio.

**Written for this arc:**

| # | Slice | Test | Kind |
|---|---|---|---|
| Q1–Q3 ✅ | 1 | R1 quartet: grading walk / client index / answer-key extract each return a cell blank's key from a table fixture | unit |
| Q4 ✅ | 1 | `isGradeable('table')`: blank-in-cell ⇒ gradable; blankless ⇒ static (both poles) | unit |
| Q5 ✅ | 1 | `interchangeableWithPrevious` spans a row boundary row-major (both orders accepted, (2,2) rejected) | unit |
| Q6 ✅ | 1 | Malformed cell content hits the integrity gate (present-with-wrong-shape ⇒ problem row) | unit |
| Q7 ✅ | 1 | Blankless table renders unnumbered, no check chrome (2A bound to rendered output) | component |
| Q8 ✅ | 1 | Print: blank cell neutralizes to writing line; no break inside table; aligns honored | print gate + baseline |
| Q9 ✅ | 1 | a11y: cell blank named by row+col headers; letter fallback | a11y lane |
| Q10 ✅ | 2 | Blank popover opens from single host inside a cell; edit persists on immediate close (flushAll) | e2e editor |
| Q11 ✅ | 2 | Drag-reorder table above AND below other blocks | e2e editor |
| Q12 ✅ | 2 | External HTML paste (merged Sheets table) → unmerged, schema-legal cells; span attrs stripped | e2e editor |
| Q13 ✅ | 2 | Enter-in-cell does not split the cell's single paragraph illegally | e2e editor |
| Q14 ✅ | 2 | Row duplication remints blank ids (uniqueness pin) | unit/e2e |
| Q15 ✅ | 2 | Cell with text+math+blank+marks round-trips byte-identical through flatten/unflatten | unit |
| Q16 ✅ | 3 | Pipe table → table node; fence form sets header axes; alignment stored | unit |
| Q17 ✅ | 3 | `{{blank}}` in a td → BlankToken in cell content | unit |
| Q18 ✅ | 3 | Stray `\|` in prose stays a paragraph (probe case pinned) | unit |
| **Q19 ✅** | 3 | **CRITICAL regression: previously-degraded (masked) import upgrades to a table node on re-run; file-wins report names the change** | unit |
| Q20 ✅ | 0 | T1 mask: degraded table shows underline, never `{{…}}`; warning retained | unit |
| Q21 ✅ | 0 | D7.4: drifted draft refuses without `--force`, named in output | unit |
| Q22 ✅ | 3 | T4 script: dry-run lists exactly already-published+changed rows; never touches never-published drafts | unit |

**AS BUILT — Slice 3, 2026-08-21. THE ARC IS COMPLETE.** Both frozen forms
import: a bare GFM pipe table (markdown-it's own tokens) and the ` ```table `
fence carrying `header: row|column|both|none` (text splitting, because a fence
body is opaque to markdown-it). Two entry points, ONE cell pipeline — both end at
`mapInline`/`fenceInline` with blanks live, and a test pins that they produce
identical output for identical content, which is the guard against the two paths
drifting. Alignment comes from the delimiter row's colons on both, and stays
ABSENT when no colon was authored. Verified through the real esbuild-bundled node
pipeline, not only vitest: zero warnings, schema-valid, both tables correct, no
mask residue.

**T4 COULD NOT BE BUILT AS RULED, and the reason is structural.** The plan had a
script republishing through `publish_activity`. That RPC authorizes via
`can_edit_activity`, which is `owner_id = auth.uid()` — and the importer runs on
a service-role key, which bypasses RLS precisely BECAUSE it has no `auth.uid()`.
So the RPC raises 'Not authorized' for any script, every time, by design. The
author ruled the amendment (2026-08-21): **report, do not republish**.
`scripts/stale-publications.mjs` (`pnpm report:stale`) names exactly which
published activities are serving content older than their own file, turning
"audit 150 activities" into "republish these three". The rejected alternative was
a SECURITY DEFINER republish callable by the service key — a SECOND writer of
publish-truth, which is the exact thing 0037's header forbids, traded for a
handful of clicks.

Its load-bearing subtlety: block ids are re-minted on every import, so comparing
raw documents would report every publication stale on every run — a report that
cries wolf is a report nobody reads. `contentSignature` strips structural ids
before comparing, but deliberately KEEPS blank ids, because a blank id is the
response key and a change there is a real change.

Two smaller corrections the plan did not predict:

1. **The Slice 0 mask tests had to move, not die.** They used tables as their
   vehicle; tables no longer degrade. The PROPERTY still matters for every
   construct that does, so they were re-pointed at unknown fences and code
   blocks. One case was deleted outright: raw HTML is unreachable as a degrade
   path because the importer runs markdown-it with `html: false`, so a `{{…}}`
   inside a `<div>` becomes a real blank rather than degraded source — a test
   asserting otherwise would have pinned a path that cannot run.
2. **The doc's "not supported" list and the capability inventory's fence COUNT**
   both had to move. The count ("the complete set is 13") was already wrong by
   five; it is now a pointer to `importFormatRegistry.FENCES`, which is bound to
   the parser in both directions — a count in prose is a claim needing its own
   guard (P11).

## 8. Failure modes (per new codepath)

| Codepath | Realistic failure | Test | Handling | Visibility |
|---|---|---|---|---|
| Walks × table | typed row/cell shape reintroduced → walks skip table | Q1–Q3 | — | **was the critical silent gap; now pinned** |
| Grading | duplicate blank ids from row paste | Q14 | remint transform | silent → pinned |
| Serve path | stale function bundle meets table doc | — | fail-closed throw (`sanitize.ts:282`) | loud 500 — prevented by T3 ordering |
| Import interim | degraded table leaks `{{answer}}` | Q20 | T1 mask | was silent-on-paper; closed |
| Re-import | app-edited draft clobbered | Q21 | D7.4 refuse | was silent; closed |
| Editor paste | merged paste renders ≠ saves | Q12 | attr strip | was silent; closed |
| Upgrade | published slice serves stale degrade | Q22 | T4 script | visible-but-stale; closed |
| Print | wide table clipped | Q8 | cap-and-shrink | ruled |

**No remaining critical gaps** (silent + untested + unhandled): none.

## 9. What already exists (reused, not rebuilt)

The four in-band walks (§1a) — reused wholesale, zero new grading/sanitize/key code · `stepLetter`
+ `labelFields` + the faded-worked-example numbering shape · `isGradeable`'s content-derivation
precedent (`math_block`) · `FillInBlank`'s content expression + `BlankPopoverHost` · markdown-it's
already-on GFM table parsing · the `underline-blanks` print behavior (scoped per-cell) ·
`publish_activity` RPC (T4 reuses, not re-implements) · the importer's fence-options grammar (T2
reuses) · the format-doc drift guard trio · every structural guard test in §7's AUTO list. Nothing
in this plan builds a parallel of an existing flow.

## 10. NOT in scope (considered, deferred, with reasons)

* **Merged cells / colspan / rowspan** — the largest complexity source in any table implementation;
  no pilot activity needed one; D7.1 actively strips them at paste.
* **`caption` field** (ruling 4A) — additive later WITH editor UI + viewer render + a11y + import
  syntax as one set; a dead field until then.
* **Images / display math / lists / nested tables in cells** (R2) — cell alphabet stays inline;
  additive later via schema union widening.
* **Per-cell shading, computed/sortable columns** — not a worksheet need.
* **Column-scoped interchangeable grouping** — R3 ships row-major; a `group` field is the
  documented additive path if a real activity ever needs it.
* **Memoizing `isGradeable('table')`** — premature; perf lane will say if ever needed.
* **Distribution** — no new artifact type; the existing bundle+deploy pipeline carries everything
  (T3 orders it).

## 11. Worktree parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| Slice 0 freeze | app/lib (importer), docs, scripts | — |
| Slice 1 schema+viewer | schema/, viewer/, supabase/functions/_shared | — |
| Slice 2 editor | app/src/editor, app/lib/serialize | Slice 1 (schema types) |
| Slice 3 import+upgrade | app/lib (importer), scripts | Slices 1+2 + T3 gate |

Lane A: Slice 0 (independent). Lane B: Slice 1 → Slice 2 → Slice 3 (sequential; shared schema
types, then shared importer files with Lane A — **conflict flag:** Slice 0 and Slice 3 both touch
`markdownToTiptap.ts`; land Slice 0 first, which D2's ordering already demands). Launch A and B's
first step in parallel if desired; this repo's parallel sessions share one checkout, so
sequential-with-small-commits is the realistic mode.

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific finding; checkbox as you ship.

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** — importer — Slice 0 freeze: format doc + prompt (both table forms, header key, alignment, R3 note) + degrade mask + `:25` comment fix + Q20
  - Surfaced by: outside voice #1/#2/#7 (T1, T2, D7.3) — Files: docs/markdown-import-format.md, packages/app/src/lib/markdownImportPrompt.ts, packages/app/src/lib/markdownToTiptap.ts — Verify: `pnpm --filter @activity/app test` (drift guard + Q20)
- [ ] **T2 (P1, human: ~3h / CC: ~40min)** — importer — D7.4 fingerprint + refuse-on-drift + Q21
  - Surfaced by: outside voice #8 — Files: scripts/batch-import.mjs — Verify: importer test run + Q21
- [ ] **T3 (P1, human: ~2d / CC: ~2h)** — schema+viewer — TableBlock (R1/R1b/R2, no caption) + isGradeable case + D7.5 helper + registry/fixtures/print/a11y + Q1–Q9
  - Surfaced by: R1–R4, 2A, 4A, 5A — Files: packages/schema/src/blocks/table.ts, block-predicates.ts, packages/viewer/src/… — Verify: `pnpm verify`
- [ ] **T4 (P1, human: ~1h / CC: ~10min)** — deploy — T3 invariant: bundles + BOTH function deploys verified before Slice 2 push or any import run
  - Surfaced by: finding 3 + outside voice #3 — Files: STATE.md pending-author-actions — Verify: `list_edge_functions`
- [ ] **T5 (P1, human: ~3d / CC: ~3h)** — editor — R5 wrapped cells + R6 gated adoption w/ D7.6 policy + D7.1 paste hardening + D7.2 id dedup + R7 wiring + Q10–Q15
  - Surfaced by: 1B, R6, outside voice #5/#6/#10 — Files: packages/app/src/editor/… , lib/serialize.ts — Verify: editor e2e lane + `pnpm verify`
- [ ] **T6 (P1, human: ~1d / CC: ~1h)** — importer — Slice 3 table mapping + Q16–Q19 (CRITICAL regression pin)
  - Surfaced by: R11 + regression rule — Files: packages/app/src/lib/markdownToTiptap.ts — Verify: `pnpm --filter @activity/app test`
- [ ] **T7 (P2, human: ~2h / CC: ~30min)** — scripts — T4 republish script (scoped, dry-run) + Q22 + importer README amendment
  - Surfaced by: outside voice #4 — Files: scripts/, supabase notes — Verify: dry-run output on live-shaped fixtures
- [ ] **T8 (P3, human: ~10min / CC: ~2min)** — docs — README checklist star fix (§1f)
  - Surfaced by: §1f — Files: README.md — Verify: reads true against layout.ts

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (AMENDED) | 15 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**CROSS-MODEL:** Outside voice ran as a Claude subagent (Codex CLI not installed) and returned 10
findings. Four became cross-model tensions the review had gotten wrong or under-scoped — the
interim degrade path leaking literal `{{answer}}` text (T1), GFM's inability to express
`headerColumn` against a frozen contract (T2), the deploy gate binding to the SPA push while the
batch importer writes drafts outside it (T3), and the upgrade re-import reaching only drafts, never
republishing (T4). All four were presented and accepted. Six further findings were adopted as a
split chain (paste hardening, blank-id dedup, freeze completeness, import fingerprint, lettering
single-source, bundle follow-on policy). Zero findings rejected; no unresolved tension.

**VERDICT:** ENG CLEARED — ready to implement, Slice 0 first.

NO UNRESOLVED DECISIONS
