# COLLABORATION.md

Working-with-the-author notes for AI sessions, moved from STATE.md. Some items date from the chat-paste era (before direct file editing) — kept for the lessons, even where the delivery mechanics no longer apply.

## Working with the author (notes for the next AI session)

Solo dev: Dallas ISD Algebra II teacher, working-level JS/Python, learning systems engineering as the project progresses. Engages with the *why* behind a choice; lean toward giving rationale alongside the action. Skip ceremony — no "great question," no "happy to help" wrappers. Best-practice-over-shortcut is the default, "ask before assuming" is an explicit standing instruction, UX-as-priority is also explicit.

Specific friction patterns where unstated assumptions have caused loops:

- **Git workflow isn't automatic.** Lay out `git add <paths>` → `git status` (verify) → `git commit` → `git push` as separate steps.
- **Git command batches skip the verify step.** When the four steps get pasted as a single shell line, the `git status` output flies past unread and unstaged files (e.g., `package.json` after fresh installs, lockfile updates, CSS that pairs with new code) get left out of the commit. Emphasize separate-step entry. If a staged file list looks suspiciously short relative to the work just done, flag it before suggesting `git commit`.
- **Hidden files (leading `.`) deserve a callout** when pointing at `.env.local`, `.gitignore`, etc. `ls -la` shows them.
- **Editor commands aren't implicit.** Name nano's `Ctrl+O` (write out) / `Ctrl+X` (exit), or vim's `:wq`, when those editors come up.
- **pnpm workspace patterns are new.** When using `--filter @activity/foo` or `workspace:*`, a brief context sentence the first time.
- **pnpm strict-mode imports:** missing direct deps surface as Vite "Failed to resolve import" errors, even when the package exists transitively. The fix is always `pnpm add --filter @activity/app <package>`.
- **"Replace X" instructions are easy to misread** as "replace the whole file" or "add the new code without removing the old." When pointing at a partial replacement, name the delete-from / keep boundaries explicitly. Include "the rest of the file is unchanged" reassurance.
- **Babel TSX parser trips on nested generics in `forwardRef<A, B<C>>`.** Workaround: extract the inner type to a top-level alias.
- **New tooling concepts get one sentence of context the first time** — flat ESLint config, Tailwind v4 `@theme`, Zod discriminated unions, Tiptap's `useImperativeHandle` bridge for ProseMirror callbacks, React Router v7 declarative mode, ProseMirror NodeViews, the marks-on-text-runs model, floating-ui, focus-trap-react, `:focus-visible`, esbuild bundler options, etc.
- **Don't conflate URLs with API keys** when describing dashboard navigation.
- **Don't overstate accessibility behavior without thinking through the rendered state.** When claiming an a11y property, walk through the actual rendered DOM and keyboard flow before saying it works.
- **Schema versioning convention.** `SubmissionResponses` always names the current schema; `SubmissionResponsesV1` is the legacy preserved for migration. There is no `SubmissionResponsesV2` symbol — when the next version lands, `SubmissionResponses` becomes v3 and a `SubmissionResponsesV2` will be introduced as the new legacy name. "Rename when demoting, not when promoting."
- **Vitest does not enforce TS strict mode.** It uses esbuild/swc under the hood, which transpiles but doesn't type-check. Latent type errors can accumulate, passing `vitest run` while failing `tsc --noEmit`. Run `pnpm --filter <pkg> build` periodically to surface them.
- **esbuild does not enforce TS strict mode either.** The `tsc --noEmit -p src/runtime/tsconfig.json` invocation in the renderer's `build` script is what actually checks the runtime; if that invocation goes missing, runtime type errors accumulate silently.
- **When sub-directory code has different lib needs than its package, give it its own tsconfig.** Discovered Stage 11: the runtime is DOM TypeScript inside a no-DOM package. Two tsconfigs + an exclude + two `tsc` invocations is the standard pattern.
- **For one-shot mock cleanups in Vitest, prefer inline `try/finally` over `beforeEach`/`afterEach` with a typed shared variable.** Discovered Stage 11.
- **Multi-file delivery — verify count of tail outputs.** When delivering N files in one message and asking for tail -3 verifications on each, if the pasted output shows fewer than N blocks-of-3-lines, the missing file is almost certainly empty on disk. Explicitly ask the user to confirm. Discovered Stage 12 step 6a: `config.ts` was empty after paste; 5 tail commands produced only 4 visible blocks.
- **File-path collisions in multi-file drops are a real risk.** Discovered Stage 13.5: `BlankEditPopover.tsx` and `BlankPopoverHost.tsx` both belong in `packages/app/src/editor/components/`. A paste mix-up overwrote one file's contents with the other's, producing a TypeScript error blaming the wrong file. State the destination path explicitly at the top of every file in a multi-file drop. Diagnostic: `head -5 <path>` to see the actual contents.
- **TypeScript `verbatimModuleSyntax` is strict about import styles.** Default imports from packages whose default export is treated as a "type-only thing" (e.g., focus-trap-react v10+ where `FocusTrap` is a named export) fail with TS1484. Switch to named imports (`import { FocusTrap } from ...`) when this happens.
- **Tiptap `InputRule` handler returns `void | null`, not `Transaction | null`.** ProseMirror's underlying InputRule API returns a Transaction; Tiptap wraps and expects use of `chain()` / `commands.X()` helpers. The handler can't return `state.tr.replaceWith(...)` directly. Discovered Stage 13.5 attempting to fix the disappearing-block bug.

