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

import type { ActivityDocument, PrintConfig, PrintHeader } from '@activity/schema';
import { escape, attr } from './html.js';
import {
  renderBody,
  renderReferenceToolbar,
  renderReferenceBox,
  renderCalculatorTool,
} from './render.js';
import { blockStyles } from './runtime/styles.js';
import { runtimeJs } from './runtime/generated/runtime-bundle.js';
import { referencePanelJs } from './runtime/generated/reference-panel-bundle.js';
import { definitionsJs } from './runtime/generated/definitions-bundle.js';
import { calculatorSummonJs } from './runtime/generated/calculator-summon-bundle.js';
import { katexCss } from './generated/katex-css.js';

export interface RenderContext {
  /** UUID of the activity, included in submissions. */
  activityId: string;
  /** Version number — used in the published HTML's metadata. */
  versionNum: number;
  /** Absolute URL to POST submissions to (the ingest-submission Edge Function). */
  submissionEndpoint: string;
  /**
   * Absolute URL of the shared, content-hashed calculator/graph kit on R2.
   * Optional: when absent (e.g. dev without R2 configured), the calculator is
   * omitted even if the activity enables it — a summon button that can't load
   * anything is worse than no button. The renderer stays pure; this per-render,
   * environment-dependent URL is supplied by publish-activity (which holds the
   * R2 env), exactly like submissionEndpoint.
   */
  calculatorKitUrl?: string;
}

// ---- Print helpers ----------------------------------------------------------
// Shared by the published page (renderActivity) and the print-only document
// (renderActivityForPrint). The split mirrors the CSS-property limitation:
// paperSize + margin can't be CSS custom properties (the @page rule can't read
// them reliably), so they go out as a literal per-document @page rule; the
// rest ride as --print-* vars on the container, where ordinary @media print
// selectors can read them. See PrintConfig in @activity/schema.

// A standalone <style> carrying the per-document @page rule. size + margin are
// the two values @page needs and the two that can't be CSS vars. Values are
// schema-validated numbers / an enum, so no escaping is required.
function printPageStyle(print: PrintConfig): string {
  const size = print.paperSize === 'a4' ? 'A4' : 'letter';
  return '<style>@page{size:' + size + ';margin:' + print.margin + 'in;}</style>';
}

// The inline style value (just the declarations) setting the --print-* vars on
// .activity-container. Inert on screen — only @media print rules read them.
// workSpace seeds the activity-wide default; a fill-in-blank block can override
// it per-problem by setting its own --print-work-space (CSS var inheritance).
function printContainerVars(print: PrintConfig): string {
  return (
    '--print-columns:' + print.columns + ';' +
    '--print-work-space:' + print.workSpace + 'rem;' +
    '--print-font-size:' + print.fontSize + 'pt;' +
    '--print-problem-spacing:' + print.problemSpacing + 'rem;'
  );
}

// The print-only header: a row of labeled fill-in lines. Hidden on screen (CSS
// .print-header { display:none }), shown in @media print. Returns '' when no
// fields are enabled so an empty header box never prints. custom labels are
// teacher text and are escaped; the field keys are static.
function renderPrintHeader(header: PrintHeader): string {
  const field = (key: string, label: string): string =>
  '<span class="print-field print-field-' + key + '">' +
  '<span class="print-field-label">' + escape(label) + ':</span>' +
  '<span class="print-field-line"></span>' +
  '</span>';

  const fields: string[] = [];
  if (header.name) fields.push(field('name', 'Name'));
  if (header.date) fields.push(field('date', 'Date'));
  if (header.period) fields.push(field('period', 'Period'));
  if (header.class) fields.push(field('class', 'Class'));
  if (header.score) fields.push(field('score', 'Score'));
  for (const label of header.custom) fields.push(field('custom', label));

  if (fields.length === 0) return '';
  return '<div class="print-header" aria-hidden="true">' + fields.join('') + '</div>';
}

