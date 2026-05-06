# activity-platform

The frontend monorepo for the Phase 1 activity platform. Two packages:

- **`@activity/schema`** — TypeScript types and Zod validators for the document tree and submission responses. The bottom of the dependency graph; depends on nothing but Zod. No DOM, no React, no I/O.
- **`@activity/renderer`** — Pure function that converts a validated `ActivityDocument` into a complete HTML page. Depends on `@activity/schema` and KaTeX. No DOM, no React, no I/O. Same code runs in Node tests, Deno Edge Functions, or anywhere else.

A future `@activity/app` package will be the React + Vite + Tiptap editor and dashboard. Not built yet.

## Requirements

- Node 20+ (for `crypto.randomUUID()` and modern ES features)
- pnpm 9+ (workspace support)

## Getting started

```bash
cd activity-platform
pnpm install
pnpm test
```

If both test suites pass, the foundation is working. Expect output something like:

```
@activity/schema:
  ✓ tests/document.test.ts (10 tests)
  ✓ tests/submission.test.ts (4 tests)

@activity/renderer:
  ✓ tests/render.test.ts (16 tests)
```

## Common commands

| Command | What it does |
|---|---|
| `pnpm test` | Run all package tests once |
| `pnpm test:watch` | Re-run tests on file change |
| `pnpm typecheck` | Type-check all packages without emitting |
| `pnpm build` | Compile both packages (emits `dist/` per package) |
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

**Adding a new block type is mechanical, four places, in this order.** Step one: a new file under `packages/schema/src/blocks/`, registered in `blocks/index.ts`'s discriminated union. Step two: a new factory in `packages/schema/src/factories.ts`. Step three: a new renderer file under `packages/renderer/src/blocks/`, registered in `blocks/index.ts`'s dispatch switch (the `never` exhaustiveness check will fail to compile until you add it). Step four: matching styles in `packages/renderer/src/runtime/styles.ts`. The pattern in `problem.ts` and `fill-in-blank.ts` (in both packages) is the canonical reference.

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

// `html` is a complete <!DOCTYPE html>...</html> string ready to upload to R2.
```

## What's NOT here yet

- The `ingest-submission` Edge Function (publish-activity exists; ingest is next)
- The React app and Tiptap editor (`@activity/app`)
- The serialize layer (Tiptap JSON ↔ ActivityDocument JSON)
- A real bundler config for the app — will use Vite when we build the editor

These come in subsequent build steps. The current state is the foundation: types, validation, rendering, and the publish flow — all testable in isolation.

## Edge Functions

The `supabase/functions/` directory holds Deno Edge Functions that consume the renderer. The `publish-activity` function takes a draft, atomically snapshots a version, validates, renders, and uploads to Supabase Storage. See `supabase/functions/README.md` for setup and deploy instructions.

The renderer is bundled for Edge Function consumption via `pnpm bundle:renderer`, which produces `supabase/functions/_shared/renderer.bundle.js`. Re-run after any change to `packages/schema` or `packages/renderer`.
