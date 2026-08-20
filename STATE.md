# STATE.md

A living "where am I" snapshot. Update at the end of each work session — replace the relevant sections, don't append. Keep it under ~150 lines: move finished-work narratives to [docs/HISTORY.md](docs/HISTORY.md), durable reasoning to [docs/DECISIONS.md](docs/DECISIONS.md). Project rules live in [CLAUDE.md](CLAUDE.md).

## Pending author actions

Things only the author does (pushes, deploys, migrations), queued and waiting.

**✅ BOTH FUNCTIONS REDEPLOYED 2026-08-20 — the answer-key deploy gate is DISCHARGED on the deploy half.** Tool-read via `list_edge_functions`: **`get-activity` v20, `verify_jwt: false`** (the flag survived the redeploy — it is the only function deployed that way) and **`check-activity` v16, `verify_jwt: true`**, both updated within seconds of each other. So the live read path now knows to strip `answer`/`solution`, and the live grader accepts documents carrying them.

*What moved and why it needed a deploy:* the answer-key slice added `answer` + `solution` to `short_answer`/`essay` and declared both stripped, which moved **`SANITIZER_REV` `1-f8328527` → `1-87a5e78b`** (pinned in `printShuffle.test.ts`). The rev move also orphans every stale read-cache row automatically, so no cache purge is owed. Both bundles were regenerated in the same commit as the schema change.

**✅ THE ANSWER-KEY DEPLOY GATE IS FULLY DISCHARGED — the liveness proof PASSED 2026-08-20.**

Run against a real published sentinel activity (`51c1ed89-7e40-4610-8524-2c1d0635a719`, version `7ffb6a55`), through the deployed `get-activity`, from a signed-in browser session:

```
ok   leg 1 — the served version really is the probe
ok   leg 2 — no answer material on the wire (value AND key absent)
PASS
```

**Why it is a real proof and not a vacuous one.** The published version was checked by SQL BEFORE the run: `short_answer_has_answer_field: true`, the sentinel in the block's `answer` field, and the prompt clean (`"Sentinel probe — delete me."`). So the sentinel could only reach the wire from the field the sanitizer is supposed to strip. Leg 1 independently confirmed the probe was present, so a pass cannot come from an empty document.

*Corroborating evidence collected the same day, all tool-read:* the deployed bundle (v20) carries `sanitize: { strip: ["rubric", "answer", "solution"] }` verbatim for both blocks; `activity_version_reads` held 3 rows all at the OLD rev `1-f8328527`, orphaned by the move to `1-87a5e78b`, so no stale bytes could be served; and of 24 published versions none other contains a free-response block.

⚠ **The first attempt was a false start worth remembering.** The initial sentinel was published from a Pages build that predated the answer-key slice, so the importer did not recognise the `answer:` fence key and swallowed the line into the PROMPT. The proof would have reported "THE ANSWER REACHED THE WIRE" — true, meaningless, and indistinguishable from a real leak. **This proof depends on TWO deploy surfaces**: the Edge Functions (deployed from local source via the CLI) and the SPA importer (deployed from `main` via Pages). They can sit at different versions. `scripts/verify-answer-key-strip.mjs` now warns about this in its header.

**⏭ Author cleanup owed (P7):** delete the throwaway activity `51c1ed89-7e40-4610-8524-2c1d0635a719`. Its prompt is harmless but it is residue, and P7 says the run owns it end to end.

**✅ V7 DONE — the print baselines are regenerated and committed (run 32346119173).** The expected print-gates red is cleared; the next CI run should be fully green. Three images moved (`fill_in_blank` +12px, `problem` +12px, `ordering` shifted) — the number gutter reaching paper.

*Two findings came out of it.* (1) `numbering/prints` only covered the `?type=X&variant=N` route, while the baselines use `?type=X&mode=print` — a different code path with no assertion that a number was on the page. Closed by a DOM assertion in `print-baselines.e2e.ts` (22/22 in CI). (2) Only 3 of 12 numbered types' images changed, across two independent runs, while the number demonstrably renders — suspect is the suite's `maxDiffPixelRatio: 0.01`. Filed in TODOS; **numbering itself is guarded by two DOM assertions that no pixel tolerance can absorb**, which is why this did not block.

