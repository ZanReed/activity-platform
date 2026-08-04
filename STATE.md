# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**🔎 ONE DECISION OPEN — a THIRD teacher account publishes the real name "Zan Reed" to the anonymous pre-auth screen.** Surfaced by 0021's verification, not by the leak report. `users` holds three teacher rows: the two 2026-05-05 rows (gmail + dallasisd) whose display_name WAS the email and is now NULL, plus a 2026-07-29 gmail row where Google did supply a `full_name`, so it holds `"Zan Reed"` — untouched by the backfill *by design* (it scopes to `display_name = email`, so it never rewrites a name a user chose). Verified live over HTTP: activity `290f0951` ("Untitled activity") returns `teacher_name:"Zan Reed"` to an unauthenticated caller. **This is ruling 3.2A working as intended** — a name is exactly what that screen is for, and nothing is leaking. But the author picked NULL for their own attribution, and may not have known a second row would still publish their full legal name. **Decide:** leave it (a real name is the intended contract), NULL it to match the other rows, or set the classroom form ("Mr. Reed"). Any of the three is a one-line UPDATE; none is urgent.

**🧹 E2E residue: 44 `section_checks` rows** on activity `6a84c8cb` from the S4 timing runs (`section_checks` has no DELETE policy by design). Harmless — the author's own account on their own test activity — but clear when convenient, service role:
```sql
delete from section_checks where activity_id = '6a84c8cb-fc49-4338-ab49-927ba6254f20';
```

**Otherwise EMPTY — verified against the live project, not assumed** (2026-08-04 `list_migrations` + advisor run; function flags last confirmed 2026-08-03 with the shuffle deploy): **migrations applied through 0021**; `ingest-submission` v42 / `get-feedback` v4 / `get-activity` v7 all `verify_jwt:false`; `check-activity` v5 + `publish-activity` v122 both `verify_jwt:true`; kit manifest `graph-kit-R5LUPQJS.js` committed. Deploy narratives archived in [HISTORY.md](docs/HISTORY.md).

*0021 verification, run 2026-08-04 after the author applied it — all green.* `verify-0021.sql` A1–A3 / B1 / C1–C2 pass (trigger carries no email fallback, RPC guard present, grants survived REPLACE, 0 fallback artifacts, 0 leaking activities). Regression re-runs clean: `verify-0017.sql` A1–A3 / B1–B2 / D1 (D1 still returns exactly the one documented anon row), `verify-0013-0014.sql` A1–A7 / B1–B6. **Live end-to-end over HTTP, no `Authorization` header:** the two email-backed activities now return `teacher_name:null` with titles intact. Security advisor shows no NEW findings — every lint is the documented intentional residue (0009/0015/0016/0017 footers); `auth_leaked_password_protection` is unrelated (OAuth-only project, no passwords). One script fix fell out: `verify-0013-0014.sql` B5 said "EXPECT 5" while querying both migrations' policies — 0014's own `classes_insert_teacher` makes it 6. Corrected in the script.

## Standing constraints & watch items (current arc)

- **The R2 graph-kit has exactly ONE consumer left: the published-page path** (`renderer/src/document.ts` + `publish-activity` reading the manifest). It dies with publishing at **S9** and cannot be removed earlier — until cutover, published pages are the only student path that can be graded end to end at scale. Do NOT "finish the Cloudflare exit" by ripping the kit out early. The viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk — never the R2 summon path), so **no kit upload is needed for viewer-side kit changes** (the 2026-07-31 ungraded-mode upload was verified moot; see HISTORY).
- **⚠ ONE PROMISE UNPROVEN, deliberately visible:** offline reopen against the built service worker is `test.fixme` in `e2e/sw/service-worker.e2e.ts`, evidence inline + in [TODOS.md](TODOS.md). **Close before S9 cutover** — that's when students meet the path.
- **Known limitation (stated, not hidden):** offline boot needs a token that has not expired. Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading supabase's session storage directly in shipped code is a dependency worth refusing.
- **⏸ PARKED, with the author's reason (2026-08-01): the teacher-grading slice.** Free text is captured by every check but nothing can grade it yet. Not pressing — no teachers using the system right now; urgent the moment one does. Context in [TODOS.md](TODOS.md) → "Teacher grading bound to `section_checks`".
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. The test's own comment claims the fixed PRNG "can never flake". Recorded so a second sighting is treated as a pattern, not a surprise — the seeded shuffle is load-bearing for S4's ordering omission rule.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative; drive the drawer via node-selection + gear + Advanced. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.

