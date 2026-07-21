# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**Nothing queued.** All recent deploy trains are author-run + done — details archived in [HISTORY.md](docs/HISTORY.md) (2026-07-15 → 07-21 section). Current live state: `ingest-submission` accepts wire **v9**, storage **v12**, **live kit `graph-kit-XB5CUURV.js`** (source of truth: `supabase/functions/_shared/graph-kit-manifest.ts`; older hashes stay on R2 so already-published pages keep working until re-published). Standing reminder: any future `ingest-submission` / `get-feedback` redeploy needs `--no-verify-jwt` (see [CLAUDE.md](CLAUDE.md)).

## Next major arc — STRICT-GRID: COMPLETE (T1–T8) + known-gaps TRIAGED 2026-07-21 (nothing queued)

**Strict-grid editor migration ([docs/design/strict-grid-editor.md](docs/design/strict-grid-editor.md)).** The editor's ProseMirror tree now IS the stored rows-of-columns model (doc `(row|sectionBreak)+`, every block inside a `column`); serialize's collapse/unwrap is deleted. **App-only — NO renderer/publish/wire/storage change** (stored shape unchanged; bundle regen = zero drift). Killed the editor-vs-storage tech debt.

**SLICES 1 + 2 + known-gaps triage — DONE + on `main` (not pushed).** Slice 1 (T1–T6 structural, commits `3d91692`→`bcffebb`): `editor/extensions/Doc.ts` (strict top node, row-first fill), `StrictGridNormalize.ts` (empty-state/trailing-para/re-coalesce, undo-safe), `editor/strictGrid.ts` helpers, `lib/serializeTestBridge.ts`; StarterKit TrailingNode disabled; 1-col rows render FLAT (grip only on multi-col). Slice 2 (T7 seam affordances + T8 import): `RowSeamCaret.ts` keymap (boundary Backspace selects the seam, Arrow crosses it — Playwright-verified), `Columns.ts` `dissolveRow` + `addRowBelow`, toolbar column cluster gated to multi-col + Merge/Row-below escape hatches, and the ` ```columns ``` ` Markdown fence (`parseColumnsFence`, columns split by `---`, 2–6 cols → strict `row`). Known gaps TRIAGED 2026-07-21 (`/plan-eng-review` + `/plan-design-review`, both CLEARED): **B1** grip click-menu BUILT (`gridRowMenu.tsx`/`GridRowMenuHost.tsx`, reuses `dissolveRow`/`addRowBelow`); **B2** build-nothing (dragHandleNested deliberate; whole-stack/cross-row reorder paradigm-deferred); **B3** `caretBlockPos` folded onto `blockAncestor`; **B4** no action. Full record in the design doc "Known gaps" + [HISTORY.md](docs/HISTORY.md). Suite: **145 e2e + 721 app unit** green.

## Current focus

**MOST RECENT: strict-grid (above).** Prior active arc: **editor-refinement-pass** ([docs/design/editor-refinement-pass.md](docs/design/editor-refinement-pass.md) — cross-block feedback list, rulings, 4-group sequencing) building on the slice-6 Notion-hybrid arc ([notion-hybrid-editor.md](docs/design/notion-hybrid-editor.md) — stages 0–7 shipped). App/editor-only. All committed on `main`, **NOT pushed** (author pushes). Harness: **145 e2e + 721 app unit** green (`pnpm --filter @activity/app test:e2e`); lint 0 errors, 12 accepted warnings (`react-refresh` + `react-hooks/exhaustive-deps`).

