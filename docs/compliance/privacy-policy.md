# Privacy Policy — Activity Platform

> **DRAFT FOR DISTRICT / COUNSEL REVIEW — NOT LEGAL ADVICE.**
> Effective date: ⟨date⟩ · Policy version: `2026-07-28-draft-1`
> Operator: ⟨legal name / contact email⟩

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
platform. Your teacher confirms this when they create a class. If you're under
13, don't sign in — ask your teacher for a paper copy.

## What we collect, exactly

| Data | Where it comes from | Why |
|---|---|---|
| School email address | Google sign-in | Sign-in + confirming you belong to your district |
| Display name | Google sign-in | So your teacher recognizes your work |
| Class memberships | You entering a join code | Connecting you to your teacher |
| Activity responses, scores, attempt counts | Your work | The whole point — your teacher reviews it |
| A one-way hash of your IP address, browser type | Automatic, on submission | Abuse detection only. We never store your raw IP. Deleted after 30 days |

We do **not** collect: age or birthdate, location, contacts, photos, browsing
history, or anything from your Google account beyond email + name. We do not
use cookies for advertising or analytics — only for keeping you signed in.

## Who sees what

- **Your teacher** sees your name, your responses, scores, and grades for
  their own classes and activities. Not other teachers' classes.
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
