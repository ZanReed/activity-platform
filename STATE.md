# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting:

1. **Reminder:** any future redeploy of `ingest-submission` needs `--no-verify-jwt` (see CLAUDE.md).
2. **Redeploy `publish-activity` + re-publish to ship inline vocabulary definitions.** The renderer now emits `<span class="definition" data-definition…>` and a new ~1.7 KiB `definitions.ts` runtime sidecar makes it interactive; both are baked into the committed `renderer.bundle.js`. Until `publish-activity` is redeployed (and an activity that uses definitions re-published), published pages won't carry the definition span or its popover. No DB migration — the schema's string→object mark change is backward-compatible via a `z.preprocess` (no `schemaVersion` bump); no `ingest-submission` change (definitions are non-scored).

Cleared 2026-06-18: **`publish-activity` re-deployed + activity re-published — reference panel live.** The on-screen bottom-bar toolbar (with the ~1 KiB `runtime/reference-panel.ts` sidecar: top-edge drag-resize + `ResizeObserver` scroll-clearance) and the print box now reach published pages, gated by `meta.print.printReferencePanel`. Deployed *after* the two live-test fixes (body scroll moved onto the body's `max-height`; resize handle moved to the panel's top edge), so the live page has the corrected behavior; author confirmed working. Cleared 2026-06-18: **`publish-activity` redeployed — order-independent blank groups verified live on a published page** (grouped scoring confirmed: any-order accepted, consume-once rejects duplicate answers; the `{{~}}` markdown import round-tripped through publish). Cleared 2026-06-18: **legacy Supabase Storage `activities` bucket deleted by author** (R2 verified end-to-end; the app's `.from('activities')` calls are the DB table, not the bucket — confirmed nothing referenced it; no env vars needed removing). Cleared 2026-06-17: **migration `0008_soft_delete_activity.sql` deployed — deleting activities now works** (soft-delete RLS bug; writeup in HISTORY 2026-06-17, reasoning in DECISIONS → "Activity deletion"). Cleared 2026-06-16: **cross-origin `<img>` loads from R2 confirmed working** by the author; **the three real-mouse GUI passes confirmed working** (drag-between-cells, image resize handles, nested rich-text mini-editor). Also: `publish-activity` redeployed with the **submission-payload fix** (runtime now POSTs snake_case `activity_id`/`display_name` matching `ingest-submission`) and the `[TEST] E2E Coverage` activity re-published — live submit verified end to end (see Current focus). Cleared 2026-06-13 (verified via Supabase API): `publish-activity` was at **v34**, carrying the full variable-block-sizing bundle (width fill + image fixed-height crop + cell `--cell-min-height`). Earlier (2026-06-12): migration 0007 applied; `upload-image` deployed; `ingest-submission` still has `verify_jwt: false`.

## Current focus

**▶ Phase 2.7 — Graphing track · Stage 1 (scientific calculator): STARTED 2026-06-21.** Building the shared graphing kit bottom-up (calculator first; the graded interactive-graph block drops onto the mature kit later). Design + decisions in [docs/design/calculator-tool.md](docs/design/calculator-tool.md). **Spike done** (esbuild, real MathLive 0.109.2): MathLive input is a fixed ~219 KiB-gzip floor; the evaluator swings ~280 KiB. **Locked:** evaluator = **math.js number-only** behind a single `evaluate()` seam (Compute Engine = drop-in escape hatch); delivery = **one shared content-hashed kit on R2** (brotli-served, MathLive fonts alongside); kit is a framework-agnostic `mountCalculator(el, config)` consumed by both published HTML (lazy `import()` on summon-click) and the editor preview. **Schema slice SHIPPED + committed** (`77ff8e3`): `CalculatorTool`/`CalculatorRestrictions` in `packages/schema/src/document.ts`, `calculator?` on `ActivityDocument`, `createCalculatorTool()` factory, 12 tests; `mode` enum is `scientific|graphing`, defaults `scientific`; no `schemaVersion` bump. **Renderer slice SHIPPED + committed** (`d7cf6cf`): the renderer emits the cheap half of the calculator — `renderCalculatorTool()` → `<div class="calculator-tool" data-block-category="scaffold">` (summon button + empty mount + `data-calculator-{mode,config,kit-src}`), gated on `doc.calculator.enabled` AND a new `RenderContext.calculatorKitUrl` (absent URL → omitted, graceful); a ~0.8 KiB `runtime/calculator-summon.ts` sidecar (bundle step 4, inlined only when a calculator is emitted) lazy-`import()`s the heavy widget on first summon click. Kit contract: `mountCalculator(mount, config, {onToggle}) -> {toggle, isOpen}`. RUNTIME.md contract + build-pipeline (5 builds) updated; print CSS hides it; 8 renderer tests. **Not yet wired to the app/publish**, so no published page shows a calculator yet. **Remaining Stage 1:** `mountCalculator` widget (MathLive field + keypad + math.js `evaluate()` + deg/rad + restriction gating + reuse reference-panel floating/drag chrome; framework-agnostic, also used by the editor preview) → second esbuild entry for the kit + shared content-hashed R2 hosting + `publish-activity` passes `calculatorKitUrl` (⚠️ will become a pending author redeploy) → editor authoring control (toggle + restriction flags + live preview) + serialize round-trip → tests. **Graded regression** noted as a future variant of the *graded* face (the tool stays ungraded) — captured in [interactive-graph-block.md](docs/design/interactive-graph-block.md) with a reuse-the-engine plan; not scheduled, staging unchanged. Suite: schema 113 / renderer 298 / app 245; typecheck clean.

**▶ Phase 2 — Inline vocabulary definitions SHIPPED (code complete + browser-verified; awaiting `publish-activity` redeploy to reach published pages).** Teacher selects text → "Define" → types a definition; the published page shows it in a popover. Four slices, all green: **schema/renderer** (`2329580`) — marks moved from a string enum to an object discriminated union (a `z.preprocess` upgrades legacy string marks on read, so stored activities keep parsing with no `schemaVersion` bump), `DefinitionMark { definition, glossaryKey? }`, renderer emits the escaped `<span class="definition" data-definition…>` (reserved `data-glossary-key` only when set), serialize round-trips both ways; **runtime** (`e26dea7`) — a self-contained ~1.7 KiB `definitions.ts` sidecar (mirrors the reference-panel sidecar; inlined only when a page has a definition) opens a popover on click/tap/Enter/Space, Esc/outside/scroll closes, focus returns; **editor** (`16e0470`) — `Definition` mark + "Define" toolbar button + a single-host `DefinitionPopoverHost`/`DefinitionEditPopover` (mark-based via `getMarkRange`; commit-on-close, a blank draft removes the mark). Browser-verified on `/playground`: apply→popover→type→commit, re-open prefilled, Remove keeps the word, dotted-underline cue (computed-style confirmed). **Rich-content upgrade (`dc55271`):** definition content went from a plain string to formatted text + inline math + one optional image — the popover now uses the shared `InlineRichTextEditor` (the hint control) + a compact image control (URL paste, or upload via `upload-image` when an activityId is present); the renderer pre-renders the content into a hidden `<template class="js-definition-content">` the sidecar clones into the popover (`data-definition` kept as a plain-text fallback); the schema's content type forbids nested definitions and a `z.preprocess` upgrades the legacy string. Browser-verified: rich editor + image control, URL→preview→commit, image-only definition, re-open prefills content + image. Reasoning in [docs/design/vocabulary-definitions.md](docs/design/vocabulary-definitions.md). **Phase 4 (future):** the account/tenant-scoped glossary store + implicit-reuse + auto-suggest (same doc). Tests: schema 101 / renderer 290 / app 245; typecheck clean.

Earlier (done + deployed): Phase 2 **reference panel** live on published pages (author-confirmed 2026-06-18; narrative archived in HISTORY/DECISIONS); the redundant-`Underline`-extension cleanup (`3aaf139`, 2026-06-19). Other Phase 2 "decide at phase start" items still open: image-hosting quota, MC/matching/ordering UI, block-type priority, `skills` editing UI, custom R2 domain.

Recently completed (newest first; durable detail in [DECISIONS](docs/DECISIONS.md)/[HISTORY](docs/HISTORY.md)):

- **Order-independent blank groups** (2026-06-17; deployed + verified live on a published page 2026-06-18) — a blank can be flagged `interchangeableWithPrevious`; the renderer compiles adjacent runs into a shared `data-blank-group` id and the runtime scores each group with consume-once bipartite matching (each correct answer satisfies one blank; document-order tiebreak; grouped blanks resolve at check/submit, not immediate-mode blur). Authoring: a popover checkbox (hidden on a block's first blank) + a ⇄ chip cue; markdown import via a leading-tilde marker (`{{~3}}`); dashboard drill-down shows "x or y (any order)". Client-authoritative scoring, so no Edge Function change. Schema 89 / renderer 268 / app 232 green. DECISIONS → "Order-independent blank groups".
- **E2E locked-mode + dashboard** (2026-06-17) — author-confirmed working. Locked-mode publish → check freezes the checked section's inputs + check button, solution reveals, score shows; submit → row appears in the Submissions dashboard with per-blank answer-key/student detail. Prep was code-side de-risking (`seed-e2e-locked.sql` validated against the known-good free seed; freeze path traced + unit-covered). Completes the End-to-end manual test item and unblocked the legacy-bucket cleanup (since done — bucket deleted 2026-06-18).
- **CI branch-filter narrowing** (2026-06-17) — CI's `push` trigger limited to `main` (was unfiltered, firing on every branch). Feature branches now get a single PR run instead of double-firing on push + PR; merges/direct commits to `main` still run. `pull_request` still covers all PRs.
- **Deferred test coverage** (2026-06-13) — `init.test.ts` now covers `state.blanks`/`state.blocks` (one defaulted entry per ref, empty when none). The blank-edit popover's draft/commit/close decisions were extracted to a pure `blankPopoverLogic.ts` (behavior-preserving lift out of `BlankEditPopover`/`BlankPopoverHost`) and unit-tested (`blankPopoverLogic.test.ts`, 25 cases — `computeFlush`, `resolveAnswerBlur`, `resolveAcceptableCommit`, `filterFeedbackForCommit`, `isSameBlankSelection`). Refactor browser-smoke-verified: edit commits on outside-click close, whitespace stripped, selection released.
- **Foldable × columns verification** (2026-06-13) — a top-level columns container flows whole through the foldable, never splits, `fr` tracks resolve against the fixed panel width. Tests + dev-only `/dev/foldable-columns` bench. DECISIONS → "Structural columns + variable block sizing".
- **CI + housekeeping** (2026-06-13) — `.github/workflows/ci.yml` (typecheck → lint → test → build → bundle-staleness guard, on push + PR); app `typecheck` + root `lint` scripts; `packageManager: pnpm@11.1.2` pin; pre-existing lint errors cleared (now 0 errors / 2 intentional warnings).
- **Variable block sizing** (2026-06-12/13) — COMPLETE + deployed (publish-activity v34). DECISIONS → "Structural columns + variable block sizing"; design in [docs/design/variable-block-sizing.md](docs/design/variable-block-sizing.md).

Standing follow-up: none — the image resize drag-handles + the other real-mouse GUI passes were confirmed working by the author (2026-06-16).

Also queued:

- **Phase 1 polish:** custom domain for R2.
- **Free activity catalog (design captured 2026-06-16, target Phase 2):** public catalog of free first-party math activities a newcomer can run as-is — a cold-start lever pairing with self-signup ([docs/design/free-activity-catalog.md](docs/design/free-activity-catalog.md)). The Phase 5 marketplace's free/discovery slice pulled forward; "use" = run-in-place read-only (not clone-to-edit). Phase 2 slice = browse + run/assign/print; consumer submission dashboards depend on Phase 3 assignment scoping.
- **Vocabulary glossary — Phase 4 (inline definitions shipped 2026-06-19; see Current focus).** Remaining piece is the account/tenant-scoped `glossary_entry` store + `glossaryKey` resolution at publish, leaning to the light **implicit-reuse** model (platform remembers a teacher's definitions and offers them back; an official managed glossary, if built, is opt-in, never forced) + the suggest-don't-apply **auto-suggest** editor aid. Both are additive to the shipped mark (the `glossaryKey` attr + `data-glossary-key` are already reserved). Design in [docs/design/vocabulary-definitions.md](docs/design/vocabulary-definitions.md).
- **Long-term OCR/AI features (design captured 2026-06-16, not scheduled):** PDF → activity import ([docs/design/pdf-import.md](docs/design/pdf-import.md)) and photo-upload answer checking ([docs/design/photo-grading.md](docs/design/photo-grading.md)). Both reuse existing pipelines (markdown-paste DSL converter; the submission pipeline); decisions locked: generic-master QR, teacher-grading-aid v1, transcription-only AI rule. Photo-grading flags one real refactor — make answer evaluation server-shareable.
- **Calculator tool / graphing track (design captured 2026-06-19, target Phase 2.7):** a teacher-configurable, Desmos-style calculator (scientific → single graph → regression → multi-expression), self-built (Path B) on a shared **graphing kit** (JSXGraph + MathLive + an evaluator) that the graded interactive-graph block (existing 2.7 design) also consumes — one track, two faces. Ungraded scaffold (reference-panel sibling: no submission, no answer key, no schema bump); lazy-loaded on click; per-activity teacher restriction flags with inline author preview. Texas Algebra I regression (linear/quad/exp) pulled forward to stage 3. Design in [docs/design/calculator-tool.md](docs/design/calculator-tool.md); folded into ROADMAP Phase 2.7.

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
| Markdown paste import | ✅ Complete + verified end-to-end by author (multiple smoke tests); app-only, no deploy. Format spec + Copy AI prompt + drift guard shipped |
| End-to-end manual test | ✅ Free-mode (2026-06-16) + locked-mode/dashboard (2026-06-17) both author-verified end to end |
| Order-independent blank groups | ✅ Complete + deployed (`publish-activity` redeployed 2026-06-18); grouped scoring + `{{~}}` markdown import verified live on a published page |
| Inline vocabulary definitions (rich text + math + optional image; renderer template + runtime sidecar + editor authoring) | ✅ Code complete + browser-verified (`/playground`); ⏳ awaiting `publish-activity` redeploy to reach published pages |
| Calculator tool (Phase 2.7, Stage 1 — scientific) | 🛠️ In progress: schema (`77ff8e3`) + renderer (`d7cf6cf`) slices shipped + committed + tested; widget/build-hosting/editor remaining. Decisions locked (math.js evaluator, shared R2 kit) |

Test counts at last session: schema 113 / renderer 298 / app 245; `tsc -b` + app build green. (+ calculator schema slice: 12 tests; renderer slice: 8 tests.)

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
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/     — Tiptap extensions, NodeViews, popover hosts, toolbar, slash menu
│           ├── components/ — PublishControl, ImportMarkdownDialog, RequireAuth
│           ├── routes/     — Activities, ActivityEditor, ActivityPrint, Submissions, Playground (dev-only)
│           ├── lib/        — serialize.ts, submissions.ts, uploadImage.ts, markdownToTiptap.ts, markdownImportPrompt.ts, foldable/ (print engine)
│           └── __tests__/
├── supabase/
│   ├── migrations/    — 0001–0008 (all applied)
│   └── functions/     — publish-activity, ingest-submission, upload-image, _shared/ (cors.ts, renderer.bundle.js — auto-generated)
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

**Last updated:** 2026-06-21. Completed-session narratives are archived in [HISTORY.md](docs/HISTORY.md) (rolling log, newest first); durable reasoning in [DECISIONS.md](docs/DECISIONS.md). Suite at last session: schema 113 / renderer 290 / app 245; CI green.
