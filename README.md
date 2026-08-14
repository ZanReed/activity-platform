# activity-platform

The monorepo for the activity platform. Four packages (a fifth, the published-page renderer, was deleted at the S9 cutover):

- **`@activity/schema`** — TypeScript types and Zod validators for the document tree and submission responses. The bottom of the dependency graph; depends on nothing but Zod. No DOM, no React, no I/O.
- ~~`@activity/renderer`~~ — **DELETED at S9 Drop 4 (2026-08-14).** The pure HTML-string renderer and its published-page runtime served the pre-viewer world; both parity gates (grading corpus + print) passed to `@activity/viewer` before the deletion. Nothing renders published HTML anymore — students open the viewer at `/a/:id`.
- **`@activity/graph-kit`** — The shared graphing kit (Phase 2.7): expression evaluation (math.js), MathLive input, JSXGraph board, regression. Consumed from the workspace by the viewer and the editor as an app-bundled lazy Vite chunk (the R2 summon path died with published pages at S9). DOM TypeScript, but no React and no Supabase.
- **`@activity/app`** — The React + Vite + Tiptap editor and dashboard. Depends on `@activity/schema` and `@activity/graph-kit` (editor preview); talks to Supabase.
- **`@activity/viewer`** — THE student surface: the single block registry (per-type metadata: checked-state family, sanitize spec, numbering, print, analytics key, a11y story — guard-enforced against the schema union), the React components + container shell behind `/a/:id`, the design-token layer, the print layer, the local-first store, and the SERVER side (answer-key sanitizer + grading engine, shipped to Edge Functions as committed bundles). Depends on `@activity/schema` + React.

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

`pnpm test` runs the suites for all five packages. Exact test counts drift as the suite grows, so they aren't pinned here — what matters is that every package's suite passes. Test locations follow a fixed convention:

- `@activity/schema` — `tests/` (public-API tests) and `src/__tests__/` (unit tests)
- `@activity/graph-kit` — `tests/`
- `@activity/app` — `src/__tests__/`
- `@activity/viewer` — `tests/` (the registry + token guard suites)

### Running the app

The editor/dashboard needs Supabase credentials before it can start:

```bash
cp packages/app/.env.local.example packages/app/.env.local
# fill in the Supabase URL + anon key (see the comments in the file);
# VITE_DISTRICT_HINT (optional) steers Google's account picker on student
# sign-ins — see the example file's comments
pnpm --filter @activity/app dev        # Vite dev server on http://localhost:5173
```

Sign-in is Google OAuth, allowlist-only in Phase 1 — your email must be in the
`allowlist` table (the dev seed `supabase/migrations/0004_seed_dev.sql`
adds it; `scripts/seed-test-data.sql` and the `seed-e2e-*.sql` scripts create
sample activities/submissions). The editor playground at `/playground` and the
`/dev/*` harnesses need no Supabase data and are the fastest way to poke at
editor behavior (dev builds only).

## Common commands

| Command | What it does |
|---|---|
| `pnpm test` | Run all package tests once |
| `pnpm test:watch` | Re-run tests on file change |
| `pnpm typecheck` | Type-check all packages without emitting |
| `pnpm lint` | Lint all packages (currently the app) |
| `pnpm build` | Build all packages |
| `pnpm bundle:viewer-server` | Bundle the read-API server code → `supabase/functions/_shared/viewer-server.bundle.js` |
| `pnpm bundle:grading-server` | Bundle the grading engine → `supabase/functions/_shared/grading-server.bundle.js` |
| `pnpm build:graph-kit` | Bundle the graphing kit + regenerate `supabase/functions/_shared/graph-kit-manifest.ts`. Build-only — never uploads |
| `pnpm upload:graph-kit` | Build the kit AND upload it to R2 (`shared/`) — the deploy step (creds auto-load from gitignored `.env.r2`) |
| `pnpm deploy:get-activity` | Redeploy `get-activity` with the required `--no-verify-jwt` flag baked in (run `bundle:viewer-server` first) |
| `pnpm deploy:check` | Redeploy `check-activity` — no flag; `verify_jwt` stays true (run `bundle:grading-server` first) |

| `pnpm clean` | Remove all `dist/` directories |

(`deploy:publish`, `deploy:ingest`, `deploy:feedback`, and `deploy:train` died at S9 Drops 1+3 with their functions — publish is a direct RPC and the anonymous submission wire is demolished. Two functions remain.)

Single-package commands work too:

```bash
pnpm --filter @activity/schema test
```

## Architecture invariants

Three rules. Violating any of them rots the architecture.

**The schema package never imports from the viewer or the app.** Its dependencies are Zod and nothing else. If you find yourself reaching for `katex` or `react` or anything DOM-shaped from inside `packages/schema`, stop and reconsider.

**Server-side viewer code (`packages/viewer/src/server/`) never touches the DOM and never binds components.** The sanitize/grading path runs in Deno Edge Functions from committed bundles; component bindings live client-side only (`registry/bindings.ts`) — the size ceilings in `scripts/perf-budgets.mjs` are the guard that a rendering engine never sneaks into a server bundle.

**Adding a new block type is mechanical, but it touches every package — and more places than the obvious ones.** The multiple-choice block shipped missing two of these (couldn't be placed in columns, wasn't indexed there — fixed in `3ffb6d4`), so the checklist below is deliberately exhaustive, and the starred items are enforced by structural guard tests that fail until you do them.

