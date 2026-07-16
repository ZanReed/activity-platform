import type {
    FunctionModelAttr,
    InequalityAnswerAttr,
    LinearFunctionModel,
    RayAnswerAttr,
    RegionAnswerAttr,
    SegmentAnswerAttr,
} from '../extensions/InteractiveGraph';

// ============================================================================
// graphAnswerHelpers — pure "first answer, or a default" accessors for the
// interactive_graph answer shapes.
// ----------------------------------------------------------------------------
// plot_function / shade_region / graph_inequality / plot_ray / plot_segment
// each carry an ARRAY of answer objects (systems); the current authoring UI
// edits a SINGLE curve/region/… — index [0]. These accessors coerce an
// absent (or, for models, non-linear) first entry to a sensible default.
//
// Extracted to a leaf module because BOTH the NodeView (board/answer logic) and
// GraphSettings (the drawer settings panel) need them — sharing here keeps one
// source of truth and a clean import direction (both import this leaf, no
// dependency on the 1000-line NodeView). Pure: no React, no editor, no I/O.
// ============================================================================

// The function UI is linear-only; other families arrive via freeform equation
// entry with their own UI, so coerce a non-linear/absent models[0] to a
// default linear line here.
export const DEFAULT_LINEAR: LinearFunctionModel = {
    family: 'linear',
    slope: 1,
    intercept: 0,
    slopeTolerance: 0.1,
    interceptTolerance: 0.1,
};

export function firstModel(models: FunctionModelAttr[]): FunctionModelAttr {
    return models[0] ?? DEFAULT_LINEAR;
}

export function firstRegion(regions: RegionAnswerAttr[]): RegionAnswerAttr {
    return regions[0] ?? { correctVertices: [], minOverlap: 0.9 };
}

export function firstInequality(
    list: InequalityAnswerAttr[],
): InequalityAnswerAttr {
    return list[0] ?? { boundary: DEFAULT_LINEAR, strict: true, shadeSide: 'above' };
}

export function firstRay(rays: RayAnswerAttr[]): RayAnswerAttr {
    return (
        rays[0] ?? {
            from: [0, 0],
            through: [3, 3],
            fromStyle: 'closed',
            tolerance: 0.25,
        }
    );
}

export function firstSegment(list: SegmentAnswerAttr[]): SegmentAnswerAttr {
    return (
        list[0] ?? {
            from: [-2, 0],
            to: [3, 2],
            endpoints: ['closed', 'closed'],
            tolerance: 0.25,
        }
    );
}
