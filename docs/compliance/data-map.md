# Data Map — where every piece of personal data lives

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Version `2026-08-04-draft-2`. Mirrors migrations 0001–0021; regenerate this
> doc whenever a migration adds/removes a personal-data column (Q4A in-arc
> doc rule).
>
> Changes since `draft-1` (which mirrored 0001–0014): `section_checks` added
> (0020 — it, not `submissions`, is where student work lands in the new
> architecture); the **anonymous disclosure** of a teacher's display name
> documented for the first time; `users.display_name` semantics corrected for
> 0021. The first two were pre-existing gaps in draft-1, found while fixing
> the third.

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
| `users.display_name` (student) | name, **may be NULL** | student | Google `full_name` when supplied, else NULL (0021 — never the email) | teacher recognizes student work | account lifetime |
| `users.display_name` (teacher) | name, **may be NULL** | teacher | same | student-facing attribution on the activity page — **⚠ disclosed to unauthenticated visitors, see Disclosures** | account lifetime |
| `users.role` / `account_tier` | role/tier | both | system | authorization | account lifetime |
| `allowlist.email` | teacher email | teacher | author-entered | invite gate | until removed |
| `student_domain.domain` | district domain (not personal per se) | — | author-entered | student admission gate | until removed |
| `classes.name` | class name (may reference a teacher) | teacher | teacher | roster | class lifetime |
| `classes.age_assertion_at/by/text_version` | assertion record | teacher | teacher checkbox (3.1C) | 13+ compliance paper trail | class lifetime + audit window |
| `class_members.*` | class ↔ student link, join/remove times | student | join_class RPC | roster | class lifetime; drives account purge clock |
| `section_checks.student_id` | account-backed identity | student | `record_check` RPC (0020, service-role only) | attributing work | follows submissions window |
| `section_checks.responses` / `verdicts` | classwork **and the feedback the student was shown** | student | student work + server grading | the product; lets a teacher see what a student was actually told | follows submissions window |
| `section_checks.attempt_number` / `idempotency_key` / `section_id` | check bookkeeping | student | RPC | replay safety, attempt ordering | same |
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
                                         display_name = Google full_name, else NULL
join code ──► join_class RPC ──► class_members (+audit row)
student work ──► check-activity ──► record_check RPC ──► section_checks(student_id,
                                                          responses, verdicts)
student work ──► grading RPC (S4) ──► submissions(student_id, responses, score)
                                      └─ ip_hash/user_agent (30-day abuse window)
teacher grading ──► grades
legacy published page ──► ingest-submission ──► submissions(display_name)   [until S9]

⚠ OUTBOUND, NO SIGN-IN REQUIRED:
anyone with an activity link ──► get-activity?meta=1 ──► get_activity_public_meta
                                 └─► { activity title, teacher display name }
```

## Disclosures to unauthenticated parties

Exactly ONE endpoint returns personal data without a sign-in, and it is a
deliberate design ruling (3.2A), not an oversight: `get_activity_public_meta`,
reached via `get-activity?meta=1`. It exists so a student who follows an
activity link sees *what this is and who sent it* before being asked to sign
in to a school account. It returns the **activity title and the teacher's
display name, and nothing else** — no content, no counts, no student data, no
emails.

**No student personal data is disclosed anonymously anywhere.** The subject of
this disclosure is always the teacher, and it is data about a professional
acting in their teaching role.

Three layers keep an email out of that field, added 2026-08-04 after a live
check found the endpoint returning the author's email address (the old signup
trigger stored `coalesce(full_name, email)`, so an account whose Google
profile carried no name got its email published):

1. the signup trigger stores a name or NULL, never the email;
2. the RPC refuses to return an email-shaped value regardless of the column;
3. the client suppresses one anyway before rendering.

Reasoning in [DECISIONS.md](../DECISIONS.md) → "Teacher display_name is a name
or nothing".

**Current state of the live project (2026-08-04): every teacher row's
`display_name` is NULL**, so the endpoint discloses only activity titles today
and the screen reads "your teacher". That is the author's own choice for their
own account, *not* an enforced property of the system — a teacher whose Google
profile supplies a name will have that name published here. A teacher-facing
control over this is designed-but-deferred (STATE.md → Backlog), and the ruling
recorded with it is that such a control should make publication **opt-in**
rather than silently adopting the SSO profile name.

## Deliberate absences

- **No birthdates/ages.** Age eligibility is asserted by the teacher (3.1C),
  not collected from students.
- **No behavioral telemetry** (P3A): no client-side event tracking; analytics
  are aggregates computed from submissions/audit_log server-side.
- **No raw IPs anywhere.** `ip_hash` is salted SHA-256 with a rotating salt.
- **Answer keys** are content, not personal data — but note they are stripped
  server-side before any payload reaches a student client (TV4-A).
- **`activity_version_reads` (0017) holds no personal data.** It caches the
  sanitized *activity content* per version, keyed by `(version_id,
  sanitizer_rev)` — deliberately student-independent, so nothing about who
  read it is stored. Listed here because a cache table next to student work
  invites the question.
