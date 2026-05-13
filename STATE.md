# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it short; if it grows past two screens, prune.

## Current focus

**Phase 1 — Stage 9c (Tiptap `section_break` block + isCheckpoint UI).** Stages 1–8 complete (playground week through serialize layer). Stages 9a (schema additions) and 9b (DB migration 0005 + `ingest-submission` v2-only enforcement) complete. Now landing the editor-side piece that lets teachers create section breaks and mark sections as checkpoints. Editor-to-Supabase wiring (Stage 10) is the next gate after that. Runtime architecture decisions captured in `packages/renderer/RUNTIME.md`.

## Status by area

| Area | Status |
|---|---|
| Database schema (migrations 0001–0004) | ✅ Applied to Supabase, RLS verified |
| Permission helper functions | ✅ In place; future collaboration extends helpers |
| `@activity/schema` package | ✅ Tested, on GitHub |
| `@activity/renderer` package | ✅ 17/17 tests passing; runtime refactored to strategy dispatch |
| Renderer bundle for Edge Functions | ✅ Working — deployed bundle one commit behind source. Redeploy before next real publish. |
| `publish-activity` Edge Function | ✅ Deployed |
| `ingest-submission` Edge Function | ✅ Deployed; enforces `schemaVersion: 2` on incoming responses (rejects v1 with 400); returns `attempt_number` alongside `submission_id`. |
| Edge Function secrets | ✅ Set |
| React app (`@activity/app`) | ✅ Scaffolded — Vite + React 19 + TS + Tailwind v4 |
| Auth flow stub | ✅ Google OAuth via Supabase; allowlist gate verified |
| React Router v7 | ✅ `/` (Home) + `/playground` (dev-only via `import.meta.env.DEV`) |
| Tiptap editor base + StarterKit | ✅ |
| Editor toolbar (B/I/code/H1-H3/lists/quote/math) | ✅ |
| Custom math NodeViews (inline + block) | ✅ KaTeX render with lifecycle discipline |
| Slash menu (`/` trigger + tippy popover) | ✅ Filter, arrow-key nav with scroll-into-view, click-to-select |
| Drag handle (mouse) | ✅ Notion-style, hover-revealed, left-gutter |
| Block reorder (keyboard) | ✅ `Mod+Shift+ArrowUp/Down`, top-level blocks |
| JSON inspector panel | ✅ Sticky right-side panel in `/playground`, copy + node count |
| MathLive integration in math NodeView | ✅ `<math-field>` web component wired; font-size set to 1.21em to match KaTeX scale |
| Serialize layer (Tiptap JSON ↔ ActivityDocument) | ✅ `serialize.ts` with `tiptapToActivity` / `activityToTiptap`; 18 round-trip tests passing |
| Checkpoint + feedback architecture | ✅ Designed; see RUNTIME.md + architecture decisions below |
| Schema additions for checkpoints/feedback (Stage 9a) | ✅ Complete; 30 tests passing |
| DB migration 0005 (attempt_number) (Stage 9b) | ✅ Applied; `ingest_submission` now returns `jsonb {submission_id, attempt_number}` with retry-on-unique-violation. |
| Tiptap section_break + isCheckpoint UI (Stage 9c) | ⏳ After 9a, parallelizable with 9b |
| Editor wired to Supabase + basic dashboard (Stage 10) | ⏳ After 9b/9c |
| Runtime file split + build pipeline (Stage 11) | ⏳ Not started |
| Runtime: checkpoint scoring + feedback rendering (Stages 12–13) | ⏳ Not started |
| Runtime: submission flow + revision + ingest-submission update (Stage 14) | ⏳ Not started |
| Editor UI for new feature fields (Stage 15) | ⏳ Not started |
| Dashboard with all-attempts toggle / submissions viewer (Stage 16) | ⏳ Not started |
| Markdown paste import | ⏳ Phase 1 polish |
| End-to-end manual test | ⏳ Blocked on stages 10+ |

## Repo layout

