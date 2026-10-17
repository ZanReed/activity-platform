# Live performance baseline — 2026-10-18

Read from the live project (`dtqutpdplefmufrrakxs`, Postgres 17.6) on
2026-10-18, as input to the repo-only efficiency audit. Everything here is a
**measurement at today's data size** — one teacher, one rostered student, ~31
activities, ~52 published versions. Nothing here shows how cost grows with
class size; that half is the audit's job, from the code.

`pg_stat_statements` covers 2026-07-04 → 2026-10-18 (its last reset).

## 1. The one measured hot spot: `pg_timezone_names`

**`select … from pg_timezone_names where name = …` costs ~820 ms on this
instance** (`explain analyze`: Function Scan, 821 ms, one row out of 54 kept).
The same zone used directly — `now() at time zone 'Pacific/Auckland'` — costs
1.5 ms. `pg_timezone_names` is a set-returning function that walks the whole
tz database on every call; filtering it by name does not make it cheap.

Where it runs (live `pg_proc` source, migrations in brackets):

| Caller | Path | Measured |
|---|---|---|
| `fact_class_zone` [0050:211] | every daily-practice entry + overview, via `fact_sprint_log` [0050:246] and `v_today` [0050:817, 0051:41] | `fact_sprint_entry` mean **940 ms**, max 1552 (4 calls); `fact_sprint_overview` mean **620 ms**, max 1119 (9 calls) |
| `users_timezone_guard` trigger [0036:64] | every INSERT/UPDATE on `users` with a timezone set | `set_public_name` **821 ms** (1 call) — the whole cost is the trigger |
| `recompute_check_rollup_days` [0036:260] | nightly rollup, once per run | background, not user-facing |

For comparison, the next-slowest student-facing RPCs average 2–25 ms.
`fact_sprint_entry` is the student's daily-practice open, so a student waits
about a second for a check the zone name almost never fails.

**FIXED before the audit: migration 0063** (a table of valid zone names,
looked up first, with the scan only as a fallback for a name it does not hold —
same answers, verify-0063). The audit should confirm the three paths above are
off the scan once 0063 is live, and not re-file this.

## 2. Supabase performance advisor (2026-10-17 run)

- **No `auth_rls_initplan` findings** — RLS policies already wrap `auth.uid()`
  correctly. Not a target.
- **Multiple permissive SELECT policies** (WARN) on `class_members`, `classes`,
  `section_checks`, `submissions` — each SELECT evaluates two policies. Cheap
  at today's size; worth a look on `section_checks`, the table that grows with
  students × sections × attempts.
- **10 unindexed foreign keys** (INFO): `activities.copied_from_version_id`,
  `class_activities.activity_id`, `class_activities.added_by`,
  `class_hook_use.marked_by`, `class_probes.opened_by`,
  `class_probes(registry_rev, fact_grammar_rev)`,
  `fact_scope_fact(registry_rev, fact_grammar_rev, family_id)`,
  `practice_sessions.class_id`, `section_checks.activity_version_id`,
  `sprint_sessions(registry_rev, fact_grammar_rev)`. Most matter only for
  deletes on the parent; `class_activities.activity_id`,
  `practice_sessions.class_id` and `section_checks.activity_version_id` are
  also read paths — check them against the queries that filter on them.
- **9 unused indexes** (INFO), mostly on the dead anonymous-wire tables
  (`assignments`, `assignment_students`, `submissions`) plus
  `activities_listed_tags_gin` and `check_grades_released_idx`. "Unused" at one
  student is weak evidence; do not drop on this alone.

## 3. Where database time goes

Total execution time by role since July: `postgres` 162 s (migrations, verify
scripts, MCP reads), `authenticator` 93 s, `supabase_admin` 38 s,
`authenticated` 26 s, `service_role` 8.6 s, `anon` 0.4 s.

- **`authenticator` is almost all PostgREST schema-cache reloads** — 130
  reloads, each running `select name from pg_timezone_names` (mean 554 ms) plus
  the catalog introspection (~70 + 54 ms). These follow migrations and
  `NOTIFY pgrst`; not app code and not a target, but each reload briefly delays
  the requests behind it.
- **Autosave**: `UPDATE activities SET draft_content …` — 1023 calls, mean
  2.6 ms. The draft read is 1536 calls at 0.7 ms. Healthy.
- **Viewer reads**: `get_published_activity` 3.9 ms, `get_activity_public_meta`
  2.2 ms, `activity_versions` by id 2.3 ms. Healthy.
- **Checks**: `record_check` 1.3–10 ms, `get_activity_version_for_check` 4.4 ms.
  Healthy.
- **Teacher panels**: `list_class_activities` 15 ms, `fact_probe_overview`
  23 ms, `my_chain_hooks` 14 ms, `list_bank` 7–47 ms, `publish_activity` 25 ms.
  Fine today; these are the ones whose cost should be read for growth with
  class size.
- Buffer cache hit rate is 99.8–100% on every app query: the working set is
  tiny, so I/O tells you nothing yet.

## 4. Table sizes

The largest public table is `fact_scope_fact` (3.5k rows, 2.6 MB). Every
student-data table is under 300 rows: `section_checks` 14, `fact_attempts`
163, `submissions` 16. `section_checks` shows 12,211 sequential scans to 801
index scans — expected for a 14-row table, and exactly the pattern to check
against its indexes before it holds a real class.

## 5. Not obtained

- **Edge Function timings and cold starts.** The logs API on this project
  exposes no function-log source (`edge_logs`, `postgrest_logs`,
  `postgres_logs`, … only), and the gateway log shows REST paths, not
  `/functions/v1`. Read them from the dashboard (Edge Functions → each
  function → Logs/Metrics) if the audit needs a number; otherwise the audit
  reasons about startup cost from the two committed bundles.
- **Traffic shape at scale.** One student. Every growth claim has to come from
  reading the code.
