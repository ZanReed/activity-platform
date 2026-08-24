# Misconception sensors — ids on distractors, live graph feedback, unit-bearing blanks

**Status: SHIPPED and LIVE (2026-08-25).** Greenlit 2026-08-24 ("all yes" on
the nine decisions), amended by `/plan-eng-review` and `/plan-devex-review`,
built the same arc. Both Edge Functions are deployed and code-verified, so an
authored binding records a misconception id on a real student's check.

**Read "What the BUILD corrected" below, not just the decisions** — three
things only writing the code could establish, including a bundle-cost claim
from the eng review that measurement falsified. **Two pieces are deliberately
NOT built** and each has a named discharger: the units slice (decisions 7–8,
syntax UNPINNED — see X2's three tokenizer collisions) and the graph nudge
text (X3). 12 of 14 tasks done; T5/T6 closed by ruling rather than by code.

## Why

The catalogue builder's wishlist (TODOS → "THE AUTHOR'S CAPABILITY WISHLIST")
ranked two needs above everything else, both data-layer:

1. **A way to bind a distractor to a named misconception id in the markdown.**
   Verified truly absent 2026-08-24 — the feedback *text* channels exist
   (`!wrong :: message`, mc `:: feedback`, graph `mistake:`) but no id field
   exists at any layer. Without it, every authored sensor is prose the platform
   cannot aggregate.
2. **Unit-bearing numeric blanks.** The units-dropped misconception family runs
   the full curriculum spine, but units live in prose, so every units-requiring
   item is rubric-graded and the signal is only deferred data.

The same slice discharges the author's orphan rulings (DECISIONS.md → "The last
orphan classes", 2026-08-24): graph `mistakeFeedback`/`builtinFeedback` are
WIRED here; `partialCredit`, `hasConfidenceRating` (×7 block types), and
`allowTargetReuse` are DELETED end-to-end.

## The nine ruled decisions

1. **Binding sites in v1:** blank `!wrong` entries, MC choices, graph
   `mistake:` entries. No separate `misconception:` fence line — the
   third-segment syntax covers all three sites.
2. **Syntax:** an optional third `::` segment, accepted as an id **only when it
   matches the id pattern**; otherwise it stays part of the feedback text, so
   no existing activity changes meaning.
   `!0.5 :: divided the wrong way :: mis.roc.uses-endpoint-value`.
3. **Ids are opaque tags** — pattern `mis.` + dot-separated kebab segments.
   Import warns on a nonconforming third segment that starts with `mis.`;
   never errors. The registry lives in the authoring project; the platform
   does not own the taxonomy.
4. **The id lands on `CheckItemResult.misconceptionId?`** — returned to the
   client AND stored verbatim in `section_checks.verdicts` (S4-B4 already
   stores the map as sent, so the sensor data is durable with zero new storage
   machinery). The id is opaque metadata; it reveals nothing about answers.
5. **Graph wiring:** verdict stays boolean. On incorrect,
   `server/grading/graphs.ts` consults authored `mistake:` entries first, then
   graph-kit's `mistakes.ts` classifier **only when the block's
   `builtinFeedback` is on**. The matched entry's feedback + id ride the
   verdict. This makes `mistakes.ts` production-reachable for the first time.
6. **The guard:** a grading test checks a wrong answer against a mapped
   distractor and asserts the id in the returned wire and the stored-verdicts
   shape — mutation-tested the day it is written (revert the wiring → red).
7. **Units: single input, no separate unit box.** `{{=1.5 unit: km/h}}`; the
   student types "1.5 km/h" into the one blank. Load-bearing for the sensor:
   units-dropped only exists if forgetting the unit is possible. Wire
   untouched (`blanks: id → string`).
8. **Units grading:** the server splits a trailing unit token before the
   numeric parse. Value ✓ + unit ✓ → correct. Value ✓ + unit missing →
   incorrect via a built-in `unit_missing` detection; `!nounit :: feedback ::
   mis.x` is the reserved author binding for that case. Unit comparison is
   normalization + authored alternates (`unit: km/h|kph`) only — **no
   dimensional conversion** (1500 m/h is wrong, not equivalent).
9. **Sequencing:** the three ruled deletions run as the arc's first commit so
   one bundle-regen + redeploy set covers deletions and additions.

## Amendments from the eng review (2026-08-24, `/plan-eng-review`)

The nine decisions above stand as ratified except where noted. Ten findings,
all resolved by the author during the review; the four marked ⚡ came from the
**outside voice** (independent Claude subagent — Codex not installed) and are
the ones the in-house review missed.

- **A1 — MC ids become a LIST.** `misconceptionId?: string` → `misconceptionIds?:
  string[]` on `CheckItemResult`. A multi-select student who picks two mapped
  distractors demonstrated two misconceptions; the single-string shape dropped
  one silently and would have forced a dual-shape migration once rows existed.
  Blanks/graphs emit a one-element array. Amends decision 4.
- **A2 — delete the widget's dead `annotateMistake`** (`graph-question.ts`
  759-797) rather than leave two copies of the authored-then-builtin
  precedence. Verified dead in production: the viewer mounts the widget with no
  answerKey (`kitSurfaces.ts:97`), so its first line returns early. Only
  `DevGraphQuestion` can reach it.
