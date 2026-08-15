# Admission model — Google-only self-serve with a pending role (ENG-REVIEWED 2026-08-15)

**Status: ENG REVIEW CLEAR — build-ready. The ruled architecture is §5b (R1–R11);
it SUPERSEDES the morning's A1/A2/D-list where they conflict.** The arc of the
day, kept for the record: the author challenged S1's mandatory domain gate →
option C ruled → A1 (email+password + class code) and A2 (self-serve
attestation) ruled → the eng review's outside voice exposed A1's real cost
(Supabase's built-in mail cannot survive one classroom; the password path armed
a pre-creation attack) → **the author's own counter-proposal won: tie all
self-serve account creation to Google (more providers later), admit unknowns as
a contained `pending` role, and finish enrollment through audited RPCs whose
error text actually reaches the UI.** The morning's email+password mechanism
was never built and is now a demand-triggered follow-on, not the floor.

The D24 counsel read is scheduled BETWEEN the drops (gates Drop 2 — teacher
self-serve going live), per the review's OV-8 ruling.

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

## 5b. THE RULED ARCHITECTURE — R1–R11 (eng review, 2026-08-15; supersedes §5a where they conflict)

**R1 — Admission: the trigger admits, and the only self-serve door is OAuth.**
`handle_new_auth_user` keeps its two fast paths verbatim (allowlist → teacher;
`student_domain` → student; precedence allowlist > domain, trivially safe now)
and gains ONE new terminal branch: any other Google signup is admitted as
**`role='pending'`** instead of refused. No email+password path exists in the
app; adding Microsoft/other providers later is configuration, not architecture.
(Supersedes A1's email+password mechanism and the whole password-path
precedence question — there is no password path to attack. The morning's
"2B follow-on" note is RESOLVED: this IS the create-then-onboard shape,
arrived at with a contained role instead of a blank account.)

**R2 — `redeem_join_code(p_code)` — the student promotion.** Audited DEFINER
RPC, callable by `pending` only: validates the class (exists, not
soft-deleted, `expected_domain` vs caller email — keeping `join_class`'s
existing disclosure shape, which names the domain to a signed-in, code-holding
caller; 0014 precedent), then **promotes to student and joins in one
transaction, with `join_class` remaining the single `class_members` writer**
(the promotion happens first; the join call runs under the new role). E-7/E-8
contract: RAISE LOG before every refusal; distinct strings — and because this
is a plain RPC, **the raise text reaches the client** (the GoTrue-swallowing
problem the morning's 1A machinery existed to work around is gone; the
pre-auth `/join/<CODE>` meta lookup (T7) stays exactly as it is).

**R3 — `claim_teacher(p_attestation_version)` — the teacher promotion.**
Audited DEFINER RPC, `pending` only: writes `educator_attested_at/_version`
(riding `POLICY_VERSION`, the 3.1C pattern; D6's columns, now written by an
RPC that can enforce rather than a trigger that cannot), promotes to teacher.
**Attested (non-allowlist) teachers are structurally capped: 5 classes, 50
members per class** (OV-9; enforced in the audited create/join paths;
allowlist teachers uncapped via a `teacher_caps_exempt` flag; lifting a cap is
an author action). A fraudulent anchor harvests at most one classroom-shaped
blast radius while the audit rows light up.

**R4 — Pending containment is proven, not assumed.** Every capability check
already keys on `role='teacher'` or `role='student'`, so `pending` is excluded
by construction — and the verify matrix gains a containment row per capability
(authoring policies, `join_class`, `check-activity`, class RPCs, roster reads)
proving it. **The ONE deliberate widening, author-accepted:** a pending
account can read link-shared published content under S2's "any authenticated
user" rule — continuity with the R2 link-share model S2 was built on; stated
plainly in the compliance amendment. Checks, classes, rosters, and all student
data stay behind real roles.

**R5 — The flow.** `/join/<CODE>`: pre-auth meta (exists) → `signInWithGoogle`
(exists) → pending lands back on the code page → auto-`redeem` replaces the
old auto-join → success/refusal states with REAL error text. A bare pending
sign-in (no code) lands on an E-11-style onboarding state: "have a class
code?" + "I'm a teacher" → attestation → `claim_teacher`. Idempotent on
re-entry; double-submits die on the pending-only guard.

**R6 — Strings.** Both RPCs' refusal strings + LOG prefixes join
`authContract.json` and its pin test (4A) — and they are now user-visible, so
the pin test guards real UI copy, not just server logs (the P9 vacuity note
resolves itself).