**⏭ QUEUED: push the answer-key slice, the numbering slice + this STATE commit.** The prior three (`264eddd`, `5187eb9`, `1bc795b`) went up 2026-08-20 at run **32267816673** — **it was still `in_progress` when this session started; check it went green (`gh run list`)** before reading a red on the new push as this slice's fault.

**✅ 0037 IS APPLIED LIVE — the ordering gate is DISCHARGED.** Tool-read 2026-08-18: `0037` in `schema_migrations`, both columns present, `publish_activity` carries the stamp, **0 GIN indexes** (the D12 deferral held). The author ran `pnpm verify:auth --target live` = **verify-0037 11 passed / 0 failed**.

**✅ RESOLVED: the bundle-drift fix is pushed and CI-GREEN (run 32244556362).** *(What it was:)* Drop 1's `.min(1)` on `ActivityMeta.course` was a SCHEMA change, and its commit claimed "no bundle regeneration" — **that claim was wrong** (the CLAUDE.md rule is unconditional: schema change ⇒ regenerate both server bundles in the same commit). CI's drift guard caught it. Both bundles were regenerated and committed. **Optional, not urgent:** redeploying `get-activity`/`check-activity` would carry the `.min(1)` validation live — nothing requires it (no existing document can have a blank course; the default always applied), so it can ride the next real function change.

*(Previously queued, now closed: `647fb8b` shell slimming slice 1 and `cc24700` the e2e-origins fix are both pushed and CI-green at runs **32048169054** and **32081815982**.)*

**⏭ NOW: nothing is blocked — but ONE THING IS STILL IN FLIGHT, by design.** 0036 is applied live, `verify:auth --target live` = **147/0**, and `7e416f3` is pushed (tool-settled: `git ls-remote` = local HEAD). **⏳ The rollup has not run yet.** 0036 was applied 2026-08-17 ~05:49 UTC, *after* that day's 03:30 nightly, so the newest ledger row (id 16) was written by the OLD v1 function and `analytics_rolled_boundary()` is **still NULL**. **The first v2 run is 2026-08-18 03:30 UTC.**