- **C1 — bound the id**: `z.string().min(1).max(120)`. Decision 3's opaqueness
  is preserved (no pattern enforcement); this bounds SHAPE, not meaning,
  because the importer's warning gates only one of three entry paths
  (importer / editor / raw jsonb).
- **C2 — teach `check/mock.ts` to emit ids now** (policy P2: mocks derive from
  production, never retyped).
- **T1 — close all 10 untested branches** on the three new selectors, including
  the cross-family null guard (`number_line`/`data_plot` must never pick up a
  graph annotation) and unselected-distractor silence (emitting an id for a
  choice the student did NOT select would record a misconception nobody
  demonstrated).
- **P1 — bundle growth measured and recorded**: grading bundle 2536.2 → 2644.8
  KiB (ceiling 4000), no MathLive/JSXGraph — the pure-subpath rule held. See X3
  for what that growth is actually attributable to.
- ⚡ **X1 — THE PREMISE FIX. Decision 4's "durable with zero new storage
  machinery" was FALSE against the ruled retention design.**
  `prune_section_checks` (0035:156) deletes every check row not in
  `section_checks_latest` — and misconception ids appear only on WRONG answers,
  which are overwhelmingly the non-latest attempts. The aggregate designed to
  outlive the prune, `check_item_rollup_daily`
  ([check-retention-and-rollup.md:291](check-retention-and-rollup.md)), is
  specified as verdict counts only with **no misconception dimension**. So the
  sensor wrote into rows scheduled for deletion, and the survivor could not
  carry the signal. **Ruled: amend the rollup spec NOW** (add a misconception
  dimension) and add a step to the check-rollup ARMING checklist that blocks
  arming until misconceptions roll up. Deleted student rows do not come back.
- ⚡ **X2 — serialize + importer land in the SAME commit as the schema field.**
  `serialize.ts:173-185` rebuilds `mistakeFeedback` entries from a closed
  `{match, feedback}` whitelist, so `misconceptionId` is silently dropped on
  save. The editor auto-deploys from `main`, so committing the schema field
  alone opens a live window where any teacher opening an imported activity and
  saving ERASES every id — no error, no warning, no test. This also corrects
  the build order: the authoring half is what the catalogue author is blocked
  on; the server half delivers nothing until an aggregation surface exists.
