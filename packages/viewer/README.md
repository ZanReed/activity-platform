# @activity/viewer

The student-facing viewer: a block **registry**, **design tokens**, the **read-API
server surface**, and the **React components** that render a worksheet.

This package is replacing `@activity/renderer` (JSON → HTML string + an inline
vanilla runtime) on the student path. Both exist today; the renderer retires only
after two parity gates pass (a golden grading corpus and per-block print
snapshots).

---

## Add a block component in five minutes

The loop is **copy an exemplar, rename, run one command**. You should not need to
read a design doc to get a passing test.

1. **Pick the exemplar matching your block's family** (see below) and copy it:

   | Your block | Copy | Why |
   |---|---|---|
   | Content, never graded | `src/blocks/Paragraph.tsx` | no state chrome, no store |
   | Auto-graded question | `src/blocks/MultipleChoice.tsx` | verdicts, feedback, solution |
   | Free text for the teacher | `src/blocks/ShortAnswer.tsx` | recorded receipt, never a verdict |

2. **Bind it in `src/registry/bindings.ts`** (NOT registry.ts — see below):

   ```ts
   my_block: { loading: 'eager', component: MyBlock as never },
   ```

   Use `'eager'` unless your component drags real weight behind it (graph-kit,
   MathLive) — then use `{ loading: 'lazy', load: () => import('../blocks/MyBlock.js') as never }`.
   Inline math does **not** make a block lazy; it loads its own chunk.

   > **Why a separate file:** the read API imports `registry.ts` for its
   > sanitize specs. When bindings lived on registry entries, the Edge Function
   > absorbed the whole component tree — 888 KiB → 21 MB once a graph binding
   > pulled in JSXGraph. `registry.ts` is pure data; only client code imports
   > `bindings.ts`. `pnpm bundle:viewer-server` has a size ceiling that fails
   > the build if that ever regresses.

3. **Run the tests.**

   ```bash
   pnpm --filter @activity/viewer test
   ```

   A conformance suite you did not write is now running against your component,
   generated from your registry entry. It checks your family's contract — see
   [docs/design/checked-state-families.md](../../docs/design/checked-state-families.md).
   Failures name the rule you broke.

4. **Look at it.**

   ```bash
   pnpm --filter @activity/app dev
   ```

   Open `/dev/viewer`, pick your block, drive its verdict, flip print mode. No
   `.env.local`, no login, no server needed — if that stops being true, it is a
   bug in this repo, not your setup.

---

## Styling

Import `@activity/viewer/viewer.css` alongside `tokens.css`. Your component
gets its look from **class names + tokens**, never from inline styles or local
colours:

```tsx
<div className="viewer-mc" data-block-type="multiple_choice">
```

**A literal colour, shadow, or named colour in `src/styles/viewer.css` fails
`tests/styles.test.ts`.** Use the token layer ([DESIGN.md](DESIGN.md)) — and if
you need a value it doesn't have, add the token rather than the literal. The
same suite pins the floors the design rulings set: 44px tap targets, a visible
focus ring, reduced-motion, a phone breakpoint, and print rendering as a blank
worksheet.

Inline styles are used in exactly two places, both because the property must
not depend on a stylesheet having loaded: the visually-hidden narration region
(`canvasChrome.ts`) and the canvas host sizing (a zero-height container makes
JSXGraph draw nothing).

## The three families (the one rule that matters)

Every block belongs to exactly one **checked-state family**, declared in the
registry and enforced by the conformance suite:

- **`auto_gradable`** — may show ✓ / ✗ and feedback, **only** from the server.
  There is no client-side scoring anywhere in this package, and there cannot be:
  answer keys are stripped before the document leaves the server.
- **`recorded`** — free text captured for the teacher. Shows "Recorded ✓", and
  **never** a verdict glyph, score, or anything a student could read as
  auto-grading.
- **`static`** — no state chrome of any kind. Ever.

Two cross-cutting rules the conformance suite also enforces:

- **All state chrome goes through `StatePill`.** The four states map to the
  `--state-*` token trios; a fifth state is a compile error rather than a review
  catch.
- **The mark never molests the work.** An incorrect verdict marks the attempt —
  it never redraws, resets, or "corrects" what the student entered.

---

## Layout

```
src/
  registry/     the block registry: family, numbering, sanitize spec, a11y story,
                print treatment, component binding. THE cross-lane contract —
                changes land here, never forked per-lane.
  tokens/       design tokens (light/dark/print) + DESIGN.md. Components consume
                tokens only; no private colors.
  sanitize/     answer-key stripping + serve-time shuffles (runs server-side).
  server/       what the get-activity Edge Function imports, incl. its handler.
  check/        the check wire contract (the frozen S4 seam) + a scriptable mock.
  store/        the viewer store + everything the device remembers:
                persistence.ts  the persisted shape + version gate + identity
                buffer.ts       the local-first buffer, key scheme, and sweeps
                documentCache.ts the served document, for offline + republish
                queue.ts        queued checks (owns no queue; the store does)
                tabLock.ts      one editable tab per (student, activity)
                caches.ts       SW cache-name contract (no producer today)
                ports.ts        Clock / HideSignal / ConnectivitySignal seams
  container/    the worksheet shell, per-block error boundary, document indexing.
  inline/       inline content rendering + the lazy KaTeX seam.
  styles/       viewer.css — the one component stylesheet (tokens only).
  blocks/       all 22 block components + the kit seams and shared chrome.
  fixtures/     generated fixtures — see below.
tests/
  components/   jsdom + Testing Library suites (everything else runs in node).
  conformance/  the family conformance factory.
```

## Fixtures are generated, never hand-written

`src/fixtures/` holds realistic **authored** blocks and pushes them through the
real pipeline on access — schema parse → sanitizer → serve shuffle. So
`sanitizedBlockFixture('multiple_choice')` is exactly what a student's browser
receives, and it stays correct automatically when the sanitize spec changes.

```ts
import { sanitizedBlockFixture, servedFixtureDocument } from '@activity/viewer/fixtures';
```

Guards enforce that every registered type (and every interaction variant) has a
fixture, and that every auto-gradable fixture actually **loses** content to the
sanitizer — a fixture with an empty answer key would render fine while silently
testing nothing.

## Commands

```bash
pnpm --filter @activity/viewer test       # unit + conformance
pnpm --filter @activity/viewer typecheck  # tsc; also enforces the sanitized type projection
pnpm --filter @activity/viewer lint
pnpm bundle:viewer-server                 # regenerate the committed Edge Function bundle
```

`pnpm bundle:viewer-server` must be re-run and **committed** after any change to
`sanitize/`, `registry/`, `server/`, or `@activity/schema`. CI regenerates it and
fails on drift, so a stale bundle cannot reach a deploy.

## What is not here yet

All 22 block components are built, styled, and conformance-covered, and the S6
offline layer (buffer, queued checks, tab lock, boot paths) is built and
browser-verified. Still to come:

- **Print mode (S5)** — the components carry print CSS and registry print
  treatments, but the per-block print-parity snapshots that gate the renderer's
  retirement are not written.
- **The real grading client (S4)** — the store talks to a `CheckService` port
  and only the mock implements it. `src/check/wire.ts` is the frozen contract
  the RPC must import.
- **The viewer ROUTE** — components render in `/dev/viewer` against fixtures;
  nothing yet fetches a real activity and mounts it for a student.
