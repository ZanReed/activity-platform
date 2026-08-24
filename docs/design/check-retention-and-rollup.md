# Check pruning + the durable analytics rollup

**Status:** ✅ **SHIPPED — both halves live.** Part I = migration **0035** (the disarmed prune +
the schema-encoded arming gate), applied live 2026-08-16, `verify:auth --target live` 127/0.
Part II = migration **0036** (the durable rollup + the self-healing timezone layer), applied live
2026-08-17, live 147/0, `verify-0036` 20/20. **What is NOT done is ARMING the prune** — an
eight-step checklist owned by [TODOS.md](../../TODOS.md) ("The check-rollup ARMING arc"), blocking
on counsel question Q10 and N green nights of a non-drifting reconciliation pair.

⚠ **As-built delta — read this before citing anything below.** Part I's frame (§1–§7, and the D10
pivot note immediately following) argued for shipping the prune ALONE and deferring the rollup to
arming. **That deferral lasted one day:** the author pulled the arming arc forward the same
evening, and Part II (§II) designed and shipped the rollup. Part I's reasoning is preserved
because it is why the *gate* exists, not because the rollup is still deferred. **The single most
important consequence, and the thing most likely to be misread: 0035's gate was mechanical
(nothing wrote the watermark), and 0036 writes it nightly — so the prune is now held disarmed only
by being unscheduled and dry-run-by-default.** See §II and the prohibition in CLAUDE.md.
**THE FRAME PIVOTED AT REVIEW (D10):** the draft ruled "build the full rollup now, prune disarmed"
(D2). The outside voice showed the real invariant is *rollup before ARMING*, not *rollup before
first check* — while the prune is disarmed, a rollup is rebuildable from raw rows at any time, so
building it against 0 rows ships ~10 speculative DB objects. **This slice ships the PRUNE ONLY,
disarmed, with its safety proofs — and the rollup becomes a hard, MECHANICALLY-ENFORCED
precondition of arming** (D11). The rollup's own design questions are RULED and recorded in §5 so
the arming arc inherits decisions, not re-derivations.
**Owns:** the TODOS entry "`section_checks` retention / GC — AND the durable analytics rollup"
(rewritten by T6 into the arming-arc entry).
**Inherits:** teacher-grading §2 **G2** (attempts vs latest) and **G12** (pruning must never
delete a graded check). Settled inputs.

---

## 1. Re-derivation against shipped reality (P10, done 2026-08-16)

Tool-read live, not claim-read:

- **0 `section_checks`, 0 `check_grades`** — no data pressure; no usage to validate a rollup
  shape against. This fact ultimately drove D10.
- 0026's growth ledger: 11 nightly runs (08-05 → 08-15), `section_check_rows` = **0 on every one**.
- Both cron jobs active. jobid 1 failed 2026-08-14 (`submissions_activity_id_fkey`) — recorded in
  HISTORY as resolved; re-verified this session: 0 `submissions`, 0 blocking references.
- `purge_soft_deleted`: 0034 §G is current (third rewrite). **This slice does NOT touch it** —
  the fourth rewrite now belongs to the arming arc (purge-side unrolled-count reporting is only
  meaningful once a watermark advances).
- `get_activity_analytics` (0026 §6) computes `*_all` and `*_latest` live and privileges neither.
  **Untouched by this slice** — verify-0026 §C3 keeps covering it unchanged.

### F1 — Pruning non-latest rows is lossless for every "latest" reading — verified against shipped SQL

Prune predicate clause 1 is "not the latest row for its (student, version, section)". Verified by
reading each shipped function:

- `get_activity_analytics`'s `latest` CTE (0026:328–332) and `list_grading_queue`'s `latest` CTE
  (0034:483–492): `distinct on … attempt_number desc` — rows clause 1 never touches.
- G2 staleness compares the **graded** check's text (0034:517 reads `sc.responses` from the graded
  row — possibly non-latest, protected by clause 2/G12) to the **latest** check's text (clause 1).
  Both survive, each by a different clause — verify §D pins the pair.
- `record_check` (0020:273): `attempt_number = max + 1` — the max row is the latest row. No
  renumbering. Rate ceiling window is 60 s (0020:222–223); idempotency replays are near-instant —
  any PRUNE_HORIZON in days clears both.
- `totals.students` / `last_check_at` / per-key `students`: computed live from surviving rows.
  Post-prune, per-key `students` naturally becomes latest-grounded (a student whose only contact
  with an item was a superseded attempt drops out). **No code change is needed for this** — the
  disclosure sentence is an arming-arc deliverable (§5, R12).

### F2 — `*_latest` is a snapshot, not a flow

