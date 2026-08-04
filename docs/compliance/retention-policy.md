# Retention Policy

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Version `2026-08-04-draft-2`. Windows below are the author-ruled S1 defaults
> (D6, 2026-07-28); districts may require different numbers — the
> [authorization template](school-authorization-template.md) has a field to
> override them per school.
>
> `draft-2` adds `section_checks` (0020), which draft-1 predated, and corrects
> the deletion mechanics: the "wrong order fails loudly" property is real but
> **partial** — it does not cover `section_checks`. See Mechanics.

## Windows

| Data | Window | Clock starts | Mechanism |
|---|---|---|---|
| Student responses, scores, grades | **400 days** | when the class is deleted (soft-delete) | scheduled purge job (extends `purge_soft_deleted`) |
| Section checks (`section_checks` — responses + the verdicts/feedback shown) | **400 days**, same as the above: it is the same student work | when the class is deleted (soft-delete) | same purge job. **Also cascades** on student-account deletion (see Mechanics) |
| Student account (`users` + `auth.users`) | **30 days** | last active class membership ends (removed or class deleted) | purge job; deletes submissions first (that FK is ON DELETE RESTRICT, so wrong order fails loudly — but see Mechanics: the property does **not** extend to `section_checks`) |
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
  history with no error to catch it. The purge job should delete
  `section_checks` explicitly rather than leaning on the cascade, so the row
  counts it reports are the ones it actually intended to remove.
- A district's written deletion request (via the authorization agreement)
  short-circuits every window: fulfilled within 30 days of the request.

## What deletion means

Hard SQL DELETE (not soft-delete) once a window closes. Supabase point-in-time
backups age out on the platform's own schedule (⟨confirm current backup
retention on the plan in use⟩); we treat data as fully gone when the last
backup containing it expires.
