# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**⏭ NOW: the author stations.** The five build drops are ALL repo-side complete and pushed, and **the Drop 2/4/5 CI gate (OV-DX-8) is CLOSED — run 31791526509 GREEN**, the first green run on `main` since the arc began.

0. **⏭ NOW: push the 2 unpushed commits** (`c828409` gate-9 ruling · `e6b2872` gap-2 instrumentation) → CI gate. The prior batch (recalibration + fonts fix) went GREEN on run 31852826598 — **the fonts fix is on `main` and auto-deploying to Pages; run the curl in the R2 runbook (pending action 3, step 1) to confirm before any bucket step.** Tab-lock family: four consecutive clean runs — closed unless a fifth sighting appears.
   ⚠ **Watch-note (the retry-log discipline): run 31852826598 carried 1 flaky — the a11y gap-2 keyboard row, its FIRST sighting.** Status stayed "" after Enter = the click never fired. Theory (not proven): MathLive's keyboard sink settles async and steals focus in the sample→Enter window — the walk only got long enough to cross that window when the scan became honest. Instrumented in `e6b2872` (the failure now names where focus is); **a second sighting is conclusive — fix then, not before.**
1. ✅ **DONE 2026-08-14 — the integration lane's first green run: 3/3.** Docker Desktop installed, `supabase start` up, and the lane found **three real defects on its first honest run** — the lane built to end stub-blindness earning its keep, partly by finding its own stubs. Detail in [HISTORY.md](docs/HISTORY.md); the fixes are `b17b0fc` (unpushed):
   - **The migration chain could not be replayed AT ALL.** 0009 revokes on `rls_auto_enable()`, a function it documents as dashboard-created — invisible from live (where it exists), fatal on a fresh replay. No new environment, no disaster recovery from migrations, and no integration lane on ANY machine. **0009 guarded + 0031 recreates it**, written so live is a strict no-op (creates only when absent; never `create or replace`, so live's definition is never overwritten). ⚠ The 0031 body is a RECONSTRUCTION — nothing ever recorded the original; the file carries the query to diff it against live.
   - **The migrations never granted the client roles.** Every pre-0028 table got anon/authenticated/service_role DML from Supabase's HOSTED PLATFORM DEFAULTS, which the local CLI stack does not reproduce — so 10 of 11 policy-bearing tables had RLS policies that could never be satisfied. **0032 encodes them, read OFF live**; the rebuilt grant matrix now diffs **IDENTICAL** to live. It reproduces live's full breadth deliberately: a local DB stricter than production MASKS RLS defects.
   - **Three of the lane's own assertions were stubs** (retyped UI copy in a lane that had never executed): "Activities" vs the real "My activities", a curly U+2019 against the source's `&apos;`, and PostgREST seeding as service_role. Seeding now runs as postgres per 0013's documented path — not by widening the admission-boundary grants 0027/0028 hardened.
1a. **Push `b17b0fc`, then apply 0031 + 0032 live.** Both are deliberate no-ops on live — they encode what live already has — so this is ledger hygiene, not a change: without it `supabase migration list` shows two permanently-pending rows and the next real migration's "EXPECT exactly ONE pending" check (OV-DX-4) reads wrong. **No ordering constraint against the push** (no UI calls anything they touch, so OV-7 does not bite). EXPECT: `db push` applies both; live grants and `rls_auto_enable` unchanged; `pnpm verify:auth --target live` still 85/0. ⚠ If `db push` reports anything other than a no-op effect on live state, STOP — that would mean live diverged from the matrix 0032 was read off of.
2. **Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live, so the mis-cased-teacher defect is disarmed). ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student.
3. **R2 teardown station** — [s9-cutover.md](docs/design/s9-cutover.md) §8 verbatim. **Both pre-checks RAN 2026-08-14; read these before the station:**
   - **D-13a (font check): grep half PASSES** (0 r2.dev refs in dist) — **but the question it stands in for had a bad answer, now fixed (`d9a93f6`):** post-S9 the app-bundled kit derived its MathLive fonts URL as a chunk-sibling that didn't exist in dist, so **production math fields 404'd their glyphs** (invisible from dev — localhost takes the CDN branch). The build now copies the 20 woff2 files into `dist/assets/mathlive-fonts/v<version>/` with a build-failing version guard. **Consequence: the app needs NO external font host; the bucket teardown cannot regress math rendering.** ✅ **DEPLOY CONFIRMED 2026-08-15:** `curl -sI https://activity-platform.pages.dev/assets/mathlive-fonts/v0.109.2/KaTeX_Main-Regular.woff2` → **200, `font/woff2`** — the teardown's ordering prerequisite is met.
   - ✅ **D-13b CLOSED (author ruling 2026-08-15): the one reference (`290f0951…`, "Untitled activity") is DISPOSABLE** — no action; its image dies with the bucket (and is in the backup anyway).
   - ✅ **Bucket download DONE 2026-08-15 (OV-DX-10):** `r2-final-backup-20260815/` at repo root (untracked) — **283/283 objects, 68M**, rclone against `activity-platform-published`, counts verified both sides.
   - ✅ **Deletion commit CUT 2026-08-15:** `build:graph-kit` + `upload:graph-kit` + `build:fonts` + `build:mathlive-fonts` + their script files + `.env.r2`(+example) deleted; README rows gone; mathlive-setup.ts header rewritten to the app-bundle reality (P5). P10 find: the build half (`build:graph-kit`) was already BROKEN — its manifest target died at Drop 4 — so the file went whole, not just the upload flag.
   - **⏭ REMAINING (author, in order):** (1) `supabase secrets unset R2_ACCESS_KEY_ID R2_ACCOUNT_ID R2_BUCKET_NAME R2_PUBLIC_URL_BASE R2_SECRET_ACCESS_KEY IP_HASH_SALT SUBMISSION_ENDPOINT` — all seven verified zero-reader in function code, bundles included (the last two are 0029-era relics); EXPECT `supabase secrets list` no longer shows them. (2) `supabase secrets set ALLOWED_ORIGINS="http://localhost:5173,https://activity-platform.pages.dev"` — read at runtime by `_shared/cors.ts`, no redeploy needed; after it, say the word and the CORS probe (pages.dev origin allowed, dead R2 origin refused) gets run from here. (3) **Bucket delete LAST** (Cloudflare dashboard).
