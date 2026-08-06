# S7 retrospective — analytics census (reviewed 2026-08-06)

**Scope:** slice S7 of the components-as-data rewrite (2026-08-04/05: migration
0026, `579ec1a` census on the read path, `scripts/backfill-census.js`, the
teacher analytics panel, the pg_cron registration), reviewed after S8 and before
S9. **Timing caveat:** S7 closed two days ago — the "later slices" evidence base
is one slice deep, so this retro leans on design-vs-shipped verification, the
S2 retro's survey of the shared read path, and live-database observation rather
than long archaeology. Re-run it after S9 has consumed (or demolished) what S7
built. An independent audit pass is expected to append below.

## Verdict in one line

S7 is the arc's best example of **re-deriving a plan against what actually
shipped** — the 2026-07-28 publish-time census was rebuilt as a derived,
read-path computation because S2's stored snapshots had quietly made the
original premise obsolete — and its one operational incident (the function
deployed ahead of its migration) was contained by a fail-safe another slice had
designed, minting the ordering rule now in CLAUDE.md; its latent costs are a
documented GC heuristic and the deliberate, well-recorded deferral of rollups.

## Costs already paid (lessons banked, no action needed)

1. **The function shipped ahead of its migration.** `get-activity` v8 went live
   calling a `write_version_census` RPC that 0026 had not yet created. The
   blast radius was small **only because the call site was designed to fail
   safe** (census error → cache row withheld → student still served a correct
   200; self-healed when 0026 landed — edge logs confirmed no content read
   even reached the window). The durable rule went into CLAUDE.md: when a
   function change calls a new database function, apply the migration first;
   the reverse order is never needed. A call site without the fail-safe
   property would have been a live 500 — the rule exists so nobody has to rely
   on being lucky twice.
