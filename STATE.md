# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it short; if it grows past two screens, prune.

## Current focus

**Phase 1 — Tiptap playground, stages 5–6 remaining.** Editor base (StarterKit), toolbar, custom math nodes (inline + block with KaTeX), and slash menu are all working in `/playground` (dev-only route). Drag handle and a JSON inspector panel are the last playground items. After that: MathLive integration in the math NodeView, then leave playground and build the serialize layer + Supabase wiring.

## Status by area

| Area | Status |
|---|---|
| Database schema (migrations 0001–0004) | ✅ Applied to Supabase, RLS verified |
| Permission helper functions | ✅ In place; future collaboration extends helpers |
| `@activity/schema` package | ✅ Tested, on GitHub |
| `@activity/renderer` package | ✅ 17/17 tests passing; runtime refactored to strategy dispatch |
| Renderer bundle for Edge Functions | ✅ Working — deployed bundle one commit behind source. Redeploy before next real publish. |
| `publish-activity` Edge Function | ✅ Deployed |
| `ingest-submission` Edge Function | ✅ Deployed |
| Storage bucket `activities` | ✅ Public |
| Edge Function secrets | ✅ Set |
| React app (`@activity/app`) | ✅ Scaffolded — Vite + React 19 + TS + Tailwind v4 |
| Auth flow stub | ✅ Google OAuth via Supabase; allowlist gate verified |
| React Router v7 | ✅ `/` (Home) + `/playground` (dev-only via `import.meta.env.DEV`) |
| Tiptap editor base + StarterKit | ✅ |
| Editor toolbar (B/I/code/H1-H3/lists/quote/math) | ✅ |
| Custom math NodeViews (inline + block) | ✅ KaTeX render with lifecycle discipline |
| Slash menu (`/` trigger + tippy popover) | ✅ Filter, arrow-key nav with scroll-into-view, click-to-select |
| Drag handle | ⏳ Stage 5 |
| JSON inspector panel | ⏳ Stage 6 |
| MathLive integration in math NodeView | ⏳ After playground, before serialize layer |
| Serialize layer (Tiptap JSON ↔ ActivityDocument) | ⏳ After MathLive |
| Dashboard (activity list, create, open) | ⏳ Not started |
| Editor wired to Supabase (autosave drafts) | ⏳ Not started |
| Markdown paste import | ⏳ Phase 1 polish |
| End-to-end manual test | ⏳ Blocked on serialize + dashboard |

## Repo layout

