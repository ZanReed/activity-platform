# Data Map — where every piece of personal data lives

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Version `2026-08-26-draft-8`. Mirrors migrations 0001–**0041**, verified
> against the live schema (`information_schema`) rather than against migration
> filenames. Regenerate whenever a migration adds/removes a personal-data
> column (Q4A in-arc doc rule) — **now also a standing rule in CLAUDE.md,
> because this doc fell three migrations behind before a drift audit caught
> it.** 0027 adds **no personal-data columns** — it changes WRITE PATHS: class
> create / join-code regeneration / domain edits now run through audited
> SECURITY DEFINER RPCs (`class.create`/`class.update` audit rows, actor +
> old/new metadata), and the assertion record became structurally immutable
> (client column grants).
>
> **`draft-8` (2026-08-26) — 0041 adds NO personal data.** The
> curriculum-alignment slice adds one column, `activities.source_key`: the
> author-minted permanent identity of a catalogue `.md` file
> (`act.rate.unit-rate`), plus a partial unique index on
> `(owner_id, source_key)`. It is activity metadata in exactly the sense
> `source_path` is — a name the author chose for a file in their own catalogue
> folder — so it does not match the person-column sweep, and `activities` was
> already mapped via `owner_id`. It is never shown to a student, never part of
> a URL, and never derived from anything about a person. `retention-policy.md`
> does not move (the 0038 / 0039 / 0040 precedent): no new table, no
> student-derived rows, and no change to what is retained or for how long.
> Stated explicitly rather than by silence, per 0027 / 0035 / 0038 / 0039 /
> 0040 — the range moves to 0041 on that basis.
>
> **`draft-7` (2026-08-24) — 0040 adds NO personal data, and no column at all.**
> The activity-flow-modes slice changes exactly one function, `record_check`:
> it grows a `p_locked` parameter (server-derived from the stored document's
> `meta.submissionMode`, never sent by the client) and refuses a SECOND check
> for a `(student, activity_version, section)` that already has one. No table,
> no column, no index, no new person reference, and no change to what
> `section_checks` stores — the refusal is a `raise exception`, and a refused
> check writes nothing at all, so the slice can only ever REDUCE the number of
> student-derived rows retained. `retention-policy.md` does not move either
> (the 0038/0039 precedent). Stated explicitly rather than by silence, per
> 0027 / 0035 / 0038 / 0039 — the range moves to 0040 on that basis.
>
> **`draft-6` (2026-08-21) — 0039 adds NO personal data.** The table-block
> slice's drift guard adds one column, `activities.source_fingerprint`: a
> sha256 of the activity's own `draft_content` as the batch importer last wrote
> it, used to tell an app-side edit from an untouched draft before the importer
> overwrites it. It is a hash of ACTIVITY CONTENT the author wrote, holds no
> person reference and no student-derived data, and is never read by the app or
> served to anyone. NULL for every activity not written by the importer. No new
> table, no new retention question, and no change to any existing row below —
> so `retention-policy.md` does not move either (the 0038 precedent). Stated
> explicitly rather than by silence, per 0027 / 0035 / 0038 — the range moves
> to 0039 on that basis.
>
> **`draft-5` (2026-08-20) — 0038 adds NO personal data.** The batch-importer
> slice adds one column, `activities.source_path`: the path of the `.md` file an
> activity was imported from, RELATIVE to the author's own catalogue folder
> (e.g. `unit-3/factoring-quadratics.md`). It describes a file on the teacher's
> own machine, not a person — the same character as `activities.slug`, which
> this doc has never listed for the same reason. It is NULL for every activity
> authored in the app, is never served to a student, and never appears in a URL
> (the share link is built from the activity id). No new table, no new person
> reference, no new retention question, and no change to any existing row below.
> Stated explicitly rather than by silence, per the 0027/0035 precedent — the
> range moves to 0038 on that basis.
>
> **`draft-4` (2026-08-18) — 0037 adds NO personal data.** The activity
> taxonomy slice adds `activities.tags` (text[]) and
> `activities.pedagogical_role` (enum), and makes `publish_activity` stamp the
> existing `activities.course`/`.unit` columns from the published snapshot.
> All four describe the ACTIVITY, never a person: they are curriculum labels
> an author types about their own worksheet. No new table, no new person
> reference, no new retention question, and no change to any existing row
> below. Stated explicitly rather than by silence, per the 0027/0035
> precedent — the range moves to 0037 on that basis.
>
> **`draft-3` (2026-08-17) closes the gap for 0030 and 0034–0036:**
> - **0034** replaced the never-used `grades` table with **`check_grades`** —
>   teacher feedback and per-criterion scores keyed to a *specific* check row.
>   `grades` was **DROPPED**; its row below is now a tombstone.
> - **0035** added no personal-data columns (a view over `section_checks`, a
>   watermark column on the job ledger, and a disarmed prune function).
> - **0036** adds **two `users` columns** (`timezone`, `rollup_rebuild_needed`)
>   and **two aggregate tables** that deliberately hold no student identifier
>   but DO outlive the student work they summarize — the subject of
>   `counsel-review-packet.md` **Q10**, and now a row in
>   [retention-policy.md](retention-policy.md).
> - **0030** (missed by `draft-2` entirely) added **`class_activities.added_by`**,
>   a teacher identifier.
>
> ⚠ **HOW THIS DRAFT WAS BUILT, because the method is the finding.** Earlier
> drafts were assembled by reading migration diffs, which is why 0030 went
> unnoticed for six migrations. `draft-3` instead **swept the live
> `information_schema` for every person-referencing column** and reconciled the
> result against this table. That found seven columns no draft had ever
> documented — including **`assignment_students.display_name`, a student-name
> column** in the dormant 0001-era assignment machinery (0 rows, no writer, but
> a document claiming to map "where every piece of personal data lives" should
> not have been silent about it). All seven are now in the table below. **Future
> regenerations should repeat the sweep, not the diff read.**
>
> ⚠ **Two live facts that changed since `draft-2`, both counsel-relevant:**
> (1) **a real student account now exists and it HAS a `display_name`** (Google
> `full_name`, stored 2026-08-16) — the first real person's name in this
> database; all three teacher rows remain NULL (verified 2026-08-17). (2) The
> join-class flow **has been executed by a real person**, which `draft-2`'s
> flow diagram said had never happened.
>
> ⚠ **This doc's `draft-2` stamp was not bumped when 0033's rows landed** (the
> failure this draft fixes). The doc-local version numbering (this file,
> retention-policy) is separate from the in-product `POLICY_VERSION`
> (`2026-08-15-draft-3`), and unifying the two is an open question for the
> counsel read — see `counsel-review-packet.md` Q8.
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
| ~~Cloudflare R2 (published HTML, fonts, graph-kit)~~ | ⚰ **GONE — bucket deleted at the D-13 teardown, 2026-08-15** | **No, and now moot.** Published pages held activity content only. The 283-object archive was taken as a local, untracked backup before deletion; the platform serves no object storage today (the graph kit is an app-bundled chunk, fonts self-host in the SPA) |
| Browser localStorage (legacy published pages) | student device | Typed display name + in-progress answers, never synced anywhere except via submission |
| Browser storage (new viewer, T7) | student device | Local-first response buffer for the signed-in student; cleared by sign-out (`signOutEverything`) |

