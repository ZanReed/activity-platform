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

**✅ Variable block sizing — COMPLETE** (design + all drops 2026-06-12/13; see [docs/design/variable-block-sizing.md](docs/design/variable-block-sizing.md)). Reflow-safe sizing only, no free canvas. Shipped: unified per-block `width` fraction + `align` (default center, no wrap-around) on image + math_block; image free `height` with crop-not-stretch; `Column.minHeight` rem work-space floors via a toolbar control. Drag gestures kept only where they proved reliable (image side/bottom handles); column drag-resize was cancelled in favor of presets.

- **Drop 1 ✅ (foundation, no UI):** schema fields, renderer markup + CSS (`block-sized`/`--block-width`/`data-block-align`, `--cell-min-height`; narrow screens relax widths, print keeps them), Tiptap attrs + serialize round-trip, tests, bundle regenerated. **Deployed** (publish-activity v32).
- **Drop 2 ❌ CANCELLED (author decision):** column divider drag-resize was built, then removed after failing under a real mouse — the **width presets are the column-width system**. Schema/serialize unchanged (arbitrary weights still round-trip and render); implementation preserved in git history if ever revisited.
- **Drop 3 ✅ (image resize, width + free height):** width chips (**Auto** = natural size, never upscaled; 25/33/50/66/75/**100%** = explicit fill widths — author flagged the original "Full"-means-Auto labeling as confusing, so Auto and 100% are now distinct), an Auto/value **height field (rem)**, and alignment (Left/Center/Right) in the image edit popover as the reliable baseline, plus side drag-handles (width) and a bottom-edge handle (height, half-rem snapping) on the live preview ([ImageView.tsx](packages/app/src/editor/nodeViews/ImageView.tsx), math in [imageSizing.ts](packages/app/src/editor/imageSizing.ts)) — Alt = fine-grained, live badge, Escape cancels, one commit per drag. When width × height disagree with the natural aspect ratio the image **center-crops (`object-fit: cover`), never stretches** (author decision); height alone scales proportionally. New optional `ImageBlock.height` (rem — scales with print font size; additive, no version bump). NodeView previews everything exactly as published. Bundle regenerated, **redeploy pending**. Browser-verified end to end.
- **Drop 4 ✅ (cell reserved work space):** a **Cell height** dropdown in the columns toolbar cluster ([CellHeightControl.tsx](packages/app/src/editor/components/CellHeightControl.tsx)) — Auto / quick presets (4/8/12rem) / numeric rem input, acting on the cell holding the cursor (or the last cell when the block is node-selected). Control-first by design (the cancelled-Drop-2 lesson: no drag gesture). New `setColumnMinHeight` command + `clampCellMinHeight`/`activeColumnMinHeight` helpers in [Columns.ts](packages/app/src/editor/extensions/Columns.ts); writes the schema's existing `Column.minHeight` (rem, Drop-1 plumbing). The floor still grows with content; on paper it's the write-in work space. Editor-only (renderer already consumes `--cell-min-height`). Browser-verified: preset/input/clamp/Auto/disabled-outside all correct.

**▶ Variable block sizing arc complete.** Drops 1, 3, 4 shipped; Drop 2 (column drag) cancelled by author (presets remain). Next focus is open — see "Also queued" below.

Also this session — two editor UX fixes (browser-verified): **sticky toolbar** (follows the viewport on long documents; `overflow-hidden` removed from the editor card since it silently disables sticky) and **no more scroll-to-top when selecting an image low in the document** (popovers waited on neither anchor resolution nor floating-ui positioning before focusing; both Image and Blank popovers now mount after the anchor resolves, stay invisible until positioned, and focus with `preventScroll`). Dev-only `window.__tiptapEditor` handle added for scripted browser checks.

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

**Last updated:** 2026-06-13 — **Drop 4 closes the variable-block-sizing arc.** Added a **Cell height** dropdown to the columns toolbar (CellHeightControl.tsx: Auto / 4-8-12rem presets / numeric rem input) driving a new `setColumnMinHeight` command over the schema's existing `Column.minHeight`; control-first, no drag (the cancelled-Drop-2 lesson). Browser-verified end to end. Author confirmed deploying `publish-activity` (now **v34**), so the full sizing bundle — width fill, image fixed-height crop, and cell work-space floors — is live; redeploy items cleared from pending. Arc summary: Drops 1 (foundation), 3 (image width+height+crop, with the Auto/100% width relabel), 4 (cell work space) shipped; Drop 2 (column drag-resize) built then cancelled by author in favor of width presets.