**R7 — Codes.** `generate_join_code` upgrades to `gen_random_bytes` selection
(3A). The numbers, pinned: 6 chars × 31-char confusable-excluded alphabet ≈
887M, unique-indexed; the old `(random()*30)::int+1` bias dies with the
upgrade. Brute-force surface: authenticated-only redemption (a failed guess
costs an audited, logged RPC call on a real Google account) + the pre-auth
meta limiter in front.

**R8 — Retention.** Never-redeemed pending accounts hold email + provider
name only; the 0025 dormancy clock covers them from account age (verify row
added), and the compliance amendment states their status in one sentence.

**R9 — The matrix, re-derived (~26 rows).** Trigger: allowlist / domain /
pending / precedence (4). Redeem: valid / bad code / deleted class / domain
mismatch / non-pending caller / double-call (6). Claim: attested / missing
attestation / non-pending / both caps firing at their production values (4).
Containment: pending × five capabilities (5). UI: join-flow states (4) +
onboarding states (3). Integration lane: full real-trigger redeem round trip,
refused redeem, claim + cap liveness, and the **P3 classroom-burst row — 30
sign-ins + 30 redeems from one IP at production limiter values** (4). The
lane's email+password harness still works unchanged: those signups land
`pending` and exercise the same RPCs the app calls.

