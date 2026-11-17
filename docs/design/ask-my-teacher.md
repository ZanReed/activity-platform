# "I'm stuck": a student asks their teacher (S9) — design pass (2026-11-16)

From [schema-shortlist.md](schema-shortlist.md) → S9. **RULED 2026-11-16 (author): ST-1..ST-14 all as
recommended.** Build: one drop, migration 0090 first.

A signed-in student, inside an activity, tells their teacher they are stuck on a
section. The teacher sees who is asking, on which section, and clears the request
when they have helped.

## What exists today (checked 2026-11-16)

- **Nothing a student can send.** The only student-actor audit row is
  `class.join` (0014). Student work is the record itself: `section_checks` has no
  audit row by design (0020:29-32).
- **Derived signals only.** "Who to see first" (0068, `WhoFirst.tsx` on
  `/classes/:id/facts`) groups students who are *getting stuck* by evidence. Its
  wording rule: never "needs help", "behind", "weak" or "at risk"
  (mixed-practice-teacher-panel.md:77). The student tracker avoids "Getting
  stuck" because it "reads as a verdict to a 12-year-old"
  (student-unit-tracker.md:61). A request the student *chose* to send is a
  different kind of signal and can be named in the student's own words.
- **The viewer knows no class.** `/a/:id` opens any published activity for any
  admitted student (0030:26-31). `section_checks` has no `class_id`. A student
  can be in two of a teacher's classes (S4). So a request has to work out its
  class from `class_members` × `class_activities`.
- **No push to teachers.** `supabase.channel()` is stubbed (CLAUDE.md). The
  realtime arc's trigger is "the first named live feature" (STATE), and this
  could be it. Live teacher panels poll instead: WhoFirst and the live facts view
  every 5 s while open and visible. Class Progress has a manual Refresh.
- **No teacher notifications** of any kind: no email, no badges. The closest
  thing is the computed "N to grade" chip.
- **Student free text already exists** (short answer, essay, in
  `section_checks.responses`, 400 days), so a note would not be a new class of
  data. A note to a person reads differently from an answer to a question,
  though: it invites "can I go to the toilet" and worse, and no one moderates it.
- **Under-13s:** U-3 says nothing behaves differently for an under-13 class
  without a new ruling. A design with no free text needs no such ruling.
- **Write limits:** `record_check` uses a trailing 60-per-60 s window per
  student, raising `rate_limited` → 429. 0079 has a per-row ceiling.

## The decisions

**ST-1 — What the student sends.**
(i) The flag alone: this activity, this section, now.
(ii) The flag plus ONE of a few fixed reasons ("I don't get the question" / "I
tried and I'm still wrong" / "I don't know how to start").
(iii) The flag plus a free-text note.
**Recommended (i) for v1.** (ii) is cheap to add later as an enum. (iii) needs
moderation, an under-13 ruling and a counsel look; its cost is out of
proportion to a feature whose point is "come here".

**ST-2 — What it attaches to.** A section of an activity version, the place
the student is working. At most ONE open request per student per section. A
second press does nothing new; the button shows "Asked".
**Recommended.**

**ST-3 — Which teacher gets it.** It is resolved when the request is written:
every class where the student is an active member AND the activity is assigned.
- None: the button is not shown. An activity opened by link, with no class
  holding it, has no one to ask.
- Two classes: it goes to both. They share a teacher (S4), and it shows once
  per class page.

The class ids are stored on the row, so a later move or unassign doesn't send
it somewhere else. **Recommended.**

**ST-4 — How a request ends.** Three ways, all recommended:
- the teacher marks it **Done** (one click on their list);
- the student **withdraws** it ("I've got it now");
- it **lapses at the end of the school day** in the teacher's timezone
  (`my_timezone`, 0088), so tomorrow's list never starts with yesterday's hands.

A lapsed request is not shown to anyone again. Checking the section does NOT
end it: being wrong is often why they asked.

**ST-5 — Where the teacher sees it.**
(i) A strip at the top of **Class Progress**, "Asking for you (3)": name ·
activity · section · how long ago · Done. There is also a marker on that
student's cell. The page polls every 15 s while visible and only while the
class has an open request or the strip is shown.
(ii) Also on the live facts page beside WhoFirst.
(iii) A count badge in the app's top bar on every teacher page. That page
would need its own poll.
**Recommended (i).** Progress is the page a teacher has open during an
activity. (iii) is the real "notification" and belongs with the realtime arc.
Hide names (CP) hides names in the strip too, so a projector can stay on.

**ST-6 — Push or poll.** (i) Poll, as WhoFirst does. (ii) Un-stub realtime
now, and make this the realtime arc's first feature. **Recommended (i).**
Realtime costs shell size (the stubs saved 21 KiB) and an arc of its own.
Under a 15 s poll a teacher sees a hand within the time it takes to walk
across the room. If teachers find 15 s too slow, that is the realtime arc's
trigger, written down.

**ST-7 — Words.**
- **Student button:** "Ask my teacher". After sending: "Asked — your teacher
  can see this", with "I've got it now".
- **Teacher strip:** "Asking for you".

These are the student's own action, so they are not a verdict. That keeps the
"never needs help" rule intact, because the teacher page never says the
student *needs* anything. If no teacher has the class page open, the student
is never told when it will be seen (see ST-8). **Recommended.**

**ST-8 — Outside lesson time.** A request sent at home waits until a
teacher looks, or lapses at the end of the day (ST-4). The student's sent line
says "your teacher can see this", never "your teacher will come".
(i) Lapse at the end of the day even when sent from home.
(ii) Only allow asking during the class's planned day (0088 `class_today`
holds the activity).
**Recommended (i).** (ii) hides the button whenever the plan isn't
maintained, which is most of the time.

