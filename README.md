# activity-platform

The monorepo for the activity platform. Four packages:

- **`@activity/schema`** — TypeScript types and Zod validators for the document tree and submission responses. The bottom of the dependency graph; depends on nothing but Zod. No DOM, no React, no I/O.
- **`@activity/renderer`** — Pure function that converts a validated `ActivityDocument` into a complete HTML page. Depends on `@activity/schema` and KaTeX. No DOM, no React, no I/O. Same code runs in Node tests, Deno Edge Functions, or anywhere else.
- **`@activity/graph-kit`** — The shared graphing kit (Phase 2.7): expression evaluation (math.js), MathLive input, JSXGraph board, regression. Consumed two ways from one implementation: published pages lazy-`import()` the content-hashed bundle from R2; the editor preview imports it directly. DOM TypeScript, but no React and no Supabase.
- **`@activity/app`** — The React + Vite + Tiptap editor and dashboard. Depends on `@activity/schema` and `@activity/graph-kit` (editor preview); talks to Supabase.

For where the build *is* and what's in flight, see `STATE.md`; for where it's going, see `ROADMAP.md`. This README is durable orientation only — it deliberately does not track build status, so it can't drift out of date the way a status list does.

## Requirements

- Node 20+ (for `crypto.randomUUID()` and modern ES features)
- pnpm 11+ (workspace support; `pnpm approve-builds` is needed once for the esbuild postinstall)

## Getting started

```bash
cd activity-platform
pnpm install
pnpm test
```

`pnpm test` runs the suites for all four packages. Exact test counts drift as the suite grows, so they aren't pinned here — what matters is that every package's suite passes. Test locations follow a fixed convention:

- `@activity/schema` — `tests/` (public-API tests) and `src/__tests__/` (unit tests)
- `@activity/renderer` — `tests/`
- `@activity/graph-kit` — `tests/`
- `@activity/app` — `src/__tests__/`

### Running the app

The editor/dashboard needs Supabase credentials before it can start:

```bash
cp packages/app/.env.local.example packages/app/.env.local
# fill in the Supabase URL + anon key (see the comments in the file)
pnpm --filter @activity/app dev        # Vite dev server on http://localhost:5173
```

Sign-in is Google OAuth, allowlist-only in Phase 1 — your email must be in the
`signup_allowlist` table (the dev seed `supabase/migrations/0004_seed_dev.sql`
adds it; `scripts/seed-test-data.sql` and the `seed-e2e-*.sql` scripts create
sample activities/submissions). The editor playground at `/playground` and the
`/dev/*` harnesses need no Supabase data and are the fastest way to poke at
editor and runtime behavior (dev builds only).

## Common commands

| Command | What it does |
|---|---|
| `pnpm test` | Run all package tests once |
| `pnpm test:watch` | Re-run tests on file change |
| `pnpm typecheck` | Type-check all packages without emitting |
| `pnpm lint` | Lint all packages (currently the app) |
| `pnpm build` | Build all packages |
| `pnpm bundle:renderer` | Bundle the renderer for Edge Function consumption → `supabase/functions/_shared/renderer.bundle.js` |
| `pnpm build:graph-kit` | Bundle the graphing kit + regenerate `supabase/functions/_shared/graph-kit-manifest.ts`. Build-only — never uploads |
| `pnpm upload:graph-kit` | Build the kit AND upload it to R2 (`shared/`) — the deploy step (creds auto-load from gitignored `.env.r2`) |
| `pnpm deploy:ingest` | Redeploy `ingest-submission` with the required `--no-verify-jwt` flag baked in |
| `pnpm deploy:publish` | Redeploy `publish-activity` |
| `pnpm deploy:train` | Interactive walkthrough that sequences kit upload → ingest → publish-activity in the safe order |
| `pnpm clean` | Remove all `dist/` directories |

Single-package commands work too:

```bash
pnpm --filter @activity/schema test
pnpm --filter @activity/renderer test:watch
```

## Architecture invariants

Three rules. Violating any of them rots the architecture.

**The schema package never imports from the renderer or the app.** Its dependencies are Zod and nothing else. If you find yourself reaching for `katex` or `react` or anything DOM-shaped from inside `packages/schema`, stop and reconsider.

**The renderer never touches the DOM, never reads the environment, never does I/O.** No `window`, no `document`, no `process.env`, no `fs`, no `fetch`. If it needs a value (activity id, submission endpoint), it takes it as a parameter. This is what keeps every deployment option open: build-time static rendering, on-demand SSR, edge-function rendering, headless tests.