4. **Gate 9 — ✅ CLOSED 2026-08-15.** The 150 KiB ruling landed (author): **track only** — the number is a ledger, priced per addition, and what is realistically achievable gets decided at the end of the refactor (recorded in [TODOS.md](TODOS.md) → the shell-target entry). The mechanical record, for reference: The ledger closed at 5, `TIMING_TARGET_MS` was **recalibrated by the rule** (`9b78496`: 969/1118/1828 → **992/1135/1812**, every shift under ±2.5% — scatter, not regression), and the **s8-retro posted checklist was re-run** (appended to [s8-retro.md](docs/reviews/s8-retro.md) — items 5–9 + audit addenda all answered; content-marker ownership stays deliberately open). **Remaining: RULE the 150 KiB shell number** (author) — entry is 174.0/185 and has drifted 168.4→174.0 with every addition priced; the retro re-run names this as item 8's live question.

| # | run | pre-auth | worksheet | math-rendered | flaky |
|---|---|---|---|---|---|
| 1 | 31791526509 | 1024 ms | 1163 ms | 1844 ms | 2 |
| 2 | 31795715961 | 944 ms | 1089 ms | 1807 ms | 0 |
| 3 | 31796358508 | 1009 ms | 1144 ms | 1812 ms | 0 |
| 4 | 31803968894 | 992 ms | 1135 ms | 1844 ms | 0 |
| 5 | 31805589675 | 969 ms | 1096 ms | 1792 ms | 0 |

