# Student shell size review — measurements, savings, and a policy that stops the creep

**Status:** ⚖ **RULED 2026-11-13: the author accepted every recommendation** in §6 (D1–D10) and §8.4 (T1–T9).
✅ **BUILT 2026-11-13 (first slices):** student tier A (D1: R1–R4) with the fixed ceiling, spend meter, `EAGER_BLOCKS` guard and brotli row (D2–D5, D10), and teacher T1 + T5. Measured under CI's env: shell **162,470 → 159,049 B gz** (158.66 → 155.32 KiB); Bank journey **301.4 → 5.3**, Print **684 → 78.0** KiB gz. Every guard mutation-tested. ✅ **Then T2 + T3 + T8 (same day):** y-tiptap stubbed and the markdown import dialog lazy, editor journey **761.8 → 690.4** KiB gz (cap 840 → 760, plus a `lazyOut` row for the dialog); the lint rule refuses value imports of `lib/serialize`, the config drawer and the graph-kit barrel from non-editor routes. A real drag-reorder could not be driven under Playwright with or without the stub, so it is an author eyeball check. ✅ **T4 built (same day, ruled as recommended):** Responses **79.0 → 33.8**, Progress **80.0 → 34.9**, answer panel **75 → 29.8** KiB gz; mathjs ledger row + forbids on all three. ✅ **T6 built (same day):** the summed `prosemirror` ledger row is no longer the editor's growth gate (`journey: editor` is); it measures 253.1 and its cap moved 292 → 320, loose on purpose. **The review's build list is done.** Held in reserve: D6–D8. **T7 measured (§8.6), decisions T7-1/T7-2 open.** Declined: D9's R11–R13 and T9.
**Date:** 2026-11-13, measured at `018d52b8` (main) under CI's build env
(`VITE_SUPABASE_URL=http://127.0.0.1:54399`, `VITE_SUPABASE_ANON_KEY=e2e-anon-key`),
in a detached scratch worktree so the GUI-sweep session's uncommitted edits were not measured.
**Reads with:** `scripts/perf-budgets.mjs` (the caps and their history),
[shell-slim-supabase.md](shell-slim-supabase.md), [shell-slim-zod.md](shell-slim-zod.md),
TODOS.md → "The student shell's size ladder", the chunk-layout comment in `packages/app/src/App.tsx`.

> ⚠ Like every attribution in the size ladder, the numbers here go stale with the next eager
> change. Section 2's *measured* deltas are removal experiments and stay correct until the code they
> touch changes. Section 1's per-module table is an *estimate* (method in §1.2). Re-derive before
> building (P10).

---

## 0. Headline

- **Shell JS 158.67 KiB gz against a 158.7 cap: 33 bytes of headroom.** Shell CSS 16.0 of 16.5.
  On the wire (Cloudflare serves brotli to Chrome) the same chunk is **135.0 KiB br**.
- **About two-thirds of the shell is libraries:** react-dom ~46, auth-js ~26, postgrest-js ~11,
  react-router ~9.5, supabase-js ~3, react ~3. First-party code is ~55.
- **Since rung 1 (2026-08-23, 143.2) the shell has grown +15.5 KiB in 12 weeks.** Gross eager
  additions were about 21.5 KiB, and rungs 2 and 3 clawed back 6.3. The cap followed with three
  rulings of +0.5, +0.1 and +0.1 in the last two weeks.
- **There *is* another cheap rung, against the ladder's "no cheap rung left".** Four changes that
  delete code no student runs or reads, measured together: **158.67 → 155.26 KiB gz (−3.41)**.
- **The creep is a policy problem, not a missing rung.** The cap test only says pass or fail at
  0.1 KiB. Nothing records who spent the headroom, nothing asks a new feature to pay for itself, and
  a 20-byte overrun gets a 100-byte ruling. §5 proposes a fixed ceiling, an exact-byte spend
  meter, and lazy-by-default for new blocks.
- **Teacher side (§8):** the editor's first open downloads 762 KiB gz beyond the shell, Print 684 and
  Bank 301. Bank and Print pay for MathLive and most of the editor through one stray import each.
  Four small fixes cut ~960 KiB of first-visit download across those three routes (two of them
  measured), and per-route journey caps with forbidden markers would keep it from coming back.

## 1. Measurements

### 1.1 The budget check (`pnpm build` + `node scripts/check-perf-budget.mjs`)

| Row | Measured | Cap |
|---|---|---|
| shell JS (entry chunk, gz) | **158.67 KiB** (162,475 B) | 158.7 |
| shell CSS (entry, gz) | 16.0 KiB | 16.5 |
| ledger: katex / mathlive / jsxgraph / prosemirror / zod | 75.2 / 248.6 / 249.1 / 282.9 / 14.5 | 85 / 290 / 265 / 292 / 18 |
| precache | 1 entry, 979 B | 3 / 100 KiB |

All 24 rows pass. For the same entry file: raw 522.9 KiB, gzip-6 158.67, **brotli 134.97**.

### 1.2 Method for the breakdown

A scratch vite config (`vite.attrib.ts`, in the scratch worktree, not committed) wraps
`packages/app/vite.config.ts` and adds one `generateBundle` hook. For each of the entry chunk's 180
modules, the hook gzips the module's rendered (minified) code on its own. Those standalone sizes
are then scaled by one factor (0.485) so they add up to the real 158.67. That is a fair split of
the total, but it is not the saving from removing a module: shared gzip context means a module
alone compresses worse than it does in place. **Every saving claimed in §2 as *measured* comes from
a real removal build instead.** Ones marked *est.* are this proportional share.

