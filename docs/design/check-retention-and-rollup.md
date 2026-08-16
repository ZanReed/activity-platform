# Check pruning (disarmed) + the rollup deferred to arming

**Status:** ENG-REVIEWED 2026-08-16 (D2–D12 ruled interactively; report at end). Build next.
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

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 (this doc) | CLEAR (SCOPE_REDUCED) | 8 issues (D2–D9), 11 outside-voice findings; frame pivoted at D10; 0 critical gaps open |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | Not warranted | No pixel changes in this slice |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** The outside voice (Claude subagent, fresh context) overturned the review's own
  D2 ruling — "build the rollup now" fell to "the invariant is rollup-before-ARMING"; the user
  accepted the simpler frame (D10) and the D11 watermark-column synthesis made its ordering
  invariant schema-encoded. Findings 3, 4, 6, 8, 9, 11 folded as recorded constraints for the
  arming arc; finding 10 (R12 timing) resolved by the pivot itself (no code change needed).
- **VERDICT:** ENG CLEARED (scope-reduced to prune-only-disarmed) — ready to implement T1–T6.

NO UNRESOLVED DECISIONS
