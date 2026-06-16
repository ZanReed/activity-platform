# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting:

1. **Reminder:** any future redeploy of `ingest-submission` needs `--no-verify-jwt` (see CLAUDE.md).
2. **After the e2e pass verifies R2 end-to-end:** delete the legacy Supabase Storage `activities` bucket and any env vars referencing it.

Cleared 2026-06-16: **cross-origin `<img>` loads from R2 confirmed working** by the author; **the three real-mouse GUI passes confirmed working** (drag-between-cells, image resize handles, nested rich-text mini-editor). Also: `publish-activity` redeployed with the **submission-payload fix** (runtime now POSTs snake_case `activity_id`/`display_name` matching `ingest-submission`) and the `[TEST] E2E Coverage` activity re-published — live submit verified end to end (see Current focus). Cleared 2026-06-13 (verified via Supabase API): `publish-activity` was at **v34**, carrying the full variable-block-sizing bundle (width fill + image fixed-height crop + cell `--cell-min-height`). Earlier (2026-06-12): migration 0007 applied; `upload-image` deployed; `ingest-submission` still has `verify_jwt: false`.

## Current focus

**▶ No active goal — next focus is open.** Pick from "Also queued" below.

Recently completed (newest first; durable detail in [DECISIONS](docs/DECISIONS.md)/[HISTORY](docs/HISTORY.md)):

- **Markdown import — v1 (lean core)** (2026-06-16) — paste-markdown → editor blocks. New standalone converter [`lib/markdownToTiptap.ts`](packages/app/src/lib/markdownToTiptap.ts) (markdown-it, lazy-loaded + vanilla; custom `{{answer|alt}}` / `{checkpoint}` syntax resolved in the token→Tiptap mapper) + a header **Import dialog** with a live block/problem summary and warnings. Covers headings, paragraphs, bold/italic/code, nested lists, blanks→`fillInBlank`, `{checkpoint}`→checkpoint section break; a blank-bearing list flattens to one problem per item. **App-only/additive — no schema/renderer/runtime change, no bundle, no deploy.** 26 new tests incl. a schema round-trip; verified against the live ProseMirror schema on `/playground` (all shapes accepted, blanks render as chips). Decisions in DECISIONS → "Markdown import". **Fast-follow:** `$…$` math + `![](url)` images (the author-approved "do lean core, then add" sequencing). Math + images degrade to warnings for now.
- **Delete activities** (2026-06-16) — per-row Delete with an inline two-step confirm in `Activities.tsx`. Soft delete (`update activities set deleted_at = now()`), the mechanism the RLS comments prescribe — no migration/RPC; same `activities_update_own` policy the editor autosave already uses. Optimistically drops the row from the list; the 30-day `purge_soft_deleted` cron hard-deletes later. (Route is auth-gated, so verified by policy-analysis + typecheck rather than headless click.)
- **End-to-end submit path verified + bug fixed** (2026-06-16) — first real live-network submit found the runtime POSTing camelCase (`activityId`/`displayName`) while `ingest-submission` requires snake_case (`activity_id`/`display_name`) → `400 activity_id is required`. Fixed: runtime now sends snake_case (canonical — matches DB columns + RPC), payload assembly extracted to a pure, unit-tested `buildSubmissionPayload`; bundle regenerated; `publish-activity` redeployed + activity re-published. Verified the submission row in the DB: `display_name`, `score 0.75`, `attempt_number 1`, `schemaVersion 2`, 4 blanks, 2 checkpoint sections, per-blank confidence all landed. Seed bed: `scripts/seed-e2e-activity.sql`. Remaining e2e bits not yet exercised: the **locked-mode** pass (inputs freeze after check) and the in-app **Submissions dashboard** view.
- **Deferred test coverage** (2026-06-13) — `init.test.ts` now covers `state.blanks`/`state.blocks` (one defaulted entry per ref, empty when none). The blank-edit popover's draft/commit/close decisions were extracted to a pure `blankPopoverLogic.ts` (behavior-preserving lift out of `BlankEditPopover`/`BlankPopoverHost`) and unit-tested (`blankPopoverLogic.test.ts`, 25 cases — `computeFlush`, `resolveAnswerBlur`, `resolveAcceptableCommit`, `filterFeedbackForCommit`, `isSameBlankSelection`). Refactor browser-smoke-verified: edit commits on outside-click close, whitespace stripped, selection released.
- **Foldable × columns verification** (2026-06-13) — a top-level columns container flows whole through the foldable, never splits, `fr` tracks resolve against the fixed panel width. Tests + dev-only `/dev/foldable-columns` bench. DECISIONS → "Structural columns + variable block sizing".
- **CI + housekeeping** (2026-06-13) — `.github/workflows/ci.yml` (typecheck → lint → test → build → bundle-staleness guard, on push + PR); app `typecheck` + root `lint` scripts; `packageManager: pnpm@11.1.2` pin; pre-existing lint errors cleared (now 0 errors / 2 intentional warnings).
- **Variable block sizing** (2026-06-12/13) — COMPLETE + deployed (publish-activity v34). DECISIONS → "Structural columns + variable block sizing"; design in [docs/design/variable-block-sizing.md](docs/design/variable-block-sizing.md).

