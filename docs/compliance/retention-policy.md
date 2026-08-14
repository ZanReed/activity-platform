# Retention Policy

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Version `2026-08-04-draft-3`. Windows below are the author-ruled S1 defaults
> (D6, 2026-07-28); districts may require different numbers — the
> [authorization template](school-authorization-template.md) has a field to
> override them per school.
>
> `draft-2` adds `section_checks` (0020), which draft-1 predated, and corrects
> the deletion mechanics: the "wrong order fails loudly" property is real but
> **partial** — it does not cover `section_checks`. See Mechanics.
>
> `draft-4` (2026-08-07) corrects this document against the SQL that enforces
> it (the automated md↔SQL pin, `scripts/tests/retention-windows.test.mjs`,
> found three places where the table promised mechanisms that do not exist —
> each row below now states its real mechanism or is flagged "mechanism not
> yet built"). It also records that the purge job is LIVE: pg_cron registered
> 2026-08-05, first fire observed and verified the same day.
>
> `draft-3` (2026-08-04) carries three rulings that together make the deletion
> promises here mechanically real for the first time — before them, **no
> account could be deleted at all**: the account window is **subordinate to the
> work window** (0023), **a purged account's audit events survive without
> naming a person** (0024), and **student dormancy is derived rather than
> marked**, on a 400-day window (0025). The account clock also changed
> substance, not just mechanism: 30 days was shorter than a summer break.
> Counsel should read Mechanics, not just the table — the rationale for each
> window lives there.

## Windows

| Data | Window | Clock starts | Mechanism |
|---|---|---|---|
| Student responses, scores, grades (`section_checks` — responses + the verdicts/feedback shown) | **400 days** in the normal case | the student's last active class membership ends (class deleted or student removed) | the ACCOUNT path: dormancy (row below) purges the account at 400 days and the job deletes their checks explicitly with it. There is no separate class-keyed deletion — checks are keyed to activities and accounts, not classes |
| ⚠ The same work, via ACTIVITY deletion — **a shorter path counsel should know about** | **30 days** | the teacher soft-deletes the activity | `purge_soft_deleted` removes a purge-eligible activity's checks with it (0022). A teacher tidying old worksheets deletes the student work on them at 30 days, regardless of the 400-day window above |
| Student account (`users` + `auth.users`) | **400 days of dormancy**, and never before the account's work is gone — see the rulings below | last active class membership ends (removed or class deleted); for a student who never joined one, account creation | purge job deletes the `auth.users` row; `public.users`, `class_members`, and `section_checks` fall via CASCADE behind it |
| Account explicitly deleted (admin action or an on-request deletion) | **30 days** | `users.deleted_at` is set | same purge path; this is the only thing that sets that column |
| `ip_hash` + `user_agent` on submissions | **CLOSED — the data no longer exists** | — | the anonymous wire and its data were deleted whole at the S9 cutover (migration 0029, 2026-08-14): every `submissions` row was wiped (17 rows, all the author's test artifacts — 6 carried an `ip_hash`), the ingest path was dropped, and nothing can write new rows. No scrub job is needed for a field with zero rows and no writer |
| `audit_log` | **2 years** | row creation | scheduled purge |
| Teacher account + activities | account lifetime | — | soft-delete flow (0008), purge after 30 days (existing) |
| Class row incl. 13+ assertion record | **at least** 400 days after deletion (the assertion should outlive the work it covered) | class deletion | **mechanism not yet built** — nothing purges class rows today, so they are retained indefinitely. Conservative for a compliance record (it names the teacher and the attestation, not students), but the window above is an intent, not a behavior |
| Legacy localStorage (published pages) | never leaves the student device | — | student clears browser storage; page's own reset |
| Viewer local buffer (T7) | until sign-out or sync | — | `signOutEverything()` purges the namespace |

Rationale for 400 days: a school year plus a grading/records buffer — long
enough for "can I see my grade from last semester," short enough to not be an
archive. Deliberately NOT configurable per teacher in v1 (one policy, one
truthful privacy page).

## Mechanics (build state)

- **The purge job is LIVE** (0022–0025; pg_cron registered 2026-08-05, first
  fire observed and verified the same day — it completed without abort and
  purged nothing, correctly, since nothing was past its window). Enforcement
  is no longer manual; the monthly-reminder era this bullet used to describe
  ended when the cron registered. What remains build-state: ONE
  "mechanism not yet built" row in the table above (the class-row purge),
  with its bound stated in place. (The `ip_hash` scrub row closed at S9
  Drop 3 by data removal — see the row.)
- Deletion order for a student purge: `grades` → `submissions` →
  `class_members` → `users` → `auth.users`.
- **The RESTRICT safety net is partial — know which half you are in** (verified
  against the live schema 2026-08-04). `submissions.student_id` is ON DELETE
  RESTRICT, so deleting a `users` row out of order fails loudly, as draft-1
  described. But `section_checks.student_id` and `class_members.student_id`
  are ON DELETE **CASCADE**: deleting the account silently takes the student's
  entire check history with it. For a purge that is the intended end state, so
  nothing here is unsafe — but it means **`section_checks` is not protected by
  the loud-failure property**, and a mistaken `users` delete destroys check
  history with no error to catch it. **Migration 0022 makes the job delete
  `section_checks` explicitly** rather than leaning on the cascade, so the row
  counts it reports are the ones it actually intended to remove.
- **The purge job could not have run at all once checks aged in — fixed in
  0022.** `section_checks.activity_version_id` is ON DELETE RESTRICT (correctly:
  a version must never vanish from under the checks whose block ids it minted).
  `purge_soft_deleted` deleted a purge-eligible activity's *versions* before the
  activity itself, so the first check old enough to matter would have raised
  `23503` — and because the job is one plpgsql function, that one exception
  rolled back the **entire nightly run**: assignments, activities, and account
  purges included, reporting only into the cron log. Reproduced against the live
  function and confirmed fixed, both inside rolled-back transactions
  (`scripts/verify-0022.sql` section C). A retention job that silently stops is
  the failure this policy exists to prevent, so the verification script keeps
  the reproduction rather than just inspecting the code.
- **RULED 2026-08-04 — the account clock is subordinate to the work clock**
  (migration 0023; full reasoning in [DECISIONS.md](../DECISIONS.md) → "The
  account clock waits for the work"). The 30-day account window and the
  400-day work window genuinely conflict, because the account is what makes
  the work attributable and `submissions.student_id` is RESTRICT. **The work
  wins:** an account is purged only once no retained work remains. This is
  what the student-facing policy already says — *"submitted classwork may be
  kept for the school's records window, then purged"* — and the alternative
  (cascading the work away at 30 days) would destroy the very school records
  the 400-day window exists to keep.
  **The honest cost, and it must stay disclosed:** a departed student's email
  and display name persist as long as their work does, up to ~400 days. That
  is the minimum needed for attributable records; it is not incidental
  retention.
- **The job deleted the wrong table until 0023.** It ran `delete from users`
  believing that cascaded to `auth.users`. The FK runs the other way
  (`public.users.id → auth.users(id)` CASCADE), so the Google identity —
  email, name, provider metadata, OAuth consents, sessions — survived
  **permanently**, while this policy promised `users` + `auth.users` in 30
  days. 0023 deletes the `auth.users` row, which is what actually removes an
  account.
- **RULED 2026-08-04 — an audit event outlives the account that made it**
  (migration 0024; reasoning in [DECISIONS.md](../DECISIONS.md) → "An audit
  event outlives the account that made it"). A purged account's `audit_log`
  rows **stay** for their own 2-year security window but stop naming a person:
  `actor_id` is ON DELETE SET NULL, and the purge job stamps
  `metadata.actor_purged = true` before deleting, so a purged actor stays
  distinguishable from an event that was never attributed. **This is what made
  account deletion possible at all** — until 0024, every account was
  permanently blocked by its own `user.create` row, so none could be purged.
  Cascading the audit rows away instead would have made this document's own
  2-year window untrue and turned deletion into an evidence-erasure path;
  making the account wait out the 2 years would have kept a name and email
  ~18 months past the work that justified keeping the account, purely for the
  operator's log.
  **What a security reviewer keeps after a purge:** the action, its timestamp,
  its target, the `ip_hash` (itself scrubbed at 30 days), and the fact that the
  actor was a since-purged account. What they lose is which account.
- **RULED 2026-08-04 — student dormancy is DERIVED, never marked** (migration
  0025; reasoning in [DECISIONS.md](../DECISIONS.md) → "Student dormancy is
  derived, not marked"). This closed the last gap: after 0022/0023/0024 the
  purge could complete, but nothing started the clock, so it stayed inert.
  Eligibility is now computed live from `class_members` and `classes` — no
  stored flag, no marking sweep, no backfill, nothing that can drift.
  **`users.deleted_at` is never written by the job**, because `join_class`
  refuses accounts that have it set: marking a dormant student would have
  locked them out of rejoining between terms. That column means *account
  disabled*, and stays reserved for explicit and administrative deletion.
  **Why 400 days and not the 30 first written here:** 30 days is shorter than
  a summer break, so a student whose spring class ended would have been purged
  before returning in the fall. Matching the work-records window makes the
  account and its work expire together.
  **To answer "who is dormant right now" there is no column to read** — run the
  derivation query in `scripts/verify-0025.sql` section D.
- A district's written deletion request (via the authorization agreement)
  short-circuits every window: fulfilled within 30 days of the request.

## What deletion means

Hard SQL DELETE (not soft-delete) once a window closes. Supabase point-in-time
backups age out on the platform's own schedule (⟨confirm current backup
retention on the plan in use⟩); we treat data as fully gone when the last
backup containing it expires.
