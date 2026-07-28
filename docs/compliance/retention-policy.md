# Retention Policy

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Version `2026-07-28-draft-1`. Windows below are the author-ruled S1 defaults
> (D6, 2026-07-28); districts may require different numbers — the
> [authorization template](school-authorization-template.md) has a field to
> override them per school.

## Windows

| Data | Window | Clock starts | Mechanism |
|---|---|---|---|
| Student responses, scores, grades | **400 days** | when the class is deleted (soft-delete) | scheduled purge job (extends `purge_soft_deleted`) |
| Student account (`users` + `auth.users`) | **30 days** | last active class membership ends (removed or class deleted) | purge job; deletes submissions first (FK `student_id` is ON DELETE RESTRICT — wrong order fails loudly, by design) |
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
- Deletion order for a student purge (enforced by RESTRICT): `grades` →
  `submissions` → `class_members` → `users` → `auth.users`.
- A district's written deletion request (via the authorization agreement)
  short-circuits every window: fulfilled within 30 days of the request.

## What deletion means

Hard SQL DELETE (not soft-delete) once a window closes. Supabase point-in-time
backups age out on the platform's own schedule (⟨confirm current backup
retention on the plan in use⟩); we treat data as fully gone when the last
backup containing it expires.
