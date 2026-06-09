import type { FillInBlankBlock } from '@activity/schema';
import { renderFillInBlankContent, renderInlineNodes } from '../inline.js';
import { attr, escape } from '../html.js';

export interface FillInBlankRenderContext {
  problemNumber: number;
}

export function renderFillInBlank(
  block: FillInBlankBlock,
  ctx: FillInBlankRenderContext,
): string {
  const num = block.number ?? ctx.problemNumber;
  // renderFillInBlankContent (not a bare renderInline map) so each blank
  // token is numbered for its positional aria-label.
  const inner = renderFillInBlankContent(block.content);

  // Stage 12 step 3: per-block feedback layers (Stage 9a schema additions).
  //
  //   solution: optional teacher-authored worked explanation for the whole
  //     problem (one solution covers all blanks), as rich inline content
  //     (formatted text + math). Revealed by the runtime only after the
  //     section is checked (RUNTIME.md "Things NOT to do" — don't reveal
  //     solutions before checking). The .js-solution slot holds the
  //     pre-rendered content statically, hidden, ready to be revealed by
  //     toggling the `hidden` attribute. The runtime keys off the slot's
  //     presence (no data-solution attribute needed).
  //
  //   hasConfidenceRating: when true, ONE confidence fieldset per block
  //     (not per blank — the field lives on FillInBlankBlock and applies
  //     uniformly to every blank in the block). Three radios: Unsure /
  //     Think so / Certain. The runtime captures the selected value at
  //     check/submit time and replicates it across every BlankResponse
  //     in this block's blanks map. data-has-confidence-rating="true" is
  //     the presence signal; omitted entirely when false (matches the
  //     omit-when-default pattern used for hint and mistakeFeedback).
  //
  //   skills: array of skill-tag strings (universal skill taxonomy, see
  //     ActivityMeta.skills). JSON-encoded only when non-empty. Editor UI
  //     is Phase 2; renderer emits the attribute now so per-skill
  //     analytics can reach back to Phase 1 blocks when the editor and
  //     dashboard features land. Most Phase 1 blocks will have an empty
  //     skills array and thus no data-skills attribute.
  const solution = block.solution;
  const hasSolution = solution && solution.length > 0;
  const hasConfidenceRating = block.hasConfidenceRating;
  const skills = block.skills;

  const ratingAttr = hasConfidenceRating
  ? ' data-has-confidence-rating="true"'
  : '';
  const skillsAttr =
  skills.length > 0
  ? ' data-skills="' + attr(JSON.stringify(skills)) + '"'
  : '';

  // Per-problem print work space (rem). Emitted only when the author set an
  // explicit override; it shadows the activity-level --print-work-space for
  // this block's subtree (CSS custom-property inheritance), and the @media
  // print rule on .block-fill-in-blank reads it as padding-bottom. Absent →
  // the block inherits the container's default. Inert on screen. The value is
  // a schema-validated non-negative number, so direct interpolation is safe.
  const workSpaceStyle =
  block.workSpace !== undefined
  ? ' style="--print-work-space:' + block.workSpace + 'rem"'
  : '';

  // Confidence fieldset (one per block; rendered only when
  // hasConfidenceRating is true). Sits inside the problem body so it
  // aligns under the problem number with the rest of the body content.
  // The radio group's `name` attribute is namespaced by block id so two
  // fill-in-blank blocks on the same page don't share radio-group state
  // (radio name uniqueness is document-wide). <fieldset> + <legend> is
  // the canonical accessibility pattern for a labeled radio group;
  // wrapping each <input> in its <label> makes the label text a click
  // target.
  const confidenceFieldset = hasConfidenceRating
  ? '<fieldset class="js-confidence-rating"' +
  ' data-for-block="' + attr(block.id) + '">' +
  '<legend>How confident are you?</legend>' +
  '<label><input type="radio"' +
  ' name="conf-' + attr(block.id) + '"' +
  ' value="unsure" /> Unsure</label>' +
  '<label><input type="radio"' +
  ' name="conf-' + attr(block.id) + '"' +
  ' value="think_so" /> Think so</label>' +
  '<label><input type="radio"' +
  ' name="conf-' + attr(block.id) + '"' +
  ' value="certain" /> Certain</label>' +
  '</fieldset>'
  : '';

  // Solution slot. Rich content pre-rendered into the slot (KaTeX runs
  // server-side); the runtime toggles the `hidden` attribute when the
  // section is checked. Initial `hidden` means the student never sees the
  // solution at page load even if the runtime fails to initialize —
  // fail-closed. data-for-block keys the slot to its block for runtime
  // lookup by relation (no DOM-tree walking needed). The slot's mere
  // presence is the runtime's "has a solution" signal.
  const solutionSlot = hasSolution
  ? '<div class="js-solution"' +
  ' data-for-block="' + attr(block.id) + '"' +
  ' hidden>' +
  renderInlineNodes(solution) +
  '</div>'
  : '';

  return (
    '<div class="block block-fill-in-blank"' +
    ' data-block-category="question"' +
    ' data-block-type="fill_in_blank"' +
    ' data-block-id="' + attr(block.id) + '"' +
    ratingAttr +
    skillsAttr +
    workSpaceStyle +
    '>' +
    '<div class="block-problem-number">' + escape(String(num)) + '.</div>' +
    '<div class="block-problem-body">' +
    inner +
    confidenceFieldset +
    solutionSlot +
    '</div>' +
    '</div>'
  );
}