2. **The backfill script's first run found two of its own defects**: it
   imported `@supabase/supabase-js`, which pnpm cannot resolve from the
   workspace root (rewritten to plain `fetch`, zero deps); and it counted
   unservable skips as *failures*, so a healthy run exited 1 and read as an
   outage — the honest-reporting lesson (a script's exit code is a claim)
   joining the repo's vacuous-pass family from the other direction.
3. **The backfill surfaced the concrete form of R6(d)**: 110 versions skipped
   as unservable — every one `schemaVersion 1` with no upgrade path
   (superseded history plus soft-deleted activities' versions). Not new
   breakage (the read API cannot serve those either), and no live published
   activity is among them; they age out with the purge. Known now, with
   numbers, instead of discovered during S9.
4. **The verify fixture had a real defect** (`activities.slug` NOT NULL,
   omitted) — found by running it, fixed in the committed script; plus the
   process note that verify scripts reporting an expected rollback as a scary
   error cost two round-trips, so 0026-era scripts open with a precondition
   gate and banner (a lesson the 0022–0025 arc started).

## Latent costs — what will bite future developers

5. **The cache GC's keep-rev heuristic has a documented soft spot**: the
   nightly `run_analytics_maintenance` keeps whatever `sanitizer_rev` the
   *newest* cache row carries — right after a deploy that is still the old
   rev, so the sweep can evict rows the new function would have kept. The
   failure mode is a cache miss, not bad data, and 0026 documents it in place
   — but the S2-era docs describe the table as single-writer, and a reader of
   either doc alone gets half the picture (flagged in the S2 retro's watchlist
   as a one-sentence DECISIONS amendment).
6. **Rollups are deferred onto a ruling that is itself parked.** The
   attempts-vs-latest question waits for the teacher-grading slice, which is
   itself demand-triggered and parked — so the aggregate that "survives
   retention" has no owner date, and raw `section_checks` (retained ~400 days)
   is the only durable record meanwhile. The deferral is the right call and
   superbly recorded (design inputs listed for the future slice: watermark,
   small-cell posture, timezone, purge-side assert) — the risk is only the
   two-deep park.
7. **The panel currently aggregates nothing, live.** `section_checks` is empty
   today (the author's 44 E2E checks were manually cleaned per the documented
   residue procedure), so `get_activity_analytics`, the `*_all`/`*_latest`
   dual readings, and the `_unattributed` bucket have run against fixtures and
   rolled-back probes but never against organic data. First organic exercise
   coincides with first classroom use — same shape as S1's admission path,
   smaller stakes.
8. **STATE's "observe the cron's first fire" can be closed**: verified live
   during this review — both jobs ran 2026-08-05 03:00/03:30 UTC and
   succeeded, purging nothing, exactly matching the falsifiable prediction
   (oldest soft-delete is 26 days old; `past_window = 0`).

## Refactor watchlist

**Cheap now:**

1. Close STATE's cron observation item with the verified result (~5 min —
   evidence in this retro).
2. The S2-retro watchlist already carries the second-writer DECISIONS
   amendment; add the GC keep-rev soft spot to the same sentence (~5 min).

**Opportunistic:**

3. When the teacher-grading slice unparks, the rollup design-inputs list in
   DECISIONS is the starting artifact — resist rebuilding it from scratch.

**Policy:**

4. **Re-derive plans against shipped reality before building** — S7 changed
   shape twice under review before a line was written (derived-not-written
   census; rollups deferred), both times because a 2026-07-28 assumption had
   been silently obsoleted. This is the cheapest kind of correction; the
   review cadence that produced it should outlive the arc.

## What held up (no apology needed)

**The derived census** dissolved finding R6(b) outright rather than mitigating
it — nothing rides `publish-activity`, so S9's rewrite touches nothing (and
STATE's amendment explicitly warns against re-adding a publish-time write that
would race the read path). **The write ordering as the defect fix**: census
first, cache row only on success, because a stranded version would aggregate as
`_unattributed` silently and permanently — found by the outside voice, pinned
red-green in the handler tests. **Attribution reuses the grader's enumeration**
(`inventorySection`), because two enumerations drift and drifted attribution is
invisible — with the `import type` discipline pinned by a unit test so mathjs
can't ride into the read bundle. **The TypeScript-not-SQL call** for the
computation (three pieces of knowledge — key rule, structural walk, upgrade
chain — that plpgsql would restate and silently mis-count at the first schema
migration). **Observability as a table, not a log line** (`analytics_job_runs`
+ the panel printing the last run), because pg_cron records return values, not
notices, and free-tier logs die in a day. **The dual `*_all`/`*_latest`
readings with neither privileged** — the re-check inflation demonstrated
concretely in the verify fixture (4/6 vs 3/4) instead of asserted. And **the
analytics tables carry no student identifier by construction**, with the
absence asserted against `information_schema` — "we just won't add that
column" correctly treated as not a control.

---

## Independent audit (2026-08-06, second-pass)

Adversarial re-verification by a fresh-context auditor, with the orchestrating
session re-verifying material findings — including one auditor correction that
live-database evidence overturns.

**Verdict on the retro:** substantially accurate and well-sourced — every
commit, count, and narrative beat traces to HISTORY or code, and two Part-C
candidates resolved in the retro's favor (the backfill's delete-then-insert
idempotency is real and reasoned; the variant-suffix census guard is
rule-derived, not a hand-roster). But the live-DB claim compresses a two-part
prediction into one sentence, the residue-procedure cite does not survive
reading the script, one watchlist pointer aims at the wrong document — and the
blind spots are the S0/S1 shape: the retro audits what S7 *ruled*, not what
S7's machinery does (the panel, the backfill's paging, the hazard's real
window).

### Confirmed

Findings 1–4 verbatim against source: the function-ahead-of-migration
narrative including "the reverse order is never needed" in CLAUDE.md; both
backfill defects documented in the script itself with the "reads as an outage"
reasoning; 110 unservable with the skip banner printed every run; the slug
defect fixed in place; the write-ordering red-green pins at
`get-activity-handler.test.ts:633,654,673`. The GC hazard comment at
`0026:203-215`; the two-deep park real (`TODOS.md:168-175` with the
"first real teacher" trigger; `:230-233` naming that ruling as the rollup
blocker); attribution via `inventorySection` with the `import type` pin;
B4's `information_schema` assertion.

