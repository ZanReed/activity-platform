# Retro findings backlog — consolidated input for the eng review (2026-08-06)

Distilled from the nine slice retrospectives + independent audits in
`docs/reviews/s0…s8-retro.md` (all committed and pushed). Each item cites its
source (`s4:7` = s4-retro finding 7; `s4a` = that file's audit section). Grouped
by what kind of decision each needs. **A** can be greenlit as one mechanical code
drop; **B** is the review's real agenda — each needs a ruling; **C** is the S9
cutover checklist consolidated from all nine files; **D** is process policy to
ratify or reject.

Not in scope here: the full narratives (read the retro files) and anything
already fixed. The `check-section` URL bug (A1) has a pending task chip and can
run independently of the review.

---

## A. Mechanical — no design input needed (~2 days total; greenlight as a batch?)

**Live-bug / gate-arming tier (do first):**

| # | Fix | Source | Est |
|---|---|---|---|
| A1 | `check-section` → `check-activity` + shared constant the e2e helper imports + a test that the URL names an existing `supabase/functions/` dir | s4:7, s4a | 45–60m |
| A2 | `supabase/config.toml` pinning `verify_jwt` per function (false for the trio, true for check/publish) + CLAUDE.md update; author verifies on next deploy | s2a | 30m |
| A3 | Arm the S8 timing gate: set `TIMING_TARGET_MS` from the recorded runs, add the missing `mathRendered` entry | s8a | 15m |
| A4 | Route-mount smoke: apply `NON_RENDER_CHUNKS` filter + dedup to the "split works" leg | s8a | 10m |
| A5 | First direct test for `computeServedOrderings` (live in every check request, currently stubbed by every test) | s2a | 30m |
| A6 | S4 rate ceiling: pin that production runs the 60/60 defaults + one boundary case in verify-0020 + recorded classroom estimate | s4a | 45m |

**Bond-the-duplicates tier (tests only, no prod change):**

| # | Fix | Source | Est |
|---|---|---|---|
| A7 | Set-equality tests: `FREE_TEXT_TYPES`/`GRAPH_TYPES` ↔ registry families; the two `PROMPT_CARRIER_TYPES` declarations | s4:10, s0:w7 | 30m |
| A8 | `shuffleLockedBy` scope guard: never declarable on a type whose authored order is the answer key | s5.5a | 20m |
| A9 | Glossary bond: renderer-suite test comparing both `collectDefinitions` outputs on the shared fixture (or truth-fix the comment + S9 line) | s5.5:8 | 30m |
| A10 | S5 roster cross-check: structural/document roster ids ↔ e2e titles; derive the unit guard's subset; add-or-delete `section-confidence` | s5:7 | 45m |
| A11 | Retention pin: `retention-policy.md`'s window numbers ↔ the 0023/0025 values (md-side test, privacy-guard shape) | s1:w4 | 45m |
| A12 | Non-owner print-route jsdom case: failed fetch → error screen, never a rendered key | s5.5a | 30m |
| A13 | Poisoned-hint leak case + fix `corpus.ts:31`'s phantom 2.1A claim | s4:w4, s4a | 30m |

**Small code tier:**

| # | Fix | Source | Est |
|---|---|---|---|
| A14 | Deduplicate the lazy resolver (two `lazyCache` Maps → one module) — carried unfixed through three audits | s0a, s3:7 | 30m |
| A15 | `unavailable` gets its own non-retry copy; delete both write-only `retryable` fields + their comments | s4:9, s4a | 30m |
| A16 | e2e helper `wireVersion: 2` literal → `CHECK_WIRE_VERSION` import | s3:11 | 5m |
| A17 | Trim dead exports: server/index test-only re-exports, `SANITIZER_ALGO_REV` re-exports (+ comment naming the upgrade chain as a bump trigger — cheap alternative to hashing schema version now), `EXPRESSION_LIMITS`, `GradingSectionNotFound`, `IDLE_GRACE_MS`, `CreateClassInput`, the `VIEWER_STORAGE_PREFIX` re-export | s2:9, s2a, s1a | 45m |
| A18 | `answerKeyVariant`: delete (coverage map is the source) or re-pin to `ANSWER_KEY_COVERAGE`; regen viewer-server bundle | s5.5:10 | 30m |
| A19 | Font loader exhaustiveness (`satisfies never`) before the renderer's guard dies at S9 | s5a | 10m |
| A20 | graph-kit preload-on-detect (the `preloadMathIfNeeded` pattern applied to the heavier chunk) | s3a | 30m |
| A21 | `FUNCTIONS_BASE` env-less failure → `MISSING_ENV`, not `undefined/functions/v1` | s3a | 15m |
| A22 | Render or delete the fetched-but-never-shown `stale_cache_rows_deleted` panel field | s7a | 5m |
| A23 | Move the F12 "reprint answer keys" note outside `{version > 1}` (v1 is shuffled too) | s5:9 | 10m |
| A24 | Reconcile the walk-heuristic "this one is the source" comments (blockIndex vs grading walk) | s3:10 | 20m |
| A25 | `verify-0017.sql` §C1 expectation → NULL `teacher_name`; `0013` footer "EXPECT: 5" → 6 | s2a, s1a | 10m |
| A26 | Delete the ~58 lines of dead renderer-vocabulary CSS in `foldable/styles.ts` + fix its and `render.ts`'s headers | s5.5:9 | 20m |

**Docs tier (one sweep):**

| # | Fix | Source | Est |
|---|---|---|---|
| A27 | Stale-prose sweep, audit-corrected list: `printExpectations.ts:425,634`, viewer barrel `:57`, `viewer.css:1065`, viewer eslint justification, `DevViewer.tsx:60,156`, `ActivityPrint.tsx:298-299` | s5.5:11, s5.5a | 40m |
| A28 | DECISIONS annotations: S1 `submissions.student_id` superseded-by-S4-3 + retention 30d→400d; S2 entry gains the 0026 second writer + the hazard's *real* window (rollback/concurrent revs, not "after a deploy") | s1:8, s7a | 30m |
| A29 | Write the missing DECISIONS S3 entry (D4/D9/D11/D12/D14/D16 + ruling A distilled into the repo) | s3:13 | 60–90m |
| A30 | Join-flow prose: `Privacy.tsx`, `data-map.md`, `Classes.tsx:106-108` stop describing a flow that doesn't exist | s1:7, s1a | 20m |
| A31 | STATE: close the cron observation with the split verdict (purge half matched; analytics half's `census_versions=0` was stale before the run — and the "had not yet run" note was committed *after* the 03:00 UTC fire); fix the prediction | s7:8, s7a | 15m |
| A32 | Pick the catalog-wide ACL query as *the* post-DDL routine; make DECISIONS and migrations/README agree | s1a | 15m |
| A33 | D5 doc side: RUNTIME.md ×2 + CLAUDE.md still restate the 40/60 numbers `perf-budgets.mjs` owns | s8a | 15m |
| A34 | `walk.ts` header: declare the silent-coercion posture on malformed documents + TODOS entry for the real ruling (B8 below is the code option) | s4a | 20m |
| A35 | s6-retro scope line: `7d18b87`, V1–V9 + close-out (the file cites a nonexistent hash) | s6a | 5m |

## B. Design-needed — the review's agenda (rule each)

| # | Question | Source | Notes |
|---|---|---|---|
| B1 | **Dual-banner collision**: a pinned student sees "reload for the new version" directly under "your unsent work is safe here." Suppress the ViewerContainer banner when pinned? Lift the advisory into the route's dedup chain? | s4:8, s4a | Needs a prop through ViewerContainer's public surface; the route's own "at most ONE" comment already fails to enumerate its four arms |
| B2 | **Buffer status banner**: the quota/unavailable port is tested and unwired — at real quota a student silently loses work. Wire it into the banner chain (copy needed), or delete the port? | s6a | "Visible state indicators" is a standing constraint; this is its sharpest violation |
| B3 | **`documentCache` eviction**: one ~40 KB blob per activity ever opened, forever, against ~5 MB quota; terminal state is B2's silent failure. LRU cap? Cross-activity sweep? | s6a | Pair with B2 so the failure is visible even after the bound |
| B4 | **Lock handback**: a re-held tab serializes boot-era state over everything the other tab wrote. Re-hydrate on `held` false→true, or refuse the handback? | s6a | "No reload" is currently documented as a feature; it is the unsafe half |
| B5 | **Touch targets on paper**: 44px min-heights survive into print (~1.85in per 4-option MC). Fixing changes every printed worksheet + all 22 baselines. Accept-and-document, or fix-and-regenerate? | s5a | The one audit item that changes what teachers physically get |
| B6 | **`fetchReleasedFeedback`**: live endpoint (expects `submission_id`), real client method (sends `activity_id`), zero callers. Delete the seam until the teacher-grading slice, or leave with a truth-comment? | s3a | The wire-shape mismatch fires the day anyone wires it naively |
| B7 | **Shortfall channel**: crash telemetry only (the `unsupported` half is test-pinned empty at wire v2). Who consumes it — error log, store flag, teacher visibility? Or delete the unsupported half until wire v3? | s3:8, s3a | |
| B8 | **`malformed_document`**: typed failure code + walk test, vs the documented silent-coercion posture (A34 documents; this decides) | s4a | Server-authoritative grading makes a silently wrong mark worse than a 500 |
| B9 | **Solutions payload**: no size bound on a channel persisted per-check for ~400 days. Cap, or document why not? | s4a | |
| B10 | **ASSERTION_TEXT vs the pack**: the checkbox offers the under-13 authorization branch every compliance doc says isn't available in v1. Drop the clause (POLICY_VERSION bump) or make the docs describe it as live? | s1a | Legal-posture; every class row will carry the current wording |
| B11 | **Compliance pack content**: the ~400-day identity-retention disclosure `retention-policy.md` says "must stay disclosed" is absent from the student-facing policy; the roster shows emails while the policy says "name"; Mechanics still tells counsel the purge job doesn't exist. One rewrite + the first real POLICY_VERSION bump | s1a | |
| B12 | **Student shell**: `SessionContext` has no role; S9's first student lands on the teacher Home. Role fetch + shell branch design (pairs with C2/C3) | s1a | |
| B13 | **Admission-gate hardening set**: allowlist case-normalization (arms at S9 seeding — a mis-cased teacher row admits them *as a student*); `hd` param (pass it or strike the DECISIONS claim); `expected_domain` validation + a class-edit path; 13+ assertion immutability + a writer for the dead `class.create` audit enum | s1a | Could be one small S9-prep slice |
| B14 | **Lockout compose**: remove-student should offer the join-code regeneration its own doc says is required for an actual lockout | s1:14 | Small UX ruling |
| B15 | **Contact-sheet durable home**: 44 PNGs + index, gitignored, generator deleted, renderer half regenerable only until S9 — where does the sign-off evidence live? | s5.5:13 | Author decision |

## C. S9 cutover checklist (consolidated — add to STATE's gate list)

1. Close the sw-offline `test.fixme` (already a STATE gate; next step documented: real server stop, not `setOffline`) — s6:8
2. Wire `watchIdleSignOut` + student sign-out chrome (2.4A), **with an e2e proving the wiring** — s1:9
3. Role fetch + student shell branch (B12) — s1a
4. Seed `student_domain` + live-verify the admission trigger's student branch before the first class — s1:7
5. Demolish `submissions.student_id` branch + `submissions_account_attempt_idx` with the anonymous wire — s1:8
6. Decide `purgeStudentCaches` + `sweepForeignCaches` fate: producer or removal (they live or die together) — s6:9, s6a
7. The real-browser a11y pass (announcements, keyboard path, visible focus, reduced-motion — the four 6.1A gaps; touch targets and normalization are already covered) — s3:12, s3a
8. Delete the renderer-side `collectDefinitions` copy with the renderer (A9's bond holds until then) — s5.5:8
9. S8 recalibration re-measure + re-run the S8 retro against its posted checklist — s8
10. Do **not** unify the renderer/viewer shuffle hashes pre-S9 (changes published-page arrangements for nothing); note `Matching.tsx`'s block-id seeding *survives* S9 — s2:w10, s2a

## D. Policy candidates (ratify or reject at the review)

1. **A primitive is not delivered until something calls it** — 8+ instances across S1/S3/S4/S6; mechanical form: export-reachability check from entry files, or a zero-non-test-importer lint. The arc's single most repeated failure.
2. **E2E route mocks derive from production constants, never retyped** — the check-URL bug was invisible to the exact test built to catch it.
3. **Dormant safeguards need a liveness proof, at production values** — the S2 limiter, the S4 rate ceiling, the S8 timing gate: three generations of the same gap.
4. **Rosters are derived or cross-checked, never merely written** — the S0 lesson, still producing drift in S5.
5. **Retiring a guard requires auditing every comment that cites it**; ported-not-imported needs a bond that outlives the port's timeline assumption — the S5.5 retirement's two orphaned containment plans.
6. **Deploy-time flags live in declarative config with a verification step** — a decision recorded only in an npm script is not recorded.
7. **A verification script that writes durable rows owns its residue end-to-end** — the S4 E2E residue silently vacated verify-0022's C1.
8. **Review-time promises go on a tracked checklist with an owner slice** — the DX boomerang and the pre-S8 a11y pass fired no alarm when their slices shipped without them.
9. **When a slice's headline lesson is "this check was vacuous," re-run that lesson over the fix** — S8's route smoke.
10. **Keep the re-derive-against-shipped-reality review cadence** (S7's two pre-build shape changes were the arc's cheapest corrections) and **comments asserting counts/coverage are claims — guard them or don't make them**.