**Open remainders (deferred), roughly in priority order:**
1. **Focus mode** (slice-6 stage 7 split it out) — the dim-the-rest toggle needs a caret-tracking ProseMirror plugin (CSS can't identify the caret block under one contenteditable — the same wall that deferred stage-1 gutter focus-parity); off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — deferred from slice-6 stage 1 (touch needs a real device; `/` covers the keyboard floor).
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (clean-tree repro; humans unaffected — e2e routes via the Add-a-block modal). **Papercut:** the gutter "+" (BlockAddButtonHost) can overlap the drag grip's lower half on a short block.

**Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative; drive the drawer via node-selection + gear + Advanced. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.

Completed session narratives (graph-authoring redirection, Groups 1–4, slice-6 stages 0–7, dark mode, image crop, graph systems, math blanks, the deploy trains) are archived in [HISTORY.md](docs/HISTORY.md) (2026-07-15 → 07-21 section).

---

_Backlog / candidate arcs (columns slices 1–5, strict-grid, and slice-6 stages 0–7 are all DONE; completed narratives in [HISTORY.md](docs/HISTORY.md); durable reasoning in [DECISIONS.md](docs/DECISIONS.md); current per-feature status is the table below):_

- **Free activity catalog / "Activity Bank"** (Phase 2 cold-start lever; browse + run/assign/print; [free-activity-catalog.md](docs/design/free-activity-catalog.md)). Design-reconciliation DONE + 6/7 decisions author-ruled 2026-07-13 (`visibility='public'`=listed, definer-RPC catalog surface, signed-in audience v1, published-version-only print, own route; multi-author-ready per ruling #1). **One open item: #6 taxonomy/tags — author wants a tags discussion at kickoff** (lean `tags text[]` + GIN). Design-only until pickup.
- **Vocabulary glossary — Phase 4** (tenant-scoped `glossary_entry` store + `glossaryKey` resolution at publish; light implicit-reuse + suggest-don't-apply auto-suggest; both additive to the shipped mark; [vocabulary-definitions.md](docs/design/vocabulary-definitions.md)).
- **Long-term OCR/AI (design captured 2026-06-16, not scheduled):** PDF → activity import ([pdf-import.md](docs/design/pdf-import.md)) + photo-upload answer checking ([photo-grading.md](docs/design/photo-grading.md)). Decisions locked (generic-master QR, teacher-grading-aid v1, transcription-only). Photo-grading needs one refactor: server-shareable answer evaluation.
- **Phase 1 polish:** custom domain for R2.
- **Other Phase 2 "decide at phase start":** image-hosting quota, `skills` editing UI (block-type priority is COMPLETE — all four pedagogical blocks shipped).

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
| Markdown paste import | ✅ Complete + verified end-to-end by author; app-only. Format spec + Copy AI prompt + drift guard shipped |
| End-to-end manual test | ✅ Free-mode (2026-06-16) + locked-mode/dashboard (2026-06-17) both author-verified end to end |
| Order-independent blank groups | ✅ Complete + deployed; grouped scoring + `{{~}}` import verified live on a published page |
| Inline vocabulary definitions (rich text + math + optional image) | ✅ Code complete + browser-verified; `publish-activity` redeployed 2026-07-06 — reaches a page on its next re-publish |
| Calculator tool (Phase 2.7) | ✅ Stages 1–4 + full graphing UX overhaul, all browser-verified ([HISTORY 2026-07-06](docs/HISTORY.md)). Live since the 2026-07-08 full deploy pass |
| Activity-wide typography (`meta.typography`; R2-hosted WOFF2; drawer control; WYSIWYG) | ✅ Deployed 2026-07-08; live-page font check cleared 2026-07-10 |
| Number-line block (`number_line`, 1-D graded) | ✅ All 6 slices + shape-pills fix, DEPLOYED 2026-07-12 (kit `CWAMAF2L` era; ingest v34 wire 3–7; publish v85+). Browser-verified: dev harness, bundle-rendered page, `/playground`. Live-page eyeball optional |
| Data-plot block (`data_plot`, statistics charts) | ✅ Slice 1 (`display` + `build_dotplot`, wire v8 + storage v9) AND graded builds (`build_histogram` + `build_boxplot`, additive) DEPLOYED 2026-07-12 (kit `V6T6HAUS`; ingest v36 wire 3–8; publish v88). Browser-verified: `/dev/data-plot`, bundle-rendered pages ("1/1", "2/2 correct"), `/playground`. Live-page eyeball optional |
| Interactive-graph block — Stage 5 | ✅ Four interactions (plot-a-point N-handle, plot-a-function incl. bounded curves/rays/segments, graph-an-inequality, shade-region) + static display. DEPLOYED + live-verified (2026-07-10 author pass). The "answer surface as a graph-block field" seam RETIRED (author call 2026-07-10) — composes as display graph + sibling question block instead |
| Numeric blanks (`answerType: 'numeric'` + tolerance; `{{=…}}` import) | ✅ Live (cleared 2026-07-10); no wire change |
| Multiple-choice block (wire v5 + ```mc import + dashboard) | ✅ Live (cleared 2026-07-10); browser-verified |
| Static graph-paper SVG fallback (author's print fix) | ✅ Live (cleared 2026-07-10); committed in `c334b96` |
| Graded function families — quad/exp/log + quadratic inequalities | ✅ Live (cleared 2026-07-10); browser-verified; `38b9fbe` |
| Display-graph continuation arrows + readDrawables/print-arrowhead fixes | ✅ Live (cleared 2026-07-10); `131f62d`; arrows checkbox FULLY verified 2026-07-12; sin-curve `expression` tangent fix deployed 2026-07-12 (`9a68c0e`) |
| MC choice figures (per-choice image/graph, 2-up grid, shared DrawableListEditor) | ✅ Live (author-confirmed 2026-07-10) |
| Matching + ordering question types (wire v6 + storage v7 + ```match/```order import) | ✅ Deployed (author-confirmed 2026-07-10); pointer-DRAG on a real device confirmed 2026-07-12 |
| Calculator parity Tier A (calc inequalities, per-row domains, widened function table, log regression) | ✅ Deployed + author-confirmed 2026-07-11. Tier B (Compute Engine) DEFERRED on pedagogical grounds. Movable points + Σ/Π dropped by author call |
| Migration 0009 (security/performance housekeeping) | ✅ Applied + fully verified 2026-07-11 (8-step MCP verification passed; advisor residue is intentional — see DECISIONS) |
| ```numberline``` + ```dataplot``` markdown import fences | ✅ Committed 2026-07-12, app-only; reach teachers via the SPA deploy (main pushed) |
| Pedagogical blocks — `learning_objectives`, `worked_example`, `faded_worked_example`, `self_explanation` | ✅ DEPLOYED 2026-07-12 (train author-run: ingest v9 then publish). Browser-verified on `/playground`. First three are content/scaffold (no wire bump); self-explanation is ungraded free text (wire v8→v9 `freeResponses`, storage v9→v10, new runtime module + RUNTIME.md contract + dashboard). **Markdown import shipped**: ` ```objectives / ```worked / ```faded / ```explain ` fences (app-only, rides SPA deploy). Nice-to-have author eyeballs: `{{}}`-in-faded-step keystroke, live self-explanation submit→dashboard round-trip |
| Phase 2.6 manual grading (short_answer + essay + rubrics + grading) | ✅ Code complete (slices 1–5) + **DEPLOYED + live-verified** 2026-07-13. Migrations 0010+0011 applied; `get-feedback` (`verify_jwt:false`) + `publish-activity` deployed; anonymous get-feedback gate confirmed open, advisor clean. In-document rubrics; `grades` table + RLS + direct upsert; teacher grading UI (side-by-side + Needs-grading filter); student feedback via `get-feedback` + a conditional sidecar (base runtime 39.2 KiB). **Markdown import: ` ```shortanswer ` + ` ```essay ` fences added 2026-07-13** (rubric pipe grammar + essay `words:` range; app-only, `/playground`-verified). Only a human app-level round-trip smoke test remains |

Suite now (2026-07-21): schema 321 / graph-kit 370 / renderer 651 / app 721 unit + 145 e2e; typecheck + lint green (0 errors; pre-existing warnings only). The ```shortanswer/```essay import fences added 25 app tests. The four pedagogical blocks + import fences + Phase 2.6 short_answer/essay/rubrics added ~82 tests across the packages (incl. a runtime `init.test.ts` case proving a `fill_in_blank` NESTED in a `faded_worked_example` is discovered by `buildRefs`, and a jsdom `free-text.test.ts` for free-text capture/gather/persist + the essay word counter). `runtime-doc-contract.test.ts` classifies the pedagogical trio as CONTAINER and the three free-text types (`self_explanation` / `short_answer` / `essay`) as INTERACTIVE (their shared RUNTIME.md contract section is guard-enforced). Runtime bundle **base 41.8 KiB / graphs 49.1 KiB** minified (+ a 1.7 KiB feedback sidecar inlined only on gradable pages) (re-check with `pnpm bundle:renderer`; treat printed numbers as truth). **Both variants are now over the 40 KiB soft target** — under the 60 ceiling, accepted per the 2026-07-10 budget amendment (DECISIONS.md → "Runtime size budget amendment"). **Base has crossed its soft target** (the math-blank runtime landed on it) — the "scheduled, not discovered" rule now says schedule the budget-ladder lever (per-question-type inlining variants; `document.ts` already picks by body scan) BEFORE the next question-type generation lands. The graph-runtime-into-kit lever was pulled 2026-07-10 — graph work grows the cached kit, not the inline bundles. (Environment note: this machine is the 2026-07-04 recovery clone — old computer died; toolchain re-set-up verified by a full green run. Kit-upload creds live in a gitignored `.env.r2`, auto-loaded by `pnpm upload:graph-kit` — the upload is an explicit command; `pnpm build:graph-kit` is build-only and never touches R2; see `.env.r2.example`.)

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
│   ├── graph-kit/     — @activity/graph-kit: shared graphing kit (Phase 2.7). evaluate.ts (math.js seam) + calculator.ts (mountCalculator) + runtime.ts (lazy kit runtime) + runtime-contract.ts (bridge↔kit types). mathlive + mathjs. Lazy-loaded on published pages; imported directly by the editor preview
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7
│       └── src/
│           ├── editor/     — Tiptap extensions, NodeViews, popover hosts, toolbar, slash menu
│           ├── components/ — PublishControl, ImportMarkdownDialog, RequireAuth
│           ├── routes/     — Activities, ActivityEditor, ActivityPrint, Submissions, Playground (dev-only)
│           ├── lib/        — serialize.ts, submissions.ts, uploadImage.ts, markdownToTiptap.ts, markdownImportPrompt.ts, foldable/ (print engine)
│           └── __tests__/
├── supabase/
│   ├── migrations/    — 0001–0012 (all applied)
│   └── functions/     — publish-activity, ingest-submission, upload-image, _shared/ (cors.ts, renderer.bundle.js + graph-kit-manifest.ts — auto-generated)
├── scripts/           — bundle-renderer.mjs; seed-test-data.sql; seed-e2e-activity.sql; seed-e2e-locked.sql
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Storage bucket (legacy):** `activities` — deleted 2026-06-18 after R2 verified end-to-end (note: the app's `.from('activities')` calls are the DB table, not this bucket)
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

**Last updated:** 2026-07-21 (**Editor arc: stage 6 (snap motion) + stage 7 (toolbar-diet cleanup) SHIPPED; focus mode deferred.** Stage 6 = settle-on-place + accent dropcursor + reduced-motion sweep (13 unit + 7 e2e; eng-reviewed, outside voice reversed the detection mechanism to explicit meta-tagging). Stage 7 = removed the last inline control duplicating a settings field (faded-example "Label steps" toggle); block-style picker + column cluster kept in the toolbar (author call); focus mode deferred to its own mini-arc (needs a caret-tracking plugin). Also **greened the whole e2e suite** — fixed 5 stale gutter/quickbar/select-state tests from the right-gutter rework (127 e2e passed). Noted a minor real papercut: the gutter "+" can overlap the drag grip on short blocks. Chip open: slash menu dies under synthetic keyboard input. Full records in the deferred-remainders list above + [HISTORY.md](docs/HISTORY.md). **Prior sessions (2026-07-13 → 07-20)** — Model A/B math blanks (build + deploy trains + owner eyeballs), dark mode + graph-kit color pass, image crop mode, the columns→strict-grid refactor, the Notion-hybrid editor stages 0–7, and the number_line/data_plot/pedagogical-block trains — **are archived in [HISTORY.md](docs/HISTORY.md)**.)
