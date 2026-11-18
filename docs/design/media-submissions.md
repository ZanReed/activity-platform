# Media submissions (Phase 2.8): design pass

**Status:** **RULED 2026-11-18** (author, all of MS-1 to MS-25). The design was
Fable-reviewed the same day, and five factual corrections and eleven gaps were
folded in. **Slices 1, 2, 2b and 2c are BUILT and LIVE (2026-11-18)**: 0093–0095
applied, all four functions deployed and hash-verified, CI green. **Slice 3
(teacher grading, 0096) is LIVE too (2026-11-19, both functions
hash-verified, CI green). Slices 4 and 6 are BUILT, unpushed** (no migration,
no deploy): pushing changes `docs/capability-facts.json`, which owes the
curriculum repo a pin-bump PR.
`photo_clearance` is still OFF, so no student can add a photo yet (slice 5); slice 2 pulled most of slice 4's editor half forward (§10, "As
built"). Slice 2b closed the three clearance blockers; slice 2c is the phone QR
handoff (migration 0095, the `photo-handoff` function).

**The rulings in brief.** The author's guiding instruction was "where there is
short-term pain for long-term gain, take it". Where the author ruled differently
from the first draft, the doc below has been rewritten to match:

- **Student photos come first.** Bulk paper scanning is the next arc, and it
  shares slice 1's storage. That arc covers a printed per-page QR, named
  copies, a shaded-code fallback for spares, a filing review, cropped grading
  by question, and the teacher camera, and it is the update of photo-grading.md.
- **MS-3 revised:** the native file input **plus a phone QR handoff** (§4.1),
  off in quiz and exam modes. The teacher camera moves to the paper-scanning
  arc.
- **MS-6 flipped:** offline photo capture **is in v1** (§8).
- **MS-10 revised:** a graded photo is kept **at most 30 days after its grade
  is released**. A photo never released falls back to the school year plus 30
  days, with a 400-day ceiling (§6.5).
- **MS-13 ruled:** **move to the Supabase Pro plan before the February
  classes.** The cost meter stays, as a read.
- **MS-24 (new):** the handoff's **no-sign-in Edge Function is allowed**,
  scoped as in §4.1. It is the second exception to the `get-activity`-only
  rule. CLAUDE.md and config.toml record it in the slice that builds it, not
  before.
- **MS-25 (new):** student photos first, then paper scanning.
- **Every other recommendation was accepted as written.**

**Why now:** the author started Phase 2.8 on 2026-11-18. Nothing else in the
ruled queue can be built: the review period waits on the curriculum side's PRs,
and the skills diagnostic waits on their prerequisite-bank PR. Re-ranking the
queue is the author's call (CLAUDE.md), and they made it.

**Scope of this pass:** all of ROADMAP 2.8 (audio, video, photos and files as
responses), with a recommended **narrow first slice: a photo of a student's
handwritten working, attached to a question and graded by the teacher against
a rubric.** Audio, video and general files each get a trigger rather than a
slot (CLAUDE.md, "a new wish gets a trigger, not a slot").

**Related docs:**

- [photo-grading.md](photo-grading.md) is a DIFFERENT feature, and its design
  is stale. There, a *teacher* scans a stack of printed worksheets and a vision
  model fills the blanks from the handwriting. Here, a *student* attaches a
  photo to a question on screen and a *teacher* grades it by hand. The two
  share the storage, privacy and retention plumbing designed below, and
  photo-grading should reuse it when it is unparked. Nothing here builds
  photo-grading.
