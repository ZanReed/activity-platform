// =============================================================================
// capabilityFacts.ts — the DERIVED half of the curriculum's capability registry
// -----------------------------------------------------------------------------
// The curriculum graph carries a `capabilities` list that bounds what may be
// authored (their §9: "Draft only with capabilities marked shipped"). Each
// entry has two kinds of field:
//
//   DERIVED  — `status` and `grading.{scoring, captures_response, score_shape}`.
//              They restate what this repo's code already knows, so THIS module
//              owns them: it reads the importer's fence registry and the schema
//              and computes them.
//   AUTHORED — `label`, `medium`, `affords`, `constraints`, `grading.note`.
//              The curriculum side's prose. Never computed here.
//
// `pnpm facts:capabilities` writes the result to docs/capability-facts.json.
// The curriculum repo commits a PINNED copy of that file (with this repo's
// commit and its sha256 beside it) and its CI fails when the graph's derived
// fields disagree with the pin; a scheduled job there reports when our `main`
// has moved past the pin. Bumping the pin is how a capability's status flips.
// (B14 rebuild, rulings in TODOS → B14 and their decision log; the July
// generator this replaces imported our TS from a sibling folder, which their
// CI could never run.)
//
// The JOIN below is the one hand-written part: which capability a fence or
// inline grammar backs. Everything a join CLAIMS about the code is asserted in
// capabilityFactsProblems(), and capabilityFacts.test.ts fails on any problem,
// so a fence added to the importer without a capability goes red here rather
// than silently missing from the curriculum's registry.
// =============================================================================

import {
    BlankResponse,
    ChoiceResponse,
    DataPlotDotplotResponse,
    FreeResponse,
    FunctionModel,
    GraphResponseV4,
    MatchResponse,
    NumberLinePointResponse,
    OrderResponse,
    isGradeable,
    type Block,
} from '@activity/schema';
import { BLANK_MODIFIERS, FENCES } from './importFormatRegistry';

/** `grading.scoring` values. */
export const SCORING = ['auto', 'rubric', 'none'] as const;
/** `grading.score_shape` values — the curriculum side's vocabulary (8 values
 *  since `per_cell`, their ruling on B-30 Q3). `unknown` is only ever authored,
 *  on a proposed capability; this module never derives it. */
export const SCORE_SHAPES = [
    'boolean',
    'fraction',
    'per_pair',
    'per_cell',
    'per_gap',
    'per_criterion',
    'none',
    'unknown',
] as const;

type Scoring = (typeof SCORING)[number];
type ScoreShape = (typeof SCORE_SHAPES)[number];

/** Fences that back no capability, each with the reason. */
export const EXEMPT_FENCES: Record<string, string> = {
    meta: 'activity settings, not a capability',
    'teacher-guide': 'teacher-only activity annotation, not a student capability (D50)',
};

// ---- the join ----------------------------------------------------------------
// `fence`: the importer fence tag (must exist in FENCES). `inline`: a grammar
// the parser handles outside any fence. `schema`: what in the schema backs a
// capability that has neither (a graph interaction or curve family).
// `probe`: a minimal block of the type a successful import produces, fed to the
// schema's isGradeable() to derive captures_response (null = contributes no
// block, so nothing is captured). `shape`: derived from `response` when
// omitted; DECLARED where the response schema cannot say it (per-gap,
// per-criterion, per-cell — those are counted by the server grader, not
// carried on a typed response), and each declared shape has an assertion below.
interface Join {
    fence?: string;
    inline?: string;
    schema?: string;
    probe: Record<string, unknown> | null;
    scoring: Scoring;
    response?: ZodLike;
    shape?: ScoreShape;
}

const zr = (schema: unknown): ZodLike => schema as ZodLike;

const graphProbe = (interaction: string) => ({
    type: 'interactive_graph',
    interaction: { type: interaction },
});