## Current focus — components-as-data re-architecture

**THE ACTIVE ARC (RULED 2026-07-28; eng + design reviews CLEARED, 0 unresolved).** Full re-architecture of the student path: live-API viewer SPA + student accounts (district Google SSO) + React component per block (single registry) + server-authoritative grading (answers never reach clients) + upgrade-on-read + hard cutover. **Sequencing (author's explicit call): rewrite first; the August Algebra I release is deliberately delayed** ("good architecture is worth the wait"). **Scope amendment (author, 2026-07-28): "there are no old pages to maintain"** — live R2 pages are the author's own tests, so S9 cutover DELETES the anonymous identity/wire machinery instead of preserving it. **Hosting ruling (2026-07-31): Supabase-only backend; the SPA stays on Cloudflare Pages as a deliberately swappable static host** (no Workers/KV/`_redirects`); R2 publishing, the R2 kit path, and R2 fonts all die at S9. All rulings, wireframe, tasks: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`; reasoning in [DECISIONS.md](docs/DECISIONS.md) (→ "Student identity S1", "Read API S2", the S4–S6 entries) and the ROADMAP correction banner.

**Slice ledger — S0 through S6 are ALL COMPLETE** (narratives in [HISTORY.md](docs/HISTORY.md); rulings in the gstack design doc):

| Slice | What | Closed |
|---|---|---|
| S0 registry + tokens | `packages/viewer` block registry (22 entries, guard-enforced) + design-token layer | ✅ 2026-07-28 |
| S1 student identity | district Google SSO, `student` role, compliance pack | ✅ 2026-07-28 |
| S2 read API | `get-activity` (anon meta / authed sanitized content), answer-key sanitizer + `SANITIZER_REV` cache, migration 0017 | ✅ 2026-07-28, deployed |
| S3 viewer | 22 block components + conformance factory + live route `/a/:activityId` | ✅ 2026-07-31 |
| S4 grading | `check-activity` RPC + engine + golden corpus parity gate + migration 0020 | ✅ 2026-08-01, live E2E 13/13 |
| S5 student print | print layer + rules gate + screenshot baselines + pagination pass | ✅ 2026-08-01 (legs closed in S5.5) |
| S6 local-first | buffer, queued checks, tab lock, sign-out hardening, service worker | ✅ 2026-08-02 |
| S5.5 teacher print | ActivityPrint + answer key + versions + foldable on the viewer tree; renderer out of app product code | ✅ 2026-08-03, CLOSED |

**⏭ NEXT: the remaining lanes, in the arc's own order — S7 analytics census · S8 perf-budget CI · S9 cutover** (S9 needs both parity gates green — the grading corpus gate and the print gate both already run in CI — plus the sw-offline fixme above). Task detail lives in the gstack design doc; nothing in S0–S6/S5.5 is outstanding. **S9 cutover cleanup checklist (2026-07-31 ruling, kept here so it isn't lost to HISTORY):** delete publish-activity's R2 upload path, the R2 secrets on the functions, `VITE_PUBLISHED_URL_BASE`, the R2 origin in `ALLOWED_ORIGINS`, then the bucket itself; the R2 kit machinery (`upload:graph-kit`, the manifest, `.env.r2`) and `build:fonts`/`build:mathlive-fonts` die with it; existing test-activity image `src`es on R2 keep resolving until the bucket dies, no rewrite needed; the census folds into the S9 publish rewrite (R6).

**Suite (verified against `pnpm test` output 2026-08-04):** schema 340 / graph-kit 384 / viewer 1018 / renderer 724 / app 1026 unit, **61 print e2e**, plus the editor/student/sw e2e lanes (227 pass, 2 parked). Typecheck + lint clean; all three bundles regenerate clean. Treat the tools' printed numbers as truth, not this line.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin (CSS can't identify the caret block); off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

## Backlog / candidate arcs

- **▶ SCHEDULED — runtime budget-ladder: per-question-type inlining variants (do BEFORE the next question-type generation).** The base runtime is **41.8 KiB, over its 40 KiB soft target** (the math-blank runtime pushed it over); the 2026-07-10 amendment ([DECISIONS.md](docs/DECISIONS.md) → "Runtime size budget amendment") says pull a structural lever when a variant nears the ceiling, "scheduled, not discovered." This is that lever. **Mechanism already exists:** [document.ts](packages/renderer/src/document.ts) picks the runtime by scanning the rendered `body` for marker attributes. **Approach:** carve the less-common question machinery (free-text, `matching`, `ordering`, math-blank glue) out of the always-on base into conditionally-inlined chunks, leaving a minimal core. **Constraints (eng-review at pickup):** the runtime invariants must survive the split — `init.ts` the only DOM walker, `render()` the only mutator, vanilla-TS chunks, no `@activity/schema`; re-measure every variant after. Not blocking today (no new question type queued), but must land before one does. NB the renderer retires at S9 — weigh whether this lever is still worth pulling as S9 approaches.
- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants (print-with-my-work) — print parity is green; pick up when asked. (5) Solution-unlock pedagogy pass — informed by census data on check patterns. (6) /design-consultation brand pass — when the identity question goes live.
- **Free activity catalog / "Activity Bank"** (Phase 2 cold-start lever; [free-activity-catalog.md](docs/design/free-activity-catalog.md); Bank design + rulings `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260724-010349.md`). Timing superseded 2026-07-28 — moved behind the rewrite; Drop 0 hosting prep done ([runbook](docs/drop0-hosting-runbook.md)). One open item: #6 taxonomy/tags — author wants a tags discussion at kickoff. Post-S9 note: the catalog's discovery surface becomes a viewer route, not the R2 URL (see ROADMAP banner).
- **Vocabulary glossary — Phase 4** (tenant-scoped store + `glossaryKey` resolution; additive to the shipped mark; [vocabulary-definitions.md](docs/design/vocabulary-definitions.md)).
- **Long-term OCR/AI (designs captured 2026-06-16):** [pdf-import.md](docs/design/pdf-import.md) + [photo-grading.md](docs/design/photo-grading.md). Photo-grading needs one refactor: server-shareable answer evaluation — largely arrived with S4's grading engine; re-check at kickoff.
- **Teacher "how your name appears to students" control** (deferred 2026-08-04 with the 0021 privacy fix): a small edit writing `users.display_name` under the existing self-only RLS — no settings surface exists yet, and the one real teacher account is covered by the NULL backfill. Pick up when a second teacher onboards (or fold into the S9-era account surface). Until then that teacher's pre-auth screen says "your teacher".
- **Other Phase 2 "decide at phase start":** image-hosting quota, `skills` editing UI.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | ✅ Complete; live-verified |
| Database migrations 0001–0020 | ✅ Applied; RLS verified (per-migration records in HISTORY; re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration) |
| Components-as-data slices S0–S6 + S5.5 | ✅ Complete — see the slice ledger above |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI |
| Structural columns + strict-grid editor + Notion-hybrid editor (stages 0–7) | ✅ Complete; app-only |
| Variable block sizing + image crop + dark mode (chrome/editor/boards) | ✅ Complete; deployed |
| Markdown paste import (format spec + Copy-AI prompt + registry drift-guards; importer parity arc CLOSED) | ✅ Complete; every editor-authored capability has a markdown path |
| Question types: fill-in-blank (text/numeric/math), MC, matching, ordering, interactive graph (+ systems), number line, data plot | ✅ All live; wire v9, storage v12 (source of truth: `runtime/submission.ts` / `runtime/storage.ts`) |
| Pedagogical blocks (objectives, worked/faded examples, self-explanation) + callout | ✅ Deployed 2026-07-12 / 07-21 |
| Phase 2.6 manual grading (short_answer + essay + rubrics + teacher UI + get-feedback) | ✅ Deployed + live-verified 2026-07-13 |
| Calculator tool (Phase 2.7 stages 1–4 + graphing UX overhaul) | ✅ Live |
| Reference panel + graph_figure + inline/block-level definitions + print glossary | ✅ Deployed 2026-07-27 (publish-activity v120) |
| Activity typography (`meta.typography`; registry now shared in `@activity/schema/fonts`) | ✅ Deployed; viewer wired in S5 |
| Edge Functions (5) + deploy flags | ✅ All live, flags verified 2026-08-03 (see Pending author actions) |
| Cloudflare R2 hosting (published HTML + kit + fonts) | ✅ Live — retires at S9 (see Standing constraints) |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + 3 bundle-drift guards + print gates job) | ✅ Green |

*(Per-feature detail that used to live in this table — deploy trains, kit hashes, verification narratives — is archived in [HISTORY.md](docs/HISTORY.md); the suite-growth ledger is there too.)*

## Repo layout

```
activity-platform/
├── docs/
│   ├── design/        — feature designs captured ahead of implementation
│   ├── DECISIONS.md   — architecture decisions + reasoning
│   ├── HISTORY.md     — archived completed-work logs
│   └── COLLABORATION.md — working-with-the-author notes
├── packages/
│   ├── schema/        — Zod types, document model, factories, fonts registry
│   ├── viewer/        — @activity/viewer: block registry + components + sanitize/server + grading engine + fixtures + print layer
│   ├── renderer/      — pure JSON → HTML string; KaTeX inlined; no DOM (published pages only; retires at S9)
│   │   ├── RUNTIME.md — runtime architecture + data-attribute contract
│   │   └── src/runtime/ — published-page runtime (DOM TS, own tsconfig)
│   ├── graph-kit/     — @activity/graph-kit: shared graphing kit + /scorers + /static-svg pure subpaths
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7 (editor, dashboard, viewer routes, print)
├── supabase/
│   ├── migrations/    — numbered SQL migrations (applied set = `supabase migration list`; see migrations/README.md)
│   └── functions/     — publish-activity, ingest-submission, get-feedback, get-activity, check-activity, _shared/ (cors.ts + the generated renderer/viewer-server/grading-server bundles + graph-kit-manifest.ts)
├── scripts/           — bundlers (renderer/viewer-server/grading-server/graph-kit), deploy-train, verify-* SQL/JS
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform`
- **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Teacher allowlist + student SSO (S1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` in `.env.local` (gitignored) mirrors the write-only `R2_PUBLIC_URL_BASE` secret; unset → published-page links hide. Dies at S9.

## Open questions / deferred decisions

- **Empty fill_in_blank drag handle attachment** — whether `definingForContent: true` changed the handles-only-on-non-empty behavior is unverified; re-test during a drag-reorder pass. Minor.
- **Blank popover: one-click switch between chips** — deferred design decision, no data loss; reasoning in [DECISIONS.md](docs/DECISIONS.md) → "Fill-in-blank authoring (Stage 13.5)". Needs a dedicated design pass (FocusTrap/selection entanglement).
- **Section metadata panel** — SectionBreakView's inline title/checkpoint UI is adequate; an editor-level panel remains optional.
- **Responsive `--blank-width` sizing** — deferred from Stage 11.
- **`skills` editing UI** — the field round-trips everywhere, only the editing control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **UX validation with 2–3 other teachers** on the editor patterns before classroom adoption — cost rises sharply once students use activities.
- **Post-success edit edge case** — locked/single paths briefly write-then-remove the persistence blob (wasteful but correct). Low priority.
- **CDN-hosted shared runtime** (Phase 3+) — likely mooted by S9 (published pages retire); re-evaluate only if publishing survives in some form.
- **Multi-tenancy / governance when a teacher leaves a district** — Phase 4; helpers are designed for it.
- **Media storage/privacy posture** (Phase 2.8), **annotation coordinate space** (Phase 2.9) — each decided at its phase start.

---

**Last updated:** 2026-08-04 — **display_name privacy fix ruled, built, APPLIED, and verified (migration 0021).** Trigger stops storing emails, anon meta RPC refuses to return them, 2 rows backfilled to NULL; name-appearance control backlogged. Full verification pass green including a live anonymous HTTP fetch (detail under Pending author actions). One decision left open there: a third account still publishes the real name "Zan Reed" — intended behavior, but worth an explicit call. Earlier same day: drift audit + STATE restructure (9 mechanical findings fixed, finished narratives to [HISTORY.md](docs/HISTORY.md)); suite verified green (counts above).

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
