# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it short; if it grows past two screens, prune.

## Current focus

**Phase 1 — frontend.** Backend is complete and deployed. Next architectural piece is the React app + Tiptap editor.

## Status by area

| Area | Status |
|---|---|
| Database schema (migrations 0001–0004) | ✅ Applied to Supabase, RLS verified |
| Permission helper functions (`can_read_activity`, `can_edit_activity`, `can_access_assignment`) | ✅ In place; future collaboration extends helpers, not policies |
| `@activity/schema` package | ✅ Tested, on GitHub |
| `@activity/renderer` package | ✅ 17/17 tests passing, on GitHub |
| Renderer bundle for Edge Functions (`pnpm bundle:renderer`) | ✅ Working |
| `publish-activity` Edge Function | ✅ Deployed to project `dtqutpdplefmufrrakxs` |
| `ingest-submission` Edge Function | ✅ Deployed |
| Storage bucket `activities` | ✅ Created (public) |
| Edge Function secrets (`SUBMISSION_ENDPOINT`, `IP_HASH_SALT`) | ✅ Set |
| React app (`@activity/app`) | ⏳ Not started |
| Tiptap editor + custom NodeViews | ⏳ Not started |
| Serialize layer (Tiptap JSON ↔ ActivityDocument JSON) | ⏳ Not started |
| Dashboard (activity list, create, open) | ⏳ Not started |
| Markdown paste import (port of old `bulk-importer.js`) | ⏳ Phase 1 polish |
| End-to-end manual test (publish → student views → submits → teacher sees) | ⏳ Blocked on editor existing |

## Repo layout

```
activity-platform/
├── packages/
│   ├── schema/        — Zod types, document model, factories
│   ├── renderer/      — Pure JSON → HTML string. KaTeX inlined. No DOM.
│   └── app/           — (NOT STARTED) The React app
├── supabase/
│   ├── migrations/    — 0001 schema, 0002 RLS+helpers, 0003 RPCs+triggers, 0004 seed
│   └── functions/
│       ├── _shared/   — cors.ts (hand-edited), renderer.bundle.js (auto-generated)
│       ├── publish-activity/
│       └── ingest-submission/
├── scripts/
│   └── bundle-renderer.mjs
└── ...root configs (pnpm-workspace.yaml, tsconfig.base.json, etc.)
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Storage bucket:** `activities` (public)
- **`packageManager` pin in package.json:** REMOVED (was `[email protected]`; pin caused friction, removed for solo dev)

## Architecture decisions made (and the reasoning, in case I forget)

- **Vertical-stack-of-typed-blocks editor** (Notion-style), not grid canvas (Sites-style).
- **Tiptap on ProseMirror, with React bindings**, KaTeX for math. Vue 3 was the close runner-up; React won on ecosystem for solo dev.
- **Static HTML on publish** (option C), uploaded to Supabase Storage, NOT server-rendered on demand. R2 migration is one upload-step change away if egress bills bite.
- **Two URLs per published activity**: live alias (`/index.html`, 5min cache) and immutable versioned permalink (`/v{N}/index.html`, 1yr cache).
- **Drafts in a separate column** (`activities.draft_content`), versions append-only. Don't conflate them.
- **Permission helpers as SQL functions** so Phase 3+ collaboration changes one function, not eight policies.
- **Submission identity always present** — Pattern B: name field on the page, gate submit until non-empty. CHECK constraint enforces at storage layer.
- **Responses jsonb keyed by stable `blank.id`**, not array index. Locked in now to avoid migrating historical submission data.
- **`schemaVersion: 1`** on `ActivityDocument` and `SubmissionResponses` — bump and migrate on read when shapes change.
- **Parameterized problems are a planned Phase 2.5 feature** with both authoring-time and runtime variants. The current schema is forward-compatible; the only pre-emptive code change is the runtime answer-scoring strategy dispatch (see "Nearest next steps" #1). Don't add parameterization to Phase 1; do lock in the strategy pattern early.

## Standing constraints

- The renderer package must stay pure: no DOM access, no `process.env`, no I/O. JSON-in-string-out only. Enforced by package boundaries (renderer can't import React or DOM types).
- Schema package is the bottom of the dependency graph: it imports nothing from app or renderer.
- Serialize layer is the only place that knows about both Tiptap's JSON format and `ActivityDocument`. NodeViews don't reach into Zod; renderer doesn't know Tiptap exists.
- Adding a new block type touches four places (schema file, factory, renderer file, styles). Pattern in `problem.ts` and `fill-in-blank.ts` is the canonical reference.

## Open questions / deferred decisions

- **Hosting for the React app:** Cloudflare Pages vs Vercel. Either fine; deferred until app is ready to deploy.
- **Multi-column block layouts:** dropped from Phase 1 (cheap fixed two-column container is the eventual answer if needed).
- **Section color tinting:** dropped from Phase 1 (cosmetic).
- **Image upload (vs current image-by-URL only):** Phase 2.
- **Multi-tenancy / district-scoped activities:** Phase 4+. Helpers are designed for it; no schema work needed yet.
- **Governance model when a teacher leaves a district** (teacher owns vs district owns vs hybrid): pick before designing org features. Not urgent.

## Nearest next steps

1. **Refactor `runtime.ts`'s answer scoring to a strategy dispatch.** Currently `gatherResponses` calls `scoreBlank` which hardcodes list-comparison against `data-blank-answers`. Restructure as `evaluateAnswer(blankEl, typed)` that reads `data-blank-strategy` (defaulting to `'list'`) and dispatches. Phase 1 only ever uses `'list'`, so behavior is unchanged. This is a forward-compatibility change for Phase 2.5 (parameterized problems) — adding an `'expression'` or `'computed'` strategy later becomes one case in the switch rather than a runtime refactor. Maybe 30 lines, no schema changes, do this BEFORE starting frontend work so it's locked in while the runtime is small.
2. **Vite + React + TS + Tailwind scaffolding** in `packages/app/`.
3. **Auth flow stub** — sign in via Supabase Auth (Google), see "you're signed in."
4. **Tiptap playground week** — hardcoded fake document, no Supabase. Goal: paragraph, heading, math_inline, math_block, slash menu, drag handle. Just to learn the API.
5. **Wire editor to Supabase** — activity list, create activity, open editor, autosave drafts, serialize layer.

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed.
- Don't put auth or DB code in the renderer. The package boundary is the discipline.
- Don't write RLS policies that inline ownership checks — call the helpers.

---

**Last updated:** Phase 1 backend complete and deployed. About to switch to a Project + new chat for the editor work.