export const JOIN: Record<string, Join> = {
    fill_blank: { inline: 'blanks', probe: { type: 'fill_in_blank' }, scoring: 'auto', response: zr(BlankResponse) },
    gap_equation: { inline: 'gap', probe: { type: 'math_block', prompts: [{}] }, scoring: 'auto', response: zr(BlankResponse) },
    // One student-facing affordance, two authoring paths: `[[term :: meaning]]`
    // inline and the ```definitions fence. Neither adds a gradeable block.
    definition: { inline: 'definition', fence: 'definitions', probe: null, scoring: 'none' },
    graph: { fence: 'graph', probe: graphProbe('plot_function'), scoring: 'auto', shape: 'fraction' },
    // Not fences: a graph interaction and a pair of curve families. Both are
    // reached through the ```graph fence and graded by the graph scorers.
    draggable_curve: { fence: 'graph', schema: 'interactive_graph interaction transform_curve', probe: graphProbe('transform_curve'), scoring: 'auto', shape: 'boolean' },
    graded_polynomial: { fence: 'graph', schema: 'FunctionModel families cubic, quartic', probe: graphProbe('plot_function'), scoring: 'auto', shape: 'fraction' },
    // Arrowhead Drop 2: a FREE vector, graded on displacement (id agreed with
    // the curriculum side in C-104; they write the row's prose in the pin bump).
    draw_vector: { fence: 'graph', schema: 'interactive_graph interaction plot_vector', probe: graphProbe('plot_vector'), scoring: 'auto', shape: 'boolean' },
    numberline: { fence: 'numberline', probe: { type: 'number_line' }, scoring: 'auto', response: zr(NumberLinePointResponse) },
    dataplot: { fence: 'dataplot', probe: { type: 'data_plot', interaction: { type: 'build_dotplot' } }, scoring: 'auto', response: zr(DataPlotDotplotResponse) },
    mc: { fence: 'mc', probe: { type: 'multiple_choice' }, scoring: 'auto', response: zr(ChoiceResponse) },
    match: { fence: 'match', probe: { type: 'matching' }, scoring: 'auto', response: zr(MatchResponse) },
    nway_correspondence: { fence: 'correspond', probe: { type: 'correspondence' }, scoring: 'auto', shape: 'per_cell' },
    order: { fence: 'order', probe: { type: 'ordering' }, scoring: 'auto', response: zr(OrderResponse) },
    worked: { fence: 'worked', probe: { type: 'worked_example' }, scoring: 'none' },
    faded: { fence: 'faded', probe: { type: 'faded_worked_example' }, scoring: 'auto', shape: 'per_gap' },
    objectives: { fence: 'objectives', probe: { type: 'learning_objectives' }, scoring: 'none' },
    explain: { fence: 'explain', probe: { type: 'self_explanation' }, scoring: 'none', response: zr(FreeResponse) },
    shortanswer: { fence: 'shortanswer', probe: { type: 'short_answer' }, scoring: 'rubric', shape: 'per_criterion' },
    essay: { fence: 'essay', probe: { type: 'essay' }, scoring: 'rubric', shape: 'per_criterion' },
    columns: { fence: 'columns', probe: { type: 'row' }, scoring: 'none' },
    // A table's blanks score as fill_blank; the table itself captures nothing
    // (an empty probe table has no blank cells, so isGradeable is false).
    table: { fence: 'table', probe: { type: 'table', rows: [] }, scoring: 'none' },
    callout: { fence: 'callout', probe: { type: 'callout' }, scoring: 'none' },
    reference: { fence: 'reference', probe: { type: 'graph_figure' }, scoring: 'none' },
    // Y7 geometry figures (ER-14). Display-only, like `reference`: the block
    // around it (a blank, an MC, a ```graph) carries the grading. Id confirmed
    // by the curriculum side (C-35, author-ruled 2026-10-03).
    figure: { fence: 'figure', probe: { type: 'graph_figure' }, scoring: 'none' },
    // Y7 charts. Display-only, the `figure` shape; the id was confirmed by the
    // curriculum side (C-45). Graded chart drawing (D8 slice 2) will be a
    // SEPARATE capability with its own id.
    chart: { fence: 'chart', probe: { type: 'chart' }, scoring: 'none' },
    // A data source, like `definition`: the blanks that read its values carry
    // the grading (their ruling on B-30 Q3).
    seeded_data: { fence: 'seed', probe: null, scoring: 'none' },
};

// ---- zod introspection ---------------------------------------------------------
// Structural, not `instanceof`: this package does not depend on zod (only
// @activity/schema does), so the schemas are read through zod 3's `_def`.
interface ZodLike {
    _def: { typeName?: string; shape?: () => Record<string, ZodLike>; options?: ZodLike[]; value?: unknown };
}
const kind = (schema: ZodLike | undefined): string => schema?._def.typeName ?? '';
const shapeOf = (schema: ZodLike): Record<string, ZodLike> =>
    kind(schema) === 'ZodObject' && schema._def.shape ? schema._def.shape() : {};
const isRequired = (schema: ZodLike, key: string): boolean => {
    const field = shapeOf(schema)[key];
    return field !== undefined && kind(field) !== 'ZodOptional';
};
const unionMembers = (schema: ZodLike): ZodLike[] =>
    kind(schema) === 'ZodDiscriminatedUnion' ? [...(schema._def.options ?? [])] : [];

/** score_shape read off the response schema that carries the answer. */
function shapeFromResponse(response: ZodLike): ScoreShape {
    if (isRequired(response, 'earned') && isRequired(response, 'total')) return 'per_pair';
    if (isRequired(response, 'correct')) return 'boolean';
    return 'none';
}

/** The graded curve families — the ground truth for any "graph grades …" prose. */
export function gradedCurveFamilies(): string[] {
    return unionMembers(FunctionModel as unknown as ZodLike)
        .map((member) => {
            const family = shapeOf(member).family;
            return kind(family) === 'ZodLiteral' ? String(family!._def.value) : '';
        })
        .filter((family) => family !== '');
}