## Tables (personal data only — content tables omitted)

| Table.column | Data | Subject | Source | Purpose | Retention (see [retention-policy.md](retention-policy.md)) |
|---|---|---|---|---|---|
| `auth.users` | email, Google name/avatar ref, provider metadata | teacher, student | Google OAuth | authentication | account lifetime |
| `users.email` | school email | teacher, student | Google OAuth | identity, domain gate | account lifetime |
| `users.display_name` (student) | name, **may be NULL** | student | Google `full_name` when supplied, else NULL (0021 — never the email) | teacher recognizes student work | account lifetime |
| `users.display_name` (teacher) | name, **may be NULL** | teacher | same | student-facing attribution on the activity page — **⚠ disclosed to unauthenticated visitors, see Disclosures** | account lifetime |
| `users.role` / `account_tier` | role/tier | both | system | authorization (**`pending` = admitted, holds nothing**, 0033) | account lifetime |
| `users.educator_attested_at` / `_version` | date + policy version of the educator confirmation | teacher (self-serve only) | the teacher, at setup | recording who confirmed school authorization, and against which wording | account lifetime |
| `users.teacher_caps_exempt` | flag | teacher | system | exempts directly-added teachers from the self-serve class/roster caps | account lifetime |
| `users.timezone` (0036) | IANA zone name, e.g. `Pacific/Auckland` — **a coarse location signal about a named account**, teacher-set | teacher | the teacher (no editing surface ships yet — the author's row was set by migration; everyone else is NULL = platform default) | keys daily analytics aggregates to the teacher's own school day rather than UTC, which would split a US evening across two days | account lifetime |
| `users.rollup_rebuild_needed` (0036) | boolean job flag, **not user data** | — | set by a trigger on a timezone change, cleared by the nightly job; **refuses client writes** | queues the re-day of that teacher's aggregates so a zone change cannot double-count | operational |
| `class_activities.added_by` (0030) | teacher identity on a class↔activity assignment | teacher | `class_activities` write path | records which teacher assigned an activity to a class | class lifetime |
| `check_grades.general_feedback` / `criteria` (0034) | **teacher's written feedback and per-criterion scores about a student's work** | student (about), teacher (author) | teacher, via `upsert_check_grade` | manual grading of free-text answers | **CASCADES from `section_checks`** — deleting the check deletes its grades, so the windows in the row above govern with no separate step |
| `check_grades.graded_by` (0034) | teacher identity of the grader | teacher | RPC | attribution, audit | **SET NULL on teacher purge** (0024's pattern) — the student keeps their feedback, attributed to "a former teacher" |
| `check_grades.released_at` (0034) | whether/when feedback was shown to the student | student (about) | `release_check_grades` | the most FERPA-significant event in grading; audited as `grade.release` | with the row |
| `check_rollup_daily.*` / `check_item_rollup_daily.*` (0036) | per-day counts of checks, verdicts and **distinct students** per question — **no student identifier by construction** (absence asserted against `information_schema` by `verify-0036.sql` §B) | — | nightly `run_analytics_maintenance` from `section_checks` | durable teacher analytics that survive the pruning of superseded attempts | ⚠ **the life of the ACTIVITY — these OUTLIVE the individual checks they summarize, and are NOT recomputed when a student is purged.** A row reading `students = 1` describes one identifiable student's day. Full statement + the reasoning in [retention-policy.md](retention-policy.md); this is **counsel question Q10** |
| `allowlist.email` | teacher email | teacher | author-entered | invite gate | until removed |
| `student_domain.domain` | district domain (not personal per se) | — | author-entered | student admission gate | until removed |
| `classes.name` | class name (may reference a teacher) | teacher | teacher | roster | class lifetime |
| `classes.age_assertion_at/by/text_version` | assertion record | teacher | teacher checkbox (3.1C) | 13+ compliance paper trail | class lifetime + audit window |
| `class_members.*` | class ↔ student link, join/remove times | student | join_class RPC | roster | class lifetime; **IS** the account purge clock — dormancy is derived from these rows live (0025), never stored |
| `section_checks.student_id` | account-backed identity | student | `record_check` RPC (0020, service-role only) | attributing work | **400 days** via the account-dormancy path, or **30 days** if the teacher deletes the activity — both in [retention-policy.md](retention-policy.md) |
| `section_checks.responses` / `verdicts` | classwork **and the feedback the student was shown** | student | student work + server grading | the product; lets a teacher see what a student was actually told | same as above |
| `section_checks.attempt_number` / `idempotency_key` / `section_id` | check bookkeeping | student | RPC | replay safety, attempt ordering | same |
| `submissions.student_id` | account-backed identity | student | ~~grading RPC (S4)~~ **never written — S4 landed checks in `section_checks` instead; branch demolished at S9 (C5)** | attributing work | submissions window |
| `activity_version_census.*` / `activity_version_items.*` (0026) | per-version block/item counts — **no student identifier by construction** (absence asserted against `information_schema`) | — | derived by `get-activity`'s cache-fill from stored version snapshots | teacher analytics | follows the version |
| `analytics_job_runs.*` (0026; widened 0035–0036) | nightly maintenance ledger — row counts, the rollup **watermark** (`rolled_through`), a `job_name` discriminator, a reconciliation pair, and the count of unrolled rows a purge destroyed. **No personal data, no foreign keys** (it outlives every table it reports on) | — | `run_analytics_maintenance` + `purge_soft_deleted` | job observability; a job that silently stopped is visible on a screen someone opens | operational |
| `submissions.display_name` | **typed name (legacy path)** | student | student-typed on legacy pages | attributing work | submissions window; path demolished at S9 |
| `submissions.opaque_token` | pseudonymous roster token (Phase-3 design, unused) | student | — | — | — |
| `submissions.responses` / `score` / `attempt_number` | classwork | student | student work | the product | submissions window |
| `submissions.ip_hash` | salted SHA-256 of IP | student | ~~ingest edge~~ (writer demolished) | abuse detection ONLY | **CLOSED at S9 Drop 3** — all rows wiped by 0029, ingest path dropped; zero rows remain, nothing can write new ones |
| `submissions.user_agent` | browser string | student | same | abuse detection ONLY | closed with ip_hash (same wipe) |
| ~~`grades.*`~~ | ⚰ **TOMBSTONE — the table was DROPPED by 0034 (2026-08-16)**, having never held a row. Teacher feedback lives in `check_grades` above, keyed to a specific check rather than to the never-written `submissions`. Kept as a row because earlier drafts, the purge function's history, and `retention-policy.md` all cited it | — | — | — | — |
| `audit_log.actor_id` + `action` (+`ip_hash`) | who did what when | both | triggers/RPCs | security review | **2 years** — and the row outlives the account: on purge `actor_id` goes NULL and `metadata.actor_purged` is stamped (0024), so the event survives its window without naming a person |
| **`assignment_students.display_name`** | ⚠ **a STUDENT NAME column, in a table no earlier draft of this document mentioned** — found 2026-08-17 by sweeping `information_schema` for person-referencing columns instead of reading migration diffs. Part of the **dormant 0001-era assignment machinery** (Phase-3 Classroom integration, designed and never wired). **0 rows, and no code path writes it** | student | — (no writer) | none today | **retire with the table** — TODOS carries "Drop the dormant `assignments` table"; until then it is an empty column with no writer, which is a latent surface rather than held data |
| `assignments.teacher_id` | teacher identity on the same dormant machinery | teacher | — (no writer) | none today | as above; **0 rows** |
| `activities.owner_id` / `activity_versions.created_by` | teacher identity on authored content | teacher | editor / `publish_activity` | ownership, authorization (`can_edit_activity`) | account lifetime; blocks account purge until the content is gone (0023's work-before-account precedence) |
| `classes.teacher_id` | teacher identity on a class | teacher | `class.create` RPC | ownership, roster authorization | class lifetime |
| `allowlist.added_by` / `student_domain.added_by` | which teacher/author added an invite or a district domain | teacher | RPC | audit trail on the admission gates | until the row is removed; blocks that account's purge while present |

## Flows

```
Google OAuth ──► auth.users ──trigger──► users (role decided: allowlist→teacher,
                                               student_domain→student, else rejected)
                                         display_name = Google full_name, else NULL
join code ──► redeem_join_code RPC ──► class_members (+audit row)
                                       [EXECUTED BY A REAL PERSON 2026-08-16 —
                                        one student, class 7NE9M2. draft-2 said
                                        this had never happened]
student work ──► check-activity ──► record_check RPC ──► section_checks(student_id,
                                                          responses, verdicts)

teacher grading ──► upsert_check_grade ──► check_grades(criteria, general_feedback,
                                            graded_by)          [audit: grade.upsert]
                └─► release_check_grades ──► released_at stamped [audit: grade.release]
student reads it ──► get_my_released_feedback  (own rows only, released only)

nightly 03:30 UTC ──► run_analytics_maintenance ──► check_rollup_daily
                       │                            check_item_rollup_daily
                       │                            [DE-IDENTIFIED counts; they
                       │                             OUTLIVE the checks — Q10]
                       └─► advances the rollup watermark on analytics_job_runs
nightly 03:00 UTC ──► purge_soft_deleted ──► deletes eligible checks + accounts,
                       and writes its own ledger row (never blocked by analytics)

⚰ DEMOLISHED at S9 Drop 3 (kept so a reader knows these paths are gone):
legacy published page ──► ingest-submission ──► submissions(display_name, ip_hash)
                                      [function deleted, ingest_submission RPC
                                       dropped, all rows wiped (0029). `submissions`
                                       survives EMPTY with no writer; `grades` was
                                       DROPPED outright at 0034]

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

**Current state of the live project (re-verified 2026-08-17): all three teacher
rows' `display_name` is NULL**, so the endpoint discloses only activity titles
today and the screen reads "your teacher". That is the author's own choice for
their own account, *not* an enforced property of the system — a teacher whose
Google profile supplies a name will have that name published here.

⚠ **New since `draft-2`, and stated plainly because it is the first of its
kind: one real student account exists and it DOES carry a `display_name`**
(Google `full_name`, stored 2026-08-16 when a second Google account joined a
class). It is the author's own throwaway test account, so nothing is owed to a
third party — but the database now holds a real person's name, and the
"no real personal names are stored yet" comfort that earlier drafts leaned on
has expired. **A student `display_name` is never disclosed anonymously** — the
meta endpoint returns the teacher's name and the activity title only, and no
unauthenticated path reaches a student row. A teacher-facing
control over this is designed-but-deferred (STATE.md → Backlog), and the ruling
recorded with it is that such a control should make publication **opt-in**
rather than silently adopting the SSO profile name.

## Deliberate absences

- **No birthdates/ages.** Age eligibility is asserted by the teacher (3.1C),
  not collected from students.
- **No behavioral telemetry** (P3A): no client-side event tracking; analytics
  are aggregates computed server-side from `section_checks` and `audit_log`
  (never from `submissions`, which has been empty and writer-less since 0029).
- **The analytics aggregates name no student, by design and by assertion.**
  `activity_version_census`, `activity_version_items`, `analytics_job_runs`
  (0026) and the two 0036 rollup tables carry counts only; `verify-0026.sql`
  §B4 and `verify-0036.sql` §B assert the absence of student-identifier
  columns against `information_schema`, because "we just won't add that
  column" is not a control. ⚠ **The honest limit of that property:** a count
  over a class of one is not anonymous in effect, and the rollup rows outlive
  the checks they summarize — which is precisely why it is asked as
  `counsel-review-packet.md` **Q10** rather than asserted as settled here.
- **`section_checks_latest` (0035) is a view, not storage.** It names "the
  student's current attempt" once so the prune and the readers cannot drift
  apart; it holds no rows of its own and has no client grants.
- **No raw IPs anywhere.** `ip_hash` is salted SHA-256 with a rotating salt.
- **Answer keys** are content, not personal data — but note they are stripped
  server-side before any payload reaches a student client (TV4-A).
- **`activity_version_reads` (0017) holds no personal data.** It caches the
  sanitized *activity content* per version, keyed by `(version_id,
  sanitizer_rev)` — deliberately student-independent, so nothing about who
  read it is stored. Listed here because a cache table next to student work
  invites the question.