### 1.3 By package (est. gz KiB)

| KiB | Package | Note |
|---|---|---|
| 46.4 | react-dom | `react-dom-client.production.js` alone 45.2 |
| 25.6 | @supabase/auth-js | GoTrueClient 18.6, helpers 2.1, locks 1.5, base64url 1.0, fetch 0.9, errors 0.8 |
| 10.8 | @supabase/postgrest-js | one module |
| 10.1 | viewer `blocks/` | 34 modules, the eager tier |
| 9.5 | react-router | production build (rung 3) |
| 6.9 | app `lib/` | 21 modules |
| 6.1 | viewer `container/` | ViewerContainer 2.6 |
| 5.6 | app `routes/` | StudentViewer 2.9, Home 1.8, JoinClass 1.0 |
| 4.9 | graph-kit | `static-svg/graph-svg.ts` 3.0, `figure-marks.ts` 1.8 |
| 4.2 | viewer `store/` | |
| 3.3 | viewer `registry/` | `registry.ts` 2.6 |
| 3.2 | @supabase/supabase-js | |
| 2.7 | react | |
| 2.5 | @activity/schema | `glossary.ts` 1.6 |
| 1.8 | @supabase/functions-js | **no call site** (§2, R2) |
| 1.6 | lucide-react | 3 icons (ThemeToggle) plus the Icon runtime |
| 1.5 / 1.5 / 1.3 / 1.3 | viewer glossary / print / inline / sanitize | |
| 1.35 | scheduler | |
| 0.43 / 0.39 / 0.25 | vite preload helper / tslib / **modulepreload polyfill** | |

**Rollup:** third-party ≈ 104 KiB (66%), first-party ≈ 55 KiB (34%).

### 1.4 Top first-party modules (est. gz KiB)

graph-svg.ts 2.97 · StudentViewer.tsx 2.85 · registry.ts 2.63 · ViewerContainer.tsx 2.58 ·
Home.tsx 1.80 · figure-marks.ts 1.76 · schema glossary.ts 1.61 · store.ts 1.51 · JoinClass.tsx
1.00 · httpCheckService.ts 0.98 · authMessages.ts 0.89 · InlineContent.tsx 0.84 · sanitize.ts 0.82 ·
Correspondence 0.78 · swRegistration 0.76 · Table 0.72 · classes.ts 0.72 · classActivities 0.71 ·
GlossaryHost 0.69 · buffer 0.67 · readClient 0.64 · Matching 0.63. After those comes a long tail of
modules at 0.3–0.6 each.

### 1.5 How the cap grew, and what each move bought

| Date | Commit | JS cap | Shell measured | What happened |
|---|---|---|---|---|
| 2026-08-05 | e3fbcf3e | **185** (new) | 168.1 | S8 route split; cap = measurement + ~10% |
| 2026-08-18 | 647fb8b2 | 185 → **172** | 177.6 → 156.4 | Slice 1: realtime + storage stubbed (−21.2) |
| 2026-08-23 | 6d0fc2a4 | 172 → **158** | 160.5 → 143.2 | Rung 1: zod out of the shell (−17.3) |
| 2026-10-04 | (rung 2) | 158 | 156.48 → 151.82 | Geometry slice had spent +13.3 (figures + glossary eager); auth-js dead modules stubbed (−4.7) |
| 2026-10-18 | (rung 3) | 158 | 157.9 → 156.3 | +6.1 drift in two weeks; router production build + lazy Home screens (−1.6). 156.5 stop line **retired** at 156.6 |
| 2026-10-30 | 355f4768 | 158 → **158.5** | 158.063 | D65 slice 2, "no cheap rung" |
| 2026-11-04 | 0a0f0350 | 158.5 → **158.6** | 158.533 | Period assembly, 34 B over |
| 2026-11-12 | 15f458ab | 158.6 → **158.7** | 158.621 | Released-feedback fix, 22 B over |
| 2026-11-13 | — | 158.7 | **158.667** | today, 33 B headroom |

CSS: 14 (08-05) → 15 (08-23, db0c2d65) → 16.5 (10-14, b60bd1ce). Measured 11.3 → 13.13 → 15.02 → 16.0.

**What the table says.** The early moves were large deletions of code that never ran, and the cap
came down with them. Since then, features have spent about 1.8 KiB a week of eager code. Each time
the headroom ran out, the answer was either a rung found under pressure or a raise sized to the
overrun. The last three raises were each about the size of the overrun, so the cap is now tracking
the shell rather than limiting it. The cap still holds for big regressions (a stray editor import),
but it no longer stops small ones.

## 2. Ranked savings

Ranked by saving ÷ (risk × effort). "Feel" is what a student would notice.

### Tier A: deletes code no student runs or reads (measured; do as one slice)