### Stage 13 + 13.5 + 13.6 session-rhythm observations

- **Design pass → green light → code drop pattern works well.** Sessions of Stage 13 and 13.5 followed this. Brief design discussion surfacing real decisions, Zan responds with yes/no per item or counter, then code drop with verification steps. Don't skip the design pass even when the work looks straightforward — it surfaces decisions that would otherwise be silently assumed.

- **Numbered decision lists in design passes get crisp responses.** Zan responds like "1. yes / 2. yeah / 3. okay" — keep this format. When a single answer was less terse ("we can split it up"), it covered all items implicitly; that's fine.

- **Schema confirmation moment.** Worth doing this explicitly for any cross-package shape questions — the inference often matches but specifics (positive-int constraints, ISO datetime formats, optional fields) only visible in the actual Zod source.

- **"Best practice over shortcut" applies even when the shortcut is tempting.** Stage 13 had a decision between adding `confidenceRadios` to refs (principled, ~12 lines of test fixture churn) or querying DOM in `renderBlock` (pragmatic, microsecond perf cost). Zan picked the principled solution. Same pattern in Stage 13.5 — focus-trap-react chosen over hand-rolled focus management because future Phase 2+ modals will need it.

- **Multi-drop staging for high-risk changes.** Stage 13.5's popover work split into Drop 2a (schema attrs) → 2b (popover with answer field) → 2c (full per-blank fields). When Drop 1 (per-chip popover) failed catastrophically, this allowed clean revert and re-design without losing the schema work. Validated the pattern. Apply to any large UI surface change.

- **"Pilot error not popover error."** Mid-session diagnosis of editor blank screen turned out to be a wrong-URL typo (`/activity` vs `/activities`), not a code bug. When the symptoms don't make sense given the recent changes, ask "are you in the state you think you're in?" before diving into code.

- **Documentation lags code, deliberately or otherwise.** STATE.md and RUNTIME.md are updated AT END of stages, not at the end of each session. The "vital context for future Claude" framing matters here — these docs are the bridge between chat sessions.

- **Closeout pattern: write a bug report for any deferred bug in a format that can seed a new chat.** Done at end of Stage 13.5 for the disappearing-block bug. Lets the deferred issue actually get picked up rather than rotting in a TODO.

- **When debugging a ProseMirror/Tiptap symptom, jump on the strongest signal first.** Disappearing-block-fix session: the strongest data point was "`defining: true` fixed it but broke drag-reorder." That uniquely fingerprints PM's content-fit algorithm and the defining-flag family. Detoured ~20 minutes on an off-by-one position-arithmetic hypothesis that didn't fit the symptom pattern. Lesson: when you have a "this specific change fixed the symptom but had other consequences" data point in hand, follow it before generating new hypotheses.

- **Code in fix instructions can collide on the same line when pasted.** Disappearing-block session, final hiccup: a multi-line comment ending in `// it just emptied.` had `chain()` paste onto the same line, commenting it out and causing an esbuild error. Worth ensuring code lines have explicit blank-line buffers around them in delivered snippets.

- **Long-form copy-paste of JSX is genuinely hazardous.** Stage 13.6 session had two separate compile errors from incomplete pastes of the same file (PublishControl.tsx) — first paste was missing nothing visible but produced cryptic JSX errors at position N; second paste from a "more robust" version had the same error at N+2 (line shifted by the const declarations I added). Eventually traced to a missing `<a` opening tag in the user's saved file. Lesson: **for any file delivery over ~30 lines of JSX, write to /mnt/user-data/outputs and use present_files for the user to download, rather than putting code in chat for paste.** The download path eliminates the entire class of paste-mangling failures.

- **Verify Supabase product capabilities against current docs before committing to an architecture.** Stage 13.6 session lost meaningful time to two separate "this works according to my prior" assumptions that the docs contradict: (1) Supabase Storage public buckets can serve HTML — false, they rewrite to `text/plain` as anti-abuse; (2) Supabase Edge Functions can return HTML responses — false, same rewrite at the gateway layer. Both restrictions are documented in plain language at https://supabase.com/docs/guides/functions/limits and https://supabase.com/docs/guides/storage/quickstart. **Web-search the docs (specifically search for "supabase {feature} {restriction}" phrasings) before settling on any Supabase-backed architecture choice involving content-serving.**

- **When code structure looks wrong, ask for the file as-saved before guessing.** Same Stage 13.6 session: a JSX compile error reported at line 139. The code I'd written had matching tags. Three rounds of "more robust" rewrites later, the actual fix was a single missing `<a` tag in the saved file — the paste had eaten it. If I'd asked for the saved file two rounds earlier, we'd have saved 30 min. **For any compile error in code I wrote that doesn't match my mental model of the code, ask for `head -<N> <path>` output or full file upload before re-writing.**

- **The publish flow uncovered an architectural blocker not in any design doc.** ROADMAP.md anticipated Cloudflare R2 in Phase 2/3 as a cost optimization. The actual driver is that Supabase fundamentally cannot host HTML on free tier. The migration is a Phase 1 prerequisite, not a future optimization. Worth re-checking ROADMAP cross-cutting concerns at the start of each stage for assumptions like this that might have aged out — what was "Phase 2 optimization" can become "Phase 1 blocker" when product details emerge.
