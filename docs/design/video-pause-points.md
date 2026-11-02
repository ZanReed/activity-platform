# Pause-point video (D64, D73) — design pass

**Status:** ALL RULED by the author 2026-11-02: VP-1…VP-13 as written, after the curriculum side's C-176 revisions (answering B-229). Each item keeps its recommendation text; read "Recommend" as the ruling. The author also confirmed D64's clip-length change directly. No code yet.
**Source:** the curriculum side's D64 and D73, ratified 2026-10-21 (C-152, answered in B-198).
**Order:** fourth in the D64–D68 queue, after D68, D65 and D67 (re-ruled 2026-10-31, C-171).

## What D64 and D73 ask for (their rulings, our paraphrase)

- **Scope:** catch-up after absence, late joiners, revision before a unit test, the Y10 spiral. Never first teaching, Exceeding content or the hook.
- **Hosting:** Zan records. The video lives outside the platform and is embedded. YouTube unlisted is assumed, and a switch of host should cost nothing.
- **Pause points:** at authored times the video stops until the student answers an item the activity already has: its faded beat, in order.
- **Wrong answers:** show the item's existing misconception feedback and offer "rewind to m:ss".
- **First tries:** recorded against the skill, and they feed the struggling rule.
- **Staleness:** if the activity's worked beat changes, the teacher sees the video as stale and it isn't silently served.
- **Device:** phone-first, captions on.
- **D73:** build the player and record the clips now. Students see a video only after the school clears how it is hosted.

## What already exists (re-derived 2026-11-02, P10)

| Need | Today | What it means here |
|---|---|---|
| Any video or embed | Nothing, and no CSP in `_headers` to widen | All new. An iframe would load today with no header change. |
| The faded beat | 17 of the 21 catalogue files have **three** ```faded fences; 801's four have one | **B-198's lean was wrong.** It said pause points would name step letters. Real files have no step letters, and their fade is three separate blocks. |
| Per-item checking | None. `check-activity` grades a whole section, or one practice slot | A pause needs a new check mode. |
| Answers on the page | The viewer's answer store, restored per section | A pause can use the block already on the page, with no copy of the item. |
| The struggling rule | `mixed_recent` reads `mixed_attempts` only; the teacher panel and the tracker both read it | Rule 7 changes one function, and four readers see the result. |
| Who sees what | `get-activity` serves one cached copy per version, for any signed-in user. Raw versions are owner-only (`can_read_activity`, read live 2026-11-02) | The cached copy can't differ by role, but it can leave the URL out for everyone and a separate read can hand it over (VP-7). |
| Shell budget | StudentViewer is eager, at 158.3 of 158.5 KiB | The player must be a lazy block. Even its registry line may need a rung. |
| Compliance | Counsel's answer (Q1–Q11, 2026-10-06) predates any third-party embed | Not covered. D73's gate stands. |

## Decisions for the author

**VP-1 · Where it lives in files: a ```video fence.** It goes in the activity's `.md`, in the lesson section, above the worked beat.

````
```video
title: Comparing decimals
url: https://youtu.be/abc123
recorded_against: 3fa9c1d2
pause: 3:20
pause: 5:05 | rewind 3:40
pause: 6:30
```
````

