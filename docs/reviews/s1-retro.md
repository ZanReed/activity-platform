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
