# The viewer numbering surface — problem numbers on the student page

> **Status:** RULED — full `/plan-eng-review` 2026-08-20 (scope gate + 4 sections,
> decisions D2–D10). Scope ruled MAXIMAL at the complexity gate ("full
> completeness for this project, short-term pain long-term gain"), then narrowed
> once during the review: **`number` is OUT** (D5) and the walk-DRY refactor is
> deferred (D6). Both are recorded TODOs, not omissions.
>
> **Trigger:** TODOS.md item 1b, found by the answer-key slice's T7 sweep.

## 1. The problem, stated precisely

**The viewer renders no problem number for any block type.** Verified in the dev
harness 2026-08-20: `fill_in_blank`, `multiple_choice`, `matching`, `ordering`
and `number_line` all declare `numbered: 'always'` in the registry and not one
of them draws a number, on screen or on paper. `ViewerContainer`'s block slot
emits `data-block-id/-type/-category/-family/-align` and nothing about
numbering; there is no CSS counter; `pageLabel()` has no consumer outside the
schema's own tests.

**How it happened.** The implementation was the renderer's `renderNumberGutter`,
called per numbered block from `renderBlock`'s switch, writing a
`.block-problem-number` div into published HTML. It died with
`packages/renderer` at **S9 Drop 4**. The viewer — now the only student surface
— never inherited the job. The registry declaration and its guard test survived
the deletion, **so the contract still looks honoured**.

**Why the guard did not catch it.** `tests/registry.test.ts` binds `numbered` to
`block-predicates.ts` — declaration against declaration. Nothing ever bound it
to *rendered output*. That is policy **P1** exactly: a primitive is not delivered
until something calls it. The `numbered` field was a primitive nothing called,
and it read as covered for four months. **Task V6 is the guard that closes it,
and it is the single most important thing in this slice.**

**Why it matters now.** Ruling E7 (answer-key slice) made `short_answer` and
`essay` numbered on the stated premise that "numbers render on screen and on
paper from the one existing numbering walk". False for this surface. Paper-first
workflows are the reason the answer-key slice exists, and **a printed worksheet
whose questions have no numbers cannot be marked against a key** — the key
prints "1. …, 2. …" against a sheet with nothing to match them to. The
scan-grading arc's paper→block mapping has nothing to key on either.

## 2. What already exists (reused, not rebuilt)

| Thing | Where | Reused how |
|---|---|---|
| `pageLabel(block)` → `number` / `custom` / `none` | `@activity/schema` block-predicates | The label resolver. No new logic. |
| `isPageNumbered` / `isPageNumberedType` | same | Membership rule, already guarded. |
| `BlockLabel` schema (`auto`/`custom`/`none`) | `@activity/schema` label.ts | Already authored by the editor's drawer. |
| The editor's numbering control | `blockControls.ts:264` `numberingGroup` | Block-type-agnostic already; attached per type. |
| `LABELED_BLOCK_TYPES` save gate | `serialize.ts:303` | The set the 3 new types join (D8). |
| Document-order walk | `blockIndex.ts:189`, `extract.ts:198` | Same order; a fifth copy (D6). |
| Id-keyed map + lookup-by-id | `answer-key/` | The architectural shape this copies. |
| `useMemo(fn(doc), [doc])` | `ViewerContainer.tsx:175, 184` | Third instance of a proven pattern. |
| `stepLetter` (a→z→aa) | editor `problemNumbering.ts` | Moves to schema, shared (N9). |
| Faded-step labelling | `FadedWorkedExample.tsx` | Already a real `<ol>` — better than the renderer's drawn letters. **Untouched.** |
| Print `break-inside: avoid` | `viewer.css:1378-1392` | Selector is `[data-block-type='X']`, which the **wrapper carries too** — so a wrapper-hosted gutter is already covered. Verified, not assumed. |

## 3. Architecture

### 3.1 The shape: compute once, look up by id

```
  SERVED DOCUMENT (sanitized)
        │
        │  buildNumbering(doc)          ← PURE, no DOM, no React
        │  walks sections → rows → columns → blocks
        │  (does NOT descend into nested child blocks)
        ▼
  NumberingMap  =  Record<blockId, ResolvedLabel>
        │           ResolvedLabel = {kind:'number', n:3}
        │                         | {kind:'custom', text:'Warm-up'}
        │                         | (absent = no label at all)
        │
        │  useMemo in ViewerContainer, keyed on the document
        ▼
  BlockSlot(block)  ── looks itself up by block.id ──▶ renders the gutter
        │
        └─ ChildBlocks(nested)  ── never consults the map ──▶ never numbered
```

**Why a map and not a render-order closure.** The renderer used
`ctx.nextProblemNumber()`, a closure pulled during a synchronous string build.
React is not that: `BlockSlot`s render under `Suspense`, lazy block types resolve
out of order, and concurrent rendering may start, abandon and restart a subtree.
A counter incremented during render would produce numbers that depend on
scheduling — the class of bug that reproduces once in ten loads and never in a
test. The map is computed in one pure pass before anything renders, so a block's
number is a property of the document, not of the frame it painted in.

It is also the shape the answer-key channel already settled on, so there is one
idiom in this codebase for "per-block data computed beside the document".

### 3.2 Where the number renders: the shared wrapper

```
  ViewerContainer
    └── BlockSlot                       ← THE GUTTER LIVES HERE, once
          └── BlockBoundary
                └── <div.viewer-block data-block-number="3"
                         role="group" aria-labelledby={numId}>   ← D3
                      ├── <span id={numId} .viewer-block__number>3.</span>
                      └── <Component block=… />        ← untouched
```

**This is the load-bearing choice, and the dead renderer is the evidence.** It
put the gutter div inside each block renderer and the two-column grid in each
block type's CSS rule. Its own comment records what happened:

> "number-line and data-plot were MISSING this until 2026-07-29: without it the
> block stayed display:block, so its `.block-problem-number` — a block-level div
> with text-align:right — rendered as a full-width line with the number flung to
> the right margin, on its own row above the canvas. Browser-measured before the
> fix: the number div was 760px wide (the whole content column) instead of 40px.
> **Any new numbered block type must join this list — emitting the gutter div
> without a grid to put it in is the failure mode.**"

A rule that says "any new block type must remember to join this list" is a rule
that will be forgotten, and was, twice. Putting the gutter in the shared wrapper
deletes the rule: the grid is declared once on `.viewer-block[data-block-number]`
and every numbered type inherits it, including types that do not exist yet.

It also gets the nesting semantics for free. `ChildBlocks` renders nested steps
and never consults the map, which is exactly the rule the editor's walk
implements by hand (a `faded_worked_example` counts as ONE problem; its steps are
lettered by their own `<ol>` and pull nothing from the sequence).

### 3.3 The reference panel excludes itself

`BlockSlot` is used twice — once for section content, once for
`doc.referencePanel.blocks`. A formula sheet must not be numbered. It isn't,
structurally: `buildNumbering` walks `doc.sections` only, so a reference-panel
block is simply absent from the map and the lookup returns nothing. **The map is
the gate**, not a `numbered={false}` prop someone must remember to pass — the
same posture as the answer-key provider's absence being the leak guarantee.

## 4. Decisions (N1–N10, as ruled)

- **N1 — Numbering is a pure pass producing an id-keyed map**, computed once per
  document, not a counter incremented during render. §3.1.
- **N2 — The gutter renders in the shared `BlockSlot` wrapper**, not per block
  component; the grid is declared once. §3.2.
- **N3 — The reference panel is excluded structurally** (built from
  `doc.sections`; the map is the gate). §3.3.
- **N4 — Order is document order** — sections → rows → columns → blocks, i.e.
  **column-major within a multi-column row**. Same walk `blockIndex` and the
  answer-key extractor use. **Verified: `applyPrintShuffles`
  (`print/printShuffle.ts:42-100`) only shuffles declared `print.shuffled` fields
  *within* a block and never touches `column.blocks` order** — so one numbering
  is correct for every printed version, and the answer key stays aligned.
- **N5 — All three label modes are honoured, via the existing `pageLabel()`.**
  `auto` → the next sequence number, consumes a slot. `custom` → the authored
  text, out of sequence. `none` → nothing rendered, out of sequence.
  **⚠ AMENDED BY D5: the manual `number` override is NOT implemented.** It is a
  schema field with no writer (`serialize.ts` never emits it, no editor control,
  no importer key) and the editor's walk already ignores it. Recorded as a TODO
  with its open relabel-vs-restart semantics; the viewer numbers by sequence.
- **N6 — SCHEMA: `labelFields` on `ShortAnswerBlock`, `EssayBlock` and
  `FadedWorkedExampleBlock`** — the three numbered types that cannot carry a
  label today, so E7's two new blocks currently have no opt-out.
  **⚠ AMENDED BY D8 — this is a FOUR-LINK CHAIN, not one change:**
  1. schema: `labelFields` on the three blocks;
  2. Tiptap: a `label` attr on the three nodes;
  3. **`serialize.ts:303` `LABELED_BLOCK_TYPES` gains all three** — miss this and
     the drawer offers "None", the author picks it, and the first autosave
     silently discards it. This is the identical seam that overturned the
     answer-key design's premise;
  4. `blockControls.ts` attaches `numberingGroup` to the three descriptors.
  Each link gets the import → save → **reload → resave** round-trip test; the
  fence and unit layers stop before the save and cannot see link 3 fail.
  **Consequence, derived not felt** (learning
  `bundle-drift-claims-derive-from-rule-not-size`): CLAUDE.md's
  regenerate-both-bundles rule is unconditional on `packages/schema` changes, so
  both bundles regenerate in the same commit. **`SANITIZER_REV` should NOT
  move** — it is computed from the registry's sanitize declarations plus the
  secret-field lists, and `label` is neither a secret nor a strip entry — so no
  read-cache orphaning and the redeploy is optional-not-urgent. **That claim is
  verified by running the bundle script and diffing the rev, never asserted.**
- **N7 — Sub-part lettering returns**: `(a) ___ (b) ___` before each blank of a
  **numbered, multi-blank** `fill_in_blank`. Off for single-blank problems, off
  for `custom`/`none` labels, off inside a faded step. The letter is **derived at
  render from position, never stored** — the same rule the answer key follows for
  matching letters and ordering positions.
- **N8 — a11y: the number is announced ONCE, from the wrapper** (ruled D3). The
  numbered wrapper carries `role="group"` and is labelled by the rendered number,
  so a screen reader announces "Problem 3" on entering the block — for every
  numbered type, from the one place N2 already touches. Per-component accessible
  names were rejected: they need ~10 component edits, have no answer for a block
  with no focusable control, and would make a ten-radio multiple choice announce
  the number ten times. Controls keep their within-block detail ("blank 2 of 3",
  and with N7, "(b)").
  **⚠ D7: two registry a11y stories describe the REJECTED mechanism and must be
  amended in the same commit** (policy P5) — `registry.ts:157` (fill_in_blank,
  `'a label naming its problem and sub-part ("blank (a), problem 3")'`) and
  `registry.ts:105` (math_block, `'labeled with its position ("gap 1 of 2 in
  problem 3")'`). Both promise the CONTROL carries the number; the shipped
  mechanism is the group. Rewrite to describe the group, and let V6's a11y row
  be the guard that keeps them true.
- **N9 — `stepLetter` moves to `@activity/schema`.** The editor has a copy, the
  renderer's died, and the viewer now needs one. Schema is already the shared home
  for `isPageNumbered`/`pageLabel`, and both packages depend on it. The editor
  imports it rather than keeping its own.
- **N10 — Print screenshot baselines change and that is a sequenced author
  action.** ~10 of the 22 committed baselines gain a number. They are
  Linux/CI-authoritative (ruling S5-7); regeneration is a manual
  `workflow_dispatch` producing an artifact a human commits. **CI's print-gates
  job stays red between the code landing and the baselines landing.**

## 5. Edge cases

| Case | Behaviour | Why |
|---|---|---|
| Numbered block in a multi-column row | Column-major (col 1 fully, then col 2) | Matches every other walk (N4) |
| `custom` label mid-document | Shows text, does NOT consume a slot | Next auto block keeps the running count |
| `none` label | Renders no gutter at all | Still graded, still reviewable — presentation only |
| Display-mode graph / data_plot | Not numbered | `pageLabel` → none via `isPageNumbered` |
| `math_block` with no prompts | Not numbered | Same |
| Document with zero numbered blocks | No gutter, no grid, no layout shift | Map empty; attribute absent |
| Reference-panel block of a numbered type | Not numbered | Absent from the map (N3) |
| Nested step inside a faded example | Not numbered | `ChildBlocks` never consults the map |
| A future block type declared numbered | Numbered automatically | No per-type edit — the point of N2 |
| Single-blank fill_in_blank | No sub-part letters | `total >= 2` (N7) |
| A document carrying `number: 7` | Prints its sequence position | N5 as amended; recorded TODO |

## 6. Failure modes per new codepath

| Codepath | Realistic failure | Test? | Handled? | Visible? |
|---|---|---|---|---|
| `buildNumbering` walk | miscounts across columns | unit, column-major fixture | pure fn | test only |
| Gutter render | numbered type draws nothing | **V6 rendered-output guard** | shared wrapper | CI red |
| Label modes | `none` still prints a number | unit + component | `pageLabel` | teacher sees it on paper |
| **`label` save path (link 3)** | **attr silently dropped on autosave** | **round-trip, CRITICAL** | `LABELED_BLOCK_TYPES` | **silent → test-only guard** |
| Sub-part letters | letters on a single-blank problem | unit | `total >= 2` | visual |
| a11y group | number read as loose text / not at all | a11y e2e | `role=group` + label | screen reader |
| Schema add | bundle drift | CI drift guard | same-commit regen | CI red |
| Baselines | stale images | print-gates job | manual regen (N10) | CI red |

**One critical gap, and it is handled:** the `label` save path fails silently
with no user-visible symptom until a worksheet prints wrong. It has no runtime
error handling and cannot — the round-trip test is the only thing that can see
it. That is why D8 made it a CRITICAL pin rather than ordinary coverage.

## 7. Implementation tasks

- [ ] **V1 (P1, human: ~1d / CC: ~25min)** — schema — `labelFields` on
      short_answer / essay / faded_worked_example (N6 link 1); `stepLetter` moved
      in and re-exported (N9); editor imports it. Regenerate BOTH bundles same
      commit; **verify `SANITIZER_REV` did not move and record the observed
      value.** Verify: schema tests, bundle drift clean.
- [ ] **V2 (P1, human: ~1d / CC: ~20min)** — `viewer/src/numbering/numbering.ts`
      — `buildNumbering`, pure, plus its unit suite (order, column-major, all
      three label modes, nested exclusion, reference-panel exclusion, empty doc).
      Writes its own document walk (D6); the DRY debt is a recorded TODO.
- [ ] **V3 (P1, human: ~1d / CC: ~25min)** — `ViewerContainer` — `useMemo` the
      map, thread to `BlockSlot`, render the gutter with `role="group"` +
      `aria-labelledby` (N8); CSS grid on `.viewer-block[data-block-number]`
      (screen + print). Verify: component tests, print-rules e2e.
- [ ] **V4 (P1, human: ~1d / CC: ~20min)** — **the `label` chain, links 2-4**
      (D8) — Tiptap attr on the three nodes, the three types added to
      `LABELED_BLOCK_TYPES`, `numberingGroup` attached in their descriptors.
      Verify: **import → save → reload → resave round-trip per link. CRITICAL.**
      **⚠ PLUS the CLASS fix (DX review D2):** `LABELED_BLOCK_TYPES`
      ([serialize.ts:304](../../packages/app/src/lib/serialize.ts)) is a
      hand-maintained set read by both save directions (`:336`, `:347`) and
      **no test references it** — verified by grep. The round-trip tests prove
      the three types this slice adds; they say nothing about the ninth. Either
      DERIVE the set from the schema (every Block option whose shape carries a
      `label` key) or add a guard that fails when a `labelFields`-bearing block
      is missing from it. Same pattern `registry.test.ts` uses against the Block
      union and `export-reachability.test.mjs` uses against callers. **This is
      the same shape as the bug that caused this whole slice** — the renderer's
      "any new numbered block type must join this list" was forgotten twice.
- [ ] **V5 (P2, human: ~4h / CC: ~15min)** — sub-part lettering in
      `FillInBlank.tsx` (N7) + unit rows for all four branches.
- [ ] **V6 (P1, human: ~4h / CC: ~15min)** — **the guard that would have caught
      this**: for every registry type declaring `numbered: 'always'`, assert the
      rendered fixture actually produces a number. Binds the declaration to
      OUTPUT, not to another declaration (P1). Plus the `printExpectations` rows
      and the a11y e2e row that T7 could not write, and the D7 story amendments.
- [ ] **V7 (P1, author action)** — regenerate the print baselines on Linux (N10)
      via `workflow_dispatch`; commit the artifact. CI print-gates is red until
      this lands. **The full sequence, because the plan previously named one
      step of seven** (DX review D4): Actions → the CI workflow → Run workflow →
      tick `update_print_baselines` → wait → download + unzip the artifact into
      `packages/app/e2e/print-baselines.e2e.ts-snapshots/` → commit.
      **⚠ RULED at D4: the red window is ACCEPTED, not engineered away.** A
      short-lived branch would have kept `main` green, and that was declined.
      So the mitigation is a STATE note, and it must be specific enough to be
      actionable: record the run id of the expected-red print-gates run, so a
      later session can tell the known red from a new one instead of assuming.
- [x] **V9 (P1) — SHIPPED 2026-08-20, ahead of V1** — repo DX
      (DX review D3) — add `pnpm verify` running exactly CI's `check` job
      (typecheck · lint · test · build · `scripts/check-perf-budget.mjs` ·
      `node --test scripts/tests/*.test.mjs` · both bundle-drift checks), plus a
      `test:e2e:print` lane script so the ninth gate stops being a bare
      `playwright test print-` prefix living only in ci.yml. Document both in
      README's Common commands, and cross-reference ci.yml ↔ package.json so the
      two cannot drift silently. **Why it is first:** every "Verify:" line in
      this plan is untrustworthy until "green locally" and "green in CI" mean
      the same thing.
      **What shipped:** `scripts/verify-local.mjs` — 8 gates in CI's order, with
      the build env READ FROM ci.yml rather than retyped (a fourth hand-typed
      copy of `VITE_SUPABASE_URL` would have been a new drift source in the very
      script whose job is parity), `--bail`, and a failure report naming the CI
      step plus the single re-run command. Plus `test:e2e:print` — deliberately
      WITHOUT `PRINT_BASELINES=1`, so the Linux-authoritative baselines skip
      locally instead of failing on macOS font rasterisation (confirmed: 63
      passed, 22 skipped).
      **Beyond the original scope, deliberately:** a cross-referencing comment is
      too weak a hold for a hand-maintained mirror of CI — the same defect shape
      as D2, and it would have been hypocritical to ship it one commit after
      raising that finding. `scripts/tests/verify-parity.test.mjs` now fails when
      a check-job gate is not covered by `pnpm verify`, when `pnpm verify` names
      a step CI no longer has, or when a setup exemption goes stale. Script tests
      54 → 58.
      **Both paths liveness-proven (P3):** a forced bundle drift exercised the
      drift gate's failure output — and revealed it was dumping 81KB of base64
      sourcemap, now suppressed for generated bundles; and a probe gate added to
      ci.yml turned the parity guard red, then green on revert.
- [ ] **V8 (P2, human: ~1h / CC: ~10min)** — docs — TODOS 1b closed, the two new
      TODOs added (D9, D10), STATE updated, the `printExpectations.ts`
      cannot-declare-yet note replaced, `problem-answer-key.md`'s E7 correction
      annotated as resolved.

**Sequencing:** **V9 first** (it makes every other task's "Verify:" line
checkable), then V1 → V2 → V3 → {V4, V5, V6} → V7. V8 last.

## 7b. Developer perspective (DX review, 2026-08-20)

The developer this plan serves is **the next session picking up V1–V9 cold** —
as likely an AI session as the author, since CLAUDE.md / STATE.md / TODOS.md
already exist as an onboarding surface. Traced against the real repo:

> I read the plan. V1 says "regenerate BOTH bundles; verify `SANITIZER_REV` did
> not move." I run `pnpm bundle:viewer-server` — it prints a size and exits 0.
> Did the rev move? The script does not say.
>
> I finish V1–V4. I run `pnpm test`, `pnpm typecheck`, `pnpm lint` — green,
> exactly what README's Common commands lists. I push. CI comes back red on
> **perf budgets**, **budget script tests**, and **print gates** — three gates
> the README never mentioned. I learn the definition of done from a YAML file.
>
> Then V7. The plan says "regenerate via `workflow_dispatch`." Which workflow?
> I have to know to tick an input, download a zip, unzip it to the right path,
> and commit. Meanwhile CI is red and looks broken.

| Stage | Friction | Ruling |
|---|---|---|
| Orient (CLAUDE.md → STATE → plan) | none — the strongest part of this repo's DX | ok |
| Implement V1–V4 | link 3 has no guard | **fixed** (V4, D2) |
| Verify locally | README documents 6 of CI's 9 gates | **fixed** (V9, D3) |
| V7 baselines | 7 steps, 1 documented; red looks like broken | **accepted** (D4) — runbook written, red window kept |
| Hand off | none — STATE/TODOS discipline is established | ok |

## 8. Worktree parallelization strategy

| Step | Modules touched | Depends on |
|---|---|---|
| V1 | `packages/schema/`, both bundles | — |
| V2 | `packages/viewer/src/numbering/` | V1 (`stepLetter`) |
| V3 | `packages/viewer/src/container/`, `styles/` | V2 |
| V4 | `packages/app/src/editor/`, `src/lib/serialize.ts` | V1 |
| V5 | `packages/viewer/src/blocks/` | V2 |
| V6 | `packages/viewer/tests/`, `packages/app/e2e/` | V3, V5 |
| V7 | baselines (CI) | V3, V5 |

**Lane A:** V1 → V2 → V3 (sequential; shared viewer render path)
**Lane B:** V4 (independent — `packages/app/` only, after V1)
**Lane C:** V5 (independent — one viewer block component, after V2)

**Execution:** V1 alone first (everything depends on it). Then launch **Lane B
in parallel with A's V2→V3**, and **Lane C once V2 lands**. Converge on V6, then
V7. **Conflict flag: none** — Lane B is `packages/app/`, Lane C is one file in
`packages/viewer/src/blocks/`, Lane A is `container/` + `styles/`. The only
shared ancestor is V1's schema change, which all three wait on.

## 9. NOT in scope

- **The manual `number` override** — cut at D5; a writer-less field with an
  unresolved relabel-vs-restart question. Recorded TODO (D9).
- **Extracting the shared document walk** — deferred at D6; the sanitizer's blast
  radius does not belong in this slice. Recorded TODO (D10).
- **Numbering in the EDITOR** — already works (`problemNumberAt` + gutter
  NodeViews); untouched beyond the `stepLetter` import (N9) and V4's four links.
- **Per-version numbering** — unnecessary; shuffles never reorder blocks (N4).
- **Reviving `problem`** — still dead (answer-key ruling E1).
- **A settings UI beyond `numberingGroup`** — the existing control is
  block-type-agnostic; V4 attaches it, nothing new is designed.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean | 5 issues, 1 critical gap (handled) |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | clean | score 5/10 → 8/10, 3 findings, 2 fixed 1 accepted |

- **Scope:** challenged at the complexity gate (12 files / 2 new modules).
  Author ruled MAXIMAL, then narrowed twice during review (D5 cut `number`,
  D6 deferred the walk refactor).
- **DX:** contributor-scoped (the developer is the next session, not an external
  adopter — the competitive-benchmark and magical-moment passes were declined as
  having no honest subject here). Initial 5/10 → 8/10.
  **Fixed:** the unguarded `LABELED_BLOCK_TYPES` set → V4's class fix;
  no command meaning "CI would pass" → V9's `pnpm verify`.
  **Accepted as-is:** V7's expected-red CI window, mitigated by a STATE note
  carrying the run id rather than by a branch.
  Remaining 2 points: the red window (by choice) and `bundle:*` still not
  reporting whether `SANITIZER_REV` moved.
- **Outside voice:** SKIPPED — Codex not installed, and the session carries a
  standing rule against dispatching the Agent tool unprompted. Install for
  cross-model coverage: `npm install -g @openai/codex`.
- **VERDICT:** ENG + DX CLEARED — ready to implement, **starting with V9**.
  V6 remains the load-bearing task: it binds `numbered` to rendered output and
  closes the P1 gap that let this surface go missing for four months. V4's class
  fix is its sibling — the same "remember to join this list" defect, one file over.

NO UNRESOLVED DECISIONS
