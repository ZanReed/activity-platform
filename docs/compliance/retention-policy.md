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
> `draft-3` (2026-08-04) carries two rulings that together make the deletion
> promises here mechanically achievable for the first time: the account window
> is **subordinate to the work window** (0023), and **a purged account's audit
> events survive without naming a person** (0024). Before them, no account
> could be deleted at all. **One gap remains** — nothing starts the account
> clock (`users.deleted_at` is never set), so the purge is inert in practice.
> It is named in Mechanics and must close before a real student account
> exists. Counsel should read Mechanics, not just the table.

## Windows

| Data | Window | Clock starts | Mechanism |
|---|---|---|---|
| Student responses, scores, grades | **400 days** | when the class is deleted (soft-delete) | scheduled purge job (extends `purge_soft_deleted`) |
| Section checks (`section_checks` — responses + the verdicts/feedback shown) | **400 days**, same as the above: it is the same student work | when the class is deleted (soft-delete) | same purge job. **Also cascades** on student-account deletion (see Mechanics) |
| Student account (`users` + `auth.users`) | **30 days, but never before the account's work is gone** — see the ruling below | last active class membership ends (removed or class deleted) | purge job deletes the `auth.users` row; `public.users`, `class_members`, and `section_checks` fall via CASCADE behind it |
| `ip_hash` + `user_agent` on submissions | **30 days** | submission time | scheduled scrub (UPDATE to NULL, keeps the row) |
| `audit_log` | **2 years** | row creation | scheduled purge |
| Teacher account + activities | account lifetime | — | soft-delete flow (0008), purge after 30 days (existing) |
| Class row incl. 13+ assertion record | 400 days after deletion (aligned with responses — the assertion should outlive the work it covered) | class deletion | purge job |
| Legacy localStorage (published pages) | never leaves the student device | — | student clears browser storage; page's own reset |
| Viewer local buffer (T7) | until sign-out or sync | — | `signOutEverything()` purges the namespace |

Rationale for 400 days: a school year plus a grading/records buffer — long
enough for "can I see my grade from last semester," short enough to not be an
archive. Deliberately NOT configurable per teacher in v1 (one policy, one
truthful privacy page).

## Mechanics (build state)

- The purge job extensions land with **S4/S7 server work** — this policy doc
  leads the code (windows are contractual before they're mechanical). Until
  the job ships, enforcement is manual via the SQL in the purge-job spec, run
  by the author on a monthly calendar reminder. The S1 gap is acceptable
  because no student data exists yet; **the job must ship before the first
  real class does** — it is listed as a hard item on the S9 cutover checklist.
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
- **⚠ THE LAST REMAINING GAP: nothing sets `users.deleted_at`.** There is no
  soft-delete-student flow; the column is only read by the purge job. So the
  account clock never starts on its own, and the purge — now mechanically
  capable of completing, after 0022/0023/0024 — stays inert in practice. This
  is the final item between the windows in the table above and reality, and it
  must close before the first real student account exists. It lands with the
  S4/S7 purge-job work.
- A district's written deletion request (via the authorization agreement)
  short-circuits every window: fulfilled within 30 days of the request.

## What deletion means

Hard SQL DELETE (not soft-delete) once a window closes. Supabase point-in-time
backups age out on the platform's own schedule (⟨confirm current backup
retention on the plan in use⟩); we treat data as fully gone when the last
backup containing it expires.