**ST-9 — Can the student see the teacher saw it?** (i) No. The student sees
"Asked" until they withdraw, it is marked Done, or it lapses. Done shows as
"Your teacher marked this done" on the next load. (ii) A live "seen" tick,
which needs a student-side poll. **Recommended (i).** The viewer doesn't poll,
and the shell budget is tight.

**ST-10 — Where the button sits.** On each section, next to Check, so the
section is never ambiguous. The alternative is the top bar, asking "which
section?". **Recommended: per section, beside Check.** That means a small
`onAskTeacher` seam in `ViewerContainer`, the same pattern as
`onCheckShortfall`. Not on mixed practice or number facts in v1: those have
WhoFirst's evidence already.

**ST-11 — Limits.** One open request per section (ST-2), plus at most 20
requests per student per day, raising `rate_limited` like `record_check`.
Withdrawing and re-asking counts against the 20. **Recommended.**

**ST-12 — The data and how long it is kept.** New table `help_requests`:
- `id`, `student_id`, `activity_version_id`, `section_id`, `class_ids uuid[]`
- `created_at`, `ended_at`
- `ended_by`: 'teacher' | 'student' | 'lapsed'
- `ended_by_teacher`: the teacher's id, when a teacher ended it

There is no free text (ST-1 i).

This is new STUDENT-DERIVED personal data, so the data map and the retention
policy change in the same commit. **Retention:** (i) delete 30 days after
`created_at`, so a teacher can glance back over a month. (ii) Delete when it
ends. That would be the most private, but a teacher couldn't see "asked twice
this week".

**Recommended (i).** The delete is a fifth prune function. CLAUDE.md's rule
covers the four that delete student WORK; this deletes requests, not work.
Either way it ships **disarmed and unscheduled** like the others, with a
`verify-0090` `prune_is_unscheduled` row. Arming needs your yes.

**ST-13 — Audit.** No audit row per request, because requests are high-volume
and formative, like checks (0020:29-32). The table itself is the record, with
who ended each one. **Recommended.**

**ST-14 — Per-class switch.** A class setting, "Students can ask me for help",
**default ON**. A teacher who doesn't want hands from home, or runs a test day,
turns it off and the button disappears. Off hides the button; it does not
delete open requests, which still lapse. **Recommended: ON, with the switch on
the class settings.**

## What it would cost, roughly

| Piece | Size |
|---|---|
| Migration `0090_help_requests`: table + RLS, `ask_teacher`/`withdraw_help`/`end_help` DEFINER RPCs (the class is resolved in SQL), `class_help_open(class)` read, the disarmed prune, the class switch column. Plus `verify-0090`, mutation-tested | medium |
| Viewer: the `onAskTeacher` seam + the per-section button and states | small; it is in the student shell, so it is measured against the cap |
| App: StudentViewer wiring (does the student have a class? is it on? already asked?), the Class Progress strip + cell marker + 15 s poll, the class settings toggle | medium |
| Data map + retention policy entries, DECISIONS entry | small |
| No grading or sanitize change. No function redeploy, no bundle regen, no capability facts (nothing is authored in markdown) | — |

