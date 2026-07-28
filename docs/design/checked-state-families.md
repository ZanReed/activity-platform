# Checked-state families — the one-page spec (ruling 7.2A; GATES T6)

**Status:** RATIFIED at the 2026-07-28 design review (components-as-data arc). No block
component lands in T6 before its family behavior below is implemented; the registry
(`packages/viewer/src/registry/registry.ts`) declares each block's family and the guard
suite (`packages/viewer/tests/registry.test.ts`) enforces coverage and coherence.

## The three families

| Family | After a section check, the block may show | Never |
|---|---|---|
| **auto_gradable** | ✓ / ✗ marks + optional feedback. Feedback comes ONLY from the check RPC (`{verdict, optional feedback}`, sourced from authored hint / mistakeFeedback / per-choice feedback — ruling 2.1A). A hintless wrong answer is **mark-only**: designed default, not a gap. | Invented feedback; client-computed verdicts |
| **recorded** | "Recorded ✓ — your teacher will review" once captured. Released teacher feedback renders when the server provides it. | A verdict glyph (✓/✗ as *judgment*), a score, or anything a student could read as auto-grading |
| **static** | Nothing. No state chrome of any kind. | Any pill, tint, or mark |

**Pending** is not a fourth family — it is a *transitional* state any gradable surface can
enter (queued/offline check, ruling TV3-A): the pending pill (`--state-pending-*` tokens)
appears once a check is queued and resolves to the family's terminal chrome when the
check fires. Queued checks grade **current** values at fire time, with a "Checked your
latest answers" notice when drifted (ruling 2.2A).

## Resolution rule

A type's declared family is its **maximal** family; an instance resolves through
`familyOf(block)`:

- `interactive_graph` / `data_plot` in `display` mode → **static** (no input, no chrome).
- `math_block` without Model A prompts → **static**.
- Everything else resolves to its declared family. `isGradeable` (schema
  `block-predicates.ts`) is the single rule engine — the registry never forks it.

## Family assignments (guard-enforced)

- **auto_gradable:** `fill_in_blank`, `multiple_choice`, `matching`, `ordering`,
  `number_line`, `interactive_graph`*, `data_plot`*, `math_block`*,
  `faded_worked_example` (the box surfaces its child blanks' marks; the box itself adds
  no chrome). *Conditional — see resolution rule.
- **recorded:** `self_explanation`, `short_answer`, `essay` — exactly the manually
  reviewed free-text trio, and nothing else, ever, without a design pass.
- **static:** everything else, including `problem` (numbered, has a solution, but emits
  no gradable response — its solution disclosure is the 7.4A surface, not state chrome).

## Cross-cutting rules

1. **One vocabulary.** All state chrome draws from the `--state-*` token trios
   (`packages/viewer/src/tokens/tokens.css`) — correct / incorrect / pending / recorded.
   A component inventing a fifth state or a private color is a review-blocker.
2. **The mark never molests the work.** An incorrect verdict marks the attempt — it
   never redraws, resets, or "corrects" the student's input. Named for the interactive
   graph (✗ never redraws the student's line) but binding on every family.
3. **Announcements.** Every state-pill transition announces via `aria-live` (ruling
   6.1A); the graph/number-line position narration stays visually hidden (a visible
   readout would hand over the answer).
4. **Parity bundle (ruling 7.1A).** Check semantics carry today's runtime exactly:
   re-check allowed, re-scores everything, solutions unlock server-side after the
   section check (Q2B). Pedagogy changes are a later deliberate pass — never a side
   effect of a component port.
5. **Print.** State chrome never prints: a printed worksheet is the blank version
   (baseline print constraint; the print token block flattens every state role).