It is never rolled because it never needs to be — exactly live-computable forever. `*_all` is the
only family pruning destroys, which is why the rollup is the arming precondition.

### F3 — A retention deletion is never blocked by an analytics watermark

The watermark gates the **prune** (a discretionary space optimization). `purge_soft_deleted` is
untouched now; when the arming arc rewrites it (v4), the unrolled-destroyed count goes **on the
ledger row, not the NOTICE** (outside-voice finding 4 — 0026 itself established notices are
unreadable: pg_cron stores status/return, free-tier logs die in a day).

## 2. What this slice ships

1. **`section_checks_latest` view** (D7) — THE definition of "the student's current attempt"
   (`distinct on (student_id, activity_version_id, section_id) … attempt_number desc`). The prune's
   clause 1 is its negation **by construction**. `list_grading_queue` and `get_activity_analytics`
   stay untouched (shipped, CI-green); their equivalence is pinned by verify §H plus comment bonds
   both directions.
2. **`analytics_job_runs.rolled_through timestamptz` — nullable, and NOTHING writes it** (D11).
   Only the future rollup step will. This is the schema-encoded arming gate: an armed prune
   against a NULL watermark refuses every row, so **the prune physically cannot run ahead of a
   rollup that does not exist**. The checklist (§4) is thereby a procedure, not a load-bearing
   promise.
3. **`prune_section_checks(p_dry_run boolean default true)`** — deletes a row only when ALL hold:
   1. not latest for its tuple (the view's negation);
   2. no `check_grades` row references it (**G12**);
   3. `created_at < (newest rolled_through)` — **NULL refuses everything** (D11);
   4. `created_at < now() - PRUNE_HORIZON` — named constant, **floor 7 days with a comment bond**
      (outside-voice finding 6: once the rollup exists, delete-then-insert re-rolls of a
      still-open owner-zone day must recompute from raw rows, so the horizon must far exceed the
      day-completion lag).
   Dry-run default reports candidate counts and deletes nothing. Service-role only (0009 grants).
   Per **P3**, disarmed ≠ unproven: verify §E forces a real deletion at production values inside a
   rolled-back transaction, with the watermark seeded in-transaction.
4. **Migration header carries two checkable claims:** the arming checklist (§4), and "no RPC may
   read any future rollup table without an activity-scoped ownership gate" (R5's prohibition,
   stated where the arming arc will build).

**Deliberately NOT shipped now** (all were in the D2 draft; all deferred by D10): both rollup
tables, the rollup job step, `rebuild_check_rollup`, `users.timezone` + `analytics_day()`,
`purge_soft_deleted` v4, any `get_activity_analytics` change.

## 3. Verification matrix — verify-0035.sql, authored BEFORE the migration

Run-scoped, self-cleaning (P7), EXPECTED-ROLLBACK idiom (runner classifies the raise as PASS).

| § | Row | Why |
|---|---|---|
| A | View exists with the exact distinct-on shape; `rolled_through` column present, nullable, **all rows NULL** | §2.1–2.2 |
| B | Grants: prune is service_role-only; no anon/authenticated/public execute | 0009 |
| C | A graded check survives a prune — graded non-latest #2 + latest #3 both live after §E's run | **G12** |
| D | After that prune, `list_grading_queue`'s stale flag still computes from the surviving graded non-latest row | F1's pair |
| E | ARMED prune (`p_dry_run => false`) deletes a genuine candidate at production values, watermark seeded in-transaction, inside rollback | **P3** |
| F | Rows with `created_at >=` the seeded watermark are refused | clause 3 |
| G | **NULL watermark → ARMED prune refuses everything** — the D11 gate, proven with the gate open | D11 |
| H | Prune candidate set ∩ the queue's latest set = ∅ (equivalence pin, both directions) | D7 |
| I | `get_activity_analytics` output byte-identical before/after a prune (both families — `*_all` too, since candidates are also horizon-gated seed rows in this fixture… asserted on `*_latest` + `totals`; `*_all` asserted to change by exactly the pruned verdicts) | F1, honest edition |
| J | `record_check` attempt numbering still increments correctly after a prune | F1 |
| K | Zero-arg call (dry-run default) deletes nothing and returns candidate counts | §2.3 |

**P5 citation audit (judged at build, 2026-08-16):** the "nothing prunes `section_checks`"
sites split by medium. **Living docs are flipped now** — `retention-policy.md` Mechanics (T4),
the TODOS entry and STATE (T6) — to the new truth: *a disarmed prune exists and is mechanically
inert until the rollup arc writes the watermark*. **The migration-file sites (0026:106, 0022
header) are NOT edited**: applied migrations are immutable in this repo (each has exactly one
commit, checked), and their claims say "today", which stays literally TRUE while the prune is
disarmed. They fall to the ARMING arc, which must flip them the only durable way — by citation
in its own migration header (this is recorded in §5 so it is inherited, not re-discovered).

