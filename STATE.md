# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting:

1. **Confirm cross-origin `<img>` loads** from the R2 public URL in the editor (add the SPA origin to the R2 bucket CORS allowed-origins if needed; a custom domain would make this moot).
2. **Reminder:** any future redeploy of `ingest-submission` needs `--no-verify-jwt` (see CLAUDE.md).
3. **Human GUI passes still owed:** drag-between-cells (hover→handle→drag and grip→drag), the **image resize handles** (side = width, bottom = height — verified with synthetic pointer events; confirm under a real mouse), and the nested rich-text mini-editor UX (caret behavior, math insertion, virtual-keyboard interplay in popovers).
4. **After the e2e pass verifies R2 end-to-end:** delete the legacy Supabase Storage `activities` bucket and any env vars referencing it.

Cleared 2026-06-13 (verified via Supabase API): `publish-activity` now at **v34**, carrying the full variable-block-sizing bundle (width fill + image fixed-height crop + cell `--cell-min-height`). Earlier (2026-06-12): migration 0007 applied; `upload-image` deployed; `ingest-submission` still has `verify_jwt: false`.

## Current focus

**✅ Variable block sizing — COMPLETE + deployed** (design + all drops 2026-06-12/13; live on publish-activity v34). Reflow-safe sizing only, no free canvas. Shipped: unified per-block `width` fraction + `align` (default center, no wrap-around) on image + math_block; image free `height` with **crop-not-stretch**; `Column.minHeight` rem work-space floors via a toolbar control. Drag gestures kept only where they proved reliable (image side/bottom handles); column drag-resize was built then cancelled in favor of width presets. Full per-drop narrative in [docs/HISTORY.md](docs/HISTORY.md); durable decisions in [docs/DECISIONS.md](docs/DECISIONS.md) → "Structural columns + variable block sizing"; design in [docs/design/variable-block-sizing.md](docs/design/variable-block-sizing.md).

**✅ CI + housekeeping — landed** (2026-06-13). Added `.github/workflows/ci.yml`: one job on push + PR running typecheck → lint → test → build → **bundle-staleness guard** (`pnpm bundle:renderer` then `git diff --exit-code` on the three committed generated files — the long-standing todo to stop deploys shipping a stale bundle). Closed two coverage gaps the old scripts had: app now has a `typecheck` script (root `pnpm -r typecheck` previously skipped it) and there's a root `lint` script (`pnpm -r lint`). Pinned the toolchain with `"packageManager": "pnpm@11.1.2"`. Fixed the pre-existing 2 lint errors (`FillInBlank.ts:6` unused `Options`/`Storage` type params — inline disable, since interface declaration-merging forbids renaming them) and removed two dead `eslint-disable` directives in `ImageEditPopover.tsx`; lint is now 0 errors / 2 warnings (both intentionally left). Whole sequence verified green locally.

**▶ No active goal — next focus is open.** The variable-block-sizing and columns-polish arcs are complete; CI + housekeeping just landed. Pick the next from "Also queued" below.

Standing follow-up: the image resize **drag-handles** (side = width, bottom = height) still want a real-mouse pass — toolbar controls/chips are fully browser-verified.

Also queued:

- **Foldable verification with a real columns block** — `measure.ts` walks `.activity-section > *`, so a top-level container is measured/packed whole by `paginate`; confirm it doesn't split mid-container and its inner width resolves against the panel width.
- **End-to-end manual test** on a real published URL: checkpoints, hints, mistake feedback, confidence, solutions, locked vs free mode, persistence across refresh, resubmit + retry on the live network path. (Full checklist preserved in docs/HISTORY.md.)
- **Phase 1 polish:** markdown paste import; custom domain for R2.
- **Housekeeping (remaining):** `init.test.ts` coverage for `state.blanks`/`state.blocks`; Stage 13.5 popover state-machine tests. (CI, the `bundle:renderer` staleness guard, and the `FillInBlank.ts:6` lint fix all landed 2026-06-13.)

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
| Image authoring (block + popover + upload + live preview) | ✅ Deployed; R2 CORS confirmation pending |
| `publish-activity` / `ingest-submission` Edge Functions | ✅ Deployed; ingest runs with `verify_jwt: false` |
| Cloudflare R2 hosting (published HTML) | ✅ Live |
| Auth (Google OAuth, allowlist) / React app / editor stack | ✅ In place |
| CI (GitHub Actions: typecheck/lint/test/build + bundle-staleness guard) | ✅ Added 2026-06-13; verified green locally |
| Markdown paste import | ⏳ Phase 1 polish |
| End-to-end manual test | ⏳ Still to run |

Test counts at last session: schema 54 / renderer 248 / app 128; `tsc -b` + app build green.

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

**Last updated:** 2026-06-13 — **CI + housekeeping landed.** Added `.github/workflows/ci.yml` (typecheck → lint → test → build → bundle-staleness guard on push + PR), pinned `packageManager: pnpm@11.1.2`, gave the app a `typecheck` script + added a root `lint` script (both previously missing from the recursive runs), and cleared the pre-existing lint errors. New-test items (`init.test.ts`, popover state-machine) deferred by author. Earlier today: **Drop 4 closes the variable-block-sizing arc.** Added a **Cell height** dropdown to the columns toolbar (CellHeightControl.tsx: Auto / 4-8-12rem presets / numeric rem input) driving a new `setColumnMinHeight` command over the schema's existing `Column.minHeight`; control-first, no drag (the cancelled-Drop-2 lesson). Browser-verified end to end. Author confirmed deploying `publish-activity` (now **v34**), so the full sizing bundle — width fill, image fixed-height crop, and cell work-space floors — is live; redeploy items cleared from pending. Arc summary: Drops 1 (foundation), 3 (image width+height+crop, with the Auto/100% width relabel), 4 (cell work space) shipped; Drop 2 (column drag-resize) built then cancelled by author in favor of width presets.
