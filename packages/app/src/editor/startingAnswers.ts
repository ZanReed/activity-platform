// =============================================================================
// startingAnswers.ts — a graph or number line still on the answer it was
// inserted with (UI review B-3 / B-4, docs/design/ui-review-group-b.md)
// -----------------------------------------------------------------------------
// A new graph starts with a made-up answer (a point at (0, 0), 5 on a number
// line, a default region…) so the block is valid the moment it lands. If the
// teacher never changes it, every student is marked against it. That can be
// the real answer, so this is a CHECK, never a refusal: "still the starting
// answer" means the interaction deep-equals the factory default for its type,
// the same factories the editor inserts and switches type with.
// =============================================================================

import type { Editor } from '@tiptap/core';
import {
    defaultFunctionInteraction,
    defaultInequalityInteraction,
    defaultPointInteraction,
    defaultRayInteraction,
    defaultRegionInteraction,
    defaultSegmentInteraction,
    defaultTransformCurveInteraction,
    defaultVectorInteraction,
} from './extensions/InteractiveGraph';
import { defaultNumberLineIntervalInteraction, defaultNumberLinePointInteraction } from './extensions/NumberLine';
import { problemNumberAt } from './problemNumbering';

// Built on first use, not at import: the graph and number line views import
// this module, and their extensions import those views, so the factories are
// not yet defined while this module first evaluates (an import cycle).
const defaults = (): Record<string, readonly (() => unknown)[]> => ({
    interactiveGraph: [
        defaultPointInteraction,
        defaultRegionInteraction,
        defaultInequalityInteraction,
        defaultRayInteraction,
        defaultVectorInteraction,
        defaultSegmentInteraction,
        defaultFunctionInteraction,
        defaultTransformCurveInteraction,
    ],
    numberLine: [defaultNumberLinePointInteraction, defaultNumberLineIntervalInteraction],
});
const STARTING_KINDS = new Set(['interactiveGraph', 'numberLine']);

/** Stable comparison: key order and undefined fields don't matter. */
function canonical(value: unknown): string {
    return JSON.stringify(value, (_k, v: unknown) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            return Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)));
        }
        return v;
    });
}

/** Is this block's answer still the one it was inserted with? */
export function isStartingAnswer(pmName: string, interaction: unknown): boolean {
    const factories = defaults()[pmName];
    if (!factories || !interaction) return false;
    const mine = canonical(JSON.parse(JSON.stringify(interaction)));
    return factories.some((make) => canonical(JSON.parse(JSON.stringify(make()))) === mine);
}

export interface StartingAnswer {
    pos: number;
    /** "Q7 graph", "Q2 number line". */
    label: string;
}

/** Every graph and number line in the document still on its starting answer. */
export function findStartingAnswers(editor: Editor): StartingAnswer[] {
    const out: StartingAnswer[] = [];
    editor.state.doc.descendants((node, pos) => {
        if (!STARTING_KINDS.has(node.type.name)) return true;
        if (isStartingAnswer(node.type.name, node.attrs.interaction)) {
            const kind = node.type.name === 'numberLine' ? 'number line' : 'graph';
            const mode = (node.attrs.label as { mode?: string } | undefined)?.mode;
            const unnumbered = mode === 'none' || mode === 'custom';
            out.push({ pos, label: unnumbered ? `A ${kind}` : `Q${problemNumberAt(editor, pos)} ${kind}` });
        }
        return false;
    });
    return out;
}

export const STARTING_ANSWER_COPY = {
    badge: 'Starting answer — set the real one',
    heading: 'Check before publishing:',
    item: 'the answer is still the one it started with',
    publishAnyway: 'Publish anyway',
    goTo: 'Go to it',
} as const;
