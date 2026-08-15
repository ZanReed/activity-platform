# Admission model — teacher-anchored admission (direction RULED 2026-08-15)

**Status: DIRECTION RULED — design pass IN PROGRESS; not yet build-ready.**
The author challenged S1's mandatory domain gate, picked **option C**
(teacher-anchored default, domain requirement as a per-class/district option),
and after the round-1/round-2 re-derivation below ruled the two anchor
decisions (2026-08-15):

- **A1 — Admission point: email+password student signup carrying a class
  code** (the five-for-five verified industry floor). The code rides in
  `raw_user_meta_data`, where `handle_new_auth_user` already reads — admission
  stays at signup, deny-by-default, one choke point. District students keep
  Google SSO (the platform's DeltaMath-INTEGRAL-equivalent tier).
- **A2 — Teacher signup: self-serve with attestation** (the Gimkit posture,
  paired with `docs/compliance/school-authorization-template.md`). The teacher
  account becomes the trust anchor.

**D-list RULED "all yes" (author, 2026-08-15) — next: the eng review.** The compliance-pack amendment is
load-bearing, not paperwork — A1/A2 change the consent story the pack tells,
which is also why the D24 counsel read is deliberately HELD until this lands
(reviewing the pre-A1 pack would buy a review that has to be repurchased).

Provenance: the author's challenge ("this feels like a bad system now and an
impossible system later"), a three-round analysis, and a `/browse` verification
pass over the competitors' live policies (2026-08-15). Quotes below are from
the pages read that day; each names its source.

---

## 1. What today's gate is, and what it actually protects

S1 (DECISIONS → "Student identity S1", 2026-07-28): `handle_new_auth_user`
admits exact-allowlist emails as teachers, `student_domain` matches as
students, and **rejects everyone else**. The gate's real function is not
identity hygiene — it encodes the **school relationship** that makes the
platform's whole consent posture work:

- **COPPA**: collecting personal information (name, email, persistent
  identifiers) from under-13s needs verifiable parental consent — *unless a
  school consents on parents' behalf, for educational use only*. The school
  relationship is the load-bearing element of that exception.
- **FERPA**: student work tied to identity = education records; schools may
  share them only with vendors acting as "school officials" under school
  control — practically, signed DPAs at district scale.
- **State law**: Illinois SOPPA, NY Ed Law 2-d and siblings **require signed
  per-district agreements** for school-directed services. The per-school
  "clunk" the author objected to is partly statutory — no design escapes it
  for persistent student accounts; incumbents staff for it.

What the platform holds that triggers all of this: identified minors
(school email + Google identity), longitudinal academic records (every check:
answers, correctness, attempts, timestamps, class membership), and **free-text
student content** (`short_answer`/`essay`/`self_explanation` — an open text
box cannot be data-minimized).

## 2. What the incumbents actually do (verified 2026-08-15 via /browse)

**DeltaMath — the login-only comparator. Teacher-anchored enrollment, no
domain gate.**
- deltamath.com/students, verbatim: *"You'll need a class code to create an
  account."* A student account cannot exist outside a teacher's class.
- deltamath.com/terms-policies: data *"governed by agreements with the school
  or district, as well as relevant laws like FERPA and COPPA, and relevant
  state laws, including, but not limited to, SOPPA and New York State Ed Law
  2-D."* Separate children's policy for the consumer "For Home" tier: no
  under-13 accounts *"without parental consent"* (parent-account model).
- deltamath.com/teachers-schools: Clever/ClassLink/Google Classroom/Canvas
  SSO + rostering + grade passback are **INTEGRAL (paid district license)
  features** — managed identity is the upgrade, not the admission floor.

**Blooket — the two-tier pattern.** (Policy of 2025-07-28, read via the
Internet Archive's 2026-01-08 snapshot; blooket.com itself sits behind a bot
check that was not bypassed.)
- Anonymous tier, verbatim: *"Blooket Visitors are parties invited to play a
  game or engage in homework by a registered user or school. The primary
  information collected from Visitors is a username of their choice."*
- Account tier, verbatim: *"if you or your school decide to utilize the
  Service with children under 13, you will be electing to either obtain
  parental consent or to consent on behalf of the children's parents directly,
  which is commonly referred to as 'school consent.'"* Note Blooket **pushes
  the consent obligation onto the educator**: *"the school will be responsible
  for obtaining any necessary parental consent."* (Read §3 before copying
  that posture.)

