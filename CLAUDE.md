# CLAUDE.md

Rules and orientation for AI sessions on this repo. Read `STATE.md` next — it is the "where am I" snapshot (pending author actions, current focus, next steps).

## Doc map

- **README.md** — durable orientation: packages, commands, architecture invariants, the add-a-block-type checklist.
- **STATE.md** — current status. Update at end of session (replace, don't append; keep under ~150 lines). Move finished-work narratives to `docs/HISTORY.md`.
- **ROADMAP.md** — long-term phases. STATE wins over ROADMAP; code wins over both.
- **packages/renderer/RUNTIME.md** — published-page runtime architecture and the data-attribute contract (a public API; additive changes only).
- **docs/DECISIONS.md** — architecture decisions + reasoning, by area. Check before re-deciding anything.
- **docs/HISTORY.md** — archived completed-work logs.
- **docs/COLLABORATION.md** — working-with-the-author notes.
- **docs/design/** — feature designs (print/printables, calculator tool, interactive graph, variable block sizing, vocabulary definitions, PDF import, photo grading, free activity catalog).
- **docs/markdown-import-format.md** — the format the paste-markdown importer accepts (the contract a teacher or an AI assistant writes to; shared target for the future PDF import). Mirrors `packages/app/src/lib/markdownToTiptap.ts` + the copy-paste prompt in `markdownImportPrompt.ts`.
- **supabase/functions/README.md**, **supabase/migrations/README.md** — Edge Function and DB setup/deploy reference.

## Commands

`pnpm test` (all packages) · `pnpm typecheck` · `pnpm build` · `pnpm bundle:renderer` (regenerates `supabase/functions/_shared/renderer.bundle.js` + `runtime-bundle.ts`) · `pnpm --filter @activity/<pkg> <cmd>` for one package.

## Division of labor (Claude vs author)

- **Never `git push`.** The author always pushes. Committing locally when work is done and verified is fine.
- **Check `git branch --show-current` is `main` before committing.** Parallel sessions share this one checkout, so HEAD may not be where the last session left it. If a session deliberately works on a branch, it fast-forwards/merges back to `main` before session end — a branch left checked out strands the NEXT session's commits on it (this happened: 12 commits quietly landed on a stale feature branch, discovered only at push time).
- **The author runs all deploys and migrations** (`supabase functions deploy …`, `supabase db push`, dashboard changes). Claude prepares the change, then records it under "Pending author actions" in STATE.md.
- **`get-activity` is the ONLY function deployed with `--no-verify-jwt`** — its anonymous branch is the viewer's 3.2A pre-auth meta endpoint (no Authorization header; the platform's default `verify_jwt` gate would 401 it before the function runs). Deploy it with `pnpm deploy:get-activity`. **The old "anonymous trio" is DEAD (S9 Drops 1+3, 2026-08-14): `publish-activity`, `ingest-submission`, and `get-feedback` were deleted from the platform** — publish is a direct `publish_activity` RPC from `usePublish`, and the published-page submission wire was demolished whole (0029). Their `deploy:*` scripts and `deploy:train` died with them (OV-DX-2: a deploy script is a resurrection path). **`supabase/config.toml` remains the authoritative record of every surviving function's flag** (policy P6 — a decision recorded only in an npm script is not recorded); the CLI reads it on deploy. While the deleted functions' source dirs still sit in `supabase/functions/` (they die at the Drop 4 sweep), deploy functions BY NAME — a bare `supabase functions deploy` deploys the whole directory and would resurrect them. **`check-activity` (S4 grading) stays `verify_jwt:true`** — a check is always made by a signed-in student, so the platform gate is a free first line of defense; deploy with `pnpm deploy:check` and never add `--no-verify-jwt`. **Verify live flags with `list_edge_functions` after every deploy.** (There is no `upload-image` function — the editor uploads images straight to the `activity-images` Storage bucket under 0019's RLS INSERT policy.)
- **When a function change calls a NEW database function: apply the migration BEFORE deploying the function.** Same family as the two ordering rules below, learned the same way (2026-08-04, S7): `get-activity` v8 shipped ahead of 0026, so its cache-fill path called a `write_version_census` RPC that did not exist yet. The blast radius was small only because that call site was already designed to fail safe (it withholds the read-cache row and still serves the student a correct 200, so the failure self-heals once the migration lands) — a call site without that property would have been a live 500. The reverse order is never needed: a migration that adds a function nothing calls yet is inert.
- **On any submission wire-format (`schemaVersion`) bump: redeploy `ingest-submission` BEFORE republishing any activity.** A page publishing the new wire POSTs a version the live ingest rejects (400) until ingest is redeployed. Ingest keeps accepting older wire versions, so the reverse order is never needed.
- **[TOMBSTONE, S9 Drop 1 2026-08-14] The graph-kit R2 upload ordering rule is DEAD with `publish-activity`.** The rule was: upload the kit first, then redeploy publish-activity (the function resolved kit hashes from the committed manifest). No function reads the manifest for new publishes anymore; the R2 kit machinery (`upload:graph-kit`, the manifest, `.env.r2`) dies wholesale at the D-13 teardown. The viewer + editor build the kit from the workspace — no upload is ever needed for kit changes.
- **After any change to schema, renderer, or runtime source: run `pnpm bundle:renderer` and commit the bundle in the same commit.** (CI still fails on drift; the bundle's remaining consumers are ingest-submission + get-feedback, both deleted at Drop 3 — the whole renderer discipline dies at Drop 4. The old "flag the publish-activity redeploy" step is DEAD: that function was deleted at S9 Drop 1.)
- **After any change to `packages/viewer/src/server/`, the grading engine, or graph-kit's scorers: run `pnpm bundle:grading-server` and commit the bundle in the same commit.** Third bundle, same discipline (CI fails on drift). It is SEPARATE from the viewer-server bundle on purpose: grading carries the math engine, and folding it into the read path would make every activity OPEN pay the grader's cold start. If the change must reach live checking, flag the `check-activity` redeploy (`pnpm deploy:check` — **no** `--no-verify-jwt`) as a pending author action.
- **Import graph-kit's scorers from `@activity/graph-kit/scorers`, never from the package barrel, in anything server-side.** The barrel re-exports the mount functions and the LaTeX bridge, which pull JSXGraph and MathLive; going through it put 1 MB of MathLive into the grading Edge Function (caught by the bundle's size ceiling). The server needs no LaTeX at all — the graded form is already ascii (MA-D3).
- **After any change to schema or the viewer's sanitize/registry source: run `pnpm bundle:viewer-server` and commit the bundle in the same commit.** Same discipline as the renderer bundle (CI fails on drift). If the change must reach the live read API, flag the `get-activity` redeploy (`pnpm deploy:get-activity`) as a pending author action — a sanitize-spec change also changes `SANITIZER_REV`, which orphans the read cache's stale rows automatically once the new function is live.

## Working style

- Best-practice over shortcut; ask before assuming on anything ambiguous; give rationale alongside actions; skip ceremony.
- Design pass → green light → code drop: before large changes, surface the real decisions as a numbered list and wait for the author's yes/no per item.
- UX is a priority: performance budget, optimistic autosave, visible state indicators, predictable shortcuts.
- More in `docs/COLLABORATION.md`.

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

- **Pure renderer.** `@activity/renderer` is JSON-in, HTML-string-out. No I/O, no environment reads at render time. The runtime is the exception that proves the rule — its text is baked in at build time as a string constant.
- **`noUncheckedIndexedAccess` stays on.** It catches real bugs; never disable to silence index-access errors. Use `?.` and `?? default` instead.
- **Best-practice over shortcut.** Default preference; ask before substituting.
- **Ask before assuming on anything ambiguous.** Explicit working-style instruction.
- **UX is a priority** — performance budget, optimistic autosave, visible state indicators, predictable shortcuts.
- **Renderer bundle commits with the source it supports.** After any change to schema, renderer, or runtime source, run `pnpm run bundle:renderer`; commit the bundle in the same commit. CI (`.github/workflows/ci.yml`) regenerates the bundle on push/PR and fails if it drifts from the committed files, so a stale bundle can't reach a deploy.
- **Baseline print CSS.** Activities must look reasonable on paper out of the box: hide interactive controls, `break-inside: avoid` on problems with `break-before: auto` on sections, neutralize blanks back to bare underlines, encode callout variants in border style (solid/dashed/double/dotted) so they survive grayscale, `@page { margin: 0.5in }`.
- **Runtime: `render(state, refs)` is the only DOM mutator after init.** Every event handler writes to state, then calls `onUpdate` (which runs render + persist). The single permitted exception is `applyStoredState` setting `input.value` during bootstrap restoration, before the initial render runs.
- **Runtime: `init.ts` is the only DOM walker.** All `querySelector` / `querySelectorAll` against arbitrary subtrees happen during init. Downstream consumes typed refs.
- **Runtime persistence schema bumps with shape changes.** The current `STORAGE_SCHEMA_VERSION` lives in `packages/renderer/src/runtime/storage.ts` — check the file, don't trust a number written in a doc (this bullet once said "3" while the code said 6). If `BlankState`, `BlockState`, `McBlockState`, `GraphBlockState`, `SectionState`, or the blob shape changes incompatibly, bump it. Load returns null on mismatch → fresh state.
- **Editor popover: single host, mount on selection.** Per-chip popover mounting broke editor behavior (Drop 1 attempt). Single `BlankPopoverHost` at editor root with selection-driven `BlankEditPopover` mount/unmount is the correct architecture; don't reintroduce per-chip mounting.
- **[TOMBSTONE, S9 Drop 1 2026-08-14] Publishing no longer produces HTML anywhere.** Publish is a `publish_activity` RPC snapshotting the draft into `activity_versions`; students open the viewer at `/a/:id`. The old rule ("published HTML lives on Cloudflare R2 — Supabase rewrites `text/html` to text/plain on free tier") stays true as a hosting fact for any future static HTML, and the pre-existing R2 test pages survive until the D-13 bucket teardown.

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed.
- Don't put auth or DB code in the renderer. Package boundary is the discipline.
- Don't write RLS policies that inline ownership checks — call the helpers.
- Don't conflate ProseMirror selection state (`selected`) with React UI state (`editing`) in NodeViews. Mixing them causes the "input deselects after one keystroke" class of bug.
- Don't add MathLive to published HTML *eagerly*. The deferred "Phase 2.5 decision" was resolved in Phase 2.7: MathLive reaches published pages only inside the lazy-loaded graph-kit bundle (fetched on calculator open). It never joins the inlined runtime or the base page weight.
- Don't regress flowing-water UX as features land — performance budget, optimistic autosave, visible state indicators, predictable shortcuts. Flag friction risks proactively.
- Don't mix `@tiptap/*` package versions. Update the family together.
- Don't make breaking changes to the runtime data-attribute contract. Add new attributes; never rename or remove existing ones.
- Don't import `@activity/schema` from the runtime. Parallel types are deliberate; the runtime size budget (`RUNTIME_SIZE_TARGET`/`RUNTIME_SIZE_CEILING` in `scripts/perf-budgets.mjs` — the ONE home for every size number, D5; don't restate values here) rules out Zod. Wire format is the contract.
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
- **Don't use raw object-storage URLs for student-facing links.** Since S9 Drop 1 the share link is the viewer URL `${origin}/a/${activityId}` (built by `PublishStatus`/`viewerShareUrl`). Don't hand students a storage path, a versioned path, or a backend URL — all wrong abstractions for sharing.

## gstack

[gstack](https://github.com/garrytan/gstack) is installed at `~/.claude/skills/gstack`.

- **Use the `/browse` skill from gstack for all web browsing.** It is a fast headless browser for QA testing, dogfooding, and any web navigation.
- **Never use `mcp__claude-in-chrome__*` tools.** Route all browser interaction through `/browse` (or the other gstack browser skills) instead.

Available skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`.

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
