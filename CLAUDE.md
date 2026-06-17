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
- **docs/design/** — feature designs (print/printables, interactive graph, vocabulary definitions, PDF import, photo grading, free activity catalog).
- **docs/markdown-import-format.md** — the format the paste-markdown importer accepts (the contract a teacher or an AI assistant writes to; shared target for the future PDF import). Mirrors `packages/app/src/lib/markdownToTiptap.ts` + the copy-paste prompt in `markdownImportPrompt.ts`.
- **supabase/functions/README.md**, **supabase/migrations/README.md** — Edge Function and DB setup/deploy reference.

## Commands

`pnpm test` (all packages) · `pnpm typecheck` · `pnpm build` · `pnpm bundle:renderer` (regenerates `supabase/functions/_shared/renderer.bundle.js` + `runtime-bundle.ts`) · `pnpm --filter @activity/<pkg> <cmd>` for one package.

## Division of labor (Claude vs author)

- **Never `git push`.** The author always pushes. Committing locally when work is done and verified is fine.
- **The author runs all deploys and migrations** (`supabase functions deploy …`, `supabase db push`, dashboard changes). Claude prepares the change, then records it under "Pending author actions" in STATE.md.
- **`ingest-submission` must always be redeployed with `--no-verify-jwt`.** There is no `config.toml`; the flag lives only on the Supabase platform and a plain redeploy silently re-enables JWT verification, 401-ing anonymous student submissions.
- **After any change to schema, renderer, or runtime source: run `pnpm bundle:renderer` and commit the bundle in the same commit.** If the change must reach published pages, flag the `publish-activity` redeploy as a pending author action.

## Working style

- Best-practice over shortcut; ask before assuming on anything ambiguous; give rationale alongside actions; skip ceremony.
- Design pass → green light → code drop: before large changes, surface the real decisions as a numbered list and wait for the author's yes/no per item.
- UX is a priority: performance budget, optimistic autosave, visible state indicators, predictable shortcuts.
- More in `docs/COLLABORATION.md`.

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
- **Runtime persistence schema bumps with shape changes.** `STORAGE_SCHEMA_VERSION` is currently 2 (bumped from 1 when `BlankState` dropped `hintRevealed`). If `BlankState`, `BlockState`, `SectionState`, or the blob shape changes incompatibly, bump it. Load returns null on mismatch → fresh state.
- **Editor popover: single host, mount on selection.** Per-chip popover mounting broke editor behavior (Drop 1 attempt). Single `BlankPopoverHost` at editor root with selection-driven `BlankEditPopover` mount/unmount is the correct architecture; don't reintroduce per-chip mounting.
- **Published HTML lives on Cloudflare R2.** Supabase Storage cannot serve HTML on free tier (rewritten to text/plain). Same restriction applies to Edge Functions. R2 is the destination; the Supabase Edge Function uploads to R2 instead of Supabase Storage.

## Things NOT to do

- Don't migrate old GitHub-Pages activities into the new system. Greenfield by design.
- Don't add fields to the schema speculatively. YAGNI; migrations are cheap when needed.
- Don't put auth or DB code in the renderer. Package boundary is the discipline.
- Don't write RLS policies that inline ownership checks — call the helpers.
- Don't conflate ProseMirror selection state (`selected`) with React UI state (`editing`) in NodeViews. Mixing them causes the "input deselects after one keystroke" class of bug.
- Don't add MathLive to published HTML in Phase 1. That's a Phase 2.5 decision.
- Don't regress flowing-water UX as features land — performance budget, optimistic autosave, visible state indicators, predictable shortcuts. Flag friction risks proactively.
- Don't mix `@tiptap/*` package versions. Update the family together.
- Don't make breaking changes to the runtime data-attribute contract. Add new attributes; never rename or remove existing ones.
- Don't import `@activity/schema` from the runtime. Parallel types are deliberate; 20KB budget rules out Zod. Wire format is the contract.
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
- **Don't use raw object-storage URLs for student-facing links.** Publish-activity returns the R2 public URL with the activity-id path. Don't bypass that and hand students a versioned path or a backend URL — both are wrong abstractions for sharing.
