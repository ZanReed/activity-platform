# Counsel / district review packet — gate D24

> **Prepared for the author to hand to counsel. NOT legal advice, and not a
> substitute for the read it asks for.** Assembled 2026-08-15 against shipped
> reality (live migrations, live Edge Functions, live row counts), not against
> the project's own status notes.

This packet exists because the compliance pack has never had legal review and
every file in it is marked DRAFT. It does two things: says exactly what changed
since the last time the pack was stable, and asks the specific questions whose
answers change what gets built next.

---

## 1. What is being reviewed

| File | What it is |
|---|---|
| `privacy-policy.md` | The student/parent-facing notice. Carries the in-product `POLICY_VERSION`, currently `2026-08-15-draft-3` |
| `data-map.md` | Every personal-data column, its source, purpose, and retention |
| `retention-policy.md` | The windows, what enforces them, and what is still intent rather than behavior |
| `school-authorization-template.md` | What a school signs / a teacher confirms |
| `README.md` | The pack's own framing |

The in-product string a teacher's attestation is recorded against is
`POLICY_VERSION` in `packages/app/src/lib/policyVersion.ts`. It is stamped onto
every class's 13+ assertion and every self-serve teacher's educator confirmation,
so it is the version that has legal meaning in the data, whatever the individual
documents' own headers say (see Q8).

## 2. Posture in one paragraph

Single operator, no ads, no data sales, no third-party analytics. Students sign
in with Google only; the platform holds school email, an optional display name,
class membership, and schoolwork (answers, scores, attempt counts, timestamps),
including free-text answers that cannot be data-minimized. Consent rides the
school relationship: a teacher enrolls a class and confirms both that every
student is 13 or older and that their school authorizes the use. Retention is
enforced by a live nightly job, not by intent. The anonymous submission path,
its IP hashes, and all of its rows were deleted outright in August 2026.

## 3. What changed since the last stable version (`draft-2`, 2026-08-07)

One architectural change drives all of it: **self-serve admission** (migration
0033, live 2026-08-15). Before it, an account could exist only if the operator
had pre-authorized the email or the district domain. Now anyone with a Google
account can sign in.

**3.1 A person can now hold an account before any teacher has vouched for them.**
Unknown Google sign-ins are admitted into a contained `pending` role that holds
no access — it cannot open a class, join one, submit work, or see any roster.
Such an account stores an email address and the Google identity link, nothing
else. It becomes a student only by entering a teacher's class code.
*(`privacy-policy.md` → "How you get an account"; `retention-policy.md` →
"Accounts that never joined a class".)*

**3.2 Teachers can now set themselves up by attestation.** A self-serve teacher
confirms they are an educator authorized by their school, and that confirmation
is recorded with the date and the policy version they saw
(`users.educator_attested_at` / `_version`). There is no verification of the
claim beyond the confirmation itself. Self-serve teachers are structurally
capped at 5 classes and 50 members per class; operator-added teachers are exempt
via `users.teacher_caps_exempt`. *(`data-map.md` table; Q2 below.)*

**3.3 A disclosure the operator chose to state plainly rather than bury.** A
signed-in account with no class can open an activity if a teacher shares its
link directly — activity content is readable by any signed-in user holding the
link, carried over from when activities were published as public web pages.
Student work is not: answers, scores, rosters and membership remain visible only
to the student who wrote them and their teacher.
*(`privacy-policy.md` → "One thing worth being plain about"; Q3 below.)*

**3.4 Two retention items closed by data removal, not by mechanism.** The
`ip_hash` / `user_agent` abuse fields had a stated 30-day window with no scrub
job ever built. The path that wrote them was demolished in August 2026: all rows
wiped, the write path dropped, nothing can create new ones. The window is now
moot rather than enforced. *(`retention-policy.md` table.)*

**3.5 Never-joined accounts fall under the existing dormancy window.** 400 days,
derived from account activity rather than a stored flag, purged by the same
nightly job. No separate mechanism.

## 4. The current live position, stated plainly

The author should not let this be discovered mid-conversation:

- **Teacher self-serve is OPEN right now.** The original plan gated it on this
  counsel read. Migration 0033 shipped both promotion paths together and the UI
  ships both doors, so applying the migration opened teacher self-serve at the
  same moment as student admission. **The author reviewed and accepted this**
  (the site is unadvertised, the caps bound any single bad actor, and the read
  was intended soon regardless). It is an accepted risk, not an oversight — but
  it means the read now covers live behavior rather than a pending change.
- **Live data as of 2026-08-15:** 3 teacher accounts (all operator-added), **0
  students**, 1 class, 0 class memberships, no district domain seeded. No real
  student data exists yet. This is the cheapest possible moment to change any
  answer below.
- **Nothing is advertised.** No marketing, no listing, no external users.

## 5. Questions for counsel

Each names the platform's current position, so counsel can confirm or correct
rather than start from scratch.

