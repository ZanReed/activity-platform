# TEST_SPEC.md

`test-spec v1 · 2026-07-17` · single source of truth for what must be proven. Tests are built
FROM this file; amend per slice, never clobber.

**Graph-extraction slice: RATIFIED + BUILT + GREEN 2026-07-17** (`ffa0116` + `44c7ea3`).
13 e2e in `packages/app/e2e/graph-settings.e2e.ts` (all 5 INV1 per-type + P6/P7/S1/S3/S7/S8/E1);
U1 covered by existing `serialize.test.ts`. Acceptance scenario green across all types. **Owed:
the author's manual QA pass** (per D6). Ratified calls (see RATIFICATION_LOG.md):
D4 → cover all 6 interaction types; D5 → convert axis fields to DraftNumberInput (fix the
fight bug in-flight, +no-NaN test); D6 → skip list confirmed (drawer layout, validator error
copy, board-render effect, index-keyed mistake editor → owner manual pass).

---

## Slice: interactive-graph settings → descriptor-drawer extraction

**Under test:** the `interactive_graph` settings migration (editor-refinement-pass Group-2 tail).
**Design reference:** [docs/design/editor-refinement-pass.md](docs/design/editor-refinement-pass.md)
→ "Eng review — interactive-graph settings extraction" (CLEARED 2026-07-17).
**Slice boundary:** covers ONLY the graph settings→drawer extraction. Out of slice: Group 3
(sizing, multi-part answers), the already-shipped data-plot / blank-popover / prompt-on-top work.

**Acceptance statement:** *Trusted to ship when every interaction type's settings still read and
write correctly through the Advanced drawer, the interaction `type` is never mutated by a settings
write, the inline "⚙ Advanced settings" bar is gone, and the worked-solution + mistake-feedback
rich fields write from inside the drawer.*

**Where the risk concentrates:**
1. **Type-narrowed `interaction` writes** — each tolerance row replaces `node.attrs.interaction`
   with a type-specific shape; a botched spread drops answer fields or changes `type`. Highest blast
   (silent mis-grading).
2. **Rich fields relocated into the drawer** — worked solution + mistake feedback use nested Tiptap
   (`InlineRichTextEditor`) rendered in the drawer portal, not the NodeView. The riskiest relocation.
3. **Per-interaction-type divergence** — 5 distinct tolerance rows; a regression can silently hit
   one type only.

### Must-test index

| # | behavior | traces to | anchor | method | tier |
|---|---|---|---|---|---|
| D1 | inline "⚙ Advanced settings" disclosure gone from the block | design (migration req) | design-anchored | e2e | MUST |
| D2 | settings reachable via quick-bar ⚙ → command bar → Advanced drawer | design (migration req) | design-anchored | e2e | MUST |
| D3 | block keeps a display-only settings summary readout | design (parity w/ other blocks) | design-anchored | e2e | MUST |
| INV1 | a settings write NEVER changes `interaction.type` and preserves the type's other answer fields | design (behavior-unchanged) | design-anchored | e2e/property | MUST |
| P1 | plot_point — Tolerance reads + writes `interaction.tolerance` | code (settings panel) | code-pin | e2e | MUST |
| P2 | plot_function — model tolerance field(s) read + write | code | code-pin | e2e | MUST |
| P3 | plot_ray — Endpoint tolerance reads + writes | code | code-pin | e2e | MUST |
| P4 | plot_segment — Endpoint tolerance reads + writes | code | code-pin | e2e | MUST |
| P5 | shade_region — Min. overlap reads + writes (clamped 0..1) | code | code-pin | MUST |
| P6 | graph_inequality — no tolerance row (correctly absent); shared settings present | code | code-pin | e2e | SHOULD |
| P7 | display — axis present; NO solution/confidence/mistakes | code | code-pin | e2e | MUST |
| S1 | axis config (min/max + grid steps) reads + writes; **converted to DraftNumberInput** (clear+blur restores, no NaN — ratified D5) | code + Group-1 fix parity | code-pin | e2e | MUST |
| S3 | worked-solution rich field writes `solution` from the drawer | code (high-risk relocation) | code-pin | e2e | MUST |
| S4 | confidence toggle reads + writes | code | code-pin | e2e | SHOULD |
| S5 | partial-credit toggle reads + writes | code | code-pin | e2e | SHOULD |
| S6 | allow-no-solution toggle writes; nested noSolutionCorrect reveals + writes | code | code-pin | e2e | SHOULD |
| S7 | auto-feedback (builtinFeedback) toggle present, DEFAULT ON, reads + writes | design (stays default-on) + code | design-anchored | e2e | MUST |
| S8 | mistake feedback — add entry, edit match, edit rich feedback → writes `mistakeFeedback` | code (high-risk) | code-pin | e2e | MUST |
| E1 | switching interaction type (inline picker) while the drawer is OPEN swaps the tolerance row to match the new type | code (adversarial sweep) | code-pin | e2e | SHOULD |
| U1 | serialize round-trip: a fully-configured graph survives tiptap→activity→tiptap unchanged | code (existing serialize) | code-pin | unit | MUST |

