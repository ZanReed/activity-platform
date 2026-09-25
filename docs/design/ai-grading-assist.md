# AI grading assist — model-drafted rubric grades, teacher-confirmed

**Status:** PROPOSED (design pass 2026-09-25) — decisions D1–D10 below await the
author's per-item ruling. No code, no migration until then.

**Pilot constraint (author, 2026-09-25):** first implementation runs against a
LOCAL model on the author's machine (2× RTX 3090 — 24 GB VRAM each, 48 GB
total). This is a feature, not a limitation: see §2.

Companion docs: [teacher-grading.md](teacher-grading.md) (the shipped surface
this rides), [photo-grading.md](photo-grading.md) (the ruled house pattern:
*AI as a lossy transform feeding a human-review endpoint, never
authoritative*), docs/DECISIONS.md → D8 two-axis grading model.

---

## 1. Re-derivation against shipped reality (P10)

What exists, verified in this design pass:

- **Capture complete.** Every check writes `section_checks`: full `responses`
  map, version-pinned (`activity_version_id`), attempt-numbered, RLS-granted
  to the teacher via `can_read_activity`.
- **Grade store + write path shipped** (migration 0034): `check_grades
  (check_id FK→section_checks CASCADE, block_id, criteria jsonb,
  general_feedback, graded_by uuid REFERENCES users, released_at)`, written
  through the audited `upsert_check_grade` RPC which validates criteria ⊆ the
  pinned rubric and earned ≤ max; `release_check_grades` gates student
  visibility. **Zero live grades to date** — the surface is shipped but
  unexercised by reality (see D8 sequencing).
- **Grading keys are model-ready by authoring rule.** Rubric criteria carry
  label/points/note; `answer:` is authored "the way you would mark against
  it"; `solution:` exists; the curriculum side reserved `x_dol_rubric_levels`
  (their D35) for level descriptors.
- **The misconception registry** (35 ids, generated, public) names the errors
  worth detecting per skill — currently *unsensed* on rubric-graded items,
  which is exactly the cost D8 accepted for NCEA-first.
- **House pattern already ruled** (photo-grading, author 2026-06-16): model
  pre-grades → teacher reviews/overrides → teacher is the backstop; machine
  confidence never reuses the student's self-reported confidence field.

## 2. Topology: a pull-based local worker (D1)

The grading engine lives server-side, but a local model cannot be called FROM
an Edge Function (the author's machine is not addressable, and should not
be). So the pilot inverts the flow:

```
Supabase                                   Author's machine
  section_checks (rubric blocks,   ◄──── worker pulls pending work
   ungraded, no suggestion)               (authenticated as the teacher)
        │                                        │
        │                                 local inference server
        │                                 (OpenAI-compatible endpoint:
        │                                  vLLM or Ollama, JSON-schema-
        │                                  constrained output)
        ▼                                        │
  check_grade_suggestions  ◄──────────── worker submits suggestion
        │                                  (audited RPC, validated)
        ▼
  grading queue UI: pre-filled → teacher confirms/edits/rejects
        ▼
  upsert_check_grade (EXISTING RPC, teacher's uuid) → release gate
```

Why pull-based wins:
- **No inbound connectivity, no exposed endpoint, no new secrets** — the
  worker is a plain authenticated client on the teacher's own machine reading
  the teacher's own students (RLS already grants this).
- **Privacy:** student work never reaches a third-party processor. The
  pilot's compliance footprint is "processed on the teacher's device" — a
  data-map row, not a vendor agreement.
- **Provider-agnostic by construction:** the worker speaks the
  OpenAI-compatible chat-completions + JSON-schema interface. Swapping local
  → Claude API later is a base-URL/model/key config change plus its own
  compliance ruling (D10) — no architectural change.

