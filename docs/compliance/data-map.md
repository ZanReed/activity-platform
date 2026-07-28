# Data Map — where every piece of personal data lives

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Version `2026-07-28-draft-1`. Mirrors migrations 0001–0014; regenerate this
> doc whenever a migration adds/removes a personal-data column (Q4A in-arc
> doc rule).

## Systems

| System | Location | Holds personal data? |
|---|---|---|
| Supabase Postgres (project `dtqutpdplefmufrrakxs`) | ⟨AWS region — read off the Supabase dashboard⟩ | **Yes** — everything below |
| Supabase Auth (`auth.users`) | same | **Yes** — Google identity (email, name, provider ids) |
| Cloudflare R2 (published HTML, fonts, graph-kit) | Cloudflare network | **No** — published pages contain activity content only. (Legacy pages accepted typed student names into localStorage; see below. Retired at S9 cutover.) |
| Browser localStorage (legacy published pages) | student device | Typed display name + in-progress answers, never synced anywhere except via submission |
| Browser storage (new viewer, T7) | student device | Local-first response buffer for the signed-in student; cleared by sign-out (`signOutEverything`) |

## Tables (personal data only — content tables omitted)

| Table.column | Data | Subject | Source | Purpose | Retention (see [retention-policy.md](retention-policy.md)) |
|---|---|---|---|---|---|
| `auth.users` | email, Google name/avatar ref, provider metadata | teacher, student | Google OAuth | authentication | account lifetime |
| `users.email` | school email | teacher, student | Google OAuth | identity, domain gate | account lifetime |
| `users.display_name` | name | teacher, student | Google profile | teacher recognizes student work | account lifetime |
| `users.role` / `account_tier` | role/tier | both | system | authorization | account lifetime |
| `allowlist.email` | teacher email | teacher | author-entered | invite gate | until removed |
| `student_domain.domain` | district domain (not personal per se) | — | author-entered | student admission gate | until removed |
| `classes.name` | class name (may reference a teacher) | teacher | teacher | roster | class lifetime |
| `classes.age_assertion_at/by/text_version` | assertion record | teacher | teacher checkbox (3.1C) | 13+ compliance paper trail | class lifetime + audit window |
| `class_members.*` | class ↔ student link, join/remove times | student | join_class RPC | roster | class lifetime; drives account purge clock |
| `submissions.student_id` | account-backed identity | student | grading RPC (S4) | attributing work | submissions window |
| `submissions.display_name` | **typed name (legacy path)** | student | student-typed on legacy pages | attributing work | submissions window; path demolished at S9 |
| `submissions.opaque_token` | pseudonymous roster token (Phase-3 design, unused) | student | — | — | — |
| `submissions.responses` / `score` / `attempt_number` | classwork | student | student work | the product | submissions window |
| `submissions.ip_hash` | salted SHA-256 of IP | student | ingest/grading edge | abuse detection ONLY | **30 days** |
| `submissions.user_agent` | browser string | student | same | abuse detection ONLY | 30 days (scrubbed with ip_hash) |
| `grades.*` | teacher feedback + scores on student work | student | teacher | grading | follows submissions window |
| `audit_log.actor_id` + `action` (+`ip_hash`) | who did what when | both | triggers/RPCs | security review | **2 years** |

## Flows

```
Google OAuth ──► auth.users ──trigger──► users (role decided: allowlist→teacher,
                                               student_domain→student, else rejected)
join code ──► join_class RPC ──► class_members (+audit row)
student work ──► grading RPC (S4) ──► submissions(student_id, responses, score)
                                      └─ ip_hash/user_agent (30-day abuse window)
teacher grading ──► grades
legacy published page ──► ingest-submission ──► submissions(display_name)   [until S9]
```

## Deliberate absences

- **No birthdates/ages.** Age eligibility is asserted by the teacher (3.1C),
  not collected from students.
- **No behavioral telemetry** (P3A): no client-side event tracking; analytics
  are aggregates computed from submissions/audit_log server-side.
- **No raw IPs anywhere.** `ip_hash` is salted SHA-256 with a rotating salt.
- **Answer keys** are content, not personal data — but note they are stripped
  server-side before any payload reaches a student client (TV4-A).