- ⚡ **X3 — SPLIT graph nudges out of this arc.** Decision 5 bundled two
  things: the id binding and first-ever student-visible nudge text on graph
  blocks, defaulting ON for every already-published graph activity. Keep
  authored `mistake:` → id matching here; the builtin classifier TEXT becomes
  its own slice with its own UX pass. The 2026-08-24 wire ruling still holds —
  it lands in two steps.

  ⚠ **The bundle-cost half of this argument was WRONG, corrected by
  measurement 2026-08-25.** The outside voice attributed the whole +108 KiB to
  the nudge feature; building it both ways shows otherwise:

  | build | grading bundle |
  |---|---|
  | HEAD, pre-arc | 2536.2 KiB |
  | + authored matching + builtin classifiers | 2644.8 KiB |
  | + authored matching only (shipped) | **2634.3 KiB** |

  Splitting the classifiers out saved **10.5 KiB**, not 108. The ~98 KiB is
  `parseGraphFormula`, pulled by `compileMistakeMatchers` — the AUTHORED
  matching, which is the id feature itself. Any graph binding costs it; the
  nudge slice will add ~10 KiB more, not ~108. **The split still stands on its
  other ground** (a student-visible behavior change deserves its own UX pass),
  which is the reason that survives. Recorded because "a claim with a number
  attached is still a claim" — this one came from a review and went unchecked
  into a ruling.
- **X4 AMENDED 2026-08-25 (author): the unmatched-wrong SIGNAL is DROPPED in
  favour of an offline recompute; the reconciliation half ships.** The signal
  would have written a field recording "this wrong answer matched no mapped
  distractor" — but that is **derivable from what is already stored**, and
  storing derivable data on the check hot path buys nothing:
  `section_checks` keeps the student's `responses` AND the
  `activity_version_id`, and a version's document is immutable, so for any
  stored attempt you can replay which bindings the item carried and whether
  the answer matched one. Match rate is therefore a query written whenever
  someone wants it, against history that already exists — including history
  recorded before the query was written, which a wire field could never cover.
  ⚠ **One dependency this inherits:** the recompute needs the ATTEMPT rows, so
  it must run (or be materialized) before `prune_section_checks` deletes
  non-latest attempts — the same X1 blocker, one more reason arming waits.
- ⚡ **X4 (original ruling) — the sensor must be able to report its own health.** Every failure
  mode is silent: a typo'd prefix (`misc.roc.x`) does not start with `mis.` so
  it does not even warn and becomes feedback text; blank matching is normalized
  exact-string, so `!0.5` never fires for a student who types `.5`; graph
  matchers compile unparseable strings to never-match predicates by design
  (`mistakes.ts:107-110`); two ids differing by one character are two
  misconceptions forever. **Ship both**: a `report:misconceptions` script
  listing distinct ids with counts across drafts (reconcile against the
  catalogue registry, catch typos before publish) AND an unmatched-wrong
  signal so match rate is measurable in live data. Without one, "students did
  not make that mistake" and "the sensor was broken" are permanently
  indistinguishable.

**Mechanical defects fixed during the review** (bugs, not decisions): a NUL byte
in `grading-section.test.ts:126` that made git treat the file as binary — which
is why the new guard tests were invisible to diff review; `viewer-server.bundle.js`
not regenerated after the registry strip change (CI would have failed); and a
stray untracked `scratch_index_backup.ts` at the repo root (OV-DX-2: a duplicate
is a resurrection path).

**Considered and KEPT as ratified:** the outside voice argued for dropping the
client-return leg of decision 4 (store-only), on the grounds that no consumer
exists and the id is a retry hint. Kept: post-check feedback text is already
returned and is strictly more revealing than an opaque tag, and the
stored-equals-returned invariant (S4-B4 passes `result.items` verbatim as
`p_verdicts`) is worth more than the marginal hint.

**Open questions inherited by the units slice (decisions 7-8), unresolved:**
`!nounit` has no dispatch mechanism — `mistakeFeedback` entries are
`{match, feedback, misconceptionId}` with no "detector, not literal" slot, and
matching is plain string equality, so a student typing `!nounit` would match it.
And nothing in a rendered blank signals that a unit is expected
(`FillInBlank.tsx` is a bare text input sized for numbers), so "unit missing"
risks measuring mind-reading rather than the misconception. Settle both before
building the units slice.

## Build order

1. **Deletions** — `partialCredit`, `hasConfidenceRating` (schema ×7, editor
   setting, `submission.ts` confidence slot), `allowTargetReuse` (schema,
   editor control) + every comment citing them (P5). Both bundles regenerate.
