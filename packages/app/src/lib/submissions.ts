// =============================================================================
// submissions.ts — pure helpers for the submissions dashboard (Stage 16)
// -----------------------------------------------------------------------------
// Two jobs, both pure and unit-tested:
//
//   1. groupSubmissions() — collapse a flat list of submission rows into one
//      group per student (Phase 1 link-share: keyed by exact display_name).
//      Each group exposes the latest attempt (the dashboard's headline) and
//      the best-scoring attempt (shown secondarily), plus the full attempt
//      list for the all-attempts view.
//
//   2. buildActivityIndex() — walk an ActivityDocument and produce lookup maps
//      from blank.id and section.id to human-readable info, so the drill-down
//      can show "Problem 3: simplify ____" and the canonical answer next to a
//      student's response instead of a raw UUID. Best-effort: a submission may
//      reference a blank that a later document edit removed; such blanks simply
//      aren't in the map and the UI labels them as no-longer-present.
//
// Grouping by display_name accepts that "Bob S" and "Bobby Smith" become two
// students — roster-canonical identity is a Phase 3 concern. opaque_token is
// null until Phase 3; when it exists it takes precedence as the grouping key.
// =============================================================================

import type {
    ActivityDocument,
    Block,
    Rubric,
} from '@activity/schema';
import { fitFunction } from '@activity/graph-kit';
import { histogramBins, fiveNumberSummary } from '@activity/renderer';

// ---- Raw row shape (mirrors the columns the dashboard selects) --------------

export interface SubmissionRow {
    id: string;
    display_name: string | null;
    opaque_token: string | null;
    responses: unknown; // raw jsonb; migrate on read at the consumer
    score: number | null; // 0..1, or null if the runtime couldn't score
    submitted_at: string; // ISO timestamp
    attempt_number: number;
    activity_version_id: string | null; // version answered against; null for legacy rows
}

// ---- Grouping ---------------------------------------------------------------

export interface StudentGroup {
    key: string; // stable grouping key (token, else display_name, else row id)
    label: string; // what to show as the student's name
    attempts: SubmissionRow[]; // ascending by attempt_number
    latest: SubmissionRow; // highest attempt_number (tie-break: latest submitted_at)
    best: SubmissionRow; // highest score (null score sorts lowest)
    count: number;
}

// Score for comparison: treat a null (unscored) submission as below any real
// score so it never wins "best", but still picks something deterministic.
function scoreValue(row: SubmissionRow): number {
    return row.score ?? -1;
}

// Is `a` a later attempt than `b`? Primary: attempt_number. Tie-break:
// submitted_at, so two rows that somehow share an attempt number still order
// deterministically.
function isLaterAttempt(a: SubmissionRow, b: SubmissionRow): boolean {
    if (a.attempt_number !== b.attempt_number) {
        return a.attempt_number > b.attempt_number;
    }
    return a.submitted_at > b.submitted_at;
}

function isBetterScore(a: SubmissionRow, b: SubmissionRow): boolean {
    const sa = scoreValue(a);
    const sb = scoreValue(b);
    if (sa !== sb) return sa > sb;
    // Equal scores: prefer the later attempt as the representative "best".
    return isLaterAttempt(a, b);
}

