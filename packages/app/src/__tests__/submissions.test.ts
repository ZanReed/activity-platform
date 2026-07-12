import { describe, it, expect } from 'vitest';
import { ActivityDocument } from '@activity/schema';
import {
    groupSubmissions,
    buildActivityIndex,
    formatScore,
    fitStudentEquation,
    type SubmissionRow,
} from '../lib/submissions';

// A fixed-uuid helper so fixtures are deterministic.
const U = (n: number): string =>
    `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;

function row(partial: Partial<SubmissionRow>): SubmissionRow {
    return {
        id: partial.id ?? U(999),
        display_name: partial.display_name ?? null,
        opaque_token: partial.opaque_token ?? null,
        responses: partial.responses ?? { schemaVersion: 2, blanks: {} },
        score: partial.score ?? null,
        submitted_at: partial.submitted_at ?? '2026-06-01T00:00:00.000Z',
        attempt_number: partial.attempt_number ?? 1,
        activity_version_id: partial.activity_version_id ?? null,
    };
}

describe('groupSubmissions', () => {
    it('groups by exact display_name', () => {
        const groups = groupSubmissions([
            row({ id: U(1), display_name: 'Alice', attempt_number: 1 }),
            row({ id: U(2), display_name: 'Bob', attempt_number: 1 }),
            row({ id: U(3), display_name: 'Alice', attempt_number: 2 }),
        ]);
        expect(groups).toHaveLength(2);
        const alice = groups.find((g) => g.label === 'Alice')!;
        expect(alice.count).toBe(2);
        expect(alice.attempts.map((a) => a.attempt_number)).toEqual([1, 2]);
    });

    it('does not merge differently-typed names (Phase 1 limitation)', () => {
        const groups = groupSubmissions([
            row({ id: U(1), display_name: 'Bob S' }),
            row({ id: U(2), display_name: 'Bobby Smith' }),
        ]);
        expect(groups).toHaveLength(2);
    });

    it('latest = highest attempt_number, best = highest score', () => {
        // Rows are listed later-attempt-first (as the DB returns them, ordered
        // submitted_at DESC). This way a buggy impl that just takes the first or
        // last bucket row — instead of comparing attempt_number/score — fails.
        const groups = groupSubmissions([
            row({
                id: U(2),
                display_name: 'Alice',
                attempt_number: 2,
                score: 0.5,
                submitted_at: '2026-06-01T11:00:00.000Z',
            }),
            row({
                id: U(1),
                display_name: 'Alice',
                attempt_number: 1,
                score: 0.9,
                submitted_at: '2026-06-01T10:00:00.000Z',
            }),
        ]);
        const alice = groups[0]!;
        expect(alice.latest.id).toBe(U(2)); // attempt 2 is latest
        expect(alice.best.id).toBe(U(1)); // attempt 1 scored higher
    });

    it('treats null score as below a real zero score for "best"', () => {
        // The unscored attempt is the LATER one, and the real score is exactly 0.
        // An impl that coerces null to 0 (instead of below 0) would tie them and
        // pick the later (unscored) attempt — so this catches `score ?? 0`.
        const groups = groupSubmissions([
            row({ id: U(1), display_name: 'Alice', attempt_number: 2, score: null }),
            row({ id: U(2), display_name: 'Alice', attempt_number: 1, score: 0 }),
        ]);
        expect(groups[0]!.best.id).toBe(U(2));
    });

    it('breaks attempt ties by submitted_at', () => {
        // Later-submitted row listed first, so an impl that just takes the last
        // bucket row (rather than comparing submitted_at) would fail.
        const groups = groupSubmissions([
            row({
                id: U(2),
                display_name: 'Alice',
                attempt_number: 1,
                submitted_at: '2026-06-01T12:00:00.000Z',
            }),
            row({
                id: U(1),
                display_name: 'Alice',
                attempt_number: 1,
                submitted_at: '2026-06-01T10:00:00.000Z',
            }),
        ]);
        expect(groups[0]!.latest.id).toBe(U(2));
    });

    it('sorts groups by most-recent activity first', () => {
        const groups = groupSubmissions([
            row({
                id: U(1),
                display_name: 'Alice',
                submitted_at: '2026-06-01T10:00:00.000Z',
            }),
            row({
                id: U(2),
                display_name: 'Bob',
                submitted_at: '2026-06-02T10:00:00.000Z',
            }),
        ]);
        expect(groups.map((g) => g.label)).toEqual(['Bob', 'Alice']);
    });

    it('prefers opaque_token as the grouping key when present', () => {
        // Same token but DIFFERENT display_names: a name-first impl would split
        // these into two groups, so this actually exercises token precedence.
        const groups = groupSubmissions([
            row({ id: U(1), opaque_token: 'tok-1', display_name: 'Alice' }),
            row({ id: U(2), opaque_token: 'tok-1', display_name: 'Alexandra' }),
        ]);
        expect(groups).toHaveLength(1);
        expect(groups[0]!.count).toBe(2);
    });

    it('returns [] for no rows', () => {
        expect(groupSubmissions([])).toEqual([]);
    });
});

describe('buildActivityIndex', () => {
    const doc: ActivityDocument = ActivityDocument.parse({
        schemaVersion: 1,
        meta: {
            title: 'Test',
            course: 'Algebra II',
            submissionMode: 'free',
            revisionMode: 'free',
            gradingMode: 'auto',
            activityType: 'worksheet',
            answerFeedback: 'on_check',
            skills: [],
        },
        sections: [
            {
                id: U(100),
                title: 'Warm-up',
                isCheckpoint: true,
                blocks: [
                    {
                        id: U(200),
                        type: 'fill_in_blank',
                        number: 1,
                        hasConfidenceRating: false,
                        skills: [],
                        content: [
                            { type: 'text', text: 'Simplify ', marks: [] },
                            {
                                type: 'blank',
                                id: U(300),
                                answer: '3x',
                                acceptableAnswers: ['3*x'],
                            },
                            { type: 'text', text: ' over ', marks: [] },
                            {
                                type: 'blank',
                                id: U(301),
                                answer: 'y',
                                acceptableAnswers: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: U(101),
                isCheckpoint: false,
                blocks: [
                    {
                        id: U(201),
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'no blanks here', marks: [] }],
                    },
                ],
            },
        ],
    });

    it('indexes every blank with prompt, answer, and section', () => {
        const idx = buildActivityIndex(doc);
        expect(idx.blanks.size).toBe(2);
        const b = idx.blanks.get(U(300))!;
        expect(b.problemNumber).toBe(1);
        expect(b.problemPrompt).toBe('Simplify ____ over ____');
        expect(b.canonicalAnswer).toBe('3x / 3*x');
        expect(b.sectionTitle).toBe('Warm-up');
        expect(b.problemId).toBe(U(200));
        // These two blanks are ungrouped (no interchangeableWithPrevious).
        expect(b.groupAnswers).toBeNull();
    });

    it('attaches the group answer set to order-independent blanks', () => {
        const grouped: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'Grouped',
                course: 'Algebra II',
                submissionMode: 'free',
                revisionMode: 'free',
                gradingMode: 'auto',
                activityType: 'worksheet',
                answerFeedback: 'on_check',
                skills: [],
            },
            sections: [
                {
                    id: U(110),
                    isCheckpoint: true,
                    blocks: [
                        {
                            id: U(210),
                            type: 'fill_in_blank',
                            number: 1,
                            hasConfidenceRating: false,
                            skills: [],
                            content: [
                                { type: 'text', text: '(x + ', marks: [] },
                                { type: 'blank', id: U(310), answer: '2', acceptableAnswers: [] },
                                { type: 'text', text: ')(x + ', marks: [] },
                                {
                                    type: 'blank',
                                    id: U(311),
                                    answer: '3',
                                    acceptableAnswers: [],
                                    interchangeableWithPrevious: true,
                                },
                                { type: 'text', text: ')', marks: [] },
                            ],
                        },
                    ],
                },
            ],
        });
        const idx = buildActivityIndex(grouped);
        // Both members carry the full set, in document order; each still keeps
        // its own canonicalAnswer.
        expect(idx.blanks.get(U(310))!.groupAnswers).toEqual(['2', '3']);
        expect(idx.blanks.get(U(311))!.groupAnswers).toEqual(['2', '3']);
        expect(idx.blanks.get(U(310))!.canonicalAnswer).toBe('2');
    });

    it('indexes sections in document order', () => {
        const idx = buildActivityIndex(doc);
        expect(idx.sections.get(U(100))!.order).toBe(1);
        expect(idx.sections.get(U(101))!.order).toBe(2);
        expect(idx.sections.get(U(101))!.title).toBeNull();
    });

    it('skips non-fill-in-blank blocks', () => {
        const idx = buildActivityIndex(doc);
        // Only the two blanks from the fill_in_blank block are present.
        expect([...idx.blanks.keys()].sort()).toEqual([U(300), U(301)].sort());
    });

    it('indexes an interactive_graph block with prompt + answer key', () => {
        const graphDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'Graphing',
                course: 'Algebra I',
                submissionMode: 'free',
                revisionMode: 'free',
                gradingMode: 'auto',
                activityType: 'worksheet',
                answerFeedback: 'on_check',
                skills: [],
            },
            sections: [
                {
                    id: U(400),
                    title: 'Plot',
                    isCheckpoint: true,
                    blocks: [
                        {
                            id: U(500),
                            type: 'interactive_graph',
                            number: 2,
                            prompt: [{ type: 'text', text: 'Plot the point.', marks: [] }],
                            axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                            interaction: {
                                type: 'plot_point',
                                correctPoints: [[3, 4]],
                                tolerance: 0.1,
                            },
                        },
                    ],
                },
            ],
        });
        const idx = buildActivityIndex(graphDoc);
        expect(idx.graphs.size).toBe(1);
        const g = idx.graphs.get(U(500))!;
        expect(g.problemNumber).toBe(2);
        expect(g.problemPrompt).toBe('Plot the point.');
        expect(g.interactionType).toBe('plot_point');
        expect(g.answerSummary).toBe('(3, 4)');
        expect(g.sectionTitle).toBe('Plot');
        // The graph block is not mistaken for a blank.
        expect(idx.blanks.size).toBe(0);
    });

    it('indexes a number_line block (plot_point + plot_interval, incl. a ray)', () => {
        const meta = {
            title: 'NL', course: 'Algebra I', submissionMode: 'free' as const,
            revisionMode: 'free' as const, gradingMode: 'auto' as const,
            activityType: 'worksheet' as const, answerFeedback: 'on_check' as const, skills: [],
        };
        const nlDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta,
            sections: [
                {
                    id: U(410),
                    title: 'Lines',
                    isCheckpoint: true,
                    blocks: [
                        {
                            id: U(600),
                            type: 'number_line',
                            number: 1,
                            prompt: [{ type: 'text', text: 'Plot 3.', marks: [] }],
                            config: { min: 0, max: 10, tickStep: 1 },
                            interaction: { type: 'plot_point', correctPoints: [3], tolerance: 0.1 },
                        },
                        {
                            id: U(601),
                            type: 'number_line',
                            number: 2,
                            prompt: [{ type: 'text', text: 'Graph the inequality.', marks: [] }],
                            config: { min: -10, max: 10, tickStep: 2 },
                            interaction: {
                                type: 'plot_interval',
                                correctInterval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
                                tolerance: 0.1,
                            },
                        },
                        {
                            id: U(602),
                            type: 'number_line',
                            number: 3,
                            prompt: [{ type: 'text', text: 'Graph x >= 3.', marks: [] }],
                            config: { min: 0, max: 10, tickStep: 1 },
                            interaction: {
                                type: 'plot_interval',
                                correctInterval: { min: 3, minStyle: 'closed' },
                                tolerance: 0.1,
                            },
                        },
                    ],
                },
            ],
        });
        const idx = buildActivityIndex(nlDoc);
        expect(idx.numberLines.size).toBe(3);
        const point = idx.numberLines.get(U(600))!;
        expect(point.interactionType).toBe('plot_point');
        expect(point.answerSummary).toBe('3');
        expect(point.problemNumber).toBe(1);
        expect(point.sectionTitle).toBe('Lines');
        // Bounded closed/open interval → an inequality.
        expect(idx.numberLines.get(U(601))!.answerSummary).toBe('-2 ≤ x < 4');
        // One-sided ray.
        expect(idx.numberLines.get(U(602))!.answerSummary).toBe('x ≥ 3');
        // Not mistaken for a blank or a graph.
        expect(idx.blanks.size).toBe(0);
        expect(idx.graphs.size).toBe(0);
    });

    it('indexes a multiple_choice block with lettered choices + answer summary', () => {
        const mcDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'MC', course: 'Algebra I', submissionMode: 'free',
                revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet',
                answerFeedback: 'on_check', skills: [],
            },
            sections: [
                {
                    id: U(420), title: 'Choose', isCheckpoint: true,
                    blocks: [
                        {
                            id: U(520), type: 'multiple_choice', number: 3,
                            prompt: [{ type: 'text', text: 'What is 2 + 2?', marks: [] }],
                            multiSelect: false,
                            choices: [
                                {
                                    id: U(600),
                                    content: [{ type: 'text', text: '3', marks: [] }],
                                    correct: false,
                                },
                                {
                                    id: U(601),
                                    content: [
                                        { type: 'math_inline', latex: '\\sqrt{16}' },
                                    ],
                                    correct: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        const idx = buildActivityIndex(mcDoc);
        expect(idx.mcs.size).toBe(1);
        const m = idx.mcs.get(U(520))!;
        expect(m.problemNumber).toBe(3);
        expect(m.problemPrompt).toBe('What is 2 + 2?');
        expect(m.multiSelect).toBe(false);
        expect(m.choices.map((c) => c.letter)).toEqual(['A', 'B']);
        // Math choice text falls back to LaTeX source, like prompts do.
        expect(m.choices[1]!.text).toBe('\\sqrt{16}');
        expect(m.answerSummary).toBe('B. \\sqrt{16}');
        expect(m.sectionTitle).toBe('Choose');
        // Not mistaken for a blank or a graph.
        expect(idx.blanks.size).toBe(0);
        expect(idx.graphs.size).toBe(0);
    });

    it('recurses into columns — nested blank, graph, and MC blocks all index', () => {
        const columnsDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'Two-up', course: 'Algebra I', submissionMode: 'free',
                revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet',
                answerFeedback: 'on_check', skills: [],
            },
            sections: [
                {
                    id: U(430), title: 'Side by side', isCheckpoint: true,
                    blocks: [
                        {
                            id: U(530),
                            type: 'columns',
                            columns: [
                                {
                                    id: U(531),
                                    blocks: [
                                        {
                                            id: U(540), type: 'fill_in_blank',
                                            hasConfidenceRating: false, skills: [],
                                            content: [
                                                { type: 'text', text: 'x = ', marks: [] },
                                                {
                                                    type: 'blank', id: U(610),
                                                    answer: '4', acceptableAnswers: [],
                                                },
                                            ],
                                        },
                                        {
                                            id: U(541), type: 'multiple_choice',
                                            prompt: [{ type: 'text', text: 'Pick.', marks: [] }],
                                            multiSelect: false,
                                            choices: [
                                                {
                                                    id: U(611),
                                                    content: [{ type: 'text', text: 'yes', marks: [] }],
                                                    correct: true,
                                                },
                                                {
                                                    id: U(612),
                                                    content: [{ type: 'text', text: 'no', marks: [] }],
                                                    correct: false,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    id: U(532),
                                    blocks: [
                                        {
                                            id: U(542), type: 'interactive_graph',
                                            prompt: [{ type: 'text', text: 'Plot it.', marks: [] }],
                                            axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                                            interaction: {
                                                type: 'plot_point',
                                                correctPoints: [[1, 2]],
                                                tolerance: 0.1,
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        const idx = buildActivityIndex(columnsDoc);
        // The blank inside column 1 indexes with its section metadata intact.
        const b = idx.blanks.get(U(610))!;
        expect(b).toBeDefined();
        expect(b.problemId).toBe(U(540));
        expect(b.sectionTitle).toBe('Side by side');
        // The MC block inside column 1.
        const m = idx.mcs.get(U(541))!;
        expect(m).toBeDefined();
        expect(m.answerSummary).toBe('A. yes');
        expect(m.sectionId).toBe(U(430));
        // The graph inside column 2.
        const g = idx.graphs.get(U(542))!;
        expect(g).toBeDefined();
        expect(g.answerSummary).toBe('(1, 2)');
    });

    it('summarizes a plot_function (linear) answer as an equation', () => {
        const funcDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'Lines', course: 'Algebra I', submissionMode: 'free',
                revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet',
                answerFeedback: 'on_check', skills: [],
            },
            sections: [
                {
                    id: U(410), isCheckpoint: false,
                    blocks: [
                        {
                            id: U(510), type: 'interactive_graph', number: 1,
                            prompt: [{ type: 'text', text: 'Graph y = 2x + 3.', marks: [] }],
                            axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                            interaction: {
                                type: 'plot_function',
                                models: [{ family: 'linear', slope: 2, intercept: 3 }],
                            },
                        },
                    ],
                },
            ],
        });
        const g = buildActivityIndex(funcDoc).graphs.get(U(510))!;
        expect(g.interactionType).toBe('plot_function');
        expect(g.answerSummary).toBe('y = 2x + 3');
        // The family rides along so the dashboard can re-fit the student's
        // raw points into an equation (fitStudentEquation).
        expect(g.functionFamily).toBe('linear');
    });

    it('summarizes non-linear plot_function families and carries the family', () => {
        const quadDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'Parabolas', course: 'Algebra I', submissionMode: 'free',
                revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet',
                answerFeedback: 'on_check', skills: [],
            },
            sections: [
                {
                    id: U(410), isCheckpoint: false,
                    blocks: [
                        {
                            id: U(511), type: 'interactive_graph', number: 1,
                            prompt: [{ type: 'text', text: 'Graph y = x² − 4.', marks: [] }],
                            axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                            interaction: {
                                type: 'plot_function',
                                models: [{ family: 'quadratic', a: 1, b: 0, c: -4 }],
                            },
                        },
                    ],
                },
            ],
        });
        const g = buildActivityIndex(quadDoc).graphs.get(U(511))!;
        expect(g.answerSummary).toBe('y = 1x² + 0x + -4');
        expect(g.functionFamily).toBe('quadratic');
    });

    it('does not index a display (static) graph — it is ungraded', () => {
        const displayDoc: ActivityDocument = ActivityDocument.parse({
            schemaVersion: 1,
            meta: {
                title: 'Figures', course: 'Algebra I', submissionMode: 'free',
                revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet',
                answerFeedback: 'on_check', skills: [],
            },
            sections: [
                {
                    id: U(420), isCheckpoint: false,
                    blocks: [
                        {
                            id: U(520), type: 'interactive_graph',
                            prompt: [{ type: 'text', text: 'Using the graph below.', marks: [] }],
                            axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                            interaction: {
                                type: 'display',
                                drawables: [{ kind: 'point', at: [1, 2] }],
                            },
                        },
                    ],
                },
            ],
        });
        const idx = buildActivityIndex(displayDoc);
        expect(idx.graphs.size).toBe(0);
        expect(idx.graphs.has(U(520))).toBe(false);
    });
});

describe('fitStudentEquation', () => {
    it('re-fits raw student points into the equation they define, rounded', () => {
        expect(fitStudentEquation('linear', [[0, 3], [1, 5]])).toBe('y = 2x + 3');
        expect(fitStudentEquation('quadratic', [[0, -4], [1, -3], [2, 0]])).toBe(
            'y = 1x² + 0x + -4',
        );
        expect(fitStudentEquation('vertical', [[4, 0], [4, 5]])).toBe('x = 4');
    });

    it('returns null when the points cannot define the family curve', () => {
        // y ≤ 0 is outside fitExponential's domain.
        expect(fitStudentEquation('exponential', [[0, 0], [1, 2]])).toBeNull();
    });
});

describe('formatScore', () => {
    it('renders 0..1 as a rounded percent', () => {
        expect(formatScore(0.85)).toBe('85%');
        expect(formatScore(1)).toBe('100%');
        expect(formatScore(0)).toBe('0%');
    });
    it('renders null as a dash', () => {
        expect(formatScore(null)).toBe('—');
    });
});