2. **Ids on the schema + importer + sanitizer** — `misconceptionId?` on blank
   `mistakeFeedback` entries, MC choices, graph `mistake` entries; importer
   third-segment parsing; sanitize keeps stripping these fields pre-check
   (ids ride the already-stripped shapes; leak fixture extended);
   `SANITIZER_REV` bump.
3. **Grading** — blanks + choices return `misconceptionId` on match; graph
   grading consults `mistake:` entries + gated classifier (decision 5).
   Guard test (decision 6), mutation-tested.
4. **Unit blanks** — schema `unit` on numeric blanks, importer `unit:` +
   `!nounit`, server-side unit split + compare, `unit_missing` binding.
   Guard: value-right-unit-missing produces incorrect + the bound id.
5. **Docs** — `docs/markdown-import-format.md` (+ importer prompt), compliance
   check (no personal-data change → no data-map/retention edit expected).

**Owed at the end:** `pnpm bundle:viewer-server` + `pnpm bundle:grading-server`
(same commits as their source changes), redeploys `deploy:get-activity` +
`deploy:check` as pending author actions, and the format-doc update mirrored in
`markdownImportPrompt.ts`.

⚠ **ORDERING (OV-7, raised by the outside voice):** `choices[].misconceptionId`
is newly stripped by the sanitizer, but the DEPLOYED `get-activity` still runs
the old strip list. An id on a distractor is a statement that this choice is an
anticipated wrong answer — so an activity published with ids BEFORE the
redeploy serves pre-check clients a distractor map. **`deploy:get-activity`
must land before any activity carrying ids is published**, not "at the end".

## NOT in scope (considered, deferred, with reasons)