**One build drop**, migration first: the author applies 0090 live before any UI
that calls it is pushed (OV-7).

## Not in v1 (filed with triggers on ruling)

- A reason list (ST-1 ii). Trigger: teachers ask "stuck on what?".
- A count badge on every teacher page (ST-5 iii), and realtime push (ST-6 ii).
  Trigger: teachers report 15 s, or a page-bound list, as too slow.
- Asking from mixed practice / number facts. Trigger: a teacher asks for it
  where WhoFirst already shows evidence.
- A free-text note. Trigger: a school asks. It needs a moderation, under-13 and
  counsel pass of its own.

## As built (2026-11-16)

- **0090**: `help_requests` (ONE ROW PER CLASS, not one row with `class_ids`, because a student's classes may have different teachers and each Done is that teacher's), `classes.help_requests_on` + `set_class_help`, `my_help_state` / `ask_teacher` / `withdraw_help`, `class_help_open` / `end_help`, `prune_help_requests` (disarmed). The class is resolved by `help_target_classes`; an ask names only the version and section, and the version must be the activity's current published one with that section in it. ST-2's "one open request" is held by a per-student transaction lock plus an "already open?" check, because "open" depends on `now()` and no index can express it. `lapses_at` = the next midnight in the class's zone (`fact_class_zone`). `verify-0090` has 10 behavioural rows, and 8 of 9 mutants go red; the survivor (end_help's own teacher check) is still backed by the read it returns, which refuses the same caller.
- **The request attaches to the check GROUP's first section** (ST-10 "beside Check"): Check covers a group, so the button sits once per group footer. The viewer gains one generic slot, `groupAside(sectionIds)`; it knows nothing about classes.
- **Student**: `AskTeacher` in the footer, ONE button whose label flips ("Ask my teacher" ⇄ "I've got it now") so focus stays put; the note beside it is the live region. Read once per version, never polled; a failed read hides the button.
- **Teacher**: "Asking for you (N)" strip at the top of Class Progress (longest-waiting first, each with Done), an "Asking" chip on the student's cell, Hide names applied. It polls every 15 s while visible and while the switch is on or a request is still open. The class card says "Students can ask you for help · Turn off".
- **Not built** (TODOS, with triggers): a reason list, a badge on every page / realtime, asking from practice, a free-text note.
- **Fable review (2026-11-16), fixed:**
  - "Asked" means a teacher can see it. Open = unended, not lapsed, in a class that still exists and still has the student (`help_open_rows`). Asking again adds a row for any class that lacks one, so a student moved or newly joined is never stuck behind an invisible hand.
  - Requests follow the ACTIVITY, not the version, so a republish never strands one.
  - Done shows only while it is the student's latest word.
  - `can_ask` needs a student account; `set_class_help` needs a teacher.
  - The button is never `disabled` mid-call (that drops focus to the body): it uses `aria-disabled` plus an early return. Withdrawing says "OK, you're not asking now."
  - "Out of date, reload" replaces a dead-end "try again".
  - A failed student read retries once on return or reconnect. The teacher's poll keeps trying until a first read lands.
  - Reads carry a sequence number, so a slow poll can't undo Done and a late reply for another class can't paint this one. After Done, focus goes to the next Done, or the page heading.
  - In the phone's pinned footer the ask controls take one row (+49 px measured at 375 px).
  - An untitled section is named by its first heading below level 1 ("Review"), not "Section 1".
  - The student shell carries only the state read (+661 B ledger row, including ~220 B of S6–S8 drift); the button, ask/withdraw and the teacher side are lazy.
- **Ruled 2026-11-16 (author), after the review:**
  - **No asking during an assessment:** not in a `locked` activity, not in a quiz or an exam (`activityType: quiz | exam`), not in a DoL section. Held by the server (`help_allowed`; `ask_teacher` raises `not_during_assessment`). `can_ask` is false for a locked activity, a quiz or an exam, and the viewer draws no button on a DoL group. Quizzes added by the author the same day.
  - **The 30-day cleanup is ARMED (2026-11-17):** nightly at 03:45 UTC. A teacher-set shorter window is filed in TODOS with a trigger.
  - **The timezone is the teacher's to set:** a teacher with no zone lapses at the Chicago-default midnight, as every other per-day feature does. No change.
