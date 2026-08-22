// =============================================================================
// blocks/figureSlot.ts — the figure slot's shared vocabulary
// -----------------------------------------------------------------------------
// `MultipleChoiceOption`, `MatchingItem` and `MatchingTarget` all carry the
// same optional `{image?, graph?}` slot. The EDITOR already treats them as one
// shape (its `FigureHolder` type behind a shared `ChoiceFigureEditor`); this is
// the viewer's half of that vocabulary, so the predicates below are written
// once instead of three times.
//
// WHY THE PRELOAD WALK IS A DOCUMENT WALK AND NOT A REGISTRY FLAG.
// `kitPreload` derives its trigger set from `sanitize.deriveQuestionShape`,
// which is the registry's own marker for "this widget needs shape from the
// answer key" — bonded in `rosterBonds.test.ts` so it can never become a third
// hand-list (policy P4). Multiple-choice and matching must NOT set that flag:
// they need nothing from the key, and setting it to get a preload would move
// `SANITIZER_REV` and lie about why the flag exists. Their trigger is a
// property of the CONTENT (does any choice carry a graph?), not of the type, so
// it is derived by walking the document — never by a list of block types
// someone has to remember to update.
// =============================================================================

// Typed STRUCTURALLY rather than against the schema's `ChoiceImage`/`ChoiceGraph`.
// What reaches the viewer is the SANITIZED projection, which rebuilds object
// types structurally — and tuples do not survive that, so a drawable's
// `at: [number, number]` arrives as `number[]`. Naming the raw types here would
// make every call site fail on a widening that is purely type-level (the values
// are unchanged). The renderer boundary recovers tuple-ness with one confined
// cast, exactly as `InteractiveGraph.tsx` does.

/** The drawing payload, opaque here — only the renderer needs its shape. */
export interface FigureGraph {
  readonly axis: unknown;
  readonly drawables: unknown;
}

export interface FigureImage {
  readonly src: string;
  readonly alt: string;
}

/** Anything carrying the optional figure slot. */
export interface ChoiceFigureHolder {
  readonly id: string;
  readonly content?: readonly unknown[];
  readonly image?: FigureImage;
  readonly graph?: FigureGraph;
}

/** Does this owner carry a figure at all? */
export function hasFigure(owner: ChoiceFigureHolder): boolean {
  return owner.image !== undefined || owner.graph !== undefined;
}

/**
 * A6: the two-column grid applies only when EVERY owner carries a figure.
 *
 * A mixed question keeps the stacked full-width rows — a grid cell holding bare
 * text beside cells holding graphs reads as ragged, and a vertical list is how
 * people scan options. Empty collections are false: a question with no choices
 * has nothing to arrange.
 */
export function allHaveFigures(owners: readonly ChoiceFigureHolder[]): boolean {
  return owners.length > 0 && owners.every(hasFigure);
}

/** Is the figure the whole choice (no inline content beside it)? Drives A4. */
export function figureIsSoleContent(owner: ChoiceFigureHolder): boolean {
  return hasFigure(owner) && (owner.content?.length ?? 0) === 0;
}

/** Same cap and reason as kitPreload's: real content sits well inside it. */
const MAX_DEPTH = 24;

/**
 * Does this document contain a choice/item/target GRAPH anywhere?
 *
 * Only graphs matter: images need no engine chunk. Structural walk — it looks
 * for the shape (`{axis, drawables}` under a `graph` key), so a new block type
 * that adopts the same figure slot is covered the day it ships, with nothing to
 * remember. That is the whole point of deriving rather than listing.
 */
export function documentUsesChoiceFigureGraph(doc: unknown): boolean {
  let found = false;

  const visit = (node: unknown, depth: number): void => {
    if (found || depth > MAX_DEPTH || node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const el of node) visit(el, depth + 1);
      return;
    }
    const obj = node as Record<string, unknown>;
    const graph = obj.graph;
    if (
      graph !== null &&
      typeof graph === 'object' &&
      'axis' in (graph as Record<string, unknown>) &&
      'drawables' in (graph as Record<string, unknown>)
    ) {
      found = true;
      return;
    }
    for (const key of Object.keys(obj)) visit(obj[key], depth + 1);
  };

  visit(doc, 0);
  return found;
}