Standing follow-up: none — the image resize drag-handles + the other real-mouse GUI passes were confirmed working by the author (2026-06-16).

Also queued:

- **End-to-end manual test** — ▶ free-mode submit path DONE 2026-06-16 (found + fixed the snake_case payload bug; DB row verified). **Still to run:** the **locked-mode** pass (re-publish in locked mode → inputs freeze after check) and the in-app **Submissions dashboard** view. (Full checklist preserved in docs/HISTORY.md.)
- **Markdown import fast-follow:** add `$…$`/`$$…$$` math (mathInline/mathBlock) and `![](url)` images to the converter — reuses `markdownToTiptap.ts` + its test file; inline images lift out to image blocks. v1 ships warnings for both today.
- **Phase 1 polish:** custom domain for R2.
- **Free activity catalog (design captured 2026-06-16, target Phase 2):** public catalog of free first-party math activities a newcomer can run as-is — a cold-start lever pairing with self-signup ([docs/design/free-activity-catalog.md](docs/design/free-activity-catalog.md)). The Phase 5 marketplace's free/discovery slice pulled forward; "use" = run-in-place read-only (not clone-to-edit). Phase 2 slice = browse + run/assign/print; consumer submission dashboards depend on Phase 3 assignment scoping.
- **Long-term OCR/AI features (design captured 2026-06-16, not scheduled):** PDF → activity import ([docs/design/pdf-import.md](docs/design/pdf-import.md)) and photo-upload answer checking ([docs/design/photo-grading.md](docs/design/photo-grading.md)). Both reuse existing pipelines (markdown-paste DSL converter; the submission pipeline); decisions locked: generic-master QR, teacher-grading-aid v1, transcription-only AI rule. Photo-grading flags one real refactor — make answer evaluation server-shareable.
- **Housekeeping (remaining):** CI runs on every branch (no branch filter) — narrow to `main` + PRs if the noise warrants. The deferred-test items (`init.test.ts` state coverage, popover state-machine) both landed 2026-06-13.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | ✅ Complete; live-verified |
| Database migrations 0001–0006 | ✅ Applied; RLS verified |
| Migration 0007 (submission version pinning) | ✅ Applied (verified 2026-06-12) |
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
| Markdown paste import | ✅ v1 (lean core) done + verified; app-only, no deploy. Math + images = fast-follow |
| End-to-end manual test | ◐ Free-mode submit path verified 2026-06-16 (snake_case payload bug found + fixed, DB row confirmed); locked-mode + dashboard still to run |

Test counts at last session: schema 54 / renderer 254 / app 184 (+26 markdown import); `tsc -b` + app build green.

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
│           ├── components/ — PublishControl
│           ├── routes/     — Activities, ActivityEditor, ActivityPrint, Submissions, Playground (dev-only)
│           ├── lib/        — serialize.ts, submissions.ts, uploadImage.ts, foldable/ (print engine)
│           └── __tests__/
├── supabase/
│   ├── migrations/    — 0001–0007 (all applied)
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

**Last updated:** 2026-06-16. This session (newest detail in "Recently completed" above; durable reasoning in DECISIONS):

- **Markdown import v1 (lean core)** — standalone `markdownToTiptap.ts` (markdown-it, lazy + vanilla) + header Import dialog. App-only/additive: no schema/renderer/runtime change, no bundle, no deploy. 26 new tests + live-editor verification on `/playground`. Math + images deferred to the approved fast-follow. Decisions filed in DECISIONS → "Markdown import".
- **Delete activities** — per-row soft-delete in `Activities.tsx` (RLS-prescribed `deleted_at`, no migration).
- **E2E free-mode submit verified + bug fixed** — live submit 400'd (`activity_id is required`): runtime sent camelCase, `ingest-submission` wants snake_case. Fixed the runtime payload (pure, unit-tested `buildSubmissionPayload`), regenerated the bundle; author redeployed `publish-activity` + re-published; DB submission row verified. Locked-mode seed (`scripts/seed-e2e-locked.sql`) ready for the remaining locked-mode + dashboard passes.
- **Flush-leak investigated → no data loss.** Only a switch-vs-close UX wart; one-click-switch attempt hit the FocusTrap/selection danger zone, reverted. Decision filed in DECISIONS → "Fill-in-blank authoring (Stage 13.5)".
- Author confirmed: all real-mouse GUI passes + R2 cross-origin `<img>`.
- Suite: schema 54 / renderer 254 / app 184; CI green. Markdown-import commit pending on a branch off `main`.
