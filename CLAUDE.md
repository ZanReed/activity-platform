# CLAUDE.md

Rules and orientation for AI sessions on this repo. Read `STATE.md` next — it is the "where am I" snapshot (pending author actions, current focus, next steps).

## Doc map

- **README.md** — durable orientation: packages, commands, architecture invariants, the add-a-block-type checklist.
- **STATE.md** — current status. Update at end of session (replace, don't append; keep under ~150 lines). Move finished-work narratives to `docs/HISTORY.md`.
- **ROADMAP.md** — long-term phases. STATE wins over ROADMAP; code wins over both.
- ~~packages/renderer/RUNTIME.md~~ — DEAD at S9 Drop 4 with the renderer package (published pages no longer exist; the viewer at `/a/:id` is the only student surface).
- **docs/DECISIONS.md** — architecture decisions + reasoning, by area. Check before re-deciding anything.
- **docs/HISTORY.md** — archived completed-work logs.
- **docs/COLLABORATION.md** — working-with-the-author notes.
- **docs/design/** — feature designs (print/printables, calculator tool, interactive graph, variable block sizing, vocabulary definitions, PDF import, photo grading, free activity catalog). The two FLOATING TOOLS have their own newer docs, and they outrank `calculator-tool.md` on anything about the student surface: [floating-tool-cluster.md](docs/design/floating-tool-cluster.md) (the calculator's summon + the feature-scope ruling) and [reference-panel-screen-surface.md](docs/design/reference-panel-screen-surface.md).
- **docs/markdown-import-format.md** — the format the paste-markdown importer accepts (the contract a teacher or an AI assistant writes to; shared target for the future PDF import). Mirrors `packages/app/src/lib/markdownToTiptap.ts` + the copy-paste prompt in `markdownImportPrompt.ts`.
- **supabase/functions/README.md**, **supabase/migrations/README.md** — Edge Function and DB setup/deploy reference.

## Commands

**`pnpm verify`** — CI's whole `check` job in one command (typecheck · lint · test · build · perf budgets · budget script tests · both bundle-drift checks); `--bail` stops at the first failure. **Run it before handing off — "green here" means "green in CI's check job".** It prints the browser lanes it does NOT cover. · `pnpm test` (all packages) · `pnpm typecheck` · `pnpm build` · `pnpm bundle:viewer-server` / `pnpm bundle:grading-server` (the two committed Edge Function bundles) · `pnpm --filter @activity/<pkg> <cmd>` for one package.

## Division of labor (Claude vs author)

- **Never `git push`.** The author always pushes. Committing locally when work is done and verified is fine.
- **Check `git branch --show-current` is `main` before committing.** Parallel sessions share this one checkout, so HEAD may not be where the last session left it. If a session deliberately works on a branch, it fast-forwards/merges back to `main` before session end — a branch left checked out strands the NEXT session's commits on it (this happened: 12 commits quietly landed on a stale feature branch, discovered only at push time).
- **The author runs all deploys and migrations** (`supabase functions deploy …`, `supabase db push`, dashboard changes). Claude prepares the change, then records it under "Pending author actions" in STATE.md.
- **`get-activity` is the ONLY function deployed with `--no-verify-jwt`** — its anonymous branch is the viewer's 3.2A pre-auth meta endpoint (no Authorization header; the platform's default `verify_jwt` gate would 401 it before the function runs). Deploy it with `pnpm deploy:get-activity`. **The old "anonymous trio" is DEAD (S9 Drops 1+3, 2026-08-14): `publish-activity`, `ingest-submission`, and `get-feedback` were deleted from the platform** — publish is a direct `publish_activity` RPC from `usePublish`, and the published-page submission wire was demolished whole (0029). Their `deploy:*` scripts and `deploy:train` died with them (OV-DX-2: a deploy script is a resurrection path). **`supabase/config.toml` remains the authoritative record of every surviving function's flag** (policy P6 — a decision recorded only in an npm script is not recorded); the CLI reads it on deploy. The deleted functions' source dirs were removed at Drop 4 — `supabase/functions/` now holds only get-activity + check-activity, so nothing is left to resurrect. **`check-activity` (S4 grading) stays `verify_jwt:true`** — a check is always made by a signed-in student, so the platform gate is a free first line of defense; deploy with `pnpm deploy:check` and never add `--no-verify-jwt`. **Verify live flags with `list_edge_functions` after every deploy.** (There is no `upload-image` function — the editor uploads images straight to the `activity-images` Storage bucket under 0019's RLS INSERT policy.)
- **When a function change calls a NEW database function: apply the migration BEFORE deploying the function.** Same family as the two ordering rules below, learned the same way (2026-08-04, S7): `get-activity` v8 shipped ahead of 0026, so its cache-fill path called a `write_version_census` RPC that did not exist yet. The blast radius was small only because that call site was already designed to fail safe (it withholds the read-cache row and still serves the student a correct 200, so the failure self-heals once the migration lands) — a call site without that property would have been a live 500. The reverse order is never needed: a migration that adds a function nothing calls yet is inert.
- **The migration-before-deploy rule GENERALIZES to the SPA (OV-7, eng-ruled 2026-08-12):** Cloudflare Pages auto-deploys from `main`, so **UI that calls a NEW table or RPC is pushed only AFTER its migration is applied live** — a push is a deploy. (This replaced the old ingest-before-republish wire rule, which died with the anonymous wire at Drop 3.)
- **[TOMBSTONE, S9 Drops 1–4, 2026-08-14] The renderer world is GONE: `packages/renderer`, its runtime, `bundle:renderer`, the renderer CI drift step, `_shared/renderer.bundle.js`, the graph-kit manifest, and the R2 upload-ordering rule all died with published pages.** The viewer + editor build the graph kit from the workspace — no upload is ever needed for kit changes. **The D-13 teardown ran 2026-08-15:** the R2 scripts (`build:graph-kit`, `upload:graph-kit`, `build:fonts`, `build:mathlive-fonts`), their script files, and `.env.r2`(+example) are DELETED (the build half was already broken — its manifest target died at Drop 4); the bucket's 283-object archive is `r2-final-backup-20260815/` (untracked, repo root). MathLive fonts self-host in the app bundle via the `activity:mathlive-fonts` vite plugin (version-guarded — the build fails if `MATHLIVE_VERSION` drifts from the installed package). Only the dashboard steps (secrets unset, `ALLOWED_ORIGINS` shrink, bucket delete) remain author-side.
- **After any change to `packages/viewer/src/server/`, the grading engine, or graph-kit's scorers: run `pnpm bundle:grading-server` and commit the bundle in the same commit.** Third bundle, same discipline (CI fails on drift). It is SEPARATE from the viewer-server bundle on purpose: grading carries the math engine, and folding it into the read path would make every activity OPEN pay the grader's cold start. If the change must reach live checking, flag the `check-activity` redeploy (`pnpm deploy:check` — **no** `--no-verify-jwt`) as a pending author action.
- **Import graph-kit SUBPATHS, never the package barrel, in anything that runs outside a browser** (Edge Function, node script, bundled seam). The barrel re-exports the mount functions and the LaTeX bridge, which pull JSXGraph and MathLive. Two different failures so far, and the rule was written too narrowly the first time: (1) *size* — importing scorers through the barrel put 1 MB of MathLive into the grading Edge Function (caught by the bundle's size ceiling; the server needs no LaTeX at all, the graded form is already ascii, MA-D3); (2) *node resolution* — `lib/markdownToTiptap.ts` and `editor/mathPromptSync.ts` reached the barrel, whose transitive `import { MathfieldElement } from 'mathlive'` **does not exist** in mathlive's node/SSR build, so any `platform: 'node'` bundle of the import pipeline died with 4 hard errors (batch importer, 2026-08-20). **Vitest does not catch this** — it resolves through Vite, which takes mathlive's browser condition and externalizes `node_modules`, so the app suite was green about a path that could not run. Subpaths live in `packages/graph-kit/package.json`'s `exports` map; add one rather than reaching through `.`.
- **After any change to schema or the viewer's sanitize/registry source: run `pnpm bundle:viewer-server` and commit the bundle in the same commit.** CI fails on drift. If the change must reach the live read API, flag the `get-activity` redeploy (`pnpm deploy:get-activity`) as a pending author action — a sanitize-spec change also changes `SANITIZER_REV`, which orphans the read cache's stale rows automatically once the new function is live.

## Working style

- Best-practice over shortcut; ask before assuming on anything ambiguous; give rationale alongside actions; skip ceremony.
- Design pass → green light → code drop: before large changes, surface the real decisions as a numbered list and wait for the author's yes/no per item.
- UX is a priority: performance budget, optimistic autosave, visible state indicators, predictable shortcuts.
- More in `docs/COLLABORATION.md`.

## Session close-out (run before you hand back; ~2 minutes)

Four questions, **scoped to what THIS session changed** — not a repo sweep. The
full drift audit is a net for what slips through; this is the part that keeps
things from slipping in the first place, and it is cheap enough to run always.

Answer each out loud in the final message, including "n/a":

1. **Added or changed a schema field?** Grep it against
   `packages/viewer/src/blocks/`, `container/`, and the print CSS. A field read
   only by the editor, only by `serialize.ts`, or only by its own tests is an
   ORPHAN — the repo's most expensive defect class (eight instances now: the
   registry `numbered` set, `LABELED_BLOCK_TYPES`, block `workSpace`,
   `Row.gridLines`, fence `**bold**`, `showCellLabels`, `hasConfidenceRating`,
   `allowTargetReuse`). Wire it with a guard bound to RENDERED OUTPUT — and mutation-test the guard once by reverting the wiring and watching it go red — or do not add the field.
2. **Touched a migration, a deploy, or a version constant?** Re-read STATE's
   baseline row live — `list_edge_functions` for flags+versions (the `version`
   field, NOT the `entrypoint_path` suffix) and
   `select count(*) from supabase_migrations.schema_migrations` for the range.
   That row went three migrations and two function versions stale while telling
   readers "never claim-read".
3. **Deleted or retired anything?** Grep the repo for surviving references —
   docs, comments, scripts, skills. A deletion leaves its declarations behind,
   and a doc naming a dead mechanism reads as live forever (S9 left five docs
   citing `RUNTIME.md`, two with broken links, for eight days).
4. **STATE still honest?** Links resolve, under ~150 lines, no fact stated twice
   with two different numbers, and no standing rule parked in a section that
   gets replaced next session — those belong HERE, in CLAUDE.md.

**Run the FULL `/drift-audit` on a trigger, not a schedule** — its own trigger
list is in the skill. Running it every session is the wrong lever: a check that
reports "clean" eight times running stops being read, and the ninth is the one
that mattered.

## Verification policies (ratified 2026-08-06, eng review — rationale in DECISIONS.md → "Eleven verification policies")

P1. **A primitive is not delivered until something calls it** — ship the caller or a tracked xfail; enforced by `scripts/tests/export-reachability.test.mjs` (s1/s3/s4/s6 retros, 8+ instances).
P2. **E2E route mocks derive from production constants, never retyped** — or document why they diverge (s4:7 — the check-URL bug was invisible to its own test).
P3. **Dormant safeguards need a liveness proof, at production values** — force every throttle/quota/gate to fire once before crediting it (s2:1, s4a, s8a — three generations of the gap).
P4. **Rosters are derived or cross-checked, never merely written** (s0/s5 — the derived roster never drifted; the written one drifted in three days).
P5. **Retiring a guard requires auditing every comment that cites it**; a ported copy's bond must outlive the port's timeline assumption (s5.5:8/9 — S9's renderer deletion runs this as a claims-grep).
P6. **Deploy-time flags live in declarative config with a verification step** — a decision recorded only in an npm script is not recorded (s2a; `supabase/config.toml` is the instance).
P7. **A verification script that writes durable rows owns its residue end-to-end** — run-scoped cleanup, printed before and after, co-readers named (s4a/s7a — the S4 residue silently vacated verify-0022 C1).
P8. **Review-time promises go on a tracked checklist with an owner slice** — never only in prose (s1/s3 — the DX boomerang and the pre-S8 a11y pass rotted silently).
P9. **When a check's headline lesson is "this was vacuous," re-run that lesson over the fix** (s8a — the fix for the vacuous route smoke shipped its own vacuity).
P10. **Re-derive plans against shipped reality before building** (s7 — the arc's cheapest corrections came from pre-build re-derivation).
P11. **Comments asserting counts or coverage are claims — guard them or don't make them** (s3/s4 — "the one cast" above 24 casts; the corpus's phantom case).

## Standing constraints

- **[TOMBSTONE, S9 Drop 4 2026-08-14] The renderer/runtime constraint set is RETIRED with `packages/renderer`** (pure-renderer, render()-only-mutator, init.ts-only-walker, STORAGE_SCHEMA_VERSION bumps, no-deps single-file runtime, the data-attribute contract). Their surviving principles live in the viewer's own discipline: server-authoritative grading, `BlockState`-style reveal gating in the viewer store, and the perf budgets in `scripts/perf-budgets.mjs`.
- **`noUncheckedIndexedAccess` stays on.** It catches real bugs; never disable to silence index-access errors. Use `?.` and `?? default` instead.
- **⚠ TWO SUPABASE SUB-CLIENTS ARE ALIASED TO STUBS — `supabase.channel()` and `supabase.storage.from()` THROW.** `resolve.alias` in `packages/app/vite.config.ts` redirects `@supabase/realtime-js` and `@supabase/storage-js` to inert shells in `packages/app/src/lib/supabase-stubs/` (2026-08-18, shell-slimming slice 1 — [shell-slim-supabase.md](docs/design/shell-slim-supabase.md)); it took the student shell 177.6 → 156.4 KiB gz. Auth, PostgREST and Functions are untouched. Three consequences worth knowing before you debug one of them: (1) **the alias is runtime-only, so TypeScript still autocompletes both as fully working** — your first signal is the throw, not a squiggle; (2) **image upload is raw `fetch` in `lib/uploadImage.ts`**, which sends BOTH `apikey` and `Authorization` because supabase-js used to add `apikey` invisibly — but the gate is the **session token** plus 0019's `to authenticated` INSERT policy, not the apikey (measured 2026-08-18: an apikey-less upload succeeds against the local stack, correcting the review's claim that it would 401); (3) **`@supabase/supabase-js` is pinned EXACT** because the stubs mirror internals — `scripts/tests/supabase-stub-pin.test.mjs` fails the build if the pin, the `AUDITED AGAINST:` line in each stub, and the installed version stop agreeing. Un-stub deliberately at the realtime-push arc, not by deleting the alias to make a throw go away.
- **Best-practice over shortcut.** Default preference; ask before substituting.
- **Ask before assuming on anything ambiguous.** Explicit working-style instruction.
- **UX is a priority** — performance budget, optimistic autosave, visible state indicators, predictable shortcuts.
- **Baseline print CSS.** Activities must look reasonable on paper out of the box: hide interactive controls, `break-inside: avoid` on problems with `break-before: auto` on sections, neutralize blanks back to bare underlines, encode callout variants in border style (solid/dashed/double/dotted) so they survive grayscale, `@page { margin: 0.5in }`.
- **Editor popover: single host, mount on selection.** Per-chip popover mounting broke editor behavior (Drop 1 attempt). Single `BlankPopoverHost` at editor root with selection-driven `BlankEditPopover` mount/unmount is the correct architecture; don't reintroduce per-chip mounting.
- **[TOMBSTONE, S9 Drop 1 2026-08-14] Publishing no longer produces HTML anywhere.** Publish is a `publish_activity` RPC snapshotting the draft into `activity_versions`; students open the viewer at `/a/:id`. The old rule ("published HTML lives on Cloudflare R2 — Supabase rewrites `text/html` to text/plain on free tier") stays true as a hosting fact for any future static HTML, and the pre-existing R2 test pages survive until the D-13 bucket teardown.

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- *(A dozen runtime/renderer prohibitions stood in this list until S9 Drop 4 — DOM-mutation discipline, data-attribute contract, STORAGE_SCHEMA_VERSION, runtime size budget. They died with `packages/renderer`; git history has them if a static-HTML surface ever returns.)*
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed.
- Don't write RLS policies that inline ownership checks — call the helpers.
- Don't conflate ProseMirror selection state (`selected`) with React UI state (`editing`) in NodeViews. Mixing them causes the "input deselects after one keystroke" class of bug.
- Don't regress flowing-water UX as features land — performance budget, optimistic autosave, visible state indicators, predictable shortcuts. Flag friction risks proactively.
- Don't mix `@tiptap/*` package versions. Update the family together.
- Don't trust the client's `attempt_number`. Server derives from `max + 1` and returns it canonically.
- Don't reveal solutions before a section is checked. The server decides what a check returns (answers never reach clients pre-check); the viewer store gates the reveal.
- Don't disable `noUncheckedIndexedAccess`. Fix the call sites with `?.` chaining instead.
- Don't widen `BlankResponse.answer` to a union type. When a new response category (MC, ordering, file upload, etc.) lands, it gets its own parallel map on `SubmissionResponses`.
- Don't bake math-specific assumptions into shared block vocabulary. Name by shape (`numeric_input` not `physics_quantity`).
- Don't pre-build Stripe / subscription / billing infrastructure. Phase 4+ work.
- Don't paywall Phase 1 features under any circumstance.
- Don't add real-time usage counters to the hot path. Aggregate from `audit_log` via materialized views or scheduled jobs.
- Don't diff serialized `ActivityDocument`s for change detection. `tiptapToActivity` mints fresh UUIDs per call; fingerprint Tiptap JSON instead.
- **Don't reintroduce per-chip BlankEditPopover mounting.** Drop 1 of Stage 13.5 attempted this and broke widespread editor behavior. The single-host pattern at editor root with selection-driven mount/unmount is the correct architecture.
- **Don't bypass `flushAll()` on popover close paths.** The lost-edit-on-immediate-close bug returns if any close path skips it.
- **Don't change `updateBlankAttrs` to always preserve OR always release selection.** The optional `preserveSelection` flag exists because edit-time (preserve to keep popover open) and close-time (release so onClose can move selection cleanly) have opposite requirements.
- **Don't import the SectionBreak NodeView's title input or checkpoint state into the toolbar's Section button logic.** Inline UI handles section properties; the toolbar button just inserts.
- **Don't put `defining: true` on FillInBlank.** It fixes the empty-block-disappearing-on-sentinel bug as a side effect but breaks drag-reorder asymmetrically — later blocks can't move above earlier ones because `defining: true` doubles as `definingAsContext`, which preserves drag-source context too aggressively. Use `definingForContent: true` instead, which targets only the destination-side preservation that the input-rule case actually needs.
- **Don't try to serve HTML from any `*.supabase.co` URL.** Supabase's anti-abuse policy rewrites `text/html` responses to `text/plain` with a sandbox CSP that blocks all script execution, on both Storage and Edge Functions. Documented at https://supabase.com/docs/guides/functions/limits. Only exception is Pro-plan custom domains. (Durable hosting fact — kept even though nothing serves published HTML since S9; any future static HTML goes on a non-Supabase host.)
- **Don't put the publish button in the editor toolbar.** Publish is an activity-level action; the toolbar is for editor-formatting controls. It belongs in the page header next to `SaveIndicator`.
- **Don't schedule or arm `prune_section_checks` — it is the only function in this repo that deletes student work, and nothing mechanical stops it any more.** Migration 0035 shipped it disarmed behind a schema gate (it refused every row while `analytics_job_runs.rolled_through` was NULL); **0036 writes that watermark nightly, so the gate is GONE.** What holds it back now is only that it is unscheduled and dry-run by default — `prune_section_checks(false)` on a cron really deletes superseded check attempts. Arming is an eight-step checklist in TODOS.md ("The check-rollup ARMING arc") whose blocking steps include **counsel question Q10** and **N green nights of a non-drifting reconciliation pair**. Read the checklist, not a summary of it; and never treat 0035's "mechanically inert" language as still current.
- **Don't let the compliance pack drift behind a migration that touches personal data.** When a migration adds/removes a personal-data column or a table holding student-derived rows, `docs/compliance/data-map.md` and `docs/compliance/retention-policy.md` are part of that migration's commit — both carry their own version stamps, and both are read by counsel rather than by tests. **`scripts/tests/data-map-coverage.test.mjs` enforces the data-map half** (it sweeps the migrations for person-referencing columns and fails if a table is undocumented, or if the doc's stated migration range falls behind); the **retention-policy half is still prose-only**, so it is a rule here. Do NOT satisfy a failure with a skip list — the doc IS the list. (Drift audit 2026-08-17: retention-policy asserted a production fact that a scheduled job invalidated hours later, and data-map had been silently missing a student-name column since 0001.)
- **Never seed a CONSUMER domain (`gmail.com`, `outlook.com`, …) into `student_domain`.** One row admits every Google account on earth as a student — the domain fast path is for district domains only. (Stood only in STATE's Gate-4 paragraph until the 2026-08-22 audit; STATE sections get replaced.)
- **Don't edit a file-backed activity in the app — edit its `.md`.** The batch importer (0039 fingerprint) refuses a file whose draft was hand-edited since its last import and names it; `--force` overrides deliberately. And **publishing clears the draft** (`publish_activity` sets `draft_content = null`), so a published activity with no draft is up to date, not stale — the thing that made the first `report:stale` wrong. Format + traps: `docs/markdown-import-format.md`.
- **Don't use raw object-storage URLs for student-facing links.** Since S9 Drop 1 the share link is the viewer URL `${origin}/a/${activityId}` (built by `PublishStatus`/`viewerShareUrl`). Don't hand students a storage path, a versioned path, or a backend URL — all wrong abstractions for sharing.

## gstack

[gstack](https://github.com/garrytan/gstack) is installed at `~/.claude/skills/gstack`.

- **Use the `/browse` skill from gstack for all web browsing.** It is a fast headless browser for QA testing, dogfooding, and any web navigation.
- **Never use `mcp__claude-in-chrome__*` tools.** Route all browser interaction through `/browse` (or the other gstack browser skills) instead.

Available skills (a subset — `ls ~/.claude/skills/gstack` is the roster): `/context-save`, `/context-restore`, `/spec`, `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