**Hardware fit (48 GB):** a ~30B-class instruct model (e.g. Qwen3-32B tier)
at Q5 on one card with long context, or a 70B-class at Q4 tensor-parallel
across both. Rubric grading with explicit criteria + a model answer is a
constrained comparison task; 30B-class with schema-constrained decoding is a
credible floor. Exact model chosen at kickoff against then-current local
options (the photo-grading doc's "decide at kickoff" pattern) via the
agreement study (D7), not by reputation.

## 3. The suggestion store (D2)

A suggestion is NOT a grade. `check_grades.graded_by` references `users` and
released feedback is teacher-attributed — both deliberate. So:

`check_grade_suggestions (id, check_id FK→section_checks ON DELETE CASCADE,
block_id, criteria jsonb, general_feedback_draft text, misconception_notes
jsonb, model_id text, prompt_rev int, schema_rev int, machine_confidence
text, status enum(pending|confirmed|edited|rejected|superseded), created_at
…, unique(check_id, block_id))`

- `criteria` entries mirror `check_grades`: `{criterionId, earned, maxPoints,
  feedback}` — validated ⊆ pinned rubric, earned ≤ max, by the submit RPC
  (same checks as `upsert_check_grade`; a suggestion that fails validation is
  rejected at the door, not stored broken).
- `misconception_notes`: `[{misId, evidence}]`, ids validated against the
  registry (never invented — the curriculum side's own rule).
- `machine_confidence` is the MODEL's signal — its own field, per the
  photo-grading rule; it never touches the student's `confidence`.
- `prompt_rev`/`schema_rev`/`model_id` stamp every row so quality is
  auditable per revision (the SANITIZER_REV pattern).
- CASCADE from `section_checks` keeps the retention interlock whole with no
  purge-function edit (the 0034 precedent, P7).
- Teacher **confirm** replays the suggestion through the EXISTING
  `upsert_check_grade` RPC under the teacher's uuid; the suggestion row is
  marked confirmed/edited (edit distance is the quality telemetry). Students
  can never see a suggestion: it is a different table AND the release gate
  sits on `check_grades` — double-gated by construction.

## 4. What the model receives and must return

**In:** block prompt (rendered to text), student response, rubric criteria
(+ level descriptors when `x_dol_rubric_levels` lands), `answer:`,
`solution:`, and the misconception registry entries attached to the item's
skill (D5).

**Out (JSON-schema-constrained):** per-criterion `{criterionId, earned,
feedback}`, a `general_feedback_draft`, optional `misconceptions:
[{misId, evidence}]`, and `confidence: high|low` where **low means the row is
flagged "needs full manual attention" and is NOT pre-filled** (D6) — an
abstaining model is more useful than a guessing one, and a silent bad
pre-fill is the automation-bias failure mode.

## 5. Pilot gate: prove it before trusting it (D7, P3-flavored)

1. **Exercise the shipped grading surface first** — it has zero live grades.
   The author hand-grades a first batch through the queue UI with no AI
   involved (this proves 0034's surface AND produces ground truth).
2. **Blind agreement study:** run the worker over the same responses; compare
   per-criterion. Report exact-match and ±1-point rates per criterion type.
3. Only after the numbers are seen does batch-confirm UX ship. Edit-rate
   telemetry (confirmed-unchanged vs edited vs rejected) is collected from
   day one and is the standing quality signal per prompt/model rev.

## 6. What this buys strategically

Misconception observations on rubric-graded items directly recover the cost
D8 knowingly accepted for NCEA-first ("misconception signal deferred until a
human marks"). Confirmed suggestions carry validated `mis.*` observations into
the same aggregates the auto-scored bindings feed — the sensor network starts
working under a justification locale. This is worth more than the time
saved.

## 7. Explicitly out of scope for the pilot

Student-facing instant AI feedback (the photo-grading doc's same deferral —
never put unreliable output directly in front of students); auto-release in
any form; grading `explain` blocks (ungraded by design); handwriting/photo
input (own design doc); any third-party API call (D10 gates the swap).

---

## Decisions for the author (yes/no each)

- **D1 — Topology:** pull-based worker on the author's machine, speaking
  OpenAI-compatible + JSON schema to a local server (vLLM or Ollama), so the
  Claude-API swap later is config + a compliance ruling, not a rebuild.
- **D2 — Storage:** new `check_grade_suggestions` table as specced (CASCADE
  retention, rev-stamped, unique per check+block); suggestions convert to
  grades ONLY through the existing `upsert_check_grade` under the teacher's
  uuid. `check_grades` itself is untouched.
- **D3 — Worker auth:** plain authenticated teacher session + two audited
  SECURITY DEFINER RPCs (`claim`/`submit` family, 0027-class); no service
  key on the worker.
- **D4 — Model & serving:** chosen at kickoff against then-current local
  models by the D7 agreement study; starting candidates: 30B-class Q5
  single-card vs 70B-class Q4 dual-card, behind vLLM guided decoding.
- **D5 — Misconception emission in v1** (vs fast-follow): registry entries in
  the prompt, validated `mis.*` observations in the output.
- **D6 — Abstain contract:** low machine-confidence rows are flagged for full
  manual grading and never pre-filled.
- **D7 — Pilot gate:** hand-graded ground-truth batch first, blind agreement
  study second, batch-confirm UX only after the numbers; edit-rate telemetry
  from day one.
- **D8 — Sequencing:** the pilot's step 1 doubles as the first real exercise
  of the shipped-but-unused teacher-grading surface (accepting that any 0034
  defects surface mid-pilot), rather than waiting for an organic first
  teacher.
- **D9 — Attribution:** AI-drafted feedback text reaches students only after
  teacher confirm/edit and is always teacher-attributed (ratifies the
  existing render rule for this new source).
- **D10 — Compliance posture:** pilot recorded in the data-map as on-device
  processing (no third-party processor); the Claude-API swap is a separate
  future ruling with its own data-map/retention update.
