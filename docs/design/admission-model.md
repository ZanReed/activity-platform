# Admission model — the teacher-anchored signal (recorded 2026-08-15)

**Status: DESIGN SIGNAL, not a ruling.** The author challenged S1's mandatory
domain gate (2026-08-15) and, after the competitor/regulatory analysis below,
picked **option C (per-class/per-district domain requirement, teacher-anchored
default)** as the preferred direction. This amends nothing yet: it is the input
to a future design + eng review, because it re-rules S1's admission model — the
trigger, the 0027 hardening, the verify-auth suite, and the compliance pack all
sit on the current gate. **Trigger for that pass: the free-catalog arc kickoff
or the first external teacher, whichever lands first.**

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

## 6. What this signal does NOT do

It does not change the trigger, the verify suite, the compliance pack, or
gate 4 (seeding the author's own district under the CURRENT model proceeds
unchanged — C is additive to it, and the author's district would simply be a
`require_domain` district under C).