**What to check on that first run — three observables, all tool-readable:** (1) `analytics_rolled_boundary()` becomes non-NULL (the watermark starts advancing; from here the prune's gate is schedule + dry-run only — see the warning below); (2) the author's `users.rollup_rebuild_needed` flips **true → false** (it is true right now: 0036's `Pacific/Auckland` UPDATE legitimately fired the zone-change trigger, so the self-heal is queued — with 0 checks it recomputes nothing and just clears, which is exactly the NULL-guard path the local matrix caught); (3) the row's `notes` should read `…; self-healed 1 owner(s)`. **If the watermark is still NULL after 03:30 on the 18th, the v2 job did not run — read `cron.job_run_details`, not the registration (P3).**

**⚠ THE COMPLIANCE PACK IS NOW TENSE-CORRECT, and carries a rule (retention-policy `2026-08-18-draft-7`).** draft-6 asserted that the nightly rollup "began advancing the watermark on 2026-08-18" before it had; draft-5 had asserted a fact a cron was about to falsify. Same mistake, opposite directions. **The pack now states mechanisms and schedules, and asserts something HAPPENED only after someone observed it** — and names the check (`select public.analytics_rolled_boundary();`) so a reader never takes it on trust. When the first v2 run is observed, that is the moment to sharpen the wording, not before.

**Live posture confirmed by tool-read 2026-08-17:** 0036 in `schema_migrations`, both rollup tables present, all 6 new functions present, `users.timezone` = `Pacific/Auckland` for the author and NULL (→ Chicago default) for the other three, **0 purge ledger rows, 0 rolled rows, 0 checks**, and **13 analytics ledger rows — exactly the 13 real nightlies, no verify residue** (P7 holds; the live verify's rolled-back transactions consumed sequence ids but left no rows).

⚠ **OPTIONAL, author's call (no recommendation pretends both sides win):** the cron hours. 03:00/03:30 UTC is US Central 21:00 (homework evening) AND NZ 15:00 (school afternoon) — busy for both. Across a 17–18h offset **there is no mutually-quiet hour**; ~09:30/10:00 UTC would favor the US cohort at the cost of NZ-evening rolls. Correctness never depends on the hour (full-day re-rolls are idempotent); the only cost is boundary churn. `cron.alter_job`, author-run SQL if wanted.

⚠ **THE GATE'S CHARACTER CHANGES WHEN 0036 LANDS — the one thing not to misread.** 0035's gate was mechanical: nothing wrote `rolled_through`, so arming was inert. **0036 writes it nightly.** From then on the prune is held disarmed by exactly two things: it is **not scheduled**, and its **dry-run default**. Scheduling `prune_section_checks(false)` would then really delete. The arming checklist in [TODOS.md](TODOS.md) is the only guard from that point, and step 8 (the cron flip) is the first genuinely destructive act in the whole arc.

**✅ THE ONE PROOF NO SESSION CAN MAKE — COLLECTED 2026-08-16** (author, real browser, second Google account; tool-confirmed, narrative archived in [HISTORY.md](docs/HISTORY.md)). A stranger's Google account joined class `7NE9M2` end to end: `users` went 3 teachers/0 students → 3 teachers/**1 student**, no `pending` rows remain, and the class's `expected_domain` is null with no `student_domain` row — so that account matched **no** fast path. That discharges the OAuth round trip, the trigger admitting a stranger, and `retryRole` after promotion. *(Repro: `/` → `7NE9M2` → Continue with Google → "You're in ✓".)*

**What the collected proof does NOT cover — read this before citing it:**
- **Gate 4 is untouched.** What ran was `redeem_join_code`. The **`student_domain` fast path has still never executed live** — no seed, no exercise. It stays deliberately last (see its own item below).
- **`claim_teacher` has never promoted anyone live.** All 3 teacher rows predate the admission slice (newest 2026-07-29), so the "I'm a teacher" self-serve door — the one D24 is actually about — is still unexercised by a stranger.
- **✅ Confirmed by the author on the same run:** the brief neutral gate card DID appear between "Joining class…" and "You're in ✓", and read as normal loading rather than an error. Expected and correct — `retryRole()` sets `roleStatus='loading'` in the same batch as the success state. The question this closes is not "does it render" but "does a real person misread it as a failure"; they did not. Leave the sequence alone.

**⚠ D24 counsel read — OWED, and the gate it was meant to hold is ALREADY OPEN (author-accepted risk).** R10/OV-8 ruled teacher self-serve must not reach strangers before counsel read the amended pack. It does: 0033 carried BOTH promotion RPCs and `PendingOnboarding` ships BOTH doors, so applying the migration opened Drop 2 alongside Drop 1. **The author reviewed and accepted the exposure** (unadvertised site, caps of 5 classes / 50 members bound any single bad actor). ⚠ **As of 2026-08-16 the exposure is no longer hypothetical**: a real second account's data now sits in the database under a pack every file marks DRAFT. It is the author's own throwaway account, so nothing is owed to a third party — but the "no real student data" cushion this item leaned on is gone. Concretely: any Google account can sign in → "I'm a teacher" → attest → create classes and read roster emails, under a pack every file marks DRAFT. **✅ The packet is written: [counsel-review-packet.md](docs/compliance/counsel-review-packet.md)** — the draft-2 → draft-3 delta, the live position up front, and ten numbered questions each naming the platform's current position (Q10, added 2026-08-16, asks whether n=1 daily aggregates surviving a purge are retained student data — it gates ARMING the check-prune, nothing sooner). The load-bearing three: Q2 (does an *unverified* educator attestation carry the authorization it asserts), Q4 (is the per-class 13+ assertion defensible when students are never asked their age), Q5 (on what basis is a pending account's data held *before* any teacher vouched). The read itself is the author's; nothing repo-side is owed.

**Gate 4 — seed `student_domain` + live-verify the trigger's student branch** (deliberately LAST; needs a real district domain). Prerequisite MET (0027 live). ⚠ **Never seed a consumer domain like `gmail.com`** — one row would admit every Google account on earth as a student.

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, a materially faster author across the run). **The slot stays open for the NEXT representative multi-station day.**

**📌 NOT reproducible from migrations: all three teacher `display_name`s are NULL by a direct data edit.** 0021's backfill NULLed the two rows holding emails; the author then ruled (2026-08-04) the third — a 2026-07-29 account where Google DID supply `full_name` — should be NULL too. That row was outside 0021's scope by design, so it was cleared with a one-row UPDATE, **not a migration**. Consequence: a restored-from-migrations database would NOT reproduce this, and **a brand-new teacher signing in with a Google account that has a `full_name` will publish that name**. See the name-appearance design signal in Backlog.

**Baseline facts, tool-read live 2026-08-17 (never claim-read):** migrations applied **through 0036** · exactly **TWO** Edge Functions — `get-activity` **v19** (`verify_jwt:false`, the only one) + `check-activity` **v15** (`true`) · `pnpm verify:auth --target live` = **147 passed / 0 failed across 12 scripts** · both pg_cron jobs active · live rows (re-read 2026-08-17 after the 0036 apply): **3 teachers, 1 student, 0 pending, 0 checks, 0 grades, 1 class (`7NE9M2`, 1 active member), 8 activities** · **0 `analytics_job_runs` rows carry a `rolled_through` yet** — the first v2 run is 2026-08-18 03:30 UTC (see the ⏭ block). ⚠ **"No real student data exists yet" is NO LONGER TRUE** — one real second account is enrolled. It is the author's own throwaway, so the compliance answers stay cheap to change, but the sentence that made them free has expired. **Re-verify flags with `list_edge_functions` after every deploy — read the `version` field, NOT the `entrypoint_path` suffix beside it** (that misread produced a false "verified live" stamp twice; `get-activity`'s path ends `…_11` while its version is 19).

