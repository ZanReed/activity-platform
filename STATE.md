# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting:

1. **Reminder:** any future redeploy of `ingest-submission` needs `--no-verify-jwt` (see CLAUDE.md).
2. **Redeploy `publish-activity`** (new renderer bundle) so the two new content blocks render on published pages — the deployed bundle's block dispatch has no case for `learning_objectives` / `worked_example` yet, so a page publishing one would drop it silently. **No wire bump** (content blocks, no submission impact), so **`ingest-submission` does NOT need redeploy**. The editor authoring rides the normal SPA deploy. `pnpm bundle:renderer` already run + committed.

_(Queued: the `publish-activity` redeploy above. `main` up to the content-blocks commit; every 2026-07-08 → 2026-07-12 deploy train is deployed and author-confirmed live. **Current live kit hash: `graph-kit-V6T6HAUS.js`** (carries the number_line shape pills + `build_histogram`/`build_boxplot`); `ingest-submission` v36 (wire 3–8, `verify_jwt:false`, MCP-verified); `publish-activity` v88. Older hashes stay on R2 for already-published pages. Source of truth: `supabase/functions/_shared/graph-kit-manifest.ts`. Deploy clearances archived in [HISTORY.md](docs/HISTORY.md).)_

## Current focus

**The deck is clear (2026-07-12).** Every started arc is shipped, deployed, and author-confirmed; no open eyeballs. The graded **`data_plot` block now covers all three stats charts** (dot / histogram / box), completing the coordinate-system taxonomy: `interactive_graph` (2-D), `number_line` (1-D), `data_plot` (stats) — the block→kit→pure-scorer template executed three times. The next arc is a fresh choice; leading candidates:

1. **Free activity catalog** (Phase 2 slice: browse + run/assign/print; [docs/design/free-activity-catalog.md](docs/design/free-activity-catalog.md)) — the onboarding/cold-start lever. The design is from 2026-06-16 and predates most shipped question types, so start with a design-reconciliation pass. Pairs with the queued teacher UX validation.
2. **Phase 2 block-type priority** — `learning_objectives` + `worked_example` SHIPPED 2026-07-12 (content blocks; publish redeploy queued). Remaining in this family: **faded worked example** (interactive — reuses fill-in-blank machinery; forward-compatible with `worked_example`'s nested body) and **self-explanation** (ungraded free-text reflective prompt — introduces the first free-text `SubmissionResponses` map + a wire bump; author chose the ungraded model over pulling Phase 2.6 forward).
3. **Vocabulary glossary Phase 4** (tenant-scoped store + implicit reuse + auto-suggest; [docs/design/vocabulary-definitions.md](docs/design/vocabulary-definitions.md)).

Recently completed (newest first; full narratives in [HISTORY.md](docs/HISTORY.md) → "2026-07-12 — number_line + data_plot trains, import fences, fixes"; durable reasoning in [DECISIONS](docs/DECISIONS.md)):

- **Pedagogical CONTENT blocks — `learning_objectives` + `worked_example`** (2026-07-12, app+renderer, needs publish redeploy) — the first two Phase 2 "block-type priority" items, both pure content (`data-block-category="content"`): no runtime, no scoring, **no wire/storage bump**. `learning_objectives` = titled rich-inline list; `worked_example` = titled boxed frame holding NESTED content children (curated `WorkedExampleChild` union: paragraph/heading/math_block/image/lists — questions/columns excluded so nesting terminates + the dashboard index never needs to recurse in). Full add-a-block-type checklist: schema (both in Block union + ColumnCellBlock), renderer (dispatch + screen/print CSS), editor (Tiptap nodes + NodeViews with editable title-attr input over NodeViewContent, slash-menu Structure entries, column content-expr, reference-panel schema registration), serialize both directions + round-trip tests. **Browser-verified on `/playground`:** both insert from "+ Insert", NodeViews render, nested/title editing writes through, editor JSON serializes correctly, zero console errors. Base runtime unchanged (37.5 KiB). Scoped by author: this batch = these 2 content blocks only; faded worked example + self-explanation NOT in scope; glossary is later. Suite +21 (1606→1627).
- **`data_plot` GRADED BUILDS** (2026-07-12, deployed) — `build_histogram` (drag bar frequencies) + `build_boxplot` (five tick-snapping handles, scored within `tolerance` vs the TI-84 exclusive-median five-number summary — method LOCKED). Additive, NO wire/storage bump. Commits `e6bb062`→`913744d`; kit `V6T6HAUS` (manifest `a0f2d9d`), ingest v36, publish v88. Design + decisions: [docs/design/data-plot-block.md](docs/design/data-plot-block.md) follow-up section.
- **`data_plot` slice 1** (2026-07-12, deployed) — `display` mode (static dot/histogram/box stimulus, pure SVG, stays on the base runtime) + graded `build_dotplot`; wire v7→v8, storage 8→9. Commits `96e3da6`→`bd26f19`; kit `WXYPUC5W` (manifest `1744eb2`), ingest v35, publish v86. As-built deltas: no author board (the answer is computed from `data`); display has no hydration.
- **`number_line` block family** (2026-07-12, deployed, all 6 slices) — plot_point + plot_interval (an omitted bound = ray); wire v6→v7, storage 7→8. Commits `b5fe4aa`→`9ea33e4`; kit `WVG7FA6Y` (manifest `eee04e4`), ingest v34, publish v85. Same-day author-reported fix: interval **shape pills** ("Ray →"/"Ray ←"/"Segment", identical to the graph ray/segment controls; shared `createIntervalShapeControls`; control-surface swap only — scorer/wire/storage unchanged); merged `4ab2dba`, kit `CWAMAF2L` (manifest `95e3991`), publish redeployed.
- **```numberline``` + ```dataplot``` markdown import fences** (2026-07-12, app-only) — the two deferred fence decisions, shipped as fast follows: importer branches (number_line gets a dedicated 1-D inequality parser; data_plot computes the chart from `data:`), auto-fit axes, Copy-AI prompt sections + [markdown-import-format.md](docs/markdown-import-format.md) + drift guards + 31 tests. No deploy artifact — rides the SPA deploy.
- **Sin-curve continuation-arrow tangent fix** (2026-07-12, kit-only, `9a68c0e`) — display `expression` arrows now derive their heading from the local tangent (central difference in [display-arrows.ts](packages/graph-kit/src/display-arrows.ts)) instead of a two-sample chord that broke on oscillating curves; chord kept as the log-asymptote fallback. Kit `E6G7VLZK` (manifest `8d55fef`), publish redeployed.
- **Graded ray/segment answer field accepts curve+domain formulas** (2026-07-12, app-only, `5167adf`) — extracted the `plot_function` branch's curve routing into a shared pure `routeCurveFormula` ([boundedCurveLogic.ts](packages/app/src/editor/nodeViews/boundedCurveLogic.ts)); the ray/segment answer field falls through to it after command words, so all three authoring surfaces route formulas identically. Browser GUI drive left for author.
- **Confidence/solution chrome dedupe + confidence-radio locking fix** (2026-07-11→12, deployed) — one shared `renderSolutionAndConfidence` helper; locked-mode radio freeze corrected across all five question types (kit `P3IFHSRV` + publish redeploy).
- **Doc-drift review + add-a-block-type guards** (2026-07-10, docs + tests) — `ea4d8ad` + `0241689`: structural guard tests (columns/block-union/dashboard parity), README checklist expanded, ROADMAP sweep.

Also queued:

- **Phase 1 polish:** custom domain for R2.
- **Free activity catalog (design captured 2026-06-16, target Phase 2):** public catalog of free first-party math activities a newcomer can run as-is — a cold-start lever pairing with self-signup ([docs/design/free-activity-catalog.md](docs/design/free-activity-catalog.md)). The Phase 5 marketplace's free/discovery slice pulled forward; "use" = run-in-place read-only (not clone-to-edit). Phase 2 slice = browse + run/assign/print; consumer submission dashboards depend on Phase 3 assignment scoping.
- **Vocabulary glossary — Phase 4:** the account/tenant-scoped `glossary_entry` store + `glossaryKey` resolution at publish, leaning to the light **implicit-reuse** model + the suggest-don't-apply **auto-suggest** editor aid. Both additive to the shipped mark. Design in [docs/design/vocabulary-definitions.md](docs/design/vocabulary-definitions.md).
- **Other Phase 2 "decide at phase start" items:** image-hosting quota, block-type priority order, `skills` editing UI.
- **Long-term OCR/AI features (design captured 2026-06-16, not scheduled):** PDF → activity import ([docs/design/pdf-import.md](docs/design/pdf-import.md)) and photo-upload answer checking ([docs/design/photo-grading.md](docs/design/photo-grading.md)). Both reuse existing pipelines; decisions locked: generic-master QR, teacher-grading-aid v1, transcription-only AI rule. Photo-grading flags one real refactor — make answer evaluation server-shareable.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | ✅ Complete; live-verified |
| Database migrations 0001–0006 | ✅ Applied; RLS verified |
| Migration 0007 (submission version pinning) | ✅ Applied (verified 2026-06-12) |
| Migration 0008 (`soft_delete_activity` RPC — delete bug fix) | ✅ Applied 2026-06-17; delete verified working by author |
| Print feature Drops A–D (worksheet config + journal foldable) | ✅ Complete; entirely client-side, no deploy needed |
| Structural columns + grid lines + width presets + drag-between-cells | ✅ Complete; deployed |
| Variable block sizing (Drops 1/3/4: width+align, image height/crop, cell work-space) | ✅ Complete + tests; deployed (publish-activity v34); Drop 2 column-drag cancelled by author (presets remain) |
| Editor UX: sticky toolbar + popover scroll-jump fix | ✅ Browser-verified |
| Phase 2 slice — rich text + inline math in hint/feedback/solution | ✅ Deployed; live UX unverified |
| Image authoring (block + popover + upload + live preview) | ✅ Deployed; R2 cross-origin `<img>` confirmed 2026-06-16 |
| `publish-activity` / `ingest-submission` Edge Functions | ✅ Deployed; ingest runs with `verify_jwt: false` |
| Cloudflare R2 hosting (published HTML) | ✅ Live |
| Auth (Google OAuth, allowlist) / React app / editor stack | ✅ In place |
| CI (GitHub Actions: typecheck/lint/test/build + bundle-staleness guard) | ✅ Added 2026-06-13; verified green locally |
| Markdown paste import | ✅ Complete + verified end-to-end by author; app-only. Format spec + Copy AI prompt + drift guard shipped |
| End-to-end manual test | ✅ Free-mode (2026-06-16) + locked-mode/dashboard (2026-06-17) both author-verified end to end |
| Order-independent blank groups | ✅ Complete + deployed; grouped scoring + `{{~}}` import verified live on a published page |
| Inline vocabulary definitions (rich text + math + optional image) | ✅ Code complete + browser-verified; `publish-activity` redeployed 2026-07-06 — reaches a page on its next re-publish |
| Calculator tool (Phase 2.7) | ✅ Stages 1–4 + full graphing UX overhaul, all browser-verified ([HISTORY 2026-07-06](docs/HISTORY.md)). Live since the 2026-07-08 full deploy pass |
| Activity-wide typography (`meta.typography`; R2-hosted WOFF2; drawer control; WYSIWYG) | ✅ Deployed 2026-07-08; live-page font check cleared 2026-07-10 |
| Number-line block (`number_line`, 1-D graded) | ✅ All 6 slices + shape-pills fix, DEPLOYED 2026-07-12 (kit `CWAMAF2L` era; ingest v34 wire 3–7; publish v85+). Browser-verified: dev harness, bundle-rendered page, `/playground`. Live-page eyeball optional |
| Data-plot block (`data_plot`, statistics charts) | ✅ Slice 1 (`display` + `build_dotplot`, wire v8 + storage v9) AND graded builds (`build_histogram` + `build_boxplot`, additive) DEPLOYED 2026-07-12 (kit `V6T6HAUS`; ingest v36 wire 3–8; publish v88). Browser-verified: `/dev/data-plot`, bundle-rendered pages ("1/1", "2/2 correct"), `/playground`. Live-page eyeball optional |
| Interactive-graph block — Stage 5 | ✅ Four interactions (plot-a-point N-handle, plot-a-function incl. bounded curves/rays/segments, graph-an-inequality, shade-region) + static display. DEPLOYED + live-verified (2026-07-10 author pass). The "answer surface as a graph-block field" seam RETIRED (author call 2026-07-10) — composes as display graph + sibling question block instead |
| Numeric blanks (`answerType: 'numeric'` + tolerance; `{{=…}}` import) | ✅ Live (cleared 2026-07-10); no wire change |
| Multiple-choice block (wire v5 + ```mc import + dashboard) | ✅ Live (cleared 2026-07-10); browser-verified |
| Static graph-paper SVG fallback (author's print fix) | ✅ Live (cleared 2026-07-10); committed in `c334b96` |
| Graded function families — quad/exp/log + quadratic inequalities | ✅ Live (cleared 2026-07-10); browser-verified; `38b9fbe` |
| Display-graph continuation arrows + readDrawables/print-arrowhead fixes | ✅ Live (cleared 2026-07-10); `131f62d`; arrows checkbox FULLY verified 2026-07-12; sin-curve `expression` tangent fix deployed 2026-07-12 (`9a68c0e`) |
| MC choice figures (per-choice image/graph, 2-up grid, shared DrawableListEditor) | ✅ Live (author-confirmed 2026-07-10) |
| Matching + ordering question types (wire v6 + storage v7 + ```match/```order import) | ✅ Deployed (author-confirmed 2026-07-10); pointer-DRAG on a real device confirmed 2026-07-12 |
| Calculator parity Tier A (calc inequalities, per-row domains, widened function table, log regression) | ✅ Deployed + author-confirmed 2026-07-11. Tier B (Compute Engine) DEFERRED on pedagogical grounds. Movable points + Σ/Π dropped by author call |
| Migration 0009 (security/performance housekeeping) | ✅ Applied + fully verified 2026-07-11 (8-step MCP verification passed; advisor residue is intentional — see DECISIONS) |
| ```numberline``` + ```dataplot``` markdown import fences | ✅ Committed 2026-07-12, app-only; reach teachers via the SPA deploy (main pushed) |
| Content blocks (`learning_objectives`, `worked_example`) | ✅ Code complete + browser-verified on `/playground` 2026-07-12. Pure content, no wire bump. **Needs `publish-activity` redeploy** (new bundle) to render on published pages. Import fences deferred to a fast-follow. Faded-worked-example + self-explanation NOT built (out of this batch's scope) |

Suite at last session: schema 253 / graph-kit 325 / renderer 530 / app 519 (**1627**); typecheck green (0 errors) — content-blocks batch added schema +9, renderer +5, app +7 (serialize round-trips + guard representative cases). The `runtime-doc-contract.test.ts` guard classifies both new blocks as CONTAINER (content — no RUNTIME.md section needed). Runtime bundle **base 37.5 KiB / graphs 44.3 KiB** minified (re-check with `pnpm bundle:renderer`; treat printed numbers as truth). Graphs is over the 40 KiB soft target — under the 60 ceiling, accepted per the 2026-07-10 budget amendment (DECISIONS.md → "Runtime size budget amendment"). **Base sits at 94% of its soft target** — schedule the next budget-ladder lever (per-question-type inlining variants; `document.ts` already picks by body scan) before the next question-type generation, per the amendment's "scheduled, not discovered" rule. The graph-runtime-into-kit lever was pulled 2026-07-10 — graph work grows the cached kit, not the inline bundles. (Environment note: this machine is the 2026-07-04 recovery clone — old computer died; toolchain re-set-up verified by a full green run. Kit-upload creds live in a gitignored `.env.r2`, auto-loaded by `pnpm upload:graph-kit` — the upload is an explicit command; `pnpm build:graph-kit` is build-only and never touches R2; see `.env.r2.example`.)

## Repo layout

```
activity-platform/
├── docs/
│   ├── design/        — feature designs captured ahead of implementation
│   ├── DECISIONS.md   — architecture decisions + reasoning
│   ├── HISTORY.md     — archived completed-work logs
│   └── COLLABORATION.md — working-with-the-author notes
├── packages/
│   ├── schema/        — Zod types, document model, factories
│   ├── renderer/      — pure JSON → HTML string; KaTeX inlined; no DOM
│   │   ├── RUNTIME.md — runtime architecture + data-attribute contract
│   │   └── src/runtime/ — published-page runtime (DOM TS, own tsconfig; per-file map in RUNTIME.md)
│   ├── graph-kit/     — @activity/graph-kit: shared graphing kit (Phase 2.7). evaluate.ts (math.js seam) + calculator.ts (mountCalculator) + runtime.ts (lazy kit runtime) + runtime-contract.ts (bridge↔kit types). mathlive + mathjs. Lazy-loaded on published pages; imported directly by the editor preview
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/     — Tiptap extensions, NodeViews, popover hosts, toolbar, slash menu
│           ├── components/ — PublishControl, ImportMarkdownDialog, RequireAuth
│           ├── routes/     — Activities, ActivityEditor, ActivityPrint, Submissions, Playground (dev-only)
│           ├── lib/        — serialize.ts, submissions.ts, uploadImage.ts, markdownToTiptap.ts, markdownImportPrompt.ts, foldable/ (print engine)
│           └── __tests__/
├── supabase/
│   ├── migrations/    — 0001–0009 (all applied)
│   └── functions/     — publish-activity, ingest-submission, upload-image, _shared/ (cors.ts, renderer.bundle.js + graph-kit-manifest.ts — auto-generated)
├── scripts/           — bundle-renderer.mjs; seed-test-data.sql; seed-e2e-activity.sql; seed-e2e-locked.sql
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Storage bucket (legacy):** `activities` — deleted 2026-06-18 after R2 verified end-to-end (note: the app's `.from('activities')` calls are the DB table, not this bucket)
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Allowlist-only signup (Phase 1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` in `.env.local` (gitignored) mirrors the write-only `R2_PUBLIC_URL_BASE` secret; unset → published-page links hide.

## Open questions / deferred decisions

- **Custom domain for R2** (Phase 2 polish): `pub-<hash>.r2.dev` → `activities.<brand>.com` once a domain is owned; ~5 min of Cloudflare DNS after that.
- **Empty fill_in_blank drag handle attachment** — whether `definingForContent: true` changed the handles-only-on-non-empty behavior is unverified; re-test during a drag-reorder pass. Minor.
- **Blank popover: one-click switch between chips** — deferred design decision, no data loss; full reasoning in [DECISIONS.md](docs/DECISIONS.md) → "Fill-in-blank authoring (Stage 13.5)". Needs a dedicated design pass (FocusTrap/selection entanglement).
- **Section metadata panel** — SectionBreakView's inline title/checkpoint UI is adequate for now; an editor-level panel remains optional.
- **Responsive `--blank-width` sizing** — deferred from Stage 11.
- **Phase 2 block-type priority order** (worked example, faded worked example, learning objectives, self-explanation) — decide when Phase 2 starts.
- **`skills` editing UI** — deferred to Phase 2 per schema scheduling; the field round-trips everywhere, only the editing control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **UX validation with 2–3 other teachers** on the editor patterns before classroom adoption — cost rises sharply once students use activities.
- **Post-success edit edge case** — locked/single paths briefly write-then-remove the persistence blob (wasteful but correct). Low priority.
- **CDN-hosted shared runtime** (Phase 3+): trigger is when republishing for runtime bug fixes gets painful (~50+ active activities).
- **Multi-tenancy / governance when a teacher leaves a district** — Phase 4; helpers are designed for it.
- **Manual grading workflow shape** (Phase 2.6), **media storage/privacy posture** (Phase 2.8), **annotation coordinate space** (Phase 2.9) — each decided at its phase start.

---

**Last updated:** 2026-07-12 (content-blocks batch: `learning_objectives` + `worked_example` shipped — code complete, suite 1627 green, browser-verified on `/playground`, renderer bundle regenerated + committed. One pending author action: redeploy `publish-activity` so the blocks render on published pages).
