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
