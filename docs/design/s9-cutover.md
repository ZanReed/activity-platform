# S9 cutover — plan (the hard cutover + the student content surface)

**Status: ENG-REVIEWED 2026-08-12 (CLEAR — full 4-section review + outside voice;
all findings ruled, 0 unresolved). D-1…D-14 author-ruled 2026-08-09; the eng
review added rulings E-1…E-6 and OV-1…OV-11 (§7), which AMEND D-4 (validation +
flush-abort), D-2/A3 (list RPC, discovery posture), D-3 (mechanism + honest
oracle arithmetic), D-6 (feature-retirement naming + P9 audit), D-13 (script
gating), and D-14 (drop order 1→3→4→2→5). No code yet. NEXT: /plan-devex-review,
then the D-2 design review — per the ruled execution order (findings-backlog →
step 8; outside-voice finding 14: S9 was checklist-confirmed, never scrutinized).**

Sources: STATE.md 15-gate list; findings-backlog.md → RULINGS §C (C1–C15);
the arc design doc (`~/.gstack/.../user-main-design-20260728-components-as-data.md` —
hosting ruling + T9 amendment); s9-prep-identity-slice.md §2 (deferred agenda);
DECISIONS newest entries. Recon: two very-thorough Explore passes over the
demolition surfaces and gate code state + live-DB checks, 2026-08-09.

**Standing rule this plan is built under:** long-term over short-term — no refactors
after real classes/activities exist. S9 is the last cheap moment for every deletion
and rename below; the day `student_domain` is seeded and a real class joins, the
demolition windows close.

---

## 0. Sequencing position (verified live, 2026-08-09)

- Work packages 1–7 of the ruled execution order are done and **pushed** (STATE's
  "none of it is pushed" line is stale — tree clean, zero commits ahead of origin).
- **The identity-slice apply-day runbook has NOT run: live migrations stop at 0026.**
  0027 is unapplied; no verify:auth --target live; no probes; dashboard redirect URLs
  unconfirmed. **Blocked on it:** gate 4 (`student_domain` seeding is hard-sequenced
  AFTER 0027 — the armed mis-cased-teacher defect), the C11 close, and **Probe 2's
  callback recording, which is the validation input for the refusal-screen parser**
  (built cause-agnostic per design ruling P1; the recording confirms hash-vs-query
  reality). S9 planning and most S9 build work do not block; the S9 demolition
  migration (0028) and cutover day itself sequence after the 0027 apply.
- Live traffic check (D26 preview): last `submissions` row **2026-07-29**; 4 rows in
  30 days, all the author's tests; `section_checks` = 0 rows; 0 classes, 0 student
  users, `student_domain` empty. The zero-traffic check will be a formality.

## 1. Shipped-reality corrections (P10 recon, 2026-08-09)

These change the work or the gate list's framing:

1. **C14/B15 is the most urgent item on the board, not housekeeping.** The 44
   contact-sheet PNGs + index.html sit gitignored in
   `packages/app/print-contact-sheet/`, single-copy, and are **no longer
   regenerable**: the generator spec died in `29ea4f5` (cross-surface gate
   retirement) and the renderer is unreachable from packages/app (eslint-banned,
   no dep). `docs/HISTORY.md:30` still advertises a regeneration command that
   cannot work (P5-class stale claim). The repo has **zero git tags**. One
   `git clean -xdf` permanently destroys the human-judged half of print parity.
   B15 (zip → annotated tag `s5.5-print-signoff` → push) must happen before any
   other S9 work touches the tree.
2. **The A1 check-URL bug is still live in the app.** `StudentViewer.tsx:344` POSTs
   to `/check-section`; the deployed function is `check-activity`. The e2e helper
   mocks the wrong name too (`studentSession.ts:242`) — the P2 failure class,
   exactly as s4-retro recorded. S4's "live E2E 13/13" was the verify script
   hitting the function directly, not the app path. Real in-app checking against
   the live backend has plausibly never worked. A1 has its own task chip; S9 must
   hard-require it landed before the cutover e2e/a11y/integration passes.
3. **`get-feedback` never worked on published pages.** Every success return swaps
   `jsonResponse(req, body, init)` args (`index.ts:192,206,216,220` pass
   `(req, 200, payload)`) — the body served was the literal `200`. Released
   feedback has never reached a student. C15's deletion preserves nothing, and the
   teacher-grading slice must not treat this function as a working reference.
4. **Gate 6's "they live or die together" is stale.** `purgeStudentCaches` HAS a
   prod caller (`studentAuth.ts:65`, inside `signOutEverything`);
   `sweepForeignCaches` has none. Neither has a producer: S6 V8 retired the
   user-scoped SW runtime-cache design — the worker caches **no API responses**;
   the offline document lives in `documentCache` (localStorage, already inside the
   purge contract). "Producer" would mean re-adding a SW cache route V8 rejected.
   Removal also drags three sibling allowlist entries (`VIEWER_CACHE_PREFIX`,
   `contentCacheUser`, `viewerContentCacheName`) into re-triage.
5. **Gate 13 is satisfied; only reads remain.** The POLICY_VERSION bump landed
   (`73ab7bc`, `2026-08-07-draft-2`). Still owed: the author's legal read of the
   changed sentences, and D24's counsel/district read before the first real
   classroom (gates classrooms, not cutover). The gate should be re-worded so a
   checklist pass doesn't re-do the bump.
