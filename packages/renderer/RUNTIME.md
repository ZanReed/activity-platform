# RUNTIME.md

Architecture decisions and standing constraints for the published-activity runtime — the JavaScript that runs in students' browsers on every published activity page. Companion to the project-level STATE.md (where everything is) and ROADMAP.md (where everything is going).

Update at the end of each work session that touches the runtime — replace the relevant sections, don't append.

**Current vs. target.** This document is a design spec for the runtime built across Stages 11–13. Stages 11 and 12 are complete (source restructure + build pipeline + full renderer emission contract + state-object runtime architecture); Stage 13 builds checkpoint scoring + feedback rendering + mode enforcement + localStorage answer persistence on top of that. To track which parts of this doc describe what:

- The **data-attribute contract** section tags each group `[emitted today]` (in current renderer output) or `[target — Stage N]` (planned).
- The **architecture, state-shape, build-pipeline, error-handling, and testing** sections describe the *current* runtime where they cover Stage 11–12 work, and the *target* runtime where they cover Stage 13–14 work. Each notes inline which is which.
- **Current state** is the authoritative description of what runs in students' browsers right now.

*Last reconciled against code at end of Stage 12.*

## What this is

The runtime is the JavaScript that runs in students' browsers on every published activity page. Its eventual remit:

- Student input state (what they've typed into blanks, selected, ordered, recorded, etc.)
- Per-section checkpoint scoring against answer keys baked into the HTML
- Feedback rendering (✓/✗, hints, mistake-specific feedback, solutions after checking)
- Revision mode enforcement (free / locked)
- Attempt tracking across resubmissions
- Final submission to the `ingest-submission` Edge Function
- Graceful degradation when anything goes wrong

The list above is the runtime's eventual remit; the current build is narrower — see **Current state**.

It does NOT handle:

- Authoring (that's the editor in `@activity/app`)
- Server-side validation (that's the Edge Function)
- Cross-activity state (each page load is isolated)
- Real-time collaboration (not in scope for any phase currently planned)
- Anti-cheating beyond what's possible in client code (Phase 5 server-side grading is the answer)

## Current state (what ships today)

The runtime is a TypeScript module graph rooted at `packages/renderer/src/runtime/index.ts`, built by `scripts/bundle-renderer.mjs` (esbuild, IIFE, minified, target `chrome90`, ~3 KiB minified) into a generated string module (`runtime/generated/runtime-bundle.ts`), which the renderer's `document.ts` inlines into a `<script>` tag in every published page. The source map (`packages/renderer/dist/runtime.js.map`) is a dev-only artifact, gitignored. The generated string module is committed so a clean checkout can typecheck the renderer without first running the bundler.

File structure:

- `index.ts` — bootstrap. Calls `init()`; on null falls back to a no-op runtime (logs an error, page stays static).
- `config.ts` — `RuntimeConfig` interface + `parseConfig()` (defensively returns null on missing or malformed config).
- `refs.ts` — typed-DOM-pointer interfaces (`BlankRef`, `FillInBlankRef`, `SectionRef`) + `Refs` bundle.
- `state.ts` — `RuntimeState` + `SectionState` + `createInitialState(refs)`.
- `init.ts` — the only DOM walker. Returns `{config, refs, state} | null`.
- `blanks.ts` — three-layer split: `scoreBlank` (pure), `applyBlankFeedback` (DOM-only), `checkBlank` (composition); `wireBlanks(refs)` for the blur handler.
- `strategies.ts` — `evaluateAnswer(input, typed)` strategy dispatch. Only the `list` strategy is implemented (pipe-split `data-blank-answers`, case-sensitive exact match). Unknown strategy logs a warning and falls back to `list`.
- `submission.ts` — `gatherResponses(refs)`, `submit(config, refs, state)`, `setStatus`, `setScore`, `computeScore`. Submission payload uses `responses.schemaVersion: 2`.
- `storage.ts` — `loadStoredName` / `saveName` for cross-activity name persistence, wrapped in try/catch for private-mode browsers.
- `dom.ts` — `$` / `$$` jQuery-style helpers.

What the runtime does for students today:

- On DOM ready, calls `init()`. `init` parses the activity-config blob (six fields: `activityId`, `versionNum`, `submissionEndpoint`, `submissionMode`, `revisionMode`, `gradingMode`); on null, the runtime logs an error and returns — the page stays static. On success, walks `.activity-section` → fill-in-blank blocks → blanks once, building typed `BlankRef` / `FillInBlankRef` / `SectionRef` maps keyed by uuid, and seeds initial state with every section unchecked / unlocked / zero-score.
- Restores the student's name from `localStorage` and mirrors it to `state.studentName`.
- Wires every blank's blur handler to `checkBlank(ref)`, which scores via `scoreBlank` (empty → null; else true/false from `evaluateAnswer`) and applies `.correct` / `.incorrect` classes via `applyBlankFeedback`.
- On submit click: validates non-empty name; mirrors it to `state.studentName`; persists via `saveName`; iterates `refs.blanks` to gather a payload; POSTs `{ activityId, displayName, responses: { schemaVersion: 2, blanks }, score }` to the submission endpoint. Disables the submit button during the request; flips `state.submitted = true` on success; re-enables on failure.

What the runtime does NOT do yet (all Stage 13 target): per-section checkpoint scoring (the check button click is not yet wired); feedback rendering beyond the correct/incorrect class toggle (hints aren't toggled; mistake feedback isn't dispatched; solutions aren't revealed); submission-mode enforcement (locked / free / single all behave the same — single is the only one fully accurate); revision-mode resubmission; localStorage answer persistence (typed values aren't saved across page loads); confidence-rating capture (the fieldset renders but its value isn't read); the `render(state, refs)` function with change-guarded DOM diffing.

The sections that follow describe both as-built and target code; each notes inline which it is.

## Architecture decisions

Except where a paragraph notes otherwise, the decisions below describe the **target** runtime (Stages 11–14). They are the committed design; see **Current state** for what is actually built.

**Inlined runtime — settled in Stage 11.** The runtime is inlined into every published page via the generated string module pattern (esbuild builds it as IIFE, writes the minified text into a committed TypeScript string constant, `document.ts` concatenates that into a `<script>` tag). The earlier "separate `runtime.js` file referenced by URL" model was the original design in this doc; Stage 11 chose inlining instead — one fewer request on a school Chromebook, and the runtime stays co-versioned with the HTML it ships in. The separate-file model is the Phase 3+ migration target when a CDN-hosted shared runtime becomes worth the request cost.

**`runtimeVersion` — Phase 3+ migration anchor [target].** Not emitted today (the runtime is inlined, so there is nothing to version-select, and there is no `#activity-root` element to carry it). When the CDN-hosted shared runtime lands, a runtime version selector is needed so the loader picks the right file; it lives wherever the loader can read it earliest — likely a `data-*` attribute on a container. Decide its exact home then.

**Plain state object + render() with DOM diffing guards — partially in place; `render()` is Stage 13.** Single source of truth is a plain JS object (`RuntimeState`). User actions mutate state, then call `render()`. `render()` is the only function that touches the DOM. Every DOM mutation is guarded: only write if the value actually changed (`if (el.textContent !== value) el.textContent = value`). Prevents layout thrashing and makes render() idempotent — safe to call multiple times with no side effects. **Status post-Stage-12:** `RuntimeState` exists and is seeded by `createInitialState`. Submission flips `state.submitted` and `state.studentName`. `applyBlankFeedback` is the seed of state→DOM separation (DOM-only, no decisions). The actual `render(state, refs)` function — and the per-blank / per-section state fields it reads — are Stage 13 work.

**Data-attribute contract is a public API.** The HTML emitted by the renderer is the interface. Once activities are published, that contract is frozen for those activities forever. Additive changes (new attributes) are safe. Removing or renaming existing attributes breaks published activities. Treat with the same versioning discipline as a REST API. The per-element attributes (`data-block-*`, `data-blank-*`, `data-section-id`) are emitted and read today; see the contract section for what is `[emitted today]` vs `[target]`.

**Pure scoring, init pass builds maps — done in Stage 12.** On init, the runtime walks the DOM once (in `init.ts`) and builds in-memory `Map`s of typed refs: `refs.blanks` by `blank.id`, `refs.fillInBlanks` by `block.id`, `refs.sections` by `section.id`. New block categories in Phase 2+ (choices, orderings, matches, graphs, etc.) will add parallel maps. Scoring functions (`scoreBlank` in `blanks.ts`) operate on these maps + the typed value, not by re-querying the DOM. One architectural leak remains: `evaluateAnswer` reads `data-*` attributes off the held `ref.input` rather than taking parsed values — refactor candidate for Stage 13 if it becomes friction.

**Source maps — dev/debug artifact only, in Stage 11.** Because the runtime is inlined (not a separate file), there is no source map for students to fetch. Esbuild emits `packages/renderer/dist/runtime.js.map` as a dev artifact (gitignored); debugging a teacher-reported bug means reproducing against the local unminified build. When the runtime moves to a separate-file CDN model (Phase 3+), the source map ships alongside it for in-browser debugging.

**Defensive attribute reads everywhere.** Every `dataset.X` read uses a `?? default` fallback. Every JSON-encoded attribute is wrapped in try/catch. An old published activity loading against a newer runtime degrades gracefully to default behavior. The runtime never throws to the student.

**Error boundaries on init and event handlers — partially in place; fuller version is Stage 13.** `init()` returns null on missing or malformed config and the caller falls back to a no-op runtime (page stays static, no scoring or submission). `parseConfig` is defensive (returns null on malformed JSON or wrong-typed required fields); `buildRefs` warns-and-skips malformed per-element attributes rather than throwing. **Still target for Stage 13:** every event handler (blur, check-button click, hint toggle, submit) wrapped in try/catch so a scoring bug for one section doesn't break the rest of the activity. `submit()` already has the fetch-failure path covered; the other handlers don't yet.

**Block category awareness — emitted today; full category-driven init is Stage 13+.** The renderer emits `data-block-category="content|question|scaffold"` on every block. Stage 12's `init.ts` walks specifically `[data-block-type="fill_in_blank"]` rather than partitioning by category — fine for Phase 1's single-question-type runtime. The category-driven routing pattern (only `question` blocks register response handlers; `content` blocks are inert; `scaffold` blocks may have progressive-disclosure UI later) becomes important as more question types land in Phase 2+; the per-question-type init handlers will register through the registry pattern described under Standing constraints.

## The data-attribute contract

This is the API between renderer (emits) and runtime (reads). Additive changes only — once an activity is published, the attributes in its HTML are frozen for it forever. Document every attribute here; if it's not in this section, it doesn't exist.

**Status tags.** The runtime is built in Stages 11–14, *after* the renderer, so parts of this contract are still a target the renderer has not met. Attribute groups below carry a status tag:

- **[emitted today]** — current renderer output; relied on by shipping code and tests. Safe to build against.
- **[target — Stage N]** / **[target — Phase N]** — the shape the renderer must emit when that stage or phase lands. Not in current HTML; the exact shape may still shift until then. Do not assume it is present.

"If it's not in this section it doesn't exist" still holds — but "in this section" now distinguishes *emitted* from *targeted*.

### Document root

The renderer's `document.ts` wraps the body in a full HTML document. Runtime parameters reach the runtime two ways, following the **split-by-purpose** rule (see STATE.md's architecture decisions): config the JS consumes goes in a JSON blob; values the CSS must select on go in `data-*` attributes on a container.

**[emitted today]** The renderer emits a `<main class="activity-container">` wrapper carrying `data-activity-type` and a JSON config blob with six fields:

```
<main class="activity-container" data-activity-type="worksheet">
  ...
</main>
<script id="activity-config" type="application/json">
  {"activityId":"<uuid>","versionNum":<int>,"submissionEndpoint":"<url>",
   "submissionMode":"single|locked|free",
   "revisionMode":"free|locked",
   "gradingMode":"auto|manual|mixed"}
</script>
```

The runtime parses `#activity-config` once on startup (via `parseConfig` in `config.ts`, which defensively returns null on any malformed field). The renderer escapes any literal `</script` in the JSON. `data-activity-type` is a CSS hook (`worksheet | exit_ticket | warm_up | review`) so the stylesheet can vary layout per type without the runtime needing to read it. There is **no `#activity-root` element** and **no document-root `data-*` attributes** beyond `data-activity-type` on the container. An earlier draft of this contract specified `<div id="activity-root" data-submission-mode=… data-grading-mode=… data-schema-version=…>`; that design was never built and has been superseded by the split below. Ignore any reference to `#activity-root` anywhere.

**Settled in Stage 12 step 5.** The split-by-purpose contract for activity-level config:

- **CSS hooks → `data-*` on `activity-container`.** `data-activity-type` is the sole instance today. `data-submission-mode` was considered as a candidate, but the renderer omits checkpoint markup entirely in `single` mode rather than relying on CSS to hide it, so the attribute isn't needed.
- **JS-only config → the `activity-config` blob.** `submissionMode`, `revisionMode`, and `gradingMode` join the original three (`activityId`, `versionNum`, `submissionEndpoint`) in the blob. The runtime reads `activityType` from the container attribute — not duplicated into the blob.

**[target — Phase 3+]** `runtimeVersion` is the migration anchor for the CDN-hosted shared runtime. Not emitted today. When the CDN move happens it lives wherever the loader reads it earliest — likely a `data-*` attribute. Decide then.

The deciding rule throughout: **CSS cannot read the JSON blob**, so anything CSS must branch on is forced to be an attribute; everything else defaults to the blob.

### Section

```
<!-- [emitted today] -->
<section class="activity-section"
         data-block-category="content"
         data-section-id="<uuid>">
  <!-- optional <h2 class="section-title">, then blocks -->
</section>
```

`<section>` is content (organizational), not a question — `data-block-category` is always `content`. Sections carry no `data-block-type`: they are containers, not blocks (see "Block identity attributes" below).

**[emitted today, since Stage 12 step 4]** When `submissionMode` is `locked` or `free`, the `<section>` additionally carries `data-is-checkpoint="true | false"`; in `single` mode the attribute is omitted entirely.

### Reference panel (Phase 2)

**[target — Phase 2] — not emitted today.** The schema field exists (`ActivityDocument.referencePanel`, added Stage 9e); the renderer layout and editor authoring UX are Phase 2 work.

```
<aside class="reference-panel"
       data-reference-panel
       data-block-category="scaffold">
  <header class="reference-panel-title"><!-- optional title --></header>
  <div class="reference-panel-content">
    <!-- block-rendered content from ActivityDocument.referencePanel.blocks -->
  </div>
</aside>
```

The reference panel is a sticky sidebar (collapsible on mobile) holding student-facing reference content (formula charts, periodic tables, vocabulary lists, conversion tables, maps). The renderer emits it only when `ActivityDocument.referencePanel` is present. Content blocks inside use the same block schema as the activity body — no new block types needed. `data-block-category="scaffold"` signals to the runtime that nothing inside contributes to scoring or checkpoint behavior. Phase 1 Stage 9e adds the schema field as forward-compatibility; renderer layout and editor authoring UX are Phase 2.

Optional collapse/expand for mobile uses native `<details>` / `<summary>` elements where possible, keeping the basic UI script-free. Any runtime behavior beyond that (remembering open/closed state across sections, smart scroll positioning) is a Phase 2 implementation decision.

### Block identity attributes (every block)

```
<!-- [emitted today] — every top-level block -->
<… data-block-category="content | question | scaffold"
    data-block-type="<schema discriminant>"
    data-block-id="<uuid>" …>

<!-- [emitted today] — sections: containers, not blocks -->
<section data-block-category="content" data-section-id="<uuid>" …>
```

Every top-level block emitted by the renderer carries `data-block-category`, `data-block-type`, and `data-block-id`. (Confirmed against the renderer's `blocks/fill-in-blank.ts` and `blocks/problem.ts`.)

- `data-block-type` is the Zod schema discriminant **verbatim** — snake_case (`paragraph`, `heading`, `math_block`, `image`, `callout`, `problem`, `fill_in_blank`, `bullet_list`, `ordered_list`). It is deliberately *not* the kebab-case used in CSS class names (`math_block` renders with class `block-math`): the class is a styling namespace, `data-block-type` is an identity namespace. The Stage 11 init registry keys on this value (`registerBlockKind('fill_in_blank', …)`), so it must equal the schema literal exactly — there is no kebab↔snake mapping layer anywhere.
- `data-block-id` is the block's stable document `id` (uuid).
- `data-block-category` is the coarse discriminator; `data-block-type` is the fine one. Category exists so analytics and dashboard features can reason about block kinds without enumerating every block-type string.

`<section>` and `<li>` are **not** blocks: `<section>` is a container carrying `data-block-category` + `data-section-id` only; list items carry neither category nor block-type. The init registry never registers them as block kinds.

Phase 1 block types by category:

- `content` — `paragraph`, `heading`, `image`, `callout`, `math_block`, `bullet_list`, `ordered_list` (plus `divider`, `table` in Phase 2)
- `question` — `problem`, `fill_in_blank` (plus `multiple_choice`, `matching`, `ordering` in Phase 2; `short_answer`, `essay` in Phase 2.6; `interactive_graph` in Phase 2.7; `audio_response`, `video_response`, `file_upload` in Phase 2.8; `annotate_text`, `annotate_image` in Phase 2.9)
- `scaffold` — (Phase 2+) `worked_example`, `faded_worked_example`, `learning_objective`, `self_explanation`

### Checkpoint button

**[emitted today, since Stage 12 step 4]** Rendered per section, only when that section is a checkpoint (`isCheckpoint: true`) and `submissionMode` is `locked` or `free`:

```
<button class="js-checkpoint-btn" data-for-section="<uuid>" type="button">
  Check this section
</button>
<div class="js-section-score" data-for-section="<uuid>" hidden>
  <!-- populated by the runtime when Stage 13 wires the click handler: "4 / 6 correct" -->
</div>
```

`type="button"` is non-negotiable — without it, browsers default to `type="submit"`, which would submit a parent form if one existed. The button is wired by Stage 13; today it renders but does nothing on click.

### Fill-in-blank

A fill-in-blank renders as **two nested levels**: the block `<div>`, carrying block-level metadata, and one or more blank-token `<input>` elements inside its body. Block-level fields (`solution`, `hasConfidenceRating`, `skills`) belong on the block; per-blank fields (`answer`, `hint`, `mistakeFeedback`) belong on each token.

#### Fill-in-blank block

```
<!-- [emitted today] -->
<div class="block block-fill-in-blank"
     data-block-category="question"
     data-block-type="fill_in_blank"
     data-block-id="<uuid>">
  <div class="block-problem-number">3.</div>
  <div class="block-problem-body">
    <!-- inline content: text, inline math, and blank-token <input>s -->
  </div>
</div>
```

(Confirmed against `renderer/src/blocks/fill-in-blank.ts`.)

**[emitted today, since Stage 12 step 3]** The block `<div>` additionally carries `data-solution="..."`, `data-has-confidence-rating="true"`, and `data-skills='[…]'` (JSON-encoded array) — each is omitted entirely when the field is at its schema default (no solution / `hasConfidenceRating: false` / empty skills). The field is `skills`, not `standards` — an earlier draft of this doc named the attribute `data-standards`, which is dead. When `data-has-confidence-rating="true"`, **one** confidence fieldset is rendered **per block — not per blank** (`hasConfidenceRating` is a `FillInBlankBlock` field; the runtime applies the single rating uniformly to every blank in the block):

```
<fieldset class="js-confidence-rating" data-for-block="<uuid>">
  <legend>How confident are you?</legend>
  <label><input type="radio" name="conf-<uuid>" value="unsure" />   Unsure</label>
  <label><input type="radio" name="conf-<uuid>" value="think_so" /> Think so</label>
  <label><input type="radio" name="conf-<uuid>" value="certain" />  Certain</label>
</fieldset>
```

When `data-solution` is present, a hidden `<div class="js-solution" data-for-block="<uuid>" hidden>` is also rendered inside `block-problem-body`, statically containing the solution text. Stage 13 toggles its `hidden` attribute on check. The fieldset's selected value is not yet captured into the submission payload — that wiring is Stage 13. The editor doesn't yet surface skill-tagging UI, so in practice `data-skills` is always omitted today; the renderer side is in place for when the editor lands the feature.

#### Blank token

```
<!-- [emitted today] one <input> per blank, sitting directly in block-problem-body -->
<input type="text"
       class="blank"
       data-blank-id="<uuid>"
       data-blank-answers="x+2|x + 2"
       aria-label="Blank 1 of 3"
       style="--blank-width:6ch"
       autocomplete="off"
       autocapitalize="off"
       autocorrect="off"
       spellcheck="false" />
```

- `data-blank-answers` is **pipe-delimited** (`answer|alt1|alt2`), *not* JSON. The first segment is the canonical `answer`; the rest are `acceptableAnswers`. The runtime splits on `|`. (A literal `|` in a math answer would be unusual; switch to JSON if that ever changes.)
- `--blank-width` (CSS custom property, `ch` units) sizes the input; defaults to `6`.
- The `autocomplete` / `autocapitalize` / `autocorrect` / `spellcheck` quartet disables browser interference with math input.
- There is **no wrapper element today** — the bare `<input class="blank">` is the whole token.

The current runtime confirms it reads `class="blank"`, `data-blank-id`, `data-blank-answers` (pipe-delimited), and `data-blank-strategy`. The `aria-label` / `--blank-width` / autocomplete attributes are emitted by `inline.ts`'s `renderBlank`, verified against that file — the whole `<input>` shape above is confirmed `[emitted today]`.

**[emitted today, since Stage 12 steps 1–2]** The blank token sits inside a `<span class="blank-wrapper">` and gains sibling hint / feedback elements:

```
<span class="blank-wrapper">
  <input type="text" class="blank" ... />
  <button class="js-blank-hint" type="button" aria-expanded="false"
          aria-controls="hint-<uuid>" aria-label="Show hint">?</button>
  <span class="js-blank-hint-text" id="hint-<uuid>" hidden>Try factoring out 2.</span>
  <span class="js-blank-feedback" data-for-blank="<uuid>" aria-live="polite" hidden></span>
</span>
```

The wrapper is needed because `<input>` is a void element — siblings can't be children. The `.blank` class **stays on the `<input>`** (does not migrate to the wrapper), preserving every existing CSS selector. The hint affordance is always-available (a `?` button next to the input); the original "reveal on incorrect" design was dropped in favor of student agency. The `.js-blank-hint` button and `.js-blank-hint-text` span are emitted only when `data-hint` is present; the `.js-blank-feedback` span is always emitted (the runtime needs it as a render target). The input itself also carries `data-hint="..."` (when set) and `data-mistake-feedback='[{"match":"2x","feedback":"..."}]'` (a JSON array, when non-empty). The hint button's click handler — toggling `hidden` on the text and flipping `aria-expanded` — is Stage 13 work.

**[target — Phase 2.5]** `data-blank-strategy="list | expression | computed"` selects the scoring strategy; when absent the runtime defaults to `"list"`. The current runtime already implements this dispatch (`evaluateAnswer`), with only the `list` strategy defined. `expression` / `computed` arrive with parameterized problems.

**JSON-encoded attributes** (`data-mistake-feedback`, `data-skills`) are HTML-entity-escaped by the renderer; the runtime parses each once at init and stores the result, never re-parsing on user input. `data-blank-answers` is the pipe-delimited exception above.

**`aria-live`** on the `js-blank-feedback` span is set in the source HTML by the renderer (not added later by the runtime) — setting `aria-live` on an already-existing element is unreliable across screen readers.

**Accessibility — positional label.** Each blank `<input>` carries a renderer-supplied `aria-label`. With multiple blanks in the block it is positional — `Blank 1 of 3`, `Blank 2 of 3`, … — numbered in document order; a lone blank is labelled `Fill in the blank`. Without it, a blank inside prose is announced by screen readers only as "edit text", giving the student no cue which blank has focus.

### Reading discipline

Two sources, two patterns. Activity-level config is parsed once from the `#activity-config` blob; per-element data is read off `data-*` attributes during the init pass.

```typescript
// CORRECT — parse the config blob once, on init, inside try/catch.
let config = { activityId: '', versionNum: 0, submissionEndpoint: '' };
try {
  const el = document.getElementById('activity-config');
  config = JSON.parse(el?.textContent ?? '{}');
} catch {
  console.error('Invalid activity config');  // degrade; never throw to the student
}

// CORRECT — a CSS-hook attribute on the container, defensive read with default.
const activityType =
  (document.querySelector('.activity-container') as HTMLElement | null)
    ?.dataset.activityType ?? 'worksheet';

// CORRECT — data-blank-answers is pipe-delimited, not JSON. Split on `|`;
// an absent attribute yields a safe empty list.
const answers: string[] =
  (blank.dataset.blankAnswers ?? '').split('|').filter(Boolean);

// CORRECT — JSON-encoded per-element attributes (e.g. data-mistake-feedback)
// are parsed inside try/catch with a default.
let mistakeFeedback: Array<{ match: string; feedback: string }> = [];
try {
  mistakeFeedback = JSON.parse(blank.dataset.mistakeFeedback ?? '[]');
} catch {
  console.warn(`Malformed mistake-feedback for blank ${blank.dataset.blankId}`);
}

// WRONG — assumes attributes exist / are valid
const mf = JSON.parse(blank.dataset.mistakeFeedback);  // throws on malformed
```

## State shape

**Status post-Stage-12: the state object and refs maps exist; per-blank / per-checkpoint state fields and the `render()` function are Stage 13 work.** The interfaces below match the as-built source in `packages/renderer/src/runtime/state.ts` and `packages/renderer/src/runtime/refs.ts`. Stage 13 expands `SectionState` (and likely adds a per-blank result map to `RuntimeState`) for checkpoint scoring; the fields that exist today initialize to safe defaults until then.

The runtime maintains a single state object. Mutated by user actions. Synchronized to the DOM by `render()`.

```typescript
interface RuntimeState {
  // From the activity-config blob, immutable after init
  activityId: string;
  versionNum: number;
  submissionMode: 'single' | 'locked' | 'free';
  revisionMode: 'free' | 'locked';
  activityType: 'worksheet' | 'exit_ticket' | 'warm_up' | 'review';
  gradingMode: 'auto' | 'manual' | 'mixed';

  // Mutable
  submitted: boolean;
  attemptNumber: number;     // increments on resubmit
  sections: Record<string, SectionState>;  // keyed by section.id
  studentName: string;       // bound to the name input
}

interface SectionState {
  isCheckpoint: boolean;
  checked: boolean;
  locked: boolean;           // true after check if submissionMode === 'locked'
  score: number;
  total: number;
  checkedAt: string | null;  // ISO timestamp
}
```

In-memory reference maps built once on init (not part of state, never mutated):

```typescript
// Per-blank — mirrors the BlankToken schema. One per <input class="blank">.
interface BlankRef {
  input: HTMLInputElement;
  feedbackEl: HTMLElement;        // sibling .js-blank-feedback span
  hintButton: HTMLButtonElement | null;  // .js-blank-hint, null when no hint
  hintTextEl: HTMLElement | null; // .js-blank-hint-text, null when no hint
  answers: string[];              // canonical answer + acceptableAnswers
  strategy: string;               // 'list' (Phase 1); 'expression'/'computed' Phase 2.5+
  hint: string | null;
  mistakeFeedback: Array<{ match: string; feedback: string }>;
  blockId: string;                // parent fill_in_blank block
  sectionId: string;              // section the parent block belongs to
}

// Per fill_in_blank BLOCK. solution / hasConfidenceRating / skills are
// FillInBlankBlock fields (NOT BlankToken fields), and the confidence
// fieldset is one-per-block — so they belong here, not on each BlankRef.
interface FillInBlankRef {
  el: HTMLElement;
  blankIds: string[];
  solution: string | null;
  solutionEl: HTMLElement | null; // .js-solution slot, null when no solution
  hasConfidenceRating: boolean;
  confidenceFieldset: HTMLFieldSetElement | null;
  skills: string[];
  sectionId: string;
}

interface SectionRef {
  el: HTMLElement;
  isCheckpoint: boolean;
  blankIds: string[];
  blockIds: string[];             // fill_in_blank blocks in this section
  checkButton: HTMLButtonElement | null;
  scoreEl: HTMLElement | null;
}

const blanks       = new Map<string, BlankRef>();
const fillInBlanks = new Map<string, FillInBlankRef>();
const sections     = new Map<string, SectionRef>();
```

State changes; refs don't. Treat refs as `Readonly<>` after init.

Note for future edits: an earlier draft of this section put block-level fields (`solution`, `hasConfidenceRating`, `skills`) and the per-block confidence fieldset on `BlankRef`, and used the field name `standards`. Both are wrong against the schema — the field is `skills` (not `standards`), and those fields live on `FillInBlankBlock` (not `BlankToken`). The split shown above is correct and matches `packages/renderer/src/runtime/refs.ts` as of Stage 12 step 6a.

In Phase 2 and beyond, additional refs maps will be added for each new question category (`choices`, `orderings`, `matches`, `graphs`, `freeResponses`, `files`, `annotations`). The init registry pattern keeps this additive — adding a new question-block kind registers a handler in the init registry, allocates a refs map, and contributes scoring strategies to the `evaluateAnswer` dispatch. No refactoring of init for each new kind.

## Build pipeline

**As built in Stage 11.** `scripts/bundle-renderer.mjs` runs two esbuild builds in sequence:

1. **Runtime build.** Entry `packages/renderer/src/runtime/index.ts` → output as an IIFE (not ESM, since it executes immediately when inlined into a `<script>` tag, with no module loader involved). Minified, target `chrome90` (covers school Chromebooks, Firefox 88+, Safari 14+, Edge 90+). External source map written to `packages/renderer/dist/runtime.js.map` (dev-only, gitignored). The minified text is written into a generated TypeScript string module at `packages/renderer/src/runtime/generated/runtime-bundle.ts`, which **is committed to git** so a clean checkout can typecheck the renderer without first running the bundler.
2. **Renderer build.** Entry `packages/renderer/src/index.ts` → output as ESM at `supabase/functions/_shared/renderer.bundle.js`. The renderer's `document.ts` imports the generated string module from step 1 and inlines it into a `<script>` tag in every published page.

The inlined model means the `publish-activity` Edge Function only uploads `index.html` to Storage — there is no separate `runtime.js` to upload. When the runtime moves to a separate-file CDN model (Phase 3+), this changes: the runtime ships as `runtime.js` + `runtime.js.map` at a stable CDN path, versioned by `runtimeVersion`, fetched per-page-load rather than inlined.

Phase 2.7+ will add a second esbuild entry for `graph-widget.js` (lazy-loaded, dynamic-imported by the main runtime), and Phase 2.9+ adds a third for `annotation-widget.js`. The main runtime stays small; pages without those block types pay nothing for them.

Bundle size today: the runtime IIFE is roughly 3 KiB minified — well under the 20 KiB target.

## Error handling philosophy

*Current state (post-Stage-12):* `parseConfig` is defensive (returns null on missing/malformed config or wrong-typed required field); `buildRefs` warns-and-skips malformed per-element data attributes rather than throwing. The runtime's response to a null config is "no-op runtime" — the page stays static. Form double-submit protection and fetch error handling are in place. Still target for Stage 13–14: try/catch around event handlers (blur, check-button click, hint toggle, submit) so a scoring bug for one section doesn't break the rest of the activity; localStorage retry queue for network failures during submit.

**Init can fail.** Malformed HTML, missing critical attributes, JSON parse errors — all possible if a renderer bug ships. Stage 12's `init()` returns null on missing/malformed config; the caller (in `index.ts`) logs to console and falls back to a no-op runtime (the page renders read-only with no scoring or submission). The earlier "basic submit only" design was considered and rejected — when init can't fully construct the refs/state, a half-working runtime is worse for students than a clearly-static page. Future: per-element parse failures (handled today by warn-and-skip in `buildRefs`) could be surfaced more loudly in dev builds.

**Event handlers can fail.** A scoring bug for one section's check button must not break the rest of the activity. Wrap every handler in try/catch. On error, log to console and leave the UI in its last known good state.

**Network failures on submission:** queue the submission payload in `localStorage` keyed by `activity_id + attempt_number`, retry with exponential backoff (1s, 4s, 16s). If all retries fail, surface a clear message: "your answers are saved locally; we'll try to submit them when you have a connection." Never lose student work to a network blip.

**Form double-submit protection.** On submit click, immediately disable the submit button. Don't re-enable until either success or final failure. Without this, a slow network invites duplicate clicks and duplicate submissions. (The current runtime does this.)

## Testing strategy

The runtime test suite lives at `packages/renderer/src/runtime/__tests__/`. Three files today:

- **`strategies.test.ts`** (Stage 11 seed, pure-function): `evaluateAnswer` dispatch (list strategy variants, unknown-strategy warns + falls back to list), `computeScore` arithmetic (zero / nonzero branches). Runs in the default `node` environment.
- **`init.test.ts`** (Stage 12 step 6a, JSDOM): `parseConfig` (valid blob / missing tag / malformed JSON / missing required field), `buildRefs` for sections / fill-in-blank blocks / blanks (including cross-references between maps), `createInitialState` defaults, `init()` orchestration (success path + null on missing config). Uses the `@vitest-environment jsdom` docblock.
- **`blanks.test.ts`** (Stage 12 step 6b, JSDOM): `trimValue` whitespace rules, `scoreBlank` empty / match / non-match / trim-before-compare / acceptableAnswers, `applyBlankFeedback` class toggling including correct → incorrect transitions, `checkBlank` composition.

**Test coverage still target:** all three submission modes (single / locked / free) end-to-end, revision attempt increment, network failure retry path, error-boundary fallback per event handler. These land in Stage 13 (checkpoint scoring) and Stage 14 (submission flow / retry).

**Patterns:**

- Pure-function tests run in node (no docblock).
- JSDOM-backed tests add `@vitest-environment jsdom` as a per-file docblock — the other files stay node so they're not paying for JSDOM setup.
- For JSDOM tests, build a minimal HTML fragment that mirrors what the renderer emits for the case under test, install it into `document.body`, run the function under test, assert the state shape AND the rendered DOM state. The render() diffing guards (Stage 13) will make DOM-mutation assertions straightforward — if a value didn't change, the DOM didn't change.
- JSDOM fragments are hand-written rather than generated by calling `renderActivity()` from `@activity/renderer`. The goal is to test runtime code in isolation against the data-attribute contract; a renderer regression would surface as a mismatch caught by the broader `render.test.ts` suite, not by these tests.

## Standing constraints

- **Runtime does not import from `@activity/schema`.** No Zod, no bundler-resolved dependencies. The runtime defines its own minimal TypeScript interfaces that mirror the data-attribute contract. This is a deliberate duplication for a deliberate reason — keeping the runtime tiny.

- **Performance budget:** runtime bundled + minified ≤ 20KB target, ≤ 40KB hard ceiling. School Chromebooks on slow Wi-Fi load activities in browser-bound conditions; every kilobyte costs paint time.

- **Browser support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Covers all school-issued Chromebooks per Google's ChromeOS support window.

- **`render()` is the only DOM mutator** (target — Stage 13). Every other function reads from state, never writes to DOM. Every DOM mutation in render() is guarded by a change check. Stage 12 seeded this with `applyBlankFeedback` (DOM-only, no state read); Stage 13 generalizes it.

- **All attribute reads have a fallback.** No `dataset.X` access without `?? default`. No `JSON.parse(...)` without try/catch.

- **No JS dependencies.** Runtime is hand-written vanilla TypeScript bundled to a single file. Adding utility libraries (lodash, date-fns, etc.) would blow the size budget and add attack surface for no benefit. Inline the small helpers you need.

- **Heavy widgets are lazy-loaded into separate bundles.** Interactive graphs (Phase 2.7) and annotation widgets (Phase 2.9) are dynamic imports from the main runtime. Pages without those block types never pay for them. Each lazy widget follows the same architectural commitments as the main runtime (source maps, defensive reads, graceful degradation).

- **Naming convention discipline:**
  - TypeScript fields: `camelCase` (`attemptNumber`, `revisionMode`)
  - HTML data attributes: `kebab-case` (`data-attempt-number`, `data-revision-mode`)
  - The renderer is the only layer that maps between them.

- **Block category as the coarse type discriminator.** The init pass routes by `data-block-category` first, then by `data-block-type`. New block kinds register through a small init-registry pattern (`registerBlockKind('multiple_choice', { init, score, render })`) so that adding a kind is one entry, not a refactor.

## Open questions / deferred decisions

- **CDN-hosted shared runtime (Phase 3+):** when this moves from versioned-per-publish to CDN-hosted, a `runtimeVersion` selector picks which CDN runtime file to load. Migration is additive. Decide CDN provider when the move is made (Cloudflare or Supabase Storage with long cache TTL are both reasonable).

- **Service worker for offline mode:** Phase 1 has (target) localStorage retry. Full offline (compose answers without connectivity, sync later) is a Phase 3+ consideration. A service worker could intercept submission failures more elegantly than localStorage retry, but adds complexity and an install step.

- **MathLive in published HTML:** Phase 2.5 decision per ROADMAP. If MathLive is included for student-side math input, the runtime bundle size budget must be re-evaluated.

- **Server-side scoring (Phase 5):** when this lands, the runtime's scoring functions remain in place for instant feedback, but final submission stops trusting them. The Edge Function re-scores against the answer keys server-side. The data-attribute contract for answers (`data-blank-answers`) likely changes — answers may not be in the published HTML at all. Plan a v2 of the runtime then; don't try to support both models in v1.

- **Media capture browser quirks (Phase 2.8):** MediaRecorder API has had iOS Safari quirks historically. Decide at phase start whether to launch with both in-browser recording and upload, or upload-only with recording as a follow-up. The runtime side either way is a media-capture widget that emits a Blob + metadata for the submission payload.

- **Annotation coordinate stability (Phase 2.9):** when the runtime captures annotation positions, what coordinate system does it use? Character indices into rendered text vs DOM anchors vs normalized fractions of rendered geometry. Decide at phase start.

- **Audio narration of activity prose (Phase 4 UDL):** browser Web Speech API vs server-rendered audio files. The runtime side is a play-button + word-level highlight handler either way; the question is where the audio comes from.

## Things NOT to do

- **Don't reintroduce `#activity-root`.** The document-root config mechanism is the `<script id="activity-config" type="application/json">` blob plus, where CSS needs them, `data-*` attributes on `activity-container` — see the Document root section. An earlier `#activity-root`-with-all-data-attributes design was superseded; don't resurrect it.

- **Don't query the DOM inside scoring or state functions.** Read once on init; mutate state; let render() handle DOM updates. The bug class this prevents — "feedback works the first time but not on the second check" — is caused by stale DOM state querying.

- **Don't import from `@activity/schema`.** Parallel types in the runtime are deliberate. If the schema changes, update both sides; if you find yourself wishing for `import { ActivityDocument }` in the runtime, that's a signal to add a runtime-local interface instead.

- **Don't add JS dependencies.** The runtime is single-file vanilla TypeScript by design. Every added dependency expands the size budget and adds attack surface for student-facing code.

- **Don't trust client-supplied attempt_number.** The Edge Function derives `attempt_number` server-side from `max(attempt_number) + 1` for the student's identity. The runtime sends a local guess for optimistic UI, but the server's value is canonical.

- **Don't reveal solutions before checking.** The renderer emits a `.js-solution` slot containing the solution text with `hidden` set by default. The runtime's job at check time (Stage 13) is to toggle that `hidden` attribute. Until checking, the slot stays hidden — making it visible early defeats the pedagogical purpose. (The solution text being in HTML source at all is the existing security ceiling and is acceptable for formative assessment; the "don't render visible early" rule is the additional in-runtime discipline.)

- **Don't make breaking changes to the data-attribute contract.** Add new attributes; never rename or remove existing ones. A renamed attribute breaks every activity published before the rename, forever, because that HTML is static and immutable in Storage.

- **Don't bake the answer key into the DOM for manually-graded blocks.** Phase 2.6's short_answer and essay blocks have no auto-scoring; the data-attribute payload should not pretend they do. The block category (`question`) and block type drive runtime behavior; the runtime's scoring path skips manual-graded blocks entirely.

- **Don't conflate runtime state with submission payload.** State has many fields (refs to DOM nodes, transient UI state). Submission payload has only what the Edge Function needs (blanks, attemptNumber, checkpointResults, studentName, confidence per blank, and the future parallel maps for new question categories). Build the payload from state at submit time; don't try to make state and payload the same shape.

- **Don't sniff `data-block-type` when `data-block-category` is enough.** Category-level decisions (is this block interactive? does it contribute to scoring? does it have a checkpoint contribution?) should branch on category. Block-type sniffing is for type-specific behavior only.
