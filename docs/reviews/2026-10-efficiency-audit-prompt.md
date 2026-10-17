# Cloud efficiency audit — prompt (draft for the author)

Paste-ready prompt for one cloud session (Opus). Repo-only, report-only.
Delete this file once the run lands.

---

You are running a **report-only efficiency audit** of this repository: find the
things that make the site slower, heavier or more expensive to run than it needs
to be, as experienced by students and teachers. **You fix nothing.** Your only
output is one report file and one PR.

## Read first, in this order

1. `CLAUDE.md`, then `STATE.md` — rules and current status. You are a CLOUD
   session: push only to your own branch `cloud/efficiency-audit-2026-10`, open
   one PR against `main`, never push `main`. No PR comments, no review
   requests, no notifications.
2. `docs/reviews/2026-10-18-live-perf-baseline.md` — **measured** numbers from
   the live database. Start from these. Its §1 (`pg_timezone_names`, ~820 ms
   per call on the daily-practice path) is the one confirmed hot spot; trace
   it fully and propose the fix.
3. `docs/DECISIONS.md` and `TODOS.md` — before proposing anything, check
   whether it was decided on purpose or is already filed. Things that look
   inefficient ON PURPOSE include: the separate grading bundle (keeps the
   math engine off the read path), the Supabase sub-client stubs, the
   `get-activity` read cache, server-authoritative grading. A finding that
   reverses a recorded decision goes in a separate "Challenges a decision"
   section with the decision quoted, never in the main list. A finding
   already in TODOS is cited, not re-filed.

## Judge everything against these scenarios

Rank by what a person would notice in one of these:

- **S1** A student opens an activity at `/a/:id` on a slow school Chromebook
  (assume 4× CPU throttle, a slow 4G connection).
- **S2** A student checks a section, and opens daily practice.
- **S3** A teacher opens class progress / first tries for **30 students** on a
  **60-block** activity.
- **S4** A teacher types steadily in the editor in a long activity
  (autosave, re-render, popover paths).
- **S5** A school with **10 teachers × 5 classes × 30 students** over a term —
  for database growth, nightly jobs and running cost.

For each finding, say how its cost **grows** (per student, per block, per
attempt, per class) — the live data has one student, so a problem that is
invisible today but linear-in-students × blocks is exactly what we need you
to see.

## Scope

- **Database:** RPCs and RLS in `supabase/migrations/` — per-row function
  calls, missing indexes for the actual filter columns (cross-check the
  advisor's unindexed-FK list in the baseline doc), queries that scan a
  growing table, functions called repeatedly in one request, policy pairs that
  each run per row.
- **Client data flow:** `packages/app`, `packages/viewer` — requests in loops
  (N+1), sequential awaits that could run together, the same data fetched
  twice per screen, polling, over-fetching columns (`draft_content`,
  `content` are big).
- **Rendering:** whole-tree re-renders on keystroke or store update, missing
  memoization on hot lists (class progress grids), expensive work in render.
- **Edge Functions:** `supabase/functions/` + the two committed bundles —
  per-request work that could be per-instance, cold-start weight, anything
  that scales with activity size.
- **Load:** what the student shell loads eagerly that S1 does not need. The
  shell budget is already met; expect small wins and say so.
- **Running cost:** Supabase egress (large JSON columns returned more often
  than needed), Edge Function invocation counts, storage growth of
  student-data tables under S5.
- **Perceived speed:** missing optimistic updates or loading states, save
  indicator lag, what the service worker does or doesn't cache for a student
  reopening an activity offline.

Out of scope: security, correctness bugs (note any you trip over in one line
in an appendix), the curriculum-side catalogue files, visual design.

## Measure where you can

You have no database and no `.env.local`, but you can: `pnpm install`,
`pnpm build`, `node scripts/check-perf-budget.mjs`, the unit suites, and the
Playwright **stub** lanes (they use a dead Supabase origin and need no stack —
read `packages/app/e2e/helpers/e2eOrigins.ts` first). Use them to back a
finding with a number (render counts, bundle bytes, a timed interaction) when
you can. A measured finding outranks an argued one. Do not commit any harness
you write; describe it in the finding so it can be rebuilt here.

## Then try to disprove every finding

After the first pass, run a **separate adversarial pass** (a fresh subagent per
finding, or per group of related ones) whose only job is to refute it: is the
code really on a scenario's path? does the claimed cost actually occur (read
the call site, not just the definition)? is it already handled elsewhere
(cache, memo, index in a later migration)? is it deliberate per DECISIONS?
Drop what does not survive. Keep the refutation note for anything that
survived narrowly.

## Report format

Write `docs/reviews/2026-10-efficiency-audit.md`. At most **15** findings in
the main list, ranked by user-noticeable impact. Each finding:

- **Where:** `file:line` (and the migration number for SQL)
- **What + why it's slow:** the mechanism, in two or three sentences
- **Who notices:** student / teacher / nobody-yet (cost only), and in which
  scenario
- **Growth:** constant / per student / per block / per attempt / …
- **Evidence:** measured (with the number and how), or argued
- **Confidence:** high / medium / low, and what would change it
- **How to prove it here:** a command, query or measurement the author's
  local session can run against the live stack
- **Size:** quick fix (one commit) or its own arc
- **Survived refutation because:** one line

Then: a **"Challenges a decision"** section (if any), a **"Looked at, already
fine"** section (one line each, so the next audit skips them), and a
correctness-bugs-noticed appendix.

## Hard rules

- **Change no source, schema, test or config file.** Do not regenerate either
  Edge Function bundle or any generated doc. The only file you add is the
  report. (A previous cloud audit regenerated both bundles over comment-only
  edits and left the deploy proof mismatched for weeks.)
- Do not touch STATE.md, TODOS.md, DECISIONS.md or CLAUDE.md.
- `pnpm verify` must still be green on your branch (it will be, if you only
  added a doc — run it anyway and say so in the PR).
- PR description: the top five findings in one line each, then "Pending
  author actions: none" unless a finding needs a live read.