**Gimkit — teacher-anchored consent, in writing.** (gimkit.com/privacy,
2022-04-04 policy.)
- Front and center: *"Students don't need accounts. Students can participate
  in Gimkit without signing up… they're always optional."* And: *"FERPA,
  COPPA, Ed-Law 2D Compliant"*; 100% subscription revenue, no ads, no data
  sales.
- The mechanism, verbatim: class enrollment exists *"to allow Educators to
  provide parental consent for Students younger than thirteen"* and *"By
  enrolling a Student under 13 to use the Service using our Classes system,
  the School provides such consent to Gimkit."* Student accounts collect
  **first name + last initial** — deliberate minimization.

**Unverified but corroborated:** the claim that these vendors sign
per-district DPAs at scale (SDPC registry) was not crawled; DeltaMath's own
terms ("agreements with the school or district") and the Ed-Law-2-d/SOPPA
name-drops corroborate it from the vendor side.

**Round 2 (2026-08-15, author asked for Desmos + Khan before ruling on the
admission point):**

- **Desmos Classroom (now Amplify):** `student.desmos.com` →
  `student.amplify.com/join` — the student entry page IS a 6-digit code box
  (verified by driving it: six digit inputs, an optional "Log in" button,
  nothing else). Join-code-first, account-optional — the purest guest tier in
  the set.
- **Khan Academy:** learner signup is `/signup/learner/birthday` — a **date
  of birth gate before anything else** ("First, we need your date of birth"),
  then the auth methods. The signup was not driven past the gate (no
  fabricated birthdate); the mechanism behind it is in their Children's
  Privacy Notice, verbatim: *"…seeking the consent of a parent or legal
  guardian ('Parent') for creation of that account. When Khan Academy is used
  by a School in an educational setting, we rely on the School to provide the
  requisite consent, on behalf of the Parent."* Age-gated self-signup with a
  parent-consent branch for independents, school consent for school users.

**The two patterns that hold across ALL FIVE platforms (Desmos, Blooket,
Gimkit, DeltaMath, Khan):**

1. **None is OAuth-only for students, and none uses domain-gating as the
   admission floor.** Email+password student signup exists everywhere
   accounts exist; domain/SSO identity appears only as the paid district
   tier (DeltaMath INTEGRAL). The proposed email+password-plus-class-code
   signup is not merely "like DeltaMath" — it is the only admission floor
   any of the five uses for login-required use.
2. **The class code is the universal enrollment anchor** — without accounts
   (Desmos/Blooket/Gimkit), at signup (DeltaMath), or joining a teacher
   (Khan). Under-13 legality rides school consent "on behalf of the parent"
   in every school-facing policy that addresses it (Gimkit's and Khan's
   wording are near-identical).

## 3. The enforcement precedent — FTC v. Edmodo (2023), read precisely

Verified via Wikipedia (ftc.gov blocks automated reads): **$6M civil penalty
(suspended for inability to pay), May 2023, followed by a permanent
injunction** — for collecting children's data without consent and, in the
FTC's own framing, *"for unlawfully outsourcing its COPPA compliance
responsibilities to schools."* Edmodo also used the data for advertising,
which school consent can never cover (educational purpose only).

**The precise lesson, and it shapes option C:** teacher-anchored enrollment is
NOT the violation — Edmodo's violation was (a) shoving consent duties onto
schools/teachers **without the operator carrying its own duties** (direct
notice of what is collected and why, data minimization, education-only use)
and (b) commercial reuse. The teacher-anchored model survives enforcement when
the operator's side of the bargain is real. This platform's existing posture —
no ads, no data sales, aggressive retention windows, minimal fields, the
compliance pack — is already shaped like the surviving half. Blooket's
"the school is responsible" clause is the *risky* template; Gimkit's
"enrollment through Classes = the school's consent, and here is our notice"
is the defensible one. **Copy Gimkit, not Blooket.**

## 4. The option space (author reviewed all three, 2026-08-15)

- **A. Mandatory domain gate** (today): strongest posture; adoption floor is
  "the author seeds a row per district." Kills random adoption by design.