**Q1 — Is teacher-anchored enrollment as implemented an adequate school-consent
mechanism?** Current position: a teacher enrolling a class, confirming 13+ and
confirming school authorization, is what permits collection from students, on the
school's behalf, for education only. Modeled on the "enrollment through our
Classes system = the school provides consent" wording used by comparable
platforms. The operator deliberately carries its own duties (direct notice, data
minimization, education-only use) rather than assigning them to the school — the
distinction the FTC drew in its 2023 Edmodo action, where the violation was
outsourcing COPPA responsibilities to schools while also using the data for
advertising. **Does the implementation carry that weight?**

**Q2 — Does an unverified educator attestation carry the authorization it
asserts?** Today anyone with a Google account can confirm "I am an educator
authorized by my school" and immediately create classes and read the email
addresses of students who join. There is no school-email check, no domain
requirement, no manual approval. The mitigations are the caps (5 classes / 50
members), a full audit trail, and the fact that a fraudulent teacher must
persuade real students to enter their class code. **Is attestation alone
defensible, and if not, what is the minimum bar — school-email heuristics,
manual approval before the first class, or something else?**

**Q3 — Is the link-shared-content disclosure handled correctly?** Any signed-in
account, including a role-less one, can open teacher-authored activity content
via a direct link. This is teacher-authored material, not student data, and the
policy states it plainly. **Is stating it sufficient, or does it need consent
treatment, a permissions change, or different placement?**

**Q4 — Is the per-class 13+ assertion a defensible basis for excluding
under-13s?** The platform declines under-13 use entirely in this version. The
only mechanism is the teacher's per-class confirmation — students are never
asked their age and no birthdate gate exists. **Is teacher assertion an adequate
basis, or is a student-facing age gate required?** If the answer is that
under-13 support needs the full school-consent mechanism, that is a separate
build we have deliberately not started.

**Q5 — On what basis is a pending account's data held?** Before any teacher has
vouched for them, the platform holds a person's email address and Google
identity link. If that person is a student, the school-consent chain has not yet
attached. **Is holding it under the same basis correct, does it need its own
notice, or should un-redeemed accounts be purged on a much shorter clock than
400 days?**

**Q6 — Are the retention windows acceptable?** Student work 400 days from the
end of the last class membership; accounts 400 days of dormancy; explicit
deletions 30 days; audit log 2 years, with the actor's identity nulled on purge
so the security event survives without naming a person. One known gap, disclosed
in place: **nothing purges class rows today**, so a class row and its assertion
record are retained indefinitely (conservative for a compliance record, but an
intent rather than a behavior). **Are these defensible, and is the class-row gap
acceptable to leave as-is?**

**Q7 — Which state regimes attach, and what paperwork is needed before the first
real classroom?** Illinois SOPPA, NY Ed Law 2-d and their siblings require
signed per-district agreements for school-directed services. No DPA template
exists yet; the plan is to draft one with counsel when the first district asks.
**Is that sequencing right, or should a signable template exist before the first
outside teacher?**

**Q8 — How should the pack be versioned and dated?** Three inconsistencies to
resolve: the privacy policy carries `POLICY_VERSION 2026-08-15-draft-3`, while
`data-map.md` and `retention-policy.md` carry their own independent draft
numbers with older dates; the effective date is an unfilled placeholder
(`⟨date⟩`); and the operator's legal name and contact email are placeholders
(`⟨legal name / contact email⟩`). The in-product string stamped onto every
attestation is `POLICY_VERSION`. **Should the documents share one version
string, and what must be filled before anything is shown to a real school?**

**Q9 — Is the attestation wording itself right?** Current text: *"I am an
educator, and I am authorized by my school to use this platform with my
students."* Recorded with date and policy version, unchecked by default, and
required before the account is promoted.

**Q10 — Do de-identified daily aggregates that outlive a purged student's work
count as retained student data?** (Added 2026-08-16; nothing is built yet — the
answer shapes a planned feature.) The platform plans daily per-question
aggregate rows (counts only, no names or ids) that would survive the deletion
of the student work they summarize, and would NOT be recomputed when a student
account is purged — a distinct-student count cannot be decremented without the
identifiers the tables deliberately refuse to hold. They ARE deleted with the
activity they describe. The edge case: in a class of one, a surviving row
still says *one student got this question wrong on this day*, and the teacher
can tell who from memory and the roster. **Is that retained student data under
the promises in retention-policy.md — and if so, is the right mitigation
suppressing aggregates below a minimum cohort size, coarsening the time grain,
or disclosure alone?** The current position (held, not shipped): the only
reader is the teacher who could already see the live data, and the roster
relationship carries the consent — but that reasoning is only obviously true
while the underlying work still exists.

## 6. What this packet deliberately does not do

- It does not ask counsel to review code, and no answer above depends on
  reading any.
- It does not cover the guest tier (join code + nickname, nothing identified
  persisted), which is designed but not built.
- It does not cover additional sign-in providers, under-13 support, or district
  SSO integrations, all of which are deferred.
- It states no position on whether the currently-open teacher self-serve should
  be closed pending the answers. That is the author's call, informed by Q2.