### Corrected

1. **Item 8 compresses a two-job prediction and inherits STATE's own error.**
   STATE:14 predicts the analytics job's ledger row with `census_versions = 0`
   — but the backfill censused 24 versions the same day, so that half of the
   committed prediction was stale before the run. "Matching the falsifiable
   prediction" is true of the purge half (`past_window = 0`) only; say which.
2. **The auditor's companion claim — that the first fire must have been
   2026-08-06 — is itself wrong; the database overrules the inference.**
   [Orchestrator, from `cron.job_run_details` queried live 2026-08-06:
   `purge-soft-deleted` start_time `2026-08-05 03:00:00+00`,
   `analytics-maintenance` `03:30:00+00`, both `succeeded`.] The sharper
   finding the failed inference exposes: STATE's "had not yet run when last
   checked" was committed at 20:40 JST — *after* the 03:00 UTC fire — so the
   observation item was already stale when written, and closing it requires
   correcting the prediction, not just ticking it.
3. **"Manually cleaned per the documented residue procedure" does not hold** —
   the script's printed cleanup is scoped to one run's activity and a
   30-minute window; the 44 rows cleared spanned three days. The cleanup was
   necessarily a broader, undocumented delete (see the S4 audit, which also
   found it vacated `verify-0022` C1).
4. **Watchlist item 3 points at the wrong artifact** — the five rollup design
   inputs live in `TODOS.md:214-227`; DECISIONS carries only a compressed
   parenthetical.
5. **Finding 4's "precondition gate and banner"**: verify-0026 adopted the
   gate and deliberately *rejected* the banner shape (its header says the
   raise-exception form "reports success as a scary P0001"); the banner is a
   0022–0025 artifact.
6. **Finding 5's hazard window is narrower than stated** — right after a
   deploy *every* row carries the old rev, so the sweep deletes nothing wrong;
   the eviction requires a new-rev row *older by created_at* than an old-rev
   row (a rollback, or two function versions serving concurrently). The
   proposed DECISIONS amendment should encode that window, not "right after a
   deploy."

### Missed — what the retro never examined

7. **The panel is mostly good and one field is dead**: real error/empty/
   staleness states with honest copy — but `stale_cache_rows_deleted` is
   fetched, typed, and never rendered (the S0 finding-4 pattern, one line to
   fix), and there is no guard on a missing route param before the RPC call.
8. **The teacher gate is `can_read_activity` — used correctly, with an
   unstated side effect**: its `deleted_at is null` clause makes a
   soft-deleted activity's analytics unreadable *to its own owner* during the
   retention window. Plausibly intended; recorded nowhere.
9. **The de-identification win is about the tables, not the screen** — the
   panel already emits per-key `students` counts, and TODOS names
   `students = 1` as exactly the unresolved small-cohort exposure. Owner-scoped
   today, so not a leak; but "no student identifier by construction" is
   narrower than the closing sentence implies.
10. **The growth-ledger number has exactly one consumer** (the panel's
    job-health line); the retention decision DECISIONS says it serves does not
    read it yet. And the backfill's `limit/offset` paging over full `content`
    can skip rows under concurrent inserts and scales memory with total
    published content — fine at 134 rows, unexamined as a property.

### Audit addenda to the watchlist

- Rewrite item 1: close STATE's observation with the split verdict (purge half
  matched; analytics half's prediction was stale before the run) and fix
  STATE:14 rather than propagating it.
- Extend item 2 with the hazard's real window (correction 6); repoint item 3
  at `TODOS.md:214-227`.
- **New, cheap (~5 min)**: render or delete `stale_cache_rows_deleted`.
- **New, policy**: when a retro cites a "documented procedure," read the
  procedure — the second time in this arc a documented path was credited for
  work done by hand.
