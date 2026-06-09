# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it short; if it grows past two screens, prune.

## Current focus

**Phase 2 (first slice) — rich text + inline math in popover/settings fields — is COMPLETE (code + tests; live UX unverified).** The blank `hint`, blank `mistakeFeedback[].feedback`, and FillInBlank `solution` fields now accept inline rich text (bold/italic/code/underline/sub/sup) and inline KaTeX — matching how problem prose already renders. Scope is **inline-only** (no block content), the balance the author approved.

- **Editor stores canonical `InlineNode[]`.** These three attrs hold the schema's inline form directly (Tiptap node attrs carry it opaquely; `Blank.ts`/`FillInBlank.ts` parse/render it via `data-hint`/`data-mistake-feedback`/`data-solution` JSON). So `serialize.ts` is a trivial pass-through — it no longer coerces strings. New reusable `InlineRichTextEditor.tsx` (nested Tiptap, StarterKit trimmed to inline marks + `Subscript`/`Superscript`/`MathInline`) owns Tiptap↔InlineNode conversion via newly-exported `activityInlineToTiptap`/`tiptapInlineToActivity` + `InlineNodes` type from serialize. `BlankEditPopover` and `FillInBlankView` render it (keyed by `blankId` so the uncontrolled editor remounts only on retarget; live-commit never resets the caret).
- **Server pre-renders, client clones (KaTeX stays server-side).** Same pattern as prose: the renderer pre-renders rich popover/solution content into hidden `<template>` nodes; the runtime clones them client-side, so the ~280 KiB KaTeX never ships to students. Runtime bundle regenerated — **14.8 KiB** (budget 20). `runtime-bundle.ts` + `supabase/functions/_shared/renderer.bundle.js` rebuilt.
- **Tests + builds green:** schema 30 / renderer 212 / app 63; `tsc -b`, app vite build, `pnpm -r typecheck` all clean. Pre-existing unrelated lint errors remain in `FillInBlank.ts:6` (unused `Options`/`Storage` generics — confirmed on main via `git stash`).
- **⚠ Two follow-ups (author):** (1) **`supabase functions deploy publish-activity`** is required for the new rich content to go live on published pages — until then the bundle change is committed but not deployed. (2) **Browser UX verification of the nested mini-editors is still pending** (caret behavior, math insertion, virtual-keyboard interplay with the popover) — covered by code/tests but not yet exercised live.

**Stage 16 — Submissions dashboard — is COMPLETE and live-verified.** A per-activity dashboard at `/activity/:id/submissions` with a Summary/All-attempts toggle, per-student grouping (latest headline + best secondary + attempt count), and an expandable drill-down that maps each blank response back to its problem prompt/answer key plus per-section checkpoint results. See Nearest next steps #6 for the full design + the two deviations from the original plan (latest-not-best headline; `activityType` filter dropped).

The author ran the live pass this session; three issues surfaced and were fixed:
- **(a) Published-URL retrieval was hard.** The live R2 URL was only shown in the post-publish `success` state of `PublishControl` — reopening a published activity gave no way to get the link. Added a persistent `View published page · Copy link` affordance in the editor header (`ActivityEditor.tsx`), gated on `current_version_id`, building `{VITE_PUBLISHED_URL_BASE}/{id}/index.html`. **New client env var `VITE_PUBLISHED_URL_BASE`** mirrors the publish function's `R2_PUBLIC_URL_BASE` secret (write-only on Supabase, so it had to be duplicated client-side); unset → the link hides rather than rendering a broken URL. Set in `.env.local` (gitignored); documented in `.env.local.example`.
- **(b) Blank-settings authoring was undiscoverable.** The `⚙ Settings` footer in `FillInBlankView.tsx` was gated on Tiptap's `selected` prop, which is only true for a NodeSelection of the whole block — clicking *into* a problem makes a TextSelection inside it, so `selected` stayed false and the worked-solution/confidence panel never revealed. Now shown on **every** fill-in-blank while the editor is editable (`showFooter = isEditable || isConfigured`).
- **(c) Student submissions 401'd** with `{"code":"UNAUTHORIZED_NO_AUTH_HEADER"}`. `ingest-submission` had been deployed with `verify_jwt: true`, so the platform gateway rejected anonymous student POSTs before reaching the function. **Redeployed via CLI with `--no-verify-jwt`** (`supabase functions deploy ingest-submission --no-verify-jwt --project-ref dtqutpdplefmufrrakxs`) → now `verify_jwt: false`. No code change — the function self-authenticates with the service role and validates in its body + the `ingest_submission` RPC. There is no `supabase/config.toml`, so this flag lives only on the platform; re-set it on any future CLI redeploy of this function.

Also seeded **3 `[TEST]` activities + 11 submissions** straight into the live DB to exercise the dashboard (generator validated every doc/blob through the real Zod schema before insert; re-runnable SQL at [scripts/seed-test-data.sql](scripts/seed-test-data.sql), idempotent teardown at top). Covers multi-attempt grouping, latest≠best (Carlos regresses), confidence, checkpoints, v1 migrate-on-read, removed-blank, unreadable-responses, null-score edge cases. Note: seeded rows are `published` but their HTML was never uploaded to R2, so their `View published page` link 404s until a real Publish.

### Post-Stage-16 hardening pass (code review)

A `/code-review` of the Stage 16 diff surfaced ~10 findings; all addressed. Most were internal-correctness fixes in `Submissions.tsx` / `submissions.ts` (no behavior or context change): synchronous `loadState` reset on activity switch so back/forward doesn't flash the prior activity's rows; NaN-safe checkpoint sort (`Infinity - Infinity`) and deterministic blank/problem tiebreaks; coerce `score` from PostgREST's `numeric`-as-**string** to a real number at the query boundary; float-safe `formatScore` (snap to 4-dp before scaling so `0.575*100` doesn't drop a half-percent); plus three hardened test fixtures. App **63 tests + tsc green.**

The one finding that **changes context** is the answer-key version-skew fix:
- **Submissions are now pinned to the version the student answered.** New migration **[0007_submission_version.sql](supabase/migrations/0007_submission_version.sql)** adds a nullable `submissions.activity_version_id` (→ `activity_versions(id) on delete set null`), backfills existing rows to each activity's `current_version_id`, and `create or replace`s `ingest_submission` to record `current_version_id` on every new row (+ in the audit-log metadata). **Signature unchanged → `ingest-submission` Edge Function needs NO redeploy.**
- **The dashboard indexes each submission against its own version.** `Submissions.tsx` now builds one `ActivityIndex` per referenced version (loaded via a single `.in('id', …)` on `activity_versions`) and resolves per-row via `resolveIndex(row.activity_version_id)`, falling back to the current version for null/legacy/unparseable rows. So the drill-down shows the answer key the student actually saw — correct even after a republish (previously it always used the current version). `SubmissionRow` gained `activity_version_id: string | null`.
- ⚠ **Migration 0007 is written but NOT yet applied.** The author applies it (`supabase db push` / dashboard) — same as git pushes. Until applied, every row's `activity_version_id` is null and the dashboard falls back to the current version (identical to pre-fix behavior, no regression). After apply, only *new* submissions get true per-version accuracy; pre-migration rows can't be retroactively attributed (that data was never recorded) and stay backfilled to the current version.

**Next:** Apply migration 0007 (author). Then Phase 1 polish / print feature.

**Stage 15 — Editor UI for remaining feature fields — is COMPLETE.** Activity-level metadata pickers and FillInBlank block-level field authoring exist in the editor; the locked-mode checkpoint validation warns (non-blocking).

What landed this stage (editor + serialize only — NO renderer/runtime/bundle change; the renderer already emitted `data-solution`/`data-has-confidence-rating`/`data-skills` and the runtime already consumed them, so this stage only made the editor *produce* those fields):