- TODOS → "Graded uploads of drawn student work" (the curriculum side's wish,
  2026-10-01: nets first, then the statistics chains' "draw" items). This
  design is the upload half of that wish. The grading half (a vision model
  pre-grading the drawing) stays parked with the AI-grading model half (§7).
- [teacher-grading.md](teacher-grading.md) (0034) and
  [ai-grading-assist.md](ai-grading-assist.md) (0042) are the grading rails a
  photo response rides.
- [video-pause-points.md](video-pause-points.md) and its `video_clearance`
  setting are the precedent for a student-facing switch that stays off until
  its checklist is done (§6.6).

---

## 1. Re-derivation against shipped reality (P10)

ROADMAP 2.8 was written before S9. Re-reading it against the code changes
these things.

**R-1. The response wire is not `SubmissionResponses` any more.** ROADMAP
plans a `files` map on `SubmissionResponses` (`packages/schema/src/submission.ts`).
That map describes the `submissions` table, which has been empty and has had
no writer since 0029. Student work now travels as a **check**:
`SectionResponses` in `packages/viewer/src/check/wire.ts` (wire v3; exact-match
versioning, so a stale client gets the "refresh to continue" refusal) goes to
`check-activity`, and each check writes one `section_checks` row holding the
full `responses` jsonb, the verdicts the student saw, the pinned
`activity_version_id` and an attempt number. **A media response is therefore a
new map on `SectionResponses` (wire v3 → v4), and the value it carries is a
reference to a stored object, never the bytes.** The "parallel map per response
category" rule (CLAUDE.md, "don't widen `BlankResponse.answer`") still holds;
it just applies to the check wire.

**R-2. Teacher grading exists and is built for exactly this, but it names its
block types inline.** `check_grades` (0034) holds mutable rubric grades keyed
by (check, block), written only through the audited `upsert_check_grade` RPC
(gated on `can_edit_activity`, not `can_read_activity`, G3). The Responses
queue (`packages/app/src/routes/ActivityResponses.tsx`, `GradePanel.tsx`) groups
section → question → students, handles stale re-checks (D5), and releases
grades. A photo response needs no new grading model: it is a rubric-graded
block like `short_answer`. **But the set of manually graded types,
`('short_answer', 'essay')`, is spelled out literally in many places**, and
staleness is a TEXT comparison (`responses->'freeText'`, 0034 lines ~407 and
~558: "stale means the student's TEXT changed"). The places found so far:

- **SQL:** 0034, 0042, 0061, 0064, 0075 and 0076. In 0076,
  `dol_optional_block` holds the pair inside a longer gradable list, which is
  the SQL mirror of `isGradeable`. The response-family arrays in 0061 (~619),
  0062 (~124) and 0064 (~680) also need `photos`.
- **TypeScript:**
  - `schema/src/block-predicates.ts` (`ALWAYS_NUMBERED_TYPES`, `isGradeable`)
  - `viewer/src/server/grading/walk.ts` (`FREE_TEXT_TYPES`, the "recorded" family)
  - `viewer/src/server/dolPrimary.ts`
  - `viewer/src/container/dolOptional.ts`, `answered.ts`, `blockIndex.ts` and `layoutStyles.ts`
  - `app/src/lib/grading.ts` (the `block_type` union) and `answerText.ts`
  - `app/src/progress/AnswerPanel.tsx` (the "N to grade" count)
  - the census

Every place that is still live has to learn the new type. Missing one is
exactly how this repo's orphan class happens: a photo answer that renders but
never reaches the queue, or that shows as "unanswered" in class progress. The
build slice re-greps for both the pair and the family arrays rather than
trusting this list.

**R-3. Images reach Storage directly, through a public bucket, from teacher
accounts only.** `lib/uploadImage.ts` sends a raw `fetch` multipart POST to the
`activity-images` bucket (0019). That bucket is **public** (reads bypass RLS),
has a 10 MB limit and five raster types, and its only policy is an INSERT for
`can_edit_activity` under `{activityId}/{uuid}.{ext}`. There is no UPDATE,
SELECT or DELETE policy, so objects are immutable and orphans are "an accepted
residue". **None of that posture is right for student work:** student photos
must be private, readable only by the student and the grading teacher, and
deletable on a retention clock. A second, **private** bucket with its own
policies is required. The raw-fetch pattern carries over unchanged, and so does
the DECISIONS.md lesson about the gate: the gate is the session token plus the
policy, and the client's checks only exist to give friendly messages.

**R-4. Storage is stubbed out of the student shell on purpose.**
`@supabase/storage-js` is aliased to an inert stub (`supabase.storage.from()`
throws). The student shell has a fixed ceiling (`SHELL_JS_GZ_KIB` = 158.7, every
change records a `SHELL_SPEND` row, ±256 B band). Block bindings are lazy unless
named in `packages/viewer/tests/eagerBlocks.ts`. **So the photo block must be
lazy, its upload code must be raw `fetch` inside the lazy chunk (as
`uploadImage.ts` is), and it must not un-stub storage-js.** The expected cost to
the shell is the registry entry and its lazy loader, which should fit inside the
band. That is a prediction, to be measured in slice 2.

**R-5. Deleting the bytes is not a SQL operation.** Every retention mechanism so
far (`purge_soft_deleted`, the `prune_*` functions) deletes rows in SQL, and
child rows go with the parent by CASCADE. **A Storage object's bytes do not go
with its row.** By Supabase's documented rule, deleting from `storage.objects`
in SQL leaves the stored file behind, and newer Storage versions refuse a
direct delete outright. Media bytes have to be removed through the Storage API,
with the service role, from something that is not `pg_cron` SQL. That is a new
moving part, and it is the biggest one in this design (§6.4). Slice 1 has to
prove the deletion against live, as a P3 liveness proof, and not take this
paragraph's word for it.

**R-6. The offline buffer is localStorage and cannot hold photos.** The
response buffer (`store/buffer.ts`) and the document cache write to
localStorage (about 5M UTF-16 code units, which the document cache already
draws on). Queued checks survive a closed lid because their intent lives in the
buffer (`store/queue.ts`). A 500 KB JPEG does not belong there. Offline photo
capture would need IndexedDB, a new store that the sign-out purge
(`signOutEverything`) and the boot sweep would both have to learn. The author
ruled it into v1 anyway (MS-6), and §8 designs it.

**R-7. Retention keys on accounts and activities, not classes, with one
precedent for a class clock.** `section_checks` lives 400 days through the
account path, or 30 days through activity deletion (retention-policy.md →
Windows). The one shorter, class-keyed window is the timed number-facts data:
"the school year it was made in, plus 30 days", where the year is
`classes.school_year_ends_on` (0048), copied onto each row as `keep_until` when
the probe opens. That is the obvious model for photos (§6.5).

**R-8. Under-13 use is authorized per class, and nothing behaves differently
for an under-13 class.** 0053 records `classes.includes_under_13`. Ruling U-3
says the mark is a record only. Counsel's answer of 2026-10-06 ("current
measures are sufficient", Q1–Q11) covered the data that existed then. **Photos
of students' work are a new class of personal data that the answer did not
cover** (§6.7). The counsel packet's next free number is **Q14**: Q12 is
earmarked for the mixed-practice window, and Q13 is the video draft.

**R-9. The AI seam is text-shaped.** The 0042 claim functions select
`responses->'freeText'` and key supersession on `md5(response_text)`
(`source_text_hash`). The worker is a text model behind vLLM, and its model half
is parked until the GPU box arrives. A photo has no text to hash and no model to
read it (§7).

**R-10. The data map's Systems table has no Supabase Storage row.** Its R2
row (data-map.md:379) says the platform "serves no object storage today",
which stopped being true at 0019 (`activity-images` holds teacher content, no
personal data). Slice 1 adds a Storage row covering both buckets and corrects
that sentence, because the new bucket *does* hold personal data.

**R-12. There is no "student may open this activity" gate to reuse.**
`get_activity_version_for_check` (0020) admits any authenticated user on any
published activity. It has no role test and no class test, and the queue
separates link-share strangers by an `in_your_class` flag (`grading.ts`). For
text that was an accepted posture. For images, a stranger's photo reaching a
teacher's queue, and unbounded uploads by any account, are not acceptable
(MS-17).

**R-11. ROADMAP's quota and tier mechanics predate the Supabase-only
hosting.** It plans media on "a private R2 bucket" (R2 is gone, D-13), a quota
of about 500 MB per teacher with a 90-day purge, and an Edge Function that
signs uploads. Under 0019's ruling, uploads go straight to Storage and the
policy is the gate. As DECISIONS.md names it, the one-way door is that any
quota becomes database-side machinery. The tier-based quota idea stays future
work. v1 needs only a **cost meter** that the author reads (§6.8).

---

## 2. What v1 is

**A student answers a question by photographing their handwritten working
and attaching it. The teacher sees the photo in the Responses queue, grades it
against the block's rubric, and releases the grade with feedback, exactly as
for a short answer.**

The Y7–10 maths uses that motivate it: "show your working" on a multi-step
problem; a drawn net or construction (S82, which the curriculum side currently
narrows to "identify and complete" because a drawing can't be handed in); a
hand-drawn graph, histogram or stem-and-leaf plot; a proof or a geometric
argument whose layout matters more than its text.

**Not v1:** audio, video, arbitrary files, in-page webcam capture, offline
photo capture, machine reading of the photo, student self-check from a photo,
and any teacher-side scanning (that is photo-grading.md's feature).

---

## 3. The block

### 3.1 A new block type: `photo_response`

Named by shape (CLAUDE.md: `numeric_input`, not `physics_quantity`). It is a
sibling of `short_answer`, with the same teacher-only fields so the two cannot
drift apart:

```ts
PhotoResponseBlock = {
  id: uuid,
  type: 'photo_response',
  prompt: InlineNode[],          // "Photograph your working for Q3"
  maxPhotos: 1 | 2 | 3,          // default 1 (MS-4)
  workSpace?: number,            // print box height, rem (S2's unit)
  rubric?: Rubric,               // E8: absent = a 1-point question
  answer?: InlineNode[],         // teacher-only marking guide (E2)
  solution?: InlineNode[],       // released after check, like every solution
  ...labelFields,                // numbered like short_answer (N6)
}
```

It sits in the column beside the question it belongs to, like any other block.
⚠ **Corrected while building slice 1 (2026-11-18):** an earlier draft placed it
"inside a `problem` container". There is no such container. `problem` is a
legacy inline block with no children, and blocks sit flat at
`sections → rows → columns → blocks`. That flat path is the one every SQL
lookup walks (0078's `video_source`, 0093's `reserve_work_photo`). **The alternative was an
`allowPhoto` field on `short_answer`** (type the answer, attach the working).
I recommend against it for v1 (MS-2). It changes the grading shape of the most
common free-text block. It also makes one block carry two response maps, which
every consumer (queue, progress, DoL prefill, answer key) would have to learn.
And a field like that is the shape that produced this repo's orphans. A separate
block placed right after the question gives the same classroom result with none of that
coupling.

**Every field must reach rendered output** (close-out question 1): `prompt`
and `maxPhotos` reach the viewer, `workSpace` reaches print, `rubric` reaches
`GradePanel`, `answer` reaches the printed key, and `solution` reaches the
post-check reveal. Each gets a guard bound to output and is mutation-tested
once.

### 3.2 The response on the wire

```ts
// SectionResponses, wire v4
photos: Record<blockId, PhotoRef[]>   // 0..maxPhotos, in the student's order
PhotoRef = { id: uuid }               // the object is {activityId}/{studentId}/{id}.jpg
```

The **id** travels, never a path, URL or bytes. The server builds the object
key from the check's own activity, the caller's uid and the id, so a client
cannot point a check at another student's or another activity's object.

**Validation**, inside `record_check`'s own transaction:

- The `work_photos` row must belong to the caller, to this activity and to
  **this block**. One photo cannot answer two questions.
- The block must be a `photo_response` in the served version.
- The count must be at most `maxPhotos`.
- `photo_clearance` must be on (§6.6).

A ref that fails any of these is tampering, and **the whole check is refused**
with a named contract string. One exception: a ref whose row was **removed by
retention** (a re-check months later, or a stale queued check) is recorded as
`removed` and the check proceeds. A student's re-check never fails because the
sweep ran.

The same transaction sets `attached_at` and `keep_until` on every photo it
references. That makes it impossible for a photo a check references to be
swept as unattached. The check then records the "Recorded, your teacher will
review" verdict that manual blocks already get. Width, height and byte count
come from the `work_photos` row (§6.2), never from the client.

**Wire v4 rollout.** Versions must match exactly, so the moment
`check-activity` moves to v4, every open v3 page gets "refresh to continue"
on its next check. The deploy and the push therefore happen together, outside
NZ and US school hours. That is the T7 rule from the shell-size review, and the
no-reload-under-a-working-user ruling: we notify, we never force a reload
(MS-21).

---

## 4. Capture versus upload on school devices

**The constraint that matters most is one the author knows better than this
document: what the students will be holding.** As far as I know, NZ schools
have kept phones away during the school day since 2024. If so, the camera in
class is the school device's own. The design has to work on three fleets:

| Device | `<input type="file" accept="image/*" capture="environment">` | In-page camera (getUserMedia) |
|---|---|---|
| iPad / Android tablet | Opens the rear camera directly. Best case. | Works, but adds nothing. |
| Phone (homework, BYOD) | Opens the rear camera directly. | Same. |
| Chromebook | **Opens the file picker** (ChromeOS ignores `capture`). The student uses the Camera app and then picks the file, or picks a scan. Clumsy, but it works. | Front-facing webcam: hold the paper up to the screen. Mirrored, about 720p, and awkward. |

**Ruled (MS-3): the native file input, plus a phone QR handoff (§4.1).** The
file input costs no JavaScript, works on every fleet, and gives tablets and
phones a one-tap camera. The handoff gives Chromebook students a phone camera
without signing in on the phone, which covers homework at home and class time
when the teacher allows phones. An in-page webcam capture stays deferred.
**Trigger: a real Chromebook class finds both paths unworkable.**

### 4.1 The phone QR handoff

```
Chromebook (signed in)                      Phone (no sign-in)
"Use my phone" ── start_photo_handoff ──►   QR: {origin}/h#<code>
   shows QR, 10:00 countdown                opens the /h page, takes the photo,
   polls handoff_status every 3 s   ◄────   POST photo-handoff (code + JPEG)
   "Photo 1 arrived" → thumbnail            "Sent. You can close this page."
```

- **`start_photo_handoff(activity, version, block)`** is a signed-in student
  RPC. It applies the same gates as `reserve_work_photo` (§6.2): clearance,
  class membership, the cap and the block type. It also refuses in **quiz and
  exam modes**, where a phone out is a phone for looking things up. It returns
  a 32-byte random code and stores **only its sha256**, along with the student,
  the block, `expires_at` (10 minutes) and the slots left
  (`maxPhotos` minus the photos already attached). Closing the QR panel
  revokes the code.
- **The code travels in the URL fragment** (`/h#…`), so it never reaches a
  server log as a path or query string.
- **`/h` is a tiny standalone lazy route.** It loads no viewer and no session.
  It shows the question's label only and never the student's name. The person
  holding the phone may be a parent or a classmate.
- **`photo-handoff`** is an Edge Function with **`verify_jwt: false`**, the
  second such function. It hashes the code, finds a live handoff, re-checks
  clearance and the flow mode, reserves the photo for that student with the
  service role, writes the object, and decrements the slots left. It holds no
  session and returns nothing about the student. It is rate-limited per code
  (no more uploads than the slots left) and has a global ceiling. Its source
  marks the `work_photos` row `source = 'handoff'`.
- **The Chromebook polls** `handoff_status` while the panel is open. Realtime
  stays stubbed, and polling is the help-request precedent. Each arrival joins
  the block's photo list exactly as a local upload does.
- **Threat model.** If a classmate photographs the code, they can upload into
  that one question for at most 10 minutes. The student sees every arrival and
  can remove it. The code can read nothing.
- **Personal data:** a `photo_handoffs` row (student, block, code hash, times,
  slots) is deleted one day after it expires. It goes in the data map and
  retention policy, and Q14 gains (f): an upload path that needs no sign-in,
  bound by a short-lived code.
- **Duties when built:** config.toml carries the flag, `pnpm
  deploy:photo-handoff` (with `--no-verify-jwt`) is added, CLAUDE.md's
  "`get-activity` is the ONLY function…" rule is amended in the same commit,
  and the deploy is verified by hash.

**Formats.** iOS converts HEIC to JPEG for an `image/*` file input. Chrome on
ChromeOS cannot decode HEIC in a canvas, so a HEIC file picked from Drive fails
with a plain message: "This photo type can't be read here. Save it as JPEG or
PNG and try again." PNG, JPEG and WebP are accepted as input. GIF and SVG are
not (SVG can carry script).

---

## 5. Size and length limits

**The client re-encodes every photo before upload** (canvas →
`toBlob('image/jpeg', 0.8)`, long edge capped at **2000 px**, orientation
applied from EXIF on decode). That one step does three jobs:

1. **Size.** A phone photo of a page goes from 3–12 MB to roughly 250–600 KB.
   At 2000 px, an A4 page is about 170 dpi, which is plenty for handwriting.
   (The 2000 px and 0.8 figures are starting values. Slice 2 measures them on
   real photos of real working, and MS-5 lets the author move them.)
2. **Privacy.** Re-encoding drops all metadata, **including GPS location and
   the device's identity**. Without this step, a photo taken at home tells the
   teacher where the student lives. Slice 2 gets a guard for it: a fixture JPEG
   with GPS EXIF goes in, and none comes out.
3. **One server-side type.** Every upload is `image/jpeg`, so the bucket's
   `allowed_mime_types` can be exactly that one type.

**Limits (MS-5):** an input of up to 25 MB is accepted client-side for
re-encoding. Bigger files are refused with a message. After re-encoding, the
bucket limit is **1.5 MB** (`file_size_limit`, load-bearing like 0019's), with
up to `maxPhotos` (≤ 3) photos per block. Supabase image transformations
(server-side resizing) are a Pro-plan feature and are not relied on.

**Audio and video length limits** are decided with their own slices. For the
record, ROADMAP's estimate of about 50 MB for 5 minutes of 720p video is why
video is the cost cliff and photos are not.

---

## 6. Storage, privacy and retention

### 6.1 The bucket

A new **private** bucket, `student-work`: `public = false`,
`file_size_limit = 1572864`, `allowed_mime_types = {image/jpeg}`. The key layout
is load-bearing in the same way 0019's is:

```
{activityId}/{studentId}/{photoId}.jpg
```

**Policies** (every ownership test calls a helper; none is inlined):

- **INSERT** `to authenticated`: there must be exactly two folder segments, plus
  a filename, all uuid-shaped behind 0019's CASE guard. Segment 2 must equal
  `auth.uid()`, and the filename's id must be an **open reservation** owned by
  the caller (a helper, `work_photo_reserved(id)`; see §6.2). The reservation
  RPC is where every other rule lives, so the policy stays one helper call.
- **SELECT** `to authenticated`: the owner (`owner_id = auth.uid()::text`), or
  `can_edit_activity(segment 1)`. **This is `can_edit_activity`, not
  `can_read_activity`**, for G3's reason: the read helper is the recorded
  Activity-Bank landmine, and widening it must never grant a view of students'
  work. A SELECT policy is what makes signed URLs possible (§6.3).
- **No UPDATE.** Objects stay immutable. A retake is a new object.
- **No DELETE for clients.** Deletion is the sweep's job (§6.4), using the
  service role.

`scripts/verify-student-work.sql` mirrors `verify-image-storage.sql`'s
impersonation matrix: a student's own key, another student's key, a teacher's
upload, a non-owner teacher's read, a co-reader, a non-uuid segment, a nested
key, and an overwrite.

### 6.2 The record: `work_photos`

One row per photo. **The row comes first and the upload second**, so no object
can exist without a row. In the other order, a client that skipped or lost the
registration call would leave bytes that nothing ever deletes.

1. **`reserve_work_photo(activity, version, block)`**, a SECURITY DEFINER
   function, is the gate. It refuses unless all of these hold:
   - `photo_clearance` is on;
   - the caller is a student **in a class the activity is assigned to**
     (`class_activities` and `class_members`; MS-17);
   - the block is a `photo_response` in that version;
   - the caller is under the **cap**: at most `maxPhotos × 3` reservations per
     student per block, and a per-student daily ceiling.

   It then inserts the row and returns its id.
2. The client uploads to `{activityId}/{uid}/{id}.jpg`. The INSERT policy admits
   only an open reservation.
3. As a backstop, the sweep also deletes any object in the bucket that has no
   row, in case a future path breaks step 1's order.

**As built (0093):** the `bytes`, `width` and `height` columns were dropped.
Storage keeps no image dimensions, and the size is already in
`storage.objects.metadata`. The cost meter (`work_photo_usage()`) reads it
there, so no size is ever stored twice or taken from a client. The table also
gained `source` (`device` or `handoff`) and a generated `object_name`, which is
the only thing either storage policy compares, as text.

The columns:

| column | why |
|---|---|
| `id` uuid PK | = the photo id in the key and on the wire |
| `student_id` → users ON DELETE CASCADE | the account path removes the row |
| `activity_id` → activities ON DELETE CASCADE | the activity-deletion path removes the row |
| `activity_version_id` → activity_versions **ON DELETE CASCADE**, `block_id` | which question it answers. The CASCADE is required: `purge_soft_deleted` deletes versions before activities, and a default (RESTRICT) key would abort the nightly purge |
| `created_at` | when it was uploaded |
| `attached_at` | the first check that referenced it (NULL = never handed in) |
| `keep_until` | the retention clock (§6.5) |

The table exists so that photos are **countable, visible in the data map,
verifiable in SQL and removable on a clock**. Without it, retention would have
to scan the `section_checks` jsonb for references, and the cost meter would
have to read Storage's internals. It holds no image data.

### 6.3 Who can see a student's photo

- **The student**, on their own device: their own photos while they work, after
  they check, and through restore mode on another device.
- **The teacher who owns the activity** (`can_edit_activity`): in the
  Responses queue and the grading panel, and only for photos a check
  references. Unattached uploads never appear in any teacher surface.
- **Nobody else.** There is no anonymous path, no public URL, no Bank copy (a
  Bank copy copies the activity, never its checks), and no class-progress
  thumbnail in v1.

**Reading uses short-lived signed URLs.** One `POST /object/sign` call per
queue page, with a 10-minute expiry, behind the SELECT policy. The browser caches
the bytes for those 10 minutes and the teacher's own page never holds a durable
link. The alternative was an authenticated fetch into a `blob:` URL. It is
tighter (no bearer URL exists at all) but costs a JavaScript fetch per image;
MS-8 asks.

**Reads are not audited in v1.** ROADMAP committed to "audit log records every
signed-URL issuance". I found no surface where a teacher's *read* of student
work is audited today: reading `section_checks` text is not, and grade writes
are. Auditing photo reads would need the signing to go through an Edge Function
or RPC hop, which costs a cold start per queue page. I recommend matching the
existing posture and asking counsel (MS-9, inside Q14). This is a deliberate
departure from ROADMAP, so it is named.

### 6.4 Deleting the bytes: the sweep

The `work_photos` row is the source of truth. When a row goes, the object must
follow. In outline:

1. An `AFTER DELETE` trigger on `work_photos` writes the object key into
   `work_photo_deletions(object_name, queued_at)`. That table has no student
   columns, only the key, which embeds the student's uuid. The data map says so.
2. A scheduled **Edge Function, `sweep-work-photos`** (`verify_jwt: true`, called
   by `pg_cron` + `pg_net` with a service credential held in Vault), drains the
   queue in batches through the Storage API's bulk delete. It deletes a queue
   row only after the Storage API confirms the delete.
3. The same function also deletes **unattached** uploads older than the grace
   window (§6.5). It does so by deleting their `work_photos` rows, so that
   step 1 handles the bytes.
   **As built (0093, after the slice-1 Fable review):** the row deletion is
   also scheduled **directly in SQL** (`sweep-work-photo-rows`). So access ends
   on time even if the HTTP call fails, and the function only has to make the
   bytes follow. The function compares its bearer to the service-role key
   exactly, rather than reading a decoded claim. It drains in a loop for up to
   45 s. `verify-0093`'s `photos_not_overdue` row is the alarm.
4. The sweep is **dry-run by default and unscheduled when it ships**, like
   every other function here that deletes student work. Arming it needs the
   author's explicit yes, and a `verify-*` row pins the schedule once armed (the
   0090 precedent). **Unlike the other prunes, it has to be armed before the
   first student photo**, because an unarmed sweep means photos outlive the
   policy that counsel was told about (MS-11).

This adds a third Edge Function, a Vault secret, `pg_net`, and the CLAUDE.md
duties that come with all of them: config.toml is the record of the flag, a
`deploy:` script, deploys verified by hash, and the migration applied before the
deploy. The alternative, a "sweep" script run by the author from a laptop, is
cheaper to build and fails silently the first time it is forgotten. I don't
recommend it.

### 6.5 How long a photo is kept

The `section_checks` window (400 days of dormancy, or 30 days after activity
deletion) is far longer than a photo needs. A photo is evidence for a grade,
the grade outlives it as a row, and a photo can show more than the work (a
hand, a desk, a sibling's name on the next page). **Ruled (MS-10, author
2026-11-18): a graded photo is kept at most 30 days after its grade is
released.**

- **On attach** (inside `record_check`, §3.2), `keep_until` gets the fallback
  ceiling, 0048's exact formula: `least(ends_on + 30, current_date + 400)`.
  Here `ends_on` is the latest `school_year_ends_on` among **the student's own
  classes that the activity is assigned to**, and if none is set the value is
  `current_date + 400`. This is the clock for a photo that is never graded or
  never released.
- **On release** (`release_check_grades`, re-created in slice 3), every photo
  the released check references gets `keep_until = least(keep_until,
  released_at + 30 days)`. A later re-grade or re-release never extends it. A
  re-check after release carries new photo ids, and those get their own clocks.
- **Whichever comes first applies**: the account and activity paths still
  remove the row by CASCADE before `keep_until` if they fire first. A later
  re-check that attaches the same photo again does not extend its clock.
- **What it means in practice:** the student has a month after the grade comes
  back to look at their photo beside the feedback, and the teacher has the same
  month for questions. After that, only the grade and the written feedback
  remain. This also cuts storage by roughly an order of magnitude against the
  first draft's school-year window (§6.8).
- **A student leaving the class, or the class being deleted, does not shorten
  the clock** (recommended, MS-20). The account path's dormancy already covers
  the student who leaves for good, and a photo the teacher is mid-way through
  grading should not vanish because of a roster move.
- **Unattached uploads: 7 days** on the server. That covers a weekend plus a
  slow check. A photo still waiting on the device (offline, §8) is not on the
  server yet, so this clock cannot eat unsent work (DECISIONS.md, "The orphan
  GC must never eat unsent work"). A photo that uploaded but whose queued check
  sat for more than 7 days is recorded as `removed` (§3.2), and the device copy
  is kept until the check succeeds, so the student can re-attach it.
- **After removal** the grade stays, and the Responses queue and the student's
  released feedback show "Photo removed 30 days after the grade was released"
  (or "…at the end of the school year" for the fallback) in the place of the
  image. A grade is never silently left with nothing beside it.

### 6.6 A clearance switch for students

The `video_clearance` precedent: a platform setting, **`photo_clearance`, off
by default**. Until it is on, a `photo_response` block renders for its owning
teacher (preview, playtest), and students see "Your teacher hasn't turned
photo answers on yet." Their Check still works for the rest of the section.
**Clearance is enforced on the server, not only in the rendering:**
`reserve_work_photo` and `record_check` both refuse photos while it is off. As
a result, a hand-built POST cannot create a student photo before clearance (the
INSERT policy admits only a reservation, and no reservation can exist). The
switch goes on only after its checklist is done: counsel's Q14 answered,
the sweep armed, the live deletion proof run, and the compliance pack updated
(MS-12). This lets the whole feature be built, deployed and tested against live
before any student photo exists.

### 6.7 Counsel (the new question, Q14)

Drafted in slice 1, sent by the author. It asks:

- (a) Photos of students' handwritten work are a new class of personal data.
  They may incidentally show a face, hands, a home or another student's name.
  Does the current posture suffice? That posture is: a private bucket, the
  owning teacher only, EXIF stripped, kept 30 days after the grade is released
  (a school-year-plus-30 ceiling otherwise), no third party, and a copy held on
  the student's device only until it uploads or they sign out.
- (b) Does (a) change **for classes marked `includes_under_13`**? If counsel
  says yes, that is a new ruling that breaks U-3's "nothing behaves
  differently", and the author makes it. The design does not pre-build a branch.
- (c) Is an unaudited teacher read (§6.3) acceptable?
- (d) Sending a photo to a **hosted** vision model would be a disclosure to a
  third party. It is not in v1 (§7), and this question only records that it
  would need its own answer.
- (e) **Content scanning.** ROADMAP 2.8 deferred this question to the start of
  the phase. v1 recommends none: only the owning teacher sees a photo,
  scanning students' images is itself a privacy cost, and uploads are limited
  to class members under a cap. Does counsel agree, or does a school's duty of
  care require a "report this image" path for the teacher? (MS-22)
- (f) **An upload path that needs no sign-in** (the phone handoff, §4.1). It is
  bound by a 10-minute code tied to one student and one question, and that
  code can read nothing. Is that acceptable, including for under-13 classes?

The student-facing copy at the capture point is part of the privacy posture,
not decoration: **"Photograph only your working. Keep faces and names out of
the picture."**

### 6.8 Cost: the meter, not a quota

Supabase's free plan includes a small storage allowance, about 1 GB at the time
of writing (the author should read the current figure off the dashboard, since
plan terms change). A rough class-year: 30 students × 3 photos a week × 40
weeks × about 350 KB is roughly **1.3 GB per class** if it is all kept. Under
the ruled 30-days-after-release window, what is held at any moment is closer
to six weeks of photos: about 0.2 GB per class, or about 1 GB for four or five
classes. That is still at the edge of the free allowance.

**Ruled (MS-13): move to the Supabase Pro plan before the February classes.**
That removes the cliff. It also buys daily backups of student work, the image
caching DECISIONS.md records as lost on the free tier, and server-side image
resizing. The rest of the recommendation stands: **no quota and no submission
blocking** (ROADMAP's rule: a quota governs retention, never submission), and
**a cost meter**. That is one SQL read summing each photo's stored size (from `storage.objects.metadata`, `work_photo_usage()`) by teacher
and in total, run by the weekly job-health task and shown on the teacher's
settings page. The plan change is an author action (dashboard) and goes on the
slice 5 checklist before `photo_clearance` flips.

---

## 7. Grading, and where AI fits

**Teacher grading (slice 3)** reuses 0034's rails with no new grade model:

- `photo_response` joins the manually graded set. The migration should
  **extract that set into one SQL helper**
  (`is_manually_graded_type(text) returns boolean`, IMMUTABLE) and re-create
  every live function that inlines `('short_answer', 'essay')` to call it (R-2).
  The TypeScript lists in `dolPrimary.ts` and `dolOptional.ts` move to one
  exported constant. A verify row asserts that no live function body still
  contains the literal pair. That guard is bound to the deployed definitions,
  not to the migration files.
- **The queue row** shows thumbnails (the signed URLs from §6.3). Clicking one
  opens a full-size view with zoom and a **view-only rotate**: phone photos
  arrive sideways often enough, and rotation is a display choice that never
  rewrites the object. The rubric, feedback, Save, Next and release work
  unchanged.
- **Staleness (D5) does NOT work unchanged.** It compares `freeText` only, so
  as built a re-check with new photos would never go amber.
  `list_grading_queue` and `get_my_released_feedback` gain a photo
  comparison: **the ordered list of photo ids differs** (MS-18). The queue's
  `response_text` gains a `response_photos` counterpart.
- **Class progress, first tries and the student's answer panel** count a
  photo answer as answered, and as "to grade" until graded (the family arrays
  in R-2). They show a "Photo" label, not a thumbnail (MS-19).
- **Released feedback** shows the student their own photo beside the grade.

**The AI seam: v1 excludes photos by name, and keeps the door open.**

- The 0042 claim functions select only text responses (R-9). Slice 3 adds
  `photo_response` to the queue's types but **not** to the claim's. A verify
  row pins that exclusion, so a photo can never be sent to the text worker by
  accident.
- When vision grading unparks (the drawn-work wish, once the GPU box arrives),
  the supersession key generalizes from `md5(text)` to a hash over the ordered
  photo ids. Ids are immutable, so the same photos give the same key. Every
  other rail stays as it is: a suggestion is not a grade, conversion happens
  only through `confirm_grade_suggestion`, and machine confidence is never
  student confidence. That arc needs its own model validation (a visual E2b
  golden run). If a **hosted** model is used, it also needs Q14(d) answered.
  This design builds none of it.

---

## 8. Print and offline

**Print.** On paper, the paper *is* the work, so a `photo_response` prints as
its prompt plus a bordered work box. The box height comes from `workSpace`,
in rem; the default is 12em, essay-sized, because working takes room. The box
carries no capture control and no "attach a photo" text. The printed answer key
prints `answer`, then `solution`, then "manually graded, see rubric" (the
existing fallback chain in `answer-key/extract.ts`). A print-parity row goes
into `registry/printExpectations.ts`.

**Offline (MS-6, ruled 2026-11-18: in v1).** A photo taken with no connection
is kept on the device and uploads by itself when the connection returns, so
the platform's existing promise ("will check when you're back online") holds
for photos too.

- **The device store.** An IndexedDB database under the viewer's existing
  `activity-viewer:` naming, keyed by (student uid, activity, version, block,
  local id). It holds the **re-encoded** JPEG, never the original, so EXIF is
  already gone before anything is stored. localStorage stays as it is. The
  buffer records only the local ids, so the queue's "one answer to 'is this
  pending?'" rule (S6-8) still holds.
- **Upload order.** When the connection returns, `queue.ts`'s runner first
  refreshes the session, then **uploads the section's waiting photos**
  (reserve, upload, swap the local id for the server id in the buffer), and
  only then fires that section's queued check. A photo that fails to upload
  holds its own section's check, with a visible "Photo waiting to upload"
  state. Other sections still fire.
- **The states the block shows:** waiting (offline, "Saved on this device. It
  will upload when you're back online."), uploading (a progress bar),
  attached (a thumbnail with Remove), and failed (Retry, with the reason).
- **Check with a photo that is missing** (none taken) gets a confirm, modelled
  on the lock confirm that already counts blank answers: "Your photo for
  question 3 hasn't been added. Check anyway?" A photo that is waiting is not
  missing: the check simply waits for it.
- **Clearing the store**, the part that makes this safe on shared Chromebooks:
  - **Sign-out** (`signOutEverything`) deletes the whole database, including
    photos still waiting, after a confirm that names them ("1 photo hasn't
    uploaded yet. Signing out will delete it."). The idle bar's sign-out
    warning already names what it clears, and it learns photos.
  - **The boot sweep** deletes entries belonging to any other uid, and entries
    the server has confirmed attached.
  - **The orphan GC** follows DECISIONS.md's rule: it never deletes a photo
    that a pending check or the buffer still references.
- **Quota.** At most 3 photos per block, at about 350 KB each, is small against
  IndexedDB's allowance. A failed write (quota, or private mode) falls back to
  online-only for that photo, with the plain offline message.
- **The privacy question** (a photo sitting on a shared device until it
  uploads or the student signs out) goes to counsel inside Q14(a).

**Shared devices, beyond the store.** Thumbnails use signed URLs that expire in
10 minutes and live in the HTTP cache. The service worker never caches the API
(DECISIONS.md), so it never holds these URLs either. The build checks the URLs
are absent from the runtime cache. The data map's browser-storage row gains
the photo store.

**Flow modes.** The recommendation (MS-23) is that a `photo_response` follows
the same lock, quiz, exam and DoL rules as `short_answer`. That means it can be
a DoL's primary evidence (a drawn net graded at A/M/E), and it can sit in a
quiz or an exam. Once a section is locked, its photo list is read-only, and
Remove is hidden.

---

## 9. Editor GUI (the GUI rule)

- **Insert:** a slash-menu and Insert-menu entry, **"Photo of working"**, in
  the questions group, inserted like any other block (there is no `problem`
  container to offer it from; see §3.1).
- **Edit (the NodeView):** an inline prompt editor; a "Photos allowed: 1 / 2 / 3"
  segmented control; the same rubric editor `short_answer` uses (shared
  component, not a copy); `answer` and `solution` fields; numbering (the N6
  four-link chain, including `LABELED_BLOCK_TYPES` in `serialize.ts`); and the
  print box height under print settings. The canvas preview shows a disabled
  "Add a photo" button so the teacher sees what students will see.
- **Remove:** the standard block delete.
- **Roster:** a row in `lib/guiSurfaces.ts` (`{ slash: 'Photo of working' }`).
  The build also checks whether a block with no importer fence needs a
  `capabilityFacts.ts` JOIN entry at all, and fixes the roster accordingly.

**The markdown importer and the catalogue (MS-14).** It comes after the GUI,
not with it. A ```` ```photo ```` fence, the authoring prompt
(`pnpm prompt:catalogue`), `docs/capability-facts.json`, and the pin-bump PR on
the curriculum repo all follow once the GUI slice has shown the block works.
The curriculum side's drawn-work items are the reason to do it, and they are
not authorable until the pin bump lands (§9 of their contract). This is the
slice where their nets and "draw" items stop being designed around.

---

## 10. Build slices

Each slice gets a Fable review before it counts as done (the author's standing
rule). Each runs `pnpm verify` cold (`.tsbuildinfo` deleted), with the
Playwright lanes for UI slices and `.env.local` set aside. Migrations are
applied before any push of UI that calls them (OV-7).

| # | Slice | Author actions |
|---|---|---|
| **1** | **Storage and record.** Migration 0093: the `student-work` bucket and its policies, `work_photos`, `work_photo_deletions` with its trigger, `reserve_work_photo`, `photo_clearance` (off), and `verify-0093` plus `verify-student-work.sql`. The `sweep-work-photos` Edge Function (dry-run, unscheduled) and its config.toml entry and `deploy:` script. **The compliance pack goes in the same commit:** data-map rows (bucket, both tables, and the corrected Systems row, R-10), a retention-policy row, and the Q14 draft. A live deletion proof (P3), run on test objects along every path, confirming each object is gone from Storage: a direct row delete, the account purge cascade, the activity purge cascade (versions before activities), an unattached upload past 7 days, and an object with no row. | Apply 0093; deploy the sweep; create the Vault secret; send Q14 |
| | ⚠ **Measured while building slice 1 (the e2e's G17, 2026-11-18):** a signed upload URL (`/object/upload/sign`), issued while a reservation is open, **still uploads after `photo_clearance` goes off**. Storage checks the INSERT policy when it signs, not when the URL is used. So slice 2's attach (in `record_check`) must re-read `photo_clearance` and **require the object to exist** before setting `attached_at`. Then a URL signed before attach can never place bytes under an attached key (the object exists, and an upsert needs UPDATE). | |
| **2** | **The student block.** Schema, the sanitize registry, a lazy viewer binding, the capture and upload chunk (re-encode, EXIF guard, raw fetch, progress, retry), wire v4 `photos`, and `check-activity` validating the refs. Both server bundles are rebuilt and committed. A `SHELL_SPEND` row is added if the shell moves outside the band. **As built, plus migration 0094 and the editor node** (below). | Apply 0094; then push together with the `check-activity` and `get-activity` redeploys (wire v4), outside school hours, verified by hash |
| **2b** | **Offline photos** (MS-6): the IndexedDB store, queue ordering (photos before their section's check), the sign-out confirm and purge, the boot sweep, the GC exception, and the data-map browser-storage row. sw-lane rows prove a photo taken offline uploads and checks after reconnect, and that sign-out leaves nothing behind. | none (app-only) |
| **2c** | **Phone QR handoff** (MS-3, MS-24): migration for `photo_handoffs`, `start_photo_handoff` and `handoff_status`; the `photo-handoff` function (`verify_jwt: false`); the lazy `/h` route and the QR panel; the CLAUDE.md, config.toml and compliance rows; Q14(f). | Apply the migration first, then deploy `photo-handoff` with `--no-verify-jwt`, verified by hash |
| **3** | **Teacher grading.** Migration 0096 (renumbered: slices 2 and 2c took 0094 and 0095): `is_manually_graded_type` and the re-created functions, `release_check_grades` setting the 30-day `keep_until`, the queue's photo column, and the claim exclusion pinned. The queue thumbnails, the full-size view with rotate, released feedback with the photo, and the "removed" placeholder. | Apply 0096 |
| **4** | **Editor GUI and print.** The slash entry, NodeView, shared rubric editor, numbering chain, print box, answer key, print-parity row and roster row. **Mostly done in slice 2** (below); what is left is the print-parity row in `printExpectations.ts`, the Linux print baseline, and the roster row, which waits for slice 6's `JOIN` entry. | none (app-only) |
| **5** | **Turning it on.** Move to the Pro plan (MS-13), arm the sweep (author's yes, with a `verify` row pinning the schedule), run the cost-meter read, then the author flips `photo_clearance` once Q14 is answered. | Plan; arm; flip |
| **6** | **Importer and catalogue** (MS-14): the fence, the prompt regeneration, capability facts, and the pin-bump PR. | Push before the pin bump |

**Slice 2 as built (2026-11-18).** What changed against the plan above, and why:

- **It needed a migration, 0094**, which the table did not list. Handing a
  photo in is a database write, so it cannot live in the function alone. It is
  a **BEFORE INSERT trigger on `section_checks`**, not a fifth re-creation of
  `record_check`: the rule is about the row, so every insert path is covered,
  and `record_check`'s retry savepoints roll an attach back with a lost insert.
  The trigger re-reads `photo_clearance` and requires the object in Storage
  (the G17 requirement; the e2e's A3 row proves the closure through the real
  API). It stores refs normalized to `{id}`, and `{id, removed: true}` for a
  photo retention already removed.
- **A 30-day floor on the hand-in clock.** 0048's formula alone makes a photo
  handed in more than 30 days after its class's year-end due immediately, so
  the sweep would remove it before the teacher saw it.
- **Two student reads joined:** `photo_answers_on()` (the block shows "not
  turned on yet" up front, §6.6) and `discard_work_photo(id)` (Remove before a
  check deletes the photo at once rather than leaving it for the 7-day clock).
- **The split of the checks.** The handler checks SHAPE against the stored
  document (a photo block of this section, at most `maxPhotos`, uuid ids: 400
  `bad_photos`). The trigger checks ownership, upload and the switch.
- **The editor node came forward from slice 4.** `serialize.ts` is exhaustive
  over block types, and a node the editor cannot hold would be deleted by the
  first autosave (the E5.1 trap), so the block could not land without it. It
  shares `FreeResponseView` and the drawer's Grading, Print and Numbering
  groups with `short_answer`, adds a "Photos allowed" select, and has a slash
  entry, "Photo of working". Practice banks refuse it (`bankImport.ts`).
- **The EXIF guard is measured in a real browser** (`e2e/student/
  photo-response.e2e.ts`): a 3000×2000 JPEG with a GPS APP1 goes in; the
  uploaded bytes have no APP1, no "Exif", a 2000 px long edge, and fit the
  bucket. Mutation-tested (skipping the re-encode turns it red).
- **Bytes can be replaced after hand-in; a teacher never sees them** (the
  e2e's G18, found by the Fable review). A signed upload URL requested *with
  upsert* before the first upload passes Storage's sign-time check (an
  `INSERT … ON CONFLICT DO UPDATE` dry run against an absent object consults
  only the INSERT policy), and for about two hours it can replace the object,
  even after a check handed it in, because Storage writes with its own role. So
  0094 records the object's Storage `version` at hand-in
  (`work_photos.attached_object_version`), and the SELECT policy now gives the
  teacher a photo only while the live object still carries it. A replaced
  photo fails closed for the teacher; slice 3 must show it as "changed after it
  was handed in", not as an error. The student still reads their own object.
- **The switch never blocks the rest of a section.** With photos off, only a
  photo that would be NEWLY handed in is refused; refs already attached, or
  removed, pass. The client maps every photo refusal to its own state, "A
  photo here can't be handed in right now. Remove it, then check again.",
  never "try again".
- **A failed upload gives its reservation back** (`discard_work_photo`),
  so retries on bad Wi-Fi cannot use up the per-block cap for a week.
- **Clearance blockers — CLOSED by slice 2b (below).** As filed: (1) Check must wait for, or confirm over, a photo still
  uploading: today a check pressed mid-upload goes without it, and on a
  locked, quiz or DoL section the photo can then never be handed in.
  (2) A check that stored a photo as `removed` must tell the student, who
  otherwise sees a thumbnail beside "Recorded". (3) The "your photo hasn't
  been added, check anyway?" confirm.
- **Known, small:** the hand-in ceiling `(ends_on + 30)` is midnight UTC at
  the start of that day, the 0048 convention, so for a US class it lands
  hours early. Sideways photos (an EXIF Orientation tag) are applied by the
  decoder but not yet proved by a fixture.
- **Left for slice 3:** `lib/answerText.ts` (the answer panel's families) and
  `lib/grading.ts`'s block types do not know photos yet; the queue cannot show
  a photo answer until 0096.

**Slice 2b as built (2026-11-18).** No migration and no deploy (app and
viewer only, plus the `check-activity` read-back below, which rides the same
paired deploy as slice 2).

- **One model for "waiting".** A photo is in the answer from the moment it is
  taken, as a `local` ref whose JPEG is in IndexedDB
  (`blocks/photoStore.ts`; memory fallback when IndexedDB is unavailable).
  The page's one uploader (`blocks/photoUploader.ts`) reserves, uploads,
  swaps the device id for the server id (`store.swapPhoto`) and deletes the
  device copy. A ref keeps a stable `key` across the swap, so a queued check's
  drift notice never reads the upload as a changed answer. `local` and `key`
  never leave the device: the fire-time snapshot sends `{id}` alone.
- **The check waits** (blocker 1). `checkSection` queues a section whose
  photos are still local exactly as it queues an offline one, with its own
  line, "Will check once your photo has uploaded."; the queue skips that
  section (others still fire) and reruns when the last photo lands. Building
  this found a pre-existing race in `queue.ts`: a run requested after the
  loop's last `rerun` test but before its cleanup was dropped. Fixed; the
  swap-release test is its guard (a timing-only test for it was vacuous and
  was deleted).
- **Told when a photo wasn't handed in** (blocker 2). The handler reads the
  stored row back for a check that named photos (`checkPhotos`, service
  role, one extra read only then) and puts `removedPhotos` on the block's
  item; the block says so and drops them from the answer. A failed read-back
  costs the note, never the check.
- **The missing-photo confirm** (blocker 3), in every section, not only
  locked ones: "A photo question here has no photo yet. Check anyway?" A
  waiting photo is not missing. The fixture worksheet gives its photo question
  a section of its own (the first section is a checkpoint) so the lanes that
  press Check on it test what they were written for.
- **Departure: the device copy goes when the UPLOAD succeeds**, not when the
  check does (§6.5 said "kept until the check succeeds"). Less photo sits on a
  shared Chromebook; the rare queued-past-7-days case is now blocker 2's
  message ("add it again") instead of a silent re-attach.
- **Sign-out** deletes the IndexedDB database before the session ends
  (bounded to 3 s, never rejects), and the warning names waiting photos ("1
  photo hasn't uploaded yet. Signing out will delete it."). The boot sweep
  deletes other students' entries and any entry no buffer or live answer
  names — the GC rule.
- **Proved:** sw-lane rows with real IndexedDB and real offline (a photo
  taken offline waits on the device, Check waits, reconnect uploads and
  checks with the server id, the device copy is gone; sign-out leaves no
  photo database, mutation-tested), and student-lane rows (Check pressed
  mid-upload waits; the empty-photo confirm).
- **The Fable review of 2b found seven problems; all fixed, each with a test:**
  (1) a LOCKED or DoL section pending only on a photo froze, disabling that
  photo's Retry and Remove, so a failed upload stranded the section for good:
  it now stays editable until the photo lands ("Will check and lock once your
  photo has uploaded."); (2) the uploader outlived its route and could swap
  into a dead store and delete the device copy: the route now stops it
  (`stopPhotoUploads`); (3) the device copy was deleted before the buffer saved
  the swap, and two tabs raced: the server id is written to the device entry
  BEFORE the swap (a restart resumes, never re-uploads or loses), the copy goes
  2 s after, only the tab holding the lock uploads, and a photo removed
  mid-upload is discarded from Storage; (4) a Check pressed during the seconds
  of re-encoding went without the photo: the ref is named before re-encoding,
  with the write tracked; (5) another student's waiting photos outlived a crash
  until a photo question mounted: the route wipes the photo store when the
  boot sweep finds another student's work (unless this student has photos
  waiting), uploads refuse a session that is not the photo's student, and
  sign-out clears the memory fallback too; (6) no retry on lie-fi: transient
  failures back off and retry on their own, and on `visibilitychange`;
  (7) tests claimed a reload row that did not exist: it does now. Building the
  fixes found one more, the boot sweep deciding "referenced" from a snapshot
  taken before its first await, which collected a photo added while it ran.
- **Known gap:** Home's "couldn't load your account" frame signs out with no
  confirm at all (pre-existing, every kind of unsent work); the sw row uses it
  and so asserts the wipe, while the warning's words are a unit test.

**Slice 2c as built (2026-11-18).** Migration 0095 and a new Edge Function,
`photo-handoff` (`verify_jwt = false`, MS-24).

- **The mode rule, as ruled by the author on 2026-11-18:** the phone is
  refused in a **quiz or an exam only** (`meta.activityType`), as §4.1 was
  written. It is *not* refused in a `locked` activity or a DoL section (the
  "Ask my teacher" set was offered and declined). Checked at start and again
  at each upload, from the version's content.
- **One gate, two paths.** `reserve_work_photo`'s body moved into
  `photo_block_gate` + `reserve_photo_for` (service-only); the device path is
  now a wrapper and the phone path calls the same function with
  `source = 'handoff'`. verify-0093/0094 still pass unchanged.
- **The code** is 32 random bytes as 43 base64url characters, stored only as
  its sha256, sent by the phone in a multipart BODY (no CORS preflight), and
  carried to the phone in the URL fragment, which the phone page removes from
  the address bar and history at once. One live code per student: a new one
  ends the old. 20 starts a day per student; a global ceiling of 120 handoff
  photos a minute.
- **What the phone sees:** the activity's title and the question's prompt as
  text (`handoff_peek`), never the student. What it gets back from an upload:
  the slots left, nothing else (not even the photo's id; the Chromebook learns
  that from its own poll).
- **Server-side metadata strip.** This path has no sign-in, so the function
  does not rely on the phone's canvas re-encode alone: `jpegStrip.ts` walks
  the whole file, drops every APP1–APP15 and COM segment (between scans too),
  keeps APP0 only as a plain 16-byte JFIF header, stops at EOI (no trailer is
  stored) and refuses a file with no frame or scan (H5 on a real sips JPEG
  with Exif, Photoshop and ICC segments; mutation-tested). The device path
  still relies on the client re-encode, as slice 1 recorded.
- **Upload order:** reserve (takes a slot) → Storage write (never overwriting)
  → `handoff_confirm` records the arrival only once `storage.objects` has the
  bytes; a failed write calls `handoff_release`, which gives the slot back and
  deletes the reservation. Confirm is idempotent.
- **The Chromebook** polls `photo_handoff_status` every 3 s while the panel is
  open; each arrival joins the answer as an ordinary `{id}` ref (an arrival
  with no room left is discarded, never kept invisibly). Done, Escape and
  unmounting all revoke the code. The QR encoder is `uqr` 0.1.3 (MIT, no
  dependencies, pinned exact), in the panel's own lazy chunk; the shell paid
  259 B for the `/h` route (a SHELL_SPEND row).
- **The cleanup** `prune_photo_handoffs` (a day after expiry) is SCHEDULED by
  the migration where pg_cron exists (author's yes: codes, not student work);
  verify-0095's live-only row pins the one job.
- **Two bugs found while building:** (1) supabase-js builders are lazy, so
  `void client.rpc('end_photo_handoff', …)` sent nothing and Done never
  revoked a code (caught by the e2e; the unit fake now models the lazy
  builder, mutation-tested); (2) a superseded start answering late overwrote
  the live code's id, so Done would revoke the wrong one.
- **The Fable review of 2c found five real problems; all fixed, each with a
  test (mutation-tested):** (1) the panel ended on "no slots left", which is
  true between reserve and confirm, so the last photo was never added: it now
  ends only when every granted slot's photo has ARRIVED; (2) arrivals in the
  3 s before Done, and uploads that land after expiry, were dropped: Done
  polls once more, and the poll keeps listening for 60 s after a code stops;
  (3) a photo the student removed came back on the next poll as a ref to a
  deleted row: the panel remembers what it has seen; (4) a body with no
  Content-Length was buffered whole before any check: it is now read with a
  counter that stops at 2 MB; (5) the strip copied everything after the first
  SOS verbatim, so metadata between scans, a trailer, or a JFXX APP0 survived:
  it now walks the whole file. Also: the phone's daily-cap message, a retried
  confirm, and "within 2 days" in the retention wording.
- **Proved:** verify-0095 (catalog posture + 13 rolled-back behaviours),
  `scripts/tests/photo-handoff.test.mjs` (the handler and strip under Node),
  the H1–H10 rows of `verify-student-work-e2e.mjs` against the real function
  with no Authorization header, and two student-lane rows (the Chromebook QR
  → arrival → Done → Check; the phone page with no session, the fragment
  cleared, no EXIF in the sent form).

**Slice 3 as built (2026-11-19).** Migration 0096, the Responses queue, and
no function change beyond the two bundles' rebuild (a shared constant).

- **One set, two places.** `is_manually_graded_type` in SQL and
  `MANUALLY_GRADED_TYPES` / `isManuallyGraded` in `@activity/schema`; a node
  test binds them, and verify-0096's `no_inline_pair_left` row reads the
  DEPLOYED bodies. Two functions keep the literal pair on purpose:
  `claim_grade_suggestions` (the AI worker is text-only; `claim_excludes_photos`
  pins it) and `dol_optional_block`'s gradable list (bound to `isGradeable`).
- **Re-created from the live bodies**, so nothing but the type test changed:
  `validate_check_grade_criteria` (its refusal now reads "Only hand-graded
  questions can be graded"), `activity_progress`, `class_progress`,
  `dol_optional_block`. `list_grading_queue` gained `response_photos` (a new
  OUT column, so DROP + CREATE and its grants again).
- **Staleness (MS-18):** a graded photo answer is stale when the ORDERED list
  of photo ids differs (`photo_ids_of`, ignoring the `removed` flag), for the
  teacher and in the student's released feedback. Found while building: the
  viewer re-read released feedback after a re-check only for text answers, so
  a re-sent photo kept "Reviewed by your teacher" until a reload; it now
  re-reads for photo answers too.
- **Release (MS-10):** `release_check_grades` caps every photo the student
  handed in for a question before its first release (a photo replaced before
  grading included) at release + 30 days, with `least()`, so a re-release
  never extends it; a photo handed in after a release waits for the next one.
- **The queue:** the row reads "2 photos"; opening an answer signs THAT
  answer's photos in one `POST /object/sign` (re-signed every 9 minutes) and
  shows thumbnails and a full-size view with zoom and a view-only rotate.
  **A departure from §6.3** ("one sign call per queue page"): the Responses
  route has a 38 KiB budget, and signing per opened answer keeps the photo
  code in a lazy chunk; it is also tighter (no live URL for a photo the
  teacher never opened). The row has no thumbnail for the same reason. A photo
  the teacher may not read says why, from `work_photo_states`: "changed after
  it was handed in" (G18), "removed 30 days after the grade was released", or
  "removed at the end of the school year". The student's block says "removed
  30 days after your grade came back" once feedback is released.
- **Not needed:** first tries and common wrong answers read only
  correct/incorrect verdicts, and a photo's is `recorded`; the answer panel
  shows "Photo" / "2 photos", never a thumbnail (MS-19).
- **The Fable review of slice 3** found no blocker (no wrong grade, photo
  leak or retention error) and these gaps, all fixed with tests: the teacher's
  bulk-sign read had no real-stack proof (now T1–T3 in the Storage e2e); a
  photo replaced before grading kept the school-year clock (the release now
  caps every earlier photo of the question); the "a removed flag is not a
  change" property and the activity join in `work_photo_states` were
  unpinned (B5b, B6); B8 only called the helper (it now grades a short answer
  through the RPC); an absent photo key and an empty list read as different;
  some unavailable-photo lines gave a reason that might be untrue; the viewer
  never enlarged a small photo, overflowed when sideways, had no focus trap,
  and could index past a shortened list. While `photo_clearance` was off, a published photo
  question counted as "to grade" with no way for a student to answer it.
  **Ruled 2026-11-19: it does not count** (0097, below).
- **Found by the e2e:** the viewer heard Escape only on its own element, and
  "Next" on the last photo disables and drops focus to the page, so the view
  could not be closed from the keyboard; keys now listen on the document.

**0097, an empty photo answer is not owed while answers are off (ruled
2026-11-19).** `hand_grade_owed(type, check, block, photos_on, in_dol)` is the
rule: a hand-graded type, except a photo answer holding no photo while
`photo_clearance` is off, outside a DoL section. In a DoL section it stays
owed, because a rubric-primary retake opens only once attempt 1's grade is
released (0070, 0072); dropping it would strand the retake (Fable review). `activity_progress`, `class_progress` and
`list_grading_queue` ask it (the queue keeps an answer that already has a
grade); `class_student_work` returns `photos_on` so the student answer panel
counts the same way and badges the answer "Photos off". A photo answer that
holds photos is still owed with answers off, and an empty one is owed again
once they are on, like a blank essay. Accepted edge: an empty answer checked
while off counts once answers go on. verify-0097 (mutation-tested).

**Slice 5, the build half (2026-11-19).** Nothing is armed and photo answers
stay off; these are the pieces the author's steps need.

- **The live deletion proof:** `scripts/verify-photo-deletion-live.mjs --target
  live` (rehearsed with `--target local`). The local e2e mints student JWTs and
  cannot run live, so this proves the one thing the design requires against
  live: when a photo's row goes, its bytes leave real Storage through the
  DEPLOYED sweep, on every path (L1 the clock, L2 the account, L3 the version,
  L4 the activity, L5 an orphan; L0 a dry run removes nothing; L6 a bearer that
  is not the key is refused). The sweep acts on everything, so the script
  REFUSES to run once any real photo exists or clearance is on, or inside the
  sweep's own 04:00-04:25 UTC window: it is a one-time proof, run after arming
  and before the switch. "Removed" means the `storage.objects` row is gone AND
  Storage refuses to serve the blob (a positive control first proves it is
  served). Live only, **A0** checks the armed job would really reach this
  function: this project's URL, the exact `{"dryRun": false}` body, and a Vault
  secret equal to the service key (compared by sha256). Mutation-tested (a
  sweep that never deletes: 6 rows red).
- **The Fable review** found: the pooler password would print on any failed
  query (the DSN was a psql argument; it now goes through the environment and
  errors carry stderr only); L6 could not fail on live (a mangled token is the
  platform's 401, so L6 now claims only the gate; the key comparison is the
  local e2e's G15/G16 plus the deploy hash check); the pin accepted an unfilled
  `<project-ref>`, a lowercase `dryrun` and a wrong Vault secret (now
  case-sensitive, refuses `<`, and A0 compares the secret); audit rows and a
  fresh orphan could outlive a failed run (cleanup now deletes both, and R1
  counts audit rows); "bytes" meant only the catalog row (now the blob too).
- **The schedule pin:** verify-0093's `sweep_is_unscheduled` became
  `sweep_schedule_is_pinned_or_absent` (no sweep job, or exactly the two README
  jobs: names, 04:10/04:15 UTC, the real run, the Vault key) and
  `sweep_armed_before_clearance` (red if clearance goes on before both jobs,
  `pg_net` and the secret exist). They read what is there, so arming needs no
  edit. The cron tables are live-only, so the pin was mutation-tested against
  stand-in job tables shaped like the README's SQL: the exact arming passes;
  half-armed, `{"dryRun": true}`, lowercase `dryrun`, an unfilled
  `<project-ref>` and a wrong hour all go red.
- **The cost meter, the author's half:** the weekly `analytics-job-health`
  task now reads photo count, stored bytes (vs Pro's 100 GB), the top five
  teachers by bytes (counts only, no ids) and verify-0093's overdue alarm. Its
  old rule flagged every `prune_*` job; it now expects the two armed prunes.
- **Open, the author's call:** the design puts the meter on "the teacher's
  settings page", and there is no such page.

**Slices 4 and 6 as built (2026-11-19).** No migration and no deploy.

- **Slice 4's remainder:** the print-parity row `photo/controls-hidden` (Add a
  photo, Use my phone and the thumbnails never print; mutation-tested on the
  print-rules route), the Linux print baseline (regenerated after slice 2,
  85f0e9b4), and the GUI roster row, `photo: { slash: 'Photo of working' }`.
- **Slice 6 (MS-14):** a ```` ```photo ```` fence on the short-answer grammar
  plus `photos: 1-3` (a bad count warns and uses 1; `starter:` is ignored with
  a warning, there is nothing to type); the copy-paste prompt, the format doc
  (its own section and quick-reference row) and the regenerated catalogue
  prompt teach it; capability `photo` (fence `photo`, rubric-scored,
  per-criterion) joins `capabilityFacts.ts`, so `docs/capability-facts.json`
  changes. **Owed after the push:** the pin-bump PR on the curriculum repo
  with a pre-merge notice (CLAUDE.md), where they write the row's prose; the
  catalogue-prompt stamp on the Notion boundary page; their drawn-work items
  become authorable once it lands.

**Deferred, each with its trigger** (filed in TODOS when the author rules):

- **In-page webcam capture.** Trigger: a Chromebook class finds both the file
  picker and the phone handoff unworkable.
- **Bulk paper scanning** (MS-25): this is the **next arc**, not a wish. It
  gets its own design pass after slice 5.
- **`audio_response`.** Trigger: an authored activity needs a spoken
  explanation (a maths UDL case, or a language teacher arrives). It needs its
  own MediaRecorder and Safari pass and length limits.
- **`video_response`.** Trigger: same, plus the plan-tier answer (the cost
  cliff ROADMAP names).
- **`file_upload`** (spreadsheets, documents). Trigger: an authored
  science or statistics activity needs a data file handed in. It needs a
  content-type and scanning question.
- **Vision pre-grading.** Trigger: the GPU box, plus the drawn-work wish's own
  validation.
- **photo-grading.md (teacher scans)** is absorbed into the paper-scanning arc
  above, and it reuses §6.

---

## 11. Decisions — RULED 2026-11-18

The author accepted every recommendation below **except where a ruling note
says otherwise**: MS-3, MS-6, MS-10 and MS-13 were changed, and MS-24 and MS-25
were added. The status block at the top is the summary.

1. **MS-1: The first slice is a photo of handwritten working only.** Audio,
   video and files are deferred with the triggers in §10. *Recommend: yes.*
2. **MS-2: A new `photo_response` block, not an `allowPhoto` field on
   `short_answer`** (§3.1). *Recommend: the new block.*
3. **MS-3: Capture is the native file input only (`accept="image/*"`,
   `capture="environment"`).** In-page webcam capture waits for a Chromebook
   trigger (§4). *Recommend: yes. **And please say what devices your Feb 2027
   classes will have** (Chromebooks, iPads, BYOD laptops, phones at home),
   because that decides whether the webcam slice should come early.*
   **→ RULED differently: the native input plus the phone QR handoff (§4.1).
   The teacher camera moves to the paper-scanning arc.**
4. **MS-4: Up to 3 photos per block, set by the teacher, default 1.**
   *Recommend: yes* (multi-page working is common, and three keeps cost and
   teacher reading time bounded).
5. **MS-5: Client re-encode to JPEG, 2000 px long edge, quality 0.8, which
   also strips EXIF; 25 MB input limit; 1.5 MB bucket limit after re-encoding**
   (§5). *Recommend: yes, with the right to tune the two numbers after slice 2
   measures real photos.*
6. **MS-6: Photos are online-only in v1.** There is no on-device photo store,
   and a missing or uploading photo gets a check-anyway confirm (§8).
   *Recommend: yes.* **→ RULED differently: offline capture is in v1
   (IndexedDB, §8, slice 2b).**
7. **MS-7: A private `student-work` bucket.** Reads are for the student and the
   activity's editor (`can_edit_activity`, never `can_read_activity`); there is
   no UPDATE and no client DELETE (§6.1). *Recommend: yes.*
8. **MS-8: Teachers view photos through 10-minute signed URLs**, rather than an
   authenticated fetch into a `blob:` URL (§6.3). *Recommend: signed URLs.*
9. **MS-9: Teacher reads of photos are not audited in v1**, matching how
   reading student text is treated today. This departs from ROADMAP, and the
   question goes to counsel inside Q14 (§6.3). *Recommend: yes, pending
   counsel.*
10. **MS-10: Retention.** Attached photos are kept for the school year plus 30
    days (from `school_year_ends_on`; 400 days if no class sets one), and
    unattached uploads for 7 days. A removed photo leaves a "removed"
    placeholder, and the grade stays (§6.5). **The 400-day limit is a ceiling
    in every case** (0048's `least(…)`), not only the fallback. *Recommend:
    yes. This is the window Q14 asks counsel to confirm.* **→ RULED
    differently: at most 30 days after the grade is released. The school year
    plus 30 days (400-day ceiling) applies only to a photo never released
    (§6.5).**
11. **MS-11: Bytes are deleted by a scheduled `sweep-work-photos` Edge Function
    draining a deletion queue.** It ships dry-run and unscheduled, and is
    **armed before the first student photo** (§6.4). *Recommend: yes.* (The
    alternative, a sweep you run by hand, is cheaper and fails silently when
    forgotten.)
12. **MS-12: A `photo_clearance` switch, off until Q14 is answered and the
    sweep is armed and proven** (§6.6). *Recommend: yes.*
13. **MS-13: No quota and no blocking; a cost meter instead, and a plan-tier
    decision before February** (§6.8). *Recommend: yes. The tier decision
    itself is yours, and you may want to make it now, because one teacher with
    four or five classes outgrows the free storage within a school year.*
    **→ RULED: move to Pro before February. The meter stays (§6.8).**
14. **MS-14: The importer fence, catalogue prompt and capability-facts pin
    bump come after the GUI slice (slice 6), not with it** (§9).
    *Recommend: yes. Tell the curriculum side the shape once MS-2 is ruled, so
    their nets and draw items can plan around it.*
15. **MS-15: AI grading excludes photos by name in v1**, with the
    supersession-key generalization recorded as the seam. Vision grading stays
    parked with the model half (§7). *Recommend: yes.*
16. **MS-16: The build order is slices 1 to 6 as in §10**, with slice 1
    (storage, sweep and compliance) built and live-proven before any student
    surface. *Recommend: yes.*
17. **MS-17: Only students in a class the activity is assigned to may upload a
    photo**, under a cap: `maxPhotos × 3` reservations per block, plus a daily
    ceiling per student (start at 30) (§6.2, R-12). A link-share stranger
    can still check the text parts, but cannot attach a photo. *Recommend: yes.
    This is narrower than text answers today, on purpose.*
18. **MS-18: A graded photo answer goes stale (amber) when the ordered list of
    photo ids changes** (§7). *Recommend: yes.*
19. **MS-19: Class progress, first tries and the answer panel show a photo
    answer as answered, with a "Photo" label and no thumbnail** (§7).
    *Recommend: yes.*
20. **MS-20: Leaving a class, or the class being deleted, does not shorten a
    photo's clock** (§6.5). *Recommend: yes. 0048 does shorten the number-facts
    clock this way; photos are graded evidence, which facts timings are not.*
21. **MS-21: The wire v4 deploy and push go together, outside NZ and US school
    hours** (§3.2). *Recommend: yes.*
22. **MS-22: No content scanning in v1**, with the question put to counsel as
    Q14(e) (§6.7). *Recommend: yes.*
23. **MS-23: A `photo_response` may be a DoL's primary evidence and may appear
    in quizzes and exams**, with the same rules as `short_answer` (§8).
    *Recommend: yes.*
24. **MS-24 (added in the walk): the phone handoff's `photo-handoff` Edge
    Function runs with no sign-in (`verify_jwt: false`)**, scoped to a
    10-minute, upload-only code tied to one student and one question, and off
    in quiz and exam modes (§4.1). **RULED: allowed.**
25. **MS-25 (added in the walk): student photos first, then bulk paper
    scanning** as its own arc. That arc covers the per-page QR, named copies,
    a shaded-code fallback, a filing review, cropped by-question grading and
    the teacher camera, and it reuses slice 1. **RULED.**