⚠ **One standing watch-note (the retry-log discipline):** the a11y **gap-2 keyboard row** flaked ONCE (run 31852826598) and has not recurred in the **seventeen** green runs since (latest 32048169054, the shell-slim slice). Instrumented in `e6b2872` so a second sighting names where focus actually is. **A second sighting is conclusive — fix then, not before. Read the flaky COUNT on every run, not the conclusion.**

**Archived to [HISTORY.md](docs/HISTORY.md):** all S9 author stations, the station HEADs (OV-DX-9), the closed gate-9 ledger, and this session's 0034 apply + purge-liveness + CI narrative.

## Standing constraints & watch items (current arc)

- **✅ The R2 graph-kit path is DEAD code-side (S9 Drop 4), and the D-13 teardown RAN 2026-08-15:** the viewer + editor build the kit from the workspace (app-bundled lazy Vite chunk), and the upload scripts + `.env.r2` are deleted — no kit upload is ever needed again, and no script survives to resurrect one. What remains is author-side only: unset the dashboard secrets, shrink `ALLOWED_ORIGINS`, delete the bucket. The 283-object archive is `r2-final-backup-20260815/` (untracked, repo root).
- **Known limitation (stated, not hidden): offline boot needs a token that has not expired.** Expired token + no network ⇒ the pre-auth gate — refreshing needs the network, and reading Supabase's session storage directly in shipped code is a dependency worth refusing. (Offline *reopen* itself is proven as of S9 Drop 5; it had never actually worked before then — `Vary: Origin` defeated `Cache.match`.)
- **Retention is COMPLETE and proven end to end (0022–0025).** The one thing to know when touching it: **`users.deleted_at` means "account disabled", NOT "retention clock running"** — `join_class` refuses accounts that have it set, so student dormancy is DERIVED live from `class_members`/`classes` (400-day window) and the purge job never writes that column. Don't "simplify" it into a stored flag; that reintroduces a between-terms lockout. "Who is dormant right now" has no column to read — the query is `scripts/verify-0025.sql` section D.
- **⚠ `purge_soft_deleted` was re-created by 0029** minus its `submissions.student_id` guards (the nightly cron job would have died otherwise). It is live and running; treat it as the current definition.
- **✅ Teacher grading — SHIPPED 2026-08-16** ([teacher-grading.md](docs/design/teacher-grading.md)). Kept in the backlog only for what it left behind: the **by-student queue view** and **rich-text teacher feedback** (plain text is v1) are named follow-ons. Its pruning/rollup inheritance is now DISCHARGED into 0035 + the arming-arc TODOS entry.
- **⚠ Local verify pair-of-reds is DATA-STATE-DEPENDENT, not a fixed pair.** The recorded "fresh DB = 114/2 (image-storage + 0020)" is one instance of a class: on 2026-08-16's non-fresh local DB the suite scored 125/2 with verify-**0033** `existing_teachers_exempt` (e2e-fixture teachers aren't caps-exempt) + verify-0020 (no published activity) red and image-storage green. Read WHICH rows failed and check they're seeded-data preconditions before treating any local red as a defect; live is the arbiter.
- **⚠ Unexplained one-off:** `sanitize.test.ts` → "differs across students and across versions" failed once (2026-08-01) and did not reproduce in 13 runs. Recorded so a second sighting is treated as a pattern.
- **Verification quirk:** the in-app Browser pane suppresses the position-measured hosts (command bar / quick-bar / drawer) under JS-driven selection — Playwright e2e (real chromium) is authoritative. `/playground` (unauthed) is the dev target; `/playground?empty=1` mounts a blank doc.
- **Three e2e traps worth re-reading before touching the lanes:** verify env-sensitive work with `.env.local` moved aside (`mv` → run → restore, OV-DX-13); `E2E_SKIP_BUILD` over a dist built from `.env.local` puts every signed-in spec on the sign-in screen — let the lanes build their own dist; and **the STUB lanes' Supabase origin must be an address NOTHING listens on** (`packages/app/e2e/helpers/e2eOrigins.ts` — the offline rows prove themselves with a real connection refusal). The third one was a live defect until 2026-08-18: the stub lanes and the integration lane shared `127.0.0.1:54321`, so `supabase start` made the sw lane's two offline rows red with a symptom that named nothing ("Please sign in again", from Kong's real `401 Expected 3 parts in JWT; got 1`). Stub lanes now sit on **54399**, outside the CLI's whole default range; `scripts/tests/e2e-origins.test.mjs` pins the separation + CI's build env, and the rows preflight the origin with a named fix.

## Current focus — NEXT BUILD: the batch importer, then the pilot

**The build queue to the catalogue, in order (each gates the next):**
0. **✅ The viewer numbering slice — BUILT 2026-08-20 (V1–V6 + V9; V7 is an author action).**
   [viewer-numbering.md](docs/design/viewer-numbering.md), eng-reviewed (D2–D10) then DX-reviewed
   (D1–D4). **The viewer had rendered no problem number for ANY block type since the renderer died
   at S9 Drop 4** — the registry declaration and its guard survived the deletion, so the contract
   read as honoured for four months. Shipped: a pure `buildNumbering` walk → id-keyed map, rendered
   by the SHARED block wrapper (grid declared once; the renderer's per-type version shipped
   number_line and data_plot without it, twice), all three label modes, `labelFields` on the last
   three numbered blocks with the save-path chain closed, sub-part lettering, and the number
   announced once from a labelled group.
   **The load-bearing piece is the guard** (`numbering-output.test.tsx`): it binds `numbered:'always'`
   to RENDERED OUTPUT. Proven against the original bug — with the render path removed,
   `registry.test.ts` reports 43 passed (green, as it was) and the new guard reports 3 failed,
   naming all eight types. **Generalisable:** when a package is deleted, its surviving DECLARATIONS
   need a consumer audit; a guard comparing two declarations outlives the implementation and then
   reads as coverage.
   **⏭ V7 is yours:** regenerate the Linux print baselines — see Pending author actions.
   Also shipped alongside: **`pnpm verify`** (DX D3) — CI's whole check job in one command.

1. **✅ The answer-key slice — BUILT (T1–T6 complete; T7 fully done, see below).** [problem-answer-key.md](docs/design/problem-answer-key.md) rulings E1–E10, shipped this session. Both traps the review pinned were real and both are now pinned by tests: the serialize round-trip (`serialize.test.ts`, three legs — import → save → **reload → resave**, plus the whole-pipeline pin in `markdownToTiptap.test.ts` that starts at the fence and ends at the second save), and the coverage-guard **contract amendment** (`answerKey.test.ts` now asserts **keyed ⊇ auto-gradable** with its own bound — a keyed type may not be static — and pins `self_explanation` as a NAMED exclusion). **The deploy gate is live and BLOCKING — see Pending author actions.** Two things the design did not anticipate, both found while building and both fixed here: (a) **the editor's numbering bridge did not know these blocks**, so `numbered:'always'` would have shifted every question number after a short_answer down by one — `PM_NAME_TO_SCHEMA_TYPE` gained both, and the parity test that file had *claimed* for months now exists (`problemNumbering.test.ts`, policy P11); (b) **`ANSWER_KEY_INK` is an SVG stroke colour, not a text colour** — applied to the key panel it was nearly invisible in dark mode, and the print token layer already forces every ink to pure black, so the panel inherits `--vw-color-ink` on both surfaces instead.

**T7 (the P2 sweep) ran too, and it found the bigger one.** Shipped: a universal `printExpectations` row (the written key never prints on a student worksheet, its non-vacuity pair named in `print-answer-key.e2e.ts`) and an a11y row scanning the **post-check** worksheet — a state that lane had never scanned, and where this slice's new solution-disclosure DOM lives. Both verified in a real browser (a11y 1 passed, print-rules 50 passed, print-answer-key 10 passed).

⚠ **THE OTHER HALF IS BLOCKED, AND THE REASON IS WIDER THAN THIS SLICE: the viewer renders NO PROBLEM NUMBER for any block type.** `fill_in_blank`, `multiple_choice`, `matching`, `ordering`, `number_line` all declare `numbered: 'always'` and none of them render a number — verified in the dev harness. `ViewerContainer`'s block slot emits no numbering attribute, no CSS counter exists, and `pageLabel()` has no consumer outside the schema's own tests. **The implementation was the renderer's `isNumberedBlock`, which died with `packages/renderer` at S9 Drop 4; the viewer never inherited it, and the registry declaration + its guard survived the deletion, so the contract still looks honoured.** This makes E7's stated premise ("numbers render on screen and on paper from the one existing numbering walk") false for the student surface — the registry change is still correct and the editor's gutter honours it, but nothing puts a number on a printed worksheet. **Paper-first is the whole reason this slice exists**, so this is worth scheduling deliberately: it is now [TODOS.md](TODOS.md) item **1b**, scoped as its own slice covering every numbered type at once (a numbering surface serving two block types is worse than none — the sheet's numbers would skip).
2. **The batch importer + meta summary line** (agreed, undesigned): a node script over a folder of .md files → `getMarkdownImporter` → `wrapBlocksStrict` → `tiptapToActivity` → upsert KEYED ON FILENAME so re-import updates instead of duplicating (the .md folder is the source of truth; this is what makes a format bug a re-run instead of a 150-file archaeology session). Conversion path is DOM-free (node-safe) — verified. Plus: the Import dialog's summary line must confirm what the ```meta fence read (it currently reports blocks only).
3. **The pilot** — 2–3 real activities round-tripped end to end (paste → file → publish → key print → outline) BEFORE the other ~147 are written.

