// =============================================================================
// document.ts — Wraps rendered body in a complete HTML document
// -----------------------------------------------------------------------------
// Produces a self-contained HTML file: KaTeX CSS inlined (from the installed
// katex package, so it can't drift from the markup the renderer emits; fonts
// resolve from the version-matched CDN), block CSS inlined, runtime JS inlined,
// an activity-config script tag with the runtime parameters (activity id,
// submission endpoint, + activity-level behavior modes since Stage 12 step 5).
//
// Two paths into the runtime, one rule each (RUNTIME.md split-by-purpose):
//
//   CSS hooks → data-* attributes on .activity-container.
//     The only one today is data-activity-type, sourced from
//     doc.meta.activityType. Lets layout variants live in plain CSS
//     ([data-activity-type="exit_ticket"] …) without runtime involvement.
//
//   JS-only config → the activity-config JSON blob.
//     activityId, versionNum, submissionEndpoint come from RenderContext
//     (per-render values; not in the document).
//     submissionMode, revisionMode, gradingMode come from doc.meta
//     (document-level values; control checkpoint behavior, post-submit
//     resubmission permission, and forward-compat manual-grading
//     skipping respectively).
//
// data-submission-mode is deliberately NOT on the container — decision 4
// elides checkpoint markup entirely in 'single' mode, so CSS never needs
// to branch on the attribute. submissionMode lives only in the blob.
//
// The renderer itself stays pure (no I/O — runs in Edge Functions): the
// runtime JS is baked in at build time as a string constant
// (runtime/generated/runtime-bundle.ts, produced by scripts/bundle-renderer.mjs),
// never read from disk here. RenderContext values flow through args, never
// from environment.
// =============================================================================

import type { ActivityDocument } from '@activity/schema';
import { escape, attr } from './html.js';
import { renderBody } from './render.js';
import { blockStyles } from './runtime/styles.js';
import { runtimeJs } from './runtime/generated/runtime-bundle.js';
import { katexCss } from './generated/katex-css.js';

export interface RenderContext {
  /** UUID of the activity, included in submissions. */
  activityId: string;
  /** Version number — used in the published HTML's metadata. */
  versionNum: number;
  /** Absolute URL to POST submissions to (the ingest-submission Edge Function). */
  submissionEndpoint: string;
}

export function renderActivity(doc: ActivityDocument, ctx: RenderContext): string {
  const body = renderBody(doc);

  // Embedded JSON config that the runtime reads at startup.
  // Per-render fields (from RenderContext) plus activity-level behavior
  // modes (from doc.meta). The Stage 13 runtime reads submissionMode to
  // distinguish locked-mode input lockdown from free-mode revision;
  // revisionMode controls resubmission permission after final submit;
  // gradingMode is Phase 2.6 forward-compat (auto for Phase 1; manual /
  // mixed land when manually-graded block types arrive).
  const config = {
    activityId: ctx.activityId,
    versionNum: ctx.versionNum,
    submissionEndpoint: ctx.submissionEndpoint,
    submissionMode: doc.meta.submissionMode,
    revisionMode: doc.meta.revisionMode,
    gradingMode: doc.meta.gradingMode,
    answerFeedback: doc.meta.answerFeedback,
  };

  // Activity header text
  const headerMeta: string[] = [];
  headerMeta.push(escape(doc.meta.course));
  if (doc.meta.unit) headerMeta.push(escape(doc.meta.unit));

  return (
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
    '<title>' + escape(doc.meta.title) + '</title>' +
    // KaTeX CSS first (inlined from the installed package; fonts via CDN), then
    // block styles so they can override KaTeX where needed. Inlining keeps the
    // hide rule for KaTeX's MathML annotation co-versioned with the markup the
    // renderer emits — a CDN <link> drifted and let the raw MathML show twice.
    '<style>' + katexCss + '</style>' +
    '<style>' + blockStyles + '</style>' +
    '</head>' +
    '<body>' +
    // data-activity-type is the CSS hook for activity-type variants. The
    // attribute value is constrained by the schema enum (worksheet |
    // exit_ticket | warm_up | review); attr() is defensive regardless.
    '<main class="activity-container"' +
    ' data-activity-type="' + attr(doc.meta.activityType) + '">' +

    // Header
    '<header class="activity-header">' +
    '<h1>' + escape(doc.meta.title) + '</h1>' +
  (headerMeta.length > 0
  ? '<div class="meta">' + headerMeta.join(' &middot; ') + '</div>'
  : '') +
  '</header>' +

  // Identity prompt (Pattern B: name field is upfront, validated at submit)
  '<div class="identity-prompt">' +
  '<label for="student-name">Your name:</label>' +
  '<input id="student-name" type="text" autocomplete="name" />' +
  '</div>' +

  // Body
  body +

  // Submit area
  '<div class="submit-area">' +
  '<button type="button" class="submit-button">Submit</button>' +
  '<span class="submit-status"></span>' +
  '<span class="score-display"></span>' +
  '</div>' +

  '</main>' +

  // Shared floating popover (one per page) for hints and mistake feedback.
  // Hidden until the runtime opens it on a `?` or `!` click; the runtime sets
  // the title + body and anchors it beside the trigger button, then the
  // student can drag it by the header. It is NOT modal — no overlay, no page
  // dimming — so the rest of the activity stays interactive. Closing: the ×
  // button, Escape, or a click outside the popover/trigger/owning input (all
  // wired in the runtime). Lives outside <main> so its fixed position isn't
  // affected by container styling. Starts `hidden` so it's invisible (and out
  // of the a11y tree) even if JS never runs.
  '<div class="js-popover" id="activity-popover" role="dialog"' +
  ' aria-labelledby="popover-title" hidden>' +
  '<div class="js-popover-header">' +
  '<h2 class="js-popover-title" id="popover-title"></h2>' +
  '<button type="button" class="js-popover-close"' +
  ' aria-label="Close">&times;</button>' +
  '</div>' +
  '<div class="js-popover-body"></div>' +
  '</div>' +

  // Runtime config (read by runtime JS)
  '<script id="activity-config" type="application/json">' +
  // Note: this is JSON inside a <script>, NOT inline JS — only </script>
  // could break out of it. Replace any literal </script> in the JSON to
  // be safe (config values are renderer-controlled, but defense in depth).
  JSON.stringify(config).replace(/<\/script/gi, '<\\/script') +
  '</script>' +

  // Runtime JS (vanilla, no framework) — baked in at build time as a string
  // constant by scripts/bundle-renderer.mjs; see runtime/generated/.
  '<script>' + runtimeJs + '</script>' +

  '</body>' +
  '</html>'
  );
}