- **Activity-settings panel (`ActivityEditor.tsx`).** A collapsible "⚙ Activity settings" disclosure under the title input. Three `<select>` pickers — `submissionMode` (single/locked/free), `revisionMode` (free/locked), `activityType` (worksheet/exit_ticket/warm_up/review) — wired straight to `setMeta`. Meta already round-tripped through `draft_content` and `changeKey` already fingerprinted it, so autosave picks up changes for free. `revisionMode` is **disabled with explanatory text when `submissionMode === 'single'`** (schema ignores it there). `gradingMode` deliberately **omitted** (inert in Phase 1 — a picker would imply behavior that doesn't exist).
- **Locked-mode checkpoint warning.** Amber banner under the settings panel, shown when `submissionMode === 'locked'` AND `hasNonCheckpointSection(tiptap)` is true (any section — including the implicit leading run before the first `sectionBreak` — that isn't a checkpoint). **Warns, does not block save** (addresses open-question #258). The walk mirrors `splitTiptapBlocksIntoSections` in serialize.ts.
- **FillInBlank block-level fields (`FillInBlank.ts` + `FillInBlankView.tsx`).** Added `solution` / `hasConfidenceRating` / `skills` attrs (parse/render via `data-solution`/`data-has-confidence-rating`/`data-skills`). A footer disclosure in the NodeView (contentEditable={false}, hidden when the block is plain + unselected + unconfigured) exposes a `solution` textarea and an "Ask for a confidence rating" checkbox. Document concerns write via `updateAttributes`; only the open/closed state is React `useState` (5-commitments rule).
- **Serialize round-trip (`serialize.ts`).** New `tiptapFillInBlankToActivity` carries `solution` (only when non-empty), `hasConfidenceRating`, and `skills` into the ActivityDocument — replacing the old hardcoded `hasConfidenceRating: false`/`skills: []`/dropped-solution. `activityFillInBlankToTiptap` now emits all three attrs (explicit defaults `''`/`false`/`[]`) so the editor round-trips them.
- **`skills` UI deferred to Phase 2** (per the schema's own scheduling — every skills comment reads "Editor UI for this field is Phase 2"). The attr still round-trips through serialize and the node so any imported/future-authored tags survive; there is just no editing control. Confirmed with the author.
- **Tests + verification.** Added 3 serialize round-trip tests for the block-level fields (round-trip, into-ActivityDocument, defaults-absent). App **50 tests green**; `pnpm --filter @activity/app build` clean (tsc -b + vite). No bundle regen (no renderer/runtime change). **Live-UI pass DONE** — author exercised the editor settings + `answerFeedback` picker on a real authed activity; features work.

### Follow-on: `answerFeedback` mode (configurable answer validation)

The green-correct / red-wrong blank validation used to be **always on** (every blank self-checked on blur). The author flagged this should be opt-in. Resolved as a **separate, orthogonal `ActivityMeta` field** (`answerFeedback: 'immediate' | 'on_check'`, schema default `'on_check'`) — NOT a fourth `submissionMode`, mirroring how `submissionMode`/`revisionMode` are kept as independent enums.

- `'immediate'` — blur scores the blank; student sees correct/incorrect right away (the old always-on behavior).
- `'on_check'` — correctness stays hidden until a section check or final submit (the **new default** for fresh activities).

What changed (this **DID** touch renderer/runtime/bundle, unlike Stage 15 proper):
- **Schema** (`document.ts`, `factories.ts`): added `answerFeedback` enum (default `on_check`); factory constructs it explicitly.
- **Renderer** (`document.ts`): config blob now carries `answerFeedback`.
- **Runtime** (`config.ts`, `blanks.ts`, `index.ts`): `RuntimeConfig.answerFeedback`; `parseConfig` treats it as **not-required** and **coerces missing/invalid → `'immediate'`** (pre-field published pages keep their original self-check-on-blur behavior — schema default and runtime fallback intentionally differ). `wireBlanks(answerFeedback, …)` only attaches the blur-scoring handler in `'immediate'` mode; the input/edit-to-clear handler runs in **both** modes (so editing after a section check still clears a stale border).
- **Editor** (`ActivityEditor.tsx`): a 4th picker in the settings disclosure (`Reveal on check` / `Immediate self-check`); settings grid widened to `sm:grid-cols-2`.
- **Tests:** schema default + explicit + invalid-reject; `parseConfig` preserve/missing→immediate/invalid→immediate; `wireBlanks` blur-gating in both modes + edit-to-clear in on_check. Schema 30 / renderer 207 / app 50 green; all builds clean. RUNTIME.md §7 `wireBlanks` signature updated.
- **Bundle regenerated** (`pnpm run bundle:renderer`) — runtime source changed, so `runtime-bundle.ts` + `supabase/functions/_shared/renderer.bundle.js` are rebuilt. ✅ **`publish-activity` redeployed** — new behavior is live on published pages.

## Status by area

| Area | Status |
|---|---|
| Database schema (migrations 0001–0006) | ✅ Applied to Supabase, RLS verified |
| Migration 0007 (submission `activity_version_id`) | ⏳ Written, **NOT applied** — author applies (`supabase db push`). Adds the column + replaces `ingest_submission` to pin the answered version. |
| Permission helper functions | ✅ In place; future collaboration extends helpers |
| `@activity/schema` package | ✅ Tested, on GitHub |
| `@activity/renderer` package | ✅ Tests passing; runtime modular, esbuild-bundled, inlined; baseline print CSS in `styles.ts` |
| Renderer bundle for Edge Functions | ✅ Regenerated for Phase-2 rich popover fields (runtime 14.8 KiB); ⏳ **NOT yet deployed** — author runs `supabase functions deploy publish-activity` to make rich hint/feedback/solution go live |
| Phase 2 — rich text + inline math in hint/mistake-feedback/solution | ✅ Code + tests complete; ⏳ live UX unverified + bundle not yet deployed (see Current focus) |
| `publish-activity` Edge Function | ✅ Deployed (R2 upload, live + versioned URLs); redeployed with the `answerFeedback` bundle |
| `ingest-submission` Edge Function | ✅ Deployed; enforces `schemaVersion: 2`; returns `attempt_number`; **`verify_jwt: false`** (anonymous student POSTs — gateway must not require an auth header; the function self-authenticates with the service role). Re-set `--no-verify-jwt` on any future redeploy. |
| Edge Function secrets | ✅ Set |
| Supabase Storage `activities` bucket | ⚠ Exists; will be deleted after R2 migration verified |
| React app (`@activity/app`) | ✅ Scaffolded — Vite + React 19 + TS + Tailwind v4 |
| Auth | ✅ Google OAuth via Supabase; allowlist gate verified |
| React Router v7 | ✅ `/`, `/activities`, `/activity/:id`, `/playground` (dev-only) |
| Tiptap editor + custom NodeViews + slash menu + drag handle + reorder | ✅ See architecture decisions for the full set |
| MathLive integration | ✅ `<math-field>` web component; KaTeX render via NodeView |
| Serialize layer (Tiptap JSON ↔ ActivityDocument) | ✅ Verified correct; orphan-blank warning is intentional defense |
| Publish UI (`PublishControl`) | ✅ Implemented at `/activity/:id` header |
| Editor post-publish load fallback | ✅ Three-way priority (draft → current version → empty) |
| Cloudflare R2 hosting | ✅ Live; published HTML serves from R2 with correct Content-Type |
| Stage 9a — schema additions (checkpoints/feedback/skills) | ✅ |
| Stage 9b — DB migration 0005 (attempt_number) | ✅ |
| Stage 9c — Tiptap section_break + isCheckpoint UI | ✅ |
| Stage 9d — Lists + StarterKit trim | ✅ |
| Stage 9e — Architectural future-proofing | ✅ |
| Stage 10 — Editor wired to Supabase + activity list/create/autosave | ✅ |
| Stage 11 — Runtime file split + build pipeline | ✅ |
| Stage 12 — Renderer emission contract + runtime state-object architecture | ✅ |
| Stage 13 — Runtime feedback machinery + persistence (4 sessions) | ✅ |
| Stage 13.5 — Editor authoring UI for fill-in-blanks + section button + disappearing-block fix | ✅ |
| Stage 13.6 — Publish flow (PublishControl + load fallback + R2 hosting) | ✅ |
| Stage 14 — Submission flow polish (retry, resubmit, attempt reconciliation) | ✅ Complete; tested |
| Stage 15 — Editor UI for remaining feature fields | ✅ Complete; live-UI verified by author |
| Stage 16 — Submissions dashboard with all-attempts toggle | ✅ Complete; live-UI verified by author (3 live-test fixes applied — see Current focus) |
| Print feature — teacher-configurable printables (post-Stage-16) | ⏳ Designed; `docs/design/print-and-printables.md` |
| Markdown paste import | ⏳ Phase 1 polish |
| End-to-end manual test | ⏳ Now unblocked (R2 live); full pass still to run |

## Repo layout

```
activity-platform/
├── docs/
│   └── design/        — design docs captured ahead of implementation
├── packages/
│   ├── schema/        — Zod types, document model, factories
│   ├── renderer/      — Pure JSON → HTML string. KaTeX inlined. No DOM.
│   │   ├── RUNTIME.md — Architecture decisions for the published-page runtime
│   │   ├── tsconfig.json   — Renderer (no-DOM); excludes src/runtime/**
│   │   └── src/runtime/
│   │       ├── tsconfig.json    — Runtime (DOM lib, noEmit)
│   │       ├── config.ts        — RuntimeConfig + defensive parseConfig
│   │       ├── refs.ts          — BlankRef, FillInBlankRef (with confidenceRadios), SectionRef
│   │       ├── state.ts         — RuntimeState + BlankState/BlockState/SectionState + createInitialState
│   │       ├── init.ts          — The only DOM walker; produces {config, refs, state}
│   │       ├── dom.ts           — $/$$ helpers
│   │       ├── strategies.ts    — evaluateAnswer dispatch (list strategy implemented)
│   │       ├── blanks.ts        — scoreBlank + matchMistakeFeedback (pure); scoreBlankAndUpdateState + clearBlankState (state); wireBlanks + wireHints (event handlers)
│   │       ├── checkpoints.ts   — checkSection (pure mutator) + wireCheckpoints (click handler)
│   │       ├── confidence.ts    — wireConfidence (radio change handler)
│   │       ├── render.ts        — render(state, refs); renderBlank + renderBlock + renderSection. THE ONLY DOM MUTATOR after init.
│   │       ├── storage.ts       — saveName/loadStoredName + saveActivityState/loadActivityState/clearActivityState/applyStoredState + save/load/clearPendingSubmission (retry slot)
│   │       ├── submission.ts    — gatherResponses + gatherCheckpointResults + computeScore + submit + sendWithRetry/classifyFailure + flushPendingSubmission
│   │       ├── index.ts         — bootstrap orchestrator
│   │       ├── generated/       — runtime-bundle.ts (committed; produced by bundler)
│   │       └── __tests__/       — strategies, init, blanks, render, checkpoints, storage, confidence, submission
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/
│           │   ├── extensions/        — Tiptap extensions (MathInline, MathBlock, SlashMenu, SectionBreak, BlockReorderShortcuts, FillInBlank, Blank)
│           │   ├── nodeViews/         — React NodeViews (MathInlineView, MathBlockView, SectionBreakView, BlankView, FillInBlankView)
│           │   ├── components/        — Stage 13.5 popover (BlankPopoverHost, BlankEditPopover)
│           │   ├── Editor.tsx, Toolbar.tsx, slashMenuItems.ts, editor.css
│           ├── components/            — PublishControl (Stage 13.6)
│           ├── routes/
│           ├── lib/                   — serialize.ts (Tiptap JSON ↔ ActivityDocument)
│           ├── __tests__/
│           └── App.tsx, main.tsx, index.css
├── supabase/
│   ├── migrations/    — 0001 schema, 0002 RLS+helpers, 0003 RPCs+triggers, 0004 seed, 0005 attempt_number, 0006 account_tier, 0007 submission activity_version_id (NOT YET APPLIED)
│   └── functions/
│       ├── _shared/   — cors.ts (hand-edited), renderer.bundle.js (auto-generated)
│       ├── publish-activity/   — uploads published HTML to Cloudflare R2 (S3 API)
│       └── ingest-submission/
├── scripts/
│   └── bundle-renderer.mjs   — runs two esbuild builds: runtime (iife, inlined) → renderer (esm, Edge)
└── ...root configs
```

`packages/renderer/dist/` holds the runtime source map (`runtime.js.map`) as a dev-only artifact; gitignored and never shipped.

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Storage bucket (legacy):** `activities` (public, to be deleted after R2 migration verified)
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Allowlist-only signup (Phase 1).
- **`packageManager` pin in package.json:** REMOVED
- **Editor authoring dependencies added in Stage 13.5:** `@floating-ui/react` (popover positioning), `focus-trap-react` (popover focus management), `prosemirror-state` (for NodeSelection type narrowing in BlankPopoverHost).

## Architecture decisions made (and the reasoning, in case I forget)

### From earlier stages
- **Vertical-stack-of-typed-blocks editor** (Notion-style), not grid canvas.
- **Tiptap on ProseMirror, with React bindings**, KaTeX for math. Vue 3 was the close runner-up.
- **Tailwind v4 via the `@tailwindcss/vite` plugin**. Single `@import "tailwindcss"` in `src/index.css`. No PostCSS, no `tailwind.config.js`. Theme customization in CSS via `@theme`.
- **React Router v7** for SPA routing.
- **`/playground` is dev-only** — route registered conditionally on `import.meta.env.DEV`. Production bundle physically excludes it.
- **Editor lives as shared module at `src/editor/`**, used by `/playground` and `/activity/:id`.
- **Static HTML on publish** (option C). Host: Cloudflare R2 (Stage 13.6+); initially attempted Supabase Storage but Supabase rewrites HTML responses to text/plain.
- **Two URLs per published activity:** live alias (`/index.html`, 5min cache) and immutable versioned permalink (`/v{N}/index.html`, 1yr cache).
- **Drafts in a separate column** (`activities.draft_content`); versions append-only.
- **Permission helpers as SQL functions** so Phase 3+ collaboration changes one function, not eight policies.
- **Submission identity always present** — Pattern B: name field on the page, gate submit until non-empty. CHECK constraint enforces at storage layer.
- **Responses jsonb keyed by stable `blank.id`**, not array index.
- **`schemaVersion: 1`** on `ActivityDocument` stays at 1 — Stage 9a additions are all optional-with-defaults, so existing stored documents parse cleanly. `SubmissionResponses.schemaVersion` is at 2 with migrate-on-read for v1.
- **`attempt_number` lives on the submissions table as a column**, derived server-side via the `ingest_submission` RPC (`max + 1` over the student's identity scope, with `unique_violation` retry against partial unique indexes added in 0005). The Edge Function returns the canonical value in its HTTP response so the runtime can reconcile its optimistic guess. Client value is advisory only.
- **Runtime answer scoring is strategy-dispatched** — `evaluateAnswer(input, typed)` reads `data-blank-strategy`, defaulting to `'list'`.
- **Math nodes are atoms** with `attrs.latex` as the source of truth. Serialize as `<span data-math-inline data-latex="...">` / `<div data-math-block data-latex="...">`.
- **NodeView lifecycle pattern (the 5 commitments):** `useLayoutEffect` (synchronous before paint), stable ref as render target, tight dependency arrays (`[latex]`), `throwOnError: false`, `NodeViewWrapper as="span"` for inline / `as="div"` for block.
- **React state vs ProseMirror state in NodeViews:** UI concerns → React `useState`. Document concerns → ProseMirror (`updateAttributes`, `editor.isActive`). Conflating them was the cause of the "input deselects after one keystroke" bug.
- **Math NodeView edit-mode focus.** Entering edit mode must explicitly `.focus()` the `<math-field>`, deferred one animation frame (MathLive custom elements don't autofocus, and a focus issued the same tick the element mounts can be dropped). Exiting edit mode is wired to the field's `onBlur`.
- **MathLive in published HTML is a Phase 2.5 decision**, not committed. Editor-only commitment now.
- **Toolbar UX: static (always-visible) over BubbleMenu/FloatingMenu** — discoverability beats elegance for non-technical teachers.
- **Slash menu architecture:** `@tiptap/suggestion` + `tippy.js` + Tiptap's `ReactRenderer` (the `useImperativeHandle` pattern). Menu items live in `slashMenuItems.ts` as a flat array.
- **Drag handle: Notion-style, mouse-only** via `@tiptap/extension-drag-handle-react`. Hover-revealed in left gutter.
- **Keyboard reorder via `Mod+Shift+ArrowUp/Down`** — custom `BlockReorderShortcuts` extension. Operates on whichever top-level block contains the cursor.
- **`Editor` exposes `onUpdate(json)` callback prop** as the single hook for "react to doc changes."
- **JSON inspector lives in `Playground.tsx`, not `Editor.tsx`.** Standard "lift state up."
- **Serialize layer pattern:** `serialize.ts` in `@activity/app/src/lib/`, exports `tiptapToActivity` / `activityToTiptap`. The renderer never touches this file.
- **Three submission modes:** `single` (no checkpoints), `locked` (checkpoints freeze on check), `free` (checkpoints allow revision). Activity-level field on `ActivityMeta`, default `free`. Per-section checkpoints — tied to section boundaries.
- **Two revision modes:** `free` (revise + resubmit) and `locked` (no revision/resubmit). Activity-level, default `free`. Separate from submissionMode — `single` mode ignores `revisionMode`.
- **Attempt tracking:** each resubmit is a new `submissions` row with incremented server-derived `attempt_number`. Teacher dashboard has toggle: all attempts vs best score + count.

### Runtime architecture (Stages 11–12)
- **Runtime: real modules in source, inlined in output.** Source at `packages/renderer/src/runtime/`; built by `scripts/bundle-renderer.mjs` as a first esbuild step (minified IIFE, `chrome90` target) into a generated TypeScript string module (`runtime/generated/runtime-bundle.ts`), which `document.ts` imports and inlines into every published page via a `<script>` tag. Inlining is the right call for Phase 1: one fewer request on a slow Chromebook, runtime stays co-versioned with the HTML it ships in. Separate-file CDN model is a Phase 3+ migration target.
- **Two tsconfigs in the renderer package.** The renderer is pure no-DOM TypeScript; the runtime is DOM TypeScript. `packages/renderer/tsconfig.json` excludes `src/runtime/**`; `packages/renderer/src/runtime/tsconfig.json` adds the DOM lib with `noEmit` (esbuild does the build). The package's `build` and `typecheck` scripts run both `tsc` invocations in sequence so runtime cannot silently rot.
- **Data-attribute contract is a public API.** Renderer emits; runtime reads. Frozen for already-published activities; additive changes only. Every attribute read uses `?? default` fallback. Init and event handlers wrapped in try/catch — graceful degradation to basic submit if init fails.
- **Renderer data-attribute contract.** Blank tokens are `<input class="blank">` inside `<span class="blank-wrapper">` with sibling `.js-blank-feedback` (void-element-can't-have-children fix); always-available hint `?` button (not post-incorrect reveal); mistake feedback re-evaluated each check; `data-submission-mode` deliberately NOT on the container in single mode (checkpoint markup omitted entirely); split-by-purpose contract (CSS hooks → `data-*` on `.activity-container`, JS-only config → six-field `#activity-config` blob); per-block (not per-blank) confidence fieldset.
- **`init.ts` is the only DOM walker.** Returns `{config, refs, state} | null`; parseConfig returns null on missing/malformed config and the caller falls back to no-op runtime. `buildRefs` walks sections → fill-in-blank blocks → blanks once and produces typed `BlankRef` / `FillInBlankRef` / `SectionRef` maps keyed by uuid. Downstream code consumes refs; nothing else calls `querySelector` against the body. Malformed per-element data attributes are warn-and-skip, not throw.

### Runtime feedback machinery + persistence (Stage 13)

- **State→DOM separation: `render(state, refs)` in `render.ts` is the only function in the runtime that mutates the DOM after init.** Every event handler mutates `RuntimeState` then calls a unified `onUpdate` callback that runs render + persist. Concentrating the DOM-mutation exception in one file makes the rule grep-able and enforceable. One exception: `applyStoredState` in `storage.ts` sets `input.value` during bootstrap restoration, BEFORE the initial render runs and before handlers attach.

- **Change-guard pattern in render.** Every DOM write checks the current DOM state and only writes when the target differs. For class toggles, `classList.toggle(name, condition)` is idempotent. For attribute / `hidden` / `checked` / `textContent` writes, explicit current-vs-target checks. Renders are idempotent — calling twice with the same state produces no observable diff.

- **State shape (per-entity, all populated by `createInitialState`):**
  - `BlankState`: `result` (true/false/null), `matchedMistake` (string or null). (No `hintRevealed` — hint visibility is now global modal state, see below.)
  - `BlockState`: `solutionRevealed` (boolean), `confidence` (`'unsure' | 'think_so' | 'certain' | null`).
  - `SectionState`: `checked`, `locked`, `score`, `total`, `checkedAt`. `total` is section total (denominator for score display), NOT attempted count.
  - Top-level `RuntimeState.hintModalBlankId` (`string | null`): which blank's hint the single global modal is showing, or null when closed. Not persisted.

- **`scoreBlankAndUpdateState` renamed from `checkBlank`.** Pre-Stage-13, `checkBlank` mutated DOM via `applyBlankFeedback`. Post-Stage-13, the function mutates state only — render handles DOM. The rename makes the side effect explicit. Takes `(state, id, ref)`; id passed explicitly so the function doesn't read it from DOM (`ref.input.dataset.blankId` would violate the init-walks-DOM rule). Caller has id from Map iteration.

- **`clearBlankState` returns boolean change indicator.** Used by the `input` event handler to skip `onUpdate` (render + persist) on keystrokes that don't actually change state — avoids cascading renders during fresh typing. Returns true only when result or matchedMistake was non-null and got cleared.

- **Mistake feedback matching rules.** String match against `BlankRef.mistakeFeedback` entries' `match` field. Case-insensitive: trim AND lowercase both sides before compare (a student shouldn't lose targeted help over capitalization). First match wins. Computed at scoring time (in `scoreBlankAndUpdateState`) and stored in `BlankState.matchedMistake`; render reads it.

- **Feedback slot policy.** `.js-blank-feedback` carries mistake-specific text only — populated when a wrong answer matches an authored mistake entry, hidden otherwise. Visual correct/incorrect signal lives on the input border class (`.correct` / `.incorrect`). Screen reader signal is `aria-invalid="true"|"false"` on the input itself (removed entirely when result is null, so the attribute doesn't claim "this is valid" before the student has tried). Avoids "Correct ✓" clutter on a 30-blank worksheet.

- **Hint affordance (global modal).** A single hint modal element lives at the end of `<body>` (emitted by `document.ts`); `refs.hintModal` is its `HintModalRef`. Clicking a blank's `?` button sets `RuntimeState.hintModalBlankId` to that blank's id; `render` copies the blank's `data-hint` into the shared modal body, unhides it, and flips that blank's button `aria-expanded`. Setting `hintModalBlankId` back to null closes it. Replaced the old per-blank inline-reveal (`hintRevealed` + `.js-blank-hint-text` span) — one modal gives more room and future rich formatting. Modal open state is NOT persisted across reload (transient UI, unlike scored results).

- **Edit-to-clear behavior.** `wireBlanks` attaches both `blur` (score + render) and `input` (clear stale state + conditional render) handlers. When the student types into a blank that already has a scored result, the input handler clears it so a stale green "correct" border doesn't linger on an edited but un-re-blurred answer.

### Fill-in-blank authoring (Stage 13.5)

- **Fill-in-blank block is a `fillInBlank` Tiptap node** with content spec `(text | mathInline | blank)*`. Inserted via slash menu, the "Problem" toolbar button, or markdown sentinel `{{answer|alt|alt}}` parsing.
- **Blanks are inline atom nodes living ONLY inside fillInBlank blocks** (the schema's `FillInBlankInline` union: text | mathInline | blank). The block's content spec enforces placement at the ProseMirror level.
- **Three insertion paths**: slash menu, sentinel `{{...}}` typed inline (pipe-delimited acceptable answers — matches runtime's `data-blank-answers` format), or "Blank" toolbar button (enabled only when cursor inside a fillInBlank).
- **Chip rendering**: a small inline pill with the canonical answer + underline beneath. Width derived from answer length: `Math.max(answer.length + 1, 4)` ch. Formula must stay in sync between `BlankView.tsx` (editor) and `inline.ts` (renderer).
- **Per-blank editing via a single popover at editor root**, not per-chip. `BlankPopoverHost` watches editor selection (via `instanceof NodeSelection` narrowing); renders `BlankEditPopover` when a `blank` node is the active selection. One floating-ui instance, one portal mount/unmount lifecycle tied to selection. Per-chip popover was tried in Drop 1 and broke widespread editor behavior (slash menu inline-render, fill-in-blanks uneditable, drag handles broken) — diagnosed as React reconciliation issues with N permanently-mounted popovers.
- **Popover state lifecycle**: local React state for editing, refs mirror state for synchronous flush reads, initial-value refs hold the baseline for change diffs. Per-field save-on-blur is the normal commit path; `flushAll()` runs on every close path (Escape, outside click, Enter) so typed-but-not-blurred values survive close.
- **`updateBlankAttrs(pos, attrs, options?)`** — chain command for updating blank attrs by position. `options.preserveSelection` (default `true`) re-applies NodeSelection at the chip's position after setNodeMarkup so the popover stays open across edits. Close-time flushes pass `false` so the subsequent setTextSelection in onClose can move selection cleanly off the chip in one click. Without the flag, the re-asserted selection fights with onClose's selection move and the popover bounces back open, requiring a second click.
- **`onChange` thread carries options through**: BlankEditPopover → BlankPopoverHost.handleChange → editor.commands.updateBlankAttrs. Lets the popover request `preserveSelection: false` when flushing on close.
- **Popover positioning**: floating-ui with `offset`, `flip`, `shift`, and `size` middleware. `size` dynamically computes `max-height` based on available viewport space at the chosen placement, floor `MIN_POPOVER_HEIGHT = 200`. `flip` lets the popover anchor above the chip when there's more space there (tall popovers near page bottom flip up). CSS no longer sets `max-height` — it's controlled by JS via inline style.
- **Focus trap via `focus-trap-react`**. Tab cycles within the popover; Escape and outside-click still fire our handlers (`escapeDeactivates: false`, `allowOutsideClick: true`). Initial focus deferred to our rAF-based answer-field focus rather than FocusTrap's synchronous default. Focus returns to the chip on close (`returnFocusOnDeactivate: true`).
- **Document-level outside-click handler** in BlankEditPopover closes the popover when mousedown lands outside both popover and chip. Covers page-chrome clicks where ProseMirror's selection-change wouldn't fire.
- **Toolbar buttons for insertion**: Three new buttons across two groups.
  - "Problem" (always enabled, inserts empty `fill_in_blank` block)
  - "Blank" (enabled only when `editor.isActive('fillInBlank')`, inserts blank with `?` placeholder, then `setNodeSelection` via rAF so the popover auto-opens for immediate editing)
  - "Section" (in a separate Structure group at toolbar end, inserts section break via `insertSectionBreak()` — SectionBreakView's existing inline UI handles title + checkpoint editing)
- **Serialize layer extended for Stage 13.5**: `tiptapBlankToActivity` and `activityBlankToTiptap` round-trip all four blank fields (answer, acceptableAnswers, hint, mistakeFeedback). Optional fields (hint, mistakeFeedback) only serialized when non-empty for round-trip exactness.
- **`FillInBlank` carries `definingForContent: true`.** Prevents ProseMirror's content-fit algorithm from auto-lifting an inline atom out of a parent block it just emptied — root cause of the empty-block disappearing on the sentinel input rule. `defining: true` would also fix that symptom but breaks drag-reorder asymmetrically (it doubles as `definingAsContext`, which preserves drag-source context too aggressively and makes later blocks un-droppable above earlier ones). `definingForContent` is the targeted granular flag that isolates the destination-side preservation we want without the source-side regression. The Blank input rule handler passes `range` directly to `insertContentAt` (cleaner than the prior recomputed `from`/`to`, though that recomputation wasn't itself the bug).

### Publish flow infrastructure (Stage 13.6)

- **PublishControl placement: page header, NOT editor toolbar.** Publish is an activity-level action; the toolbar is for editor-formatting controls. Sits right of `SaveIndicator` in `ActivityEditor.tsx`. Mirrors common patterns (Google Docs, Notion both put "Share" top-right).
- **No confirmation modal for first publish or republish.** Each publish creates a new immutable version row; nothing destructive happens. Friction cost of a modal isn't justified yet. Easy to add later if version sprawl becomes a real problem.
- **Disabled while `saveStatus === 'saving'`.** Prevents publishing a stale draft mid-autosave. The 1s useAutosave debounce window can still race a fast click; relying on the "Saved" indicator for now. Proper `flush()` on useAutosave is Stage 14 polish.
- **"Publish" → "Publishing..." → "Republish" label progression** in-session. The "Republish" wording surfaces only after the first successful publish in the current session — reduces "wait, did I already do that?" moments without requiring a persistent state read on mount.
- **Success state shows the live URL inline.** Green pill displays `Published v{N}` + Copy URL button + Open-in-new-tab link. The Open link is the critical affordance — it's how the teacher previews as a student. Public URL (live alias) shown; versioned URL recorded internally but not surfaced for routine sharing.
- **Editor load priority: draft → current version → fresh empty.** The publish RPC clears `draft_content` atomically on success. Without the version-content fallback, reloading the editor after publish shows an empty doc (real bug, first reported during Stage 13.6 sketching, fixed same session). Both queries are issued from the same `useEffect` with cancellation guards. `Activities.tsx` always inserts a draft on create, so the fresh-empty branch is defensive (theoretically unreachable via the normal flow).

### Hosting platform (Stage 13.6)

- **Published HTML hosts on Cloudflare R2, NOT Supabase Storage.** Supabase free-tier prohibits HTML content from being served on `*.supabase.co` domains:
  - **Storage**: public buckets serve HTML as `Content-Type: text/plain` with a sandbox CSP, as an anti-abuse measure to prevent the platform from being used for arbitrary web hosting. Documented at https://supabase.com/docs/guides/storage/quickstart.
  - **Edge Functions**: same rewrite is applied at the gateway level — `GET` requests returning `text/html` are downgraded to `text/plain` with the same sandbox CSP, regardless of what the function's `Response` constructor sets. Documented at https://supabase.com/docs/guides/functions/http-methods and https://supabase.com/docs/guides/functions/limits.
  - Only exception is Pro-plan with custom domain ($25/mo); ROADMAP's sustainability model defers paid tiers to Phase 4.
- **Discovered during Stage 13.6 e2e testing.** First attempt was direct Storage public URL → browser saw text/plain, won't render. Second attempt was a `serve-activity` Edge Function proxy that reads from Storage and re-emits with the right Content-Type → same gateway rewrite hit at the function-response level. Both architectures dead-ended for the same root cause.
- **Cloudflare R2 is the chosen replacement.** Reasoning:
  - **Zero egress cost** (the unique R2 feature; every other major object store charges per-GB downloaded). For a K-12 platform with student-driven download volume, this scales sustainably to Phase 5 marketplace.
  - **Generous free tier:** 10 GB storage, 1M Class A operations (writes), 10M Class B operations (reads) per month. Fits Phase 1-3 by a wide margin; even Phase 4 district scale comfortably.
  - **S3-compatible API.** Standard AWS SDK works in Deno via esm.sh. No proprietary library lock-in; migration to another S3-compatible bucket (Backblaze B2, Wasabi, AWS S3) later is a config-and-DNS change, not a code rewrite.
  - **Free custom domain support.** Phase 4 district procurement conversations get easier when activity URLs live at `activities.yourbrand.com` rather than `pub-7a3f.r2.dev`.
  - **ROADMAP-aligned.** Already named as the destination in Phase 2/3; pulling it forward to Phase 1 is acceleration, not deviation.
- **Hybrid architecture: keep Supabase for everything else.** Database, auth, Edge Functions (publish-activity, ingest-submission) all stay on Supabase. R2 hosts ONLY the published HTML output. This is the minimum-viable migration; full Cloudflare migration (Workers + R2 + Pages) is a future option but not warranted now.
- **`serve-activity` Edge Function: deleted.** Was created in this session as the proxy attempt; superseded by R2 (which serves HTML directly with the right Content-Type). Local directory removed; Supabase deployment removed via `supabase functions delete serve-activity`.

### Editor UI for feature fields (Stage 15)

- **Activity metadata was already persisted before Stage 15.** `ActivityEditor` held the full `ActivityMeta` in state and round-tripped it through `draft_content`; only `title` had a control. The other fields loaded and saved back unchanged. So adding pickers was pure wiring to `setMeta` — `changeKey` already fingerprinted meta, so autosave needed no change.
- **Activity settings live in a collapsible disclosure under the title, NOT a modal/gear-drawer.** Discoverability-beats-elegance (same reasoning as the static toolbar over BubbleMenu). Always-visible label, expand for the three pickers.
- **`revisionMode` control is disabled (not hidden) in single mode**, with "Not used in single-submit mode." helper text. Hiding it would make the submissionMode↔revisionMode coupling invisible; disabling makes it legible.
- **`gradingMode` gets no picker in Phase 1.** It's inert (manual/mixed treated as auto until Phase 2.6 per-block grading lands). Surfacing a control would imply functionality that doesn't exist. Add it when manual-graded block types arrive.
- **`activityType` picker is included even though renderer presentation-branching is Phase 2.** It has a real near-term consumer: Stage 16's dashboard filters on it.
- **Locked-mode checkpoint validation WARNS, does not block save.** Blocking save mid-edit is hostile. An amber inline banner (continuous, not just at publish) fires whenever locked mode coexists with any non-checkpoint section. The implicit leading section (content before the first `sectionBreak`) counts as non-checkpoint. Resolves open-question #258.
- **FillInBlank block-field UI is an inline NodeView footer disclosure, NOT a popover.** Mirrors SectionBreakView's inline-controls pattern and sidesteps the per-chip-popover hazards documented in Stage 13.5. The blank-token popover stays for per-blank fields; block-level fields (solution, confidence) get the footer. The footer stays hidden for a plain/unselected/unconfigured problem to keep long worksheets uncluttered (shown when `selected || settingsOpen || isConfigured`). It's `contentEditable={false}` so ProseMirror doesn't treat it as block content; the solution textarea `stopPropagation`s keydown so editor shortcuts don't fire while typing.
- **`solution` was a plain multiline string in Phase 1; Phase 2 upgraded it to inline rich text + math** (now `InlineNode[]`, authored via `InlineRichTextEditor` in the footer — see Current focus).
- **`skills` editing UI deferred to Phase 2** (the schema scheduled it there). The attr round-trips through the node and serialize so data survives, but no control surfaces it. Don't add a skills tag-input without revisiting Phase 2 scope.

## Standing constraints

- **Pure renderer.** `@activity/renderer` is JSON-in, HTML-string-out. No I/O, no environment reads at render time. The runtime is the exception that proves the rule — its text is baked in at build time as a string constant.
- **`noUncheckedIndexedAccess` stays on.** It catches real bugs; never disable to silence index-access errors. Use `?.` and `?? default` instead.
- **Best-practice over shortcut.** Default preference; ask before substituting.
- **Ask before assuming on anything ambiguous.** Explicit working-style instruction.
- **UX is a priority** — performance budget, optimistic autosave, visible state indicators, predictable shortcuts.
- **Renderer bundle commits with the source it supports.** After any change to schema, renderer, or runtime source, run `pnpm run bundle:renderer`; commit the bundle in the same commit. CI should run the bundle on push so deploys never use a stale bundle (still a housekeeping todo).
- **Baseline print CSS.** Activities must look reasonable on paper out of the box: hide interactive controls, `break-inside: avoid` on problems with `break-before: auto` on sections, neutralize blanks back to bare underlines, encode callout variants in border style (solid/dashed/double/dotted) so they survive grayscale, `@page { margin: 0.5in }`.
- **Runtime: `render(state, refs)` is the only DOM mutator after init.** Every event handler writes to state, then calls `onUpdate` (which runs render + persist). The single permitted exception is `applyStoredState` setting `input.value` during bootstrap restoration, before the initial render runs.
- **Runtime: `init.ts` is the only DOM walker.** All `querySelector` / `querySelectorAll` against arbitrary subtrees happen during init. Downstream consumes typed refs.
- **Runtime persistence schema bumps with shape changes.** `STORAGE_SCHEMA_VERSION` is currently 2 (bumped from 1 when `BlankState` dropped `hintRevealed`). If `BlankState`, `BlockState`, `SectionState`, or the blob shape changes incompatibly, bump it. Load returns null on mismatch → fresh state.
- **Editor popover: single host, mount on selection.** Per-chip popover mounting broke editor behavior (Drop 1 attempt). Single `BlankPopoverHost` at editor root with selection-driven `BlankEditPopover` mount/unmount is the correct architecture; don't reintroduce per-chip mounting.
- **Published HTML lives on Cloudflare R2.** Supabase Storage cannot serve HTML on free tier (rewritten to text/plain). Same restriction applies to Edge Functions. R2 is the destination; the Supabase Edge Function uploads to R2 instead of Supabase Storage.

## Open questions / deferred decisions

- **Custom domain for R2** (Phase 2 polish): student-facing URLs currently use `pub-<hash>.r2.dev`; a domain like `activities.<brand>.com` looks more professional for districts. Requires owning a domain. Cloudflare DNS setup is ~5 min once that exists.
- **Supabase Storage `activities` bucket cleanup**: leave alone until R2 migration is verified working end-to-end. Then delete the bucket from the dashboard. Not urgent.
- **Empty fill_in_blank drag handle attachment** — pre-fix observation was that drag handles only attached to non-empty fillInBlank instances. Whether `definingForContent: true` changes this is unverified; re-test as part of Stage 14 drag-reorder pass. Minor either way.
- **Section color tinting:** dropped from Phase 1 (cosmetic).
- **Image upload (vs current image-by-URL only):** Phase 2. Also worth considering R2 as the destination for these uploads rather than Supabase Storage, since R2 is already integrated by Stage 13.6.
- **Multi-tenancy / district-scoped activities:** Phase 4+. Helpers are designed for it.
- **Governance model when a teacher leaves a district:** pick before designing org features. Not urgent.
- **CDN-hosted shared runtime (Phase 3+):** when to move from versioned-per-publish to CDN-hosted, a `runtimeVersion` selector is added at that point. Trigger: when republishing activities for a runtime bug fix becomes painful (~50+ active activities). R2 makes this naturally easy if it lands later.
- **Responsive `--blank-width` sizing.** Considered for Stage 11 baseline; deferred to either Stage 15 or post-Stage-16 print feature.
- **Phase 2 block type priority order:** worked example, faded worked example, learning objectives + success criteria, self-explanation. Decide order when Phase 2 starts based on which gap is most painful.
- **UX validation with other teachers:** 2–3 informal reviews of Stage 13 + Stage 13.5 patterns (chip popover UX, toolbar button discoverability, mistake feedback styling, section break inline UI) before classroom adoption. Cost is low now; rises sharply once students start using activities.
- **Non-checkpoint sections in locked mode** — RESOLVED (Stage 15) as a non-blocking warning. `ActivityEditor` shows an amber banner when locked mode coexists with any non-checkpoint section (including the implicit leading section). Chose warn-over-block deliberately; if version sprawl of bad locked-mode activities becomes real, escalate to a publish-time block later. Runtime still accepts what's emitted.
- **`skills` editor UI deferred to Phase 2** (Stage 15 decision, confirmed with author). The field exists on `ActivityMeta`, `FillInBlankBlock`, and `ProblemBlock`; the renderer emits `data-skills` and the runtime reads it; the FillInBlank node attr + serialize round-trip carry it. The only missing piece is an *editing control* (a tag input, both activity-level and per-block). Pick up when Phase 2 per-skill analytics work starts. Don't add it piecemeal without that scope.
- **Post-success edit edge case (Stage 14 resolved the resubmit half).** In free mode, `applySubmitSuccess` now keeps state + persistence (no `clearActivityState`), so a revised attempt resumes from prior work. Locked/single still freeze and clear; the brief write-then-remove of the blob in that path remains (wasteful but correct, low priority).
- **`init.test.ts` coverage** for `state.blanks` and `state.blocks` initialization is still a Session 1 follow-up. Tests pass without it (defaults work) but explicit coverage is overdue.
- **No tests for Stage 13.5 work beyond serialize round-trip.** Popover state machine tests are unwritten. Pick up alongside Stage 14.
- **Selection-change unmount flush leak.** When the popover unmounts because selection moved to a different chip (not via Escape/outside-click), the unmount cleanup's `flushAll` calls `onChangeRef.current()` → host's `handleChange`, but by then `selectedBlank` is null so the guard returns silently. Outside-click and Escape are handled; selection-move-to-different-chip is a small leak (edits typed in chip A would be lost if user immediately clicks chip B). Stage 14 or polish-pass candidate.
- **Section title/checkpoint inline UI exists in SectionBreakView** but there's no editor-level metadata panel. Stage 15 may add one; for now inline UI is adequate.
- **Manual grading workflow shape (Phase 2.6):** does each grading pass amend the existing submission row, or create a new "grading" row that joins to it? Probably the join, for audit-trail reasons. Decide at Phase 2.6 start.
- **Media submission storage and privacy posture (Phase 2.8):** student-uploaded media is a stronger privacy posture than typed text. Storage bucket separation, per-teacher quotas, retention policy. Decide at Phase 2.8 start. R2 is the obvious storage destination since we're already integrated.
- **Annotation response coordinate space (Phase 2.9):** CSS pixels vs normalized fractions vs DOM-anchor + character-offset. Decide at Phase 2.9 start.
- **Autosave hardening — DONE (Stage 14):** `useAutosave` now has a `beforeunload` guard that warns while dirty, closing the hard-tab-close-within-debounce-window gap.

## Nearest next steps

1. **Address bugs with the published activity function.** ✅ The bugs found so far have been addressed (see recent fix commits — hard_break newlines, inline KaTeX CSS). Keep this as the running catch-all: as new published-activity bugs surface, capture each as reproduced (steps, expected vs actual), fix, regenerate the bundle if runtime/renderer source changes, redeploy `publish-activity` if the function changes, re-verify against a real published URL.

2. **End-to-end manual test** (now actually possible). Build a test activity with: multiple sections (at least one checkpoint), several fill-in-blank problems with hints and mistake-feedback entries authored via the popover, at least one block with a solution, at least one block with confidence rating enabled, in `free` mode first then re-test in `locked` mode. Verify:
   - Authoring works through the popover (Stage 13.5)
   - Refresh persists all popover-authored fields (Stage 13.5)
   - Published HTML carries all data attrs from popover fields
   - Blur a blank → see correct/incorrect class + aria-invalid
   - Type a known mistake → see targeted mistake feedback in the slot
   - Click hint button → global hint modal opens with that blank's hint; close → modal hidden (open state not restored on refresh)
   - Click "Check this section" → see section score, solutions reveal, in locked mode inputs freeze
   - Refresh page → all state restored exactly (typed values, scores, solutions revealed, lock state, hint reveals)
   - Select confidence → restored on refresh
   - Submit → payload includes per-blank `confidence` and `responses.checkpointResults`
   - Reload after success → fresh form (persistence cleared)

3. **Cleanup after end-to-end test passes.** Delete the legacy `activities` Supabase Storage bucket (no longer used). Remove related env vars / secrets that referenced it. Optional: leave the bucket name in `STORAGE_BUCKET` env var as a vestigial alias in case any rollback is needed within the same week.

4. **Stage 14 — Submission flow polish.** ✅ DONE (this session). Retry-with-backoff + persisted pending-submission slot, attempt reconciliation, free-mode resubmit, `beforeunload` guard, PublishControl detail surfacing, useAutosave `flush()`. Tested; bundle regenerated. The one remaining manual-verification gap: exercise resubmit + retry on a *real published URL* during the #2 e2e pass (unit tests cover the logic, not the live network path).

5. **Stage 15 — Editor UI for remaining feature fields.** ✅ DONE (this session). Activity-level `submissionMode`/`revisionMode`/`activityType` pickers in a settings disclosure; FillInBlank block-level `solution` + `hasConfidenceRating` authored via an inline NodeView footer; serialize round-trips all three new block fields. Locked-mode checkpoint validation = non-blocking warning. **Scope notes:** `gradingMode` picker omitted (inert in Phase 1); `skills` editing UI deferred to Phase 2 (attr still round-trips); the standalone `ProblemBlock` was dropped from scope — it has no editor representation (the toolbar "Problem" button inserts a `fillInBlank`), so there was nothing to author. **Live-UI verification: ✅ DONE** — author exercised the settings pickers + `answerFeedback` on a real authed activity; all working.

6. **Stage 16 — Submissions dashboard with all-attempts toggle. ✅ COMPLETE — live-verified.** Code + 13 new unit tests + app build all green; no bundle regen (app-only — no renderer/runtime/schema source touched). Author ran the live pass this session against seeded data; three issues found and fixed (published-URL retrieval, blank-settings discoverability, `ingest-submission` `verify_jwt` — all detailed in Current focus).

   **What landed:**
   - New route `/activity/:id/submissions` ([Submissions.tsx](packages/app/src/routes/Submissions.tsx)), registered behind `RequireAuth` in [App.tsx](packages/app/src/App.tsx).
   - Pure helper [submissions.ts](packages/app/src/lib/submissions.ts): `groupSubmissions` (per-student grouping, latest+best+count+attempts), `buildActivityIndex` (blank.id→{prompt, answer key, problem #, section} + section index for a given activity document; `Submissions.tsx` builds one index per submission version and falls back to the current version / draft — see post-Stage-16 hardening pass), `formatScore`. Unit-tested in [submissions.test.ts](packages/app/src/__tests__/submissions.test.ts).
   - Summary (default) / All-attempts toggle; summary table (student · latest% · best% · attempt count · last submitted) with expandable per-student drill-down; all-attempts view groups every row by student then attempt #.
   - Drill-down maps each `BlankResponse` to its problem prompt + answer key, shows answer/correct✓✗/confidence per blank and per-section `checkpointResults`; blanks removed by a later edit are labelled "No longer in this activity"; unreadable `responses` jsonb is caught per-row (migrateSubmissionResponses).
   - Entry points: "Submissions" link in the editor header ([ActivityEditor.tsx](packages/app/src/routes/ActivityEditor.tsx)) and per-row on `/activities` ([Activities.tsx](packages/app/src/routes/Activities.tsx) — row refactored from a single wrapping `<Link>` to a flex container so there's no nested anchor).

   **Settled design:**
   - **Per-activity dashboard** at route `/activity/:id/submissions`, reached from a "Submissions" button in the editor header and a per-row link on `/activities`. Submissions are activity-scoped; a global cross-activity view is deferred.
   - **All-attempts toggle, two modes:** *Summary* (default — one row per student: headline score, attempt count, last-submitted) and *All attempts* (every submission row, grouped by student then `attempt_number`).
   - **Summary headline score = latest attempt (primary), best shown secondarily.** ⚠ **CHANGED from original plan** (was "best-score-plus-count"). Rationale: for formative work the latest revision reflects current understanding better than the historical best; best is still displayed, just not the headline.
   - **Student grouping key = exact `display_name` string** (Phase 1 link-share only; `opaque_token` null until Phase 3). Accepted limitation: "Bob S" vs "Bobby Smith" become two students. Roster-canonical identity dedup is Phase 3, not now.
   - **Drill-down:** expand a submission to show per-blank `answer` / correct✓✗ / `confidence`, plus per-section `checkpointResults`. Blank IDs are **mapped to their prompt/answer-key by indexing the exact activity version the student answered** (each submission pins `activity_version_id`; the post-Stage-16 hardening pass added this — see Current focus) so the teacher sees legible problems, and the right answer key even after a republish; legacy/null rows fall back to the current version. No cross-student aggregation ("78% got #3") — that stays Phase 2.
   - **`activityType` filter DROPPED from Stage 16.** ⚠ **CHANGED from original plan** (STATE #6 previously said "Filter by `activityType`"). A per-activity dashboard has one activityType, so the filter is redundant; it only makes sense on a global cross-activity view, which is deferred. Revisit if/when that global view lands.
   - **CSV export deferred** (not in the first cut) to keep scope tight; easy additive follow-on.

7. **Housekeeping (parallel):**
   - `init.test.ts` coverage for `state.blanks` and `state.blocks` initialization (Session 1 leftover)
   - Stage 13.5 popover state machine tests
   - UX validation with 2–3 other teachers on Stage 13 + Stage 13.5 patterns
   - CI workflow: GitHub Actions running `pnpm test` + `pnpm --filter @activity/renderer typecheck` + `pnpm --filter @activity/app build` + `pnpm run bundle:renderer` on push. (Higher priority now: Stage 14 found the renderer runtime test suite had silently never run because `vitest.config.ts` `include` excluded `src/**`, and a committed `tsc -b` break in the app went unnoticed because nothing ran `build`. CI would have caught both.)

8. **Phase 1 polish (after Stage 16 closes the MVP loop):**
   - Markdown paste import
   - Print feature (teacher-configurable printables — see `docs/design/print-and-printables.md`)
   - Custom domain for R2 (when you own a domain)

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed.
- Don't put auth or DB code in the renderer. Package boundary is the discipline.
- Don't write RLS policies that inline ownership checks — call the helpers.
- Don't conflate ProseMirror selection state (`selected`) with React UI state (`editing`) in NodeViews. Mixing them causes the "input deselects after one keystroke" class of bug.
- Don't add MathLive to published HTML in Phase 1. That's a Phase 2.5 decision.
- Don't regress flowing-water UX as features land — performance budget, optimistic autosave, visible state indicators, predictable shortcuts. Flag friction risks proactively.
- Don't mix `@tiptap/*` package versions. Update the family together.
- Don't make breaking changes to the runtime data-attribute contract. Add new attributes; never rename or remove existing ones.
- Don't import `@activity/schema` from the runtime. Parallel types are deliberate; 20KB budget rules out Zod. Wire format is the contract.
- **Don't mutate the DOM outside `render()`.** The single permitted exception is `applyStoredState` setting `input.value` during bootstrap restoration, before the initial render runs and before handlers attach. Every other DOM mutation goes through render.
- **Don't query the DOM outside `init.ts`.** All `querySelector` / `querySelectorAll` against arbitrary subtrees happens once at init; downstream consumes typed refs.
- **Don't widen the persistence schema without bumping `STORAGE_SCHEMA_VERSION`.** Load returns null on mismatch (fresh state, which is correct behavior); silently accepting wider shapes risks reading stale incompatible data.
- Don't trust the client's `attempt_number`. Server derives from `max + 1` and returns it canonically.
- Don't reveal solutions before a section is checked. The HTML carries the data; runtime decides when to render. `BlockState.solutionRevealed` is the gate.
- Don't add JS dependencies to the runtime. Single-file vanilla TypeScript by design.
- Don't query the DOM inside runtime scoring or state functions. Read once on init; mutate state; let render handle DOM.
- Don't disable `noUncheckedIndexedAccess`. Fix the call sites with `?.` chaining instead.
- Don't widen `BlankResponse.answer` to a union type. When a new response category (MC, ordering, file upload, etc.) lands, it gets its own parallel map on `SubmissionResponses`.
- Don't bake math-specific assumptions into the renderer or runtime. Name by shape (`numeric_input` not `physics_quantity`).
- Don't pre-build Stripe / subscription / billing infrastructure. Phase 4+ work.
- Don't paywall Phase 1 features under any circumstance.
- Don't add real-time usage counters to the hot path. Aggregate from `audit_log` via materialized views or scheduled jobs.
- Don't diff serialized `ActivityDocument`s for change detection. `tiptapToActivity` mints fresh UUIDs per call; fingerprint Tiptap JSON instead.
- Don't gitignore the runtime's generated string module. `packages/renderer/src/runtime/generated/runtime-bundle.ts` is committed so a clean checkout can typecheck the renderer without running the bundler.
- **Don't reintroduce per-chip BlankEditPopover mounting.** Drop 1 of Stage 13.5 attempted this and broke widespread editor behavior. The single-host pattern at editor root with selection-driven mount/unmount is the correct architecture.
- **Don't bypass `flushAll()` on popover close paths.** The lost-edit-on-immediate-close bug returns if any close path skips it.
- **Don't change `updateBlankAttrs` to always preserve OR always release selection.** The optional `preserveSelection` flag exists because edit-time (preserve to keep popover open) and close-time (release so onClose can move selection cleanly) have opposite requirements.
- **Don't import the SectionBreak NodeView's title input or checkpoint state into the toolbar's Section button logic.** Inline UI handles section properties; the toolbar button just inserts.
- **Don't put `defining: true` on FillInBlank.** It fixes the empty-block-disappearing-on-sentinel bug as a side effect but breaks drag-reorder asymmetrically — later blocks can't move above earlier ones because `defining: true` doubles as `definingAsContext`, which preserves drag-source context too aggressively. Use `definingForContent: true` instead, which targets only the destination-side preservation that the input-rule case actually needs.
- **Don't try to serve HTML from any `*.supabase.co` URL.** Supabase's anti-abuse policy rewrites `text/html` responses to `text/plain` with a sandbox CSP that blocks all script execution, on both Storage and Edge Functions. Documented at https://supabase.com/docs/guides/functions/limits. Only exception is Pro-plan custom domains. Hosting goes on Cloudflare R2 (or whatever non-Supabase static host); the runtime never lives on a `supabase.co` URL.
- **Don't put the publish button in the editor toolbar.** Publish is an activity-level action; the toolbar is for editor-formatting controls. It belongs in the page header next to `SaveIndicator`.
- **Don't use raw object-storage URLs for student-facing links.** Publish-activity returns the R2 public URL with the activity-id path. Don't bypass that and hand students a versioned path or a backend URL — both are wrong abstractions for sharing.

## Working with the author (notes for the next AI session)

Solo dev: Dallas ISD Algebra II teacher, working-level JS/Python, learning systems engineering as the project progresses. Engages with the *why* behind a choice; lean toward giving rationale alongside the action. Skip ceremony — no "great question," no "happy to help" wrappers. Best-practice-over-shortcut is the default, "ask before assuming" is an explicit standing instruction, UX-as-priority is also explicit.

Specific friction patterns where unstated assumptions have caused loops:

- **Git workflow isn't automatic.** Lay out `git add <paths>` → `git status` (verify) → `git commit` → `git push` as separate steps.
- **Git command batches skip the verify step.** When the four steps get pasted as a single shell line, the `git status` output flies past unread and unstaged files (e.g., `package.json` after fresh installs, lockfile updates, CSS that pairs with new code) get left out of the commit. Emphasize separate-step entry. If a staged file list looks suspiciously short relative to the work just done, flag it before suggesting `git commit`.
- **Hidden files (leading `.`) deserve a callout** when pointing at `.env.local`, `.gitignore`, etc. `ls -la` shows them.
- **Editor commands aren't implicit.** Name nano's `Ctrl+O` (write out) / `Ctrl+X` (exit), or vim's `:wq`, when those editors come up.
- **pnpm workspace patterns are new.** When using `--filter @activity/foo` or `workspace:*`, a brief context sentence the first time.
- **pnpm strict-mode imports:** missing direct deps surface as Vite "Failed to resolve import" errors, even when the package exists transitively. The fix is always `pnpm add --filter @activity/app <package>`.
- **"Replace X" instructions are easy to misread** as "replace the whole file" or "add the new code without removing the old." When pointing at a partial replacement, name the delete-from / keep boundaries explicitly. Include "the rest of the file is unchanged" reassurance.
- **Babel TSX parser trips on nested generics in `forwardRef<A, B<C>>`.** Workaround: extract the inner type to a top-level alias.
- **New tooling concepts get one sentence of context the first time** — flat ESLint config, Tailwind v4 `@theme`, Zod discriminated unions, Tiptap's `useImperativeHandle` bridge for ProseMirror callbacks, React Router v7 declarative mode, ProseMirror NodeViews, the marks-on-text-runs model, floating-ui, focus-trap-react, `:focus-visible`, esbuild bundler options, etc.
- **Don't conflate URLs with API keys** when describing dashboard navigation.
- **Don't overstate accessibility behavior without thinking through the rendered state.** When claiming an a11y property, walk through the actual rendered DOM and keyboard flow before saying it works.
- **Schema versioning convention.** `SubmissionResponses` always names the current schema; `SubmissionResponsesV1` is the legacy preserved for migration. There is no `SubmissionResponsesV2` symbol — when the next version lands, `SubmissionResponses` becomes v3 and a `SubmissionResponsesV2` will be introduced as the new legacy name. "Rename when demoting, not when promoting."
- **Vitest does not enforce TS strict mode.** It uses esbuild/swc under the hood, which transpiles but doesn't type-check. Latent type errors can accumulate, passing `vitest run` while failing `tsc --noEmit`. Run `pnpm --filter <pkg> build` periodically to surface them.
- **esbuild does not enforce TS strict mode either.** The `tsc --noEmit -p src/runtime/tsconfig.json` invocation in the renderer's `build` script is what actually checks the runtime; if that invocation goes missing, runtime type errors accumulate silently.
- **When sub-directory code has different lib needs than its package, give it its own tsconfig.** Discovered Stage 11: the runtime is DOM TypeScript inside a no-DOM package. Two tsconfigs + an exclude + two `tsc` invocations is the standard pattern.
- **For one-shot mock cleanups in Vitest, prefer inline `try/finally` over `beforeEach`/`afterEach` with a typed shared variable.** Discovered Stage 11.
- **Multi-file delivery — verify count of tail outputs.** When delivering N files in one message and asking for tail -3 verifications on each, if the pasted output shows fewer than N blocks-of-3-lines, the missing file is almost certainly empty on disk. Explicitly ask the user to confirm. Discovered Stage 12 step 6a: `config.ts` was empty after paste; 5 tail commands produced only 4 visible blocks.
- **File-path collisions in multi-file drops are a real risk.** Discovered Stage 13.5: `BlankEditPopover.tsx` and `BlankPopoverHost.tsx` both belong in `packages/app/src/editor/components/`. A paste mix-up overwrote one file's contents with the other's, producing a TypeScript error blaming the wrong file. State the destination path explicitly at the top of every file in a multi-file drop. Diagnostic: `head -5 <path>` to see the actual contents.
- **TypeScript `verbatimModuleSyntax` is strict about import styles.** Default imports from packages whose default export is treated as a "type-only thing" (e.g., focus-trap-react v10+ where `FocusTrap` is a named export) fail with TS1484. Switch to named imports (`import { FocusTrap } from ...`) when this happens.
- **Tiptap `InputRule` handler returns `void | null`, not `Transaction | null`.** ProseMirror's underlying InputRule API returns a Transaction; Tiptap wraps and expects use of `chain()` / `commands.X()` helpers. The handler can't return `state.tr.replaceWith(...)` directly. Discovered Stage 13.5 attempting to fix the disappearing-block bug.

### Stage 13 + 13.5 + 13.6 session-rhythm observations

- **Design pass → green light → code drop pattern works well.** Sessions of Stage 13 and 13.5 followed this. Brief design discussion surfacing real decisions, Zan responds with yes/no per item or counter, then code drop with verification steps. Don't skip the design pass even when the work looks straightforward — it surfaces decisions that would otherwise be silently assumed.

- **Numbered decision lists in design passes get crisp responses.** Zan responds like "1. yes / 2. yeah / 3. okay" — keep this format. When a single answer was less terse ("we can split it up"), it covered all items implicitly; that's fine.

- **Schema confirmation moment.** Worth doing this explicitly for any cross-package shape questions — the inference often matches but specifics (positive-int constraints, ISO datetime formats, optional fields) only visible in the actual Zod source.

- **"Best practice over shortcut" applies even when the shortcut is tempting.** Stage 13 had a decision between adding `confidenceRadios` to refs (principled, ~12 lines of test fixture churn) or querying DOM in `renderBlock` (pragmatic, microsecond perf cost). Zan picked the principled solution. Same pattern in Stage 13.5 — focus-trap-react chosen over hand-rolled focus management because future Phase 2+ modals will need it.

- **Multi-drop staging for high-risk changes.** Stage 13.5's popover work split into Drop 2a (schema attrs) → 2b (popover with answer field) → 2c (full per-blank fields). When Drop 1 (per-chip popover) failed catastrophically, this allowed clean revert and re-design without losing the schema work. Validated the pattern. Apply to any large UI surface change.

- **"Pilot error not popover error."** Mid-session diagnosis of editor blank screen turned out to be a wrong-URL typo (`/activity` vs `/activities`), not a code bug. When the symptoms don't make sense given the recent changes, ask "are you in the state you think you're in?" before diving into code.

- **Documentation lags code, deliberately or otherwise.** STATE.md and RUNTIME.md are updated AT END of stages, not at the end of each session. The "vital context for future Claude" framing matters here — these docs are the bridge between chat sessions.

- **Closeout pattern: write a bug report for any deferred bug in a format that can seed a new chat.** Done at end of Stage 13.5 for the disappearing-block bug. Lets the deferred issue actually get picked up rather than rotting in a TODO.

- **When debugging a ProseMirror/Tiptap symptom, jump on the strongest signal first.** Disappearing-block-fix session: the strongest data point was "`defining: true` fixed it but broke drag-reorder." That uniquely fingerprints PM's content-fit algorithm and the defining-flag family. Detoured ~20 minutes on an off-by-one position-arithmetic hypothesis that didn't fit the symptom pattern. Lesson: when you have a "this specific change fixed the symptom but had other consequences" data point in hand, follow it before generating new hypotheses.

- **Code in fix instructions can collide on the same line when pasted.** Disappearing-block session, final hiccup: a multi-line comment ending in `// it just emptied.` had `chain()` paste onto the same line, commenting it out and causing an esbuild error. Worth ensuring code lines have explicit blank-line buffers around them in delivered snippets.

- **Long-form copy-paste of JSX is genuinely hazardous.** Stage 13.6 session had two separate compile errors from incomplete pastes of the same file (PublishControl.tsx) — first paste was missing nothing visible but produced cryptic JSX errors at position N; second paste from a "more robust" version had the same error at N+2 (line shifted by the const declarations I added). Eventually traced to a missing `<a` opening tag in the user's saved file. Lesson: **for any file delivery over ~30 lines of JSX, write to /mnt/user-data/outputs and use present_files for the user to download, rather than putting code in chat for paste.** The download path eliminates the entire class of paste-mangling failures.

- **Verify Supabase product capabilities against current docs before committing to an architecture.** Stage 13.6 session lost meaningful time to two separate "this works according to my prior" assumptions that the docs contradict: (1) Supabase Storage public buckets can serve HTML — false, they rewrite to `text/plain` as anti-abuse; (2) Supabase Edge Functions can return HTML responses — false, same rewrite at the gateway layer. Both restrictions are documented in plain language at https://supabase.com/docs/guides/functions/limits and https://supabase.com/docs/guides/storage/quickstart. **Web-search the docs (specifically search for "supabase {feature} {restriction}" phrasings) before settling on any Supabase-backed architecture choice involving content-serving.**

- **When code structure looks wrong, ask for the file as-saved before guessing.** Same Stage 13.6 session: a JSX compile error reported at line 139. The code I'd written had matching tags. Three rounds of "more robust" rewrites later, the actual fix was a single missing `<a` tag in the saved file — the paste had eaten it. If I'd asked for the saved file two rounds earlier, we'd have saved 30 min. **For any compile error in code I wrote that doesn't match my mental model of the code, ask for `head -<N> <path>` output or full file upload before re-writing.**

- **The publish flow uncovered an architectural blocker not in any design doc.** ROADMAP.md anticipated Cloudflare R2 in Phase 2/3 as a cost optimization. The actual driver is that Supabase fundamentally cannot host HTML on free tier. The migration is a Phase 1 prerequisite, not a future optimization. Worth re-checking ROADMAP cross-cutting concerns at the start of each stage for assumptions like this that might have aged out — what was "Phase 2 optimization" can become "Phase 1 blocker" when product details emerge.

---

**Last updated:** **Stage 16 — Submissions dashboard — COMPLETE and live-verified.** Per-activity dashboard at `/activity/:id/submissions`: Summary/All-attempts toggle, per-student grouping (latest headline + best secondary + count), expandable drill-down mapping blank responses → problem prompt/answer key + per-section checkpointResults; pure helper `submissions.ts` unit-tested (13 tests). Two deviations from the original plan (Nearest next steps #6): latest-not-best headline; `activityType` filter dropped. **Live pass done this session — 3 fixes:** (a) persistent `View published page · Copy link` in the editor header (new client env `VITE_PUBLISHED_URL_BASE`, mirrors the write-only `R2_PUBLIC_URL_BASE` secret) since the URL was previously only visible in the post-publish session; (b) `FillInBlankView` `⚙ Settings` footer now shows on every problem while editing (was gated on Tiptap `selected`, which never fires for an in-text cursor, so the worked-solution/confidence panel was undiscoverable); (c) `ingest-submission` redeployed `--no-verify-jwt` (`verify_jwt: false`) so anonymous student POSTs stop 401'ing at the gateway (`UNAUTHORIZED_NO_AUTH_HEADER`) — no `config.toml` exists, so re-set this flag on any future redeploy. Also seeded 3 `[TEST]` activities + 11 submissions into the live DB (validated through the real schema; re-runnable `scripts/seed-test-data.sql`). App 63 tests + build green. **Post-Stage-16 hardening pass (`/code-review`):** ~10 findings fixed — mostly internal correctness in `Submissions.tsx`/`submissions.ts` (synchronous loadState reset, NaN-safe/deterministic sorts, numeric-string score coercion, float-safe `formatScore`, hardened fixtures); the one context change is answer-key version-skew — submissions now pin `activity_version_id` so the drill-down indexes the version the student actually answered (correct after a republish). New **migration 0007 is written but NOT yet applied** (author applies; `ingest-submission` needs no redeploy — signature unchanged). App 63 tests + tsc green. Active next goal: **apply migration 0007, then Phase 1 polish** (markdown paste import, print feature). Prior: **Stage 15 — Editor UI for remaining feature fields — complete**, plus the **`answerFeedback` follow-on**. Stage 15: activity-settings disclosure with `submissionMode`/`revisionMode`/`activityType` pickers (revisionMode disabled in single mode; gradingMode omitted); locked-mode non-checkpoint warning (warn, not block); FillInBlank block-level `solution` + `hasConfidenceRating` authored via an inline NodeView footer disclosure; serialize round-trips all three new block fields (skills carried through, editing UI deferred to Phase 2). Editor + serialize only there. Follow-on `answerFeedback` (`immediate` | `on_check`, default `on_check`) makes the green/red blank validation opt-in — a separate orthogonal `ActivityMeta` field; threaded through schema → renderer config blob → runtime (`wireBlanks` gates blur scoring; `parseConfig` coerces missing→`immediate` for pre-field pages) → a 4th editor picker. This **did** change renderer/runtime, so the **bundle was regenerated and `publish-activity` was redeployed** (live). Schema 30 / renderer 207 / app 50 tests + all builds green; RUNTIME.md §7 updated. Live-UI pass ✅ done — author verified the editor settings + `answerFeedback` picker on a real authed activity; published-activity bugs found so far are addressed. Active next goal: **Stage 16 — Submissions dashboard** (Nearest next steps #6).