// ---- derivation --------------------------------------------------------------------
export interface CapabilityFact {
    status: 'shipped';
    grading: {
        scoring: Scoring;
        captures_response: boolean;
        score_shape: ScoreShape;
    };
    reached_by: { fence?: string; inline?: string; schema?: string };
}

function derive(join: Join): CapabilityFact {
    const captures =
        join.probe === null ? false : isGradeable(join.probe as unknown as Block);
    let shape: ScoreShape = 'none';
    if (join.scoring !== 'none') {
        shape = join.shape ?? (join.response ? shapeFromResponse(join.response) : 'none');
    }
    const reachedBy: CapabilityFact['reached_by'] = {};
    if (join.fence) reachedBy.fence = join.fence;
    if (join.inline) reachedBy.inline = join.inline;
    if (join.schema) reachedBy.schema = join.schema;
    return {
        status: 'shipped',
        grading: { scoring: join.scoring, captures_response: captures, score_shape: shape },
        reached_by: reachedBy,
    };
}

/** Everything a join claims about the code that is no longer true. Empty when
 *  the join and the code agree; the test fails on any entry. */
export function capabilityFactsProblems(): string[] {
    const problems: string[] = [];
    const fenceTags = new Set(FENCES.map((fence) => fence.tag));
    for (const [id, join] of Object.entries(JOIN)) {
        if (join.fence && !fenceTags.has(join.fence))
            problems.push(`capability '${id}' maps to fence '${join.fence}', which the importer no longer registers.`);
        if (!join.fence && !join.inline)
            problems.push(`capability '${id}' has neither a fence nor an inline grammar — nothing reaches it.`);
    }
    const joined = new Set(Object.values(JOIN).map((join) => join.fence));
    for (const fence of FENCES) {
        if (!joined.has(fence.tag) && !(fence.tag in EXEMPT_FENCES))
            problems.push(`importer fence '${fence.tag}' backs no capability — add it to JOIN (the curriculum side writes its prose) or to EXEMPT_FENCES with a reason.`);
    }
    for (const tag of Object.keys(EXEMPT_FENCES)) {
        if (!fenceTags.has(tag)) problems.push(`exempt fence '${tag}' is no longer registered — drop the exemption.`);
        if (joined.has(tag)) problems.push(`fence '${tag}' is both exempt and joined.`);
    }
    if (BLANK_MODIFIERS.length === 0)
        problems.push('BLANK_MODIFIERS is empty — the {{blank}} grammar that backs fill_blank is gone?');
    // Declared shapes, each held to the code that justifies it.
    const families = gradedCurveFamilies();
    for (const family of ['cubic', 'quartic'])
        if (!families.includes(family))
            problems.push(`graded_polynomial claims the '${family}' family, which FunctionModel no longer has.`);
    const graphMembers = unionMembers(GraphResponseV4 as unknown as ZodLike);
    if (graphMembers.length === 0 || !graphMembers.every((member) => 'earned' in shapeOf(member) && 'total' in shapeOf(member)))
        problems.push('a graph response member lost earned/total — the graph capability\'s declared `fraction` shape is stale.');
    if (!isRequired(MatchResponse as unknown as ZodLike, 'earned'))
        problems.push('MatchResponse lost earned/total — the per_pair derivation is stale.');
    if ('correct' in shapeOf(FreeResponse as unknown as ZodLike))
        problems.push('FreeResponse grew a correct field — explain is no longer captured-but-unscored.');
    for (const [id, join] of Object.entries(JOIN)) {
        const fact = derive(join);
        if (join.scoring !== 'none' && !fact.grading.captures_response)
            problems.push(`capability '${id}' is scored but its probe is not gradeable — the probe or isGradeable() changed.`);
    }
    return problems;
}

/** The derived facts, in a stable order. */
export function capabilityFacts() {
    const capabilities: Record<string, CapabilityFact> = {};
    for (const id of Object.keys(JOIN).sort()) capabilities[id] = derive(JOIN[id]!);
    const exempt: Record<string, string> = {};
    for (const tag of Object.keys(EXEMPT_FENCES).sort()) exempt[tag] = EXEMPT_FENCES[tag]!;
    return {
        derived_fields: ['status', 'grading.scoring', 'grading.captures_response', 'grading.score_shape'],
        authored_fields: ['id', 'label', 'medium', 'affords', 'constraints', 'grading.note'],
        vocabulary: { scoring: [...SCORING], score_shape: [...SCORE_SHAPES] },
        capabilities,
        exempt_fences: exempt,
        prose_facts: { graded_curve_families: gradedCurveFamilies() },
    };
}

/** The committed file's text. Deterministic (no timestamp, no commit — the
 *  curriculum side records our commit beside its pinned copy). */
export function renderCapabilityFacts(): string {
    const body = {
        _generated: 'GENERATED by `pnpm facts:capabilities` from packages/app/src/lib/capabilityFacts.ts. Do not hand-edit; capabilityFacts.test.ts fails on drift.',
        ...capabilityFacts(),
    };
    return JSON.stringify(body, null, 2) + '\n';
}