```
activity-platform/
├── packages/
│   ├── schema/        — Zod types, document model, factories
│   ├── renderer/      — Pure JSON → HTML string. KaTeX inlined. No DOM.
│   │   └── RUNTIME.md — Architecture decisions for the published-page runtime
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/
│           │   ├── Editor.tsx, Toolbar.tsx, editor.css
│           │   ├── SlashMenuPopover.tsx, slashMenuItems.ts
│           │   ├── JsonInspector.tsx
│           │   ├── extensions/   — MathInline, MathBlock, SlashMenu, BlockReorderShortcuts
│           │   └── nodeViews/    — MathInlineView, MathBlockView
│           ├── routes/           — Home.tsx, Playground.tsx (dev-only)
│           ├── lib/              — supabase.ts, serialize.ts
│           └── App.tsx, main.tsx, index.css
├── supabase/
│   ├── migrations/    — 0001 schema, 0002 RLS+helpers, 0003 RPCs+triggers, 0004 seed
│   └── functions/
│       ├── _shared/   — cors.ts (hand-edited), renderer.bundle.js (auto-generated)
│       ├── publish-activity/
│       └── ingest-submission/
├── scripts/
│   └── bundle-renderer.mjs
└── ...root configs
```

After Stage 11: `packages/renderer/src/runtime/` will be added, and `bundle-renderer.mjs` will emit `runtime.js` + `runtime.js.map` alongside the existing renderer bundle.

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Storage bucket:** `activities` (public)
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Allowlist-only signup (Phase 1).
- **`packageManager` pin in package.json:** REMOVED (was `[email protected]`; pin caused friction)

## Architecture decisions made (and the reasoning, in case I forget)

- **Vertical-stack-of-typed-blocks editor** (Notion-style), not grid canvas.
- **Tiptap on ProseMirror, with React bindings**, KaTeX for math. Vue 3 was the close runner-up.
- **Tailwind v4 via the `@tailwindcss/vite` plugin**. Single `@import "tailwindcss"` in `src/index.css`. No PostCSS, no `tailwind.config.js`. Theme customization in CSS via `@theme`.
- **React Router v7** for SPA routing — over TanStack Router (steeper curve) and Wouter (too minimal). Phase 1 needs `/activity/:id` soon enough to justify it now.
- **`/playground` is dev-only** — route registered conditionally on `import.meta.env.DEV`, which Vite resolves at build time. Production bundle physically excludes the route; no runtime bypass code ships.
- **Editor lives as shared module at `src/editor/`**, used by `/playground` now and `/activity/:id` later.
- **Static HTML on publish** (option C), uploaded to Supabase Storage, NOT server-rendered.
- **Two URLs per published activity:** live alias (`/index.html`, 5min cache) and immutable versioned permalink (`/v{N}/index.html`, 1yr cache).
- **Drafts in a separate column** (`activities.draft_content`); versions append-only.
- **Permission helpers as SQL functions** so Phase 3+ collaboration changes one function, not eight policies.
- **Submission identity always present** — Pattern B: name field on the page, gate submit until non-empty. CHECK constraint enforces at storage layer.
- **Responses jsonb keyed by stable `blank.id`**, not array index.
- **`schemaVersion: 1`** on `ActivityDocument` stays at 1 — Stage 9a additions are all optional-with-defaults, so existing stored documents parse cleanly without modification. `SubmissionResponses.schemaVersion` bumped to 2 in 9a, adding only the optional `checkpointResults` map and per-blank `confidence`; migrate-on-read handles v1 submissions in storage. **`attempt_number` does NOT live in the responses jsonb** — it's a column on the `submissions` table, derived server-side by the `ingest_submission` RPC (`max + 1` over the student's identity scope, with `unique_violation` retry against the two partial unique indexes added in 0005). The Edge Function returns the canonical value in its HTTP response so the runtime can reconcile its optimistic guess. The runtime's local `attempt_number` is advisory. Schema package convention: `SubmissionResponses` always names the current version; `SubmissionResponsesV1` is the legacy preserved for migration.
- **Runtime answer scoring is strategy-dispatched** — `evaluateAnswer(input, typed)` reads `data-blank-strategy`, defaulting to `'list'`.
- **Parameterized problems are a planned Phase 2.5 feature.** Don't add to Phase 1.
- **Math nodes are atoms** with `attrs.latex` as the source of truth. Serialize as `<span data-math-inline data-latex="...">` / `<div data-math-block data-latex="...">`. No editable text content inside.
- **NodeView lifecycle pattern (the 5 commitments):**
  1. `useLayoutEffect`, not `useEffect`, for KaTeX render — synchronous before paint, no flash.
  2. Stable ref as render target — KaTeX manages contents; React manages identity.
  3. Tight dependency arrays (`[latex]`) — only re-render when content actually changes.
  4. `throwOnError: false` — invalid LaTeX renders inline as red error, doesn't crash the editor.
  5. `NodeViewWrapper as="span"` for inline / `as="div"` for block — wrong tag breaks line layout.
  This is the canonical reference for every future custom block (problem, fill-in-blank, image, callout).
