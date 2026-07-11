import { useEffect, useMemo, useRef, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import {
    mountGraphAuthor,
    mountGraphDisplay,
    fitFunction,
    handlesForFamily,
    parseGraphFormula,
    parsePointList,
    parseRaySegment,
    formatModel,
    formatPoints,
    formatRay,
    formatSegment,
    rayKeyShape,
    type GraphAuthorHandle,
    type GraphDisplayHandle,
} from '@activity/graph-kit';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import DrawableListEditor from '../components/DrawableListEditor';
import FormulaField from '../components/FormulaField';
import type { InlineNodes } from '../../lib/serialize';
import { problemNumberAt } from '../problemNumbering';
import { toCurveDomain, formatCurveDomain } from '../../lib/graphDomain';
import { linearDomainToRayOrSegment } from './boundedCurveLogic';
import {
    defaultDisplayInteraction,
    defaultFunctionInteraction,
    defaultInequalityInteraction,
    defaultPointInteraction,
    defaultRayInteraction,
    defaultRegionInteraction,
    defaultSegmentInteraction,
    type DrawableAttr,
    type FunctionModelAttr,
    type GraphAxisConfig,
    type GraphInteraction,
    type GraphMistakeEntry,
    type RayAnswerAttr,
    type SegmentAnswerAttr,
    type InequalityAnswerAttr,
    type LinearFunctionModel,
    type RegionAnswerAttr,
} from '../extensions/InteractiveGraph';

type InteractionType = GraphInteraction['type'];

// ============================================================================
// InteractiveGraphView — NodeView for the interactive_graph block (Stage 5).
// "What the teacher sees is what the student gets": the author board is the SAME
// kit board students use. plot_point: drag handle(s) → correctPoints.
// plot_function (2.7b): drag two handles → the line through them; we re-derive
// slope/intercept from the handles with the SAME fit engine that scores it.
// Built B-shaped so quadratic/exponential/logarithmic families slot into the
// picker + the fit engine additively.
// ============================================================================

// y(x) for any family — the seed-handle placer's view of the model. Vertical
// has no y = f(x) and is special-cased by the caller.
function modelPredict(model: FunctionModelAttr): ((x: number) => number) | null {
    switch (model.family) {
        case 'linear':
            return (x) => model.slope * x + model.intercept;
        case 'quadratic':
            return (x) => model.a * x * x + model.b * x + model.c;
        case 'exponential':
            return (x) => model.a * Math.pow(model.b, x);
        case 'logarithmic':
            return (x) => model.a + model.b * Math.log(x);
        case 'vertical':
            return null;
    }
}

// N points ON the given curve (N = the family's handle count), used to seed the
// author handles on the current answer when the board mounts. Log curves seed at
// positive x regardless of the window; vertical seeds two points on x = k.
function functionStartPoints(
    model: FunctionModelAttr,
    axis: GraphAxisConfig,
): [number, number][] {
    const ySpan = axis.yMax - axis.yMin || 1;
    if (model.family === 'vertical') {
        return [
            [model.x, axis.yMin + ySpan * 0.3],
            [model.x, axis.yMin + ySpan * 0.7],
        ];
    }
    const predict = modelPredict(model)!;
    const count = handlesForFamily(model.family);
    const fractions = count === 3 ? [0.25, 0.5, 0.75] : [0.3, 0.7];
    // The x-range to spread handles across. ln needs x > 0.
    let lo = model.family === 'logarithmic' ? Math.max(axis.xMin, 0.25) : axis.xMin;
    let hi = axis.xMax;
    // Keep the handles where the curve stays IN the y-window: a steep curve
    // (y = x² − 5 hits y = 20 at x = 5) would otherwise seed points the board
    // clamps to the window edge — and 3 clamped points fit a FLATTER curve than
    // the authored one (the drawn preview then lies about the answer). Sample
    // the window and shrink [lo, hi] to the in-window x's so the seed handles
    // land on the true curve.
    const inWindow = (x: number): boolean => {
        const y = predict(x);
        return Number.isFinite(y) && y >= axis.yMin && y <= axis.yMax;
    };
    const STEPS = 200;
    let firstIn = Infinity;
    let lastIn = -Infinity;
    for (let i = 0; i <= STEPS; i++) {
        const x = lo + ((hi - lo) * i) / STEPS;
        if (inWindow(x)) {
            firstIn = Math.min(firstIn, x);
            lastIn = Math.max(lastIn, x);
        }
    }
    // Only tighten when part of the curve left the window AND enough of it
    // stays (a hair of in-window range can't spread the handles). Otherwise
    // keep the full span (the pre-existing behavior).
    if (firstIn < lastIn && lastIn - firstIn >= (hi - lo) * 0.1) {
        lo = firstIn;
        hi = lastIn;
    }
    const xs = fractions.map((f) => lo + (hi - lo) * f);
    return xs.map((x) => [round2(x), round2(predict(x))] as [number, number]);
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

// plot_function / shade_region carry ARRAYS of answer objects (systems); the
// current authoring UI edits a SINGLE curve/region — models[0] / regions[0].
// The function UI is linear-only (Drop 2); other families arrive via freeform
// equation entry (Drop 3) with their own UI, so coerce a non-linear/absent
// models[0] to a default linear line here.
const DEFAULT_LINEAR: LinearFunctionModel = {
    family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1,
};
function firstModel(models: FunctionModelAttr[]): FunctionModelAttr {
    return models[0] ?? DEFAULT_LINEAR;
}
function firstRegion(regions: RegionAnswerAttr[]): RegionAnswerAttr {
    return regions[0] ?? { correctVertices: [], minOverlap: 0.9 };
}
function firstInequality(list: InequalityAnswerAttr[]): InequalityAnswerAttr {
    return list[0] ?? { boundary: DEFAULT_LINEAR, strict: true, shadeSide: 'above' };
}
function firstRay(rays: RayAnswerAttr[]): RayAnswerAttr {
    return rays[0] ?? { from: [0, 0], through: [3, 3], fromStyle: 'closed', tolerance: 0.25 };
}
function firstSegment(list: SegmentAnswerAttr[]): SegmentAnswerAttr {
    return list[0] ?? { from: [-2, 0], to: [3, 2], endpoints: ['closed', 'closed'], tolerance: 0.25 };
}

// The canonical inequality string: formatModel's equation with `=` swapped for
// the operator the side + strictness imply. Reparseable by parseGraphFormula.
function formatInequality(a: InequalityAnswerAttr): string {
    const eq = formatModel(a.boundary);
    const vertical = a.boundary.family === 'vertical';
    const greater = vertical ? a.shadeSide === 'right' : a.shadeSide === 'above';
    const op = greater ? (a.strict ? '>' : '>=') : (a.strict ? '<' : '<=');
    return eq.replace('=', op);
}

function GraphAuthorBoard({
    axisConfig,
    interaction,
    onPointsChange,
    onLinearChange,
    onDomainChange,
    formulaEpoch,
}: {
    axisConfig: GraphAxisConfig;
    interaction: GraphInteraction;
    onPointsChange: (points: [number, number][]) => void;
    onLinearChange?: (out: {
        points: [number, number][];
        shape: 'ray_positive' | 'ray_negative' | 'segment' | null;
        rayEndpointStyle: 'open' | 'closed';
        segStyles: ['open' | 'closed', 'open' | 'closed'];
    }) => void;
    onDomainChange?: (domain: {
        min?: number;
        minStyle?: 'open' | 'closed';
        max?: number;
        maxStyle?: 'open' | 'closed';
    }) => void;
    /** Bumped when the freeform answer field applies: remounts the board so
     *  the handles (and shape pills) jump to the typed answer. Drags never
     *  bump it — remounting mid-drag would yank the board from the pointer. */
    formulaEpoch?: number;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const cbRef = useRef(onPointsChange);
    cbRef.current = onPointsChange;
    const linearCbRef = useRef(onLinearChange);
    linearCbRef.current = onLinearChange;
    const domainCbRef = useRef(onDomainChange);
    domainCbRef.current = onDomainChange;

    const family =
        interaction.type === 'plot_function'
            ? interaction.models[0]?.family
            : interaction.type === 'graph_inequality'
              ? firstInequality(interaction.inequalities).boundary.family
              : undefined;
    // GraphAuthorBoard is only rendered for the graded interactions; the
    // `display` case is handled by DisplayPreviewBoard and never reaches here.
    const count =
        interaction.type === 'plot_function' || interaction.type === 'graph_inequality'
            ? handlesForFamily(family!)
            : interaction.type === 'shade_region'
              ? firstRegion(interaction.regions).correctVertices.length
              : interaction.type === 'plot_point'
                ? interaction.correctPoints.length
                : interaction.type === 'plot_ray' || interaction.type === 'plot_segment'
                  ? 2
                  : 1;
    const startPoints =
        interaction.type === 'plot_function'
            ? functionStartPoints(firstModel(interaction.models), axisConfig)
            : interaction.type === 'graph_inequality'
              ? functionStartPoints(firstInequality(interaction.inequalities).boundary, axisConfig)
              : interaction.type === 'shade_region'
              ? firstRegion(interaction.regions).correctVertices
              : interaction.type === 'plot_point'
                ? interaction.correctPoints
                : interaction.type === 'plot_ray'
                  ? [firstRay(interaction.rays).from, firstRay(interaction.rays).through]
                  : interaction.type === 'plot_segment'
                    ? [firstSegment(interaction.segments).from, firstSegment(interaction.segments).to]
                    : [];
    const startRef = useRef(startPoints);
    startRef.current = startPoints;

    // Remount only on axis + interaction type + family + handle count — never on
    // the answer PARAM values (drags update those and must not cancel the drag).
    // plot_ray ↔ plot_segment normalize to one token: the shape pills swap the
    // stored TYPE, and remounting mid-toggle would rebuild the board under the
    // teacher's pointer.
    const typeKey = interaction.type === 'plot_segment' ? 'plot_ray' : interaction.type;
    // Which bounds are present (NOT their values — dragging a bound must not
    // remount). Only typing a clause changes this, and that also bumps
    // formulaEpoch; kept explicit so absent↔present always rebuilds the board.
    const authoredDomain =
        interaction.type === 'plot_function' ? interaction.domains?.[0] ?? undefined : undefined;
    const domainSig = authoredDomain
        ? `${typeof authoredDomain.min === 'number'}:${typeof authoredDomain.max === 'number'}`
        : 'none';
    const key = useMemo(
        () => JSON.stringify([axisConfig, typeKey, family, count, domainSig, formulaEpoch ?? 0]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            axisConfig.xMin, axisConfig.xMax, axisConfig.yMin, axisConfig.yMax,
            axisConfig.xGridStep, axisConfig.yGridStep, axisConfig.showGrid,
            axisConfig.snapToGrid, typeKey, family, count, domainSig, formulaEpoch,
        ],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0;';
        host.appendChild(el);
        let handle: GraphAuthorHandle | null = null;
        let disposed = false;
        // Ray/segment: pre-set the shared shape controls from the stored key.
        const linear =
            interaction.type === 'plot_ray'
                ? {
                      shape: rayKeyShape(firstRay(interaction.rays)),
                      rayEndpointStyle: firstRay(interaction.rays).fromStyle,
                  }
                : interaction.type === 'plot_segment'
                  ? {
                        shape: 'segment' as const,
                        segStyles: firstSegment(interaction.segments).endpoints,
                    }
                  : undefined;
        void mountGraphAuthor(
            el,
            {
                interactionType: interaction.type,
                axisConfig,
                correctPoints: startRef.current,
                family,
                linear,
                domain:
                    interaction.type === 'plot_function'
                        ? interaction.domains?.[0] ?? undefined
                        : undefined,
            },
            {
                onChange: (pts) => cbRef.current(pts),
                onLinearChange: (out) => linearCbRef.current?.(out),
                onDomainChange: (domain) => domainCbRef.current?.(domain),
            },
        ).then((h) => {
            if (disposed) { h.destroy(); return; }
            handle = h;
        });
        return () => {
            disposed = true;
            handle?.destroy();
            el.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <div
            ref={hostRef}
            aria-label="Set the correct answer: drag the handle(s), or use arrow keys."
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '22rem',
                aspectRatio: '1 / 1',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                background: '#fff',
                touchAction: 'none',
            }}
        />
    );
}

const num = (v: string, fallback: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

// Format a linear model as "y = mx + b" for the answer readout.
// Patch a model's fitted parameters from the kit's Fitted result, preserving
// the model's tolerances. Same-family only; returns null when the fit failed.
function fittedToModel(
    model: FunctionModelAttr,
    points: [number, number][],
): FunctionModelAttr | null {
    if (model.family === 'vertical') {
        // Vertical: the handles' mean x is the line (the board constrains them).
        if (points.length === 0) return null;
        const x = round2(points.reduce((s, [px]) => s + px, 0) / points.length);
        return { ...model, x };
    }
    const fit = fitFunction(model.family, points);
    if (!fit || fit.family !== model.family) return null;
    switch (fit.family) {
        case 'linear':
            return model.family === 'linear'
                ? { ...model, slope: round2(fit.slope), intercept: round2(fit.intercept) }
                : null;
        case 'quadratic':
            return model.family === 'quadratic'
                ? { ...model, a: round2(fit.a), b: round2(fit.b), c: round2(fit.c) }
                : null;
        case 'exponential':
            return model.family === 'exponential'
                ? { ...model, a: round2(fit.a), b: round2(fit.b) }
                : null;
        case 'logarithmic':
            return model.family === 'logarithmic'
                ? { ...model, a: round2(fit.a), b: round2(fit.b) }
                : null;
        default:
            return null;
    }
}


export default function InteractiveGraphView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const axisConfig = node.attrs.axisConfig as GraphAxisConfig;
    const interaction = node.attrs.interaction as GraphInteraction;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isEditable = editor.isEditable;

    const isDisplay = interaction.type === 'display';

    // Numbering matches the renderer: graded questions only. A display-mode
    // interactive_graph is ungraded content and doesn't consume a number, so it
    // is skipped both when counting prior blocks and when displaying its own.
    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    const setAxis = (patch: Partial<GraphAxisConfig>): void =>
        updateAttributes({ axisConfig: { ...axisConfig, ...patch } });

    // Author drags handles → the answer. plot_point: the handles ARE the correct
    // points. plot_function: fit the family curve through the handles and store
    // its parameters (any handles on the same line give the same answer).
    const onPointsChange = (points: [number, number][]): void => {
        if (interaction.type === 'plot_point') {
            updateAttributes({ interaction: { ...interaction, correctPoints: points } });
        } else if (interaction.type === 'shade_region') {
            updateAttributes({
                interaction: {
                    type: 'shade_region',
                    regions: [{ ...firstRegion(interaction.regions), correctVertices: points }],
                },
            });
        } else if (interaction.type === 'plot_function') {
            const next = fittedToModel(firstModel(interaction.models), points);
            if (next) {
                updateAttributes({
                    // Preserve any domain — a curve-handle drag reshapes the
                    // curve, not its bounds (the endpoints re-project onto it).
                    interaction: {
                        type: 'plot_function',
                        models: [next],
                        ...(interaction.domains && { domains: interaction.domains }),
                    },
                });
            }
        } else if (interaction.type === 'graph_inequality') {
            const cur = firstInequality(interaction.inequalities);
            const next = fittedToModel(cur.boundary, points);
            if (next) {
                updateAttributes({
                    interaction: {
                        type: 'graph_inequality',
                        inequalities: [{ ...cur, boundary: next }],
                    },
                });
            }
        }
        // plot_ray / plot_segment moves arrive through onLinearChange (which
        // carries the shape + styles alongside the points) — nothing to do here.
    };

    // Bounded plot_function authoring: the endpoint handles / Start-End pills
    // report the current bound; fold it into domains[0] (leaving the model and
    // the untouched side alone).
    const onDomainChange = (domain: {
        min?: number;
        minStyle?: 'open' | 'closed';
        max?: number;
        maxStyle?: 'open' | 'closed';
    }): void => {
        if (interaction.type !== 'plot_function') return;
        const prev = interaction.domains?.[0] ?? {};
        updateAttributes({
            interaction: {
                type: 'plot_function',
                models: interaction.models,
                domains: [{ ...prev, ...domain }],
            },
        });
    };

    // Ray/segment authoring: the shared shape-toggle controls report the full
    // drawn figure; convert it to the matching interaction. Choosing "Segment"
    // on a ray answer (or vice versa) swaps the stored TYPE — the schema keeps
    // its two distinct interactions while the authoring UX is one surface.
    const onLinearChange = (out: {
        points: [number, number][];
        shape: 'ray_positive' | 'ray_negative' | 'segment' | null;
        rayEndpointStyle: 'open' | 'closed';
        segStyles: ['open' | 'closed', 'open' | 'closed'];
    }): void => {
        if (interaction.type !== 'plot_ray' && interaction.type !== 'plot_segment') return;
        if (out.shape === null || out.points.length < 2) return;
        const tolerance =
            interaction.type === 'plot_ray'
                ? firstRay(interaction.rays).tolerance
                : firstSegment(interaction.segments).tolerance;
        const [a, b] = out.points as [[number, number], [number, number]];
        const aLesser = a[0] !== b[0] ? a[0] < b[0] : a[1] <= b[1];
        const lesser = aLesser ? a : b;
        const greater = aLesser ? b : a;
        if (out.shape === 'segment') {
            updateAttributes({
                interaction: {
                    type: 'plot_segment',
                    segments: [{ from: lesser, to: greater, endpoints: out.segStyles, tolerance }],
                },
            });
            return;
        }
        // Ray: the key's from = the endpoint (opposite the arrow), through =
        // the other handle — the direction falls out of the shape choice.
        const [from, through] =
            out.shape === 'ray_positive' ? [lesser, greater] : [greater, lesser];
        updateAttributes({
            interaction: {
                type: 'plot_ray',
                rays: [{ from, through, fromStyle: out.rayEndpointStyle, tolerance }],
            },
        });
    };

    const switchType = (type: InteractionType): void => {
        if (type === interaction.type) return;
        const next =
            type === 'plot_function'
                ? defaultFunctionInteraction()
                : type === 'graph_inequality'
                  ? defaultInequalityInteraction()
                  : type === 'shade_region'
                  ? defaultRegionInteraction()
                  : type === 'plot_ray'
                    ? defaultRayInteraction()
                    : type === 'plot_segment'
                      ? defaultSegmentInteraction()
                      : type === 'display'
                        ? defaultDisplayInteraction()
                        : defaultPointInteraction();
        updateAttributes({ interaction: next });
    };

    // shade_region: add/remove polygon vertices (3..6).
    const setVertexCount = (next: number): void => {
        if (interaction.type !== 'shade_region') return;
        const n = Math.max(3, Math.min(next, 6));
        const region = firstRegion(interaction.regions);
        const cur = region.correctVertices;
        if (n === cur.length) return;
        const verts =
            n < cur.length
                ? cur.slice(0, n)
                : [...cur, ...Array.from({ length: n - cur.length }, (_, i) => [cur.length + i, 0] as [number, number])];
        updateAttributes({ interaction: { type: 'shade_region', regions: [{ ...region, correctVertices: verts }] } });
    };

    const setPointCount = (next: number): void => {
        if (interaction.type !== 'plot_point') return;
        const n = Math.max(1, Math.min(next, 6));
        const cur = interaction.correctPoints;
        if (n === cur.length) return;
        const points =
            n < cur.length
                ? cur.slice(0, n)
                : [...cur, ...Array.from({ length: n - cur.length }, (_, i) => [cur.length + i, 0] as [number, number])];
        updateAttributes({ interaction: { ...interaction, correctPoints: points } });
    };

    // Mistake feedback (Drop B): authored anticipated mistakes + helpers. The
    // match string uses the same freeform syntax as the answer field; a bad one
    // gets an inline warning but is still stored (it compiles to never-matching
    // in the kit, so it can't break a page).
    // Formula-apply epoch: bumping remounts the author board so handles +
    // shape pills jump to the typed answer (drags never bump it).
    const [formulaEpoch, setFormulaEpoch] = useState(0);

    const mistakeEntries = (node.attrs.mistakeFeedback ?? []) as GraphMistakeEntry[];
    const setMistakeEntry = (i: number, entry: GraphMistakeEntry): void => {
        updateAttributes({
            mistakeFeedback: mistakeEntries.map((m, j) => (j === i ? entry : m)),
        });
    };
    const removeMistakeEntry = (i: number): void => {
        updateAttributes({ mistakeFeedback: mistakeEntries.filter((_, j) => j !== i) });
    };
    const addMistakeEntry = (): void => {
        updateAttributes({
            mistakeFeedback: [...mistakeEntries, { match: '', feedback: [] }],
        });
    };
    const mistakeMatchPlaceholder =
        interaction.type === 'plot_point'
            ? '(4, 3)'
            : interaction.type === 'graph_inequality'
              ? 'y < 2x + 1  (or a boundary like y = 2x + 1)'
              : interaction.type === 'plot_ray' || interaction.type === 'plot_segment'
                ? 'ray (1, 2) through (3, 4)  or  segment (1, 2) to (3, 4)'
                : 'y = x + 2';
    const mistakeMatchError = (raw: string): string | null => {
        if (raw.trim() === '') return 'Type the wrong answer to watch for.';
        if (interaction.type === 'plot_point') {
            return parsePointList(raw) ? null : 'Type coordinates, like (4, 3)';
        }
        if (interaction.type === 'plot_ray' || interaction.type === 'plot_segment') {
            // Either figure is a valid anticipated mistake on either question
            // (the classic ray mistake IS the segment version of it).
            const parsed = parseRaySegment(raw);
            return parsed.kind === 'error' ? parsed.message : null;
        }
        const parsed = parseGraphFormula(raw);
        if (parsed.kind === 'error') return parsed.message;
        if (interaction.type === 'plot_function' && parsed.kind !== 'function') {
            return 'Type an equation, like y = x + 2';
        }
        if (
            interaction.type === 'graph_inequality' &&
            parsed.kind !== 'inequality' &&
            parsed.kind !== 'function'
        ) {
            return 'Type an inequality (y < 2x + 1) or a boundary equation (y = 2x + 1)';
        }
        return null;
    };

    // Narrow-column advisory: a graph inside a 3+-column layout renders very
    // cramped (the board floors at a minimum width and scrolls). Non-blocking —
    // mirrors the schema's "warn above 3" intent. Resolved from the live doc so
    // it tracks add/remove-column immediately.
    const columnsCount = ((): number => {
        try {
            const pos = getPos();
            if (typeof pos !== 'number') return 0;
            const $pos = editor.state.doc.resolve(pos);
            for (let d = $pos.depth; d > 0; d--) {
                if ($pos.node(d).type.name === 'columns') return $pos.node(d).childCount;
            }
        } catch {
            // resolving during a transaction race → no warning this render
        }
        return 0;
    })();

    const answerText =
        interaction.type === 'plot_point'
            ? formatPoints(interaction.correctPoints)
            : interaction.type === 'shade_region'
              ? formatPoints(firstRegion(interaction.regions).correctVertices)
              : interaction.type === 'plot_function'
                ? formatModel(firstModel(interaction.models)) + formatCurveDomain(interaction.domains?.[0])
                : interaction.type === 'graph_inequality'
                  ? formatInequality(firstInequality(interaction.inequalities))
                  : interaction.type === 'plot_ray'
                    ? formatRay(firstRay(interaction.rays))
                    : interaction.type === 'plot_segment'
                      ? formatSegment(firstSegment(interaction.segments))
                      : '';

    // The freeform answer field (Drop 3): type an equation/coordinates in ANY
    // format → parse → the answer + handles update. Applied on Enter or blur.
    const applyFormula = (raw: string): string | null => {
        const err = applyFormulaInner(raw);
        if (err === null) setFormulaEpoch((e) => e + 1);
        return err;
    };

    const applyFormulaInner = (raw: string): string | null => {
        if (interaction.type === 'plot_point') {
            const points = parsePointList(raw);
            if (!points) return 'Type coordinates, like (2, 3) or (1, 2), (3, 4)';
            updateAttributes({ interaction: { ...interaction, correctPoints: points } });
            return null;
        }
        if (interaction.type === 'shade_region') {
            const points = parsePointList(raw);
            if (!points || points.length < 3) return 'Type at least 3 vertices, like (0, 0), (4, 0), (2, 4)';
            updateAttributes({
                interaction: { type: 'shade_region', regions: [{ ...firstRegion(interaction.regions), correctVertices: points }] },
            });
            return null;
        }
        if (interaction.type === 'graph_inequality') {
            const parsed = parseGraphFormula(raw);
            if (parsed.kind === 'error') return parsed.message;
            if (parsed.kind !== 'inequality') {
                return 'Type an inequality, like y > 2x + 1 (use <, <=, > or >=)';
            }
            updateAttributes({
                interaction: {
                    type: 'graph_inequality',
                    inequalities: [
                        {
                            boundary: parsed.boundary as FunctionModelAttr,
                            strict: parsed.strict,
                            shadeSide: parsed.side,
                        },
                    ],
                },
            });
            return null;
        }
        if (interaction.type === 'plot_ray' || interaction.type === 'plot_segment') {
            // Two bare points ("(1, 2), (3, 4)" — what math mode can express)
            // keep the current figure + endpoint styles; only the command
            // syntax names a kind and can swap it.
            const pts = parsePointList(raw);
            if (pts && pts.length === 2) {
                const [a, b] = pts as [[number, number], [number, number]];
                if (a[0] === b[0] && a[1] === b[1]) return 'The two points must be different';
                if (interaction.type === 'plot_ray') {
                    const prev = firstRay(interaction.rays);
                    updateAttributes({
                        interaction: { type: 'plot_ray', rays: [{ ...prev, from: a, through: b }] },
                    });
                } else {
                    const prev = firstSegment(interaction.segments);
                    updateAttributes({
                        interaction: { type: 'plot_segment', segments: [{ ...prev, from: a, to: b }] },
                    });
                }
                return null;
            }
            // One authoring surface for both figures: typing either kind just
            // swaps the stored interaction type (like the shape pills do).
            const parsed = parseRaySegment(raw);
            if (parsed.kind === 'error') return parsed.message;
            const tolerance =
                interaction.type === 'plot_ray'
                    ? firstRay(interaction.rays).tolerance
                    : firstSegment(interaction.segments).tolerance;
            if (parsed.kind === 'ray') {
                updateAttributes({
                    interaction: {
                        type: 'plot_ray',
                        rays: [{ from: parsed.from, through: parsed.through, fromStyle: parsed.fromStyle, tolerance }],
                    },
                });
            } else {
                updateAttributes({
                    interaction: {
                        type: 'plot_segment',
                        segments: [{ from: parsed.from, to: parsed.to, endpoints: parsed.endpoints, tolerance }],
                    },
                });
            }
            return null;
        }
        if (interaction.type === 'plot_function') {
            const parsed = parseGraphFormula(raw);
            if (parsed.kind === 'error') return parsed.message;
            if (parsed.kind === 'points') return 'That looks like coordinates — switch the question type to "Plot a point"';
            if (parsed.kind === 'inequality') {
                // Graded inequalities are their own interaction (Drop 4); steer there.
                return 'That is an inequality — switch the question type to "Graph an inequality"';
            }
            const prev = firstModel(interaction.models);
            // Same family → keep the teacher's tuned tolerances; new family → defaults.
            let model = parsed.model as FunctionModelAttr;
            if (model.family === prev.family) {
                const tolerances = Object.fromEntries(
                    Object.entries(prev).filter(([k]) => k.endsWith('Tolerance')),
                );
                model = { ...model, ...tolerances } as FunctionModelAttr;
            }
            if (parsed.domain) {
                // Unified authoring: a domain clause makes a BOUNDED curve. A
                // linear/vertical bound is a ray/segment (route to the pills
                // mechanic); a curved family stays plot_function + domains[]
                // (the endpoint-handle mechanic).
                if (model.family === 'vertical') {
                    return 'A vertical line can’t take an x-range. For a vertical segment, type "segment (4, 1) to (4, 5)".';
                }
                if (model.family === 'linear') {
                    updateAttributes({
                        interaction: linearDomainToRayOrSegment(model, parsed.domain),
                    });
                    return null;
                }
                updateAttributes({
                    interaction: {
                        type: 'plot_function',
                        models: [model],
                        domains: [toCurveDomain(parsed.domain)],
                    },
                });
                return null;
            }
            updateAttributes({
                interaction: {
                    // No clause → a full (unbounded) curve; drop any prior domain.
                    type: 'plot_function',
                    models: [model],
                },
            });
            return null;
        }
        return null;
    };

    // Replace this display graph's drawables (used by the drawable-list editor).
    const setDrawables = (drawables: DrawableAttr[]): void => {
        if (interaction.type !== 'display') return;
        updateAttributes({ interaction: { type: 'display', drawables } });
    };

    return (
        <NodeViewWrapper
            className={`interactive-graph-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {isDisplay ? 'Static graph' : `${problemNumber}. Interactive graph`}
                    </strong>
                    <label style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {' '}Type:{' '}
                        <select
                            // plot_ray and plot_segment share ONE picker entry — the
                            // teacher chooses the actual figure with the same shape
                            // pills students get, which silently swaps the stored
                            // interaction type.
                            value={interaction.type === 'plot_segment' ? 'plot_ray' : interaction.type}
                            disabled={!isEditable}
                            onChange={(e) => switchType(e.target.value as InteractionType)}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <option value="plot_point">Plot a point</option>
                            <option value="plot_function">Plot a function</option>
                            <option value="graph_inequality">Graph an inequality</option>
                            <option value="plot_ray">Draw a ray or segment</option>
                            <option value="shade_region">Shade a region</option>
                            <option value="display">Display (static graph)</option>
                        </select>
                    </label>
                </div>

                {interaction.type === 'display' ? (
                    <>
                        <DisplayPreviewBoard
                            axisConfig={axisConfig}
                            drawables={interaction.drawables}
                        />
                        <DrawableListEditor
                            drawables={interaction.drawables}
                            disabled={!isEditable}
                            onChange={setDrawables}
                        />
                    </>
                ) : (
                    <>
                        {columnsCount >= 3 && (
                            <p role="status" style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '0.25rem 0.5rem' }}>
                                This graph sits in a {columnsCount}-column layout — it may be cramped
                                on paper or a Chromebook. Two columns (or full width) reads better.
                            </p>
                        )}
                        <GraphAuthorBoard
                            axisConfig={axisConfig}
                            interaction={interaction}
                            onPointsChange={onPointsChange}
                            onLinearChange={onLinearChange}
                            onDomainChange={onDomainChange}
                            formulaEpoch={formulaEpoch}
                        />

                        <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                            {interaction.type === 'plot_point'
                                ? `Drag the ${interaction.correctPoints.length > 1 ? 'points' : 'point'} — or type the answer below. `
                                : interaction.type === 'shade_region'
                                  ? 'Drag the vertices to shape the correct region — or type them below. '
                                  : interaction.type === 'graph_inequality'
                                    ? 'Type the inequality below — the sign sets dotted/solid and the shaded side. Drag the handles to move the boundary. '
                                    : interaction.type === 'plot_ray' || interaction.type === 'plot_segment'
                                      ? 'Drag the two handles, then use the buttons on the graph to choose ray or segment and open/closed endpoints — exactly what students will do. Or type it below. '
                                      : 'Drag the handles — or type the equation below in any format. Add a range (e.g. "for -2 <= x <= 3") to bound the curve; a straight line with a range becomes a ray or segment. '}
                        </p>
                        <FormulaField
                            // Remount on question-type switch so the input mode
                            // re-derives from the new type's preference group
                            // (state would otherwise carry math-mode onto a
                            // ray/segment answer, or vice versa).
                            key={`answer:${interaction.type === 'plot_segment' ? 'plot_ray' : interaction.type}`}
                            label="Answer:"
                            value={answerText}
                            disabled={!isEditable}
                            placeholder={
                                interaction.type === 'plot_point'
                                    ? '(2, 3)'
                                    : interaction.type === 'shade_region'
                                      ? '(0, 0), (4, 0), (2, 4)'
                                      : interaction.type === 'graph_inequality'
                                        ? 'y > 2x + 1   ·   y <= x^2   ·   x >= 3'
                                        : interaction.type === 'plot_ray' || interaction.type === 'plot_segment'
                                          ? 'ray (1, 2) through (3, 4) open   ·   segment (1, 2) to (3, 4)'
                                          : 'y = 2x + 3   ·   x^2 - 4   ·   y = x^2 - 4 for -2 <= x <= 3   ·   x = 4'
                            }
                            onApply={applyFormula}
                            // Math mode (LaTeX-rendered input) is the default for
                            // notation the field can express; ray/segment default
                            // to text because the command words aren't math — in
                            // math mode they author as just the two points (the
                            // question type already names the figure).
                            modeKey={`answer:${interaction.type === 'plot_segment' ? 'plot_ray' : interaction.type}`}
                            defaultMode={
                                interaction.type === 'plot_ray' || interaction.type === 'plot_segment'
                                    ? 'text'
                                    : 'math'
                            }
                            mathValue={
                                interaction.type === 'plot_ray'
                                    ? formatPoints([firstRay(interaction.rays).from, firstRay(interaction.rays).through])
                                    : interaction.type === 'plot_segment'
                                      ? formatPoints([firstSegment(interaction.segments).from, firstSegment(interaction.segments).to])
                                      : undefined
                            }
                        />
                    </>
                )}

                {interaction.type === 'plot_point' && (
                    <label style={{ display: 'inline-block', marginTop: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        Points students plot:{' '}
                        <input
                            type="number"
                            min={1}
                            max={6}
                            value={interaction.correctPoints.length}
                            disabled={!isEditable}
                            style={{ width: '3rem' }}
                            onChange={(e) => setPointCount(Math.trunc(num(e.target.value, 1)))}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                )}
                {interaction.type === 'shade_region' && (
                    <label style={{ display: 'inline-block', marginTop: '0.35rem', fontSize: '0.8rem', color: '#475569' }}>
                        Polygon vertices:{' '}
                        <input
                            type="number"
                            min={3}
                            max={6}
                            value={firstRegion(interaction.regions).correctVertices.length}
                            disabled={!isEditable}
                            style={{ width: '3rem' }}
                            onChange={(e) => setVertexCount(Math.trunc(num(e.target.value, 3)))}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </label>
                )}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
                <span
                    contentEditable={false}
                    style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#94a3b8' }}
                >
                    {isDisplay ? 'Caption (optional)' : 'Question prompt'}
                </span>
                <NodeViewContent className="interactive-graph-block__prompt" />
            </div>

            {(isEditable || solution.length > 0 || hasConfidenceRating) && (
                <div contentEditable={false} style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                    <button
                        type="button"
                        onClick={() => setSettingsOpen((o) => !o)}
                        aria-expanded={settingsOpen}
                        disabled={!isEditable}
                        style={{ fontSize: '0.8rem', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <span aria-hidden="true">⚙</span> Advanced settings
                    </button>
                    {settingsOpen && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#334155' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                                {(['xMin', 'xMax', 'yMin', 'yMax'] as const).map((k) => (
                                    <label key={k} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        {k}
                                        <input
                                            type="number"
                                            value={axisConfig[k]}
                                            disabled={!isEditable}
                                            style={{ width: '3.5rem' }}
                                            onChange={(e) => setAxis({ [k]: num(e.target.value, axisConfig[k]) })}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                ))}
                                {(['xGridStep', 'yGridStep'] as const).map((k) => (
                                    <label key={k} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        {k === 'xGridStep' ? 'x grid' : 'y grid'}
                                        <input
                                            type="number"
                                            min={0.1}
                                            step={0.5}
                                            value={axisConfig[k]}
                                            disabled={!isEditable}
                                            style={{ width: '3.5rem' }}
                                            onChange={(e) => {
                                                const v = num(e.target.value, axisConfig[k]);
                                                if (v > 0) setAxis({ [k]: v });
                                            }}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    <input type="checkbox" checked={axisConfig.showGrid} disabled={!isEditable}
                                        onChange={(e) => setAxis({ showGrid: e.target.checked })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                    Show grid
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    <input type="checkbox" checked={axisConfig.snapToGrid} disabled={!isEditable}
                                        onChange={(e) => setAxis({ snapToGrid: e.target.checked })}
                                        onKeyDown={(e) => e.stopPropagation()} />
                                    Snap to grid
                                </label>
                            </div>

                            {/* Tolerance / strictness — differs by interaction. Slider + numeric. */}
                            {interaction.type === 'plot_point' && (
                                <ToleranceRow
                                    label="Tolerance"
                                    value={interaction.tolerance}
                                    disabled={!isEditable}
                                    onChange={(v) => updateAttributes({ interaction: { ...interaction, tolerance: v } })}
                                />
                            )}
                            {interaction.type === 'plot_function' &&
                                // One row per tolerance the current family carries
                                // (slope/intercept for linear, a/b/c for quadratic, …).
                                Object.entries(firstModel(interaction.models))
                                    .filter(([k, v]) => k.endsWith('Tolerance') && typeof v === 'number')
                                    .map(([k, v]) => (
                                        <ToleranceRow
                                            key={k}
                                            label={
                                                k.slice(0, -'Tolerance'.length).charAt(0).toUpperCase() +
                                                k.slice(1, -'Tolerance'.length) +
                                                ' tolerance'
                                            }
                                            value={v as number}
                                            disabled={!isEditable}
                                            onChange={(val) =>
                                                updateAttributes({
                                                    interaction: {
                                                        type: 'plot_function',
                                                        models: [{ ...firstModel(interaction.models), [k]: val } as FunctionModelAttr],
                                                    },
                                                })
                                            }
                                        />
                                    ))}
                            {(interaction.type === 'plot_ray' || interaction.type === 'plot_segment') && (
                                <ToleranceRow
                                    label="Endpoint tolerance"
                                    value={
                                        interaction.type === 'plot_ray'
                                            ? firstRay(interaction.rays).tolerance
                                            : firstSegment(interaction.segments).tolerance
                                    }
                                    disabled={!isEditable}
                                    onChange={(v) =>
                                        updateAttributes({
                                            interaction:
                                                interaction.type === 'plot_ray'
                                                    ? { type: 'plot_ray', rays: [{ ...firstRay(interaction.rays), tolerance: v }] }
                                                    : { type: 'plot_segment', segments: [{ ...firstSegment(interaction.segments), tolerance: v }] },
                                        })
                                    }
                                />
                            )}
                            {interaction.type === 'shade_region' && (
                                <ToleranceRow
                                    label="Min. overlap (IoU)"
                                    value={firstRegion(interaction.regions).minOverlap}
                                    max={1}
                                    disabled={!isEditable}
                                    onChange={(v) =>
                                        updateAttributes({
                                            interaction: {
                                                type: 'shade_region',
                                                regions: [
                                                    { ...firstRegion(interaction.regions), minOverlap: Math.min(1, Math.max(0, v)) },
                                                ],
                                            },
                                        })
                                    }
                                />
                            )}

                            {/* A static display graph is ungraded — no worked
                                solution and no confidence rating. */}
                            {!isDisplay && (
                                <>
                                    <div>
                                        <span style={{ display: 'block', marginBottom: '0.2rem' }}>Worked solution</span>
                                        <InlineRichTextEditor
                                            value={solution}
                                            onChange={(nodes) => updateAttributes({ solution: nodes.length > 0 ? nodes : null })}
                                            ariaLabel="Worked solution"
                                        />
                                    </div>

                                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={hasConfidenceRating}
                                            disabled={!isEditable}
                                            onChange={(e) => updateAttributes({ hasConfidenceRating: e.target.checked })}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        Ask for a confidence rating
                                    </label>

                                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(node.attrs.partialCredit)}
                                            disabled={!isEditable}
                                            onChange={(e) => updateAttributes({ partialCredit: e.target.checked })}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        Partial credit (score each part separately)
                                    </label>

                                    <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(node.attrs.allowNoSolution)}
                                            disabled={!isEditable}
                                            onChange={(e) => updateAttributes({ allowNoSolution: e.target.checked })}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        Offer a “cannot be graphed / no solution” choice
                                    </label>

                                    {Boolean(node.attrs.allowNoSolution) && (
                                        <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginLeft: '1.2rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={Boolean(node.attrs.noSolutionCorrect)}
                                                disabled={!isEditable}
                                                onChange={(e) => updateAttributes({ noSolutionCorrect: e.target.checked })}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                            “No solution” IS the correct answer (trick question)
                                        </label>
                                    )}

                                    {/* Mistake feedback (Drop B): built-in classifier toggle +
                                        authored anticipated mistakes. The match uses the SAME
                                        freeform syntax as the answer field; feedback is rich
                                        (the blank-hint editor). */}
                                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                                        <span style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>Mistake feedback</span>
                                        <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={node.attrs.builtinFeedback !== false}
                                                disabled={!isEditable}
                                                onChange={(e) => updateAttributes({ builtinFeedback: e.target.checked })}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                            Built-in nudges for common mistakes (swapped coordinates, wrong side, …)
                                        </label>
                                        {mistakeEntries.map((entry, i) => (
                                            <div key={i} style={{ marginTop: '0.4rem', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>If the answer is</span>
                                                    <input
                                                        type="text"
                                                        value={entry.match}
                                                        disabled={!isEditable}
                                                        placeholder={mistakeMatchPlaceholder}
                                                        spellCheck={false}
                                                        style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}
                                                        onChange={(e) => setMistakeEntry(i, { ...entry, match: e.target.value })}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={!isEditable}
                                                        onClick={() => removeMistakeEntry(i)}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.78rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                {mistakeMatchError(entry.match) && (
                                                    <p role="status" style={{ margin: 0, fontSize: '0.72rem', color: '#b45309' }}>
                                                        {mistakeMatchError(entry.match)}
                                                    </p>
                                                )}
                                                <InlineRichTextEditor
                                                    value={entry.feedback}
                                                    onChange={(nodes) => setMistakeEntry(i, { ...entry, feedback: nodes })}
                                                    ariaLabel={`Feedback for anticipated mistake ${i + 1}`}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={!isEditable}
                                            onClick={addMistakeEntry}
                                            style={{ marginTop: '0.35rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: 4, background: '#f8fafc', cursor: 'pointer', color: '#334155' }}
                                        >
                                            + Anticipated mistake
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}

// A tolerance control: slider + numeric input side by side (author preference).
function ToleranceRow({
    label,
    value,
    disabled,
    onChange,
    max = 2,
}: {
    label: string;
    value: number;
    disabled: boolean;
    onChange: (v: number) => void;
    max?: number;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ minWidth: '9rem' }}>{label}</span>
            <input
                type="range"
                min={0}
                max={max}
                step={0.05}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(num(e.target.value, value))}
            />
            <input
                type="number"
                min={0}
                step={0.05}
                value={value}
                disabled={disabled}
                style={{ width: '4rem' }}
                onChange={(e) => {
                    const v = num(e.target.value, value);
                    if (v >= 0) onChange(v);
                }}
                onKeyDown={(e) => e.stopPropagation()}
            />
        </div>
    );
}

// ---- Display (static graph) authoring --------------------------------------

// A read-only preview of the authored figure — the SAME kit board (mountGraph-
// Display) students see, so "what the teacher sets is what the student gets."
// Remounts whenever the axis or the drawables change (a static board is cheap to
// rebuild; there is no drag state to preserve).
function DisplayPreviewBoard({
    axisConfig,
    drawables,
}: {
    axisConfig: GraphAxisConfig;
    drawables: DrawableAttr[];
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const key = useMemo(
        () => JSON.stringify([axisConfig, drawables]),
        [axisConfig, drawables],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0;';
        host.appendChild(el);
        let handle: GraphDisplayHandle | null = null;
        let disposed = false;
        void mountGraphDisplay(el, { axisConfig, drawables }).then((h) => {
            if (disposed) { h.destroy(); return; }
            handle = h;
        });
        return () => {
            disposed = true;
            handle?.destroy();
            el.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <div
            ref={hostRef}
            aria-label="Static graph preview"
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '22rem',
                aspectRatio: '1 / 1',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                background: '#fff',
            }}
        />
    );
}