| # | Change | Saving | Risk / effort | What students feel |
|---|---|---|---|---|
| **R1** | **Move the registry's `a11y.story` prose out of `registry.ts`** into a test-side module keyed by `BlockType` (the guard in `registry.test.ts` reads it; nothing at runtime does — grep finds no non-test reader, and the prose is verbatim in the entry chunk today) | **−1.32 measured** | Low / S. Keep the "required for every interactive type" guard by typing the new map `Record<InteractiveType, …>` | Nothing |
| **R2** | **Stub `@supabase/functions-js`** like realtime/storage. Zero `functions.invoke` call sites in the app (the one hit is a comment explaining why the code uses plain fetch: the `x-region` CORS trap). supabase-js constructs `FunctionsClient` only inside the `functions` getter | **−0.97 measured** | Low / S. Same pattern and pin test as slice 1; one absence row in `ABSENT_FROM_BUILD` | Nothing. A future `functions.invoke` throws by name, which the CORS memory already wants |
| **R3** | **`"sideEffects": ["**/*.css"]` on `@activity/viewer` and `@activity/graph-kit`**, as schema already declares. The shell imports the viewer **barrel** (`main.tsx` takes `VIEWER_SHELL_CACHE` from `@activity/viewer`, and the app imports the `.` barrel throughout), so every module the barrel reaches is kept for its possible side effects | **−0.85 measured** | Low–med / S. Audit for top-level side effects in modules imported only for effect: none found (no bare non-CSS imports in either package). The build passed; **runtime not yet exercised**, so the e2e lanes must run | Nothing |
| **R4** | **`build.modulePreload.polyfill: false`.** Every supported browser (Chromebook Chrome, current Safari/Firefox) has native `modulepreload` | **−0.26 measured** | Low / XS | Nothing |
| | **Tier A together** | **158.67 → 155.26 (−3.41 measured)**, br 134.97 → 132.18 | | |

R3 matters beyond its 0.85. With `sideEffects` undeclared, **any future route split is defeated by
the barrel.** When StudentViewer, Home and JoinClass were all made lazy *without* R3, the entry only
fell to 141.3. With R3 it fell to 106.9. The barrel was holding the viewer in the entry through
`main.tsx`'s one constant. That is the same lesson as zod (rung 1), still armed one package over.

### Tier B: first-paint code that could load later (est. or partly measured; each its own slice)

| # | Change | Saving | Risk / effort | What students feel |
|---|---|---|---|---|
| **R5** | **Make Home + JoinClass lazy** (StudentViewer stays in the entry) | **−4.7 measured** (with R3: 153.1 vs 157.8) | Med / S. Re-opens S8 D4's "both landing routes static" | A **Home** visitor pays one extra round trip after the shell, unless `index.html` gets a few-line inline script that emits `<link rel=modulepreload>` for the Home chunk when `location.pathname` is `/` or `/join/*`. The Home journey's bytes go **up** 0.9 (159.6: chunk overhead), so this favours the worksheet link over the Today list. Offline: Home's chunk is runtime-cached (CacheFirst) after the first online visit; a student who has only ever opened `/a/:id` could not open Home offline the first time. Today they can |
| **R6** | **Static figure engine lazy**: `graph_figure` and `ChoiceFigure` behind a lazy boundary, so `graph-svg.ts` + `figure-marks.ts` leave the shell | **~5 est.** (4.7 of module share + wrappers) | Med / M. Re-opens Y7 ER-9's eager ruling. Needs a reserved-height fallback (the figure's `aspect-ratio` is already inline) so nothing shifts, and an idle prefetch (`requestIdleCallback(() => import(…))`) after first paint | Figure-bearing pages: the figure appears one round trip after the text, in a box already the right size. With idle prefetch, most students have it before they scroll. Pages without figures: nothing. Offline: cached once seen |
| **R7** | **Seldom-used interaction blocks lazy**: `correspondence`, `matching`, `ordering`, `table`, `faded_worked_example` | ~3 est. | Low–med / S. One-line binding changes; Table's "inline with prose, a fallback would flash" reason argues to keep Table eager | A one-round-trip placeholder on the first page that uses each type. React.lazy resolves every lazy type on a page in the same pass, so it is one parallel wait, not a waterfall |
| R8 | lucide-react → three inline SVGs in ThemeToggle | ~1.0 est. | Low / XS. Teacher chunks keep lucide; the Icon runtime would move to a shared lazy chunk | Nothing |
| R9 | Print JS layer lazy (PrintButton, printReadiness, PrintDocumentLayer, DefinitionGlossary) | ~2.5 est. | **Refused in principle already** for print CSS: Ctrl+P bypasses PrintButton's readiness barrier and `beforeprint` cannot await an import (DECISIONS → "The shell CSS cap"). The same reason applies to the JS. Listed so it is not re-derived | Ctrl+P could print an incomplete page |

### Tier C: library swaps (est.; large, risky; not recommended now)

| # | Change | Saving | Risk / effort | Feel / notes |
|---|---|---|---|---|
| R10 | **Thin data client in the shell:** drop postgrest-js (and most of supabase-js) from the student path. The shell's PostgREST surface is small: `users` select, `class_activities`/`activities` selects, `join_class`, `get_my_released_feedback`. A ~1 KiB fetch helper on the auth-js session, with the full client built lazily for teacher chunks | ~12 est. | Med–high / L. supabase-js constructs `PostgrestClient` eagerly, so this means not calling `createClient` in the shell; SessionContext is shared with teacher routes. Auth headers, error shapes and RLS behaviour must match | Nothing if correct; a wrong header is a signed-in student who sees nothing |
| R11 | Hand-written OAuth PKCE + refresh client instead of GoTrueClient | ~20 est. | **High** / L. Token refresh across tabs (`locks.js`), PKCE, session recovery: security-critical code that auth-js has already debugged | A rare signed-out student is the visible failure |
| R12 | Preact/compat for React | ~35–38 est. | **Very high** / L. Tiptap and the whole editor share the React instance; Suspense/lazy is the viewer's lazy-block mechanism, and preact/compat's Suspense is weaker | Measure before believing (ladder rung 3) |
| R13 | Swap react-router for a lighter router | ~7 est. | High / M. Touches every route file | Nothing if correct |