*Schema:* a new file under `packages/schema/src/blocks/`, registered in `blocks/index.ts`'s discriminated union; a factory in `packages/schema/src/factories.ts`; ★ added to `ColumnCellBlock` in `blocks/columns.ts` (guard: `schema/tests/columns.test.ts`).

*(The renderer's add-a-block-type steps died with the package at S9 Drop 4. `isNumberedBlock` lives in `@activity/schema` `block-predicates.ts`; its editor mirror is `problemNumberAt` in `app/src/editor/problemNumbering.ts` — these two must still agree, guarded by `schema/tests/block-predicates.test.ts`.)*

*Editor:* a Tiptap extension (plus a NodeView for blocks that render interactively) under `packages/app/src/editor/`; one entry in `slashMenuItems.ts` — it drives BOTH the slash menu and the toolbar's "+ Insert" dropdown, so there is no separate toolbar step; ★ the node name added to the `Column` node's content expression in `extensions/Columns.ts` (guard: `app/src/__tests__/blockTypeGuards.test.ts`, which also requires a `representativeBlock` case for the new type); registered in `ReferencePanelEditor.tsx` if the serializer can emit it in panel content (guard: `ActivityConfigDrawer.test.tsx`); both directions in `lib/serialize.ts`.

*App plumbing:* ~~`buildActivityIndex` + Submissions dashboard rendering~~ **DEAD at S9 Drop 3** — the Phase 2.6 dashboard and `lib/submissions.ts` were retired whole (the parked teacher-grading slice owns any successor; the viewer registry's conformance factory is the surviving per-type gate). Optionally: the markdown importer (`lib/markdownToTiptap.ts`) + `docs/markdown-import-format.md` + the Copy-AI prompt (their own drift-guard test keeps the three in lockstep).

*Viewer (`packages/viewer`, THE student path):* ★ a registry entry in `src/registry/registry.ts` declaring family, numbering, category, sanitize spec, print treatment, and — for interactive blocks — an a11y story (guard: `viewer/tests/registry.test.ts`, which fails until every schema block type has an entry and the declarations agree with `block-predicates.ts`); ★ an authored fixture in `src/fixtures/index.ts`, one per interaction variant (guard: `viewer/tests/fixtures.test.ts`); a React component in `src/blocks/` bound to the registry entry via `binding`, at which point the family conformance suite starts running against it automatically (`viewer/tests/conformance/`). If the block carries answer-key fields, the sanitize spec is what strips them — the wire-level leak suite (`viewer/tests/sanitize.test.ts`) will fail until it does. Analytics needs no extra step: the registry entry's `analyticsKey` (plus any declared interaction variants) IS the census key, and `viewer/tests/census.test.ts` derives its required roster from the registry, so it fails alongside the two guards above until the entry and fixture exist. Start from `packages/viewer/README.md`, which is the five-minute version of this paragraph.

The pattern in `problem.ts` / `fill-in-blank.ts` (schema) plus the viewer's `FillInBlank` registry entry + component, and `MathInline` (editor), is the canonical reference; CLAUDE.md keeps the standing constraints (bundle re-generation, deploy ordering).

## Quick example

```typescript
import {
  createEmptyDocument,
  createProblemBlock,
  ActivityDocument,
} from '@activity/schema';

// Build a document
const doc = createEmptyDocument({ title: 'Logarithms warm-up' });
const problem = createProblemBlock();
problem.content = [{ type: 'text', text: 'Solve: log_2(8) = ?', marks: [] }];
doc.sections[0]!.blocks = [problem];

// Validate (always do this before persisting user-facing input)
const result = ActivityDocument.safeParse(doc);
if (!result.success) throw new Error('Invalid document');

// The validated document is what publish snapshots into activity_versions;
// students see it rendered by @activity/viewer's components at /a/:id.
// (Static HTML rendering died with @activity/renderer at the S9 cutover.)
```

## Project status

This README intentionally does not track build status — that is what `STATE.md` is for, and the previous version of this section rotted precisely because it tried to. For the current stage breakdown and what's in flight, read `STATE.md`; for the long-term phase plan, `ROADMAP.md`. In broad strokes: the platform is a Supabase-backed editor + live viewer — teachers author and publish (a version snapshot via RPC), students open `/a/:id` under district Google SSO, and checking is server-authoritative; `STATE.md` names the active goal.

## Edge Functions

The `supabase/functions/` directory holds TWO Deno Edge Functions. `get-activity` is the viewer read API (anonymous meta + authenticated sanitized content — the one `--no-verify-jwt` function), and `check-activity` is the server-authoritative grading endpoint for the signed-in viewer (`verify_jwt:true`). Publishing needs no function at all — it is a direct `publish_activity` RPC from the app. (The S9 cutover deleted `publish-activity`, `ingest-submission`, and `get-feedback` with the published-page world; there is no `upload-image` function either — the editor uploads images directly to the `activity-images` Supabase Storage bucket under an RLS INSERT policy.) See `supabase/functions/README.md` for setup and deploy instructions.

Server-side code reaches the functions as committed bundles in `_shared/`: `pnpm bundle:viewer-server` (read-API sanitizer) and `pnpm bundle:grading-server` (grading engine). Re-run the relevant bundler after changing its source — CLAUDE.md maps which sources feed which bundle. CI (`.github/workflows/ci.yml`) runs `typecheck → lint → test → build` on every PR and on pushes to `main` (feature-branch pushes are covered by their PR run) and regenerates both bundles, failing if either committed bundle is stale — so a forgotten re-bundle is caught before deploy rather than shipping silently.
