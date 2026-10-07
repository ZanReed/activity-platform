# Activity Bank — copy-on-use catalogue for every teacher

**Status:** ✅ RULED, ✅ BUILT and ✅ LIVE 2026-10-07 (migration 0054 applied,
`verify-0054` live 5/5, app at `6b36b351`). First real click-through owed by
the author (STATE). As-built notes at the end.

**Supersedes** the RUN-IN-PLACE model of [free-activity-catalog.md](free-activity-catalog.md)
(2026-06-16, reconciled 2026-07-13) and the "scoped catalog" Drop 1′ of the
2026-07-24 Activity Bank design (outside the repo,
`~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260724-010349.md`).
Both predate S9: their machinery (published R2 pages, link tokens,
`ingest-submission`, runtime wire bumps) no longer exists. What carries over:
the name "Activity Bank", `visibility='public'` as the listing flag, listing
separate from publishing, a column-subset definer RPC for browsing, "never
expose a draft", and "never widen `can_read_activity`".

## The author's brief (2026-10-07)

- "I want to be able to share and showcase what I have already built to fellow
  teachers."
- Audience: **any teacher who makes an account** sees and uses the resources.
- Depth: **use with a class**, not just skim.
- Model: **"operate like the importer does and let them fire the activity up and
  modify it if they want to"** — i.e. COPY-ON-USE: picking an activity puts a
  copy the teacher OWNS into their library, the way an imported file becomes an
  owned activity.

## Why copy-on-use is the right shape here (re-derived on main `71313b6f`)

Every teacher-side surface is gated on the activity OWNER, and the results table
has no class or teacher column:

| Surface | Gate | Citation |
|---|---|---|
| Share to a class | `can_edit_activity` ("Not your activity") | `0030_class_activities.sql:103` |
| Responses / grading queue | `can_read_activity`, rows keyed by activity only | `0034_check_grades.sql:445,477` |
| AI grade suggestions | `can_read_activity` | `0042:1343` |
| Grade writes | `can_edit_activity` | `0034:164,302` |
| Analytics | `can_read_activity`, per activity version, no class key | `0036_check_rollup.sql:638,653` |
| Results rows | `section_checks` has no class/teacher/assignment column | `0020_section_checks.sql:58-80` |
| Print, editor, guide | `activities_select_own` / `activity_versions_select_own` | `0002:129,149` |

Run-in-place would need every one of those widened (the code itself calls
widening `can_read_activity` "the Activity-Bank landmine", `0042:24-25`) and
would infer "B's students" from class membership, which is ambiguous when a
student is in two teachers' classes. **Under copy-on-use, B owns the copy, so
every surface above already works, scoped to B, unchanged.** The only new
machinery is: a way to list, a way to browse, and a way to copy.

Facts that make the rest cheap:
- **Any teacher can already make an account**: any Google sign-in is `pending`
  and self-attests via `claim_teacher` (`0033:259-307`); attested teachers are
  capped at 5 classes × 50 students (`0053:88-92`, `0033:432-439`).
- **`activities.visibility`** exists (`'private'|'unlisted'|'public'|'marketplace'`,
  `0001:28,96`) with a partial index for published rows (`0001:112`), and
  NOTHING in `packages/` reads or writes it today. `is_for_sale`/`price_cents`
  sit inert beside it.
- **Students can open any published activity** (`get_published_activity`,
  `0017:74-102`), so a teacher can already preview the student view at `/a/:id`.
- **Images** are public-bucket URLs (`0019`), so a copy keeps them without
  duplicating files.
- **The misconception registry is global** (no owner column, `0042:109`), so
  bindings and their descriptions survive a copy.