**The author is pre-authoring the catalogue as markdown files in a separate folder.** The import format is therefore the builder-AI's entire vocabulary; docs/markdown-import-format.md embeds the canonical prompt (regenerate that block from the constant with a function replacer — `$$` in a String.replace replacement inserts a literal `$`).

## Earlier focus — the check-prune slice (0035) is BUILT; the rollup deliberately WAITS

**Plan + the full ruling trail: [check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md)** (eng review 2026-08-16, D2–D12). The months-parked pruning/rollup entry closed in one day — but NOT as drafted: **the review's outside voice overturned the draft's build-the-rollup-now frame (D10)**. What shipped is the prune, DISARMED, with a schema-encoded arming gate: `prune_section_checks` refuses every row until `analytics_job_runs.rolled_through` is non-NULL, and nothing writes that column until the future rollup does — so arming early is mechanically inert, not merely forbidden (D11). The rollup's design is fully RULED (item grain, per-teacher timezone with `America/Chicago` default + the author's row → `Pacific/Auckland`, 5-min MVCC lag, coalesce-forward watermark, latest-grounded students) and recorded in the plan §5 + the TODOS arming-arc entry — **inherit, don't re-derive**. Trigger for building it: real check growth on the ledger (still 0).

**Three things worth knowing before touching it:** (1) the `section_checks_latest` view is THE definition of "current attempt" — the prune deletes only its complement, and verify-0035 §C(H) pins the queue's equivalence; (2) G12 is clause 2 — a graded check is never a candidate, proven with a real deletion in §C; (3) verify-0035 §A's `rolled_through_never_written` row is DESIGNED to go red when the arming arc lands — flip it there, don't delete it.

