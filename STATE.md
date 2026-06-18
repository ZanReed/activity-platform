# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting:

1. **Reminder:** any future redeploy of `ingest-submission` needs `--no-verify-jwt` (see CLAUDE.md).
2. **Redeploy `publish-activity`** to ship the order-independent blank-grouping bundle (renderer emits `data-blank-group`; runtime added `scoreGroup`). The committed `renderer.bundle.js` is current. Until redeployed + activities re-published, grouped blanks won't score on published pages (no server change needed — `ingest-submission` stores the client verdict verbatim).

Cleared 2026-06-18: **legacy Supabase Storage `activities` bucket deleted by author** (R2 verified end-to-end; the app's `.from('activities')` calls are the DB table, not the bucket — confirmed nothing referenced it; no env vars needed removing). Cleared 2026-06-17: **migration `0008_soft_delete_activity.sql` deployed — deleting activities now works** (soft-delete RLS bug; writeup in HISTORY 2026-06-17, reasoning in DECISIONS → "Activity deletion"). Cleared 2026-06-16: **cross-origin `<img>` loads from R2 confirmed working** by the author; **the three real-mouse GUI passes confirmed working** (drag-between-cells, image resize handles, nested rich-text mini-editor). Also: `publish-activity` redeployed with the **submission-payload fix** (runtime now POSTs snake_case `activity_id`/`display_name` matching `ingest-submission`) and the `[TEST] E2E Coverage` activity re-published — live submit verified end to end (see Current focus). Cleared 2026-06-13 (verified via Supabase API): `publish-activity` was at **v34**, carrying the full variable-block-sizing bundle (width fill + image fixed-height crop + cell `--cell-min-height`). Earlier (2026-06-12): migration 0007 applied; `upload-image` deployed; `ingest-submission` still has `verify_jwt: false`.

## Current focus

**▶ Order-independent blank groups — code COMPLETE (Drops 1–5), awaiting deploy + author verification.** Factoring-style problems where `(x+2)(x+3)` ≡ `(x+3)(x+2)` are both correct but `(x+2)(x+2)` is not. Schema → renderer → runtime → editor → dashboard → markdown import all landed and green; bundle regenerated. **Next:** author redeploys `publish-activity` (Pending #3), re-publishes a test activity, and confirms grouped scoring on a real published page. Reasoning in DECISIONS → "Order-independent blank groups".

Recently completed (newest first; durable detail in [DECISIONS](docs/DECISIONS.md)/[HISTORY](docs/HISTORY.md)):

- **Order-independent blank groups** (2026-06-17) — a blank can be flagged `interchangeableWithPrevious`; the renderer compiles adjacent runs into a shared `data-blank-group` id and the runtime scores each group with consume-once bipartite matching (each correct answer satisfies one blank; document-order tiebreak; grouped blanks resolve at check/submit, not immediate-mode blur). Authoring: a popover checkbox (hidden on a block's first blank) + a ⇄ chip cue; markdown import via a leading-tilde marker (`{{~3}}`); dashboard drill-down shows "x or y (any order)". Client-authoritative scoring, so no Edge Function change. Schema 89 / renderer 268 / app 232 green. DECISIONS → "Order-independent blank groups".
- **E2E locked-mode + dashboard** (2026-06-17) — author-confirmed working. Locked-mode publish → check freezes the checked section's inputs + check button, solution reveals, score shows; submit → row appears in the Submissions dashboard with per-blank answer-key/student detail. Prep was code-side de-risking (`seed-e2e-locked.sql` validated against the known-good free seed; freeze path traced + unit-covered). Completes the End-to-end manual test item and unblocks the legacy-bucket cleanup (Pending action #2).
- **CI branch-filter narrowing** (2026-06-17) — CI's `push` trigger limited to `main` (was unfiltered, firing on every branch). Feature branches now get a single PR run instead of double-firing on push + PR; merges/direct commits to `main` still run. `pull_request` still covers all PRs.
- **Deferred test coverage** (2026-06-13) — `init.test.ts` now covers `state.blanks`/`state.blocks` (one defaulted entry per ref, empty when none). The blank-edit popover's draft/commit/close decisions were extracted to a pure `blankPopoverLogic.ts` (behavior-preserving lift out of `BlankEditPopover`/`BlankPopoverHost`) and unit-tested (`blankPopoverLogic.test.ts`, 25 cases — `computeFlush`, `resolveAnswerBlur`, `resolveAcceptableCommit`, `filterFeedbackForCommit`, `isSameBlankSelection`). Refactor browser-smoke-verified: edit commits on outside-click close, whitespace stripped, selection released.
- **Foldable × columns verification** (2026-06-13) — a top-level columns container flows whole through the foldable, never splits, `fr` tracks resolve against the fixed panel width. Tests + dev-only `/dev/foldable-columns` bench. DECISIONS → "Structural columns + variable block sizing".
- **CI + housekeeping** (2026-06-13) — `.github/workflows/ci.yml` (typecheck → lint → test → build → bundle-staleness guard, on push + PR); app `typecheck` + root `lint` scripts; `packageManager: pnpm@11.1.2` pin; pre-existing lint errors cleared (now 0 errors / 2 intentional warnings).
- **Variable block sizing** (2026-06-12/13) — COMPLETE + deployed (publish-activity v34). DECISIONS → "Structural columns + variable block sizing"; design in [docs/design/variable-block-sizing.md](docs/design/variable-block-sizing.md).

Standing follow-up: none — the image resize drag-handles + the other real-mouse GUI passes were confirmed working by the author (2026-06-16).

Also queued:

- **Phase 1 polish:** custom domain for R2.
- **Free activity catalog (design captured 2026-06-16, target Phase 2):** public catalog of free first-party math activities a newcomer can run as-is — a cold-start lever pairing with self-signup ([docs/design/free-activity-catalog.md](docs/design/free-activity-catalog.md)). The Phase 5 marketplace's free/discovery slice pulled forward; "use" = run-in-place read-only (not clone-to-edit). Phase 2 slice = browse + run/assign/print; consumer submission dashboards depend on Phase 3 assignment scoping.
- **Long-term OCR/AI features (design captured 2026-06-16, not scheduled):** PDF → activity import ([docs/design/pdf-import.md](docs/design/pdf-import.md)) and photo-upload answer checking ([docs/design/photo-grading.md](docs/design/photo-grading.md)). Both reuse existing pipelines (markdown-paste DSL converter; the submission pipeline); decisions locked: generic-master QR, teacher-grading-aid v1, transcription-only AI rule. Photo-grading flags one real refactor — make answer evaluation server-shareable.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | ✅ Complete; live-verified |
| Database migrations 0001–0006 | ✅ Applied; RLS verified |
| Migration 0007 (submission version pinning) | ✅ Applied (verified 2026-06-12) |
| Migration 0008 (`soft_delete_activity` RPC — delete bug fix) | ✅ Applied 2026-06-17; delete verified working by author |
| Print feature Drops A–D (worksheet config + journal foldable) | ✅ Complete; entirely client-side, no deploy needed |
| Structural columns + grid lines + width presets + drag-between-cells | ✅ Complete; deployed |
| Variable block sizing (Drops 1/3/4: width+align, image height/crop, cell work-space) | ✅ Complete + tests; deployed (publish-activity v34); Drop 2 column-drag cancelled by author (presets remain) |
| Editor UX: sticky toolbar + popover scroll-jump fix | ✅ Browser-verified |
| Phase 2 slice — rich text + inline math in hint/feedback/solution | ✅ Deployed; live UX unverified |
| Image authoring (block + popover + upload + live preview) | ✅ Deployed; R2 cross-origin `<img>` confirmed 2026-06-16 |
| `publish-activity` / `ingest-submission` Edge Functions | ✅ Deployed; ingest runs with `verify_jwt: false` |
| Cloudflare R2 hosting (published HTML) | ✅ Live |
| Auth (Google OAuth, allowlist) / React app / editor stack | ✅ In place |
| CI (GitHub Actions: typecheck/lint/test/build + bundle-staleness guard) | ✅ Added 2026-06-13; verified green locally |
| Markdown paste import | ✅ Complete + verified end-to-end by author (multiple smoke tests); app-only, no deploy. Format spec + Copy AI prompt + drift guard shipped |
| End-to-end manual test | ✅ Free-mode (2026-06-16) + locked-mode/dashboard (2026-06-17) both author-verified end to end |
| Order-independent blank groups | ✅ Code complete + tested; editor browser-verified; bundle regenerated. Awaiting `publish-activity` redeploy (Pending #3) + author check on a published page |

Test counts at last session: schema 89 / renderer 268 / app 232; `tsc -b` + app build green. (Order-independent groups added: schema +3, renderer +13 (grouping scoring 9 + emission 4) + init groupId, app +6 across popover-logic/submissions/markdown drift+converter.)

## Repo layout

```
activity-platform/
├── docs/
│   ├── design/        — feature designs captured ahead of implementation
│   ├── DECISIONS.md   — architecture decisions + reasoning
│   ├── HISTORY.md     — archived completed-work logs
│   └── COLLABORATION.md — working-with-the-author notes
├── packages/
│   ├── schema/        — Zod types, document model, factories
│   ├── renderer/      — pure JSON → HTML string; KaTeX inlined; no DOM
│   │   ├── RUNTIME.md — runtime architecture + data-attribute contract
│   │   └── src/runtime/ — published-page runtime (DOM TS, own tsconfig; per-file map in RUNTIME.md)
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/     — Tiptap extensions, NodeViews, popover hosts, toolbar, slash menu
│           ├── components/ — PublishControl, ImportMarkdownDialog, RequireAuth
│           ├── routes/     — Activities, ActivityEditor, ActivityPrint, Submissions, Playground (dev-only)
│           ├── lib/        — serialize.ts, submissions.ts, uploadImage.ts, markdownToTiptap.ts, markdownImportPrompt.ts, foldable/ (print engine)
│           └── __tests__/
├── supabase/
│   ├── migrations/    — 0001–0008 (all applied)
│   └── functions/     — publish-activity, ingest-submission, upload-image, _shared/ (cors.ts, renderer.bundle.js — auto-generated)
├── scripts/           — bundle-renderer.mjs; seed-test-data.sql; seed-e2e-activity.sql; seed-e2e-locked.sql
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Storage bucket (legacy):** `activities` (public; delete after R2 migration verified)
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Allowlist-only signup (Phase 1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` in `.env.local` (gitignored) mirrors the write-only `R2_PUBLIC_URL_BASE` secret; unset → published-page links hide.

## Open questions / deferred decisions

- **Custom domain for R2** (Phase 2 polish): `pub-<hash>.r2.dev` → `activities.<brand>.com` once a domain is owned; ~5 min of Cloudflare DNS after that.
- **Empty fill_in_blank drag handle attachment** — whether `definingForContent: true` changed the handles-only-on-non-empty behavior is unverified; re-test during a drag-reorder pass. Minor.
- **Blank popover: one-click switch between chips** — deferred design decision, no data loss; full reasoning in [DECISIONS.md](docs/DECISIONS.md) → "Fill-in-blank authoring (Stage 13.5)". Needs a dedicated design pass (FocusTrap/selection entanglement).
- **Section metadata panel** — SectionBreakView's inline title/checkpoint UI is adequate for now; an editor-level panel remains optional.
- **Responsive `--blank-width` sizing** — deferred from Stage 11.
- **Phase 2 block-type priority order** (worked example, faded worked example, learning objectives, self-explanation) — decide when Phase 2 starts.
- **`skills` editing UI** — deferred to Phase 2 per schema scheduling; the field round-trips everywhere, only the editing control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **UX validation with 2–3 other teachers** on the editor patterns before classroom adoption — cost rises sharply once students use activities.
- **Post-success edit edge case** — locked/single paths briefly write-then-remove the persistence blob (wasteful but correct). Low priority.
- **CDN-hosted shared runtime** (Phase 3+): trigger is when republishing for runtime bug fixes gets painful (~50+ active activities).
- **Multi-tenancy / governance when a teacher leaves a district** — Phase 4; helpers are designed for it.
- **Manual grading workflow shape** (Phase 2.6), **media storage/privacy posture** (Phase 2.8), **annotation coordinate space** (Phase 2.9) — each decided at its phase start.

---

**Last updated:** 2026-06-17. Completed-session narratives are archived in [HISTORY.md](docs/HISTORY.md) (rolling log, newest first); durable reasoning in [DECISIONS.md](docs/DECISIONS.md). Suite at last session: schema 89 / renderer 268 / app 232; CI green.
