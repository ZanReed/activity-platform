# Misconception sensors — ids on distractors, live graph feedback, unit-bearing blanks

**Status: PLAN, greenlit 2026-08-24 (author: "all yes" on the nine decisions).**
AS-BUILT section to be appended when the arc lands.

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
