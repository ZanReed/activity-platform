# Privacy Policy — Activity Platform

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Effective date: ⟨date⟩ · Policy version: `2026-08-15-draft-3`
> Operator: ⟨legal name / contact email⟩
>
> `draft-2` (2026-08-07): the class-creation assertion dropped its under-13
> school-authorization clause (the platform declines under-13 sign-ins
> unconditionally — the clause offered a branch v1 does not support); "your
> teacher sees your name" corrected to name **and school email** (the roster
> shows the email, and is REQUIRED to when no display name exists); and the
> departed-student retention disclosure below was added — it was always true
> and always required by the retention policy, and this doc never said it.

This is the source text for the public `/privacy` page. Written in plain
language on purpose — students and parents are the audience.

## The short version

- We store the **minimum** needed to run class activities: your school email,
  your name as Google provides it, which classes you joined, and the answers
  you submit.
- Your teacher sees your work. **We don't sell data, show ads, or track you
  across the web.** There are no third-party trackers on any page.
- Answer keys never leave the server — checking happens there (that's an
  integrity feature, but it's also a privacy one: less moves over the wire).
- When your class ends and the retention window passes, your work is deleted
  on a schedule ([retention policy](retention-policy.md)).

## Who can use this

Student accounts are for students **13 or older** whose school uses the
platform — with no exceptions in this version. Your teacher confirms this when
they create a class. If you're under 13, don't sign in — ask your teacher for
a paper copy.

### How you get an account (2026-08-15)

There are two doors, and both are anchored to a teacher:

1. **Your school's Google account.** If your district is set up with us, your
   school email is recognized at sign-in and you're a student straight away.
2. **A class code from your teacher.** Anyone can sign in with Google, but
   until you enter a teacher's class code you have **no role and no access**:
   the account can't open activities, join classes, or see anyone's work. It's
   an empty account waiting for a code. Entering a valid code is what makes
   you a student, in that class.

**Teachers** either are added by us directly, or set themselves up by
confirming they're an educator authorized by their school to use this with
students. That confirmation is recorded with the date and the version of this
policy they saw.

**Why it works this way.** A teacher deciding to use this with their class —
and confirming their school authorizes it — is what permits us to collect a
student's information at all, on the school's behalf, and only for schoolwork.
We do not ask students to arrange that themselves. We also carry our own side
of it rather than leaving it with the school: this notice, collecting as
little as we can, and using it for nothing but the class.

**One thing worth being plain about.** A signed-in account with no class can
open an activity if a teacher shares its link directly — activity content is
readable by anyone signed in who has the link, the same as it was when
activities were published as public web pages. **Student work is not:** answers,
scores, class rosters and membership are visible only to the student who wrote
them and their teacher, and an account with no class reaches none of it.

## What we collect, exactly

| Data | Where it comes from | Why |
|---|---|---|
| School email address | Google sign-in | Sign-in + confirming you belong to your district |
| Display name | Google sign-in | So your teacher recognizes your work |
| Class memberships | You entering a join code | Connecting you to your teacher |
| Educator confirmation (teachers only) | The teacher, at setup | Recording who confirmed their school authorizes this, and when |
| Activity responses, scores, attempt counts | Your work | The whole point — your teacher reviews it |
| A one-way hash of your IP address, browser type | Automatic, on submission | Abuse detection only. We never store your raw IP. Deleted after 30 days |

We do **not** collect: age or birthdate, location, contacts, photos, browsing
history, or anything from your Google account beyond email + name. We do not
use cookies for advertising or analytics — only for keeping you signed in.

## Who sees what

- **Your teacher** sees your name **and school email**, your responses,
  scores, and grades for their own classes and activities. Not other teachers'
  classes. (The email is how the roster identifies you when Google supplies no
  display name.)
- **Other students** see nothing of yours.
- **The operator** (the person who runs the platform) can access the database
  for maintenance and security; access is logged.
- **Service providers:** data is stored with Supabase (database + sign-in,
  hosted on ⟨AWS region⟩) and Cloudflare (page hosting). They process it for
  us and have no right to use it otherwise.
- **Nobody else.** No sale, no ads, no data brokers. We disclose data only if
  legally compelled, and we'd notify the district unless prohibited.

## Your choices

- **See or export your work:** ask your teacher, or contact ⟨contact email⟩.
- **Delete your account:** contact ⟨contact email⟩ (or ask your teacher to
  request it). Deletion follows the [retention policy](retention-policy.md) —
  submitted classwork may be kept for the school's records window, then purged.
- **After you leave** (your class ends, or you're removed): your name and
  school email stay attached to your submitted work for as long as that work
  is kept — up to about 400 days — because school records need to say whose
  work they are. This is the minimum retention that keeps records attributable;
  it is not incidental. Then the account and the work are purged together.
- **Sign out on shared computers:** use the sign-out button in the account
  menu; it clears everything stored on that machine.

## Changes

If this policy changes in a way that matters, the version string above changes
and teachers are notified before students see the new terms. Class-creation
assertions record which version was in force.

---

*Questions: ⟨contact email⟩. School officials: see the
[school authorization template](school-authorization-template.md) and
[data map](data-map.md).*