export function renderActivity(doc: ActivityDocument, ctx: RenderContext): string {
  // The graph kit URL (shared with the calculator) reaches interactive_graph
  // blocks as data-graph-kit-src. Absent → those blocks render their static
  // no-JS placeholder, same graceful-degradation as a calculator with no kit.
  const body = renderBody(doc, { graphKitUrl: ctx.calculatorKitUrl });
  const print = doc.meta.print;

  // Reference panel (scaffold). Screen: a fixed bottom toolbar (collapsed by
  // default). Print: a static box at the top — only when printReferencePanel is
  // on. Both render the same blocks and sit OUTSIDE any .activity-section, so
  // the runtime never walks them (no scoring/persistence/checkpoint impact).
  // The container marker reserves bottom padding so the collapsed bar can't
  // hide the last content.
  const referenceHtml = doc.referencePanel
    ? renderReferenceToolbar(doc.referencePanel, {
        gridLinesDefault: print.gridLines,
      }) +
      (print.printReferencePanel
        ? renderReferenceBox(doc.referencePanel, {
            gridLinesDefault: print.gridLines,
          })
        : '')
    : '';
  const containerClass =
    'activity-container' + (doc.referencePanel ? ' has-reference-panel' : '');

  // Calculator tool (scaffold). A summonable, lazy-loaded calculator, gated on
  // the activity opting in AND a kit URL being available (the heavy widget lives
  // on R2; with no URL there's nothing to summon, so we emit nothing). Rendered
  // OUTSIDE any .activity-section so the runtime never walks it; placed outside
  // <main> with the other floating UI so container styling can't affect its
  // fixed position. Cannot print (a calculator on paper is meaningless) — the
  // baseline print CSS hides .calculator-tool.
  const calculatorHtml =
    doc.calculator?.enabled && ctx.calculatorKitUrl
      ? renderCalculatorTool(doc.calculator, { kitUrl: ctx.calculatorKitUrl })
      : '';

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
    // Per-document @page rule (paper size + margin). Literal, not a CSS var:
    // @page can't reliably read custom properties. See printPageStyle.
    printPageStyle(print) +
    '</head>' +
    '<body>' +
    // data-activity-type is the CSS hook for activity-type variants. The
    // attribute value is constrained by the schema enum (worksheet |
    // exit_ticket | warm_up | review); attr() is defensive regardless. The
    // inline style carries the --print-* vars consumed by @media print.
    '<main class="' + containerClass + '"' +
    ' data-activity-type="' + attr(doc.meta.activityType) + '"' +
    ' style="' + printContainerVars(print) + '">' +

    // Print-only header (Name/Date/… fill-in lines). display:none on screen.
    renderPrintHeader(print.header) +

    // Header
    '<header class="activity-header">' +
    '<h1>' + escape(doc.meta.title) + '</h1>' +
  (headerMeta.length > 0
  ? '<div class="meta">' + headerMeta.join(' &middot; ') + '</div>'
  : '') +
  '</header>' +

  // Reference panel (scaffold) — screen toolbar + optional print box. Empty
  // string when the activity has no panel. See referenceHtml above.
  referenceHtml +

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

  // Calculator tool (scaffold) — a summon button + empty mount; the heavy
  // widget lazy-loads on first click (see renderCalculatorTool). Empty string
  // when the activity has no enabled calculator or no kit URL. Outside <main>
  // with the other floating UI so container styling can't affect its fixed
  // position.
  calculatorHtml +

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

  // Reference-panel sidecar (drag-resize + scroll-clearance), inlined ONLY when
  // the activity has a panel — panel-less pages ship none of it. Separate from
  // the scoring runtime above; it touches only the panel's own DOM.
  (doc.referencePanel
    ? '<script>' + referencePanelJs + '</script>'
    : '') +

  // Definitions sidecar (inline vocabulary-definition popovers), inlined ONLY
  // when the page actually contains a definition mark — definition-less pages
  // ship none of it. Presence is detected from the rendered output (the body
  // or the reference panel, since a definition can appear in either). Separate
  // from the scoring runtime above; it manages its own popover element.
  (body.includes('data-definition=') ||
  referenceHtml.includes('data-definition=')
    ? '<script>' + definitionsJs + '</script>'
    : '') +

  // Calculator-summon sidecar (the cheap summon button + lazy-loader for the
  // calculator widget), inlined ONLY when a calculator was emitted. The heavy
  // widget it imports lives on R2, never here. Separate from the scoring runtime
  // above; it manages only its own DOM.
  (calculatorHtml ? '<script>' + calculatorSummonJs + '</script>' : '') +

  '</body>' +
  '</html>'
  );
}

// =============================================================================
// renderActivityForPrint — a self-contained, print-oriented HTML document.
// -----------------------------------------------------------------------------
// Same body as renderActivity (one renderer, not two — same renderBody path),
// but stripped of everything interactive: no runtime <script>, no activity
// config blob, no identity prompt, no submit area, no popover. It carries the
// same print layer (dynamic @page, --print-* container vars, print header) so
// it prints identically to the published page's print output.
//
// This is the foundation the app's print route (Drop C) renders client-side —
// the teacher is printing, not submitting, so the student runtime has no place
// here. opts.showAnswers selects the answer-key variant (blanks prefilled with
// their canonical answer); preference overrides (paper size, columns, …) are
// applied by the caller mutating doc.meta.print before calling, so they need no
// argument here. Pure (no RenderContext): printing needs no id or submit URL.
export function renderActivityForPrint(
  doc: ActivityDocument,
  opts: { showAnswers?: boolean } = {},
): string {
  const body = renderBody(doc, { showAnswers: opts.showAnswers });
  const print = doc.meta.print;

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
    '<style>' + katexCss + '</style>' +
    '<style>' + blockStyles + '</style>' +
    printPageStyle(print) +
    '</head>' +
    '<body>' +
    '<main class="activity-container"' +
    ' data-activity-type="' + attr(doc.meta.activityType) + '"' +
    ' style="' + printContainerVars(print) + '">' +
    renderPrintHeader(print.header) +
    '<header class="activity-header">' +
    '<h1>' + escape(doc.meta.title) + '</h1>' +
  (headerMeta.length > 0
  ? '<div class="meta">' + headerMeta.join(' &middot; ') + '</div>'
  : '') +
  '</header>' +
  // Reference box at the top of the worksheet, gated by printReferencePanel.
  // No screen toolbar here — this document is print-only (no runtime, no
  // screen presentation).
  (doc.referencePanel && print.printReferencePanel
    ? renderReferenceBox(doc.referencePanel, { gridLinesDefault: print.gridLines })
    : '') +
  body +
  '</main>' +
  '</body>' +
  '</html>'
  );
}