- **B. Teacher-anchored admission (DeltaMath-shape):** a valid class join
  code suffices; domain checks gone. Industry-proven for login-only platforms;
  carries the standard school-consent gray zone.
- **C. Per-class/per-district domain toggle — ✅ AUTHOR-PREFERRED
  (2026-08-15):** teacher-anchored by default; a class (or a seeded district)
  can *require* domain match. Districts that want managed identity get
  exactly what exists today; a random teacher elsewhere needs no seeding.
  DeltaMath's free-vs-INTEGRAL split, expressed in this schema.

**Why C is small in this codebase:** classes, join codes, `/join/<CODE>`, the
per-class 13+ assertion, containment, audited membership, and retention all
exist. The delta is roughly: a `require_domain` flag (per class or per
district), the trigger admitting a student when a valid join context exists
OR the domain matches a required one, and the E-9 refusal screens gaining the
"this class requires a school account" branch.

## 4a. Design pass, round 1 — re-derived against shipped reality (2026-08-15, P10)

The signal above was written from the DECISIONS record. Re-deriving it against
the live schema and the app changed two things materially — both in the
direction of "smaller than described, but blocked on a question nobody asked."

**FINDING 1 — half of option C already exists and is live.**
`classes.expected_domain` (0014, hardened by 0027 with a dotted-domain CHECK and
an audited `update_class_domain` edit path) is exactly the per-class domain
requirement option C proposes, and `join_class` already enforces it with its own
refusal: *"This class is limited to % accounts."* Nullable = no restriction.
So the "per-class toggle" half is **built, live, and audited** — the signal's
"needs a `require_domain` flag" framing was wrong. What `expected_domain` does
NOT do is admit anyone: it only narrows which class an ALREADY-ADMITTED student
may join.

**FINDING 2 — the real blocker is the OAuth callback, not a missing flag.**
`handle_new_auth_user` fires during the OAuth callback and sees only
`new.email` + `new.raw_user_meta_data`. `/join/:code` passes `redirectTo = this
URL`, so the code survives the round trip **as a redirect target — invisible to
the trigger.** At the moment admission is decided, there is no join context to
read. So "a valid join code suffices for admission" is not a one-condition edit;
it requires choosing where admission happens.

**FINDING 3 — the unasked question this exposes: is student sign-in staying
Google-OAuth-only?** DeltaMath-shape ("register with a class code") is natively
an **email+password** signup, where `signUp({ options: { data: { join_code }}})`
lands the code in `raw_user_meta_data` — which the trigger CAN read. The
database already supports this path (the S9 integration lane creates users via
email+password through the real trigger, incl. the refused outsider); the app
does not (zero password call sites in `packages/app/src` — OAuth only). So the
admission model and the authentication method are the same decision wearing two
hats, and the signal doc treated them as independent.

**Live baseline at the pass (2026-08-15):** allowlist 5 rows (lowercase
constraint on, 0 mis-cased — the gate-4 demotion hazard is disarmed), 3
teachers, **0 students**, 1 class, 0 memberships, `student_domain` 0 rows.
Nothing is in production use yet, so the migration cost of any option here is
near zero — this is the cheapest moment this decision will ever have.

## 5. What the future design pass MUST cover (not exhaustive)

1. **Teacher admission is the bigger unlock and the bigger risk.** Teachers
   are allowlist-only today — option C is meaningless for adoption while that
   holds. Opening teacher signup makes the *teacher account* the trust anchor
   (DeltaMath's bet): decide the verification bar (self-attestation? school
   email heuristics? none?) and what a hostile "teacher" can reach.
2. **The Edmodo duties land operator-side:** the enrollment-=-consent
   mechanism needs the direct notice text (what is collected, why,
   education-only), a data-minimization pass on the student row, and the
   compliance pack rewritten around school-consent (the current pack's 13+
   assertion sidesteps under-13 entirely; C should decide whether under-13
   stays excluded or gets the Gimkit-style consent mechanism).
3. **The 0027 interplay:** the mis-cased-teacher-becomes-student defect class,
   the audited RPC surface, and `verify:auth`'s admission matrix all assume
   deny-by-default. Every row of that matrix gets re-derived under C.