**CLOSED ledger — medians 992 / 1135 / 1812, committed as the new targets.** Kept for the flaky column: four consecutive zeroes is the tab-lock family's evidence.
5. **P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, and a materially faster author across the run — the numbers would encode a learning curve). **The slot stays open for the NEXT representative multi-station day.**

**Station HEADs recorded (OV-DX-9)** — deploy-state markers, not "last commit containing the source":

| Drop | HEAD | Note |
|---|---|---|
| 1 publish rewrite | `27a4a08dd7b58aa460f5c13d9d360d85f0ec13df` | `publish-activity` still in tree here; deleted at Drop 4 |
| 3 demolition | `63db47659d7631f04ba9e9da1b6e8f59cc78be04` | the three deleted functions' dirs still in tree; died at Drop 4 |
| 2 content surface | `5af20539823f8b6dd1265a8e6ce273e0a6fa8c5b` | the UI commit; pushed in the Drop 4+2+5 batch (pushed HEAD at station time: `227af90`) |

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows that held emails; the author then ruled (2026-08-04) that the third — a 2026-07-29 account where Google DID supply `full_name`, so it held the real name — should be NULL too. That row was outside 0021's scope by design (the backfill only touches `display_name = email`, so it never rewrites a chosen name), so it was cleared with a direct one-row UPDATE, **not a migration**. Consequence: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name**. See the name-appearance design signal in Backlog.

**Baseline facts, live as of 2026-08-14:** migrations applied **through 0030**; exactly **TWO** Edge Functions — `get-activity` **v11** (`verify_jwt:false`, the only one) + `check-activity` **v7** (`verify_jwt:true`); `publish-activity` / `ingest-submission` / `get-feedback` all DELETED from the platform. `pnpm verify:auth --target live` = **85 passed / 0 failed across 8 scripts**. **Re-verify flags with `list_edge_functions` after every deploy** — and read the flag field, not the `entrypoint_path` suffix beside it (that misread produced a false "verified live" stamp once; see HISTORY).

**Owed, not blocking cutover:** the author's legal read of the D2/D3 pack's changed sentences (committed `73ab7bc`, `POLICY_VERSION 2026-08-07-draft-2`), plus the Drop 3 compliance edits. **Standing gate D24: counsel/district reads the pack before the first real classroom** — it has never had legal review and every file says DRAFT.

## Standing constraints & watch items (current arc)

- **✅ The R2 graph-kit path is DEAD code-side (S9 Drop 4):** the viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk) — no kit upload is ever needed again. What remains is the teardown station above.
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **⏸ PARKED, with the author's reason (2026-08-01): the teacher-grading slice.** Free text is captured by every check but nothing can grade it yet. Not pressing — no teachers using the system right now; urgent the moment one does. ⚠ **`get-feedback` is NOT a reference implementation** — it served bodiless 200s its entire life (P9 audit, HISTORY). Context in [TODOS.md](TODOS.md).
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Two e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); and `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist.

## Current focus — components-as-data re-architecture

**THE ACTIVE ARC (RULED 2026-07-28; eng + design reviews CLEARED).** Full re-architecture of the student path: live-API viewer SPA + student accounts (district Google SSO) + React component per block (single registry) + server-authoritative grading (answers never reach clients) + hard cutover. **Sequencing (author's explicit call): rewrite first; the August Algebra I release is deliberately delayed.** **Scope amendment (2026-07-28): "there are no old pages to maintain"** — live R2 pages are the author's own tests, so S9 DELETES the anonymous identity/wire machinery instead of preserving it. **Hosting (2026-07-31): Supabase-only backend; the SPA stays on Cloudflare Pages as a deliberately swappable static host.** All rulings: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`; reasoning in [DECISIONS.md](docs/DECISIONS.md).

**Slice ledger — S0 through S9 are ALL COMPLETE** (narratives in [HISTORY.md](docs/HISTORY.md)):