### Invariants (property candidates)
- **INV1 (the load-bearing one):** for every interaction type, opening the drawer and writing any
  one setting leaves `interaction.type` unchanged and every non-edited field of the type-narrowed
  shape intact. This is THE refactor invariant — the setNodeAttr('interaction', {...spread}) paths
  are where a regression lives.
- **U1:** serialize round-trip identity for a graph carrying all settings (axis, tolerance, solution,
  confidence, partial-credit, no-solution+correct, builtinFeedback, mistakes). Existing serialize
  tests likely cover the shape; confirm/extend rather than duplicate.

### Failure modes & edge cases — triaged
- **MUST** — tolerance write for type X preserves X's other answer fields (INV1). likelihood mod /
  blast high (grading) / cost low.
- **MUST** — solution + mistake rich fields actually write from the drawer portal (nested Tiptap +
  FieldFocusContext). likelihood mod / blast high (lost authoring) / cost low.
- **SHOULD** — axis numeric field: clearing + blur doesn't commit NaN (only if converted to
  DraftNumberInput — see Judgment J2).
- **SKIP (logged):**
  - drawer pixel layout / spacing → manual-QA, owner eyeball. Cosmetic; blast low.
  - per-type mistake-match VALIDATOR error copy (the "Type coordinates, like (4,3)" strings) →
    cosmetic; relocated verbatim; not worth an assertion.
  - showGrid/snapToGrid EFFECT on the rendered board → that's board rendering, not a settings write;
    unchanged by this refactor.
  - mistake-feedback `InlineRichTextEditor` keyed by index (pre-existing fragility) → not worsened
    here; flagged for a glance during build, not a spec item.

### Out of scope
Group 3 (graph/image sizing, multi-part answer add, default seeds), auto-feedback default-flip
(dropped per author), the graph *scoring* logic itself (unchanged — this is authoring UI only), the
board/answer authoring surface (only the settings move).

### Verification plan
- **Automated (design-anchored, author BLIND to the diff):** D1, D2, D3, INV1, S7 — these encode the
  migration's intended behavior and can honestly fail. Built from design doc + this spec.
- **Automated (code-anchored pins, may read the code):** P1–P7, S1, S3–S6, S8, U1 — regression pins
  on relocated behavior; born green.
- **Human manual-QA pass (owner):** open a graph of each type on /playground, gear→Advanced, eyeball
  the drawer renders the right fields and the rich editors accept input; predict-then-run on one type,
  break-it-on-purpose on the tolerance write (clear it, confirm sane). Logged in RATIFICATION_LOG.
- Playwright is authoritative (the in-app browser pane suppresses the position-measured drawer under
  JS-driven selection); drive via node-selection + gear + Advanced, mirroring the DataPlotSettings e2e.

### Acceptance scenario (ship gate)
One e2e journey per interaction type (data-driven): insert the type → node-select → quick-bar ⚙ →
Advanced → assert the type-appropriate tolerance row is present and writing it updates the
`interaction` attr WITHOUT changing `type` → for a graded type, write the worked solution and confirm
`solution` is set. Plus: the inline "⚙ Advanced settings" bar is absent on all types. Green across all
types + the owner manual pass = shippable.

### Trust check
INV1 and S8 are load-bearing. Verify the tests actually detect faults: for INV1, the assertion must
read back the FULL interaction object and check `type` + a sibling field, not just the edited value
(a test that only asserts the edited value would pass even if the write clobbered `type`). Mutation
sanity: a build that changes `type` on write, or drops the mistake array, must turn these red.