- **The course glossary is owner-keyed** (`glossary_for_activity` reads the
  activity owner's store, `0043`): the one dependency that does NOT follow a
  copy (BK-7).

## Decisions for the author

### BK-1. Copy the PUBLISHED version, into an activity the teacher owns

A definer RPC `copy_bank_activity(source_id)`:
- source must be listed (`visibility='public'`), published, not deleted, and
  `NOT is_for_sale`;
- reads the source's **current published version** (never the draft — the
  author's work in progress is never exposed);
- inserts a new activity owned by the caller (caller must be a `teacher`/`admin`
  role), copying title, description, course, unit, tags, `pedagogical_role`;
- NEVER copies the catalogue identity (`source_path`, `source_key`,
  `source_fingerprint`): a copy is not file-backed, so the batch importer never
  touches it and the teacher may edit it in the app;
- forces `visibility='private'`;
- records provenance: `copied_from_activity_id`, `copied_from_version_id`
  (two nullable columns).

Block ids are only unique within an activity, so the document copies verbatim
(the 07-24 eng review established this; the first editor save re-mints).

### BK-2. "Fire it up" = the copy arrives PUBLISHED

**Recommendation:** the RPC creates the copy AND its version 1 (the source
version is already validated), so the teacher can share it to a class
immediately — one click from Bank to class. Editing afterwards is the normal
draft → republish flow. Alternative: the copy lands as a draft and the teacher
publishes it (one more step, and the "fire it up" promise is weaker).

### BK-3. Who can list

**Recommendation for v1: only caps-exempt (allowlisted) teachers can list — in
practice, the author.** Any teacher can make an account and self-attest, so
open listing would be unmoderated public content with no quality bar and real
copyright exposure. Opening listing to other teachers becomes its own design
(curation, reporting, attribution chains) with a trigger: "a teacher other than
the author asks to share their own activity". The July ruling #1 (any owner can
opt in) is kept as the direction, not v1.

### BK-4. How the author lists

**Recommendation:** a "List in the Activity Bank" toggle on each activity
(beside Publish), plus a bulk "list this unit / chain" action on the Activities
list, since the catalogue arrives in chains. Listing requires the activity to be
published. Unlisting hides it from the Bank; copies already made are untouched
(they are owned by their teachers). Not in the importer: listing is a
publishing decision, not file content.

### BK-5. The Bank page

`/bank`, signed-in teachers only (not pending, not students). One definer RPC,
`list_bank()`, returning catalogue-safe columns only (id, title, description,
course, unit, tags, role, updated_at, and the chain order from `source_path`
so a unit reads in teaching order). Never `draft_content`, never the document.
Filter by course / unit / role / tag, title search. Card actions: **Preview**,
**Teacher guide**, **Add to my library** (BK-2: added = ready to share).
A "From the Activity Bank" marker on copies in the teacher's own list.
`tags` gets the GIN index 0037 deferred to "the Bank's catalog RPC migration".

### BK-6. Preview before copying

- **Student view:** "Preview" opens `/a/:id` (already works for any signed-in
  user). Build-time check: a teacher pressing Check must not write
  `section_checks` rows into the author's results (verify `record_check`'s role
  gate; make preview read-only if needed).
- **Teacher guide:** a second definer RPC `get_bank_teacher_guide(id)`, teacher
  role only, listed + published only, returning just `teacherGuide` of the
  current version. Lets a teacher judge an activity before copying.

### BK-7. The course glossary for copies

Glossary marks carry a BAKED body (glossary design L3), so every definition
still shows in a copy. What a copy loses is the LIVE course glossary (search,
"In this activity"), because the lookup reads the copy owner's empty store.
**Recommendation:** `glossary_for_activity` falls back to the store of the
activity's `copied_from` owner when the copy's owner has no entry for a term.
Small, read-only, and keeps the glossary a single source. Alternative: accept
baked-only for copies (zero build, slightly poorer glossary panel).

### BK-8. What travels with the copy, and the answer-key question