6. **Gate 9's substrate moved.** `TIMING_TARGET_MS` is armed at HEAD (`db5e6d1`,
   medians 969/1118/1828); the s8-retro audit's "targets are null" claim is stale
   in the doc. Still open from the retro's posted checklist: the route-smoke
   `NON_RENDER_CHUNKS` filter + dedup (audit cheap-item b), the 168.1-as-cap
   sentence (c), and checklist item 8 — the 150 KiB TODO has already drifted
   quietly (shell at 173.5/185). `perf-budgets.mjs:312` itself names "after the
   S9 cutover" as a recalibration trigger, so the re-measure is contractually owed.
7. **The sw-offline fixme conflates two distinct `setOffline` failures.** (a) SW-
   served navigation subresources die under emulated offline (the parked rows;
   server-stop is the documented next step, TODOS.md:314); (b) route stubs bypass
   `setOffline` entirely — already produced one silently-vacuous green, already
   mitigated in-file by the double `context`+`api` setOffline. A server-stop
   harness fixes (a) only; (b)'s mitigation must survive the rework.
8. **No a11y lane exists to land gate 7 in.** Four Playwright projects
   (chromium/student/sw/perf), no a11y project, no axe dependency. Existing
   coverage is stronger than "attributes only" (13 aria-live sites, focus-visible
   + reduced-motion CSS, conformance pins, AA contrast tests) but reduced-motion
   is asserted by **grepping the CSS for the string** — the weakest gap.
9. **The publish rewrite is smaller than the gate list implies.** Everything
   durable in publish lives in the `publish_activity` RPC (0003:154-216: authz,
   version mint, activities update, audit). The Edge Function adds only render +
   R2 upload — both dying. The client already discards the returned URLs for
   link-building (`PublishStatus` rebuilds from `VITE_PUBLISHED_URL_BASE`; unset
   ⇒ the affordance disappears on its own). `versioned_url` is consumed by nobody.
10. **The class→activity surface is a genuine greenfield.** `assignments` has no
    `class_id`, carries Google-Classroom text ids, and has **zero app consumers**
    (grep-verified) — dead weight from the Phase-3 sketch. Student Home has a
    deliberate labelled empty slot (`Home.tsx:256-259`). Nothing joins classes to
    activities anywhere.
11. **The submissions dashboard is anonymous-wire-shaped.** `Submissions.tsx`
    never selects `student_id`; grouping keys on `opaque_token ?? display_name`.
    Gate 5's demolition and the dashboard's fate are coupled in a way the
    checklist doesn't spell out.
12. **graph-kit's MathLive font path is an R2 coupling in a SURVIVING package.**
    `mathlive-setup.ts` derives its fonts directory from its own module URL and
    pins `MATHLIVE_VERSION` in step with `build-mathlive-fonts.mjs`. The kit is
    app-bundled post-S9 — how MathLive fonts resolve for the app-bundled kit
    needs verification + an explicit ruling, not deletion-by-association.
13. **Renderer deletion inventory is bigger than the package.** Dies with it:
    CI's renderer-bundle drift step (ci.yml:92-105), `RUNTIME_SIZE_TARGET/CEILING`
    + their perf-budgets test pins, `bundle-renderer.mjs`, `deploy-train`'s
    kit-ordering prompts, the renderer test suite (9 files, incl. the
    grading-parity file that self-declares S9 death and the A9 glossary bond —
    both by design, C8), and the `_shared/renderer.bundle.js` whose only other
    consumers are ingest-submission + get-feedback (deleted at C15). The golden
    corpus survives viewer-side (`grading/corpus.ts`). Stale claims to grep (P5):
    renderer barrel :26-33, document.ts:388-390, HISTORY:30.
