# S1 retrospective — student identity (reviewed 2026-08-06)

**Scope:** slice S1 of the components-as-data rewrite (commits `4108e5f` 0013,
`07fafea` 0014, `69fbed1` app side, plus same-day follow-ups `92b26af` 0015 /
`c3b3b49` 0016; 2026-07-28), reviewed after S2–S8 completed and before S9 cutover.
**Evidence base:** the commit history since S1 (notably the 0018/0021 fixes and the
0022–0025 retention arc), a fresh-context consumer survey of every S1 contract
(DB objects, RPCs, `studentAuth.ts` exports, compliance pack), and friction markers
at the seams. Method per `s0-retro.md`. Written by the S1-reviewing session — an
independent audit pass is expected to append its findings below.

## Verdict in one line

S1's *DB contracts* held (containment, the helper idiom, classes-as-assertion-carrier,
the verify-script discipline it started); S1's *"build the student primitives ahead of
the UI"* premise is the slice's real liability — the teacher half is fully wired, the
student half is **entirely uninhabited**, and when S3/S4/S6 arrived they built parallel
mechanisms rather than consuming the S1 primitives. Both of the costs that genuinely
hurt were **inheritances S1 rewrote without auditing**: the trigger's email fallback
and a retention number written without a school calendar.

## Costs already paid (lessons banked, no action needed)

1. **The trigger rewrite carried the email fallback into the student era.** 0013
   rewrote `handle_new_auth_user` — the exact function that stores `display_name` —
   and kept 0003's `coalesce(full_name, email)`. When the 3.2A anonymous meta endpoint
   shipped (S2), it served the author's email to anyone with the link; found live
   2026-07-31, fixed three-layered in 0021 (`e8029fc`: store name-or-NULL, RPC refuses
   email-shaped values, backfill). The design intent ("teacher display name" = a name)
   existed at S1 time; the rewrite was the moment to question what it carried forward.
2. **0014's `generate_join_code` shipped missing its revoke/grant stanza, with an
   unpinned `search_path`** — the 0009 rule missed inside the very slice extending it.
   0015 (`92b26af`) closed it same-day; 0016 (`c3b3b49`) then swept the whole catalog.
   The durable yield: the advisor's function lints are DEFINER-only, so the `pg_proc`
   ACL query (`scripts/verify-0013-0014.sql` §B1) became the post-DDL routine — it
   found four INVOKER helpers the advisor is structurally blind to.
3. **`signOutEverything` was dead code for five slices.** S1 built the shared-device
   purge primitive with "UI wiring lands T6/T7"; S6 V4 (`039f0ec`) *hardened* it
   (local-fallback sign-out) — and only V7's e2e failure matrix (`a85f914`) discovered
   it had **zero callers**: `Home.tsx` still called raw `supabase.auth.signOut()`, so
   the purge never ran and the contamination hole stayed open the whole time. The
   comment-level promise ("lands in T6/T7") fired no alarm when T6 shipped without it.
4. **`VIEWER_STORAGE_PREFIX` was declared on the wrong side of the package boundary.**
   S1 put the purge-contract prefix in the app's `studentAuth.ts`, but the *viewer*
   writes the keys. S6 V1 (`ca80e74`) flipped ownership (viewer exports, app imports)
   precisely because two literals could drift — a buffer written under a prefix
   sign-out doesn't scan is work left on a shared machine.
5. **The 30-day account window was shorter than a summer break.** S1 wrote the
   retention windows contractually before any mechanics existed; 0025 (`ecfbd13`)
   changed account dormancy to 400 days because a student whose spring class was
   deleted in May would have been purged in June and returned in August to a destroyed
   account. Same arc: the "ON DELETE RESTRICT fails loudly" premise turned out to mean
   *one blocked row aborts the entire nightly purge* (0023 defect 2), and later
   CASCADE FKs (`section_checks`, `class_members`) made the retention policy's
   RESTRICT claim half-true (corrected in `d4ad6ed`).