## 4. The arming checklist (recorded here AND in the migration header)

Arming = the author changes the cron command to call `prune_section_checks(false)` — but only
after the arming arc ships, because until it does, **the NULL watermark makes arming a no-op**
(D11). The checklist for that arc:

1. Build the rollup per §5's recorded rulings; backfill from surviving rows; watermark advancing
   nightly for ≥ N green runs (read the ledger, not the registration — P3).
2. Re-run the full §3 matrix plus the arming arc's own rows (§5 lists them).
3. Counsel packet **Q10** answered (small-cohort aggregates — T5 adds it now).
4. `PRUNE_HORIZON` re-checked against the split-day re-roll constraint (§5, finding 6).
5. Only then: flip the cron command. The prune goes live against a real watermark.

## 5. RULED INPUTS FOR THE ARMING ARC (decided at this review; inherit, don't re-derive)

- **Item grain, two single-grain tables** (D4): `check_rollup_daily (version, day: checks,
  students)` + `check_item_rollup_daily (version, day, item_id: verdict counts, students)`.
  `census_key` resolved at READ time via `activity_version_items` (never purged) so a re-census
  re-attributes rolled history — 0026's replaceability survives. FKs CASCADE from activities AND
  versions. 0026 §B's no-student-identifier assertion extends to both. Zero RLS, DEFINER reads,
  activity-scoped gates only.
- **Rollup rides `run_analytics_maintenance()`** (D5): one cron entry, one ledger; order sweep →
  roll → advance watermark; `rolled_through` written **coalesce-forward on every ledger row**.
- **MVCC watermark lag ≥ 5 minutes** (D3), honestly framed (finding 9): shrinks, does not close,
  the in-flight-transaction hole; state the assumption (no multi-minute write transactions) and
  consider `idle_in_transaction_session_timeout`. Verify row asserts the margin.
- **Per-teacher timezone** (D6): `users.timezone` (IANA text), default **America/Chicago**, the
  author's row set to **Pacific/Auckland**; `analytics_day(ts, zone)`. **Finding 3 is a hard
  constraint:** the zone is user-editable text in the nightly job's path — validate against
  `pg_timezone_names` at write AND exception-guard to the default in the job, with an
  invalid-zone verify row; otherwise one bad row silently kills the whole nightly run (the 0022
  failure class).
- **Split-day re-rolls** (finding 6): every owner-zone day spans ≥2 runs (03:30 UTC is
  mid-afternoon NZ); delete-then-insert per (version, day) MUST recompute the full day from raw
  rows, so `PRUNE_HORIZON` ≫ day-completion lag (floor 7 days, §2.3) — plus a verify row
  exercising a day split across two runs, and a re-derivation of the cron hour (finding 11).
- **Purge v4** (F3 + finding 4): never watermark-blocked; unrolled-destroyed count reported **on
  a ledger row**, not the NOTICE.
- **`rebuild_check_rollup(p_from date)`** (R7): rebuild ≡ incremental, including after a
  re-census; every shape decision stays reversible until arming.