The whole document: content, answer keys, solutions, misconception bindings,
rubrics, and the **teacher guide** (it was written for exactly this colleague,
D50). ⚠ The admission model lets anyone self-attest as a teacher with no
approver, so **a student who claims to be a teacher can copy an activity and
read its answer keys**. Today the same student can only see keys after a check.
Options: (a) accept it for free formative practice (the July ruling #4 posture);
(b) require caps-exempt status to copy (then the Bank is invite-only); (c)
withhold keys from copies until some later trust step. **Recommendation: (a)**,
with the risk stated, revisited if a school raises it or assessments (D51) are
ever listed: **never list a `type: quiz|exam` activity** (enforced by the
listing toggle).

### BK-9. When the author updates the original

Copies do not change when the author republishes. v1: provenance only; the
teacher's copy shows "From the Activity Bank (version N)". **Later, with a
trigger** ("the author republishes a fix that copies need"): a "newer version
in the Bank" notice offering a fresh copy (never a merge). Not in v1.

### BK-10. Attribution and licence

`users.display_name` is NULL by policy until the "how your name appears"
control exists (STATE backlog; author ruled opt-in). **Recommendation:** cards
say "Activity Bank" with no personal name in v1; a licence line on the Bank
header — the July red-team named **CC BY-NC-SA 4.0** (A6); re-confirm.

## Out of scope for v1

Listing by other teachers (BK-3 trigger), update notices (BK-9 trigger), paid
items (CLAUDE.md: no billing), run-in-place, ratings/reviews, public logged-out
browsing (a grant flip on `list_bank` later), co-ownership.

## Rough build

One migration: provenance columns, the GIN index on `tags`, `list_bank`,
`get_bank_teacher_guide`, `copy_bank_activity`, `set_activity_listing` (owner +
caps-exempt + published + not quiz/exam), verify rows incl. an RLS attack list
(a teacher can never read another teacher's draft, results or private
activity through any new RPC). App: `/bank` route, toggle + bulk listing,
"From the Bank" marker, preview wiring. Compliance pack: no personal data added
(provenance points at activities, not people). Push after the migration is
applied (OV-7).

---

## As built (2026-10-07)

- **Migration `0054_activity_bank.sql`**: provenance columns, three audit
  actions (`activity.bank_list` / `bank_unlist` / `bank_copy`; `audit_action`
  is an enum), `is_bank_lister`, `set_activity_listing`, `list_bank`,
  `get_bank_teacher_guide`, `copy_bank_activity` (inserts with the published
  content as draft, then calls `publish_activity`, so a copy is stamped like
  any publish), and the per-term glossary fallback. Assessments are refused at
  all three doors (list, browse, copy). `scripts/verify-0054.sql`: 4 posture
  rows + a 12-step behaviour block (the RLS attack list); mutation-tested by
  making the copy read the DRAFT (B8 went red).
- **Deviation, BK-4:** the listing toggle lives on the **Activities list**
  (per row, "List"/"Unlist", and per unit, "List unit in the Bank"), not beside
  Publish in the editor header — the unit action is the one the catalogue
  needs, and one place for both is simpler. A unit action touches only rows
  not already in the wanted state.
- **Deviation, BK-6:** the student-view preview renders in **print mode** inside
  the Bank page (`components/BankPreview.tsx`), not by opening `/a/:id`. Found
  while building: `check-activity` records a check under ANY signed-in caller
  (`check-activity-handler.ts:387`), so a teacher pressing Check on the
  author's activity would add rows to the author's Responses. Print mode has
  nothing to press, costs the student shell nothing (it lives in the teacher
  chunk), and uses the same sanitized document students get. The underlying
  gap is filed in TODOS.
- **The editor** shows a one-time note after "Add to my library": the copy is
  yours, already published, share it from My classes.
- **Not browser-verified before apply**: the dev server reads the live
  database, where 0054 is not applied, and local sign-in is Google-only. The
  database is proven by `verify-0054` (local), the UI by component tests
  (`Bank.test.tsx`, `Activities.test.tsx`).

