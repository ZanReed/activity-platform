# Photo-upload answer checking — design

**Status:** design captured, not implemented (2026-06-16). A long-term assessment feature: a student does a printed worksheet by hand, someone photographs it, and the system reads the handwriting and grades it against the activity's answer key. Captured ahead of implementation; the open questions below are resolved at kickoff, not now.

Companion to STATE.md and ROADMAP.md. Sibling design: `pdf-import.md` (the authoring-side OCR feature). Both share the "AI/OCR as a lossy transform feeding a human-review endpoint" shape; neither is ever authoritative.

**v1 = teacher grading aid** (author decision, 2026-06-16). Teacher scans a stack → system pre-grades → teacher reviews/overrides in the dashboard. The teacher is the backstop, so recognition errors degrade gracefully. Student self-check (instant feedback from the student's own photo) is a deliberate fast-follow, *not* v1 — it would put unreliable handwriting OCR directly in front of students.

## The core architectural win: an alternate front-end to the existing submission pipeline

The entire downstream already exists. If the OCR step produces a `SubmissionResponses` object — `{ schemaVersion: 2, blanks: Record<blankId, { answer, correct, confidence? }> }`, keyed by the same stable `blank.id` — it flows through `ingest-submission` → the submissions dashboard → scoring **with no changes**.

So photo grading is *"fill the answer map from a photo instead of from form inputs."* Today the runtime's `buildSubmissionPayload()` / `gatherResponses()` (`packages/renderer/src/runtime/submission.ts`) walks `refs.blanks` and scores each. The photo path is the same shape with a different source for each blank's `answer` string.

### Reuse map

| Concern | Today | Photo-grading path |
|---|---|---|
| Response shape | `SubmissionResponses` v2 | **same, unchanged** |
| Per-blank key | stable `blank.id` (UUID) | **same** |
| Ingest endpoint | `ingest-submission` (`{ activity_id, display_name?, opaque_token?, responses, score? }`) | **same** |
| Attempt number | server-derived `max+1` | **same** |
| Version pinning | migration 0007 | **same** (and see QR below) |
| Answer source | DOM form inputs | **vision model reading a photo** |
| Grading | client-side runtime (`evaluateAnswer`) | **server-side** — the one refactor (below) |

## Registration: QR-for-identity (B) + model-reading association (A)

"Registration" = mapping a scribble on the photo to the right `blank.id`. Two layers, adopted at different times:

**Adopt now — QR for *identity* (option "B", identity layer).** The print engine (`packages/app/src/lib/foldable/`) already controls layout and already stamps `data-blank-id`, `data-block-id`, `data-section-id` on printed output. Have it also print a QR so every scanned sheet self-identifies — no manual sorting of a 30-sheet stack. This is the part that makes student submission *manageable* (author's stated reason for choosing B, 2026-06-16).

**Adopt now — model-reading for *per-blank association* (option "A").** Hand the vision model the photo plus the activity's known structure (the ordered blanks with their surrounding prompt text, which we have from the `ActivityDocument`) and let it associate handwriting to blank by *reading context*, the way a human would. No per-blank pixel geometry needed.

**Defer — fiducial geometry (option "B", geometry layer).** Corner registration marks for perspective-correcting a tilted photo and cropping each blank's bounding box individually. Heavier engineering; only pays off if model-reading association proves unreliable at real-world photo quality. Reserve a corner for it in the print layout now (costs nothing); build it only if needed.

## The QR payload: a versioned, extensible envelope (the one "architect now" move)

The QR encodes data, and that data is a wire format. Per the repo's standing discipline ("wire format is the contract"; `schemaVersion: 2`; `STORAGE_SCHEMA_VERSION`), make it a **versioned envelope from day one** so future fields are additive, not a breaking re-parse of every QR already printed on paper:

```jsonc
{
  "v": 1,                  // envelope version — the door
  "a": "<activity-id>",    // which activity
  "rev": "<version>",      // which published version → grades against the exact printed answer key
  "p": 1                   // page index (multi-sheet reassembly)
  // future, additive: "s": "<student-token>"  // absent = anonymous; present = personalized
}
```

`rev` dovetails with the submission version-pinning already in place (migration 0007): the paper grades against the exact answer-key version it was printed with, even if the activity was edited since.

(Wire *encoding* — compact delimited string vs. JSON vs. short URL, to fit QR capacity — is a deferred detail. The non-negotiable is that the envelope carries a version field.)

## Student identity: generic master copy (author decision, 2026-06-16)

**v1 QR encodes `activity + version + page` only — identical on every copy.** Teacher prints one master and photocopies it. Student identity is resolved **at review time** (teacher tags each scan, or a name the student writes is read during review).

Personalized per-student printouts (QR also carries a student token → automatic roster mapping) are explicitly **out of scope** — that's a whole new category (quizzes/assignments) that drags in a student roster, per-student PDF fan-out, and single-attempt semantics, none of which Phase 1 has. The three cheap seams below keep that door open without building it.

### Keep-the-door-open seams (cost ~zero now; do them)

1. **Versioned QR envelope** (above) — adding `"s"` later stays additive; old generic QRs still parse as anonymous.
2. **QR content is a *parameter* to the print render**, not computed deep inside the foldable engine. Generic master = "render with this one QR"; personalized = "render N times, varying one input" — a loop later, not a rewrite.
3. **Identity stays pluggable** — `ingest-submission` already accepts `display_name` *or* `opaque_token` and derives the attempt server-side. Keep *the identity value* separate from *how it was determined* (teacher tag now, QR token later). Do not hardcode identity provenance downstream.

Explicitly **do NOT build now:** student roster, per-student PDF fan-out, assignment/quiz model, attempt-limit/proctoring semantics.

## The one real refactor: server-shareable answer evaluation

Today grading runs **client-side in the runtime** — `scoreBlank()` (`blanks.ts`) → `evaluateAnswer()` (`strategies.ts`), with answer keys baked into the published HTML. Photo grading must grade **server-side** (in the edge function), so the answer-matching strategy has to be callable outside the runtime.

So extract `evaluateAnswer` / the matching strategies into a form both the runtime and the server can call, so paper and screen grade *identically*. Constraints to respect during the extraction:

- The runtime forbids JS dependencies and has a ~20KB budget — keep the shared piece dependency-free and small.
- Do not import `@activity/schema` into the runtime (parallel types are deliberate). The shared grader is pure string-strategy logic, not schema.
- Server needs the answer keys: they live in the published HTML (`data-blank-answers`, pipe-separated) and in the stored activity record. Decide which source the edge function reads (the `rev`-pinned published artifact is the consistent choice).

## OCR confidence is a separate signal from student confidence

The vision model returns a per-cell read confidence. Surface low-confidence reads for human review rather than silently grading them. **Do not overload the existing `BlankResponse.confidence` field** — that one is the *student's self-reported certainty* (`unsure | think_so | certain`). OCR confidence is a machine signal; if it needs to be persisted, it gets its own field, not a reuse of the student's.

## What this design does NOT decide

1. **Vision model + prompt** — which model, whole-sheet vs. per-region prompting. Decide at kickoff against the then-current best Claude vision model.
2. **Math / diagram handwriting** — the least reliable axis; scope which answer types are gradable-from-photo before promising any.
3. **Review UI** — how the dashboard presents pre-graded scans for teacher override (the human-in-the-loop surface). Decided with the submissions dashboard as it stands at implementation time.
4. **Fiducial geometry** — only specced if model-reading association underperforms on real photos.
5. **Student self-check mode** — the fast-follow; its instant-feedback UX and the "false wrong" tolerance question are deferred until recognition is trusted.
6. **Personalized/quiz category** — out of scope by decision; this doc only keeps the door open (the three seams above).
7. **Multi-page submission assembly** — the `p` page index enables it; the assembly/UX is deferred.