- Each `pause:` maps to the next ```faded block after the fence, in order. There are no ids to write and no new items.
- The importer refuses a file whose pause count differs from its faded count, whose times don't ascend, or whose fence sits outside the section holding those faded blocks.
- It also refuses a video in a DoL section or in a quiz or exam. A pause gives a verdict before the check, which those must not.
- **Added by C-176:** it refuses a fence with no pause, and a fence outside a lesson section. D64 forbids the hook, and a zero-pause clip would otherwise pass where there are no faded blocks. The importer has no section kinds, so "lesson" means the heading's title; all 55 catalogue faded blocks sit under `## Lesson {checkpoint}`.
- **Clip length is not checked.** D64 rule 3 now reads "one idea per clip, up to 5 minutes of talking, not counting pauses" (author-confirmed 2026-11-02; their PR #85). Talking time can't be read from a timestamp.
- `rewind` is optional. Without it, "rewind" goes to the previous pause, or the start.
- A new fence means a capability entry, a prompt regeneration and a pin bump on their side.
- *Recommend:* yes. This replaces B-198's step letters; the letter must say so.

**VP-2 · The student's experience: a collapsed card, then the real block on the page.**
- The card reads "Missed this lesson? Watch the catch-up · ⟨title⟩". It stays closed until tapped, so the video doesn't compete with first teaching. Nothing third-party loads until then (VP-6).
- At a pause the video stops and the page scrolls to the faded block, which is the same block every student sees. It gains a "Check" button for this try. After a right answer, the page scrolls back and playback resumes.
- *Why not an overlay on the video:* a phone has no room for it with the keyboard open, and an overlay means a second rendering of blanks, math entry and feedback.
- Native fullscreen is switched off, because the item can't appear inside it.
- *Recommend:* yes.

**VP-3 · The pause check: a new server mode, with no effect on the section's check.**
- `check-activity` gains a `video-pause` mode that grades that one block. It returns right or wrong plus the misconception feedback, and never the answer.
- It doesn't write `section_checks`. The section's own Check stays the real attempt, so first tries (0062), class progress and attempt counts don't move.
- The student's typed answers stay in the block.
- **A wrong answer never traps anyone.** They see the feedback, "Rewind to m:ss" and "Try again". After a second wrong try they also get "Keep going".
- **Feedback is often absent (C-176, counted 2026-11-02):** 26 of the 55 faded blocks bind no `mis.*`, and 11 have no authored feedback. Those show the two buttons only. Files won't be retrofitted for this.
- **Once the section has been checked,** the video plays straight through, with its pause points as markers. Those blocks are already locked.
- *Known limit:* a revising student who has checked the section gets no tries. Filed with a trigger: a teacher asks for revision tries.
- *Recommend:* yes.

**VP-4 · First tries feed the struggling rule, and a new table holds them.**
- `video_pause_tries (student_id, activity_version_id, block_id, skill_id, correct, tries, saved_at)` gets one row per student per block. The first answer's result never changes; later tries only count up.
- `mixed_recent` gains these rows, per class through the class's activities. So "Getting stuck" on the teacher panel and "Keep practising" on the tracker can both fire from a pause.
- This is student-derived data: it needs the data-map and retention-policy entries, and it deletes with the account.
- **No double count (C-176 point 2, checked):** a section check never feeds this rule. `mixed_recent` reads `mixed_attempts` only, so the pause try is the only one of the two that counts, and nothing extra needs building.
- ⚠ **Consequence to accept:** TP-2 kept targeted practice out of this rule so that a student practising what they already got wrong wasn't double-counted. A catch-up student's first tries are real first tries, as C-152(d) asks.
- There is **no watch log**: no record of who played what or how far. It isn't asked for, and it's less student data.
- *Recommend:* yes.

**VP-5 · Staleness: a hash of the beat, computed when the document is saved.**
- `recorded_against` holds a short hash of the worked blocks' text and, for each faded block in order, its blank count and answer keys. Block ids aren't included, because they're re-minted on every save.
- **Revised by C-176.** Hashing faded text would make a typo fix mark the clip stale. Changed numbers or answers still do, because the clip would no longer match the block. A cosmetic edit to the worked beat still does too.
- **Re-stamping** is a person reviewing the clip, pasting the new hash into `recorded_against`, importing and publishing. It needs no new key.
- `tiptapToActivity` computes it and stores `stale` on the block. The importer and the editor both pass through that function, so a teacher editing a Bank copy's faded block marks it stale too.
- **Stale means:** the importer warns (`--strict` fails) and a teacher sees a "Video is out of date" chip. Students don't get the video at all (VP-7); the rest of the activity is unaffected.
- **Getting the hash:** a dry run prints the current value for pasting after recording. A fence with no `recorded_against` counts as stale.
- *Why not hash on the server or in the viewer:* the served copy has its answers stripped, so a changed answer wouldn't show.
- *Recommend:* yes.

**VP-6 · Hosts: YouTube and a plain video file, behind one small player interface.**
- The interface is play, pause, seek, current time, and an event on each tick. Enforcement is a time check every 250 ms; seeking past an unanswered pause snaps back to it.
- **YouTube** uses `youtube-nocookie.com` and its iframe API, with captions forced on and fullscreen off.
- **A file** (any `https` `.mp4` or `.webm`, plus `captions:` with a `.vtt`) uses a native `<video playsinline>`. This is also how the player is tested without a third party, and the school's way out if YouTube is refused.
- The importer refuses any other URL.
- **Nothing is fetched from a host until the student taps play.** The player is a lazy chunk.
- *Recommend:* yes.

**VP-7 · The D73 gate: on the server, and the URL never reaches a student's device (revised by C-176).** My first draft gated in the client and accepted a readable URL. C-176 objected, and it costs little to do properly.
- Sanitize removes `url`, `captions` and `recorded_against` from the served copy for everyone. The title, the pause times and `stale` stay. Removing `recorded_against` matters because it is a hash over answer keys.
- A definer RPC, `video_source(activity, version, block)`, reads the raw version and returns the URL. A teacher who owns the activity always gets it. A student gets it only if they can open the activity, `video_clearance` is on and the clip isn't stale. Otherwise it returns nothing, and any error reads as no.
- The read cache stays one copy per version, because the role check lives in the second read. Students can't go round it: raw versions are owner-only.
- A student who isn't cleared sees nothing, not even a placeholder.
- Turning it on is an author action, and it's guarded: a `verify-` row fails while the setting is on until the checklist below is done and the row is removed on purpose. Another asserts that a student gets no URL with the setting off or the clip stale.
- *Recommend:* yes.

**VP-8 · What must happen before the gate opens.** A TODOS checklist with an owner, not prose (P8):
1. The HoD confirms the school's policy on teacher-recorded, student-facing video.
2. Counsel answers a new **Q12** in the packet: a third-party embed on under-13 devices, by host. Q1–Q11 don't reach it.
3. The privacy page and data map name the host.
4. The author's explicit yes.
- A file host would change question 2's answer, so ask about both.
- *Recommend:* yes. I'd draft Q12 at build time; you take it to the school and counsel.

**VP-9 · Print and offline.** On paper the card prints nothing, because the faded blocks are there anyway. Offline, or if the host fails, the card says "The video isn't available right now" and the activity carries on.
- *Recommend:* yes.

**VP-10 · Editor: it survives a save, and nothing more.** A read-only card shows the title, URL and pause count, and round-trips. No slash-menu entry and no edit form. A teacher can't add a video in v1. TRIGGER: a teacher asks to attach their own.
- *Recommend:* yes.

**VP-11 · Out of scope, each with a trigger in TODOS.** A teacher's view of who watched (asks for a watch log; needs its own compliance read). Native fullscreen (a tester finds it missing). Tries after the section is checked (VP-3). Self-hosting on the platform (the school refuses every outside host). Teacher-attached videos (VP-10).
- *Recommend:* yes.

**VP-12 · Build slices.** Each lands on its own.
1. **Fence and schema:** the block, importer refusals, hash and `stale`, sanitize removing the URL, capability entry, prompt, both Edge Function bundles. Author: redeploy `get-activity` and `check-activity`.
2. **Player and gate:** the card, both hosts, `video_clearance`, `video_source`, teacher-only. Author: one migration. Testable with a file host and teacher accounts.
3. **Pause checks and first tries:** the `video-pause` mode, `video_pause_tries`, `mixed_recent`. Author: migration, then `check-activity` redeploy.
- The pilot is one file once slice 3 is live and a clip exists. Students still wait for VP-8.
- *Recommend:* yes.

**VP-13 · The curriculum side's answers (B-229 → C-176, 2026-11-02).**
- Fence: yes, with the two refusals now in VP-1. Their lint learns it, with the capability entry, prompt and pin bump, once the author has ruled.
- 801's one-faded files: a one-pause clip is accepted with no special case, but 801 stays out of the pilot because its faded blocks have no mistake feedback.
- Hash: revised as in VP-5. Gate: revised as in VP-7.
- Pilot: 701/01. All three faded blocks have mistake feedback (checked in the file), fading from 1 blank to 4.
- No objection to the rest.
- B-230 carries the rulings, including that `recorded_against` is all a re-stamp needs and that no double count exists.