6. **The helper idiom was applied forward, never swept back.** S1 established the
   SECURITY-DEFINER-helper pattern for policy-recursion hazards (five authoring
   policies, `is_class_teacher`/`is_class_member`) but never audited the *existing*
   `users_select_self` (0002) against it — whose inline admin branch made every direct
   authenticated SELECT on `users` raise 42P17. Found by a hand spot-check in Drop 0
   §6b (not by any test or advisor), fixed in 0018 (`8b02bea`) with S1's own idiom.

## Latent costs — what will bite future developers

7. **The student half of S1 has never run.** `join_class` has zero callers (every
   `.rpc(` site enumerated — it is not among the 13); no student-facing join UI
   exists; `student_domain` is still unseeded, so the trigger's student branch has
   **never fired in production**. Meanwhile `Privacy.tsx:69` describes the join-code
   flow as if it exists and `data-map.md` documents it as the live student-entry path.
   First real student sign-in is S9-day — the admission path's first production
   execution coincides with cutover.
8. **`submissions.student_id` + `submissions_account_attempt_idx` are dead, and the
   docs still present them as the plan.** S1 added the third identity branch "so S4
   wouldn't fork the migration mid-lane"; S4-3 then deliberately bypassed it with
   `section_checks` ("S9 demolishes that world and the new one shouldn't move into it
   first") — a rationale available on the day S1 landed, since the no-old-pages
   amendment was recorded in the same session. No writer or reader anywhere; 0014's
   in-file invariant names "the future S4 grading RPC" as its enforcer, which never
   came; the two tables now disagree on cascade posture (S1's deliberate RESTRICT vs
   0020's CASCADE — flagged open at `0022:37`). The DECISIONS S1 entry reads as
   current truth with no superseded-by-S4-3 annotation.
9. **The idle machinery has been built twice and armed zero times.** S1 wrote
   `watchIdle`; S6-6 wrote `watchIdleSignOut` (escalation + grace); both are test-only,
   `IDLE_GRACE_MS` has no importer at all, and `StudentViewer.tsx` — the actual
   shared-Chromebook surface — imports none of it. This is the exact "hardened but
   uncalled" failure V7 caught for sign-out, still live for idle, on the surface 2.4A
   exists for (a live session on a shared cart between periods). There is also no
   student-reachable sign-out control at all: `Home.tsx` is the app's only one.
10. **The 13+ paper trail's distinguishability is write-only.** `assertion_text_version`
    is stored, selected, mapped onto `ClassInfo` — and then dropped; nothing renders
    it or compares it to the current `POLICY_VERSION`, though distinguishing wording
    generations was the column's stated purpose. `ASSERTION_TEXT`'s wording is pinned
    to nothing external ("changing this = bump POLICY_VERSION" is convention only),
    and the privacy guard asserts string *presence* in the md, not content — a
    material edit without a bump passes everywhere.
11. **Compliance-pack freshness is enforced by nothing, and the rule has already been
    violated once.** The pack's own "regenerate on any personal-data migration" rule
    lapsed for 0015–0020 until `d4ad6ed` found `section_checks` — the table student
    work actually lands in — absent from both the data map and the retention policy.
    Only `privacy-policy.md` is code-referenced; no test pins the retention windows in
    the doc to the constants 0023/0025 encode (the doc churned five times with no
    version signal).
12. **The RPC seam is untyped by hand-shadow.** `classes.ts` re-declares `MemberRow`
    inline and casts (`as MemberRow[]`, `code as string`) — hand-maintained shadows of
    the 0014 RPC signatures with nothing checking they match. No generated Supabase
    types are in play; an RPC signature change is silent at compile time. (Otherwise
    the S1 surface is cast-free — zero `as never`/`as any` — a clean contrast to S0's
    seams.)
13. **`current_user_is_teacher()` adoption froze at 0014.** 0019's bucket policy and
    0020's check policies each rolled their own gate (0019 via `can_edit_activity` —
    defensible helper reuse; 0020 inline). Each choice is locally fine, but the
    containment guard is no longer a single vocabulary, and a future authoring policy
    has three patterns to pick from.
14. **Device hygiene runs on two independent paths, and the UI doesn't compose the
    documented lockout.** Mount-time sweeps (`sweepForeignStorage`/`sweepOrphanVersions`,
    wired in `StudentViewer`) and sign-out purge (`signOutEverything`, wired in Home)
    are separate mechanisms; only the former runs on the student surface today.
    `removeClassMember`'s own doc says "pair with `regenerateJoinCode` for an actual
    lockout" — the Classes UI performs remove alone, so the lockout is a two-click
    manual procedure the interface doesn't offer.

## Refactor watchlist

**Cheap now (before S9 locks things in):**

1. Annotate the DECISIONS S1 entry: `submissions.student_id` superseded by S4-3
   (never written), the RESTRICT loud-failure claim amended by 0022/0023. Fix
   `Privacy.tsx`'s and `data-map.md`'s descriptions of the not-yet-existing join flow
   (~30 min).
2. Add three lines to the S9 cutover checklist: (a) wire `watchIdleSignOut` + a
   student-reachable sign-out control (2.4A chip) into `StudentViewer`, **with an e2e
   that proves the wiring** — the V7 lesson says the primitive existing is not
   evidence; (b) demolish the `submissions.student_id` branch + attempt index with the
   anonymous wire; (c) seed `student_domain` and live-verify the trigger's student
   branch before the first real class (~10 min to record).
3. Dead-export sweep in `studentAuth.ts`/`classes.ts`: `IDLE_GRACE_MS`, the redundant
   `VIEWER_STORAGE_PREFIX` re-export, `CreateClassInput`; privatize
   `normalizeExpectedDomain` (~20 min).
4. One test pinning `retention-policy.md`'s window numbers to the 0023/0025 constants
   (or at minimum to each other), same shape as the privacy-version guard (~45 min).
5. Compose the lockout: the remove-student action offers (or performs) the join-code
   regeneration its own doc calls for (~30 min).

**Opportunistic (next time someone's in the file):**

6. Generate Supabase DB types (or hand-write one typed RPC map) and delete the
   `MemberRow` shadow + casts.
7. Surface `assertion_text_version` in the Classes UI when it differs from the current
   `POLICY_VERSION` — that difference existing invisibly defeats the column.
8. Strengthen the privacy-version guard from string-presence to a content hash, or
   document explicitly that wording integrity is convention.

**Policy (decide deliberately, not by accident):**

9. **A primitive built ahead of its UI needs a wiring proof at the slice that promised
   it** — an e2e row or a tracked xfail, not a comment. "Lands in S3/T6" fired no
   alarm when S3 and T6 shipped without it, three separate times (`join_class`,
   `watchIdle`, `submissions.student_id`).
10. When rewriting an inherited function, audit what it *carries forward*, not just
    what changes (the 0021 email-fallback lesson).
11. Contractual numbers (retention windows, timeouts) get a calendar/reality check
    before entering policy docs — 30 days was shorter than a summer break.
12. New authoring-adjacent policies either reuse the containment helper vocabulary or
    record why not; three gate patterns now coexist (0013 helper, 0019 ownership
    helper, 0020 inline).

## What held up (no apology needed)

The one-users-table + role + containment decision: the five guarded authoring policies
are unchanged through 0026, and the DEFINER-helper idiom S1 established became the
repo's standard (0018 applied it back to `users`; the class helpers survived intact).
`classes`/`class_members` becoming the **retention substrate**: 0023/0025 derive
dormancy live from S1's tables, with S1's partial index already covering the probe —
load-bearing consumers S1 never anticipated, zero schema change needed. The
assertion-carrier design: NOT-NULL columns make an assertion-less class
unrepresentable, the unchecked-by-default/per-class-reset checkbox is guard-tested,
and the capture side is fully wired. The verify-script discipline S1 started
(`verify-0013-0014.sql`) became the per-migration norm and its §B1 ACL query caught a
real gap the advisor lint structurally cannot see. The 0016 refusal to park a
carry-forward across a session boundary ("that is how the 0012 gap survived").
`signOutEverything`'s purge-FIRST ordering premise — a failed network call must never
decide whether on-device work survives — was kept and extended by S6, vindicating the
design even where the wiring lagged. And the S1 surface carries zero type-escape
hatches: the friction that plagued S0's seams simply doesn't exist here.

---

## Independent audit (2026-08-06, second-pass)

Adversarial verification of every claim above, executed by two fresh-context
subagents (a claim-by-claim refuter and a blind-spot hunter over the surfaces the
retro treated as settled) plus live-database checks — orchestrated by the
retro-authoring session, with every material subagent finding independently
re-verified against the repo before inclusion.

**Verdict on the retro:** the findings substantially hold — all 12 commit
characterizations are exact, "five slices" is the right count, every zero-consumer
claim survived independent enumeration, and the live database confirms the
uninhabited-student-half thesis as of today. But one latent-cost item is flatly wrong
(the "three gate patterns" claim, contradicted by 0020's own comment), one held-up
claim contradicts the retro's own item 12, the verify-script "per-migration norm" is
overstated with a dangling cite — and the blind spots cluster exactly where S0's did:
**the retro audits what S1 declared, not what S1's own machinery does.** The
enforcement scripts, the unit-test tautologies, the compliance pack's *content*, and
the app shell's role-blindness were never turned over, and several of what they hide
are sharper findings than anything in the retro.

### Confirmed

Every commit hash and characterization (1–6 and the `a85f914` Home.tsx wiring —
verified in the diff; it is the only commit ever to touch `signOutEverything` in
Home). "Five slices" (S2/S3/S4/S5/S6 per the STATE ledger). `join_class` absent from
all 13 enumerated `.rpc(` sites; no student-facing join UI. `watchIdle`/
`watchIdleSignOut` test-only; `StudentViewer` imports neither. The five guarded
authoring policies untouched through 0026; `current_user_is_teacher` policy-level
adoption ends at `0014:166`. `assertion_text_version` write-only (selected, mapped,
never read). The privacy guard is presence-only (`toContain`); `retention-policy.md`
churned five times post-creation with no version signal. 0018's hand-spot-check
origin, 0023 defect 2, 0025's summer-break rationale, the 3.2A leak timeline —
all verbatim in the cited headers. `class_members_student_idx` covering 0025's probe
(`0025:37`). The uncomposed lockout (`classes.ts:185-186` vs `Classes.tsx:90`).
`data-map.md:38,57` presenting `join_class` as live with no hedge, in a doc that
hedges elsewhere. Watchlist item 2's premise: STATE's cutover checklist is
R2-demolition only — zero hits for idle, `student_domain`, or `submissions.student_id`.

### Corrected

1. **Finding 13's "three gate patterns" is wrong, and 0020 says so itself.**
   `0020_section_checks.sql:116-119`: "Calls the helper rather than inlining the
   ownership check (CLAUDE.md standing rule)… `using (can_read_activity(activity_id))`" —
   not inline. The other 0020 policy is a self-scope (`student_id = auth.uid()`), not
   a teacher gate. There are **two** patterns — the role helper (0013) and the
   ownership helpers (0002/0009, mandated by CLAUDE.md, predating S1 by eleven
   migrations) — and the second is nobody "rolling their own." Policy item 12 falls
   with it as written; what survives is only "record which helper family a new policy
   uses."
2. **"The verify-script discipline became the per-migration norm" is overstated, with
   a dangling cite.** No standalone script exists for 0015, 0016, 0018, or 0019 —
   and `0018:100` references `scripts/verify-0018.sql`, **a file that does not
   exist**. The real shape: in-file EXPECT footers from 0015 on, standalone scripts
   reliably only from 0020 (0019's is `verify-image-storage.sql`).
3. **"Zero type-escape hatches" (held-up list) is self-contradicted by item 12.**
   `classes.ts` carries **five** plain `as` assertions (`:89,131,151,155,175` — the
   verifier itself undercounted four; recounted). The literal claim "zero
   `as never`/`as any`" is true; "the friction simply doesn't exist here" is not —
   item 12 names it.
4. **"No student-reachable sign-out control" is overstated.** `Home.tsx` has no role
   gate — any signed-in user at `/` gets the sign-out button. The accurate, still
   damning claim: the *student surface* (`/a/:activityId`) has no sign-out and no
   link to `/`, and both `privacy-policy.md:61-62` and `Privacy.tsx:111-112` tell
   students to "use the sign-out button in the account menu" — **no account menu
   exists**.
5. **Finding 5's "later CASCADE FKs" — `class_members` is not later.** Its CASCADE
   was written in 0014 itself (`:90`), the same migration choosing RESTRICT for
   `submissions.student_id` (`:331`). The loud-failure premise was half-true *on the
   day it shipped, in its own file* — which sharpens the lesson.
6. **The dead-export list is half-wrong in both directions.** `IDLE_GRACE_MS` and
   `CreateClassInput` are live in-file (default parameter / parameter type) — only
   the `export` keyword is removable; meanwhile `IDLE_TIMEOUT_MS` is strictly deader
   (no importer, not even a test) and the retro omits it from the sweep.
7. **Citation and framing fixes.** 0014's invariant: lines `326-329`, and the quoted
   phrase "the future S4 grading RPC" is DECISIONS.md's wording, not 0014's ("the S4
   grading RPC"). `0022:37`'s open flag is the RESTRICT block on `delete from users`;
   the windows half of that paragraph was subsequently ruled (0023/0025 aligned both
   at 400d), so only the cascade question remains open. Item 2's "0016 swept the
   whole catalog" is 0015+0016 jointly. Item 5's nightly-abort mechanism is "RESTRICT
   **or NO ACTION**" — the actual permanent blocker was `audit_log.actor_id`
   (NO ACTION), closed by 0024. Watchlist item 1 under-scopes: `Classes.tsx:106-108`
   is a third surface describing the nonexistent join flow in present tense, and the
   DECISIONS S1 retention bullet still says "30d after last membership". Watchlist
   item 4's "~45 min, same shape as the privacy guard" is optimistic — no retention
   constant exists in TS anywhere; the numbers live only in migration SQL and md
   prose, so only the md↔md leg is a 45-minute job. Item 3 deserves one clause: the
   V4-hardened `signOutEverything` always had green unit tests — a green test file is
   exactly what made "hardened but uncalled" invisible, which *strengthens* policy
   item 9.

### Missed — what the retro never examined

8. **Hand-copied verification expectations rot at different rates — one already
   has.** `ac30ba4` fixed `verify-0013-0014.sql` §B5 ("EXPECT 5" → 6, noting the
   stale count "would have forced a re-diagnosis on every future re-run") — but
   `0013:202-206` carries the same expectation verbatim, still saying 5, untouched
   since `4108e5f`. And the §B1 ACL idiom exists as **six hand-copies** across the
   verify scripts, each scoped to its own migration's functions; the catalog-wide
   completeness form — the only one that catches a *new* anon-executable function —
   lives only in `verify-0017.sql` §D1 and a comment in 0016. `DECISIONS.md:274`
   names §B1 as the durable routine; `migrations/README.md:46-48` credits
   verify-0017's query. The docs point at different checks, and the one they should
   both point at has one copy.
9. **The S1 unit tests contain three tautologies and a wording guard that guards
   nothing.** `ASSERTION_TEXT_VERSION = POLICY_VERSION` by assignment
   (`classes.ts:17`), so `classes.test.ts:108` cannot fail; two more assertions
   compare the constant to itself; `Classes.test.tsx:88`'s `getByText(ASSERTION_TEXT)`
   resolves the same constant the component renders, so any wording edit passes. The
   retro's finding 10 notices the missing external pin but not the tests
   masquerading as one. And coverage stops at the create path: the mock throws on
   any table but `classes`, so `listClassMembers`, `removeClassMember`,
   `regenerateJoinCode`, and `softDeleteClass` are exercised by **nothing at any
   level** — `/classes` appears in e2e only as a route-mount timing entry.
10. **The admission gate's tie-break is case-sensitive on one side only — and 0013
    converted a loud failure into a silent wrong role.** `0013:74` matches
    `allowlist` by exact `email = new.email` (no lowercase constraint on the table),
    while the student branch lowercases. A teacher allowlisted with a mis-cased
    address falls through to the domain branch and — once `student_domain` is seeded
    — is admitted **as a student**. Pre-0013 the same typo raised a visible signup
    rejection. This sits on the exact boundary the slice exists to guard, and it
    arms itself at S9 seeding time.
11. **The 13+ paper trail is NOT-NULL but mutable, unlogged, and its enum values are
    dead.** `classes_update_own` (`0014:169-174`) pins `teacher_id`/
    `age_assertion_by` but leaves `age_assertion_at`/`assertion_text_version`
    PATCHable — an assertion already made can be silently re-stamped. 0014 declared
    `class.create`/`class.update` audit actions that **nothing writes** (class
    creation is a plain client INSERT; only `class.join`/`class.delete` have
    writers), so neither the compliance-critical act nor its mutation leaves a
    trace. The S0 "declaration-only fields" pattern, in the DB. Related demotion
    hole: `is_class_teacher` checks ownership only, so a user demoted to `student`
    keeps roster reads (including emails), member removal, and class delete — role
    demotion revokes only INSERT.
12. **The compliance pack's content has drifted from both the code and itself.**
    (a) `privacy-policy.md` — the one doc students read — is the only pack file
    untouched since S1, while `retention-policy.md:86-89` records a disclosure that
    "must stay disclosed" (departed students' name+email persist up to ~400 days)
    which the student-facing policy nowhere makes; the work-wins ruling justifies
    itself by quoting a policy sentence ("kept for the school's records window")
    that `Privacy.tsx` **drops** from its rendered version. (b) The rendered route
    and the md diverge invisibly to the presence-only guard (missing effective-date/
    operator lines, no doc links). (c) Both say the teacher sees "your name,
    responses, scores" — the roster renders every student's **email**
    (`Classes.tsx:121,124`; the primary label when `display_name` is NULL, which
    0021 made the normal case). (d) `data-map.md`'s own header still says "Mirrors
    0001–0021" while its body was edited for 0024/0025, and the 0026 census tables
    appear nowhere — the regenerate rule's **second** lapse. (e)
    `retention-policy.md:45-50` Mechanics still tells counsel the purge job doesn't
    exist ("enforcement is manual… monthly calendar reminder") after 0022–0025
    shipped it and cron registered it.
13. **The assertion checkbox promises a legal branch every other pack doc
    disclaims.** `ASSERTION_TEXT` offers "…**or that my school has authorized
    younger students to use this platform**" while
    `school-authorization-template.md:30-32` marks that branch "*not available in
    v1* — leave unchecked; the platform will decline under-13 sign-ins regardless,"
    and `privacy-policy.md:24-26` agrees. The one sentence a teacher attests to
    contains the escape hatch the pack says doesn't exist — a contradiction inside
    the slice's own artifacts, stamped `2026-07-28-draft-1` on every future class row.
14. **The app has no concept of role — S9's first student lands in the teacher
    shell.** `SessionContext` exposes `{session, loading}` only; zero role reads
    exist in `packages/app/src` outside tests. A signed-in student gets Home's "My
    activities"/"My classes", empty RLS-filtered lists, and raw Postgres error
    strings on any authoring attempt — while the one flow that would work for them
    (`join_class`) has no UI. The sharper form of the retro's thesis: the shell is
    not just missing the student half, it is affirmatively teacher-shaped, and S9
    needs a role fetch, not merely a join screen.
15. **The `hd` claim describes a parameter the app never sends.** DECISIONS says
    "the `hd` OAuth param is UX only — the trigger is the gate"; `Home.tsx:10-14`
    passes only `redirectTo`, and `hd` appears nowhere in the repo. The gate is
    real; the claimed UX affordance was never built — a student picking a personal
    account gets a generic auth error with no district hint.
16. **Favorable findings, banked.** `verify-0013-0014.sql` has *not* rotted — every
    assertion still holds against today's schema (0021's REPLACE preserved what §B2/
    §B3 check; 0018 rewrote a policy the script never asserts on; no index or
    constraint it pins was dropped). S1's third CHECK branch weakened nothing for
    anonymous rows (pure disjunctive widening, byte-identical old branches). S1's
    soft-delete-class semantics compose correctly with 0025's dormancy derivation
    (`greatest(cm.removed_at, c.deleted_at)`) a slice-generation later, with no
    schema change. The join-code retry loop is real (3 attempts gated on 23505 in
    both call sites), though untested — and its `(random()*30)::int + 1` draw is
    mildly biased (rounding halves the frequency of `A` and `9`). The V7 fix landed
    with a durable rule attached (`Home.tsx:24`: "Every sign-out control added later
    must call this one too").

### Live-database observations (2026-08-06)

The retro's live claims verified directly: `student_domain` **0 rows**, **0**
student users, **0** `submissions.student_id` writes — all exact. Two additions:
**`classes` has 0 rows total** (not even soft-deleted), so the "fully wired" teacher
half has also never produced a production row; the 13+ capture has only ever run in
tests. And STATE's "one open action — observe the cron's first fire" can be closed:
both jobs ran 2026-08-05 03:00/03:30 UTC and **succeeded**, purging nothing —
correct, since the oldest soft-delete is 26 days old (`past_window = 0`), matching
the falsifiable prediction. The 44 `section_checks` recorded on 08-04 are now 0 —
explained by the documented manual E2E-residue cleanup (`verify-check-e2e.js:285`
prints exactly that DELETE for the author), not the cron; worth the author
confirming it was them.

### Audit addenda to the watchlist

- **Promote to cheap-now: reconcile `ASSERTION_TEXT` with the pack (item 13)** —
  drop the under-13 clause or make the docs describe the branch as live; every class
  row will carry the current ambiguous wording.
- **Rewrite watchlist item 1 around item 12**: the load-bearing edits are the
  ~400-day disclosure `retention-policy.md` says "must stay disclosed", the deletion
  sentence `Privacy.tsx` drops, the roster-email vs "sees your name" mismatch, and
  the Mechanics section still denying the purge job exists — with the mandatory
  `POLICY_VERSION` bump as the version contract's first real test.
- **Extend item 2's S9 checklist**: (d) fetch `users.role` into `SessionContext` and
  branch the shell (item 14); (e) normalize `allowlist.email` casing before seeding
  `student_domain` (item 10); (f) pass `hd` on sign-in or strike the DECISIONS
  claim (item 15).
- **Rewrite item 4 on the real shape**: no TS retention constant exists; pin md↔md
  first, and in the same pass fix `data-map.md`'s scope header and add the 0026
  census tables (item 12d).
- **New, cheap**: fix `0013:202-206`'s "EXPECT: 5" → 6 (item 8); pick the
  catalog-wide ACL query as *the* post-DDL routine and make DECISIONS.md and
  migrations/README.md agree (item 8).
- **New, opportunistic**: make the assertion immutable (strip the two columns from
  `classes_update_own`'s writable set) and give `class.create` a writer (item 11);
  add `expected_domain`'s missing `like '%.%'` check + a class-edit path (a typo'd
  domain currently bricks joining, remedied only by delete-and-recreate).
- **New, policy — the S0 lessons land here twice**: hand-copied expectations must be
  swept across every copy when one is fixed (items 8, and S0-audit item 9's roster
  lesson); tests that reference the constant they guard are not guards — bond
  `ASSERTION_TEXT` externally or say out loud that wording is convention (item 9).