- **React state vs ProseMirror state in NodeViews:** UI concerns (is this NodeView in editing mode?) → React `useState`. Document concerns (selection, content, marks) → ProseMirror (`updateAttributes`, `editor.isActive`). Mixing them up was the cause of the "input deselects after one keystroke" bug; rule of thumb: if the answer should outlast a re-render of this NodeView because it's a property of the document, it's ProseMirror state, otherwise React state.
- **Math editor input — MathLive / `<math-field>`** is the implementation in math NodeViews. WYSIWYG math editing in the editor. `font-size: 1.21em` on math-field classes to match KaTeX's render scale.
- **MathLive in published HTML is a Phase 2.5 decision, not committed.** Editor-only commitment now. Bundle-size hit only matters for student-facing pages, not the editor.
- **Toolbar UX: static (always-visible) over BubbleMenu/FloatingMenu** — discoverability beats elegance for non-technical teachers.
- **Slash menu architecture:** `@tiptap/suggestion` for trigger plumbing + `tippy.js` for popover positioning + Tiptap's `ReactRenderer` to bridge ProseMirror callbacks to a React component (the `useImperativeHandle` pattern). Menu items live in `slashMenuItems.ts` as a flat array — single source of truth; adding a block type to the menu is one entry.
- **Drag handle: Notion-style, mouse-only** via `@tiptap/extension-drag-handle-react`. Hover-revealed in the left gutter; the extension manages its own visibility (hidden when no block is hovered). That hidden-by-default behavior means the handle isn't Tab-reachable, and that's correct: drag handles are fundamentally mouse affordances. The keyboard equivalent isn't a focusable handle, it's a shortcut that acts on the cursor's block.
- **Keyboard reorder via `Mod+Shift+ArrowUp/Down`** — custom `BlockReorderShortcuts` extension. Operates on whichever top-level block contains the cursor. Matches Tiptap's official move-node-button convention. Within the editor this overrides macOS's "extend selection to start of doc" — `Mod+Shift+Home` remains for users who need that. Nested reordering (inside lists, blockquotes) is a future enhancement.
- **`Editor` exposes `onUpdate(json)` callback prop** as the single hook for "react to doc changes." Multi-purpose: `/playground` uses it for the JSON inspector; `/activity/:id` will use it for Supabase autosave; future word counter, validation badge, etc. all subscribe through the same prop. Both `onCreate` and `onUpdate` from Tiptap forward through it, so the consumer sees Tiptap's normalized view from first render. `Editor` itself never knows about consumers — keeps it reusable across routes.
- **JSON inspector lives in `Playground.tsx`, not `Editor.tsx`.** Standard "lift state up" — Playground holds the JSON state and renders both editor and inspector as siblings. Editor stays clean of debug-only UI. The inspector is dev-only and physically excluded from production builds along with the rest of `/playground`.
- **Serialize layer pattern:** `serialize.ts` lives in `@activity/app/src/lib/`, depends on both `@activity/schema` types and Tiptap's JSON shape, exports `tiptapToActivity(json)` and `activityToTiptap(doc)`. Single auto-generated section in Phase 1 (Option A); explicit section breaks become real schema in Stage 9. The renderer never touches this file — it operates on `ActivityDocument` only.
- **Three submission modes:** `single` (one submit, no checkpoints), `locked` (checkpoints, inputs freeze after check), `free` (checkpoints, revision always allowed). Activity-level field on `ActivityMeta`, default `free`. Per-section checkpoints (not arbitrary placement) — checkpoint behavior is tied to section boundaries, which are already a defined organizational unit.
- **Two revision modes:** `free` (revise any checked section, resubmit after final submit) and `locked` (no revision/resubmit). Activity-level on `ActivityMeta`, default `free`. Separate from submissionMode — `single` mode ignores revisionMode.
- **Attempt tracking:** each resubmit is a new `submissions` row with incremented `attempt_number`. Server derives the number (`max(attempt_number) + 1` for the student's identity); client's value is advisory only. Teacher dashboard has toggle: all attempts vs best score + count.
- **Feedback layers per blank:** `hint` (static, shown for any wrong answer) + `mistakeFeedback` (array of `{match, feedback}`, shown for specific anticipated wrong answers, overrides hint) + `solution` (worked explanation shown post-check to all students regardless of correctness). Exact string match for Phase 1; strategy-dispatch hook already in place for smarter matching later.
- **Confidence rating opt-in per blank.** `hasConfidenceRating: boolean` field on FillInBlank, default false. When true, students see a 3-point confidence selector (unsure / think_so / certain) before checking. Stored per-blank in the submission responses. Captures metacognitive calibration data without cluttering activities that don't use it. Activity-level toggle was considered and rejected — opt-in per blank matches "no UI clutter unless deliberate."
- **`activityType` on ActivityMeta** — `worksheet | exit_ticket | warm_up | review`, default `worksheet`. Drives published HTML structure (exit ticket gets focused single-page layout, etc.) and dashboard filtering.
- **Standards tagging at two levels.** `standards: string[]` on ActivityMeta (activity-level tags) AND on Problem and FillInBlank blocks (problem-level tags). Field is in the schema from day one; editor UI for problem-level tagging is deferred to Phase 2. The field existing now is what enables future per-standard analytics to reach back to Phase 1 activities.
- **Runtime JS is a separate file** (`packages/renderer/src/runtime/index.ts`), built by `bundle-renderer.mjs` as `runtime.js` + `runtime.js.map`. Uploaded as `v{N}/runtime.js` with each publish. HTML references it as `<script type="module" src="./runtime.js">`. `data-runtime-version="1"` on the activity root from day one — migration anchor for Phase 3+ CDN-hosted shared runtime. See `packages/renderer/RUNTIME.md` for the full runtime architecture.
- **Runtime state pattern:** plain JS object as single source of truth. All user actions mutate state then call `render()`. `render()` is the only DOM mutator. Every DOM write guarded by a change check (only write if value differs). Idempotent, prevents layout thrashing.
- **Data-attribute contract is a public API.** Renderer emits; runtime reads. Frozen for already-published activities; additive changes only. Every attribute read uses `?? default` fallback. Init and event handlers wrapped in try/catch — graceful degradation to basic submit if init fails. Full contract documented in `RUNTIME.md`.
- **Runtime scoring is pure / DOM reads happen once.** Init pass builds in-memory `blanks` and `sections` maps from the DOM. Scoring functions operate on those maps. No DOM queries inside scoring or feedback logic.
- **Source maps emitted for runtime.** Always-on, external. Modern browsers only fetch them when DevTools is open; zero performance cost for students; without them, teacher-reported bugs in minified code aren't debuggable.
- **Runtime does NOT import from `@activity/schema`.** Parallel minimal TypeScript interfaces mirror the data-attribute contract. Deliberate duplication — keeping the runtime under the 20KB performance budget rules out bundling Zod.
- **Pedagogical block types planned for Phase 2** (cheap to add then per the existing "adding block types is cheap" architecture): worked example block, faded worked example / completion problem, learning objectives + success criteria (combined block), self-explanation/reflection block.
- **Skill tagging, not standards.** `skills: string[]` on ActivityMeta, FillInBlankBlock, and ProblemBlock, NOT `standards`. Action-oriented and framework-neutral — "simplifying rational expressions" rather than "TEKS A.10A" — so the system stays portable across Texas/CCSS/UK National Curriculum/etc. The field doesn't validate against any framework; teachers who want to use TEKS or CCSS codes can put them in the array. Phase 5 marketplace will add controlled vocabulary on top; an optional separate `standards` field for compliance reporting is additive whenever it's needed.
- **Test directory convention:** `packages/<pkg>/tests/` for public-API tests (import from `'../src/index.js'`); `packages/<pkg>/src/__tests__/` for unit-level tests of new features (import from internal paths). Both directories are picked up by Vitest's default discovery.
- **Barrel export discipline:** `packages/schema/src/index.ts` uses explicit named re-exports, not wildcards. New types added to a source file must be added to the barrel too. This caught the missing `SubmissionResponsesV1` / `migrateSubmissionResponses` exports during Stage 9a testing — the friction is working as designed.

## Standing constraints

- The renderer package must stay pure: no DOM access, no `process.env`, no I/O. JSON-in-string-out only.
- Schema package is the bottom of the dependency graph: imports nothing from app or renderer.
- Serialize layer is the only place that knows about both Tiptap's JSON format and `ActivityDocument`. NodeViews don't reach into Zod; renderer doesn't know Tiptap exists.
- Adding a new block type touches: schema file, factory, renderer file, styles, `slashMenuItems.ts` (to surface in the slash menu), and a Tiptap extension + NodeView. Pattern in `MathInline.ts` / `MathInlineView.tsx` is the canonical reference for the editor side; `problem.ts` / `fill-in-blank.ts` for the schema side.
- The Supabase `service_role` key never leaves the server. Frontend uses publishable (anon) key only; RLS does access control.
- Math NodeView lifecycle pattern (5 commitments above) applies to every NodeView, not just math.
- **All `@tiptap/*` packages stay on the same version.** They share internal state via `@tiptap/pm` (a shared ProseMirror bundle); mixing versions causes subtle bugs that look like editor weirdness but are actually version skew. When adding a Tiptap extension, install the version matching the rest of the family or update everything together.
- **Drag handle button has `tabIndex={-1}`** to make its mouse-only nature explicit. Keyboard reorder is the keyboard a11y story, not Tab traversal of the handle.
- **The data-attribute contract is frozen for published activities.** Additive changes only. Renaming or removing an attribute breaks every activity published before the change, forever, because the HTML is static in Storage.
- **Runtime performance budget:** ≤ 20KB minified target, ≤ 40KB hard ceiling. School Chromebooks on slow Wi-Fi. Inline small helpers rather than depending on a utility library.
- **Solutions are revealed only after a student checks the section.** The runtime reads `data-solution` on init but does NOT inject it into the DOM until after check. Phase 1 anti-cheat is "don't make it worse than it has to be"; Phase 5 server-side grading is the real fix.
- **Server derives `attempt_number`.** Edge Function reads `max(attempt_number) + 1` for the student's identity; never trusts the client's value.
- **Per-blank confidence ratings are opt-in.** Default off. Teacher enables per-blank via `hasConfidenceRating: true`.
- **Accessibility commitments for the runtime:** focus moves to first incorrect feedback after check (or to score summary if all correct); ✓/✗ uses icon + color, never color alone; `prefers-reduced-motion` respected on any feedback transitions; KaTeX MathML output kept on for screen readers; touch targets ≥ 44×44px on interactive elements.
- **Print CSS is part of the renderer's output from Stage 11.** `@media print` styles hide all interactive elements (checkpoint buttons, feedback slots, confidence ratings, submit button) and format the content for paper. Retrofit is expensive; build it in now.

## Open questions / deferred decisions

- **Phase 2.5 published-HTML math input strategy:** MathLive lazy-loaded? Custom toolbar? Smarter plain-text answer normalization? Decide when 2.5 actually ships.
- **Floating UI vs Tippy long-term:** Tippy works now; Floating UI is the modern direction. (Drag handle already uses floating-ui internally via the Tiptap component — eventual unification is plausible.) No urgency to switch the slash menu.
- **Editor styling beyond minimum:** Tailwind Typography plugin vs custom CSS. Current `editor.css` rules are enough for now.
- **Mobile/touch slash menu:** `/` trigger isn't natural on touch keyboards. Phase 2+ concern.
- **Hosting for the React app:** Cloudflare Pages vs Vercel. Deferred until app is ready to deploy.
- **Multi-column block layouts:** dropped from Phase 1 (cheap fixed two-column container is the eventual answer if needed).
- **Section color tinting:** dropped from Phase 1 (cosmetic).
- **Image upload (vs current image-by-URL only):** Phase 2.
- **Multi-tenancy / district-scoped activities:** Phase 4+. Helpers are designed for it.
- **Governance model when a teacher leaves a district:** pick before designing org features. Not urgent.
- **CDN-hosted shared runtime (Phase 3+):** when to move from versioned-per-publish to CDN-hosted. `data-runtime-version` attribute already in place to support the migration. Trigger: when republishing activities for a runtime bug fix becomes painful (~50+ active activities).
- **Print CSS scope:** which interactive elements need print-time replacement (e.g., do fill-in-blank inputs become underline placeholders for handwritten answers?) vs. simple hiding. Decide during Stage 11 implementation.
- **Phase 2 block type priority order:** worked example, faded worked example, learning objectives + success criteria, self-explanation. Decide order when Phase 2 starts based on which gap is most painful.
- **UX validation with other teachers:** at least 2–3 informal reviews of checkpoint UI patterns (button placement, feedback animation, confidence rating UI) before locking them in. Cost is near-zero now (no UI exists yet); cost rises sharply once built.

## Nearest next steps

1. **Stage 9a — schema package additions.** ActivityMeta gets submissionMode/revisionMode/activityType/standards. Section gets isCheckpoint. FillInBlank gets hint/mistakeFeedback/solution/hasConfidenceRating/standards. Problem gets solution/standards. SubmissionResponses bumps to v2 with attemptNumber and checkpointResults plus migrate-on-read. Tests for each new field. ~1 session.
2. **Stage 9b — DB migration 0005 + `ingest-submission` update.** Add `attempt_number` column + indexes. Update Edge Function to accept `attempt_number` and `checkpoint_results` and derive `attempt_number` server-side from `max + 1`. ~1 session.
3. **Stage 9c — Tiptap section_break block + isCheckpoint UI.** New block type, slash menu entry, isCheckpoint toggle in section UI. Schema work from 9a is the prerequisite. ~1 session.
4. **Stage 10 — Editor wired to Supabase + basic dashboard.** Activity list, create activity, open editor, autosave drafts via the serialize layer (debounced ~1s, optimistic UI, "Saving…/Saved" indicator). Subscribe via `Editor.onUpdate`. This is the foundational editor-to-backend wiring that everything subsequent depends on for end-to-end testing. ~1–2 sessions.
5. **Stage 11 — Runtime file split + build pipeline.** Extract inline `<script>` from renderer into `runtime/index.ts`; add esbuild step to `bundle-renderer.mjs` for runtime.js + source map; update `publish-activity` to upload both. Per RUNTIME.md architecture. Include print CSS in renderer output. ~1 session.
6. **Stages 12–13 — Runtime logic.** Init pass + maps + checkpoint scoring + feedback rendering + revision mode enforcement. Tests in JSDOM. ~2 sessions.
7. **Stage 14 — Runtime: submission flow.** Final submit, attempt tracking via server-derived attempt_number, localStorage retry on network failure, resubmit flow for revisionMode === 'free'. ~1 session.
8. **Stage 15 — Editor UI for new feature fields.** Checkpoint toggle (per section), submissionMode/revisionMode/activityType pickers (activity-level), hint + mistake-feedback + solution + hasConfidenceRating + standards fields on fill-in-blank, solution + standards on problem. ~1–2 sessions.
9. **Stage 16 — Submissions dashboard with all-attempts toggle.** Teacher views activity submissions: all attempts (every row) vs best-score-plus-count view (one row per student). Filter by activityType where useful. ~1–2 sessions.
10. **Housekeeping (parallel):** UX validation with 2–3 other teachers, CI workflow setup (GitHub Actions: `pnpm test` + `pnpm lint` on push), redeploy renderer bundle after Stage 11.
11. **End-to-end manual test** — publish from editor, view as student, work through checkpoints (single / locked / free), submit, revise, view in teacher dashboard. Closes the Phase 1 loop.

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed. (The Stage 9a additions are deliberate and pedagogically grounded; resist the urge to add "while we're here" extras.)
- Don't put auth or DB code in the renderer. Package boundary is the discipline.
- Don't write RLS policies that inline ownership checks — call the helpers.
- Don't conflate ProseMirror selection state (`selected`) with React UI state (`editing`) in NodeViews. They're separate concerns; mixing them up causes the "input deselects after one keystroke" class of bug.
- Don't add MathLive to published HTML in Phase 1. That's a Phase 2.5 decision.
- Don't regress flowing-water UX as features land — performance budget, optimistic autosave, visible state indicators, predictable shortcuts. The user is more friction-tolerant than average users will be; flag friction risks even if they shrug.
- Don't mix `@tiptap/*` package versions. Update the family together.
- Don't make breaking changes to the runtime data-attribute contract. Add new attributes; never rename or remove existing ones.
- Don't import `@activity/schema` from the runtime. Parallel types are deliberate; 20KB budget rules out Zod.
- Don't query the DOM inside runtime scoring or state functions. Read once on init; mutate state; let render() handle DOM updates.
- Don't trust the client's `attempt_number`. Server derives it from `max + 1`.
- Don't reveal solutions before a section is checked. The HTML carries the data; the runtime decides when to render it.
- Don't add JS dependencies to the runtime. Single-file vanilla TypeScript by design.

## Working with the author (notes for the next AI session)

Solo dev: Dallas ISD Algebra II teacher, working-level JS/Python, learning the systems-engineering side of the stack as the project progresses. Engages with the *why* behind a choice; lean toward giving rationale alongside the action. Skip ceremony — no "great question," no "happy to help" wrappers. Best-practice-over-shortcut is the default preference, "ask before assuming" is an explicit standing instruction, and UX-as-priority is also explicit.

Specific friction patterns where unstated assumptions have caused loops:

- **Git workflow isn't automatic.** Lay out `git add <paths>` → `git status` (verify) → `git commit` → `git push` as separate steps.
- **Git command batches skip the verify step.** When the four steps above get pasted as a single shell line, the `git status` output flies past unread and unstaged files (e.g., `package.json` after fresh installs, lockfile updates, CSS that pairs with new code) get left out of the commit. The verify step is *the moment* to catch that. Emphasize separate-step entry, AND if a staged file list looks suspiciously short relative to the work just done, flag it before suggesting `git commit`.
- **Hidden files (leading `.`) deserve a callout** when pointing at `.env.local`, `.gitignore`, etc. `ls -la` shows them.
- **Editor commands aren't implicit.** Name nano's `Ctrl+O` (write out) / `Ctrl+X` (exit), or vim's `:wq`, when those editors come up.
- **pnpm workspace patterns are new.** When using `--filter @activity/foo` or `workspace:*`, a brief context sentence the first time.
- **pnpm strict-mode imports:** missing direct deps surface as Vite "Failed to resolve import" errors, even when the package exists transitively. The fix is always `pnpm add --filter @activity/app <package>`. Recognize the pattern when the user pastes that error.
- **"Replace X" instructions are easy to misread as "replace the whole file"** — or as "add the new code without removing the old." When pointing at a partial replacement (especially restructurings like "consolidate two returns into one"), name the delete-from / keep boundaries explicitly. Include "the rest of the file is unchanged" reassurance.
- **Babel TSX parser trips on nested generics in `forwardRef<A, B<C>>`.** Workaround: extract the inner type to a top-level alias.
- **New tooling concepts get one sentence of context the first time** — flat ESLint config, Tailwind v4 `@theme`, Zod discriminated unions, Tiptap's `useImperativeHandle` bridge for ProseMirror callbacks, React Router v7 declarative mode, ProseMirror NodeViews, the marks-on-text-runs model, floating-ui (used inside the drag handle), `:focus-visible`, esbuild bundler options, etc.
- **Don't conflate URLs with API keys** when describing dashboard navigation.
- **Don't overstate accessibility behavior without thinking through the rendered state.** Stage 5a, "the handle button is reachable by Tab" turned out to be false because the parent extension hides the element when no block is hovered. The actual fix was a keyboard shortcut acting on the cursor's block, not making a hidden element focusable. General lesson: when claiming an a11y property, walk through the actual rendered DOM and keyboard flow before saying it works.
- **Schema versioning convention. SubmissionResponses always names the current schema; SubmissionResponsesV1 is the legacy preserved for migration. There is no SubmissionResponsesV2 symbol — when the next version lands, SubmissionResponses becomes v3 and a SubmissionResponsesV2 will be introduced as the new legacy name. "Rename when demoting, not when promoting."



When something fails, the user pastes terminal output. Read the actual output before assuming what happened — "command ran successfully" vs "command exited without doing anything" can look similar at first glance. Likewise, when the user pastes a file's contents, scan for duplicated code, dead code after a `return`, or missing exports before assuming the bug is elsewhere.

---

**Last updated:** Stage 9b complete. Migration 0005 adds the `attempt_number` column on `submissions`, two partial unique indexes (link-share and assignment identity scopes), and replaces `ingest_submission` with a retry-on-unique-violation loop. RPC return type changed `uuid` → `jsonb {submission_id, attempt_number}`. Edge Function enforces `schemaVersion: 2` on incoming responses (rejects v1 with 400) and returns the canonical attempt number to the runtime. Renderer bundle now tracked in git so HEAD == what's deployed. Naming-convention friction caught and corrected mid-stage: `SubmissionResponses` IS the current (v2) schema, no `SubmissionResponsesV2` symbol exists; convention is "rename when demoting, not when promoting." Small phantom-identity bug also fixed: `display_name` is now trimmed before insert, not just for the identity check. Next: Stage 9c — Tiptap `section_break` block + `isCheckpoint` UI.