**Checked and dropped:** the glossary dialog is already lazy (`GlossaryHost.tsx:44`), and so are
definition blocks and inline math gaps. Teacher-only RPC wrappers in shared modules (`classes.ts`'s
`create_class`, `grading.ts`'s `list_grading_queue`) are already removed by export tree-shaking
(the modules' shell share is what the student path calls). Shell CSS has no slim left (measured and
recorded in DECISIONS → "The shell CSS cap").

**Not measured, worth one build each when pulled:** raising `build.target` (fewer down-levelled
constructs; probably under 0.5), and duplicated helpers (auth-js's `base64url` against any of ours).

### 2.1 What a full route split would teach

Measured with R3 in place: entry (router, auth, React, session) **106.9**. Home journey **118.9**.
Worksheet journey **162.0** across 28 files. Splitting does not shrink the worksheet path; it
*adds* 3.3 KiB of chunk overhead. So the shell number is a good stand-in for the worksheet journey
only while the viewer stays in the entry. Any future split should move the budget to per-journey
measurement (D7).

## 3. Why the cap keeps creeping (diagnosis)

1. **The test measures a level, never a change.** `check-perf-budget.mjs` compares the shell with
   the cap at 0.1 KiB. A slice that adds 300 bytes passes silently, and the slice that crosses
   the line gets the bill, often a 20-byte bug fix. Rung 3 found +6.1 KiB of unflagged drift.
2. **The headroom has no owner.** Freed bytes (rung 2's 4.7) were spent by whoever came next, with
   no record of what they bought.
3. **Eager is the default.** A new binding in `bindings.ts` is eager unless someone argues it lazy.
   A new student-surface component imported from StudentViewer/Home is eager automatically.
4. **The overrun-sized raise is the cheapest answer.** "No rung searched at this size" (11-12) is
   rational at 22 bytes. That is exactly why it repeats.
5. **gzip-level noise sits where the rulings happen.** `.env.local` builds read about 47 B heavier,
   which is larger than two of the three overruns that got rulings.

## 4. What the tier-A slice would touch (for the build session, not done here)

R1 `packages/viewer/src/registry/{registry,types}.ts` + `tests/registry.test.ts` (a new
test-readable `a11yStories.ts`); R2 `packages/app/src/lib/supabase-stubs/functions-js.ts`,
`vite.config.ts` alias, `supabase-stub-pin.test.mjs`, an `ABSENT_FROM_BUILD` row
(marker: a FunctionsClient-only string), `supabaseStubs.test.ts`; R3 two `package.json` files; R4
`vite.config.ts`. Then tighten `SHELL_JS_GZ_KIB` per §5. Every guard is mutation-tested once
(revert the wiring, watch it go red). Run the e2e lanes for R3. No migration, no deploy, no bundle
regeneration (viewer-server/grading-server bundles are untouched, though `pnpm verify` confirms it).

## 5. The policy: stop paying for creep with rulings

The aim is **cost control without byte-chasing**. The ladder's standing trigger still holds:
timing beats its targets, and no field measurement yet shows the shell is what a student waits on.
So the policy should make spending visible and deliberate. It should not make every feature fight
for bytes.

**P-1. A fixed ceiling.** `SHELL_JS_GZ_KIB` becomes a ceiling that does not move by ruling. The
+0.1 rulings stop. Changing it needs a design pass that names what it buys and which rung would
undo it. After the tier-A slice the ceiling stays at **158.7**, so the 3.4 KiB freed becomes the
**allowance**. That is ~2.2% headroom, inside R6's anti-fossil line. (Alternative in D2: tighten to
~157 and keep less allowance.)

**P-2. An exact-byte spend meter, tied to the cap test.** Add `SHELL_JS_BASELINE_BYTES` (exact gz
bytes of main under CI's env) and a `SHELL_SPEND` list (`{ date, change, bytes }`) to
`perf-budgets.mjs`. `check-perf-budget.mjs` gains one row: **red when the measured shell exceeds the
baseline by more than 256 B.** The fix is to bump the baseline *and* add a spend row in the same
commit, which makes the cost a reviewed, one-line, attributed diff. A `node --test` pin asserts
that the baseline equals the anchor plus the sum of the spend rows, so the ledger cannot be skipped.
Shrinking more than 256 B below the baseline is also red ("tighten me"): R6's anti-fossil rule,
enforced by a test rather than left to memory. Builds are deterministic per commit, so the 256 B
band only has to cover legitimate tiny edits, not runner noise.

**P-3. Pay for crossing.** A slice whose spend would cross the ceiling brings its offset in the same
slice: a rung from the **reserve list** (§2, ranked and measured). A cap ruling is the last resort,
not the default.

**P-4. Lazy by default for new blocks and new student UI.** In `bindings.ts`, a new type is `lazy`
unless it is named in an `EAGER_BLOCKS` allow-list with a reason. A registry test fails when an
eager binding is not on the list, the same shape as `guiSurfaces.test.ts`. Student-surface UI that
is not on first paint (dialogs, offers, done screens, practice) is `lazy()` by default. A design
pass that wants it eager states its byte cost. The existing 20 eager bindings enter the list as-is
with today's reasons.

**P-5. Design passes carry a size line.** Every student-facing design pass states its estimated
eager cost and its tier, the way Y7 ER-9 did. That is where the meter's spend row is first written.

**P-6. Report brotli beside gzip (info, not a gate).** The wire size is about 135 KiB br. Gzip stays
the gate because it is what the history is written in.

**P-7. Re-anchor if the viewer ever leaves the entry.** The shell number stops standing for the
worksheet journey at that point (§2.1). Move the gate to per-journey sums (entry + statically
reachable chunks of the route) in the same slice.

## 6. Decisions for the author

| # | Decision | Recommendation |
|---|---|---|
| **D1** | Build the tier-A slice (R1–R4, −3.41 KiB measured, low risk, no deploy)? | **Yes**, one slice, guards mutation-tested, e2e lanes run for R3 |
| **D2** | After it lands: hold the JS cap at 158.7 as a fixed ceiling (3.4 KiB allowance) or tighten to ~157 (≈1.7 allowance)? | **Hold 158.7, made fixed by P-1.** The allowance is what lets P-2/P-3 replace rulings. Tightening alone re-creates the overrun cycle a few weeks later |
| **D3** | Adopt the exact-byte spend meter (P-2) with a 256 B band? | **Yes.** It is the change that actually stops the creep: every spend becomes visible at the commit that makes it |
| **D4** | Adopt lazy-by-default for new block bindings and non-first-paint student UI, with an `EAGER_BLOCKS` allow-list test (P-4)? | **Yes** |
| **D5** | Adopt "pay for crossing" (P-3): a crossing slice brings a reserve rung, and a cap ruling becomes the exception? | **Yes** |
| **D6** | Make the static figure engine lazy (R6, ~5 est., re-opens Y7 ER-9)? | **Not now; first in the reserve.** Measure it when the allowance runs out |
| **D7** | Make Home + JoinClass lazy (R5, −4.7 measured, re-opens S8 D4; a Home visitor gains a round trip unless index.html preloads by path)? | **Not now; second in the reserve**, and only with the path-based preload |
| **D8** | Make the seldom-used interaction blocks lazy (R7, ~3 est.)? | **Reserve**, except Table stays eager |
| **D9** | Library swaps (R10 thin data client, R11 own auth client, R12 Preact, R13 router)? | **No for R11–R13.** R10 gets a design pass only when the reserve is spent, or when the field-measurement trigger fires |
| **D10** | Add a brotli info row to the budget output (P-6)? | **Yes**, info only |

⚖ **RULED 2026-11-13 (author): every recommendation above, as written.**

## 7. Reproducing

The scratch worktree, attribution config and outputs were not committed. To redo: `git worktree add
--detach <scratch> HEAD`, `pnpm install`, then in `packages/app` run `vite build --config
vite.attrib.ts` (a wrapper that spreads `vite.config.ts` and adds a `generateBundle` hook writing
each entry module's rendered code size + standalone gzip) under CI's two env vars. Each §2
"measured" figure is one build with only that change applied, compared by gzip-6 of the entry file
(the same `gzipSync` default `check-perf-budget.mjs` uses). Do not use `.env.local`: it reads about
47 B heavier. The teacher figures (§8) add a second wrapper that dumps rollup's module graph
(`getModuleInfo(id).importedIds`) for the shortest-path traces and the graph-cut estimates, and sum
each route's static chunk closure from the per-chunk `imports` lists.

---

## 8. Teacher side

**Scope added 2026-11-13** (author: "it's better to be efficient on both sides when we can").
Same build, same CI env, same rules: analysis only. Decisions are numbered **T1–T9** so they do
not collide with §6.

### 8.1 What a teacher downloads

The measure is the **journey**: a route's lazy chunk plus every chunk it statically imports,
minus what the shell already brought. That is what the browser fetches on the first visit to the
route, before any in-route `import()`. Gzip-6 of the dist files:

| Route | Journey beyond shell (gz) | Files | Heaviest parts |
|---|---|---|---|
| **ActivityEditor** | **762.4 KiB** | 41 | MathLive 222.7 · ProseMirror/Tiptap core chunk 151.3 (131 vendor, 20 app) · editor extensions chunk 94.6 (**yjs + lib0 + y-tiptap ≈ 41.5**, prosemirror-tables 7.1, app 33.8) · KaTeX 75.2 · route chunk 45.7 (**markdownToTiptap 18.9 + markdownImportPrompt 11.2**) · **mathjs + typed-function 43.6** · Editor chunk 37.9 (**tippy + popper 13.7**) · zod 14.5 · focus-trap 9.1 |
| **ActivityPrint** | **684.0** | 39 | Nearly the whole editor: `PrintSettingsBody` is imported from `ActivityConfigDrawer.tsx`, which statically imports `ReferencePanelEditor` and `TeacherGuideEditor` (Tiptap, MathLive) and the graph-kit barrel (mathjs) |
| **Bank** | **301.4** | 13 | MathLive 222.7 + mathjs 43.6 + zod 14.5, all through **one import**: `teacherGuideToTiptap` from `lib/serialize.ts` (serialize → mathPromptSync → math-prompt-convert → MathLive; serialize → dolRules → scorers → mathjs) |
| ActivityProgress | 80.0 | 16 | mathjs 43.6 (answerText → seededPrint → resolveEntry → scorers → evaluate), zod 14.5 |
| ActivityResponses | 79.0 | 14 | the same mathjs + zod path |
| progress/AnswerPanel | 74.8 | 13 | the same |
| Activities (teacher landing) | 43.9 | 15 | zod 14.5 (schema barrel), focus-trap 9.1, route 9.0 |
| FactsTeacher | 13.7 | 6 | route chunk 11.9 |
| Classes / ClassProgress / ChainHooks / Analytics | 8.2 / 6.1 / 4.4 / 1.7 | | |

**All JS in the build:** 1,386 KiB gz (1,165 br) in 129 chunks. **Largest chunks:** JSXGraph 239.1
(lazy, graph blocks only), MathLive 222.7, Tiptap/ProseMirror core 151.3, editor extensions 94.3,
KaTeX 75.2, markdown-it 45.3 (already dynamic), mathjs 43.6.

**Caching changes what a byte costs.** Teachers come back; the service worker's CacheFirst runtime
cache makes a repeat editor open nearly free *until the next deploy*. Cloudflare deploys every push
to `main`, which is often several times a day. Any chunk whose hash changes is downloaded again.
The two biggest editor chunks **mix vendor code with app code** (the Tiptap core chunk holds 20 KiB
of `app/src/editor`, the extensions chunk 34). So an editor commit can re-hash ~245 KiB of mostly
unchanged ProseMirror. Not measured across deploys; see T7.

### 8.2 Ranked savings (teacher)

*Measured* = a real build with the change applied in the scratch worktree. *Graph est.* = modules
that become unreachable in the module graph when that one static edge is cut, sized by their share
of their chunk's gzip (§1.2's method).

| # | Change | Saving | Risk / effort | What teachers feel |
|---|---|---|---|---|
| **TR1** | **Bank stops importing `lib/serialize.ts`**: move `teacherGuideToTiptap` (or what it needs) into a small module of its own | **Bank 301.4 → 5.4 measured (−296)** | Low / S | Bank opens without downloading MathLive or mathjs. On a school Chromebook that is ~1 MB less to parse |
| **TR2** | **Print stops importing `ActivityConfigDrawer.tsx`**: move `PrintSettingsBody` into its own module | **Print 651 → 63 graph est. (−588)** | Low / S | Print preview opens without the editor. Making only the two drawer editors lazy measured 684 → 588 (−96, ReferencePanelEditor alone); both, graph est. −337 |
| **TR3** | **Stub `@tiptap/y-tiptap`** (yjs, lib0, y-protocols, extension-collaboration). Reached only through `@tiptap/extension-drag-handle`, which calls it only when a y-sync plugin exists (`getRelativePos` returns `null` when `ySyncPluginKey.getState` is empty). No collaboration in the app | **Editor −31.3 measured** (and the same on Print until TR2) | Low–med / S. Same pattern as the Supabase stubs: an alias, a pin test on the Tiptap version (the family is bumped together), and an `ABSENT_FROM_BUILD` row. Un-stub if co-editing ever lands (the fall co-ownership arc is async, not live) | Nothing; drag handles still work (mutation/e2e on drag-reorder required) |
| **TR4** | **Markdown import dialog lazy** in `ActivityEditor.tsx` (it carries `markdownToTiptap` and the 11 KiB copy-paste prompt *text*) | **Editor ≈ −40 measured** (−71.4 together with TR3) | Low / XS | A one-round-trip wait the first time the dialog opens |
| **TR5** | **Dashboards evaluate seeded answers lazily**: Responses, Progress and AnswerPanel reach mathjs through `resolveEntry → scorers` | **Responses 67 → 12.5 graph est. (−55)**, the same order for Progress and AnswerPanel | Med / M. The seeded-answer text must appear without a flash; it could load only when the activity has seeded items | Dashboards for unseeded activities open lighter; seeded ones wait one round trip for their answer text |
| TR6 | Slash menu off tippy.js + popper (deprecated) onto `@floating-ui`, which Tiptap already ships | ~13 est. | Low–med / S | Nothing if the menu positions the same |
| TR7 | Activities off the schema barrel (zod 14.5) | ≤14 est. Graph cut showed 0, so another path also reaches zod | Low / S, needs its own trace | Teacher landing a little lighter |
| TR8 | MathLive deferred to the first math field | up to 223, **but woven through 7 importers** (Editor.tsx's `import 'mathlive'`, both drawer editors, mathFormula.ts, and graph-kit's barrel used by 9 editor modules) | High / L | Maths activities almost always have math, so most sessions would download it anyway; this improves time-to-first-edit, not total bytes. **Not recommended** |
| TR9 | Split vendor code from app code in the editor chunks (`manualChunks` for prosemirror/tiptap, mathjs, katex) so editor commits stop re-hashing vendor code | **0 first-open bytes; repeat-visit bytes after each deploy** (not measured) | Med / S. A wrong rule can pull vendor code into the shell; the shell's forbidden-marker rows already catch that | Teachers re-download ~20–40 KiB of app code after a deploy instead of ~245 |

**Together TR1–TR4 (low risk, all small):** editor 762 → ~691 (measured), Bank 301 → 5 (measured),
Print 684 → ~63 (graph est.). That is about **−960 KiB of first-visit downloads across the three
routes**, with no change to what a teacher sees except a lazy markdown dialog.

**Why these exist:** every large item above is one static import reaching across a feature line
(Bank → serialize, Print → drawer, drawer → graph-kit barrel, drag-handle → yjs). That is the same
class as the student side's barrel finding (§2 R3) and rung 1's zod: **import cost, not use
cost.** Nothing on the teacher side currently checks for it, because the CHUNK_LEDGER rows
measure *libraries* summed across all chunks, never *which routes* pull them.

### 8.3 Policy for the teacher side

The student policy (§5: a fixed ceiling and an exact-byte meter) **should not be copied as it
stands.** Teachers are on staff devices, revisit with a warm cache, and the editor changes most
days. A 256-byte meter on the editor would turn every editor commit into a spend row. The teacher
problem is different: **heavy libraries leaking into routes that don't use them.** The guard
should match that.

**TP-1. Teacher journey budgets in `scripts/perf-budgets.mjs`.** A new `TEACHER_JOURNEYS` list,
one row per route facade (`routes/ActivityEditor.tsx`, `Bank`, `ActivityPrint`, `Activities`,
`ActivityResponses`, `ActivityProgress`, `Classes`). Each row has a gz cap on the static-closure
sum beyond the shell (from `dist/.vite/manifest.json`, the file `check-perf-budget.mjs` already
reads; the manifest's `imports` lists are exactly the static closure). Caps are set at measurement
+ ~10% after TR1–TR4 land, under the existing R6 anti-fossil rule. The rows should be coarse on
purpose.

**TP-2. Per-journey forbidden markers, the rows that do the real work.** These reuse
`CHUNK_LEDGER`'s content markers: **Bank, Activities, Classes and the dashboards must be free of
`MathfieldElement` (MathLive) and `ProseMirror`. Print must be free of `ProseMirror`. No journey
may contain yjs** (after TR3). This is the teacher equivalent of `SHELL_FORBIDDEN_MARKERS`. Each
row carries a `why`, and each is mutation-tested once by restoring the import it guards.

**TP-3. Retire the summed `prosemirror` ledger row's role as the editor's growth gate.** It sums
every chunk containing the `ProseMirror` marker, which includes the editor's own app code, so
"every editor feature crosses it" (perf-budgets.mjs, 2026-11-12). Once TP-1's editor journey row
exists, the ledger row returns to its original job of keeping ProseMirror out of the shell. Its cap
can then be set from TR9's vendor-only chunk or left loose.

**TP-4. A design-pass size line for teacher features, coarse.** It need not give a byte count,
only the answers to: "Does this add a heavy library to a route that didn't have it? Does a
lightweight route gain an import from `editor/`, `lib/serialize.ts` or a package barrel?"

**TP-5. A lint rule for the import shapes that caused every finding here.** These are a static
import of `lib/serialize.ts`, `components/ActivityConfigDrawer.tsx` or `@activity/graph-kit` (the
barrel) from a route file outside the editor. ESLint's `no-restricted-imports` with a per-file
override, so the editor keeps them. This catches the mistake in the editor while it is being
written, before a build.

### 8.4 Decisions (teacher side)

| # | Decision | Recommendation |
|---|---|---|
| **T1** | Build TR1 (Bank off serialize, −296 measured) and TR2 (Print off the drawer, −588 graph est.) as one small slice? | **Yes, first.** Biggest wins in the review, lowest risk |
| **T2** | Stub y-tiptap/yjs (TR3, −31 measured) with a Tiptap pin test and an absence row? | **Yes**, with drag-reorder e2e coverage. Un-stub only for live co-editing |
| **T3** | Make the markdown import dialog lazy (TR4, ≈−40 measured)? | **Yes** |
| **T4** | Lazy seeded-answer evaluation on the dashboards (TR5, ~−55 graph est. each)? | **Yes, after T1–T3**, as its own slice, because the no-flash requirement needs a design line |
| **T5** | Add `TEACHER_JOURNEYS` caps (TP-1) and per-journey forbidden markers (TP-2) to `perf-budgets.mjs` / `check-perf-budget.mjs`? | **Yes, in the same slice as T1**, so the guard is born green and mutation-tested against the import it removes |
| **T6** | Retire the summed prosemirror ledger row as the editor gate (TP-3)? | **Yes**, once T5's editor journey row exists |
| **T7** | Vendor/app chunk split for the editor (TR9), to cut post-deploy re-downloads? | **Measure first**: record chunk-hash churn across a week of deploys, then decide |
| **T8** | Lint rule against cross-feature heavy imports (TP-5)? | **Yes**, cheap |
| **T9** | Apply the student side's exact-byte meter (§5 P-2) to teacher routes? | **No.** The journey caps and markers fit the teacher problem; the meter would tax every editor commit |

⚖ **RULED 2026-11-13 (author): every recommendation above, as written.**

### 8.5 T4 design pass: dashboards load the seeding code only when they seed (2026-11-13)

**Re-derived against `122f8b1e` (P10), and the premise changed.** §8.2 framed TR5 as "evaluate
seeded answers lazily, with a no-flash requirement". The code says something simpler:

- All three dashboards reach mathjs by ONE static edge: `lib/answerText.ts` imports `seedForForm`
  from `@activity/viewer/seeded-print`, which reaches `resolveEntry` → graph-kit's scorers → mathjs.
- **Responses and Progress never seed.** Both call `servedDocument(…, studentId = null)`, the
  "many students" path that keeps `{name}` templates. So they download mathjs for code they never run.
- **Only AnswerPanel seeds** (one student's answers, read against that student's numbers). It calls
  `servedDocument` inside an async loader, after `fetchStudentWork` and `fetchVersionContents`,
  and its panel shows "loading" until the loader finishes. **No answer text is ever on screen
  before the seeding runs, so there is no flash to design around.**

**Measured** (scratch build, the import cut, CI env): Responses **79.0 → 33.5**, Progress
**80.0 → 34.6**, AnswerPanel's own journey **→ 29.3** KiB gz (from ~75).

**The change, as proposed:**
- `servedDocument` keeps its signature for the `null` path and stays synchronous. It no longer
  imports `seeded-print`.
- The seeding path takes the seeding function as an argument. `answerText.ts` exports
  `loadSeeding()` = `import('@activity/viewer/seeded-print')`. AnswerPanel's loader awaits it
  before building documents.
- Guards: a `mathjs` CHUNK_LEDGER row (its marker live by construction), `forbid: ['mathjs']` on
  the Responses and Progress journeys, and a new AnswerPanel journey row with the same forbid.
  Mutation-tested by restoring the static import.

| # | Decision | Recommendation |
|---|---|---|
| **T4-1** | Cut the static `seeded-print` import from `answerText.ts`, passing the seeding function in on the one path that seeds? | **Yes.** −45 KiB on each of Responses and Progress, with no behaviour change on either |
| **T4-2** | When does AnswerPanel load the seeding code? **(a)** at the start of its loader, in parallel with the two fetches: no added wait, but every AnswerPanel visit downloads it (today's bytes). **(b)** only when the fetched content has `seedVars` or a DoL section: unseeded activities save ~45 KiB, and a seeded one waits one round trip after its content arrives, under the loading state it already shows | **(b).** The wait is hidden behind an existing loading state, happens once per session (the chunk is then cached), and only for seeded activities |
| **T4-3** | If the seeding chunk fails to load (an open tab after a deploy): show the panel's existing error state, worded "refresh the page", or fall back to unseeded answers? | **Error state.** Unseeded answers would show the class template (`{a}`), or the wrong student's numbers, as if they were this student's, which is worse than no answers |
| **T4-4** | Add the `mathjs` ledger row and the three journey forbids? | **Yes**, born green in the same commit |
| **T4-5** | Scope: leave the Bank preview (`BankItemPreview`, ~70 KiB, imports `substituteSeededAnswers`) and Print (which genuinely seeds to print) out of T4? | **Yes.** Print needs the code. The Bank preview could take the same pattern later; file it with the trigger "a Bank preview is reported slow" |

⚖ **RULED 2026-11-13 (author): T4-1 to T4-5 as recommended.** Built the same day; see the Status line.

### 8.6 T7 measured: what a returning user re-downloads per deploy (2026-11-13)

**Method.** `scripts/measure-deploy-churn.mjs` rebuilds real deployed commits (each push to `main`
deploys; the commits are the head SHAs of CI's push runs) under CI's env. For each consecutive pair
it sums the gz bytes of files in the new build's static closure whose names the old build did not
have. That is what a warm cache fetches, since `/assets/*` is immutable. It ran over the 13 deploys
from `5d1980f8` (2026-11-05) to `e5df6dea` (this review's last slice), in four variants: as shipped,
the TR9 vendor `manualChunks` rule, Rollup's `minifyInternalExports: false` ("stable"), and both.

**Findings.**

| Over 13 deploys (10 changed code) | Student shell re-download | Editor re-download (shell + editor closure) |
|---|---|---|
| As shipped | **1,583 KiB** (the whole ~158 KiB shell, every code deploy) | **5,844 KiB** (~590 of ~915 per code deploy, 64%) |
| Vendor split | 2,423 KiB | 4,372 KiB |
| Stable exports only | 1,594 KiB | 5,876 KiB |
| Vendor split + stable exports | 1,919 KiB | 3,872 KiB (~360 per code deploy, −34%) |

1. **The naive vendor rule leaks into the student shell.** In every split build, the entry
   statically imported `vendor-editor` and `vendor-mathjs`, which took the shell from ~155 to
   **~358 KiB**. The rule groups whole libraries, and the shell uses a small piece of at least one
   of them, so the whole group came with it. The budget's purity rows would have failed it. A safe
   rule would have to exclude every module the entry can reach, using the module graph
   (`getModuleInfo`), not only package names.
2. **A vendor chunk re-hashes even when its code doesn't change.** Two `vendor-mathjs` builds were
   byte-identical except for the export alias line (`export{ns as a,…}`). Rollup reassigns those
   aliases when importing code changes. That is why the split saved nothing on 4 of the 10 code
   deploys. `minifyInternalExports: false` fixes this, but only together with the split.
3. **Students re-download the whole shell on every deploy that changes code.** It is one hashed
   entry chunk, so any change to student or shared code renames it. That is ~158 KiB per student
   per code deploy (10 of 13 here), from the CDN. No chunk rule changes it short of splitting
   React and the other libraries out of the entry, which §5 P-7 says re-anchors the size gate.

**What a correct split would buy:** about 230 KiB per code deploy, per teacher, on staff devices
with a warm cache. That is modest. Against it: a manualChunks rule that must be made shell-safe
through the module graph, a stable-exports cost of ~1–6 KiB gz across the editor chunks, and a new
way for a rule change to cost students 200 KiB.

| # | Decision | Recommendation |
|---|---|---|
| **T7-1** | Build TR9, made shell-safe and with stable exports? | **No, close T7 here.** The saving is real but small for teachers. The simple version is unsafe for students, and the safe version is complexity a teacher would not notice. **Re-measure trigger:** a teacher reports the editor being slow to open after updates, or deploys become several a day during term. The script is committed for that |
| **T7-2** | Students re-download the shell (~158 KiB) on each code deploy. Once classes start (~Feb 2027), push to `main` outside school hours in both NZ and US time zones? | **Yes, as a working norm, not a guard.** It costs nothing and keeps the re-download off a class's shared Wi-Fi mid-lesson. It also keeps the service worker's "new version" notice from interrupting a lesson. Recorded in STATE. A CI-time check would be the wrong lever |