4. **The 13+ assertion stays load-bearing** for classes without under-13
   consent; its per-class unchecked-by-default UX carries over.
5. **DPA readiness, not DPA avoidance:** first real district adoption will
   demand paperwork regardless of gate design (state law). A signable DPA
   template + the D24 counsel read are the actual gates to scale.
6. **Related, separate: the guest tier** (Blooket/Gimkit's anonymous path —
   join code + nickname, nothing identified persisted). Near-zero regulatory
   surface, the natural try-it loop. S9 demolished the *old* anonymous wire
   as test-artifact cleanup, not as a verdict on guest checking; a designed
   guest tier would be its successor, and is its own arc.

## 5a. The D-list — remaining decisions under A1/A2 (drafted 2026-08-15, each needs the author's yes/no)

- **D1 — The trigger ADMITS, it never JOINS.** The join-code branch validates
  the code (class exists, not soft-deleted, `expected_domain` satisfied) and
  mints `role='student'` — then the existing client-side `join_class` runs
  after first sign-in, exactly as it does today for domain students.
  Rationale: `join_class` stays the ONLY write path into `class_members`
  (0027's invariant); an admit+join trigger would be a second, unaudited
  writer. Refusal on a bad code reuses the E-7 contract (RAISE LOG before the
  raise; distinct string).
- **D2 — `expected_domain` is checked at ADMISSION for code-signups, and
  stays checked at join.** *(Author asked how DeltaMath validates joins;
  verified from their help docs 2026-08-15: on the individual tier they do NO
  domain validation — the 8-character code is the entire gate ("Register
  Students with a Code… the 8 character [code]"), with post-hoc teacher
  roster curation; "domain" appears zero times in their registration/settings
  docs. Integrations at the district tier REPLACE the code flow with roster
  membership. So the code+curation default here matches their individual
  tier exactly — the platform already has the curation loop
  (list_class_members + DR-5 remove + regenerate) — and expected_domain is
  an optional tightening no competitor's individual tier offers.)* A class that requires a district domain refuses
  the code-signup outright (the student never gets an account they cannot
  use); the join-time check stays as the second lock. This is the full
  option-C semantics using the column 0014 already built.
- **D3 — The signup UI lives on `/join/<CODE>`** as a "create an account"
  branch beside the existing Google button, code pre-filled from the URL.
  No standalone /signup route: a student account with no class is a thing
  D1 makes impossible to want.
- **D4 — Email confirmation ON, password reset via Supabase's built-ins.**
  School filters may eat mail — the failure mode is visible (student says
  "no email"), the E-11-style empty state names the fix (ask the teacher /
  retry). No custom SMTP until it actually hurts.
- **D5 — Join-code entropy gets re-derived before codes become bearer
  admission tokens.** Today a code leaks only a class name (rate-limited
  meta); under A1 it admits an account. Decide length/alphabet + the
  limiter's window against brute force as an eng-review item with numbers.
- **D6 — Teacher attestation is stored like the age assertion:** columns on
  `users` (`educator_attested_at/_text_version`), NOT NULL for self-serve
  teachers, rides `POLICY_VERSION`. Allowlist teachers keep NULL (they
  predate the mechanism and the author vouched for them directly).
- **D7 — Under-13 stays EXCLUDED in v1.** The per-class 13+ assertion
  continues to carry COPPA (no parent/school consent mechanics built yet);
  the Khan-style birthdate gate and school-consent enrollment are a named
  follow-on, not part of this slice. The compliance pack says so plainly.
- **D8 — The compliance-pack amendment ships IN the same slice** (not
  after): the Gimkit-style enrollment-=-consent story, the operator-side
  direct notice (what is collected, why, education-only), and the D24
  counsel read is scheduled AFTER this lands.
- **D9 — verify:auth grows an admission matrix for the new branch** (code
  admits / bad code refuses / expired class refuses / expected_domain
  refuses / domain path unchanged / allowlist path unchanged), and the
  integration lane gains the code-signup round trip — it already creates
  email+password users through the real trigger, so the harness exists.

## 6. What this signal does NOT do

It does not change the trigger, the verify suite, the compliance pack, or
gate 4 (seeding the author's own district under the CURRENT model proceeds
unchanged — C is additive to it, and the author's district would simply be a
`require_domain` district under C).
