# RUNTIME.md

Architecture decisions and standing constraints for the published-activity runtime — the JavaScript that runs in students' browsers on every published activity page. Companion to the project-level STATE.md (where everything is) and ROADMAP.md (where everything is going).

Update at the end of each work session that touches the runtime — replace the relevant sections, don't append.

**Status.** This document is the architecture spec for the runtime as built through Stage 13. The runtime is feature-complete for the Phase 1 MVP student loop: scoring, mistake feedback, hints, checkpoints, solutions, locked-mode freezing, confidence capture, full state persistence, and submission with per-blank confidence + optional checkpointResults. The remaining Phase 1 work is in Stage 14 (submission flow polish — retry queue, attempt_number reconciliation, free-mode resubmit), Stage 15 (editor UI for new feature fields), and Stage 16 (submissions dashboard); none of these touches runtime code substantively. Where this doc describes Stage 14+ behavior, it's marked `[target — Stage N]` or `[target — Phase N]`.

*Last reconciled against code at end of Stage 13.*

## What this is

The runtime is the JavaScript that runs in students' browsers on every published activity page. Its remit, as built through Stage 13:

- Student input state (typed values into blanks)
- Per-blank scoring on blur, against answer keys baked into the HTML
- Per-blank mistake feedback dispatch (matched against authored mistake entries)
- Hint reveal toggle (always-available `?` button per blank, when a hint is authored)
- Edit-to-clear stale scoring state (typing into a previously-scored blank clears the result so a stale green border doesn't linger on edited but un-re-blurred answers)
- Per-section checkpoint scoring (locked / free modes; single mode has no checkpoints)
- Section score display ("{correct} / {sectionTotal} correct" — denominator is section total, not attempted count)
- Solution reveal on check (one-way; once revealed, stays revealed)
- Locked-mode input freezing (after check, inputs in that section disable)
- Confidence rating capture (per-block fieldset; one selection per problem)
- State persistence across page reloads (typed values + scoring state + hint reveals + solution reveals + locked state + section scores + confidence; per `activityId + versionNum` localStorage blob)
- Student name persistence across activities (separate localStorage key)
- Final submission to `ingest-submission` with `responses.schemaVersion: 2` payload including per-blank confidence and optional `checkpointResults` map
- Persistence cleared on submit success
- Graceful degradation throughout — malformed config → no-op runtime; private-mode localStorage → silent skip; missing per-element attributes → warn-and-skip

It does NOT handle:

- Authoring (that's the editor in `@activity/app`)
- Server-side validation or grading (that's the Edge Function; Phase 5+ server-side scoring is the answer to the security ceiling)
- Cross-activity state (each page load is isolated; name persistence is the one exception)
- Real-time collaboration (not in scope for any phase currently planned)
- Anti-cheating beyond what's possible in client code (it's not possible)
- `[target — Stage 14]` Network-failure retry queue
- `[target — Stage 14]` Free-mode resubmission flow

## File structure

```
packages/renderer/src/runtime/
├── tsconfig.json    — Runtime tsconfig (DOM lib, noEmit; esbuild does the build)
├── config.ts        — RuntimeConfig interface + parseConfig (defensive, returns null on malformed)
├── refs.ts          — BlankRef, FillInBlankRef (with confidenceRadios), SectionRef + Refs bundle
├── state.ts         — RuntimeState, BlankState, BlockState, SectionState + createInitialState
├── init.ts          — The ONLY DOM walker. Returns {config, refs, state} | null
├── dom.ts           — $, $$ jQuery-style helpers (typed)
├── strategies.ts    — evaluateAnswer dispatch; list strategy (Phase 1); expression/computed (Phase 2.5+)
├── blanks.ts        — scoreBlank + matchMistakeFeedback (pure); scoreBlankAndUpdateState + clearBlankState (state); wireBlanks + wireHints (event handlers)
├── checkpoints.ts   — checkSection (pure mutator) + wireCheckpoints (click handler)
├── confidence.ts    — wireConfidence (change handler on per-block radios)
├── render.ts        — render(state, refs); renderBlank + renderBlock + renderSection. THE ONLY DOM MUTATOR after init.
├── storage.ts       — saveName / loadStoredName + saveActivityState / loadActivityState / clearActivityState / applyStoredState
├── submission.ts    — gatherResponses + gatherCheckpointResults + computeScore + submit
├── index.ts         — bootstrap orchestrator
├── reference-panel.ts — sidecar: on-screen reference panel (drag-resize + scroll-clearance)
├── definitions.ts   — sidecar: inline vocabulary-definition popovers
├── generated/       — runtime-bundle.ts + reference-panel-bundle.ts + definitions-bundle.ts (committed string modules produced by bundler)
└── __tests__/       — strategies, init, blanks, render, checkpoints, storage, confidence, grouping, definitions
```

## Bootstrap flow

The bootstrap in `index.ts` runs once on `DOMContentLoaded` (or immediately if the document is already interactive):

1. **`init()`** — parses `#activity-config` JSON blob; walks the body building typed refs maps (`blanks`, `fillInBlanks`, `sections`) keyed by uuid; creates fresh `RuntimeState` from refs (every entity gets a default state entry). Returns `{config, refs, state}` or null on malformed/missing config.

2. **On null** — logs to console and returns. Page stays static; no scoring, no submission. This is the graceful-degradation contract — a half-working runtime is worse for students than a clearly-static page.

3. **Restore student name** — `loadStoredName()` reads localStorage key `activity_student_name`; if non-empty, sets `nameInput.value` and mirrors to `state.studentName`.

4. **Restore activity state** — `loadActivityState(config)` returns the stored blob for this `activityId + versionNum` or null; if non-null, `applyStoredState(stored, refs, state)` mutates input values into the DOM AND replaces `state.blanks` / `state.blocks` / `state.sections` entries in place.

5. **Initial render** — `render(state, refs)` directly (NOT through onUpdate). Reflects restored state in DOM (correct/incorrect classes, feedback slots, hint state, solution reveals, section scores, locked inputs, confidence radios) before any event handler attaches. Not run through `onUpdate` because there's no point re-persisting state we just loaded.

6. **Define `onUpdate`** — composition of render + persist:
   ```typescript
   const onUpdate = (): void => {
       render(state, refs);
       saveActivityState(config, refs, state);
   };
   ```
   Every subsequent state mutation flows through here.

7. **Wire handlers:**
   - `wireBlanks(answerFeedback, state, refs, onUpdate)` — input (clear stale + conditional render) in all modes; blur (score + render) only when `answerFeedback === 'immediate'`. In `on_check` mode correctness stays hidden until a section check / submit.
   - `wireHints(state, refs, onUpdate)` — hint button click → toggle `hintRevealed`
   - `wireCheckpoints(config, state, refs, onUpdate)` — check button click → `checkSection`
   - `wireConfidence(state, refs, onUpdate)` — radio change → set `BlockState.confidence`
   - Submit button click → `submit(config, refs, state, onUpdate)`

## Architecture decisions

### Module structure

- **Inlined runtime.** The runtime is bundled by esbuild as a minified IIFE and inlined into every published page via `document.ts` as a `<script>` tag. One fewer request on a school Chromebook; runtime stays co-versioned with the HTML it ships in. Separate-file CDN model is a Phase 3+ migration target, gated by "republishing activities for a runtime bug fix becomes painful" (~50+ active activities).

- **Plain TypeScript modules in source.** Real `.ts` files in `src/runtime/`; built by `scripts/bundle-renderer.mjs` (esbuild, IIFE, minified, `chrome90` target). The generated string module at `runtime/generated/runtime-bundle.ts` IS committed so a clean checkout can typecheck the renderer without running the bundler.

- **No `@activity/schema` import.** The runtime defines its own minimal TypeScript interfaces mirroring the schema shapes. Deliberate duplication to keep the runtime tiny (size budget: ≤ 20 KB minified target, ≤ 40 KB hard ceiling). When schema shapes change, both sides update.

- **No JS dependencies.** Single-file vanilla TypeScript by design. Every added dependency expands size budget and attack surface.

- **Two tsconfigs in the renderer package.** The renderer is pure no-DOM TypeScript; the runtime is DOM TypeScript. `packages/renderer/tsconfig.json` excludes `src/runtime/**`; `packages/renderer/src/runtime/tsconfig.json` adds the DOM lib with `noEmit` (esbuild does the build). The package's `build` and `typecheck` scripts run both `tsc` invocations in sequence so the runtime cannot silently rot.

### State and rendering

- **Plain `RuntimeState` object as single source of truth.** Three keyed sub-stores: `state.blanks` (per `blank.id`), `state.blocks` (per fill_in_blank `block.id`), `state.sections` (per `section.id`). Plus top-level fields: `submitted`, `attemptNumber`, `studentName`. `Record` (not `Map`) because state is JSON-serializable for persistence and `Map` doesn't serialize naturally.

- **`render(state, refs)` is the only function that mutates the DOM after init.** Every event handler writes to state, then calls `onUpdate` (render + persist). One permitted exception: `applyStoredState` in `storage.ts` sets `input.value` during bootstrap restoration, BEFORE the initial render runs and before handlers attach.

- **Change-guard pattern.** Every DOM write in `render` checks the current DOM state and only writes when the target differs. `classList.toggle(name, condition)` is inherently idempotent for class state. For attribute / `hidden` / `checked` / `textContent` writes, explicit current-vs-target checks. Renders are idempotent — calling twice with the same state produces no observable diff.

- **`init.ts` is the only DOM walker.** All `querySelector` / `querySelectorAll` against arbitrary subtrees happens here. Downstream consumes typed refs and never re-queries.

### Defensive reading

- **Defensive attribute reads everywhere.** Every `dataset.X` read uses `?? default` fallback. Every JSON-encoded attribute parse is wrapped in try/catch. Old published activities loading against a newer runtime degrade gracefully to defaults; newer activities loading against a stale cached runtime don't crash on unrecognized attributes.

- **`parseConfig` returns null on malformed config.** Missing `#activity-config`, malformed JSON, or wrong-typed required field → null → caller falls back to no-op runtime. The runtime never throws to the student.

- **`buildRefs` warns-and-skips malformed per-element data.** A specific blank missing `data-blank-id`, or a malformed `data-mistake-feedback` JSON, is logged to console and silently dropped from the refs maps. The rest of the page still works.

- **`applyStoredState` only restores entries that exist in current state.** Defense against the (unlikely with versionNum-keyed storage) case where stored shape disagrees with current refs. Orphan entries from the blob are silently ignored.

### Three-tier persistence

- **Name** (cross-activity): localStorage key `activity_student_name`. Plain string. Carried across all activities on the domain.

- **Activity state blob** (per `activityId + versionNum`): localStorage key `activity_state_${activityId}_v${versionNum}`. JSON blob with shape `{ schemaVersion, values, blanks, blocks, sections }`. Versioned key auto-invalidates on republish (v1 → v2 means the v1 blob is no longer found). Schema-versioned internally (`STORAGE_SCHEMA_VERSION = 3`) so future runtime changes can bail cleanly on shape mismatch. Save gated by `!state.submitted`. Cleared on submit success.

- **Submission payload** (network): POSTed to `ingest-submission`. `responses` is v2 shape: `{ schemaVersion: 2, blanks: Record<uuid, BlankResult>, checkpointResults?: Record<uuid, CheckpointResultPayload> }` plus `activityId`, `displayName`, `score` at top level.

### Specific behavior rules

- **Mistake feedback matching.** Exact string match against `BlankRef.mistakeFeedback` entries' `match` field. Case-sensitive. Trim before compare. First match wins. Same rules as answer scoring — consistent mental model. Computed at scoring time (in `scoreBlankAndUpdateState`) and stored in `BlankState.matchedMistake`; render reads it.

- **Feedback slot policy.** `.js-blank-feedback` span carries **mistake-specific text only** — populated when a wrong answer matches a configured mistake, hidden otherwise. Visual correct/incorrect signal lives on the input border class. Screen reader signal is `aria-invalid` on the input itself. Keeps a 30-blank worksheet visually uncluttered.

- **Section score format.** `"{score} / {sectionTotal} correct"` — denominator is the section's total blank count, NOT the attempted (non-empty) count. Empty blanks count as omissions.

- **Solution reveal is one-way.** Once `BlockState.solutionRevealed` flips true, never unset. Re-checking in free mode keeps solutions visible — the student already saw it; hiding would feel like a magic trick.

- **Locked mode.** `SectionState.locked` flips true on `checkSection` only when `config.submissionMode === 'locked'`. `renderBlank` reads `state.sections[ref.sectionId].locked` (third state argument) and sets `input.disabled`.

- **Confidence is per-block in UI, per-blank in payload.** Fieldset is per `fill_in_blank` block (one selection per problem). `BlockState.confidence` captures it. `gatherResponses` reads `state.blocks[ref.blockId].confidence` at submit time and writes it onto each blank's payload entry. So every blank in a block carries the same confidence value in the wire format.

- **`CheckpointResult.total` must be positive** per the schema (`z.number().int().positive()`). `gatherCheckpointResults` filters out sections with `total === 0`. Returns undefined when no sections qualify; field is then absent from the payload (schema field is optional).

- **Edit-to-clear.** `input` event handler calls `clearBlankState` which clears `result` and `matchedMistake` if either is set. Returns boolean change indicator so the handler only fires `onUpdate` (render + persist) when state actually changed. Avoids cascading renders on fresh typing.

- **`scoreBlankAndUpdateState` takes id explicitly.** Not derived from `ref.input.dataset.blankId` — that would violate the init-walks-DOM rule. Caller has id from Map iteration.

- **`confidenceRadios` pre-populated at init.** `buildFillInBlankRef` calls `querySelectorAll('input[type="radio"]')` once and stores the array on the ref. Render and `wireConfidence` consume it without re-querying.

- **Top-level `score` vs section score denominators differ deliberately.** The top-level `score` in the submission payload is `correctCount / scoredCount` (where scoredCount = non-empty-attempt count) — useful as "of what you tried, how much was right" for teacher dashboards. The per-section `{score} / {total} correct` display uses section total as denominator — useful as "of the whole section" for student feedback.

## The data-attribute contract

This is the API between renderer (emits) and runtime (reads). **Additive changes only** — once an activity is published, the attributes in its HTML are frozen for it forever.

### Document root

```html
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

Split-by-purpose contract:

- **CSS hooks** → `data-*` attributes on `.activity-container`. `data-activity-type` is the sole instance today (`worksheet | exit_ticket | warm_up | review`); CSS can vary layout per type without the runtime reading it.
- **JS-only config** → the `#activity-config` JSON blob. Six fields: `activityId`, `versionNum`, `submissionEndpoint`, `submissionMode`, `revisionMode`, `gradingMode`. Runtime parses once via `parseConfig`; defensive (null on malformed).

Deciding rule: **CSS cannot read the JSON blob**, so anything CSS must branch on becomes an attribute; everything else defaults to the blob.

`[target — Phase 3+]` `runtimeVersion` migration anchor for the CDN-hosted shared runtime. Not emitted today (the runtime is inlined, nothing to version-select).

### Section

```html
<section class="activity-section"
         data-block-category="content"
         data-section-id="<uuid>">
  <!-- optional <h2 class="section-title">, then blocks -->
</section>
```

`<section>` is content (organizational), not a question — `data-block-category` is always `content`. Sections carry no `data-block-type`: they are containers, not blocks.

When `submissionMode` is `locked` or `free`, the `<section>` additionally carries `data-is-checkpoint="true | false"`. In `single` mode the attribute is omitted entirely (checkpoint markup is irrelevant).

When the section is a checkpoint (in locked/free mode), it includes:

```html
<button class="js-checkpoint-btn" data-for-section="<uuid>" type="button">
  Check this section
</button>
<div class="js-section-score" data-for-section="<uuid>" hidden>
  <!-- populated by render: "{score} / {sectionTotal} correct" after check -->
</div>
```

`type="button"` is non-negotiable — without it, browsers default to `type="submit"` which would submit a parent form if one existed.

### Block identity attributes (every block)

Every top-level block carries `data-block-category`, `data-block-type`, and `data-block-id`. `<section>` is a container, not a block (carries `data-block-category` + `data-section-id` only). `<li>` carries neither (list items are inside list blocks).

- `data-block-type` is the Zod schema discriminant **verbatim** — snake_case (`paragraph`, `heading`, `math_block`, `image`, `callout`, `problem`, `fill_in_blank`, `bullet_list`, `ordered_list`). Init's selector `[data-block-type="fill_in_blank"]` matches this literal exactly.
- `data-block-id` is the block's stable document `id` (uuid).
- `data-block-category` is `content | question | scaffold`. Coarse discriminator; analytics and dashboard features can branch on this without enumerating every block-type string.

Phase 1 block types by category:
- `content` — `paragraph`, `heading`, `image`, `callout`, `math_block`, `bullet_list`, `ordered_list`
- `question` — `problem`, `fill_in_blank`
- `scaffold` — `[target — Phase 2+]` `worked_example`, `faded_worked_example`, `self_explanation`, etc.

### Sizing attributes (additive, presentational — runtime never reads them)

Variable block sizing added purely presentational markup, consumed only by the stylesheet:

- `data-block-align="left" | "right"` plus `class="… block-sized"` and `style="--block-width:<pct>%"` on a sized block (image, math_block today). Absence of `data-block-align` means centered; absence of `block-sized` means full width.
- `style="--block-height:<n>rem"` on a sized **image** figure (combines with `--block-width` in one `style`). The image fills the box and `object-fit: cover` center-crops when width × height disagree with the natural aspect ratio (no stretch).
- `style="--cell-min-height:<n>rem"` on a `.column-cell` with a reserved work-space floor.

These are additive contract entries: the runtime does not query or branch on them, but published HTML carries them, so they follow the same never-rename/never-remove rule.

### Fill-in-blank block

```html
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

When fields are non-default, the block carries:
- `data-solution="..."` — when authored
- `data-has-confidence-rating="true"` — when enabled
- `data-skills='[...]'` — JSON-encoded array when non-empty

When `data-has-confidence-rating="true"`, ONE confidence fieldset is rendered per block (NOT per blank — `hasConfidenceRating` is a `FillInBlankBlock` field). The runtime captures one confidence value per block and applies it uniformly to every blank in that block at submit time:

```html
<fieldset class="js-confidence-rating" data-for-block="<uuid>">
  <legend>How confident are you?</legend>
  <label><input type="radio" name="conf-<uuid>" value="unsure" />   Unsure</label>
  <label><input type="radio" name="conf-<uuid>" value="think_so" /> Think so</label>
  <label><input type="radio" name="conf-<uuid>" value="certain" />  Certain</label>
</fieldset>
```

When `data-solution` is present, a hidden solution slot is rendered inside the block body:

```html
<div class="js-solution" data-for-block="<uuid>" hidden>...solution text...</div>
```

`checkSection` sets `BlockState.solutionRevealed = true` on first check; `renderBlock` toggles `hidden` accordingly.

### Blank token

Every blank renders as an `<input class="blank">` inside a `<span class="blank-wrapper">`. The wrapper exists because `<input>` is a void element — siblings (feedback slot, hint affordance) can't be its children:

```html
<span class="blank-wrapper">
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
  <!-- The hint affordance is emitted only when data-hint is set: -->
  <button class="js-blank-hint" type="button" aria-expanded="false"
          aria-controls="hint-<uuid>" aria-label="Show hint">?</button>
  <span class="js-blank-hint-text" id="hint-<uuid>" hidden>Try factoring out 2.</span>
  <!-- Feedback slot is always emitted (runtime needs it as a render target): -->
  <span class="js-blank-feedback" data-for-blank="<uuid>" aria-live="polite" hidden></span>
</span>
```

- `data-blank-answers` is **pipe-delimited** (`answer|alt1|alt2`), NOT JSON. First segment is the canonical answer; rest are `acceptableAnswers`.
- `--blank-width` (CSS custom property, `ch` units) sizes the input; defaults to `6`.
- `autocomplete` / `autocapitalize` / `autocorrect` / `spellcheck` quartet disables browser interference with math input.
- The `.blank` class stays on the `<input>` (NOT on the wrapper), preserving every existing CSS selector.
- Hint button + text span are emitted only when `data-hint` is set on the input.
- Hint button uses `aria-expanded="false"` initially; renders update to `"true"` when `hintRevealed`.
- Feedback slot has `aria-live="polite"` set in source HTML (NOT added by runtime — setting `aria-live` on an already-existing element is unreliable across screen readers).

The input also carries (when authored):
- `data-hint="..."` — read by `buildBlankRef`
- `data-mistake-feedback='[{"match":"2x","feedback":"..."}]'` — JSON array
- `data-blank-strategy="list"` — default; `[target — Phase 2.5]` adds `expression` and `computed`
- `data-blank-group="<anchor-blank-uuid>"` — **order-independent grouping.** Present only on blanks that belong to a group (a run of 2+ adjacent blanks the author marked interchangeable; the value is the run's first/anchor blank id). The runtime buckets blanks by this id and scores each group with **consume-once matching** (each correct answer satisfies one blank), so for `(x + ☐)(x + ☐)` both `(2,3)` and `(3,2)` are correct but `(2,2)` is not. Grouped inputs also carry `class="blank blank-grouped"` + `title="Any order accepted"` as a student cue. Absent ⇒ the blank scores independently (the default).

**Accessibility — positional label.** Each blank `<input>` carries a renderer-supplied `aria-label`. With multiple blanks in a block it's positional — `Blank 1 of 3`, `Blank 2 of 3`, … — numbered in document order. Lone blank: `Fill in the blank`. Without it, screen readers announce only "edit text," giving the student no cue which blank has focus.

`aria-invalid` on the input is managed by the runtime (`renderBlank`):
- Removed entirely when `result === null` (don't claim "this is valid" before the student has tried)
- `"false"` when `result === true`
- `"true"` when `result === false`

### Feedback slot content rule

The `.js-blank-feedback` span carries **mistake-specific text only**:
- Populated with the matched mistake feedback when `BlankState.matchedMistake !== null` (incorrect AND a `data-mistake-feedback` entry matched the typed value)
- Hidden otherwise (correct, incorrect-without-match, unscored)

Visual correct/incorrect signal lives on the input border class (`.correct` / `.incorrect`). SR signal is `aria-invalid` on the input. The slot is reserved for actionable mistake-specific feedback; avoids clutter on a 30-blank worksheet.

### Reference panel (`data-block-category="scaffold"`)

Optional teacher-authored reference content (formula charts, vocab, conversion tables). Rendered OUTSIDE any `.activity-section`, so the scoring runtime's `init` walker — which scopes every query to `.activity-section` — never sees it: it contributes nothing to scoring / persistence / checkpoints. `data-block-category="scaffold"` is an analytics/CSS hook ONLY; the scoping mechanism is "outside `.activity-section`," never the category. Two presentations of the same blocks:

- **Screen** — a `position:fixed` bottom-bar toolbar (emitted by `renderActivity` only):

  ```html
  <details class="reference-panel" data-block-category="scaffold">
    <summary class="reference-panel-summary">…title…</summary>
    <div class="reference-panel-content">        <!-- plain flex column: handle on top, body below -->
      <div class="reference-panel-resize"></div>  <!-- drag handle, top edge -->
      <div class="reference-panel-body">…blocks…</div>
    </div>
  </details>
  ```

  The panel's flex `column-reverse` floats the content above the bar; the **body** owns the height cap + scroll (`max-height:60vh; overflow:auto`) — capping the flex container instead let content overflow the page. The handle+body live in their own `.reference-panel-content` wrapper because the browser's `::details-content` wrapping makes panel-level flex ordering of the two unreliable.

- **Print** — `<aside class="reference-print" data-block-category="scaffold">` at the top of the worksheet, gated by `meta.print.printReferencePanel` (default true). Emitted by both `renderActivity` (for printing the live page) and `renderActivityForPrint`.

Interactivity is a **separate inlined sidecar** (`runtime/reference-panel.ts`, ~1 KiB), NOT part of the scoring runtime — `document.ts` inlines it as its own `<script>` only when an activity has a `referencePanel`. It handles drag-resize (the top-edge handle drives the body's `max-height`) + scroll-clearance (a `ResizeObserver` pads `.activity-container` by the panel's live height so the fixed panel never permanently hides content). See DECISIONS → "Reference panel".

### Definition span (`class="definition"`)

Inline vocabulary definitions (the `definition` mark). Emitted by the renderer wherever a defined term appears — inside a problem AND inside the reference panel, so it is NOT section-scoped. Non-scored, non-persisted: the scoring runtime ignores it entirely (it carries no `data-block-*`, and the scoring `init` only walks `.activity-section`).

```html
<span class="definition"
      data-definition="the longest side"  <!-- plain-text fallback (a11y / no-JS) -->
      data-glossary-key="factor-noun"     <!-- Phase 4+; emitted ONLY when set -->
      tabindex="0"
      role="button"
      aria-haspopup="dialog"
      aria-expanded="false">hypotenuse</span>
<!-- Rich content (text + math + optional image), pre-rendered with KaTeX baked
     in, cloned into the popover. Emitted ONLY when the definition has content. -->
<template class="js-definition-content">the longest side <span class="katex">…</span><img class="definition-image" src="…" alt="…" /></template>
```

- `<template class="js-definition-content">` — the **display source**: the rich definition (formatted text + inline math + an optional `<img class="definition-image">`), pre-rendered server-side. The sidecar clones `template.content` into the popover body — it never re-renders. Emitted as the span's immediate next sibling.
- `data-definition` — a plain-text **fallback** (accessibility / no-JS / older markup), attr-escaped. Used only when no template is present; shown via `textContent`, never `innerHTML`.
- `data-glossary-key` — reserved for the Phase 4 tenant glossary; emitted ONLY when the mark carries one (nothing sets it in Phase 2). Resolution happens at publish, never in the runtime.
- `aria-expanded` starts `"false"`; the sidecar toggles it to `"true"` while the popover is open, and adds `aria-controls` pointing at the popover.

Interactivity is a **separate inlined sidecar** (`runtime/definitions.ts`, ~1.9 KiB), NOT part of the scoring runtime — `document.ts` inlines it as its own `<script>` only when the rendered page contains a definition span. It manages its OWN popover element (independent of the shared `.js-popover`): click / tap / Enter / Space opens it; Escape, an outside click, or scrolling closes it; focus returns to the term on close (managed-dialog pattern); tap-only, no hover. Print shows the dotted-underline cue (ink-safe `currentColor`) but no popover — definitions are on-screen scaffold; an end-of-worksheet glossary appendix is a deferred follow-up. See docs/design/vocabulary-definitions.md.

### Reading discipline

Two sources, two patterns. Activity-level config is parsed once from the `#activity-config` blob via `parseConfig`. Per-element data is read off `data-*` attributes during the init pass and stored on typed refs. Downstream code consumes refs and never re-queries.

```typescript
// CORRECT — parse config once via parseConfig (defensive, returns null on bad).
const config = parseConfig();
if (!config) { /* fall back to no-op runtime */ }

// CORRECT — data-blank-answers is pipe-delimited, not JSON.
const answers: string[] = (input.dataset.blankAnswers ?? '').split('|').filter(Boolean);

// CORRECT — JSON-encoded per-element attributes parsed in init with try/catch.
let mistakeFeedback: Array<{match: string; feedback: string}> = [];
try {
    const parsed = JSON.parse(input.dataset.mistakeFeedback ?? '[]');
    if (Array.isArray(parsed)) mistakeFeedback = parsed;
} catch { /* warn + skip */ }
```

## State shape

```typescript
interface SectionState {
    /** True once the student has clicked the check button for this section. */
    checked: boolean;
    /** True after check in locked submissionMode — blank inputs freeze. */
    locked: boolean;
    /** Number of blanks scored correct in this section at last check. */
    score: number;
    /**
     * Total blanks in this section — the denominator for the score display.
     * Equals sectionRef.blankIds.length, NOT the attempted (non-empty) count.
     * Empty blanks count as omissions in "{score} / {total} correct".
     */
    total: number;
    /** ISO timestamp of the most recent check (null until first checked). */
    checkedAt: string | null;
}

interface BlankState {
    /** true = correct, false = incorrect, null = unscored (empty or pre-check). */
    result: boolean | null;
    /**
     * Matched mistake-feedback text from BlankRef.mistakeFeedback, or null
     * when the typed value didn't match any configured mistake. Set by
     * scoreBlankAndUpdateState (only when result === false); read by render.
     */
    matchedMistake: string | null;
    /** Whether the student has clicked this blank's hint button. */
    hintRevealed: boolean;
}

interface BlockState {
    /**
     * Whether the solution slot has been revealed. True after the
     * containing section is checked, when the block has an authored
     * solution. Once true, never unset (re-checking in free mode keeps
     * solutions visible).
     */
    solutionRevealed: boolean;
    /** Student's selected confidence value for this block. Null until selected. */
    confidence: 'unsure' | 'think_so' | 'certain' | null;
}

interface RuntimeState {
    /** True once the final submit has completed successfully. */
    submitted: boolean;
    /** Server-derived attempt number; client value is advisory only. Starts at 1. */
    attemptNumber: number;
    /** Current value of the name input (mirrored from .identity-prompt input). */
    studentName: string;
    /** Per-section status, keyed by section.id. */
    sections: Record<string, SectionState>;
    /** Per-blank status, keyed by blank.id. */
    blanks: Record<string, BlankState>;
    /** Per-fill-in-blank-block status, keyed by block.id. */
    blocks: Record<string, BlockState>;
}
```

In-memory reference maps built once at init (Readonly after init; state mutates, refs don't):

```typescript
interface BlankRef {
    input: HTMLInputElement;
    feedbackEl: HTMLElement;        // sibling .js-blank-feedback span
    hintButton: HTMLButtonElement | null;
    hintTextEl: HTMLElement | null;
    answers: string[];              // pipe-split from data-blank-answers
    strategy: string;               // defaults 'list' when absent
    hint: string | null;
    mistakeFeedback: Array<{match: string; feedback: string}>;
    blockId: string;
    sectionId: string;
}

interface FillInBlankRef {
    el: HTMLElement;
    blankIds: string[];
    solution: string | null;
    solutionEl: HTMLElement | null;
    hasConfidenceRating: boolean;
    confidenceFieldset: HTMLFieldSetElement | null;
    confidenceRadios: HTMLInputElement[];  // populated at init, never re-queried
    skills: string[];
    sectionId: string;
}

interface SectionRef {
    el: HTMLElement;
    isCheckpoint: boolean;
    blankIds: string[];
    blockIds: string[];
    checkButton: HTMLButtonElement | null;
    scoreEl: HTMLElement | null;
}

interface Refs {
    blanks: Map<string, BlankRef>;
    fillInBlanks: Map<string, FillInBlankRef>;
    sections: Map<string, SectionRef>;
}
```

`[target — Phase 2+]` Adds parallel refs maps for each new question category (`choices`, `orderings`, `matches`, `graphs`, `freeResponses`, `files`, `annotations`). Same pattern; init populates them once.

## Persistence (`storage.ts`)

### Student name (cross-activity)

```typescript
loadStoredName(): string         // empty string when absent / private mode
saveName(name: string): void     // silent on failure
```

Single localStorage key (`activity_student_name`). Plain string. The bootstrap restores this into the name input and mirrors to `state.studentName`. `submit()` calls `saveName` once the name validates.

### Activity state (per activityId + versionNum)

```typescript
interface StoredActivityState {
    schemaVersion: number;
    values: Record<string, string>;          // typed values from DOM at persist time
    blanks: Record<string, BlankState>;
    blocks: Record<string, BlockState>;
    sections: Record<string, SectionState>;
}

saveActivityState(config, refs, state): void       // gated by !state.submitted
loadActivityState(config): StoredActivityState | null
clearActivityState(config): void                   // called on submit success
applyStoredState(stored, refs, state): void        // mutates inputs + state in place
```

Storage key: `activity_state_${activityId}_v${versionNum}`. Versioned key means republishing the activity (versionNum bump) auto-invalidates prior persistence.

Schema versioning: `STORAGE_SCHEMA_VERSION = 3`. Load returns null on mismatch (fresh state). Bump when `BlankState` / `BlockState` / `SectionState` / blob shape changes in a way that older serialized blobs can no longer be interpreted as.

Save is gated by `!state.submitted`. Once submitted, persistence is irrelevant (`clearActivityState` fires on success) and re-writing post-submit edits would confuse the next session's restore.

Reads typed values from `refs.blanks` (DOM `input.value`), not from state — state's `BlankState` carries scoring results but not raw typed text; the DOM is source-of-truth for values at persist time.

`applyStoredState` mutates input values into the DOM directly (the one permitted DOM mutation outside `render()`) AND replaces `state.blanks` / `state.blocks` / `state.sections` entries in place. Only restores entries that exist in current state (defense against drift).

All localStorage access is try/catch wrapped. Private-mode browsers, locked-down Chromebooks, and quota exhaustion all degrade silently to "no persistence." The activity still works; refresh just won't restore state.

## Submission payload

```typescript
{
    activityId: string,
    displayName: string,
    responses: {
        schemaVersion: 2,
        blanks: Record<blankId, {
            answer: string,
            correct: boolean,
            confidence?: 'unsure' | 'think_so' | 'certain'  // from state.blocks[ref.blockId].confidence
        }>,
        checkpointResults?: Record<sectionId, {
            score: number,
            total: number,
            checkedAt: string  // ISO datetime
        }>
    },
    score: number  // fraction in [0, 1]
}
```

- Per-blank `confidence` is derived at submit time from `state.blocks[ref.blockId].confidence`. Every blank in a block carries the same value (the fieldset is per-block).
- `checkpointResults` is included only when at least one section qualifies (`checked === true && checkedAt !== null && total > 0`). Filter on `total > 0` because the schema requires positive (`z.number().int().positive()`).
- `score` is the fraction `correct / totalScored` where totalScored is the non-empty-attempt count. Note this is different from the section score display denominator (which is section total). Top-level `score` is "of what you tried, how much was right"; section display is "of the whole section, how much was right." Deliberate.

On successful submit:
- `state.submitted = true`
- `clearActivityState(config)` — removes the persisted blob; next page-load is fresh
- Submit button disables; status message updates

`[target — Stage 14]` HTTP failure handling: queue payload in localStorage keyed by `activityId + attemptNumber`; exponential backoff retry (1s, 4s, 16s). Reconcile client `attemptNumber` against server's canonical value returned in the response.

## Build pipeline

`scripts/bundle-renderer.mjs` runs four esbuild builds in sequence (plus a non-esbuild KaTeX-CSS inlining step):

1. **Runtime build.** Entry `packages/renderer/src/runtime/index.ts` → output as IIFE (not ESM — runs immediately when inlined into a `<script>` tag, no module loader). Minified, target `chrome90` (covers school Chromebooks, Firefox 88+, Safari 14+, Edge 90+). External source map at `packages/renderer/dist/runtime.js.map` (dev-only, gitignored). The minified text is written into a generated TypeScript string module at `packages/renderer/src/runtime/generated/runtime-bundle.ts`. **Committed to git** so a clean checkout can typecheck the renderer without running the bundler.

2. **Reference-panel sidecar build.** Entry `packages/renderer/src/runtime/reference-panel.ts` → minified IIFE, same `chrome90` target → generated string module `runtime/generated/reference-panel-bundle.ts` (also committed). A small (~1 KiB) self-contained script for the on-screen reference panel (drag-resize + scroll-clearance), kept OUT of the main runtime so the scoring runtime stays pure and panel-less pages ship none of it; `document.ts` inlines it only when an activity has a `referencePanel`. (This is the realized form of the "lazy-loaded sidecar bundle" pattern noted below — inlined-when-present rather than lazy-loaded, since it's tiny.)

3. **Definitions sidecar build.** Entry `packages/renderer/src/runtime/definitions.ts` → minified IIFE, same `chrome90` target → generated string module `runtime/generated/definitions-bundle.ts` (committed). A small (~1.7 KiB) self-contained script for inline vocabulary-definition popovers, kept OUT of the main runtime so the scoring runtime stays pure and definition-less pages ship none of it; `document.ts` inlines it only when the rendered page contains a `.definition` span.

4. **Renderer build.** Entry `packages/renderer/src/index.ts` → output as ESM at `supabase/functions/_shared/renderer.bundle.js`. The renderer's `document.ts` imports the generated string modules from steps 1–2 and inlines them into `<script>` tags in published pages (the runtime always; the reference-panel sidecar only when a panel exists).

Inlined model means `publish-activity` only uploads `index.html` to Storage — no separate `runtime.js` artifact.

Bundle size: runtime IIFE is roughly **5–7 KiB minified** as of Stage 13 completion. Well under the 20 KiB target.

`[target — Phase 2.7+]` Adds a second esbuild entry for `graph-widget.js` (lazy-loaded). `[target — Phase 2.9+]` adds `annotation-widget.js`. Main runtime stays small; pages without those block types pay nothing.

## Error handling philosophy

**Init can fail.** `parseConfig` returns null on missing/malformed config. The bootstrap logs to console and returns — page stays static (no scoring, no submission). Half-working runtime is worse for students than a clearly-static page. Per-element parse failures in `buildRefs` are warn-and-skip (the specific blank/block is dropped from refs; the rest of the activity works).

**Event handlers should not throw to the student.** Current state: scoring and submission paths have try/catch around fetch failures and JSON parse calls. `[target — Stage 14]` Wrap every event handler in try/catch so a scoring bug for one section doesn't break the rest of the activity.

**Network failures on submission.** Current state: HTTP errors surface in the status message and re-enable the submit button. `[target — Stage 14]` Queue the submission payload in localStorage keyed by `activityId + attemptNumber`, retry with exponential backoff. Surface a clear message: "your answers are saved locally; we'll try to submit them when you have a connection." Never lose student work to a network blip.

**Persistence failures.** All localStorage access is try/catch wrapped. Private-mode browsers, locked-down Chromebooks, and quota exhaustion all degrade silently to "no persistence." The activity still works; refresh just won't restore state.

**Form double-submit protection.** Submit button disables immediately on click; doesn't re-enable until success or final failure. Slow networks won't invite duplicate clicks.

## Testing strategy

Test suite at `packages/renderer/src/runtime/__tests__/`. Files (scoring runtime + sidecars):

- **`strategies.test.ts`** (node env): `evaluateAnswer` dispatch (list strategy variants, unknown-strategy warns + falls back), `computeScore` arithmetic.
- **`init.test.ts`** (JSDOM): `parseConfig` (valid / missing / malformed / missing required field), `buildRefs` for sections / fill_in_blank blocks / blanks (including cross-references), `createInitialState` defaults, `init()` orchestration.
- **`blanks.test.ts`** (JSDOM): `trimValue`, `scoreBlank`, `matchMistakeFeedback`, `scoreBlankAndUpdateState`, `clearBlankState`.
- **`render.test.ts`** (JSDOM): per-blank correct/incorrect class, `aria-invalid`, feedback slot text/hidden, hint affordance state, block solution slot, confidence radio reflection, section score text, check button disabled, locked-mode input freeze.
- **`checkpoints.test.ts`** (JSDOM): `checkSection` scoring aggregation (including the empty-blanks-count case), locked mode flips locked, solution reveal, re-check idempotence; `wireCheckpoints` click handler attachment.
- **`storage.test.ts`** (JSDOM): save/load roundtrip, versionNum scoping, submitted-state gating, malformed JSON / schema mismatch handling, `clearActivityState`, `applyStoredState` merge behavior.
- **`confidence.test.ts`** (JSDOM): `wireConfidence` change handler, value validation, no-fieldset skip, no-update-on-unchecked-radio defense.
- **`definitions.test.ts`** (JSDOM): the vocabulary-definition sidecar — click / keyboard opens the popover with the term's text, toggle/Escape/outside close, term-switching, empty-term inert. (Sidecar, not part of the scoring runtime.)

### Patterns

- Pure-function tests run in node (no JSDOM cost).
- JSDOM tests add `@vitest-environment jsdom` as per-file docblock.
- For JSDOM tests, build a minimal HTML fragment mirroring what the renderer emits for the case under test, install into `document.body`, run the function under test, assert state shape AND rendered DOM state. Render's change-guards make DOM-mutation assertions straightforward.
- JSDOM fragments are hand-written rather than generated by calling `renderActivity()` from `@activity/renderer`. Tests runtime code in isolation against the data-attribute contract; renderer regressions surface separately in renderer tests.
- Fixture helpers (e.g., `buildFixture` in `checkpoints.test.ts`) keep per-test setup declarative.

### Coverage gaps (queue for housekeeping)

- `init.test.ts` doesn't assert that `createInitialState` populates `state.blanks` and `state.blocks` (it asserts on `state.sections`). The defaults clearly work — render and checkpoint tests exercise them — but explicit coverage is overdue.
- No end-to-end test through bootstrap → user actions → submission. The wiring layer (`index.ts`) is integration code that pure unit tests don't reach. Stage 14 is the right home for that.
- No `submission.test.ts`. Submit's payload shape and clear-on-success behavior is verifiable via end-to-end testing for now; substantial test coverage lands in Stage 14 alongside the retry/resubmit work.

## Standing constraints

- **Runtime does not import from `@activity/schema`.** Defines its own minimal TypeScript interfaces mirroring the data-attribute contract. Deliberate duplication for size budget.
- **Performance budget:** runtime bundled + minified ≤ 20 KB target, ≤ 40 KB hard ceiling. Chromebooks on slow WiFi load activities in browser-bound conditions; bundle size is meaningful UX.
- **Browser support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Covers all school-issued Chromebooks per Google's ChromeOS support window.
- **`render(state, refs)` is the only DOM mutator after init.** Every event handler writes to state, never DOM. One permitted exception: `applyStoredState` setting `input.value` during bootstrap restoration.
- **`init.ts` is the only DOM walker.** All `querySelector` / `querySelectorAll` against arbitrary subtrees happens once at init.
- **Every DOM write in `render` is change-guarded.** `classList.toggle(name, condition)` is idempotent. Attribute / `hidden` / `checked` / `textContent` get explicit current-vs-target checks.
- **All attribute reads have a fallback.** No `dataset.X` access without `?? default`. No `JSON.parse(...)` without try/catch.
- **No JS dependencies.** Vanilla TypeScript. Adding utility libraries would blow size budget and add attack surface.
- **Persistence schema bumps with shape changes.** `STORAGE_SCHEMA_VERSION = 3`. Bump when `BlankState`, `BlockState`, `SectionState`, or blob shape changes incompatibly.
- **Heavy widgets are lazy-loaded into separate bundles.** `[target — Phase 2.7+]` interactive graphs and `[target — Phase 2.9+]` annotation widgets are dynamic imports. Pages without those block types pay nothing.
- **Naming convention discipline:**
  - TypeScript fields: `camelCase` (`attemptNumber`, `revisionMode`)
  - HTML data attributes: `kebab-case` (`data-attempt-number`, `data-revision-mode`)
  - The renderer is the only layer that maps between them.
- **Block category as coarse type discriminator.** `data-block-category` first, then `data-block-type`. `[target — Phase 2+]` New block kinds register through an init-registry pattern keyed by `data-block-type`.

## Open questions / deferred decisions

- **CDN-hosted shared runtime (Phase 3+).** When this moves from versioned-per-publish to CDN-hosted, a `runtimeVersion` selector picks which CDN runtime file to load. Migration is additive. Decide CDN provider when the move is made (Cloudflare or Supabase Storage with long cache TTL).
- **Service worker for offline mode (Phase 3+).** Could intercept submission failures more elegantly than localStorage retry; adds complexity and an install step. Probably not worth it for Phase 1.
- **MathLive in published HTML (Phase 2.5).** If included for student-side math input, the runtime bundle size budget must be re-evaluated. MathLive is ~200KB+ — likely a lazy-loaded sidecar bundle, not part of the main runtime.
- **Server-side scoring (Phase 5).** When this lands, runtime scoring functions remain for instant feedback but final submission stops trusting them. Edge Function re-scores against answer keys server-side. The data-attribute contract for answers (`data-blank-answers`) likely changes — answers may not be in published HTML at all. Plan a v2 runtime then.
- **Media capture browser quirks (Phase 2.8).** MediaRecorder API has had iOS Safari quirks historically. Decide at phase start whether to launch with both in-browser recording and upload, or upload-only with recording as a follow-up.
- **Annotation coordinate stability (Phase 2.9).** What coordinate system: character indices into rendered text vs DOM anchors vs normalized fractions of rendered geometry. Decide at phase start.
- **Audio narration of activity prose (Phase 4 UDL).** Browser Web Speech API vs server-rendered audio files. Runtime side is a play-button + word-level highlight handler either way.
- **`beforeunload` guard for autosave window (Stage 14 polish).** Hard tab close within the debounce window can drop the last edit; `beforeunload` would close that gap. Trade-off: causes a browser prompt that students may find confusing.
- **Free-mode resubmit flow (Stage 14).** Button text change, attempt increment, persistence handling across attempts. Currently `clearActivityState` on success means a re-submitted attempt starts fresh; revising for resubmit means we need to persist across the boundary. Probably want a "post-success draft" mode where state persists but is clearly marked as "resubmit in progress."

## Things NOT to do

- **Don't reintroduce `#activity-root`.** The document-root config mechanism is the `<script id="activity-config" type="application/json">` blob plus `data-*` attributes on `.activity-container` where CSS needs them. An earlier `#activity-root`-with-all-data-attributes design was superseded — CSS hooks belong on the container, JS config belongs in the blob, and the two should not be conflated.
- **Don't mutate the DOM outside `render()`.** The single permitted exception is `applyStoredState` setting `input.value` during bootstrap restoration, before initial render runs. Every other DOM mutation goes through render.
- **Don't query the DOM outside `init.ts`.** All structural queries (`querySelector` / `querySelectorAll`) happen once at init. Downstream code consumes typed refs.
- **Don't query the DOM inside scoring or state functions.** Read once at init; mutate state; let render handle DOM.
- **Don't import from `@activity/schema`.** Parallel types are deliberate. If schema changes, update both sides.
- **Don't add JS dependencies.** Single-file vanilla TypeScript by design.
- **Don't trust client-supplied `attempt_number`.** Edge Function derives it from `max + 1` server-side. Runtime sends a local guess for optimistic UI; server's value is canonical.
- **Don't reveal solutions before checking.** The HTML carries the data; runtime decides when to render. `BlockState.solutionRevealed` is the gate; `renderBlock` toggles `hidden`.
- **Don't make breaking changes to the data-attribute contract.** Add new attributes; never rename or remove existing ones. A renamed attribute breaks every activity published before the rename, forever.
- **Don't bake the answer key into the DOM for manually-graded blocks (Phase 2.6).** `short_answer` and `essay` blocks have no auto-scoring; their data-attribute payload shouldn't pretend they do.
- **Don't conflate runtime state with submission payload.** State has many fields (refs to DOM nodes, transient UI state). Submission payload has only what the Edge Function needs. Build the payload from state at submit time via `gatherResponses` + `gatherCheckpointResults`.
- **Don't sniff `data-block-type` when `data-block-category` is enough.** Category-level decisions branch on category. Block-type sniffing is for type-specific behavior only (e.g., init's `[data-block-type="fill_in_blank"]` selector).
- **Don't widen the persistence schema without bumping `STORAGE_SCHEMA_VERSION`.** Load returns null on mismatch (fresh state, which is correct behavior). Silently accepting wider shapes risks reading stale incompatible data.
- **Don't widen `BlankResponse.answer` to a union type.** New response categories get their own parallel map on `SubmissionResponses`.
- **Don't persist when `state.submitted` is true.** `saveActivityState` gates on `!state.submitted`. Bypassing the gate would re-persist post-submit state and confuse the next session's restore.
- **Don't reorder bootstrap.** Restore name → load activity state → apply stored → initial render direct → define onUpdate → wire handlers. Each step has dependencies on the previous; reordering breaks the "initial render reflects restored state before any handler attaches" invariant.