**Teacher grading (0034, [teacher-grading.md](docs/design/teacher-grading.md), shipped 2026-08-16)** is live and correct-and-EMPTY: 0 checks, 0 grades. Four doors — `upsert_check_grade` · `release_check_grades` · `get_my_released_feedback` · `list_grading_queue`. **Three things to know before touching it, all recorded in [DECISIONS.md](docs/DECISIONS.md):** `check_grades` has ZERO RLS policies deliberately (the four functions ARE the access surface); maxPoints is denormalized into `criteria` by the SERVER so the student readback never opens the raw document; writes gate on `can_edit_activity` and reads on `can_read_activity` — byte-identical today, but the Activity-Bank landmine is a widening of the READ helper, which must never confer write access to academic records. **Stale means the TEXT changed**, never "a newer check exists" — re-checking to retry auto-graded blanks is a designed feature. Still open by design: the by-student queue view, bulk cap-lifting, rich-text feedback.

## The completed arc — what stays live from it

**The arc is CLOSED — S0 through S9 plus the Admission and Teacher-grading slices.** Framing paragraphs, the slice ledger and the C1–C15 cutover gates are archived in [HISTORY.md](docs/HISTORY.md) (final gate sweep 2026-08-15: 14 closed, 1 standing, gate 4 deferred to the first classroom); rulings in [DECISIONS.md](docs/DECISIONS.md). Nothing in that table is a live decision. What stays live from it:

**Timing calibration — RECALIBRATED 2026-08-14 (the gate-9 re-measure, done by the rule).** `TIMING_TARGET_MS` = medians of the 5 post-cutover green runs (pre-auth **992**, worksheet **1135**, math-rendered **1812**; `9b78496`); the 2× ceiling and delta warning derive from these. Recalibrate only by the same rule — median of ≥5 green runs, never local darwin, never a single run. (Both ledgers archived: 08-07/09 in HISTORY, post-cutover above.)

**Suite (tool-verified 2026-08-18, after the shell-slim slice):** schema 340 / graph-kit 384 / **viewer 1139** / **app 1092** unit, plus **54 script tests**, the print e2e lane, and the editor/student/sw/perf/**a11y** e2e lanes (the four CI lanes run **73** rows — a11y is 11 with the Responses-tab axe row; the local-only integration lane is **9**). Typecheck + lint clean (0 errors); all **16 perf budgets pass**. ✅ **The four CI lanes are 73/73 LOCALLY with the local Supabase stack running** — the configuration that used to be red (see the e2e-origins trap under Standing constraints above). ⚠ **This line does NOT pin the bundle sizes any more** (drift audit 2026-08-17: three different entry-chunk numbers were in circulation across two STATE rows). **`node scripts/check-perf-budget.mjs` prints the real numbers and its caps live in `scripts/perf-budgets.mjs` with their reasoning** — read those, never a doc's copy. Same for test counts: `pnpm test`.

**Editor open remainders (deferred, pre-rewrite arcs; roughly priority-ordered):**
1. **Focus mode** — needs a caret-tracking ProseMirror plugin; off-by-default, wants its own design+eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers the keyboard floor.
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike, gates nothing.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
5. **Chip open:** the slash menu dies under synthetic keyboard input once a query char follows `/` (humans unaffected). **Papercut:** the gutter "+" can overlap the drag grip's lower half on a short block.

## Backlog / candidate arcs

- **Re-architecture follow-ons (accepted 2026-07-28):** (1) Clever/ClassLink district SSO — demand-triggered; **IdP map recorded 2026-08-09** — LMSes are not IdPs; expansion order is Azure/Entra → Clever/ClassLink → LTI 1.3. (2) Realtime push arc — trigger = first named live feature. (3) Sampled behavioral telemetry — only after the census can't answer a concrete question AND the compliance pack is amended. (4) Print variants. (5) Solution-unlock pedagogy pass. (6) /design-consultation brand pass — includes replacing the system-ui chrome font stack (design-review ding, 2026-08-18).
- **✅ Admission model — RULED, BUILT AND LIVE 2026-08-15** ([admission-model.md](docs/design/admission-model.md) §5b R1–R11 + T1–T7). Kept in the backlog only for what it left behind: the durable **Edmodo lesson** (the violation was outsourcing consent duties without operator-side notice/minimization — **copy Gimkit's enrollment-=-consent mechanism, not Blooket's "school is responsible" clause**), and the follow-ons now split by design — **under-13 (D7), the DPA template, and the cap-lifting surface live in [TODOS.md](TODOS.md)**; email+password, extra OAuth providers, the guest tier and CAPTCHA stay in §7. Gate 4 proceeds unchanged (the domain fast path is untouched).
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
| Database migrations 0001–0036 | ✅ **All applied + verified live — `verify:auth --target live` = 147/0 across 12 scripts** (0036 applied 2026-08-17). 0031+0032 were REPRODUCIBILITY migrations; **0033 is the admission slice**; **0034 is checks-native grading**; **0035 is the disarmed check-prune + arming gate**; **0036 writes the watermark that gate reads**. Re-run `verify-0013-0014.sql` + `verify-0017.sql` after any auth/RLS/grant migration |
| Scheduled jobs (pg_cron) | ✅ Installed 2026-08-05; both jobs active; first fire observed + verified 2026-08-06. **Verify the run, not the registration** |
| Components-as-data slices S0–S9 | ✅ Complete — see the slice ledger; only author stations remain |
| Print (baseline CSS → authored feature → viewer print + gate) | ✅ Complete through S5.5; print gates run in CI; sign-off evidence durable at tag `s5.5-print-signoff` |
| Question types + pedagogical blocks + calculator + reference panel + typography | ✅ All live |
| Phase 2.6 manual grading | ⚰️ **RETIRED at S9 Drop 3.** Blocks + rubric authoring survive in editor/schema/viewer; the dashboard + `lib/submissions`/`lib/grades` are deleted; `grades` kept empty. Successor SHIPPED 2026-08-16 as the checks-native grading slice (0034); `grades` + `can_grade_submission` dropped there |
| Edge Functions (**2**) + deploy flags | ✅ get-activity **v19** (`false`) + check-activity **v15** (`true`); re-verified live 2026-08-15 at the gate sweep (the prior v11/v7 were the `entrypoint_path`-suffix misread AGAIN — see the correction under Baseline facts) |
| Cloudflare R2 hosting | ⚰️ **DEAD.** Code-side at S9 Drop 4; the D-13 teardown ran 2026-08-15 (upload scripts + `.env.r2` deleted). Only the dashboard steps remain — see the standing constraints |
| Auth (Google OAuth teacher allowlist + student SSO) / React app / editor stack | ✅ In place |
| CI (typecheck/lint/test/build + **2** bundle-drift guards + **16 perf budgets + 54 script tests** + print gates + perf/sw/student/**a11y** lane job) | ✅ **GREEN — run 32081815982 (the e2e-origins fix).** **25** consecutive green runs, tool-counted (last failure 31787010974). Run 32081815982 is the first to exercise `ci.yml`'s new build env, and its perf lane ran 73/73 |
| Student bundle (S8) | ✅ Entry chunk = the student shell; heavy libs lazy and content-pinned out of the shell. **Size is NOT pinned here — run `node scripts/check-perf-budget.mjs`** (caps + reasoning in `scripts/perf-budgets.mjs`). **Slimming slice 1 ran 2026-08-18: −21.2 KiB gz (the Supabase sub-client stubs), and the cap TIGHTENED 185 → 172 in the same commit.** Headroom is honest again; the remaining ladder is in TODOS |

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

**Last updated:** 2026-08-18 (shell slimming slice 1 built, pushed, CI-green at 32048169054; then its one leftover red — the sw offline rows — chased to root cause, fixed, pushed and CI-green at 32081815982. The rollup's first v2 run at 03:30 UTC is still the thing to check.)

**Two lessons from the day, both about tests that were passing for the wrong reason.** (1) **The sw offline rows were green in CI because CI has no local Supabase stack** — the stub lanes and the integration lane shared one address they needed to mean opposite things. A lane that passes because of what is ABSENT from the machine is not passing, it is unobserved. Mechanism + the guard now holding it: `packages/app/e2e/helpers/e2eOrigins.ts`. (2) **Two of the shell-slim plan's own claims were wrong, and the tests written to honor them are what found it** — "vitest parity, dissolved by inspection" (vitest externalizes `node_modules`, so the alias never applied) and severe-finding-1's premise (an apikey-less upload does not 401); both written up in that plan's AS BUILT section. **The pattern to keep: when a review's own claims are the input, the build's first job is to make each one falsifiable.**

_Prior entries archived in [docs/HISTORY.md](docs/HISTORY.md)._