**R10 — Drops and gates.** Drop 1: `pending` + `redeem_join_code` + the join
flow (students; usable by the author's own classes immediately). Drop 2:
`claim_teacher` + caps + attestation UI + the D8 compliance amendment —
**gated on the D24 counsel read** (OV-8: lawyered before strangers' student
data arrives). OV-7 considered and declined: no server-side signup function
(no new anonymous service-role surface; GoTrue's abuse protections stay).

**R11 — Why accounts-first and not the guest tier first** (OV-10c, one
sentence): the author's own classroom — the only live user — needs persistent
identity for grading and retention, so the account path ships first; the guest
tier remains the named follow-on for stranger try-it traffic.

## 5a. The D-list — remaining decisions under A1/A2 (drafted 2026-08-15 morning; SUPERSEDED where §5b conflicts — kept for the ruling record)

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
`require_domain` district under C). *(Post-review note: gate 4 stays
unchanged under §5b too — the domain fast path is untouched.)*

## 7. NOT in scope (considered and deferred, eng review 2026-08-15)

- **Email+password signup** — the morning's A1 mechanism; superseded by R1.
  Returns only on demand evidence (a student population without Google
  accounts). Carries the SMTP/confirmation/reset cost bundle when it does.
- **Additional OAuth providers (Microsoft/Entra)** — config-level follow-on;
  already sequenced in the backlog's IdP map (Azure → Clever/ClassLink → LTI).
- **The guest tier** (anonymous join-code play) — named follow-on, R11's one
  sentence records why it is second.
- **Under-13 support** — D7 stands: the per-class 13+ assertion carries COPPA;
  birthdate gate + school-consent enrollment is its own arc.
- **DPA template / district paperwork** — D8 ships the consent amendment only;
  the signable DPA waits for the first district that asks (with counsel).
- **Cap-lifting admin surface** — author lifts `teacher_caps_exempt` by SQL;
  a UI waits for the second real teacher.
- **CAPTCHA on redemption** — the authenticated-RPC cost + audit trail is the
  v1 defense; revisit only if abuse telemetry appears.

## 8. What already exists (the review's reuse inventory)

Reused verbatim: the T7 pre-auth `/join/<CODE>` meta lookup + limiter ·
`signInWithGoogle` + redirect plumbing · `join_class` (stays the only
`class_members` writer) + its E-7/E-8 contract · `expected_domain` + its
audited edit path (0014/0027) · the 3.1C attestation column pattern ·
`authContract.json` + pin test · the verify:auth runner · the integration
lane's email+password-through-the-real-trigger harness · 0025's dormancy
derivation · E-11 empty-state pattern · the audit_log writers. Built new:
one trigger branch, two RPCs, two cap checks, one onboarding UI state,
~26 verify/e2e rows, the compliance amendment. Nothing is rebuilt that
existed.

## 9. Failure modes (per new codepath; test / handling / visibility)

| Failure | Test | Handling | User sees |
|---|---|---|---|
| Code regenerated between meta and redeem | R9 redeem row | RPC refuses, text delivers | "Code no longer valid — ask your teacher" |
| Class deleted between meta and redeem | R9 row | same | same |
| Domain-restricted class, wrong account | R9 row | RPC refuses, names domain (0014 shape) | "This class is limited to @X accounts" |
| Pending user abandons mid-onboarding | R9 idempotency row | re-entry lands same state | onboarding screen again |
| Double-submit redeem/claim | R9 rows | pending-only guard refuses 2nd call | success state (1st) |
| Classroom burst trips a limiter | **P3 liveness row at prod values** | limits configured for 30+/IP | nothing (that's the test's job) |
| Trigger failure during OAuth callback | existing E-7 frames | callback error parsing (S9-prep) | sign-in-failed frame |
| Pending account never redeems | R8 retention row | 0025 dormancy from account age | n/a (purged in time) |

No silent failure survives the table: every row has a test AND handling AND a
visible outcome. **Critical gaps: 0.**

## 10. Worktree parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| S1: migration 0033 (pending role, RPCs, caps, code-gen v2) + verify rows | supabase/ | — |
| S2: onboarding UI + redeem flow + RTL/e2e | packages/app/ | S1 (RPC names/strings via authContract) |
| S3: compliance amendment (D8) | docs/compliance/ | — (content-independent of code) |

Lane A: S1 → S2 (sequential — S2 derives from S1's contract). Lane B: S3
(independent, parallel with everything). Launch A and B together; Drop 2's
counsel gate (R10) sits between S1/S2 landing and claim_teacher going LIVE.

## Implementation Tasks

Synthesized from this review's findings. Run with Claude Code; checkbox as you ship.

- [ ] **T1 (P1, human: ~1.5d / CC: ~45min)** — supabase — Migration 0033: `pending` in the role CHECK, the R1 trigger branch, `redeem_join_code`, `claim_teacher` + caps + `teacher_caps_exempt`, attestation columns, `generate_join_code` v2 (crypto)
  - Surfaced by: R1–R3, R7 (findings 2A→reshape, 3A, OV-9)
  - Files: supabase/migrations/0033_*.sql, supabase/config.toml (none — no function changes)
  - Verify: rolled-back live rehearsal (the 0029/0030 discipline), then `supabase db reset` local
- [ ] **T2 (P1, human: ~1d / CC: ~30min)** — scripts — verify-0033: the ~26-row matrix incl. containment rows, cap liveness at production values, the P3 classroom-burst row, retention row
  - Surfaced by: R4, R9 (finding 5A expanded, OV-2, OV-5)
  - Files: scripts/verify-0033.sql, scripts/tests runner registration
  - Verify: `pnpm verify:auth --target local` green on a rebuilt DB
- [ ] **T3 (P1, human: ~1d / CC: ~40min)** — app — the onboarding state + redeem flow on `/join/<CODE>` and Home; authContract strings for both RPCs + pin-test extension
  - Surfaced by: R5, R6 (findings 1A→R5, 4A)
  - Files: packages/app/src/routes/JoinClass.tsx, Home.tsx, lib/authContract.json, __tests__/authContract.test.ts
  - Verify: RTL rows + the student e2e lane; OV-7's declined alternative means NO new Edge Function anywhere
- [ ] **T4 (P2, human: ~0.5d / CC: ~20min)** — integration lane — real-trigger redeem round trip, refused redeem, claim+caps, burst liveness
  - Surfaced by: R9 integration rows
  - Files: packages/app/e2e/integration/integration.e2e.ts, contract.ts
  - Verify: `pnpm --filter @activity/app test:e2e:integration` 7/7 (3 existing + 4 new)
- [ ] **T5 (P2, human: ~0.5d / CC: ~30min)** — compliance — the D8 amendment: enrollment-=-consent (Gimkit shape), operator direct notice, the S2-widening sentence, the pending-retention sentence
  - Surfaced by: D8, R4, R8 (OV-5, OV-S2)
  - Files: docs/compliance/privacy-policy.md, data-map.md, retention-policy.md; lib/policyVersion.ts bump
  - Verify: retention-windows pin test; the pack's drift guards
- [ ] **T6 (P3, human: ~1h / CC: ~10min)** — docs — STATE/backlog pointers: 2B-follow-on merged-as-adopted, email+password to NOT-in-scope, counsel gate on Drop 2
  - Surfaced by: R10, §7
  - Files: STATE.md, docs/design/admission-model.md
  - Verify: drift-audit clean

_No new tasks from the Performance section._

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | (not installed; Claude subagent served as outside voice) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 14 issues, 0 critical gaps — 5 review findings + 9 outside-voice findings, all ruled |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (2026-08-13, S9 Drop 2 — predates this plan; onboarding states will need their own pass) | score 4→9, 16 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** The outside voice (fresh-context Claude subagent) overturned two same-day rulings (D4's built-in mail, 5A's precedence) and challenged one (1A's shape, kept on review counter-argument). Its SMTP finding + the author's Google-only counter-proposal produced the §5b reshape — the review's eureka: five findings deleted by one architecture change rather than five patches.
- **VERDICT: ENG CLEARED — ready to implement (T1–T6; Drop 2 gated on the D24 counsel read per R10).**

NO UNRESOLVED DECISIONS