| Slice | What | Closed |
|---|---|---|
| S0 registry + tokens | `packages/viewer` block registry (22 entries, guard-enforced) + design tokens | ✅ 2026-07-28 |
| S1 student identity | district Google SSO, `student` role, compliance pack | ✅ 2026-07-28 |
| S2 read API | `get-activity` (anon meta / authed sanitized content), sanitizer + `SANITIZER_REV` cache, 0017 | ✅ 2026-07-28 |
| S3 viewer | 22 block components + conformance factory + live route `/a/:activityId` | ✅ 2026-07-31 |
| S4 grading | `check-activity` RPC + engine + golden corpus parity gate + 0020 | ✅ 2026-08-01 |
| S5 student print | print layer + rules gate + screenshot baselines + pagination pass | ✅ 2026-08-01 |
| S6 local-first | buffer, queued checks, tab lock, sign-out hardening, service worker | ✅ 2026-08-02 |
| S5.5 teacher print | ActivityPrint + answer key + versions + foldable on the viewer tree | ✅ 2026-08-03 |
| S7 analytics census | derived census + item map on the read path, read-cache GC, teacher panel, 0026 | ✅ 2026-08-04 |
| S8 perf-budget CI | route split, 12 CI size budgets + 38 script tests, throttled perf lane, math preload | ✅ 2026-08-05 |
| S9-prep identity | 0027 (+0028), role-gated student shell, `/join/:code`, `pnpm verify:auth`, 15 identity e2e rows | ✅ 2026-08-14 |
| **S9 cutover** | **5 drops: publish rewrite · demolition · renderer death · content surface · proof lanes** | ✅ **repo-side 2026-08-14; author stations open** |

**Cutover gates C1–C15 — 14 of 15 CLOSED.** Still open: **gate 4** (seed `student_domain` + live student-branch verify — pending action 2; it gates the FIRST CLASSROOM, not the cutover). Gate 9 fully closed 2026-08-15 (recalibration + retro re-run 08-14; the 150 KiB track-only ruling 08-15). Gate 13's cutover half is satisfied; its counsel read (D24) gates classrooms, not cutover. Rulings + detail in [findings-backlog.md](docs/reviews/findings-backlog.md) → RULINGS; plan in [s9-cutover.md](docs/design/s9-cutover.md) (D-1…D-14 + eng §7 + DX §8/§9 + design §10).

**Timing calibration — RECALIBRATED 2026-08-14 (the gate-9 re-measure, done by the rule).** `TIMING_TARGET_MS` = medians of the 5 post-cutover green runs (pre-auth **992**, worksheet **1135**, math-rendered **1812**; `9b78496`); the 2× ceiling and delta warning derive from these. Recalibrate only by the same rule — median of ≥5 green runs, never local darwin, never a single run. (Both ledgers archived: 08-07/09 in HISTORY, post-cutover above.)

**Suite (tool-verified 2026-08-14):** schema 340 / graph-kit 384 / viewer 1126 / app 1026 unit, plus **38 budget-script tests**, the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (the four CI lanes run 71 rows). Typecheck + lint clean (0 errors); all 12 perf budgets pass (entry 174.0/185 KiB gz). Treat the tools' printed numbers as truth, not this line.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin; off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

## Backlog / candidate arcs

- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered; **IdP map recorded 2026-08-09** — LMSes are not IdPs; expansion order is Azure/Entra → Clever/ClassLink → LTI 1.3. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants. (5) Solution-unlock pedagogy pass. (6) /design-consultation brand pass.
- **⚑ Admission model re-ruling — SIGNAL RECORDED 2026-08-15, author prefers option C** ([admission-model.md](docs/design/admission-model.md)): teacher-anchored admission by default (the DeltaMath model — verified: *"You'll need a class code to create an account"*), domain requirement becomes a per-class/district toggle instead of the floor. Browse-verified competitor + FTC-v.-Edmodo analysis in the doc, including the precise Edmodo lesson (the violation was outsourcing consent duties without operator-side notice/minimization — **copy Gimkit's enrollment-=-consent mechanism, not Blooket's "school is responsible" clause**). Needs its own design + eng review; trigger = catalog-arc kickoff or first external teacher. Gate 4 proceeds unchanged (the author's district = a `require_domain` district under C).
- **Free activity catalog / "Activity Bank"** (Phase 2 cold-start lever; [free-activity-catalog.md](docs/design/free-activity-catalog.md)). Moved behind the rewrite 2026-07-28; Drop 0 hosting prep done. One open item: taxonomy/tags — author wants a tags discussion at kickoff. Post-S9: the discovery surface is a viewer route, not an R2 URL. **The admission signal above is now a kickoff input.**
- **Vocabulary glossary — Phase 4** (tenant-scoped store + `glossaryKey` resolution; additive to the shipped mark).
- **Long-term OCR/AI:** [pdf-import.md](docs/design/pdf-import.md) + [photo-grading.md](docs/design/photo-grading.md). Photo-grading needs server-shareable answer evaluation — largely arrived with S4's grading engine; re-check at kickoff.
- **Teacher "how your name appears to students" control** (deferred 2026-08-04): a small edit writing `users.display_name` under existing self-only RLS. **Design signal from the author's own two rulings that day:** the control should NOT silently adopt Google's `full_name` as the published attribution — default to showing nothing and let the teacher opt IN. Until then the pre-auth screen says "your teacher".
- **Canvas keyboard stops** — Check sits 76 tab stops in on a full worksheet, ~17 of them canvas handles (all named, so not a violation). Measurement + the design question in [TODOS.md](TODOS.md).
- **Other Phase 2 "decide at phase start":** image-hosting quota, `skills` editing UI.

## Status by area

| Area | Status |
|---|---|
| Stages 9–16 (schema, renderer, runtime, editor, publish flow, submissions dashboard) | Historical — Phase 1 shipped and served its era; the renderer/runtime/publish-HTML/dashboard halves were deliberately DELETED at S9. Schema + editor live on |
| Database migrations 0001–0032 | ✅ 0001–0030 applied + verified live. **0031+0032 are REPRODUCIBILITY migrations, no-ops on live** (they encode what live already has: the dashboard-created `rls_auto_enable`, and the platform-default grants). ⚠ **0031/0032 NOT YET APPLIED live** — pending author action 1a. Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ All live |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor = the parked teacher-grading slice |
| Edge Functions (**2**) + deploy flags | ✅ get-activity v11 (`false`) + check-activity v7 (`true`); re-verified live 2026-08-14 |
| Cloudflare R2 hosting | ⚰️ Code-side DEAD; bucket + upload scripts await the teardown station |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + **2** bundle-drift guards + **12 perf budgets + 38 script tests** + print gates + perf/sw/student/**a11y** lane job) | ✅ **GREEN and CLEAN — run 31805589675, 71 passed / 0 flaky.** Five consecutive green runs, the last four with zero flaky (OV-DX-8 closed at 31791526509) |
| Student bundle (S8) | ✅ Entry chunk = the student shell, 174.0 KiB gz (cap 185); heavy libs lazy and content-pinned out of the shell |

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
│   ├── graph-kit/     — @activity/graph-kit: shared graphing kit + /scorers + /static-svg pure subpaths
│   └── app/           — Vite + React 19 + TS + Tailwind v4 + React Router v7 (editor, dashboard, viewer routes, print)
├── supabase/
│   ├── migrations/    — numbered SQL migrations (applied set = `supabase migration list`)
│   └── functions/     — get-activity, check-activity, _shared/ (cors.ts + the generated viewer-server/grading-server bundles)
├── scripts/           — bundlers (viewer-server/grading-server/graph-kit), verify-* SQL/JS + the verify runner
└── ...root configs
```

## Key constants

- **GitHub repo:** `ZanReed/activity-platform` · **Supabase project ref:** `dtqutpdplefmufrrakxs`
- **Auth:** Google OAuth via Supabase. Site URL `http://localhost:5173` for dev. Teacher allowlist + student SSO (S1).
- **Client env:** `VITE_PUBLISHED_URL_BASE` is DEAD (deleted at S9 Drop 1) — the share link is the viewer URL `${origin}/a/${activityId}`, env-free. `.env.local` still carries the Supabase pair (+ optional `VITE_DISTRICT_HINT`).

## Open questions / deferred decisions

- **Empty fill_in_blank drag handle attachment** — whether `definingForContent: true` changed the handles-only-on-non-empty behavior is unverified; re-test during a drag-reorder pass. Minor.
- **Blank popover: one-click switch between chips** — deferred design decision, no data loss. Needs a dedicated design pass (FocusTrap/selection entanglement).
- **Section metadata panel** — SectionBreakView's inline title/checkpoint UI is adequate; an editor-level panel remains optional.
- **Responsive `--blank-width` sizing** — deferred from Stage 11.
- **`skills` editing UI** — the field round-trips everywhere, only the editing control is missing. Don't add piecemeal without the per-skill-analytics scope.
- **UX validation with 2–3 other teachers** on the editor patterns before classroom adoption.
- **Post-success edit edge case** — locked/single paths briefly write-then-remove the persistence blob (wasteful but correct). Low priority.
- **Multi-tenancy / governance when a teacher leaves a district** — Phase 4; helpers are designed for it.
- **Media storage/privacy posture** (Phase 2.8), **annotation coordinate space** (Phase 2.9) — each decided at its phase start.

---

**Last updated:** 2026-08-14 (late) — **The S9 arc is down to two author decisions and the teardown steps.** Same-day close-outs: the integration lane's first green run (3/3 — after finding the chain unreplayable, the platform-default grant gap, and its own three stub assertions; 0031+0032 applied live as verified no-ops, 0031 now carrying live's `rls_auto_enable` byte-for-byte, md5-verified); gate 9's recalibration + s8-retro re-run (both by their pre-ruled procedures); the R2 station's two pre-checks — which found and fixed a real production defect: **math fields on the deployed app were 404ing their MathLive glyph fonts** (the app-bundled kit derives a chunk-sibling fonts URL that didn't exist in dist; the build now self-hosts the 20 woff2 files at that exact path, version-guarded — `d9a93f6`, must deploy before the bucket dies). Live: migrations through **0032**, two Edge Functions, `verify:auth --target live` 85/0. What remains: the 150 KiB ruling, gate 4's seeding, the D-13b disposability ruling, and the R2 dashboard/bucket steps — every one needs the author. Full narratives in [HISTORY.md](docs/HISTORY.md).

**The session's own finding, and why it matters more than its size:** the a11y lane went red on its first real CI run, and **the fix for it went red again for the same reason** — a "wait for the lazy blocks to mount" guard that counted markers which cannot exist before the chunk resolves, so it skipped the wait entirely and scanned the pre-mount DOM. Local passed; CI didn't. Underneath that vacuity sat a real WCAG A defect: **MathLive gives its keyboard sink `role="textbox"` with no accessible name, so a student's math answer box announced as an unlabeled textbox** — fixed by naming the shadow node, since 0.109.2 exposes no API for it. Its sibling `nested-interactive` is MathLive's own structure and is carved out by rule AND element, with a row that asserts the carve-out is still load-bearing so it self-retires. The failure-matrix tab-lock row failed a **second** time and is no longer a flake: the winner was snapshotted mid-settle and could move before the fill; it now requires two agreeing samples.

**Then the same lesson landed a third time, which is the part worth keeping.** The push went GREEN (run 31791526509 — OV-DX-8 closed), but with 2 flaky, and they were *not* the fixed row: they were its two `two tabs` siblings, holding byte-identical copies of the same idiom. Fixing the row CI happened to fail on had left the class intact, and it simply surfaced one row over. All four rows now share one `settledLockHolders()` helper, including the fourth that had not flaked yet — leaving one copy behind is how this returns a fourth time. **None of the three sightings reproduce locally, so the flaky count is the only real evidence** — and the next run came back **71 passed / 0 flaky** (31795715961). One clean run is corroboration rather than proof; the strong half of the argument is structural, that the idiom no longer exists in any of the four rows.

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