```
activity-platform/
├── packages/
│   ├── schema/        — Zod types, document model, factories
│   ├── renderer/      — Pure JSON → HTML string. KaTeX inlined. No DOM.
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/
│           │   ├── Editor.tsx, Toolbar.tsx, editor.css
│           │   ├── SlashMenuPopover.tsx, slashMenuItems.ts
│           │   ├── extensions/   — MathInline, MathBlock, SlashMenu
│           │   └── nodeViews/    — MathInlineView, MathBlockView
│           ├── routes/           — Home.tsx, Playground.tsx (dev-only)
│           ├── lib/              — supabase.ts
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
- **`schemaVersion: 1`** on `ActivityDocument` and `SubmissionResponses` — bump and migrate on read when shapes change.
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
- **Math editor input — Path A (MathLive / `<math-field>`)** is the chosen long-term direction. Current implementation is a stub (`<textarea>` for block, `<input>` for inline) + KaTeX preview to keep playground learning focused on Tiptap. MathLive integration is its own task post-playground.
- **MathLive in published HTML is a Phase 2.5 decision, not committed.** Editor-only commitment now. Bundle-size hit only matters for student-facing pages, not the editor.
- **Toolbar UX: static (always-visible) over BubbleMenu/FloatingMenu** — discoverability beats elegance for non-technical teachers.
- **Slash menu architecture:** `@tiptap/suggestion` for trigger plumbing + `tippy.js` for popover positioning + Tiptap's `ReactRenderer` to bridge ProseMirror callbacks to a React component (the `useImperativeHandle` pattern). Menu items live in `slashMenuItems.ts` as a flat array — single source of truth; adding a block type to the menu is one entry.

## Standing constraints

- The renderer package must stay pure: no DOM access, no `process.env`, no I/O. JSON-in-string-out only.
- Schema package is the bottom of the dependency graph: imports nothing from app or renderer.
- Serialize layer (when it lands) is the only place that knows about both Tiptap's JSON format and `ActivityDocument`. NodeViews don't reach into Zod; renderer doesn't know Tiptap exists.
- Adding a new block type touches: schema file, factory, renderer file, styles, `slashMenuItems.ts` (to surface in the slash menu), and a Tiptap extension + NodeView. Pattern in `MathInline.ts` / `MathInlineView.tsx` is the canonical reference for the editor side; `problem.ts` / `fill-in-blank.ts` for the schema side.
- The Supabase `service_role` key never leaves the server. Frontend uses publishable (anon) key only; RLS does access control.
- Math NodeView lifecycle pattern (5 commitments above) applies to every NodeView, not just math.

## Open questions / deferred decisions

- **MathLive integration:** locked-in choice for editor's math NodeView; install + wiring deferred to its own task after playground week.
- **Phase 2.5 published-HTML math input strategy:** MathLive lazy-loaded? Custom toolbar? Smarter plain-text answer normalization? Decide when 2.5 actually ships.
- **Floating UI vs Tippy long-term:** Tippy works now; Floating UI is the modern direction. No urgency to switch.
- **Editor styling beyond minimum:** Tailwind Typography plugin vs custom CSS. Current `editor.css` rules are enough for now.
- **Mobile/touch slash menu:** `/` trigger isn't natural on touch keyboards. Phase 2+ concern.
- **Hosting for the React app:** Cloudflare Pages vs Vercel. Deferred until app is ready to deploy.
- **Multi-column block layouts:** dropped from Phase 1 (cheap fixed two-column container is the eventual answer if needed).
- **Section color tinting:** dropped from Phase 1 (cosmetic).
- **Image upload (vs current image-by-URL only):** Phase 2.
- **Multi-tenancy / district-scoped activities:** Phase 4+. Helpers are designed for it.
- **Governance model when a teacher leaves a district:** pick before designing org features. Not urgent.

## Nearest next steps

1. **Stage 5 — Drag handle.** Install `@tiptap/extension-drag-handle-react` (verify exact package name at install — Tiptap has reshuffled this one across releases).
2. **Stage 6 — JSON inspector panel.** Side panel showing live editor JSON for understanding what the serialize layer will translate. Doubles as a debugging aid.
3. **MathLive integration** in math NodeViews — replace `<textarea>` / `<input>` + KaTeX preview with `<math-field>` for WYSIWYG editing. Schema/data shape unchanged (still a LaTeX string in `attrs.latex`).
4. **Serialize layer** — `serialize.ts` in `@activity/app` translates Tiptap JSON ↔ `ActivityDocument`. Bridges editor and schema; renderer doesn't touch it.
5. **Wire editor to Supabase** — activity list, create activity, open editor, autosave drafts via the serialize layer (debounced ~1s, optimistic UI, "Saving…/Saved" indicator).
6. **Housekeeping (before #7):** run `pnpm bundle:renderer` and redeploy `publish-activity` so the deployed bundle picks up the strategy-dispatch refactor.
7. **End-to-end manual test** — publish from the editor, view as student, submit, view in teacher dashboard. Closes the Phase 1 loop.

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed.
- Don't put auth or DB code in the renderer. Package boundary is the discipline.
- Don't write RLS policies that inline ownership checks — call the helpers.
- Don't conflate ProseMirror selection state (`selected`) with React UI state (`editing`) in NodeViews. They're separate concerns; mixing them up causes the "input deselects after one keystroke" class of bug.
- Don't add MathLive to published HTML in Phase 1. That's a Phase 2.5 decision.
- Don't regress flowing-water UX as features land — performance budget, optimistic autosave, visible state indicators, predictable shortcuts. The user is more friction-tolerant than average users will be; flag friction risks even if they shrug.

## Working with the author (notes for the next AI session)

Solo dev: Dallas ISD Algebra II teacher, working-level JS/Python, learning the systems-engineering side of the stack as the project progresses. Engages with the *why* behind a choice; lean toward giving rationale alongside the action. Skip ceremony — no "great question," no "happy to help" wrappers. Best-practice-over-shortcut is the default preference, "ask before assuming" is an explicit standing instruction, and UX-as-priority is also explicit.

Specific friction patterns where unstated assumptions have caused loops:

- **Git workflow isn't automatic.** Lay out `git add <paths>` → `git status` (verify) → `git commit` → `git push` as separate steps.
- **Hidden files (leading `.`) deserve a callout** when pointing at `.env.local`, `.gitignore`, etc. `ls -la` shows them.
- **Editor commands aren't implicit.** Name nano's `Ctrl+O` (write out) / `Ctrl+X` (exit), or vim's `:wq`, when those editors come up.
- **pnpm workspace patterns are new.** When using `--filter @activity/foo` or `workspace:*`, a brief context sentence the first time.
- **pnpm strict-mode imports:** missing direct deps surface as Vite "Failed to resolve import" errors, even when the package exists transitively. The fix is always `pnpm add --filter @activity/app <package>`. Recognize the pattern when the user pastes that error.
- **"Replace X" instructions are easy to misread as "replace the whole file"** — or as "add the new code without removing the old." When pointing at a partial replacement (especially restructurings like "consolidate two returns into one"), name the delete-from / keep boundaries explicitly. Include "the rest of the file is unchanged" reassurance.
- **Babel TSX parser trips on nested generics in `forwardRef<A, B<C>>`.** Workaround: extract the inner type to a top-level alias.
- **New tooling concepts get one sentence of context the first time** — flat ESLint config, Tailwind v4 `@theme`, Zod discriminated unions, Tiptap's `useImperativeHandle` bridge for ProseMirror callbacks, React Router v7 declarative mode, ProseMirror NodeViews, the marks-on-text-runs model, etc.
- **Don't conflate URLs with API keys** when describing dashboard navigation.

When something fails, the user pastes terminal output. Read the actual output before assuming what happened — "command ran successfully" vs "command exited without doing anything" can look similar at first glance. Likewise, when the user pastes a file's contents, scan for duplicated code, dead code after a `return`, or missing exports before assuming the bug is elsewhere.

---

**Last updated:** Stages 1–4 of the playground week complete and committed. Editor base, toolbar, math nodes (inline + block), and slash menu all working. NodeView lifecycle pattern (the "5 commitments") and React-state-vs-ProseMirror-state distinction locked in as standing constraints. Next session resumes at Stage 5 (drag handle) per the "Nearest next steps" list.