- **R12 — per-key `students` becomes latest-grounded at arming** (D8): no code change (the live
  query over surviving rows already computes it); the deliverable is the panel-copy disclosure
  and doc wording. Daily `students` columns are per-day trend figures; **no RPC may offer their
  sum** (R10 — uniques don't compose; `hll` is unavailable on Supabase, checked).
- **R9 — compliance:** the retention row for aggregates states they survive the checks they
  summarize, are not recomputed on student purge, and die with the activity (cascade). Q10
  (n=1 re-identifiability) must be answered first — T5 files it now.
- **P5 debt owed by the arming arc:** 0026:106 ("nothing prunes section_checks today") and
  0022's header become FALSE at arming. Applied migrations are immutable here, so the arming
  migration's header must name and supersede both claims explicitly.

## 6. NOT in scope (this slice)

- **Arming** — author action, gated by §4.
- **Everything in §5** — the arming arc's build, carried as rulings.
- **Per-student analytics** — 0026's deferral; declined again here.
- **Any teacher-facing surface change** — no new pixel; `/plan-design-review` not warranted.
- **Retiring `submissions`** — its own TODOS entry.

## 7. Failure modes

| Codepath | Failure | Handling / visibility |
|---|---|---|
| Prune (disarmed) | Someone arms it before the rollup exists | **Mechanically inert** — NULL watermark refuses all (D11); verify §G proves it armed |
| Prune | Deletes a graded check | Clause 2 + verify §C/§D |
| Prune | Drifts from the queue's "latest" | View-by-construction + verify §H pin |
| Prune | Deletes rows the rate ceiling / idempotency replay still needs | Horizon (days) vs windows (seconds) — stated in the header, F1 |
| View | Future edit changes latest semantics for the prune only | Single definition — the prune cannot drift alone; queue equivalence re-pinned by §H each run |
| Watermark column | A future writer other than the rollup stamps it | Header claim + §A asserts all-NULL today; the arming arc's verify owns it after |

## 8. Implementation tasks

**T1** verify-0035.sql — the §3 matrix, all 11 rows, written first ·
**T2** migration 0035 — view + `rolled_through` column + disarmed `prune_section_checks` + header
(arming checklist, R5 prohibition, horizon bond) ·
**T3** P5 citation flips (4 sites) ·
**T4** retention-policy.md — prune-mechanism row (disarmed, inert-by-gate) + the two pre-existing
drift fixes (line 73 cites dropped `grades`; stale version header) ·
**T5** counsel packet **Q10** (D12) ·
**T6** TODOS entry rewritten into the arming-arc entry carrying §5 verbatim; STATE + DECISIONS
updated.

Database-side only; no Edge Function, bundle, or app work. Migration 0035 apply is an author
action. Nothing here needs a deploy ordering rule — no function or UI calls the new objects.

# PART II — the arming-arc BUILD PLAN (2026-08-16, same day; author pulled the trigger forward)

**Status:** ✅ **SHIPPED as migration 0036** — applied live 2026-08-17, `verify:auth --target live`
147/0, `verify-0036` 20/20, CI-green (31999243137). Eng review CLEAR-AMENDED (D2-II–D7-II +
OV-1..9, all folded into §II.1–II.5 below). Arming remains outside this arc.
**The trigger override, on the record:** the arc's recorded trigger was "real check growth on
the ledger" (still 0). The author chose to build now — with every §5 ruling fresh and
`rebuild_check_rollup` keeping the shape reversible, the momentum argument beats the wait. **The
CRON FLIP IS STILL NOT IN THIS ARC**: arming stays gated on the §4 checklist (counsel Q10, N
green nights). What ships is the rollup *running* while the prune stays inert.

## II.1 — P10 re-derivation for the build (tool-read live, 2026-08-16 late)

1. **`users` is table-level client-writable** (0032 breadth): the self-only UPDATE policy's
   WITH CHECK pins only `role` + `account_tier`. A new `timezone` column is client-writable
   arbitrary text on day one ⇒ **the §5 IANA validation trigger ships in the same migration,
   not later** — one bad zone would otherwise abort the entire nightly run (0022 class).
2. **The panel's job object reads the newest ledger row blind** (0026 §6 `order by ran_at desc
   limit 1`) ⇒ purge-side ledger rows (finding 4's fix) need a discriminator or the 03:00 purge
   row masks the 03:30 analytics row's health daily. ⇒ `job_name` column (II.2.3).
3. **Cron hour (finding 11), re-derived — CORRECTED by OV-8 (the draft claimed 09:30 UTC was
   "quiet for both"; it is not):** across a 17–18h offset there IS no mutually-quiet hour —
   09:30 UTC = US Central 03:30 (quiet) but NZ 21:30 (homework evening); the current
   03:00/03:30 UTC is US Central 21:00 (homework evening) and NZ 15:00/15:30 (school
   afternoon). Any hour deprioritizes one cohort; the honest statement is WHICH. Correctness
   never depends on the hour (full-day re-rolls are idempotent) — the only cost is boundary
   churn. OPTIONAL author call, stated plainly: keep 03:00/03:30 (status quo), or move to
   ~09:30/10:00 UTC to favor the US cohort at the cost of NZ-evening rolls. `cron.alter_job`,
   author-run SQL; not a migration step; no recommendation pretends both win.
4. **`prune_section_checks` is NOT touched.** Its watermark read (`where rolled_through is not
   null order by id desc`) already tolerates ledger rows that don't carry the watermark, and its
   behavior is pinned by verify-0035. The boundary helper (II.2.5) serves the two NEW readers;
   re-plumbing the just-verified prune for DRY would be churn without a defect.

## II.2 — What migration 0036 ships (every design point inherits a §5 ruling)

1. **`users.timezone text`** — nullable; **validation trigger** on INSERT/UPDATE: value must be
   NULL or exist in `pg_timezone_names` (refusal text names the column — RPC-style clarity);
   the author's row set to `Pacific/Auckland` by an email-keyed, existence-guarded UPDATE
   (replay-safe: no-op on a fresh DB). Default applied at READ time via
   `coalesce(u.timezone, analytics_default_zone())` — **the default lives in ONE immutable
   function** (D3-II: three call sites — roll, guard, verify — would otherwise carry drifting
   literals, and a drifted default forks day keys). No stored backfill.
   **Zone-change self-heal (D2-II — this review's P1):** a rolled row's day key is frozen at
   roll time, so a later zone change lets a boundary-hour check be counted under BOTH the old
   and the new day (concrete case in the review: Sep 5 13:00 UTC rolls as Chicago Sep 5; after
   a switch to Auckland, a new check at Sep 5 23:00 UTC triggers a full-day recompute of
   Auckland Sep 6 — which re-includes the already-rolled row). "Rebuild after a zone change"
   as prose is the promise-in-prose failure D11 just closed. Mechanism instead: the validation
   trigger also stamps `users.rollup_rebuild_needed = true` on any zone CHANGE;
   `run_analytics_maintenance()` rebuilds flagged owners' activities' rolled days under the
   current zone and clears the flag. Three integrity guards from the OV pass:
   **(a) horizon-clamped (OV-1/D5-II, severe):** the self-heal (and the no-arg rebuild)
   recomputes ONLY days ending after `now() - PRUNE_HORIZON` — days the prune's clause 4
   guarantees raw-complete. Older rolled rows **FREEZE under the zone they were recorded in**
   (immutable history, like dates in an old ledger). This is what makes the mechanism
   compatible with the armed prune: an unclamped rebuild would recompute `*_all` history from
   a world where superseded rows are deleted, silently collapsing the aggregates the rollup
   exists to preserve. The clamp loses nothing — the double-count window a zone change creates
   lies near the watermark, inside the horizon, so the clamped heal closes it completely. It
   also caps the self-heal's nightly cost at ~horizon days per owner (OV-9d).
   **(b) compare-and-clear (OV-3):** the flag clears only `where timezone = <the zone just
   rebuilt under>` — a zone change committing mid-rebuild keeps its flag and heals next night,
   never silently swallowed.
   **(c) trigger-guarded (OV-4):** the trigger REFUSES any client write to
   `rollup_rebuild_needed` (users carries table-level client UPDATE and the policy's WITH
   CHECK pins only role/account_tier — without the guard a teacher's client could clear its
   own flag and freeze a double-count in place). Only the trigger sets it; only the DEFINER
   job clears it.
2. **The two rollup tables** (D4, verbatim from §5): `check_rollup_daily (activity_id FK CASC,
   activity_version_id FK CASC, day, checks, students, rolled_at, PK(version, day))` and
   `check_item_rollup_daily (same FKs, day, item_id, verdicts_all, correct_all, incorrect_all,
   recorded_all, students, rolled_at, PK(version, day, item_id))`. Zero policies, zero client
   grants, RLS forced. `census_key` resolved at read via `activity_version_items`.
3. **`analytics_job_runs.job_name text not null default 'analytics'`** — the discriminator
   (II.1.2). The panel's job object and the growth ledger filter `job_name='analytics'`; purge
   rows use `'purge'` and leave `rolled_through` NULL (the §5 "every row carries it
   coalesce-forward" rule is scoped to the ANALYTICS job's rows — the prune's not-null read is
   what makes that scoping safe, verified in 0035).
4. **`run_analytics_maintenance()` v2** — sweep (unchanged) → **self-heal** (horizon-clamped
   rebuild of flagged owners — D2-II/D5-II) → **roll** → stamp. The roll:
   `new_wm = now() - interval '5 minutes'` (D3 lag); collect the (version, owner-zone-day) set
   touched by checks in `[coalesce(old_wm, '-infinity'), new_wm)` (OV-9a — the first run's
   window is the backfill); for each, **recompute the FULL day from raw rows**
   (`created_at < new_wm` bound) and delete-then-insert both tables' rows for that (version,
   day) — the finding-6 split-day semantics, idempotent by construction. Owner zone resolved
   activity→owner→`coalesce(timezone, analytics_default_zone())` with an exception guard
   falling back to the default (defense in depth behind the trigger; one bad zone degrades one
   activity's day labels, never the run — L row proves it). Ledger row: counts +
   `rolled_through = new_wm` (coalesce-forward against the previous ANALYTICS row) + **the
   OV-6 reconciliation pair**: `raw checks with created_at < new_wm` vs `sum of rolled daily
   checks` — the MVCC late-commit hole (a row committing after its window was scanned, in a
   day never re-rolled) becomes a visible drift on a screen someone opens, WHILE rebuild can
   still heal it. Drift ⇒ run the rebuild; post-arming, an unhealed drift is the known cost,
   now measured instead of invisible.
5. **`analytics_rolled_boundary() returns timestamptz`** — the single-sourced `>=`/`<` boundary
   read for the two NEW readers (roll + analytics v2). Prune untouched (II.1.4).
6. **`rebuild_check_rollup(p_from date default null)`** — recompute through the same
   day-recompute core the roll uses (one implementation, two entry points — the R7 rebuild ≡
   incremental property is structural, not aspirational). **Horizon-clamped by default
   (D5-II):** no-arg calls recompute only days ending after `now() - PRUNE_HORIZON`; an
   explicit `p_from` older than the safe boundary is honored but the result jsonb carries a
   WARNING naming the collapse risk (post-arming, pruned days recompute from surviving rows
   only — `*_all` would collapse toward latest). R7's "rebuild ≡ incremental" is hereby
   BOUNDED to the raw-complete window; frozen days are compared, not recomputed, in verify §J.
   First nightly run after 0036 IS the backfill (rolls everything < watermark; trivially empty
   at 0 checks).
7. **`purge_soft_deleted` v4** — 0034 §G byte-preserved (NOTICE prefix included — verify-0029
   §D greps it) plus: count destroyed checks with `created_at >=` the watermark (or all, when
   NULL) and write a `job_name='purge'` ledger row carrying `purge_unrolled_destroyed` (new
   nullable int). Never blocked — F3 unchanged.
8. **`get_activity_analytics` v2** — `*_all` = rolled tables + raw rows `created_at >=`
   boundary (single-sourced via II.2.5). **Totals re-specced (OV-2/D6-II — the draft's
   "totals from the view" was a defect):** `totals.checks` = sum of `check_rollup_daily.checks`
   + count of raw checks above the boundary — it KEEPS meaning "checks performed" across the
   prune boundary forever, keeps verify-0026 §C6's fixture pin green, **and is
   `check_rollup_daily`'s production reader (P1 satisfied)**; `totals.students` and
   `last_check_at` from the `section_checks_latest` view (exact under F1, D7's second
   consumer); **per-key `students` becomes latest-grounded** (D8, applied now — one semantic
   change, at 0 rows, instead of a second one at arming); keys join `activity_version_items`
   at read with the `_unattributed` bucket preserved (R2); `job` object filters
   `job_name='analytics'`. **The per-day `students`/`students_all` columns' reader is the
   future daily-trend surface — tracked as a named TODOS line (P1's tracked-debt form); they
   stay because per-day distinct students is the ONE figure that cannot be recomputed
   retroactively after pruning (D6-II).**

**App-side (one string):** the panel's readings-explainer paragraph
(`ActivityAnalytics.tsx:212–217`) gains the R12 disclosure — "Students counts each student
whose latest attempt touches the question." No layout, no new elements. **No design review**
(prior ruling stands: no new pixel).

**P5 flips in the same commit:** verify-0035 §A's `rolled_through_never_written` row is
REPLACED (as designed — its own message says so) by a writer-exists assertion
(`run_analytics_maintenance` prosrc contains `rolled_through`); the live never-written state
moves to verify-0036's rollback-liveness row (E), which needs no durable state. 0036's header
names and supersedes 0026:106 ("nothing prunes… today") and 0022's header — the §5-recorded
debt, discharged where the rulings said it would be.

## II.3 — verify-0036 matrix (authored FIRST, the standing method)

| § | Row | Why |
|---|---|---|
| A | Catalog: both tables' shape + CASCADE FKs (activity AND version), zero policies + zero client grants + RLS forced, `job_name`/`purge_unrolled_destroyed`/`timezone` columns present, all new fns service-role-only (0009), boundary helper exists | II.2 |
| B | No-student-identifier columns on either rollup table (`information_schema` — 0026 §B extended, the erosion fails loudly) | R1 |
| C | Timezone trigger: invalid zone REFUSED with the named-column message; valid zone accepted; NULL accepted | II.2.1 |
| D | Day keys at real offsets: 01:00 UTC / Chicago owner → PREVIOUS day; 10:00 UTC / Auckland owner → SAME NZ day; unset timezone → Chicago default | D6 |
| E | Roll liveness (P3, rollback): seeded checks roll into BOTH tables; `rolled_through` stamped ≤ `now() - 5 min` (the lag, asserted); ledger row `job_name='analytics'` carries it | D3/D5 |
| F | Idempotence: a second run in the same state changes nothing (delete-then-insert per day) | II.2.4 |
| G | Split-day: checks in ONE owner-zone day rolled across TWO watermark advances → final rows equal a single full-day recompute | finding 6 |
| H | Analytics v2 `*_all` = rolled + raw with no double-count across the boundary (fixture sum equality) | R3 |
| I | `*_latest` byte-identical before/after a roll; per-key `students` equals the latest-grounded count (D8 semantics pinned) | F1/R12 |
| J | `rebuild_check_rollup` ≡ incremental (byte-compare both tables) — **including after a `write_version_census` re-census** (item-grain re-attribution) | R7/D4 |
| K | Purge v4: runs to completion with unrolled rows present (never blocked), writes the `job_name='purge'` ledger row with the count, NOTICE prefix intact | F3/finding 4 |
| L | Job guard: an invalid zone FORCED into `users.timezone` (superuser bypass of the trigger) does NOT abort the run — that activity falls back to the default and the ledger row still lands | 0022 class |
| M | The panel's job object ignores purge rows (newest-row read filtered to `job_name='analytics'`) | II.1.2 |
| **N** | **Zone-change self-heal end to end (D2-II, the review's P1 fix — P3 liveness): roll under zone A, change the zone (trigger stamps the flag), run the job → in-horizon history re-days under zone B, the flag clears, and a boundary-hour check is counted EXACTLY once across both tables** | D2-II |
| **O2** | Flag integrity: a CLIENT write to `rollup_rebuild_needed` is REFUSED (OV-4); the compare-and-clear leaves the flag standing when the zone changed mid-rebuild (OV-3) | D7-II |
| **P2** | Horizon clamp: a no-arg rebuild does NOT touch a rolled day older than the horizon (frozen row byte-identical after); an explicit deep `p_from` returns the WARNING in its result jsonb (OV-1) | D5-II |
| **Q2** | §D gains a Chicago DST-transition day (spring-forward, 23-hour day): day keys contiguous, no gap or double-count across the transition (OV-9b) | OV-9b |
| **R2** | Reconciliation pair on the ledger row: seeded drift (a raw row inserted below the watermark, bypassing the roll) is REPORTED as a discrepancy, not silently absorbed (OV-6) | OV-6 |
| — | verify-0035 §A flip is a LIVE-STATE assertion, not a prosrc grep (D4-II): `no analytics_job_runs row carries rolled_through with job_name <> 'analytics'` — catches foreign writers (a writer mimicking `job_name='analytics'` passes it; the grants surface in §A/C is what refuses that class) | P11 |
| — | One RTL assertion pins the panel's R12 disclosure sentence (the app's only change) | D4-II |
| — | verify-0035 re-run green under the flipped row; verify-0026 §C3 still green against analytics v2 (regression pins — the runner runs both anyway; the pin is they stay green) | P5/P9 |

## II.4 — failure modes (delta over Part I's table)

| Codepath | Failure | Handling / visibility |
|---|---|---|
| Roll step | Invalid zone reaches the job | Trigger blocks the write path; job guard degrades one activity to the default zone; §C + §L |
| Roll step | Day double-rolled across split runs | Full-day recompute + delete-then-insert; §F/§G |
| Roll step | Boundary drift between roll and read | One helper (II.2.5); §H |
| Purge row | Masks analytics job health on the panel | `job_name` filter; §M |
| Watermark | Purge rows interleave with analytics rows | Purge rows leave it NULL; the prune's not-null read (0035, already verified) skips them |
| First run | Rolls everything ever (backfill) | Designed — it IS the backfill; trivially empty today |
| Zone change | Boundary-hour checks double-count across old/new day keys | D2-II flag + nightly self-heal rebuild; §N proves the heal; window ≤ one nightly run |
| Rebuild | Single transaction grows with history | Batch-before-arming comment (same discipline as the prune's array note); years of headroom at plausible scale |

## II.5 — implementation tasks (Part II)

**U1** verify-0036.sql (matrix first, runner-registered same commit) · **U2** migration
`0036_check_rollup.sql` (II.2.1–.8 + the P5 supersession header) · **U3** verify-0035 §A flip
(same commit as U2) · **U4** ActivityAnalytics disclosure sentence + its RTL pin · **U5**
docs: TODOS arming-arc entry advances (built → awaiting-arming) **and gains two named lines
(OV-5/OV-7): the daily-trend surface as the `students_all` columns' future reader, and the
teacher timezone control (bundled with the display-name control — same users-self-edit
family; until it ships, non-author teachers get the default zone's day keys)**; STATE;
DECISIONS delta; retention-policy UNCHANGED (the prune is still disarmed — policy changes at
arming, not before) · **U6** pending-author block: apply 0036 → verify live → push; plus the
OPTIONAL cron-hour call (II.1.3, honest version — either hour deprioritizes one cohort;
`cron.alter_job`, author-run).

Arming itself stays out: after ≥ N green nights of ledger rows + Q10's answer, the author flips
the cron per §4. Nothing in this arc deletes a row.

## II.6 — AMENDMENT: the rollup must carry a misconception dimension (2026-08-25)

**Raised by the misconception-sensors eng review (X1), which found this spec's
premise incompatible with that arc's storage claim.** Recorded here because
this document is the ruled input the arming arc inherits, and the gap is in
the ruling, not in the build.

**The collision.** The misconception arc records `misconceptionIds` on wrong
answers inside `section_checks.verdicts`. A misconception id therefore appears
almost exclusively on **non-latest** attempts: it is emitted when a student is
wrong, and the latest attempt for a (student, version, section) is usually the
corrected one. `prune_section_checks` (0035 §C clause 1) deletes every row NOT
in `section_checks_latest`. So the prune deletes the misconception dataset
almost in its entirety, and keeps the rows least likely to carry any of it.

**Why the existing rollup does not save it.** Both tables in §5/II.2 are
misconception-blind. `check_item_rollup_daily` is
`(version, day, item_id) → verdicts_all, correct_all, incorrect_all,
recorded_all, students`. Verdict counts survive the prune; WHICH misconception
a wrong answer demonstrated does not. The arc's "durable with zero new storage
machinery" reasoning was true about the WRITE and false about the LIFETIME.

**What the amendment must decide** (deliberately not decided here — this is the
input to that design pass, and this doc's own discipline is that rulings are
made once, with their reasoning, in the pass that owns them):

1. **Shape.** A third table keyed `(activity_version_id, day, item_id,
   misconception_id)` versus an added grain on the item table. The third-table
   shape keeps `check_item_rollup_daily`'s PK and its "one row per item per
   day" reading intact, which every II.2 ruling assumes; the added-grain shape
   avoids a third table but changes that PK, which would ripple through the
   self-heal and reconciliation pair.
2. **Unnesting.** `misconceptionIds` is an ARRAY (a multi-select student can
   demonstrate two at once). One rolled row per id — a wrong answer with two
   ids counts once for each — so per-misconception counts sum correctly while
   the per-item incorrect count does not double.
3. **Renames.** Stored rows keep the old id string forever. Whether the rollup
   resolves through an alias map at READ time (the `census_key` precedent from
   II.2, which exists exactly so rolled history can be re-attributed) or
   freezes the string as rolled. The `census_key` pattern is the obvious
   candidate and the reason to decide this BEFORE the table exists.
4. **Students-per-misconception.** Whether a distinct-student count is rolled
   per misconception. ⚠ Same trap as the existing `students` columns: uniques
   do not compose, so no RPC may ever offer their SUM, and the figure cannot be
   recomputed once pruning runs — which makes it the one column that must be
   decided before arming rather than added later.

**Until this ships, `prune_section_checks` must not be armed** — recorded as a
blocking step on the arming checklist (TODOS → "The check-rollup ARMING arc").

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review (Part I) | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (SCOPE_REDUCED) | 8 issues (D2–D9), 11 outside-voice findings; frame pivoted at D10; 0 critical gaps open |
| Eng Review (Part II) | `/plan-eng-review` | The arming-arc build plan (§II.1–II.5) | 1 | CLEAR (AMENDED) | Part I live re-check clean (no record-vs-reality drift); 3 section issues (D2-II self-heal P1, D3-II default-zone home, D4-II three test pins); 9 outside-voice findings — OV-1 SEVERE (post-arming rebuild would collapse `*_all` history → D5-II horizon-clamp + freeze), OV-2 (totals re-spec, also feeds P1's orphan table → D6-II), OV-3/4 flag integrity, OV-5 tracked-debt columns, OV-6 reconciliation instrument, OV-7 timezone-surface TODOS line, OV-8 cron-claim corrected, OV-9a–d build details. All folded into II.1–II.5. |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | Not warranted (re-affirmed Part II) | One disclosure sentence; no new pixel |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** Part I's outside voice overturned the review's own D2 ruling (frame pivot →
  D10/D11, schema-encoded arming gate — shipped as 0035). Part II's outside voice (fresh
  subagent) then caught the review's OWN new ruling contradicting the armed prune (OV-1: the
  D2-II self-heal rebuild vs pruned raw rows) — resolved by D5-II's horizon-clamp + frozen
  history, which also bounds the self-heal's nightly cost. Two reviews, two overturns of
  same-day rulings: the outside voice keeps paying for itself.
- **VERDICT:** ENG CLEARED (Part II amended in place) — ready to implement U1–U6. Arming itself
  remains outside this arc (§4 checklist: counsel Q10 + N green nights, author-run).

NO UNRESOLVED DECISIONS