14. **Shuffle-scheme count is four, not three** (printShuffle's `printSeed` — the
    s2-retro audit's correction). Gate 10 unchanged: no pre-S9 unification;
    Matching.tsx block-id seeding survives as the successor surface; the
    renderer/viewer divergence is only the string hash (mulberry32 identical),
    which makes post-S9 unification tempting — it should stay ruled-out unless
    deliberately re-opened, since the viewer's FNV-1a is now the shipped reality.

## 2. Scope

**In:** the 15 gates as re-derived below; the publish rewrite (viewer-only);
the anonymous-wire demolition (functions, migration 0028, data disposition);
renderer package deletion + doc migration; the student content surface deferred
by identity-slice E-5 (class→activity link + student Home list) + the P2
pre-auth class-name endpoint; sw-offline closure; real-browser a11y pass;
the F5 integration-lane ruling; R2 teardown; post-cutover recalibration.

**Out (explicitly):** teacher-grading slice (parked; its own arc — but see D-6
consequence notes); census work of any kind (dead amendment — the census rides
get-activity's cache-fill; the new publish path must NOT write census rows,
and `backfill-census.js` stays manual-only); Clever/ClassLink/Azure/LTI (mapped
in the identity plan §2); brand pass; solution-unlock pedagogy; under-13.

## 3. The 15 gates, re-derived

| # | Gate | Status after recon |
|---|---|---|
| 1 | sw-offline fixme | OPEN — D-9; two failure modes, server-stop addresses one |
| 2 | idle sign-out wiring | ✅ verified in code (Home.tsx:185, StudentViewer.tsx:135) |
| 3 | role fetch + shell | ✅ built (identity slice) |
| 4 | student_domain seed + live verify | BLOCKED on 0027 apply (author runbook) |
| 5 | submissions demolition | OPEN — D-5/D-6 decide depth |
| 6 | cache pair producer-or-removal | OPEN — D-8; framing corrected (asymmetric) |
| 7 | real-browser a11y | OPEN — D-10; no lane exists yet |
| 8 | renderer collectDefinitions + bond | OPEN — dies with renderer deletion (D-7) |
| 9 | S8 re-measure + retro re-run | OPEN — D-12; post-cutover by construction |
| 10 | don't unify shuffle hashes | STANDING — reaffirmed; four schemes noted |
| 11 | identity slice | ✅ built + pushed; C11 closes at 0027 apply |
| 12 | local-first safety set | ✅ done 2026-08-07 |
| 13 | POLICY_VERSION bump | ✅ satisfied; re-word to "legal read owed" (D24 unchanged) |
| 14 | contact-sheet evidence | 🔴 URGENT — unregenerable, untagged (D-1) |
| 15 | delete ingest + get-feedback | OPEN — zero-traffic near-formality; D-5 |

## 4. Decisions — ALL RULED (author, 2026-08-09)

Every item below was ruled **as recommended**, in a 14-question walkthrough. The
rejected alternatives are kept with their reasons so no future session re-opens a
settled question (the repo's standing practice). Where a ruling names a
verification or a gate, that gate is binding on the build.

| # | Ruling (one line) |
|---|---|
| D-1 | B15 evidence: zip → annotated tag `s5.5-print-signoff` → push, **before any other S9 work touches the tree** |
| D-2 | New `class_activities` join table + audited DEFINER RPC + teacher share UI + student Home list; `assignments` left dormant |
| D-3 | Build the anon pre-auth class-name endpoint; eng review rules the mechanism and states the enumeration oracle |
| D-4 | Delete the publish-activity function; publish = direct `publish_activity` RPC; share link = `${origin}/a/${activityId}` |
| D-5 | One demolition drop (0028 + both function deletions), gated on recorded zero-traffic evidence |
| D-6 | Wipe the test rows (closes the ip_hash gap by data removal), delete the Submissions dashboard, **keep** the empty tables |
| D-7 | Delete the renderer package in one drop, after D-4; P5 claims-grep is an explicit named task |
| D-8 | Remove both cache functions + the call site + the C6 allowlist entry; re-triage the three grammar exports |
| D-9 | Close sw-offline with a real in-test child-process server stop; the stub-side `api.setOffline` mitigation survives |
| D-10 | New `a11y` Playwright project + `@axe-core/playwright`; real assertions for all four 6.1A gaps; runs in CI |
| D-11 | Integration lane IN, minimal: `supabase start`, join flow + role fetch + one real check round trip |
| D-12 | Re-measure after cutover (≥5 green runs, recalibrate medians); rule the 150 KiB shell number **then**, not now |
| D-13 | R2 teardown: secrets → origins → scripts → **bucket last**, gated on the MathLive font check; old image srcs accepted broken after a keep-check |
| D-14 | Drop order §5 ratified as proposed |

- **D-1. B15 evidence capture goes FIRST (before any S9 commit).** Zip the 44
  PNGs + index.html from the working tree, attach to annotated tag
  `s5.5-print-signoff`, push the tag; tag message notes the touch-target height
  fix postdates the sign-off; HISTORY pointer + fix HISTORY:30's dead regen
  command in the same visit. Author station (tag+push). *Recommend: yes,
  immediately — the evidence is one `git clean` from permanent loss.*
- **D-2. Build the class→activity surface now (the E-5 deferral comes due).**
  Recommend: a new purpose-built `class_activities` join table (class_id,
  activity_id, added_by, added_at; RLS via helpers; writes through an audited
  DEFINER RPC in the 0027 posture — deny-by-default, `class.update` audit) + a
  teacher "share to class" affordance (Classes page and/or editor header) + the
  student Home list replacing the labelled empty slot (Home.tsx:256). Rejected
  alternatives: retrofitting `class_id` onto `assignments` (dead Phase-3 table,
  wrong shape, zero consumers — leave it dormant, drop it in a later
  Classroom-integration arc); deferring again (S9 was named the owner; a student
  shell whose Home lists classes but can't reach activities is not a cutover).
  Gets its own **design review** (frames: teacher share flow, student list,
  empty/error states) before build.
- **D-3. Build the pre-auth class-name meta endpoint (design ruling P2's
  recorded S9 fix).** An anon `get_class_public_meta(join_code)` RPC returning
  class name (and teacher display posture per the 0021 rule — name or nothing),
  gated `deleted_at is null`, rate-limited in the get-activity meta-branch
  pattern, served from the existing get-activity anonymous branch or a
  PostgREST-direct anon grant (mechanism to eng review). The join gate then
  shows "Join <class name>" instead of the bare code. Enumeration note for the
  review: a valid-code → name oracle is new surface; same geologic arithmetic
  as E-8, but state it.
- **D-4. Delete the publish-activity Edge Function; publish becomes the RPC.**
  The client calls `supabase.rpc('publish_activity')` directly (it already runs
  user-scoped under RLS; the function adds nothing post-R2). `usePublish`
  rewires; error taxonomy maps PostgREST errors; one less deploy surface and
  flag to maintain. Alternative: keep a thin function for future publish-time
  work — rejected, YAGNI + the census amendment explicitly forbids the obvious
  future tenant. **Share affordance:** PublishStatus rebuilds around the viewer
  URL `${origin}/a/${activityId}` (Open + Copy link, same UI); the "published
  link" IS the viewer link now. `VITE_PUBLISHED_URL_BASE` + `publishedUrl()`
  die; `versioned_url` dies unconsumed.
- **D-5. Demolition set (gate 5 + C15), migration 0028 + function deletions.**
  After 0027 is applied and the zero-traffic check is recorded: delete
  `ingest-submission` + `get-feedback` (author: `supabase functions delete`),
  drop the `ingest_submission` RPC, drop `submissions.student_id` branch
  (column, 3-branch CHECK → back to 2, `submissions_student_idx`,
  `submissions_account_attempt_idx`), and update config.toml + CLAUDE.md's
  trio language (get-activity becomes the ONLY --no-verify-jwt function).
  The renderer bundle loses its last two non-publish consumers here.
- **D-6. Data + dashboard disposition for the old submissions world.**
  Recommend: **wipe the test rows** (`submissions`, dependent `grades`) in 0028
  — they are the author's test artifacts by the no-old-pages ruling, and the
  wipe closes the disclosed-but-unbuilt `ip_hash` scrub gap by data removal
  (update the compliance-pack row + its pin in the same commit: "anonymous wire
  and its data deleted at S9", not "mechanism not yet built"). **Delete the
  Submissions dashboard route** + `lib/submissions.ts` (anonymous-wire-shaped,
  reads a table that will never grow again; a dead museum UI misleads). **Keep
  the `submissions` + `grades` TABLES** (empty, RLS intact) — dropping them is
  the teacher-grading slice's call when it rules attempts-vs-latest and decides
  whether `grades` re-keys or a checks-native table replaces it. Alternatives:
  keep dashboard as archive (rejected: empty forever); drop tables now
  (rejected: forecloses the parked slice's schema decision for zero gain).
- **D-7. Renderer deletion + doc migration (gates 8, 14 aftermath, Q4A).**
  Delete `packages/renderer` whole (runtime, tests incl. grading-parity + A9
  bond — both self-declared S9 deaths; corpus survives viewer-side),
  `bundle-renderer.mjs`, the CI renderer-drift step, `RUNTIME_SIZE_TARGET/
  CEILING` + their test pins, deploy-train's kit prompts, `_shared/
  renderer.bundle.js` + `graph-kit-manifest.ts` (last consumer dies with
  publish-activity). **P5 claims-grep is a named task**: every comment citing
  the renderer, the runtime contract, R2, or the trio (renderer barrel :26-33,
  document.ts:388-390, HISTORY:30, RUNTIME.md, CLAUDE.md's ~15 runtime/renderer/
  R2 bullets, README, ROADMAP banner, STATE constants). The runtime
  budget-ladder backlog item is struck (moot). Sequenced AFTER D-4 lands
  (publish-activity is the last live consumer) and after D-1's tag exists.
- **D-8. Cache pair: remove both.** Delete `purgeStudentCaches` +
  `sweepForeignCaches` + their call site in `signOutEverything` + the C6
  allowlist entry; re-triage the three cache-grammar exports (likely die too —
  the SW caches only the user-agnostic shell). Rationale: V8 already rejected
  the design that would produce user-scoped caches; defense-in-depth against a
  cache that cannot exist is dead code with a standing lint exemption.
  Alternative (write a producer = re-add SW API caching) re-opens a settled
  S6 ruling — only if offline-reopen evidence from D-9 demands it.
- **D-9. sw-offline closure (gate 1).** Approach: reproduce with a REAL server
  stop (in-test child-process preview server, killed mid-test — not Playwright's
  webServer, which can't stop per-test). If the failure reproduces → the worker's
  runtimeCaching is at fault; fix in vite.config and un-park. If it passes → the
  harness adopts server-stop and the two rows un-park. Either way the stub-side
  `api.setOffline` mitigation survives, and the fixme closes before cutover day.
- **D-10. A11y pass (gate 7): new `a11y` Playwright project + axe.** Dev-server
  based (parallel-ok, no preview serialization), `@axe-core/playwright` added
  app-side, rows covering the four 6.1A gaps for real: aria-live announcement
  text observed after a check; full keyboard path (tab order through blanks/
  choices/check, Enter to check); :focus-visible computed-style assertions;
  `reducedMotion: 'reduce'` emulation asserting no animation runs (replacing the
  CSS string-grep). Runs in CI with the student lane's harness. Alternative
  (rows inside the student lane, no axe) is cheaper but repeats the
  attribute-assertion ceiling the gap exists to close.
- **D-11. Integration e2e lane (F5): rule it IN, minimal.** One `integration`
  Playwright project against `supabase start` (local stack, real auth/RLS/RPCs,
  migrations 0001–0028 applied), covering exactly the classes stubs cannot:
  the join flow end-to-end (real join_class), role fetch, and one real
  check-activity round trip — the A1 bug class (P2's known failure mode: mocks
  derived from retyped constants). Local-only by default; CI-optional job
  (docker) decided at eng review. Alternative: keep deferred — but S9 deletes
  the last anonymous test loop, and cutover-day confidence currently rests
  entirely on stubs + one-off verify scripts.
- **D-12. Post-cutover measurement set (gate 9).** After the cutover lands:
  re-run the perf lane ≥5 green CI runs, recalibrate `TIMING_TARGET_MS` medians
  (the R1 trigger perf-budgets.mjs itself names), re-run the s8-retro posted
  checklist items 5–9 against reality, close audit cheap-items (b)
  route-smoke `NON_RENDER_CHUNKS` filter + dedup and (c) the 168.1 sentence,
  and **rule the 150 KiB TODO explicitly**: pull the auth-client lever or
  formally re-baseline (shell 173.5/185 today; D-2's Home list adds weight —
  budgets are the gate during build).
- **D-13. R2 teardown order + the two survivor questions.** Teardown (author
  stations, after D-4/D-5/D-7 land): delete R2 secrets from functions config,
  shrink `ALLOWED_ORIGINS` to localhost + pages.dev, delete `upload:graph-kit`/
  `build:fonts`/`build:mathlive-fonts` + `.env.r2` + the manifest machinery,
  then the bucket LAST. Survivor questions to rule: (a) **MathLive fonts for
  the surviving app-bundled graph-kit** — verify how the Vite-bundled kit
  resolves `fontsDirectory` today and pin the mechanism (likely bundled assets;
  if it silently reaches R2, that's a live breakage at bucket death); (b) **old
  test-draft image srcs on R2** — accepted broken at bucket death (test
  artifacts) or one-time re-upload sweep to Supabase Storage; recommend
  accept + a one-line check that no activity the author wants to keep
  references R2.
- **D-14. Cutover-day runbook + drop order (§5). RATIFIED as proposed.** The two
  alternatives were declined with reasons worth keeping: *student content surface
  first* (Drop 2's design review is the longest pole — fronting it delays every
  deletion behind it) and *proof lanes earlier* (they would assert against
  surfaces the demolition then changes, which is how a lane goes vacuous).

## 5. Drop order — ⚠ REORDERED at eng review (OV-3 amends D-14)

The 2026-08-09 order put Drop 2 ahead of the demolition drops, contradicting
D-14's own rejection reasoning ("the design review is the longest pole"). Ruled
order is now **1 → 3 → 4 → 2 → 5**: demolition depends only on 0027-apply +
zero-traffic, so deletions stop waiting on the design review, which runs IN
PARALLEL during Drops 3/4. Migration numbers follow the new order: **0028 =
demolition, 0029 = content surface.**

Ordering constraints: D-1 before everything; **Drop 3 does not START until
`supabase migration list` shows 0027 live — verified, not assumed (OV-8)**;
D-4 before D-7 (publish-activity is the renderer's last consumer); zero-traffic
evidence (as defined in OV-10) before function deletion; **any push shipping UI
that calls a NEW table/RPC waits until its migration is applied live — the
migration-before-deploy rule generalized to the Pages-auto-deployed SPA (OV-7)**;
bucket death last; A1's chip landed before the Drop-5 lanes assert real checking.

0. **Author, now:** B15 tag (D-1) · the 0027 apply-day runbook (identity plan §5)
   · A1 chip if not already run.
1. **Drop 1 — publish rewrite** (D-4 + E-1/OV-2): RPC-direct publish with
   flush-abort + pre-publish safeParse, PublishStatus rework, env var deletion
   (verified once with `.env.local` removed — Q1). App-only + one function
   deletion queued. Budgets watched. *In parallel: the D-2 design review.*
2. **Drop 3 — demolition** (D-5 + D-6 + OV-5/6/10): **hard-gated on 0027 live.**
   Migration 0028 (student_id branch drop, ingest RPC drop, data wipe with
   counts printed per P7), dashboard deletion **named as the Phase 2.6
   feature retirement with the teacher-grading slice as owner**, compliance
   row + pin updates, the get-feedback e2e stub deleted (Q1), the scoped P9
   audit of Phase 2.6-era "live-verified" claims (OV-6). Author: zero-traffic
   evidence = newest-submissions-row check + one 24h edge-log window for both
   doomed functions, captured into STATE (OV-10), then `supabase functions
   delete ingest-submission get-feedback`.
3. **Drop 4 — renderer death + doc migration** (D-7 + D-8): package deletion,
   CI/scripts cleanup, the P5 claims-grep as a **13-target enumerated
   checklist** (the 11 recon targets + STATE's Phase 2.6 rows + ROADMAP's 2.6
   line — OV-5), CLAUDE/README/RUNTIME/ROADMAP/STATE rewrite, cache-pair
   removal (with the signOutEverything purge-order pin UPDATED, not deleted).
4. **Drop 2 — student content surface** (D-2 + D-3 + E-2/E-3/OV-1/OV-4/OV-9):
   migration 0029 (class_activities package + share/unshare RPCs +
   `list_class_activities` DEFINER RPC + class-meta anon RPC), get-activity
   join_code meta branch (bundle regen + deploy), teacher share UI, student
   Home list, join-gate name display. Design review already done (parallel);
   UI push waits for the 0029 apply (OV-7); e2e rows from production constants
   (P2); budgets watched (entry chunk).
5. **Drop 5 — proof lanes** (D-9 + D-10 + D-11 + E-5): sw-offline closure, a11y
   project, integration lane (password-users-through-the-real-trigger sessions).
6. **Author stations:** seeding + live student-branch verify (gate 4, incl. the
   full join round-trip probe) · R2 teardown (D-13, OV-11 order: secrets →
   origins → **MathLive-font verification → THEN kit/font scripts + .env.r2** →
   bucket last) · then D-12's re-measure closes gate 9 and the arc.

## 6. Risks / watch items

- The contact-sheet evidence (D-1) is unrecoverable if lost — nothing else in
  this plan has that property; it goes first for that reason alone.
- 0028's data wipe (D-6) is the plan's only destructive-by-design step; it runs
  only after the author's explicit ruling and the zero-traffic evidence, and the
  wipe is scoped to tables the no-old-pages ruling already declared test-only.
- D-2 touches the entry chunk (Home list) — the 12 budget gates are the guard;
  173.5/185 leaves ~11 KiB of headroom before D-12's re-baseline ruling.
- The mathlive-setup font path (D-13a) is the one place deleting R2 could break
  a SURVIVING surface; verify before the bucket dies, not after.
- Doc migration is large and P5-shaped: CLAUDE.md alone carries ~15 bullets that
  become false at cutover; a missed one becomes next session's misdirection.

## 7. Eng review record (2026-08-12, /plan-eng-review — CLEAR, 0 unresolved)

Full 4-section review + outside voice (Claude subagent; Codex not installed).
**6 review findings (E-1…E-6) + 11 outside-voice findings (OV-1…OV-11), all
ruled by the author — every one as recommended.** Amendments are folded into
§4/§5 above; this section is the record.

**Review findings:**

- **E-1 (A1, amends D-4; ⚠ reworked by OV-2).** The deleted Edge Function was
  the only publish-time shape gate (`publish-activity/index.ts:237-244`); the
  RPC validates nothing. Ruled: **client-side pre-publish validation in
  usePublish** — and per OV-2, the autosave **flush failure ABORTS publish**
  (today it is "best-effort and never throws", usePublish.ts:38-40) and
  safeParse runs on the exact payload the flush persisted. SQL-side validation
  rejected (a hand-rolled parallel validator — the "fifth encoding").
- **E-2 (A2, settles D-3's mechanism).** The class-name lookup **rides
  get-activity's anonymous meta branch** (new `join_code` query param → new
  anon RPC; same limiter, no-cache, wire-leak rows; bundle regen + deploy).
  A direct anon PostgREST grant rejected: a second standing anonymous surface
  with zero request shaping.
- **E-3 (A3, amends D-2; ⚠ extended by OV-1/OV-9).** The `class_activities`
  package: PK `(class_id, activity_id)` (dedupe by construction); both FKs
  ON DELETE CASCADE (fire only at hard purge; reads filter soft-deletes via
  helpers); RLS SELECT for members (`is_class_member`) + teacher
  (`is_class_teacher`), client INSERT/DELETE denied; **TWO audited DEFINER
  RPCs** — `share_activity_to_class` + `unshare_activity_from_class`, both
  writing `class.update` audit with the activity id in metadata (unshare is
  the same lockout family as B14); share **refuses a never-published
  activity**; student list filters status + deleted_at as defense in depth.
- **E-4 (Q1, mechanical batch).** Migrations renumbered to real sequential
  numbers (now 0028 demolition / 0029 content surface per OV-3); the
  `studentSession.ts:282` get-feedback stub dies in Drop 3 (a stub for a
  nonexistent endpoint violates P2 silently); the claims-grep carries an
  **enumerated target checklist** (13 targets after OV-5); Drop 1 verified
  once with `.env.local` removed (the env-masked-green learning, 2 prior
  instances).
- **E-5 (T1, settles D-11's session mechanism).** The integration lane creates
  **email+password users on the local stack so the REAL `handle_new_auth_user`
  trigger mints roles** (seeded allowlist + student_domain), then
  `signInWithPassword` for genuine JWTs. Admin-minted sessions rejected: they
  bypass the trigger and recreate stub-blindness in the anti-stub lane.
- **E-6 (P1, amends D-2; ⚠ reworked by OV-1).** The student Home list is ONE
  round trip. Originally ruled as an RLS-scoped joined select — **OV-1 proved
  that unimplementable** (`activities_select_own` is owner-only; a student's
  join returns no titles). Final shape: **`list_class_activities()` SECURITY
  DEFINER RPC** returning (class_id, activity_id, title, added_at) for the
  caller's memberships, published + non-deleted filtered server-side.
  `can_read_activity` is NOT widened (the recorded Activity-Bank landmine).

**Outside-voice rulings (11 findings, all accepted):**

- **OV-1** → E-6 rework (the list RPC). **OV-2** → E-1 rework (flush-abort).
- **OV-3** → §5 reorder **1→3→4→2→5** (the 2026-08-09 order contradicted
  D-14's own rejection reasoning; demolition doesn't depend on the design
  review). Design review runs in parallel during Drops 3/4.
- **OV-4** → the "same geologic arithmetic as E-8" claim was FALSE and is
  retracted: join codes ≈ 2^29.7 via non-crypto `random()`, the endpoint is
  unauthenticated, the inherited limiter is self-documented nearly inert.
  Ruled: record the real arithmetic; a **P3 liveness row forces the limiter
  to fire at production values on the join_code path**; revisit triggers
  named (multi-district, public signup, observed enumeration in logs). No DB
  write on the read path (standing rule). Proportionality: a discovered code
  is exploitable only BY an admitted student; payoff = class name + joinable
  code; recovery = B14 remove-and-regenerate.
- **OV-5** → D-6 renamed honestly: **Phase 2.6 manual grading is RETIRED at
  S9** (Submissions.tsx IS the grading UI), owner = the parked
  teacher-grading slice (trigger unchanged: first real teacher). STATE's
  Phase 2.6 rows + ROADMAP's 2.6 line join the claims-grep (13 targets).
- **OV-6** → a **scoped P9 audit** of Phase 2.6-era "live-verified" claims
  joins Drop 3's docs task — the method that credited a bodiless get-feedback
  response as "live-verified" may have credited siblings.
- **OV-7** → the migration-before-deploy rule **generalizes to the SPA**
  (Pages auto-deploys from main): UI calling a new table/RPC pushes only
  after its migration applies. Joins CLAUDE.md's division-of-labor rules at
  Drop 4's doc migration.
- **OV-8** → **0027-apply is a hard start-gate for Drop 3** (`supabase
  migration list` shows 0027 — verified, not assumed). Drop 1 and the design
  review proceed freely (no 0027 dependency).
- **OV-9** → posture stated: **share = discovery, published = open.** Any
  signed-in admitted student can open any published activity by UUID
  (`get_published_activity` grants to all authenticated) — unchanged from
  link-sharing reality. `class_activities` controls what appears on Home,
  not who may read. Teacher copy must not imply an access wall; access
  scoping is a named future ruling, never a side effect.
- **OV-10** → zero-traffic evidence DEFINED: (a) newest `submissions` row
  predates the cutover window (durable; already true — 2026-07-29), plus
  (b) one 24-hour edge-log read for both doomed functions showing zero
  requests, captured once into STATE on the day Drop 3 starts.
- **OV-11** → D-13 resequenced: the MathLive-font verification gates the
  **font/kit script deletion too**, not just the bucket.

**Strength recorded:** D-4's RPC-direct shape makes the census-race hazard
(the dead R6(b) amendment) impossible by construction — the new publish path
has no code at all.

### Test plan (traced at review; artifact for /qa:
`~/.gstack/projects/ZanReed-activity-platform/user-main-eng-review-test-plan-20260812-220401.md`)

34 traced paths, 0 covered today (all new/modified). **Five CRITICAL
regression tests (iron rule, non-negotiable):** publish happy path, republish
(version_num++), PublishStatus render (session + prior publish), dashboard
entry-link removal (no dead links on Activities/editor), and the
`signOutEverything` purge-order pin surviving the cache-pair removal (S6-6
contract — updated, never deleted). Suites per drop:

- **Drop 1:** usePublish unit (flush-fails→no publish, invalid-doc→no publish,
  PostgREST error mapping, no-draft); PublishStatus RTL (+ env-less run);
  e2e publish→open-viewer-link.
- **Drop 3 (0028):** verify-0028 — CHECK back to 2 branches, indexes dropped,
  wipe counts printed (P7), retention-pin todo-cases flip; route-removal
  regression; stub deletion.
- **Drop 4:** CI green with renderer steps deleted; reachability allowlist
  re-triage (C6 + 3 grammar exports); 13-target claims-grep checklist ticked
  in the PR.
- **Drop 2 (0029):** verify-0029 — grant matrix (INSERT/DELETE denied), RPC
  refusal matrix (non-owner, student caller, never-published, soft-deleted
  class), audit rows, dedupe no-op, `list_class_activities` scope proof;
  handler tests — join_code valid/invalid/deleted + **limiter liveness at
  production values (P3)** + wire-leak row (name and NOTHING else); RTL Home
  list states; e2e share→student-sees / unshare→gone / double-click-once /
  unpublished-refusal / join-gate name + meta-fetch-fails fallback.
- **Drop 5:** the two sw rows un-parked (or worker fix red-green); a11y ×4
  gaps + axe per student surface; integration lane — real join_class, role
  fetch, one real check round trip (A1 chip prerequisite).

### Failure modes (new codepaths; test / handling / visibility)

| Path | Realistic failure | Test? | Handled? | User sees |
|---|---|---|---|---|
| Publish (RPC) | flush fails mid-publish | unit | abort (E-1) | error line, nothing published |
| Publish (RPC) | malformed doc | unit | safeParse refusal | publish-time error, not student 500 |
| Publish (RPC) | PostgREST error | unit | taxonomy mapping | honest error copy |
| Share RPC | non-owner / unpublished / collision | verify-0029 | raise → surfaced | error banner |
| Student list RPC | RLS/helper drift returns foreign rows | verify-0029 scope proof | DEFINER + helpers | n/a (proof) |
| Join-gate meta | fetch fails / invalid code | e2e | fallback to bare code | gate still works |
| Meta limiter | enumeration burst | P3 liveness row | 429 branch | n/a — logged |
| Drop 2 push early | RPC missing live | OV-7 ordering rule | n/a (process) | prevented |
| Wipe migration | wrong-scope delete | verify counts (P7) | rolled-back rehearsal | n/a (author-side) |
| SW offline | reopen fails for real | server-stop rows | fix or documented | cached worksheet |
| Sign-out | purge order regressed | regression pin | S6-6 contract | machine clean |

**Critical gaps: 0** — every failure mode has a test AND handling AND a
non-silent outcome.

### Worktree parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| Drop 1 | packages/app (usePublish, ActivityEditor) | — |
| D-2 design review | docs/wireframes (no code) | — (parallel with Drops 1/3/4) |
| Drop 3 | supabase/migrations, supabase/functions, packages/app (routes), docs | 0027 LIVE (OV-8) |
| Drop 4 | packages/renderer (delete), scripts/, .github/, CLAUDE/docs | Drop 1 (last consumer), Drop 3 (bundle consumers) |
| Drop 2 | supabase/migrations, packages/viewer/server (+bundle), packages/app | design review; 0029 apply before UI push (OV-7) |
| Drop 5 | packages/app/e2e (+2 new projects) | Drops 2/4 surfaces final; A1 chip |

Lanes: **A:** Drop 1 → Drop 3 → Drop 4 (sequential — shared app routes + docs).
**B:** D-2 design review (independent, parallel). Drop 2 starts when B and
Lane A's Drop 3 are done; Drop 5 last. Conflict flag: Drops 3 and 4 both edit
CLAUDE.md/STATE — same lane, sequential (already ordered).

## Implementation Tasks

Synthesized from this review's findings. Checkbox as you ship.

- [ ] **T1 (P1, CC: ~1h)** — app — usePublish → RPC-direct with flush-abort +
  pre-publish safeParse + PostgREST error mapping; PublishStatus → viewer
  link; delete VITE_PUBLISHED_URL_BASE + publishedUrl(); env-less
  verification run; 3 regression tests (E-1/OV-2/Q1/D-4)
- [ ] **T2 (P1, CC: ~10m)** — process — Drop 3 start-gate: verify 0027 live +
  capture zero-traffic evidence per OV-10 into STATE (OV-8/OV-10)
- [ ] **T3 (P1, CC: ~2h)** — supabase+app — 0028 demolition migration
  (student_id branch, ingest RPC, wipe w/ P7 counts) + verify-0028 +
  Submissions route/lib deletion named as Phase 2.6 retirement + compliance
  row/pin updates + config.toml/CLAUDE trio edit + e2e stub deletion
  (D-5/D-6/OV-5/Q1)
- [ ] **T4 (P2, CC: ~45m)** — docs — scoped P9 audit of Phase 2.6-era
  "live-verified" claims; correct STATE/HISTORY (OV-6)
- [ ] **T5 (P1, CC: ~2h)** — repo-wide — renderer package deletion + CI/
  scripts/deploy-train cleanup + cache-pair removal (purge-order pin updated)
  + reachability re-triage + 13-target claims-grep checklist + doc migration
  incl. the OV-7 SPA rule into CLAUDE.md (D-7/D-8/OV-7)
- [ ] **T6 (P1, CC: ~2h)** — supabase — 0029 content-surface migration: the
  E-3 package + list_class_activities DEFINER RPC + get_class_public_meta
  anon RPC + verify-0029 (E-3/OV-1)
- [ ] **T7 (P1, CC: ~1h)** — viewer/server — get-activity join_code meta
  branch + P3 limiter liveness row + wire-leak row + bundle regen (E-2/OV-4)
- [ ] **T8 (P1, CC: ~2h)** — app — teacher share/unshare UI + student Home
  list (one RPC) + join-gate name + RTL/e2e rows; budgets watched (D-2/E-6)
- [ ] **T9 (P1, CC: ~1.5h)** — e2e — sw server-stop harness; un-park or fix
  red-green (D-9)
- [ ] **T10 (P1, CC: ~1.5h)** — e2e — a11y project + @axe-core/playwright +
  the 4 gap rows, in CI (D-10)
- [ ] **T11 (P1, CC: ~2h)** — e2e — integration lane: supabase start,
  password-users-through-the-real-trigger, join + role + one real check
  (D-11/E-5; A1 chip prerequisite)
- [ ] **T12 (P2, post-cutover)** — perf — re-measure ≥5 green runs,
  recalibrate medians, s8-retro re-run, rule the 150 KiB number (D-12)
- [ ] **T13 (P1, author)** — stations — B15 tag FIRST · 0027 runbook · seeding
  + live verify · R2 teardown in the OV-11 order (D-1/D-13)

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | (not installed; Claude subagent ran as outside voice) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 (2026-08-12) | CLEAR (PLAN) | 6 issues + 11 outside-voice findings, 0 critical gaps, 0 unresolved |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | owed for Drop 2 (D-2/D-3 surfaces) — runs in parallel with Drops 1/3/4 |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | next per the ruled order |

- **CROSS-MODEL:** Outside voice (Claude subagent, fresh context): 11 findings,
  ALL accepted — 4 amended in-review rulings (OV-1 broke E-6's joined-select on
  verified RLS text, its strongest finding; OV-2 hardened E-1's flush handling;
  OV-3 reordered the drops against D-14's own reasoning; OV-4 retracted a false
  threat-arithmetic claim), 7 amended the plan (feature-retirement naming, P9
  audit, SPA ordering rule, 0027 hard gate, discovery posture, evidence
  definition, script gating). No unresolved disagreement.
- **VERDICT:** ENG CLEARED — /plan-devex-review + the D-2 design review remain
  before build (per the ruled execution order).

NO UNRESOLVED DECISIONS
