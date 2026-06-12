# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting:

1. **`supabase db push`** — apply migration [0007_submission_version.sql](supabase/migrations/0007_submission_version.sql) (`submissions.activity_version_id`). Until applied, the dashboard falls back to current-version answer keys (no regression; new rows just aren't pinned to the version the student answered).
2. **`supabase functions deploy publish-activity`** — ships the regenerated renderer bundle: Phase-2 rich hint/feedback/solution content + structural-columns/grid-lines CSS. Until then, newly published pages carry the old bundle's CSS.
3. **`supabase functions deploy upload-image`** — new function (image authoring Drop 2). Also confirm cross-origin `<img>` loads from the R2 public URL in the editor (add the SPA origin to the R2 bucket CORS allowed-origins if needed; a custom domain would make this moot).
4. **Reminder:** any future redeploy of `ingest-submission` needs `--no-verify-jwt` (see CLAUDE.md).
5. **Human GUI passes still owed:** the live drag gestures for drag-between-cells (hover→handle→drag and grip→drag — synthetic events can't drive them headlessly), and the nested rich-text mini-editor UX (caret behavior, math insertion, virtual-keyboard interplay in popovers).
6. **After the e2e pass verifies R2 end-to-end:** delete the legacy Supabase Storage `activities` bucket and any env vars referencing it.

## Current focus

**▶ Active next goal — variable block sizing**, the strategic goal the structural-columns container was built for: differing-width/height blocks, reflow-safe sizing only, no free canvas.

The columns-polish arc that preceded it is complete (add/remove-column commands, width presets + visual picker with live editor preview, image authoring with R2 upload + live preview, drag-between-cells with a dedicated columns grip, legacy print-columns control retired) — full writeups in [docs/HISTORY.md](docs/HISTORY.md).

Also queued:

- **Foldable verification with a real columns block** — `measure.ts` walks `.activity-section > *`, so a top-level container is measured/packed whole by `paginate`; confirm it doesn't split mid-container and its inner width resolves against the panel width.
- **End-to-end manual test** on a real published URL: checkpoints, hints, mistake feedback, confidence, solutions, locked vs free mode, persistence across refresh, resubmit + retry on the live network path. (Full checklist preserved in docs/HISTORY.md.)
- **Phase 1 polish:** markdown paste import; custom domain for R2.
- **Housekeeping:** CI (GitHub Actions: test + typecheck + build + `bundle:renderer` on push — would have caught two past silent breaks); `init.test.ts` coverage for `state.blanks`/`state.blocks`; Stage 13.5 popover state-machine tests; pre-existing lint error in `FillInBlank.ts:6` (unused `Options`/`Storage` generics — one-line fix).

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | ✅ Complete; live-verified |
| Database migrations 0001–0006 | ✅ Applied; RLS verified |
| Migration 0007 (submission version pinning) | ⏳ Written, **NOT applied** (author) |
| Print feature Drops A–D (worksheet config + journal foldable) | ✅ Complete; entirely client-side, no deploy needed |
| Structural columns + grid lines + width presets + drag-between-cells | ✅ Code + tests; ⚠ `publish-activity` redeploy pending |
| Phase 2 slice — rich text + inline math in hint/feedback/solution | ✅ Code + tests; ⚠ deploy pending; live UX unverified |
| Image authoring (block + popover + upload + live preview) | ✅ Code + tests; ⚠ `upload-image` deploy + R2 CORS pending |
| `publish-activity` / `ingest-submission` Edge Functions | ✅ Deployed; ingest runs with `verify_jwt: false` |
| Cloudflare R2 hosting (published HTML) | ✅ Live |
| Auth (Google OAuth, allowlist) / React app / editor stack | ✅ In place |
| Markdown paste import | ⏳ Phase 1 polish |
| End-to-end manual test | ⏳ Still to run |

Test counts at last session: schema 45 / renderer 235 / app 106; `tsc -b` + app build green.

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
│   ├── migrations/    — 0001–0007 (0007 NOT yet applied)
│   └── functions/     — publish-activity, ingest-submission, upload-image, _shared/ (cors.ts, renderer.bundle.js — auto-generated)
├── scripts/           — bundle-renderer.mjs; seed-test-data.sql
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
- **Selection-change unmount flush leak** — edits typed in blank-chip A are lost if the user immediately clicks chip B (Escape/outside-click paths are handled). Polish-pass candidate.
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

**Last updated:** 2026-06-11 — docs restructure for context efficiency: STATE.md slimmed from ~520 dense lines to this snapshot; completed-work narratives → docs/HISTORY.md, architecture decisions → docs/DECISIONS.md, author-collaboration notes → docs/COLLABORATION.md; standing constraints + things-NOT-to-do moved to a new CLAUDE.md (auto-loaded each session) along with the division-of-labor rules (author pushes/deploys/migrates; bundle-regen discipline; `--no-verify-jwt`). Pending author actions consolidated into the checklist at the top of this file. Prior work log: see docs/HISTORY.md.