// Collapse rows into per-student groups. Groups are returned sorted by their
// latest attempt's submitted_at, descending — the most recently active student
// first, which is what a teacher scanning a fresh dashboard wants.
export function groupSubmissions(rows: SubmissionRow[]): StudentGroup[] {
    const byKey = new Map<string, SubmissionRow[]>();

    for (const row of rows) {
        const key = row.opaque_token ?? row.display_name ?? row.id;
        const bucket = byKey.get(key);
        if (bucket) bucket.push(row);
        else byKey.set(key, [row]);
    }

    const groups: StudentGroup[] = [];
    for (const [key, bucket] of byKey) {
        const attempts = [...bucket].sort(
            (a, b) => a.attempt_number - b.attempt_number,
        );
        let latest = bucket[0]!;
        let best = bucket[0]!;
        for (const row of bucket) {
            if (isLaterAttempt(row, latest)) latest = row;
            if (isBetterScore(row, best)) best = row;
        }
        const first = bucket[0]!;
        const label = first.display_name ?? first.opaque_token ?? 'Unnamed student';
        groups.push({ key, label, attempts, latest, best, count: bucket.length });
    }

    groups.sort((a, b) => {
        if (a.latest.submitted_at !== b.latest.submitted_at) {
            return a.latest.submitted_at > b.latest.submitted_at ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
    });

    return groups;
}

// ---- Activity index (blank.id / section.id -> readable info) ----------------

export interface BlankInfo {
    blankId: string;
    problemId: string;
    problemNumber: number | null; // FillInBlankBlock.number, if authored
    docOrder: number; // problem's 1-based position among indexed blocks (see buildActivityIndex)
    problemPrompt: string; // reconstructed prompt with ____ where blanks sit
    canonicalAnswer: string; // primary answer + acceptable alternates
    blankOrder: number; // 0-based position among blanks in its problem
    // When this blank is part of an order-independent group (2+ adjacent
    // interchangeable blanks), the canonical answers of every group member, in
    // document order — so the dashboard can show "2 or 3 (any order)" instead of
    // this slot's answer alone (which may differ from the student's correct
    // entry). null when the blank is ungrouped.
    groupAnswers: string[] | null;
    // The blank's answer mode ('math' → render answers as math in the dashboard).
    // Absent (undefined) = 'text', the common case.
    answerType?: 'text' | 'numeric' | 'math';
    sectionId: string;
    sectionTitle: string | null;
}

export interface SectionInfo {
    sectionId: string;
    title: string | null;
    order: number; // 1-based position in the document
}

// One interactive_graph block, for reading its submission back (Stage 5).
export interface GraphInfo {
    blockId: string;
    problemNumber: number | null;
    docOrder: number;
    problemPrompt: string; // reconstructed from the block's prompt inline nodes
    interactionType: string; // 'plot_point' | 'plot_function'
    // Human-readable answer key next to what the student plotted — a point list
    // "(3, 4)" for plot_point, "y = 2x + 3" for a linear plot_function.
    answerSummary: string;
    // plot_function only: the (first) model's family, so the dashboard can fit
    // the student's raw points back into an equation with the same engine that
    // scored them (fitStudentEquation).
    functionFamily?: string;
    sectionId: string;
    sectionTitle: string | null;
}

// "y = 2x + 3" / "y = -x" from slope + intercept.
function formatLinear(slope: number, intercept: number): string {
    const m = Math.round(slope * 100) / 100;
    const b = Math.round(intercept * 100) / 100;
    const bPart = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`;
    return `y = ${m}x${bPart}`;
}

// One human-readable equation per family — shared by the answer-key summary
// and the fitted student curve, so the two columns always read alike.
const r2 = (n: number): number => Math.round(n * 100) / 100;
function formatFunctionModel(m: {
    family: string;
    slope?: number;
    intercept?: number;
    a?: number;
    b?: number;
    c?: number;
    x?: number;
}): string {
    switch (m.family) {
        case 'linear':
            return formatLinear(m.slope ?? 0, m.intercept ?? 0);
        case 'quadratic':
            return `y = ${r2(m.a ?? 0)}x² + ${r2(m.b ?? 0)}x + ${r2(m.c ?? 0)}`;
        case 'exponential':
            return `y = ${r2(m.a ?? 0)}·${r2(m.b ?? 0)}ˣ`;
        case 'logarithmic':
            return `y = ${r2(m.a ?? 0)} + ${r2(m.b ?? 0)}·ln(x)`;
        case 'vertical':
            return `x = ${r2(m.x ?? 0)}`;
        default:
            return `(${m.family})`;
    }
}

// The student's plotted points, re-fit into the equation they define — the
// schema stores raw points (uniform with plot_point) precisely because the
// parameters are re-derivable with the SAME engine that scored them. Null when
// the points don't define a curve of the family (the teacher still sees the
// raw points).
export function fitStudentEquation(
    family: string,
    points: [number, number][],
): string | null {
    const fitted = fitFunction(family, points);
    return fitted ? formatFunctionModel(fitted) : null;
}

// One choice of a multiple_choice block, for reading its submission back.
export interface McChoiceInfo {
    id: string;
    /** "A" / "B" / … by document position. */
    letter: string;
    /** Plain-text rendering of the choice content (LaTeX shown as source). */
    text: string;
    correct: boolean;
}

// One multiple_choice block, for reading its submission back.
export interface McInfo {
    blockId: string;
    problemNumber: number | null;
    docOrder: number;
    problemPrompt: string;
    multiSelect: boolean;
    /** Choices in document order (selected ids resolve through this). */
    choices: McChoiceInfo[];
    /** Human-readable answer key, e.g. "B. 4" or "A. 2, C. 5". */
    answerSummary: string;
    sectionId: string;
    sectionTitle: string | null;
}

// One side (item or target) of a matching block, for reading its submission
// back. NO letters here: published letters follow the publish-time shuffle,
// so the dashboard reads by CONTENT (the stable thing) instead.
export interface MatchSideInfo {
    id: string;
    /** Plain-text rendering of the side's content (LaTeX shown as source). */
    text: string;
}

// One matching block, for reading its submission back.
export interface MatchInfo {
    blockId: string;
    problemNumber: number | null;
    docOrder: number;
    problemPrompt: string;
    items: MatchSideInfo[];
    targets: MatchSideInfo[];
    /** item id → correct target id (the authored key). */
    key: Record<string, string>;
    allowTargetReuse: boolean;
    /** Human-readable answer key, e.g. "y = 2x → 2; y = −x → −1". */
    answerSummary: string;
    sectionId: string;
    sectionTitle: string | null;
}

// One ordering block, for reading its submission back.
export interface OrderingInfo {
    blockId: string;
    problemNumber: number | null;
    docOrder: number;
    problemPrompt: string;
    /** Items in the AUTHORED (correct) order. */
    items: MatchSideInfo[];
    /** Human-readable answer key: the correct sequence, numbered. */
    answerSummary: string;
    sectionId: string;
    sectionTitle: string | null;
}

// One number_line block, for reading its submission back (1-D). Mirrors
// GraphInfo but leaner — point values or an interval/ray, no families.
export interface NumberLineInfo {
    blockId: string;
    problemNumber: number | null;
    docOrder: number;
    problemPrompt: string;
    interactionType: string; // 'plot_point' | 'plot_interval'
    // Human-readable answer key: a point list "3" / "−4, 5" for plot_point, or an
    // inequality "−2 ≤ x < 4" / "x ≥ 3" for plot_interval.
    answerSummary: string;
    sectionId: string;
    sectionTitle: string | null;
}

// One graded data_plot block, for reading its submission back. The answer key
// is the target distribution (the block's dataset); the interaction is
// build_dotplot in slice 1.
export interface DataPlotInfo {
    blockId: string;
    problemNumber: number | null;
    docOrder: number;
    problemPrompt: string;
    interactionType: string; // 'build_dotplot'
    answerSummary: string; // the target dot plot as a sorted value list
    sectionId: string;
    sectionTitle: string | null;
}

// One free-text block (self_explanation / short_answer / essay), for reading its
// response back. No answer key — just the prompt, to label the response, plus
// the block type so the dashboard can badge ungraded vs manually-graded (and,
// in a later slice, attach the grading UI to short_answer/essay).
export interface FreeTextInfo {
    blockId: string;
    blockType: 'self_explanation' | 'short_answer' | 'essay';
    docOrder: number;
    problemPrompt: string;
    /**
     * The block's grading rubric (short_answer/essay only, when authored).
     * Read from the submission's PINNED document version, so grading always
     * sees the exact rubric the student was assessed against.
     */
    rubric: Rubric | null;
    sectionId: string;
    sectionTitle: string | null;
}

export interface ActivityIndex {
    blanks: Map<string, BlankInfo>;
    graphs: Map<string, GraphInfo>;
    numberLines: Map<string, NumberLineInfo>;
    dataPlots: Map<string, DataPlotInfo>;
    mcs: Map<string, McInfo>;
    matchings: Map<string, MatchInfo>;
    orderings: Map<string, OrderingInfo>;
    freeText: Map<string, FreeTextInfo>;
    sections: Map<string, SectionInfo>;
}

// A dot-plot's values → a readable sorted list ("3, 5, 5, 6, 8"). Shared by the
// answer-key summary and the submitted-answer cell so the two read alike.
export function formatDotValues(values: number[]): string {
    if (values.length === 0) return '—';
    return [...values].sort((a, b) => a - b).join(', ');
}

// A histogram's per-bin frequencies → a readable list ("2, 3, 1, 0").
export function formatBins(bins: number[]): string {
    if (bins.length === 0) return '—';
    return bins.join(', ');
}

// A five-number summary → a readable line ("min 2 · Q1 4 · median 5 · Q3 7 · max 8").
export function formatFive(five: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
}): string {
    return `min ${five.min} · Q1 ${five.q1} · median ${five.median} · Q3 ${five.q3} · max ${five.max}`;
}

// A student/answer-key interval → a readable inequality. Both bounds present →
// "a ≤ x < b"; one bound → a ray "x ≥ a" / "x < b". A closed bound uses ≤/≥, an
// open bound uses </>. Shared by the answer-key summary and the submitted-answer
// cell so the two read alike.
export function formatNumberLineInterval(iv: {
    min?: number;
    minStyle?: 'open' | 'closed';
    max?: number;
    maxStyle?: 'open' | 'closed';
}): string {
    const hasMin = typeof iv.min === 'number';
    const hasMax = typeof iv.max === 'number';
    if (hasMin && hasMax) {
        const lo = iv.minStyle === 'open' ? '<' : '≤';
        const hi = iv.maxStyle === 'open' ? '<' : '≤';
        return `${iv.min} ${lo} x ${hi} ${iv.max}`;
    }
    if (hasMin) return `x ${iv.minStyle === 'open' ? '>' : '≥'} ${iv.min}`;
    if (hasMax) return `x ${iv.maxStyle === 'open' ? '<' : '≤'} ${iv.max}`;
    return '—';
}

// Render a fill-in-blank block's inline content to a plain-text prompt. Blanks
// become "____" so the teacher reads the problem the way the student saw it;
// inline math is shown as its LaTeX source (no KaTeX in a text summary).
function reconstructPrompt(
    content: ReadonlyArray<{ type: string; [k: string]: unknown }>,
): string {
    const parts: string[] = [];
    for (const node of content) {
        if (node.type === 'text' && typeof node.text === 'string') {
            parts.push(node.text);
        } else if (node.type === 'math_inline' && typeof node.latex === 'string') {
            parts.push(node.latex);
        } else if (node.type === 'hard_break') {
            parts.push(' ');
        } else if (node.type === 'blank') {
            parts.push('____');
        }
    }
    return parts.join('').replace(/\s+/g, ' ').trim();
}

function canonicalAnswer(answer: string, acceptable: string[]): string {
    return [answer, ...acceptable].filter((s) => s.length > 0).join(' / ');
}

// Walk the document once, producing the two lookup maps. Only fill_in_blank
// blocks carry blanks in Phase 1, so other block types are skipped.
export function buildActivityIndex(doc: ActivityDocument): ActivityIndex {
    const blanks = new Map<string, BlankInfo>();
    const graphs = new Map<string, GraphInfo>();
    const numberLines = new Map<string, NumberLineInfo>();
    const dataPlots = new Map<string, DataPlotInfo>();
    const mcs = new Map<string, McInfo>();
    const matchings = new Map<string, MatchInfo>();
    const orderings = new Map<string, OrderingInfo>();
    const freeText = new Map<string, FreeTextInfo>();
    const sections = new Map<string, SectionInfo>();

    // Document-global reading-order counter: 1-based, bumped once per INDEXED
    // block (display-only graphs/data-plots never consume a slot — they take
    // the early return above the bump). This is the dashboard's sort key: the
    // drill-down interleaves every response type in the order the student saw
    // the questions, with problemNumber demoted to a display label. All blanks
    // of one fill_in_blank problem share their problem's docOrder; a
    // faded_worked_example's child problems each take their own.
    let docOrderCounter = 0;

    doc.sections.forEach((section, idx) => {
        sections.set(section.id, {
            sectionId: section.id,
            title: section.title ?? null,
            order: idx + 1,
        });

        // One question block → index entry. A closure (not a loop body) so a
        // scaffold container (faded_worked_example) can recurse into its
        // children — a question nested inside indexes exactly like a top-level
        // one. Layout (rows/columns) is walked by the caller below, not here:
        // rows/columns are not blocks, so indexBlock only ever sees leaf blocks.
        const indexBlock = (block: Block): void => {
            if (block.type === 'faded_worked_example') {
                // Scaffold shell: its faded steps are fill_in_blank children,
                // which index exactly like top-level ones. The child union
                // forbids columns / worked-examples / faded-examples, so this
                // recursion is one predictable level deep.
                for (const child of block.content) indexBlock(child);
                return;
            }
            if (
                block.type === 'self_explanation' ||
                block.type === 'short_answer' ||
                block.type === 'essay'
            ) {
                // Free-text prompt: no answer key, just the prompt (+ type) so
                // the dashboard can label the response. short_answer/essay get a
                // grading UI in a later slice; for now all show as raw text.
                freeText.set(block.id, {
                    blockId: block.id,
                    blockType: block.type,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    rubric:
                        block.type === 'self_explanation'
                            ? null
                            : (block.rubric ?? null),
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'interactive_graph') {
                // Display (static) graphs are ungraded — they collect no answer,
                // so they never appear in a submission and aren't indexed here.
                if (block.interaction.type === 'display') return;
                let answerSummary = '—';
                let functionFamily: string | undefined;
                if (block.interaction.type === 'plot_point') {
                    answerSummary = block.interaction.correctPoints
                        .map((p) => `(${p[0]}, ${p[1]})`)
                        .join(', ');
                } else if (block.interaction.type === 'plot_function') {
                    // One entry per curve (a system shows all), through the shared
                    // per-family formatter.
                    answerSummary = block.interaction.models
                        .map(formatFunctionModel)
                        .join('; ');
                    functionFamily = block.interaction.models[0]?.family;
                } else if (block.interaction.type === 'graph_inequality') {
                    answerSummary = block.interaction.inequalities
                        .map((q) => {
                            const eq =
                                q.boundary.family === 'linear'
                                    ? formatLinear(q.boundary.slope, q.boundary.intercept)
                                    : q.boundary.family === 'vertical'
                                      ? `x = ${q.boundary.x}`
                                      : `(${q.boundary.family})`;
                            const greater =
                                q.boundary.family === 'vertical'
                                    ? q.shadeSide === 'right'
                                    : q.shadeSide === 'above';
                            const op = greater ? (q.strict ? '>' : '≥') : (q.strict ? '<' : '≤');
                            return eq.replace('=', op);
                        })
                        .join('; ');
                } else if (block.interaction.type === 'plot_ray') {
                    answerSummary = block.interaction.rays
                        .map(
                            (r) =>
                                `ray (${r.from[0]}, ${r.from[1]}) through (${r.through[0]}, ${r.through[1]})` +
                                (r.fromStyle === 'open' ? ' (open start)' : ''),
                        )
                        .join('; ');
                } else if (block.interaction.type === 'plot_segment') {
                    answerSummary = block.interaction.segments
                        .map((g) => {
                            const styles =
                                g.endpoints[0] === 'open' || g.endpoints[1] === 'open'
                                    ? ` (${g.endpoints[0]} start, ${g.endpoints[1]} end)`
                                    : '';
                            return `segment (${g.from[0]}, ${g.from[1]}) to (${g.to[0]}, ${g.to[1]})${styles}`;
                        })
                        .join('; ');
                } else if (block.interaction.type === 'shade_region') {
                    answerSummary = block.interaction.regions
                        .map(
                            (r) =>
                                `region (${r.correctVertices.length} vertices): ${r.correctVertices
                                    .map((p) => `(${p[0]}, ${p[1]})`)
                                    .join(', ')}`,
                        )
                        .join('; ');
                }
                graphs.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    interactionType: block.interaction.type,
                    answerSummary,
                    ...(functionFamily ? { functionFamily } : {}),
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'multiple_choice') {
                const choices: McChoiceInfo[] = block.choices.map(
                    (choice, index) => ({
                        id: choice.id,
                        letter: String.fromCharCode(65 + (index % 26)),
                        text: reconstructPrompt(choice.content),
                        correct: choice.correct,
                    }),
                );
                const answerSummary =
                    choices
                        .filter((c) => c.correct)
                        .map((c) => `${c.letter}. ${c.text}`)
                        .join(', ') || '—';
                mcs.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    multiSelect: block.multiSelect,
                    choices,
                    answerSummary,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'matching') {
                const items: MatchSideInfo[] = block.items.map((i) => ({
                    id: i.id,
                    text: reconstructPrompt(i.content),
                }));
                const targets: MatchSideInfo[] = block.targets.map((t) => ({
                    id: t.id,
                    text: reconstructPrompt(t.content),
                }));
                const targetText = new Map(targets.map((t) => [t.id, t.text]));
                const answerSummary =
                    items
                        .map((i) => {
                            const t = block.key[i.id];
                            return t
                                ? `${i.text} → ${targetText.get(t) ?? '?'}`
                                : `${i.text} → (unmatched)`;
                        })
                        .join('; ') || '—';
                matchings.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    items,
                    targets,
                    key: block.key,
                    allowTargetReuse: block.allowTargetReuse,
                    answerSummary,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'ordering') {
                const items: MatchSideInfo[] = block.items.map((i) => ({
                    id: i.id,
                    text: reconstructPrompt(i.content),
                }));
                orderings.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    items,
                    answerSummary:
                        items.map((i, n) => `${n + 1}. ${i.text}`).join('  ') ||
                        '—',
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'number_line') {
                const answerSummary =
                    block.interaction.type === 'plot_point'
                        ? block.interaction.correctPoints.join(', ')
                        : formatNumberLineInterval(block.interaction.correctInterval);
                numberLines.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    interactionType: block.interaction.type,
                    answerSummary,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'data_plot') {
                // Only GRADED data plots produce a submission — a display chart is
                // an ungraded stimulus, so it isn't indexed. The answer key is the
                // target chart computed from the block's dataset, formatted per
                // build type.
                if (block.interaction.type === 'display') return;
                const answerSummary =
                    block.interaction.type === 'build_histogram'
                        ? formatBins(
                              histogramBins(block.data, block.config).map((b) => b.count),
                          )
                        : block.interaction.type === 'build_boxplot'
                          ? formatFive(fiveNumberSummary(block.data))
                          : formatDotValues(block.data);
                dataPlots.set(block.id, {
                    blockId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: ++docOrderCounter,
                    problemPrompt: reconstructPrompt(block.prompt),
                    interactionType: block.interaction.type,
                    answerSummary,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
                return;
            }
            if (block.type === 'math_block') {
                // Model A in-equation gaps (math_block.prompts) score into the
                // SAME submissions.responses.blanks map as fill-in-blank blanks
                // (keyed by the placeholder id), so they must land in the same
                // index or the dashboard labels a real answer "no-longer-present".
                // The whole equation is one problem slot; its gaps are sub-rows.
                if (!block.prompts || block.prompts.length === 0) return;
                const eqPrompt = block.latex.replace(
                    /\\placeholder\[[^\]]+\]\{[^{}]*\}/g,
                    '____',
                );
                const mathDocOrder = ++docOrderCounter;
                block.prompts.forEach((p, blankOrder) => {
                    blanks.set(p.id, {
                        blankId: p.id,
                        problemId: block.id,
                        problemNumber: null,
                        docOrder: mathDocOrder,
                        problemPrompt: eqPrompt,
                        canonicalAnswer: canonicalAnswer(
                            p.answer,
                            p.acceptableAnswers,
                        ),
                        blankOrder,
                        groupAnswers: null,
                        answerType: 'math',
                        sectionId: section.id,
                        sectionTitle: section.title ?? null,
                    });
                });
                return;
            }
            if (block.type !== 'fill_in_blank') return;
            const prompt = reconstructPrompt(block.content);

            // Collect the block's blanks in document order (narrowed to
            // BlankToken via the discriminant).
            const blockBlanks = [];
            for (const node of block.content) {
                if (node.type === 'blank') blockBlanks.push(node);
            }

            // Order-independent grouping: a maximal run of adjacent blanks each
            // flagged interchangeableWithPrevious shares the full set of member
            // canonical answers (mirrors the renderer's run detection). Lone
            // blanks get null.
            const groupAnswersByIndex: (string[] | null)[] = new Array(
                blockBlanks.length,
            ).fill(null);
            let i = 0;
            while (i < blockBlanks.length) {
                const start = i;
                i++;
                while (
                    i < blockBlanks.length &&
                    blockBlanks[i]?.interchangeableWithPrevious
                ) {
                    i++;
                }
                if (i - start >= 2) {
                    const members = blockBlanks
                        .slice(start, i)
                        .map((b) => canonicalAnswer(b.answer, b.acceptableAnswers));
                    for (let k = start; k < i; k++) {
                        groupAnswersByIndex[k] = members;
                    }
                }
            }

            // One slot for the whole problem — its blanks are sub-rows of a
            // single drill-down item, not items of their own.
            const problemDocOrder = ++docOrderCounter;
            blockBlanks.forEach((node, blankOrder) => {
                blanks.set(node.id, {
                    blankId: node.id,
                    problemId: block.id,
                    problemNumber: block.number ?? null,
                    docOrder: problemDocOrder,
                    problemPrompt: prompt,
                    canonicalAnswer: canonicalAnswer(
                        node.answer,
                        node.acceptableAnswers,
                    ),
                    blankOrder,
                    groupAnswers: groupAnswersByIndex[blankOrder] ?? null,
                    answerType: node.answerType,
                    sectionId: section.id,
                    sectionTitle: section.title ?? null,
                });
            });
        };

        // Walk the layout: section → rows → columns → blocks. Rows/columns are
        // pure layout (not questions), so every leaf block reaches indexBlock
        // exactly as a top-level block would.
        for (const row of section.rows) {
            for (const column of row.columns) {
                for (const block of column.blocks) indexBlock(block);
            }
        }
    });

    return {
        blanks,
        graphs,
        numberLines,
        dataPlots,
        mcs,
        matchings,
        orderings,
        freeText,
        sections,
    };
}

// ---- Score formatting -------------------------------------------------------

// 0..1 score → "85%". Null (unscored) → "—".
export function formatScore(score: number | null): string {
    if (score === null) return '—';
    // Snap to the stored 4-decimal precision before scaling so binary-float
    // noise (e.g. 0.575 * 100 === 57.4999…) doesn't drop a half-percent.
    const percent = Math.round(score * 10000) / 100;
    return `${Math.round(percent)}%`;
}