**Adding a new block type is mechanical, but it touches every package — and more places than the obvious ones.** The multiple-choice block shipped missing two of these (couldn't be placed in columns, wasn't indexed there — fixed in `3ffb6d4`), so the checklist below is deliberately exhaustive, and the starred items are enforced by structural guard tests that fail until you do them.

*Schema:* a new file under `packages/schema/src/blocks/`, registered in `blocks/index.ts`'s discriminated union; a factory in `packages/schema/src/factories.ts`; ★ added to `ColumnCellBlock` in `blocks/columns.ts` (guard: `schema/tests/columns.test.ts`).

*Renderer:* a new file under `packages/renderer/src/blocks/`, registered in `blocks/index.ts`'s dispatch switch (the `never` exhaustiveness check won't compile until you add it), plus matching styles in `packages/renderer/src/runtime/styles.ts`. If the block is interactive, RUNTIME.md's data-attribute contract gains a section (additive only) and the runtime grows its wiring. If the block is a NUMBERED question, add it to `isNumberedBlock` (renderer `blocks/index.ts`) AND its editor mirror `problemNumberAt` (`app/src/editor/problemNumbering.ts`) — these two lists must agree or editor numbers drift from published ones.

*Editor:* a Tiptap extension (plus a NodeView for blocks that render interactively) under `packages/app/src/editor/`; one entry in `slashMenuItems.ts` — it drives BOTH the slash menu and the toolbar's "+ Insert" dropdown, so there is no separate toolbar step; ★ the node name added to the `Column` node's content expression in `extensions/Columns.ts` (guard: `app/src/__tests__/blockTypeGuards.test.ts`, which also requires a `representativeBlock` case for the new type); registered in `ReferencePanelEditor.tsx` if the serializer can emit it in panel content (guard: `ActivityConfigDrawer.test.tsx`); both directions in `lib/serialize.ts`.

*App plumbing:* ★ `buildActivityIndex` in `lib/submissions.ts` if the block is a question (same guard file — index parity inside columns is asserted for every block type), plus the Submissions dashboard rendering for its response category. Optionally: the markdown importer (`lib/markdownToTiptap.ts`) + `docs/markdown-import-format.md` + the Copy-AI prompt (their own drift-guard test keeps the three in lockstep).

The pattern in `problem.ts` / `fill-in-blank.ts` (schema and renderer) and `MathInline` (editor) is the canonical reference; CLAUDE.md keeps the standing constraints (wire-format rules, bundle re-generation, deploy ordering).

## Quick example

```typescript
import {
  createEmptyDocument,
  createProblemBlock,
  ActivityDocument,
} from '@activity/schema';
import { renderActivity } from '@activity/renderer';

// Build a document
const doc = createEmptyDocument({ title: 'Logarithms warm-up' });
const problem = createProblemBlock();
problem.content = [{ type: 'text', text: 'Solve: log_2(8) = ?', marks: [] }];
doc.sections[0]!.blocks = [problem];

// Validate (always do this before persisting or rendering user-facing input)
const result = ActivityDocument.safeParse(doc);
if (!result.success) throw new Error('Invalid document');

// Render
const html = renderActivity(result.data, {
  activityId: 'some-uuid',
  versionNum: 1,
  submissionEndpoint: 'https://your-edge-function-url/ingest-submission',
});

// `html` is a complete <!DOCTYPE html>...</html> string ready to upload to Supabase Storage.
```

## Project status

This README intentionally does not track build status — that is what `STATE.md` is for, and the previous version of this section rotted precisely because it tried to. For the current stage breakdown and what's in flight, read `STATE.md`; for the long-term phase plan, `ROADMAP.md`. In broad strokes: the Phase 1 MVP loop is complete — schema, renderer, editor, publish flow on Cloudflare R2, submissions dashboard — and work continues on Phase 1 polish and follow-on features; `STATE.md` names the active goal.

## Edge Functions

The `supabase/functions/` directory holds Deno Edge Functions. `publish-activity` takes a draft, atomically snapshots a version, validates, renders, and uploads the static HTML to Cloudflare R2. `ingest-submission` receives student submissions from published pages, validates them, and writes to the `submissions` table. `upload-image` handles editor image uploads to R2. See `supabase/functions/README.md` for setup and deploy instructions.

The renderer is bundled for Edge Function consumption via `pnpm bundle:renderer`, which produces `supabase/functions/_shared/renderer.bundle.js`. Re-run after any change to `packages/schema` or `packages/renderer`. CI (`.github/workflows/ci.yml`) runs `typecheck → lint → test → build` on every PR and on pushes to `main` (feature-branch pushes are covered by their PR run) and re-runs `bundle:renderer`, failing if the committed bundle is stale — so a forgotten re-bundle is caught before deploy rather than shipping silently.