- **Aggregation / analytics surface** — no teacher-facing misconception view.
  The arc's job is to make the signal exist and survive; reading it is a later
  arc that now has a named blocker (X1's rollup amendment).
- **Graph builtin classifier TEXT** — split out by X3 into its own slice with a
  UX pass, since it is student-visible and carries the whole bundle cost.
- **Units slice (decisions 7-8)** — stays in this arc's plan but builds after
  ids, and only once the two open questions above are settled.
- **Taxonomy validation beyond a length cap** — decision 3 rules the platform
  does not own the taxonomy; C1 bounds shape only.
- **`answerType`'s stale registry claim** (`registry.ts:43` says it "shapes the
  input (numeric keyboards)"; no viewer code reads it) — a pre-existing P11
  violation in a file this arc edits. Out of scope, filed separately.

## What already exists (reused, not rebuilt)

- `graph-kit/src/mistakes.ts` — the authored-matcher compiler and classifier
  catalogue. This arc is its FIRST production caller; it was written for the
  widget path that never runs graded.
- `section_checks.verdicts` jsonb + `record_check` — the handler already passes
  graded items verbatim, so ids need no migration to be stored (but see X1 for
  why stored ≠ durable).
- Blank `mistakeFeedback` and MC per-choice `feedback` — the id is one optional
  field on shapes that already exist and already flow to the wire.
- `selectBlankFeedback` / `selectChoiceFeedback` precedence — the id selectors
  ride the same gates rather than inventing new ones.

## Amendments from the DX review (2026-08-25, `/plan-devex-review`, EXPANSION mode)

**Persona (ruled):** AI-first, human touch-up — the primary writer is the
author's AI builder drafting from the embedded prompt; the author supervises
via `pnpm import:batch --dry-run` and hand-edits. **Competitive position:** a
text-native, AI-writable misconception taxonomy is near-unique (GIFT has
per-distractor feedback but no machine-readable ids; QTI has ids but
hand-unwritable XML). **TTHW target: Champion** — a binding is VERIFIED live
in the same dry-run that imports it. **Magical moment:** the dry-run binding
manifest ("unit-rate.md: 6 bindings → mis.roc.uses-endpoint-value ×2 … all
can fire").

### Ruled in this review

- **D7 — typo gate:** warn on ANY id-shaped third-segment (a single spaceless
  token with ≥2 dot-separated segments of ≥2 chars — so `e.g.` never warns)
  that is not a valid `mis.*` id. Catches prefix typos (`msi.`) the ratified
  mis.-prefixed-only warning missed. Refines decision 3.
- **D8 — numeric-aware mistake matching:** on `answerType: numeric` blanks,
  `!` matches compare numerically within the blank's tolerance (reusing the
  SERVER's normalizer — P2 — never a re-implementation); non-parseable
  matches keep exact-string. Feedback-only change, marks untouched; golden
  corpus rows updated deliberately. Kills the `!0.5`-vs-`1/2` dead-binding
  class.
- **D9 + X3 — registry validation, strict batch:** import:batch accepts a
  registry file of valid ids and warns on unknowns; **in batch mode the
  registry is REQUIRED for binding-bearing files and `--strict` turns binding
  warnings into exit 1** (batch exits 0 on warnings today —
  batch-import.mjs:929). Warn-never-error remains ruled ONLY for the
  interactive paste dialog, where it was originally decided.
- **D5/D11/X4 — the binding manifest, committed:** import:batch writes a
  manifest (ids × files × counts) that also COMPILE-CHECKS every binding —
  graph matches through the kit's formula parser (unparseable = "can never
  fire"), blank matches numeric-checked, including the self-shadowing case (a
  `!` match numerically equal to the correct answer can never fire). Committed
  as an author-refreshed artifact so binding deltas are reviewable git diffs;
  NO CI drift gate (CI cannot see `~/activity-catalogue-pilot`). Near-duplicate
  and singleton ids warn at manifest time.
- **X1 — the binding grammar is PATTERN-decided, not positional** (amends
  decision 2): the LAST `::`-segment that matches the id pattern is the
  binding, at any position. `( ) 3 :: mis.x` (id, no feedback) is legal; the
  segment-2 elision no longer leaks a raw taxonomy string to students. The MC
  and graph parsers split the TAIL on last-`::` (their current splits are
  first-`indexOf` — markdownToTiptap.ts:1530, 3454).
- **X2 — decisions 7–8 + D10/D12 UNPINNED; units syntax deferred to the units
  slice with three code-verified constraints as blocking inputs:** (1) the
  blank tokenizer splits on `|` before any unit parsing, so `unit: km/h|kph`
  makes `kph` an accepted ANSWER (markdownToTiptap.ts:406, blankSyntax.ts:97);
  (2) a keyword segment like `no-unit:` falls through the classifier into
  acceptedAnswers on any typo — keyword segments must route through a warned
  path, sigiled or restructured (blankSyntax.ts:144); (3) tolerance/unit
  ordering must be ruled and the wrong order warned (end-anchored
  TOLERANCE_RE, blankSyntax.ts:17).
- **X5 — the paste prompt does NOT teach bindings.** The format doc's binding
  section is marked batch-workflow-only; the prompt↔doc drift guard learns a
  marked section boundary (a marked region, not a skip list). The registry-less
  paste persona can no longer be invited to invent ids; the paste importer
  still parses bindings if present.
- **D11 — one findable doc section** ("Misconception bindings") holding the
  three site syntaxes, the id pattern, per-site MATCH SEMANTICS (numeric-aware
  on numeric blanks / choice-identity on MC / formula-grammar on graph, with
  "prose never matches"), and a worked example per site. Warning-text
  contract: every binding warning names the file, the exact segment, the
  problem, and the fix.

### DX scorecard (pre-review → with amendments)

Getting started 5→9 · Syntax design 6→9 · Errors 8→9 · Docs 6→9 · Upgrade 7 ·
Dev env 7→8 · Community n/a · Measurement 8. **Overall 6→9.** TTHW: unbounded
("verified only by live students") → Champion (verified in the dry-run).

## What the BUILD corrected (2026-08-25)

Three things only writing the code could establish. Recorded because each one
falsifies something a review asserted confidently.

1. **The bundle attribution was backwards** — see the table under X3. Splitting
   the classifiers out saved 10.5 KiB, not 108.
2. **`selectGraphMistake` annotated SYSTEMS, contradicting its own doc comment.**
   The comment said systems return null; the code reached `parts[0]` and matched
   against it, so a multi-curve question would have recorded a misconception
   based on which curve the student happened to draw FIRST, while the scorer
   matches parts order-independently. Fixed to return null for systems; a test
   pins it. Caught by writing the branch-coverage tests T1 asked for — the
   claim-vs-code gap was invisible to reading.
3. **The end-to-end test found a live seam the three unit-level tests all
   missed.** `parseBlankSpec` produced the binding, `sanitizeMistakeFeedback`
   carried it, `gradeSection` returned it — and the chain was still broken,
   because the two spec→node-attrs consumers (`blankAttrsFromSpec` for the
   editor, `makeBlank` for the importer) dropped it in between. Every seam test
   passed while an authored binding reached no student. This is why
   `misconceptionEndToEnd.test.ts` exists and why it is deliberately
   cross-package: the gap was BETWEEN packages, where neither suite looks.

Also confirmed while building: the serialize loss X2 predicted was
**forward-only** — the activity→tiptap direction passes canonical schema
objects through whole rather than rebuilding from a whitelist, so only
tiptap→activity needed fixing (the new round-trip tests pin both directions
regardless).

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific
finding above. Checkbox as you ship.

- [x] **T1 (P1, human: ~2h / CC: ~20min)** — schema/wire — `misconceptionId` → `misconceptionIds?: string[]`
  - Surfaced by: A1 — multi-select MC dropped all but the first id
  - Files: `packages/viewer/src/check/wire.ts`, `server/grading/{blanks,choices,graphs,index}.ts`, `packages/viewer/tests/grading-section.test.ts`
  - Verify: `pnpm --filter @activity/viewer test`
- [x] **T2 (P1, human: ~1h / CC: ~10min)** — serialize — carry the id through `sanitizeMistakeFeedback` + MC choices, both directions
  - Surfaced by: X2 — closed whitelist silently drops the id on save; editor auto-deploys
  - Files: `packages/app/src/lib/serialize.ts`, `packages/app/src/__tests__/serialize.test.ts`
  - Verify: round-trip test asserting the id survives tiptap→activity→tiptap
- [x] **T3 (P1, human: ~3h / CC: ~30min)** — importer — third `::` segment on blanks/MC/graph `mistake:`
  - Surfaced by: X2 — the authoring half is what the catalogue is blocked on
  - Files: `packages/app/src/lib/{blankSyntax,markdownToTiptap,markdownImportPrompt}.ts`, `docs/markdown-import-format.md`
  - Verify: importer tests + the prompt↔doc drift guard
- [x] **T4 (P1, human: ~2h / CC: ~20min)** — graph — split nudge TEXT out; keep authored-match → id only
  - Surfaced by: X3 — nudges are student-visible and carry the entire +108 KiB
  - Files: `packages/viewer/src/server/grading/graphs.ts`, `packages/graph-kit/src/scorers.ts`
  - Verify: `pnpm bundle:grading-server` returns to ≈2536 KiB
- [x] **T5 (P1, human: ~2h / CC: ~20min)** — retention — amend the rollup spec with a misconception dimension + block the arming checklist on it
  - Surfaced by: X1 — the prune deletes exactly the rows the ids live on
  - Files: `docs/design/check-retention-and-rollup.md`, `TODOS.md` (the ARMING arc entry)
  - Verify: arming checklist names the blocker; no code change yet
- [x] **T6 (P2)** — sensor health — SPLIT, and the wire half was CUT
  - Surfaced by: X4 — broken sensor and quiet sensor are otherwise indistinguishable
  - **Authoring-time half: SHIPPED** as the `import:batch` binding manifest
    (T11), which is where a dead binding is cheapest to catch — before publish.
    A separate `report:misconceptions` script was not needed; the manifest is
    that report, and it runs in the command the author already types.
  - **Live-data half: CUT 2026-08-25 (author ruling)** — the unmatched-wrong
    wire field is derivable from stored `responses` + the immutable versioned
    document, so it becomes an offline query rather than a stored field. See
    the X4 amendment above, including the ordering dependency on the prune.
- [x] **T7 (P2, human: ~1h / CC: ~10min)** — cleanup — delete `annotateMistake` + its dead plumbing; cap the id at 120 chars; teach `check/mock.ts`
  - Surfaced by: A2, C1, C2
  - Files: `packages/graph-kit/src/graph-question.ts`, `packages/schema/src/{inline,blocks/*}.ts`, `packages/viewer/src/check/mock.ts`
  - Verify: `pnpm verify`
- [x] **T8 (P2, human: ~3h / CC: ~25min)** — tests — close all 10 branch gaps
  - Surfaced by: T1 (test review) — 9/19 branches covered
  - Files: `packages/viewer/tests/grading-section.test.ts`
  - Verify: mutation-test each new guard the day it is written

From the DX review (2026-08-25). T3's importer syntax is AMENDED by X1
(pattern-decided last segment, tail split on last-`::`).

- [x] **T9 (P1, human: ~2h / CC: ~15min)** — importer — D7 typo gate + X1 pattern-decided grammar
  - Files: `packages/app/src/lib/{blankSyntax,markdownToTiptap}.ts` (with T3)
  - Verify: `msi.roc.x` warns; `( ) 3 :: mis.x` binds with no feedback
- [x] **T10 (P1, human: ~3h / CC: ~20min)** — grading — D8 numeric-aware mistake matching, server normalizer reused
  - Files: `packages/viewer/src/server/grading/blanks.ts`, corpus feedback rows
  - Verify: `!0.5` fires for a student typing `1/2`; marks byte-identical
- [x] **T11 (P1, human: ~2 days / CC: ~30min)** — CLI — binding manifest (committed, compile-checked) + `--strict` + required registry in batch
  - Files: `scripts/batch-import.mjs`, `docs/misconception-manifest.md`
  - Verify: dead graph match → "can never fire" + exit 1 under --strict
  - **Shipped PARTIAL on the compile-check.** Dead-binding detection covers the
    BLANK cases (a `!` match that scores correct — string, and numeric within
    tolerance). The GRAPH half — an unparseable `mistake:` compiled to a matcher
    that never fires — needs graph-kit's answer parser, which the script does
    not load; it is a TODO at the site in `collectBindings`, and the manifest is
    a human's only view of it until then.
- [x] **T12 (P2, human: ~2h / CC: ~15min)** — docs — "Misconception bindings" section + warning-text contract; paste prompt EXCLUDES bindings via a marked drift-guard region
  - Files: `docs/markdown-import-format.md`, `markdownImportPrompt.ts`, its drift guard
  - Verify: prompt↔doc guard green with the section excluded
- [x] **T13 (P2, human: ~1h / CC: ~5min)** — units slice — record X2's three tokenizer collisions as blocking design inputs; D10/D12 spellings unpinned
  - Files: this doc (done above); the units design pass
  - Verify: units slice cannot start without ruling all three
- [x] **T14 (P3)** — TODOS.md — file the two ruled deferrals (editor binding visibility → co-ownership arc; id rename aliasing → rollup arc)

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | not installed |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 10 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | CLEAR | score 6/10 → 9/10, TTHW: unbounded → Champion (dry-run-verified) |

**OUTSIDE VOICE (eng, 2026-08-24):** Claude subagent — 4 material misses, all verified
(retention collision, serialize data-loss window, bundle-cost attribution, silent
sensors) + 3 mechanical defects fixed.

**OUTSIDE VOICE (DX, 2026-08-25):** Claude subagent — 5 tensions raised, all 5 resolved
in its favor with code-verified evidence: pattern-decided binding grammar replaces the
positional third segment (X1); units syntax UNPINNED on three tokenizer collisions (X2);
`--strict` + required registry in batch mode (X3); committed compile-checking manifest
(X4); bindings excluded from the paste prompt (X5).

**CROSS-MODEL:** Across both reviews, 9 of 9 outside-voice tensions were accepted by
the author. The in-house passes' own findings (6 eng + 12 DX-step-0/pass items) stand.

**VERDICT:** ENG + DX CLEARED — plan amended; implementation tasks T1–T14 queued;
graph nudge text and units syntax each split/deferred with recorded constraints.

**UNRESOLVED DECISIONS:**
- (units slice, inherited) nothing in a rendered blank signals a unit is expected — settle in the units design pass alongside X2's three tokenizer constraints
