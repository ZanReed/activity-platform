# RUNTIME.md

Architecture decisions and standing constraints for the published-activity runtime — the JavaScript that runs in students' browsers on every published activity page. Companion to the project-level STATE.md (where everything is) and ROADMAP.md (where everything is going). This file describes how the runtime works and why.

Update at the end of each work session that touches the runtime — replace the relevant sections, don't append.

## What this is

The runtime is the JavaScript bundle (`runtime.js`) embedded by reference in every published activity. It handles:

- Student input state (what they've typed into blanks, selected, ordered, recorded, etc.)
- Per-section checkpoint scoring against answer keys baked into the HTML
- Feedback rendering (✓/✗, hints, mistake-specific feedback, solutions after checking)
- Revision mode enforcement (free / locked)
- Attempt tracking across resubmissions
- Final submission to the `ingest-submission` Edge Function
- Graceful degradation when anything goes wrong

It does NOT handle:

- Authoring (that's the editor in `@activity/app`)
- Server-side validation (that's the Edge Function)
- Cross-activity state (each page load is isolated)
- Real-time collaboration (not in scope for any phase currently planned)
- Anti-cheating beyond what's possible in client code (Phase 5 server-side grading is the answer)

## Architecture decisions

**Separate file, versioned-per-publish.** The runtime lives at `packages/renderer/src/runtime/` as TypeScript source. `bundle-renderer.mjs` builds it as `runtime.js` (plus `runtime.js.map`). `publish-activity` uploads both alongside `index.html` to the versioned Storage path. HTML references it as `<script type="module" src="./runtime.js">`. Each published version has its own copy of the runtime; bug fixes to the runtime require republishing affected activities (acceptable in Phase 1, addressed by Phase 3+ CDN-hosted shared runtime).

**`data-runtime-version="1"` on the activity root from day one.** Migration anchor for the Phase 3+ move to CDN-hosted shared runtime. When that move happens, the version attribute selects which runtime file to load. No schema changes required.

**Plain state object + render() with DOM diffing guards.** Single source of truth is a plain JS object. User actions mutate state, then call `render()`. `render()` is the only function that touches the DOM. Every DOM mutation is guarded: only write if the value actually changed (`if (el.textContent !== value) el.textContent = value`). Prevents layout thrashing and makes render() idempotent — safe to call multiple times with no side effects.

**Data-attribute contract is a public API.** The HTML emitted by the renderer is the interface. Once activities are published, that contract is frozen for those activities forever. Additive changes (new attributes) are safe. Removing or renaming existing attributes breaks published activities. Treat with the same versioning discipline as a REST API.

**Pure scoring, init pass builds maps.** On init, the runtime walks the DOM once and builds in-memory `Map`s for each interactive element category (blanks by id, sections by id, and — when new block categories land in Phase 2+ — choices, orderings, matches, graphs, etc.). Every scoring/feedback function operates on these maps, not by querying the DOM. Scoring functions are pure functions of the maps + input values — testable without a DOM. The DOM gets touched only in init (read) and render (write).

**Source maps emitted, always.** `runtime.js.map` is built alongside `runtime.js` and uploaded with it. Modern browsers only fetch the source map when DevTools is open, so zero performance cost for students. Without it, teacher-reported bugs in minified runtime are not debuggable.

**Defensive attribute reads everywhere.** Every `dataset.X` read uses a `?? default` fallback. Every JSON-encoded attribute is wrapped in try/catch. An old published activity loading against a newer runtime degrades gracefully to default behavior. The runtime never throws to the student.

**Error boundaries on init and event handlers.** Init wrapped in try/catch with fallback to "basic submit only" mode (every blank read, no checkpoint behavior, no feedback). Every event handler wrapped in try/catch. A scoring bug for one section's check button does not break submission of the whole activity.

**Block category awareness.** The renderer emits `data-block-category="content|question|scaffold"` on every block. The runtime uses this to drive init-pass partitioning: only `question`-category blocks register response handlers and contribute to scoring; `content` blocks are inert presentational; `scaffold` blocks (worked examples, hints, learning objectives) are presentational but may have their own progressive-disclosure UI later. Adding a new block kind doesn't require sniffing `data-block-type` — its category tells the runtime how to treat it. Categories are deliberately coarse; finer-grained discrimination still uses `data-block-type` and the registry pattern below.

## The data-attribute contract

This is the API between renderer (emits) and runtime (reads). Additive changes only — once an activity is published, the attributes in its HTML are frozen for it forever. Document every attribute here; if it's not in this section, it doesn't exist.

**Status tags.** The runtime is built in Stages 11–14, *after* the renderer, so parts of this contract are still a target the renderer has not met. Attribute groups below carry a status tag:

- **[emitted today]** — current renderer output; relied on by shipping code and tests. Safe to build against.
- **[target — Stage N]** / **[target — Phase N]** — the shape the renderer must emit when that stage or phase lands. Not in current HTML; the exact shape may still shift until then. Do not assume it is present.

"If it's not in this section it doesn't exist" still holds — but "in this section" now distinguishes *emitted* from *targeted*. (The Document root group below predates this convention and has not been re-audited against the renderer.)

### Document root

```
<div id="activity-root"
  data-activity-id="<uuid>"
  data-runtime-version="1"
  data-submission-mode="single | locked | free"
  data-revision-mode="free | locked"
  data-activity-type="worksheet | exit_ticket | warm_up | review"
  data-grading-mode="auto | manual | mixed"
  data-schema-version="1">
```

`data-submission-mode` is the master switch for checkpoint behavior. `single` means no checkpoints render at all; `locked` and `free` enable checkpoint UI per section. `data-revision-mode` controls post-submission behavior — `free` allows resubmit, `locked` does not. `data-grading-mode` (added in Stage 9e) signals whether the runtime is responsible for scoring (`auto`), whether scoring is fully deferred to the teacher (`manual`, Phase 2.6+), or both apply within a single activity (`mixed`, Phase 2.6+). Phase 1 activities all use `auto`; the runtime treats `manual` and `mixed` as defaulting to `auto` until Phase 2.6's per-block grading metadata lands.

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

**[target — Stage 12–13]** When `submissionMode` is `locked` or `free`, the `<section>` additionally carries `data-is-checkpoint="true | false"`; in `single` mode the attribute is omitted entirely. Not emitted today — `render.ts` emits no checkpoint metadata yet.

### Reference panel (Phase 2)

**[target — Phase 2] — not emitted today.** The schema field exists (Stage 9e); the renderer layout and editor authoring UX are Phase 2 work.

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

Every top-level block emitted by the renderer carries `data-block-category`, `data-block-type`, and `data-block-id`.

- `data-block-type` is the Zod schema discriminant **verbatim** — snake_case (`paragraph`, `heading`, `math_block`, `image`, `callout`, `problem`, `fill_in_blank`, `bullet_list`, `ordered_list`). It is deliberately *not* the kebab-case used in CSS class names (`math_block` renders with class `block-math`): the class is a styling namespace, `data-block-type` is an identity namespace. The Stage 11 init registry keys on this value (`registerBlockKind('fill_in_blank', …)`), so it must equal the schema literal exactly — there is no kebab↔snake mapping layer anywhere.
- `data-block-id` is the block's stable document `id` (uuid).
- `data-block-category` is the coarse discriminator; `data-block-type` is the fine one. Category exists so analytics and dashboard features can reason about block kinds without enumerating every block-type string.

`<section>` and `<li>` are **not** blocks: `<section>` is a container carrying `data-block-category` + `data-section-id` only; list items carry neither category nor block-type. The init registry never registers them as block kinds.

Phase 1 block types by category:

- `content` — `paragraph`, `heading`, `image`, `callout`, `math_block`, `bullet_list`, `ordered_list` (plus `divider`, `table` in Phase 2)
- `question` — `problem`, `fill_in_blank` (plus `multiple_choice`, `matching`, `ordering` in Phase 2; `short_answer`, `essay` in Phase 2.6; `interactive_graph` in Phase 2.7; `audio_response`, `video_response`, `file_upload` in Phase 2.8; `annotate_text`, `annotate_image` in Phase 2.9)
- `scaffold` — (Phase 2+) `worked_example`, `faded_worked_example`, `learning_objective`, `self_explanation`

### Checkpoint button

**[target — Stage 12–13] — not emitted today.** `render.ts` renders sections with content only; no checkpoint button is produced yet. This is the shape the renderer must emit when checkpoint scoring lands (rendered per section, only when that section is a checkpoint):

```
<button class="js-checkpoint-btn" data-for-section="<uuid>" type="button">
  Check this section
</button>
<div class="js-section-score" data-for-section="<uuid>" hidden>
  <!-- populated by runtime: "4 / 6 correct" -->
</div>
```

`type="button"` is non-negotiable — without it, browsers default to `type="submit"`, which submits the parent form if one exists and the runtime never gets the click.

### Fill-in-blank

A fill-in-blank renders as **two nested levels**: the block `<div>`, carrying block-level metadata, and one or more blank-token `<input>` elements inside its body. Block-level fields (`solution`, `hasConfidenceRating`, `skills`) belong on the block; per-blank fields (`answer`, `hint`, `mistakeFeedback`) belong on each token. Earlier drafts of this contract collapsed both onto a single `<span class="blank-wrapper">` — that element does not exist; ignore it.

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

**[target — Stage 12–13]** The block `<div>` additionally carries `data-solution="..."` and `data-has-confidence-rating="true | false"`. When `data-has-confidence-rating="true"`, **one** confidence fieldset is rendered **per block — not per blank** (`hasConfidenceRating` is a `FillInBlankBlock` field; the runtime applies the single rating uniformly to every blank in the block):

```
<fieldset class="js-confidence-rating" data-for-block="<uuid>">
  <legend>How confident are you?</legend>
  <label><input type="radio" name="conf-<uuid>" value="unsure" />   Unsure</label>
  <label><input type="radio" name="conf-<uuid>" value="think_so" /> Think so</label>
  <label><input type="radio" name="conf-<uuid>" value="certain" />  Certain</label>
</fieldset>
```

**[target — Phase 2]** The block `<div>` also carries `data-skills='[...]'` (JSON array) once the editor surfaces problem-level skill tagging. The field is `skills`, not `standards` — an earlier draft named this `data-standards`, which is dead.

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

**[target — Stage 12–13]** The blank token additionally carries `data-hint="..."` and `data-mistake-feedback='[{"match":"2x","feedback":"..."}]'` (a JSON array), and gains a sibling feedback slot:

```
<span class="js-blank-feedback" data-for-blank="<uuid>" aria-live="polite" hidden></span>
```

Because an `<input>` is a void element, the feedback `<span>` cannot be its child — it must be a sibling, which means the blank token will need a wrapper element. The wrapper's tag and class, and whether the `blank` class moves onto it, are **not decided** — settle that when the Stage 12–13 feedback work begins (tracked in Open questions below).

**[target — Phase 2.5]** `data-blank-strategy="list | expression | computed"` selects the scoring strategy; when absent the runtime defaults to `"list"`. Not a `BlankToken` schema field yet — it arrives with parameterized problems.

**JSON-encoded attributes** (`data-mistake-feedback`, `data-skills`) are HTML-entity-escaped by the renderer; the runtime parses each once at init and stores the result, never re-parsing on user input. `data-blank-answers` is the pipe-delimited exception above.

**`aria-live`** on the future `js-blank-feedback` span MUST be set in the source HTML by the renderer, not added later by the runtime — setting `aria-live` on an already-existing element is unreliable across screen readers.

**Accessibility — positional label.** Each blank `<input>` carries a renderer-supplied `aria-label`. With multiple blanks in the block it is positional — `Blank 1 of 3`, `Blank 2 of 3`, … — numbered in document order; a lone blank is labelled `Fill in the blank`. Without it, a blank inside prose is announced by screen readers only as "edit text", giving the student no cue which blank has focus.

### Reading discipline

```typescript
// CORRECT — defensive read with default
const revisionMode = (root.dataset.revisionMode ?? 'free') as RevisionMode;

// CORRECT — data-blank-answers is pipe-delimited, not JSON. Split on `|`;
// an absent attribute yields a safe empty list.
const answers: string[] =
  (blank.dataset.blankAnswers ?? '').split('|').filter(Boolean);

// CORRECT — JSON-encoded attributes (e.g. data-mistake-feedback) are parsed
// inside try/catch with a default.
let mistakeFeedback: Array<{ match: string; feedback: string }> = [];
try {
  mistakeFeedback = JSON.parse(blank.dataset.mistakeFeedback ?? '[]');
} catch {
  // malformed JSON — log and continue with no mistake-specific feedback
  console.warn(`Malformed mistake-feedback for blank ${blank.dataset.blankId}`);
}

// WRONG — assumes attributes exist / are valid
const revisionMode = root.dataset.revisionMode;        // could be undefined
const mf = JSON.parse(blank.dataset.mistakeFeedback);  // throws on malformed
```

## State shape

The runtime maintains a single state object. Mutated by user actions. Synchronized to the DOM by `render()`.

```typescript
interface RuntimeState {
  // From HTML root, immutable after init
  activityId: string;
  runtimeVersion: number;
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
interface BlankRef {
  wrapper: HTMLElement;
  input: HTMLInputElement;
  feedbackEl: HTMLElement;
  confidenceFieldset: HTMLFieldSetElement | null;
  answers: string[];
  strategy: 'list' | 'expression' | 'computed';
  hint: string | null;
  mistakeFeedback: Array<{ match: string; feedback: string }>;
  solution: string | null;
  hasConfidenceRating: boolean;
  standards: string[];
  sectionId: string;  // which section this blank belongs to
}

interface SectionRef {
  el: HTMLElement;
  isCheckpoint: boolean;
  blankIds: string[];
  checkButton: HTMLButtonElement | null;
  scoreEl: HTMLElement | null;
}

const blanks = new Map<string, BlankRef>();
const sections = new Map<string, SectionRef>();
```

State changes; refs don't. Treat refs as `Readonly<>` after init.

In Phase 2 and beyond, additional refs maps will be added for each new question category (`choices`, `orderings`, `matches`, `graphs`, `freeResponses`, `files`, `annotations`). The init registry pattern keeps this additive — adding a new question-block kind registers a handler in the init registry, allocates a refs map, and contributes scoring strategies to the `evaluateAnswer` dispatch. No refactoring of init for each new kind.

## Build pipeline

`scripts/bundle-renderer.mjs` (or a new sibling `scripts/bundle-runtime.mjs` if it grows too complex):

- **Entry:** `packages/renderer/src/runtime/index.ts`
- **Output:** `packages/renderer/dist/runtime.js` + `packages/renderer/dist/runtime.js.map`
- **Format:** `esm`
- **Bundle:** `true` (single file, no remote imports)
- **Target:** `chrome90` (covers school Chromebooks on supported ChromeOS versions; also Firefox 88+, Safari 14+, Edge 90+)
- **Minify:** `true` in production, `false` in dev
- **Source maps:** `external`, always emitted
- **External:** nothing (no externals; everything bundles in)

The `publish-activity` Edge Function reads both `index.html` (built per-activity from the document) and `runtime.js` + `runtime.js.map` (built once, shared across all activities published from this renderer bundle version) and uploads all three to the versioned Storage path.

Phase 2.7+ adds a second esbuild entry for `graph-widget.js` (lazy-loaded), and Phase 2.9+ adds a third for `annotation-widget.js`. The main runtime stays small; pages without those block types pay nothing for them.

## Error handling philosophy

**Init can fail.** Malformed HTML, missing critical attributes, JSON parse errors — all possible if a renderer bug ships. If init throws, catch the error, log it to console with context, and fall back to "basic submit only" mode: every blank's input is read on final submit, no checkpoint behavior, no feedback rendering. Students never see a broken page.

**Event handlers can fail.** A scoring bug for one section's check button must not break the rest of the activity. Wrap every handler in try/catch. On error, log to console and leave the UI in its last known good state.

**Network failures on submission:** queue the submission payload in `localStorage` keyed by `activity_id + attempt_number`, retry with exponential backoff (1s, 4s, 16s). If all retries fail, surface a clear message: "your answers are saved locally; we'll try to submit them when you have a connection." Never lose student work to a network blip.

**Form double-submit protection.** On submit click, immediately disable the submit button. Don't re-enable until either success or final failure. Without this, a slow network invites duplicate clicks and duplicate submissions.

## Testing strategy

**Pure functions:** Vitest, no DOM needed. Scoring, normalization, state mutators, the migrate-on-read for old submission shapes — all testable as plain functions of inputs to outputs.

**DOM integration:** JSDOM. Feed `init()` a known HTML string, simulate user events (click checkpoint button, type into blank, click submit) via JSDOM's event API, assert the state shape AND the rendered DOM state. The render() diffing guards make this assertion straightforward — if a value didn't change, the DOM didn't change.

**Test coverage targets:** all scoring strategy variants, all three submission modes (single / locked / free), revision attempt increment, network failure retry path, malformed-attribute graceful degradation, error-boundary fallback to basic submit mode.

Tests live at `packages/renderer/src/runtime/__tests__/`. The suite must exist BEFORE the dashboard is built — student-side trust depends on runtime correctness.

## Standing constraints

- **Runtime does not import from `@activity/schema`.** No Zod, no bundler-resolved dependencies. The runtime defines its own minimal TypeScript interfaces that mirror the data-attribute contract. This is a deliberate duplication for a deliberate reason — keeping the runtime tiny.

- **Performance budget:** runtime.js bundled + minified ≤ 20KB target, ≤ 40KB hard ceiling. School Chromebooks on slow Wi-Fi load activities in browser-bound conditions; every kilobyte costs paint time.

- **Browser support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Covers all school-issued Chromebooks per Google's ChromeOS support window.

- **`render()` is the only DOM mutator.** Every other function reads from state, never writes to DOM. Every DOM mutation in render() is guarded by a change check.

- **All attribute reads have a fallback.** No `dataset.X` access without `?? default`. No `JSON.parse(...)` without try/catch.

- **No JS dependencies.** Runtime is hand-written vanilla TypeScript bundled to a single file. Adding utility libraries (lodash, date-fns, etc.) would blow the size budget and add attack surface for no benefit. Inline the small helpers you need.

- **Heavy widgets are lazy-loaded into separate bundles.** Interactive graphs (Phase 2.7) and annotation widgets (Phase 2.9) are dynamic imports from the main runtime. Pages without those block types never pay for them. Each lazy widget follows the same architectural commitments as the main runtime (source maps, defensive reads, graceful degradation).

- **Naming convention discipline:**
  - TypeScript fields: `camelCase` (`attemptNumber`, `revisionMode`)
  - HTML data attributes: `kebab-case` (`data-attempt-number`, `data-revision-mode`)
  - The renderer is the only layer that maps between them.

- **Block category as the coarse type discriminator.** The init pass routes by `data-block-category` first, then by `data-block-type`. New block kinds register through a small init-registry pattern (`registerBlockKind('multiple_choice', { init, score, render })`) so that adding a kind is one entry, not a refactor.

## Open questions / deferred decisions

- **CDN-hosted shared runtime (Phase 3+):** when this moves from versioned-per-publish to CDN-hosted, `data-runtime-version` selects which CDN runtime file to load. Migration is additive: old activities continue to reference `./runtime.js` and break-fix at republish; new activities reference the CDN URL. Decide CDN provider when the move is made (Cloudflare or Supabase Storage with long cache TTL are both reasonable).

- **Service worker for offline mode:** Phase 1 has localStorage retry. Full offline (compose answers without connectivity, sync later) is a Phase 3+ consideration. A service worker could intercept submission failures more elegantly than localStorage retry, but adds complexity and an install step.

- **MathLive in published HTML:** Phase 2.5 decision per ROADMAP. If MathLive is included for student-side math input, the runtime bundle size budget must be re-evaluated.

- **Server-side scoring (Phase 5):** when this lands, the runtime's scoring functions remain in place for instant feedback, but final submission stops trusting them. The Edge Function re-scores against the answer keys server-side. The data-attribute contract for answers (`data-blank-answers`) likely changes — answers may not be in the published HTML at all. Plan a v2 of the runtime then; don't try to support both models in v1.

- **Media capture browser quirks (Phase 2.8):** MediaRecorder API has had iOS Safari quirks historically. Decide at phase start whether to launch with both in-browser recording and upload, or upload-only with recording as a follow-up. The runtime side either way is a media-capture widget that emits a Blob + metadata for the submission payload.

- **Annotation coordinate stability (Phase 2.9):** when the runtime captures annotation positions, what coordinate system does it use? Character indices into rendered text (stable across CSS changes but breaks on content edits) vs DOM anchors (stable across content edits but breaks on rendering changes) vs normalized fractions of rendered geometry. Decide at phase start.

- **Audio narration of activity prose (Phase 4 UDL):** browser Web Speech API vs server-rendered audio files. The runtime side is a play-button + word-level highlight handler either way; the question is where the audio comes from. Web Speech is free but quality varies; server-rendered is consistent but adds a service dependency.

- **Blank-token wrapper element (Stage 12–13):** the feedback `<span>` for a blank cannot be a child of the `<input>` (a void element), so it must be a sibling — which means the blank token needs a wrapper. The renderer emits a bare `<input class="blank">` with no wrapper today. Decide the wrapper's tag and class, and whether the `blank` class moves onto it, when the feedback-rendering work starts. Until then the only frozen part of the blank-token contract is the bare `<input>`.

## Things NOT to do

- **Don't query the DOM inside scoring or state functions.** Read once on init; mutate state; let render() handle DOM updates. The bug class this prevents — "feedback works the first time but not on the second check" — is caused by stale DOM state querying.

- **Don't import from `@activity/schema`.** Parallel types in the runtime are deliberate. If the schema changes, update both sides; if you find yourself wishing for `import { ActivityDocument }` in the runtime, that's a signal to add a runtime-local interface instead.

- **Don't add JS dependencies.** The runtime is single-file vanilla TypeScript by design. Every added dependency expands the size budget and adds attack surface for student-facing code.

- **Don't trust client-supplied attempt_number.** The Edge Function derives `attempt_number` server-side from `max(attempt_number) + 1` for the student's identity. The runtime sends a local guess for optimistic UI, but the server's value is canonical.

- **Don't reveal solutions before checking.** The runtime reads `data-solution` into memory but does NOT render it into the DOM until the student has checked that section (or submitted, in `single` mode). The solution being in HTML source is the existing security ceiling; don't make it worse by rendering it where students see it without working through the problem.

- **Don't make breaking changes to the data-attribute contract.** Add new attributes; never rename or remove existing ones. A renamed attribute breaks every activity published before the rename, forever, because that HTML is static and immutable in Storage.

- **Don't bake the answer key into the DOM for manually-graded blocks.** Phase 2.6's short_answer and essay blocks have no auto-scoring; the data-attribute payload should not pretend they do. The block category (`question`) and block type drive runtime behavior; the runtime's scoring path skips manual-graded blocks entirely.

- **Don't render feedback inside a NodeView that re-renders aggressively.** This is mostly an editor concern but worth noting here: the published HTML is static, so this rule doesn't apply to runtime rendering — the runtime is the master of the DOM after init and the DOM doesn't get torn down behind it.

- **Don't conflate runtime state with submission payload.** State has many fields (refs to DOM nodes, transient UI state). Submission payload has only what the Edge Function needs (blanks, attemptNumber, checkpointResults, studentName, confidence per blank, and the future parallel maps for new question categories). Build the payload from state at submit time; don't try to make state and payload the same shape.

- **Don't sniff `data-block-type` when `data-block-category` is enough.** Category-level decisions (is this block interactive? does it contribute to scoring? does it have a checkpoint contribution?) should branch on category. Block-type sniffing is for type-specific behavior only.
