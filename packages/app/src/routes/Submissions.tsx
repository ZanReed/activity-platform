// =============================================================================
// Submissions.tsx — the /activity/:id/submissions route (Stage 16)
// -----------------------------------------------------------------------------
// A per-activity submissions dashboard. Two views, toggled:
//
//   Summary (default) — one row per student: latest-attempt score (headline),
//     best-attempt score (secondary), attempt count, last submitted. Expanding
//     a row shows the latest attempt's per-blank detail.
//   All attempts — every submission row, grouped by student then attempt
//     number, each expandable to its own detail.
//
// The drill-down maps each response's blank.id back to the problem prompt and
// answer key from the exact activity version the student answered (each
// submission pins its activity_version_id; legacy rows fall back to the current
// version), so the teacher reads "Problem 3: simplify ____ → answer 3x, student
// wrote 2x ✗" instead of a raw UUID — and against the right answer key even
// after a republish. Blanks that a later edit removed are labeled as no longer
// present. No cross-student aggregation here — that's Phase 2.
//
// Identity is Phase 1 link-share: students are grouped by exact display_name.
// "Bob S" and "Bobby Smith" are two students; roster-canonical dedup is Phase 3.
// =============================================================================

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import {
    ActivityDocument,
    migrateSubmissionResponses,
    type ConfidenceLevel,
} from '@activity/schema';
import { rayArrowGlyphs } from '@activity/graph-kit';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';
import {
    buildActivityIndex,
    groupSubmissions,
    formatScore,
    fitStudentEquation,
    formatNumberLineInterval,
    formatDotValues,
    formatBins,
    formatFive,
    type ActivityIndex,
    type StudentGroup,
    type SubmissionRow,
} from '../lib/submissions';
import {
    loadGrades,
    gradableBlocks,
    submissionNeedsGrading,
    type BlockGrade,
    type GradesBySubmission,
} from '../lib/grades';
import { GradingProvider, GradingPanel, useGrading } from './grading';

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// True 8-way direction glyph for a drawn ray (same rule as the widget's
// pills): the shape picks which end of the canonical pair the arrow leaves.
function rayGlyphFor(
    points: [number, number][],
    shape: 'ray_positive' | 'ray_negative',
): string {
    const a = points[0];
    const b = points[1];
    if (!a || !b) return '';
    const g = rayArrowGlyphs(a, b);
    return shape === 'ray_positive' ? g.positive : g.negative;
}

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
    unsure: 'Unsure',
    think_so: 'Think so',
    certain: 'Certain',
};

// Badge labels for the three free-text block types in the written-responses list.
const FREE_TEXT_LABELS: Record<
    'self_explanation' | 'short_answer' | 'essay',
    string
> = {
    self_explanation: 'Reflection',
    short_answer: 'Short answer',
    essay: 'Essay',
};

// Resolve the activity index a submission should be read against: the version
// the student actually answered, falling back to the current version for legacy
// rows that predate per-submission version pinning (activity_version_id null).
type IndexResolver = (versionId: string | null) => ActivityIndex;

interface LoadedData {
    title: string;
    resolveIndex: IndexResolver;
    groups: StudentGroup[];
    hasGradableContent: boolean;
}

type LoadState =
| { status: 'loading' }
| { status: 'not_found' }
| { status: 'error'; message: string }
| { status: 'ready'; data: LoadedData };

type ViewMode = 'summary' | 'all';

function formatWhen(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

// "(3, 4), (-3, -2)" — student/answer point lists for the graph detail view.
function formatPoints(points: [number, number][]): string {
    if (points.length === 0) return '—';
    return points.map((p) => `(${p[0]}, ${p[1]})`).join(', ');
}

// A system (graph_inequality_system) response has no single studentPoints array —
// the answer is N boundaries. Summarize each plotted boundary with its shaded
// side + dashed/solid style, so the teacher sees what the student graphed.
// Prose, not the raw field values in brackets — "[left, dashed]" read like a
// debug dump (ux-lens 10: name by the user's concept).
function formatSystemParts(
    parts: { studentPoints: [number, number][]; side: string; strict: boolean }[],
): string {
    if (parts.length === 0) return '—';
    return parts
        .map(
            (p) =>
                `${formatPoints(p.studentPoints)} — shaded ${p.side}, ${
                    p.strict ? 'dashed' : 'solid'
                } boundary`,
        )
        .join(' · ');
}

// Endpoint-style labels for ray/segment answers. A label map (not raw field
// interpolation) so a future enum value renders as "?" instead of leaking.
const ENDPOINT_LABELS: Record<string, string> = {
    open: 'open',
    closed: 'closed',
};
const endpointLabel = (s: string): string => ENDPOINT_LABELS[s] ?? '?';

// A functions-system (plot_function_system) response: one curve per part. Show
// each curve's points, re-fit to its equation with the same engine that scored
// it when the family is known (all curves in a system share one authored family).
function formatFunctionSystemParts(
    parts: { studentPoints: [number, number][] }[],
    family?: string,
): string {
    if (parts.length === 0) return '—';
    return parts
        .map((p, i) => {
            const eq = family ? fitStudentEquation(family, p.studentPoints) : null;
            return `curve ${i + 1}: ${formatPoints(p.studentPoints)}${eq ? ` ≈ ${eq}` : ''}`;
        })
        .join('  ·  ');
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
        </main>
    );
}

// ---- Per-submission drill-down ----------------------------------------------
//
// ONE problem-ordered list (design pass, 2026-07-18): every response type
// interleaves by ActivityIndex docOrder — the order the student saw the
// questions — replacing the old eight per-type tables (UI that mirrored
// SubmissionResponses' parallel storage maps; ux-lens 1, task over schema).
// Each item: a header line (Problem N · type badge · result · confidence),
// the prompt, then a type-specific answer body. Confidence renders only when
// this submission actually carries any (a schema field is not a dashboard
// column). Blocks no longer in the activity sort last under a labeled
// heading. GradingPanel and Checkpoints keep their places below the list.

interface DetailBlankRow {
    blankId: string;
    answer: string;
    correct: boolean;
    confidence?: ConfidenceLevel;
}

interface BlankDetail {
    canonicalAnswer: string | null; // null when no longer in the activity
    groupAnswers: string[] | null; // set when the blank is in an any-order group
    order: number;
    row: DetailBlankRow;
}

// One drill-down item — a question the student answered, whatever its type.
interface DetailItem {
    key: string;
    /** Reading-order sort key; Infinity = no longer in this activity. */
    docOrder: number;
    problemNumber: number | null;
    typeLabel: string;
    prompt: string;
    /** Header-line verdict; null for ungraded (free-text) responses. */
    result: { good: boolean; text: string } | null;
    confidence: ConfidenceLevel | null;
    body: ReactNode;
}

function TypeBadge({ label }: { label: string }) {
    return (
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
        </span>
    );
}

function ResultMark({ good, text }: { good: boolean; text: string }) {
    return (
        <span
        className={
            good ? 'font-medium text-success' : 'font-medium text-danger'
        }
        >
        {good ? '✓' : '✗'} {text}
        </span>
    );
}

// A labeled answer line ("Answer key → …" / "Student → …"). Answers keep the
// dashboard's font-mono convention; the key reads quieter than the student's.
function KV({
    label,
    strong,
    children,
}: {
    label: string;
    strong?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex gap-2 text-sm">
        <span className="w-28 flex-none pt-0.5 text-xs text-muted">
        {label}
        </span>
        <span
        className={`min-w-0 font-mono ${strong ? 'text-ink' : 'text-muted'}`}
        >
        {children}
        </span>
        </div>
    );
}

function SubmissionDetail({
    row,
    index,
}: {
    row: SubmissionRow;
    index: ActivityIndex;
}) {
    const grading = useGrading();
    const parsed = useMemo(() => {
        try {
            return { ok: true as const, value: migrateSubmissionResponses(row.responses) };
        } catch {
            return { ok: false as const };
        }
    }, [row.responses]);

    if (!parsed.ok) {
        return (
            <p className="px-4 py-3 text-sm text-danger">
            This submission's responses couldn't be read.
            </p>
        );
    }

    const responses = parsed.value;

    // Does ANY response in this submission carry confidence? Gates every
    // confidence cell/chip — an activity that never asked shows none.
    const hasConfidence =
        Object.values(responses.blanks).some((r) => r.confidence != null) ||
        [
            responses.choices,
            responses.matches,
            responses.orderings,
            responses.graphResponses,
            responses.numberLineResponses,
            responses.dataPlotResponses,
        ].some((map) =>
            map
                ? Object.values(map).some(
                      (r) => (r as { confidence?: unknown }).confidence != null,
                  )
                : false,
        );

    const items: DetailItem[] = [];

    // -- Fill-in-blank problems: one item per PROBLEM, blanks as sub-rows. ----
    const byProblem = new Map<
        string,
        {
            docOrder: number;
            problemNumber: number | null;
            prompt: string;
            blanks: BlankDetail[];
        }
    >();
    for (const [blankId, resp] of Object.entries(responses.blanks)) {
        const info = index.blanks.get(blankId);
        const problemId = info?.problemId ?? '__removed__';
        let problem = byProblem.get(problemId);
        if (!problem) {
            problem = {
                docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
                problemNumber: info?.problemNumber ?? null,
                prompt: info?.problemPrompt ?? '',
                blanks: [],
            };
            byProblem.set(problemId, problem);
        }
        problem.blanks.push({
            canonicalAnswer: info?.canonicalAnswer ?? null,
            groupAnswers: info?.groupAnswers ?? null,
            order: info?.blankOrder ?? 0,
            row: { blankId, ...resp },
        });
    }
    for (const [problemId, p] of byProblem) {
        p.blanks.sort((a, b) => {
            // Break order ties (e.g. multiple orphaned blanks that all default
            // to order 0) by blankId, so the list is deterministic rather than
            // dependent on object-key iteration order.
            if (a.order !== b.order) return a.order - b.order;
            return a.row.blankId.localeCompare(b.row.blankId);
        });
        const total = p.blanks.length;
        const good = p.blanks.filter((b) => b.row.correct).length;
        items.push({
            key: `blank-${problemId}`,
            docOrder: p.docOrder,
            problemNumber: p.problemNumber,
            typeLabel: 'Fill in the blank',
            prompt: p.prompt,
            result:
                total === 1
                    ? {
                          good: good === 1,
                          text: good === 1 ? 'correct' : 'incorrect',
                      }
                    : { good: good === total, text: `${good}/${total} correct` },
            // Per-blank confidence lives in the sub-rows, not the header.
            confidence: null,
            body: (
                <table className="w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-muted">
                <th className="py-1 pr-3 font-medium">Answer key</th>
                <th className="py-1 pr-3 font-medium">Student</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                {hasConfidence && (
                    <th className="py-1 font-medium">Confidence</th>
                )}
                </tr>
                </thead>
                <tbody>
                {p.blanks.map((b) => (
                    <tr key={b.row.blankId} className="border-t border-line">
                    <td className="py-1 pr-3 font-mono text-muted">
                    {b.groupAnswers
                        ? `${b.groupAnswers.join(' or ')} (any order)`
                        : b.canonicalAnswer ?? '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-ink">
                    {b.row.answer || (
                        <span className="text-muted">(blank)</span>
                    )}
                    </td>
                    <td className="py-1 pr-3">
                    <ResultMark
                        good={b.row.correct}
                        text={b.row.correct ? 'correct' : 'incorrect'}
                    />
                    </td>
                    {hasConfidence && (
                        <td className="py-1 text-muted">
                        {b.row.confidence
                            ? CONFIDENCE_LABELS[b.row.confidence]
                            : '—'}
                        </td>
                    )}
                    </tr>
                ))}
                </tbody>
                </table>
            ),
        });
    }

    // -- Multiple choice. -----------------------------------------------------
    for (const [blockId, resp] of Object.entries(responses.choices ?? {})) {
        const info = index.mcs.get(blockId);
        items.push({
            key: `mc-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: info?.problemNumber ?? null,
            typeLabel: 'Multiple choice',
            prompt: info?.problemPrompt ?? '',
            result: {
                good: resp.correct,
                text: resp.correct ? 'correct' : 'incorrect',
            },
            confidence: resp.confidence ?? null,
            body: (
                <>
                <KV label="Answer key">{info ? info.answerSummary : '—'}</KV>
                <KV label="Student picked" strong>
                {resp.selected
                    .map((choiceId) => {
                        const choice = info?.choices.find(
                            (c) => c.id === choiceId,
                        );
                        return choice
                            ? `${choice.letter}. ${choice.text}`
                            : '?';
                    })
                    .join(', ')}
                </KV>
                </>
            ),
        });
    }

    // -- Matching: per-pair lines, key shown beside each miss. ----------------
    for (const [blockId, resp] of Object.entries(responses.matches ?? {})) {
        const info = index.matchings.get(blockId);
        items.push({
            key: `match-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: info?.problemNumber ?? null,
            typeLabel: 'Matching',
            prompt: info?.problemPrompt ?? '',
            result: {
                good: resp.correct,
                text: `${resp.earned}/${resp.total} pairs`,
            },
            confidence: resp.confidence ?? null,
            body: (
                <div className="font-mono text-sm text-ink">
                {(info?.items ?? []).map((item) => {
                    const picked = resp.pairs[item.id];
                    const pickedText = picked
                        ? info?.targets.find((t) => t.id === picked)?.text ??
                          '?'
                        : null;
                    const correctId = info?.key[item.id];
                    const pairCorrect =
                        picked !== undefined && picked === correctId;
                    const correctText = correctId
                        ? info?.targets.find((t) => t.id === correctId)
                              ?.text ?? '?'
                        : '—';
                    return (
                        <span key={item.id} className="block">
                        {item.text} →{' '}
                        {pickedText ?? (
                            <span className="text-muted">(unmatched)</span>
                        )}{' '}
                        {pairCorrect ? (
                            <span className="text-success">✓</span>
                        ) : (
                            <span className="text-danger">
                            ✗ (key: {correctText})
                            </span>
                        )}
                        </span>
                    );
                })}
                {!info && '?'}
                </div>
            ),
        });
    }

    // -- Ordering. ------------------------------------------------------------
    for (const [blockId, resp] of Object.entries(responses.orderings ?? {})) {
        const info = index.orderings.get(blockId);
        items.push({
            key: `order-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: info?.problemNumber ?? null,
            typeLabel: 'Ordering',
            prompt: info?.problemPrompt ?? '',
            result: {
                good: resp.correct,
                text: resp.correct ? 'correct' : 'incorrect',
            },
            confidence: resp.confidence ?? null,
            body: (
                <>
                <KV label="Correct order">{info?.answerSummary ?? '—'}</KV>
                <KV label="Student's order" strong>
                {resp.order
                    .map((itemId, n) => {
                        const text =
                            info?.items.find((i) => i.id === itemId)?.text ??
                            '?';
                        return `${n + 1}. ${text}`;
                    })
                    .join('  ')}
                </KV>
                </>
            ),
        });
    }

    // -- Interactive graphs. --------------------------------------------------
    for (const [blockId, resp] of Object.entries(
        responses.graphResponses ?? {},
    )) {
        const info = index.graphs.get(blockId);
        items.push({
            key: `graph-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: info?.problemNumber ?? null,
            typeLabel: 'Graph',
            prompt: info?.problemPrompt ?? '',
            result: {
                good: resp.correct,
                text: resp.correct ? 'correct' : 'incorrect',
            },
            confidence: resp.confidence ?? null,
            body: (
                <>
                <KV label="Answer key">{info ? info.answerSummary : '—'}</KV>
                <KV label="Student plotted" strong>
                {resp.type === 'graph_inequality_system' ? (
                    formatSystemParts(resp.parts)
                ) : resp.type === 'plot_function_system' ? (
                    formatFunctionSystemParts(resp.parts, info?.functionFamily)
                ) : (
                    <>
                    {formatPoints(resp.studentPoints)}
                    {resp.type === 'plot_function' &&
                        info?.functionFamily &&
                        (() => {
                            // The points the student placed, re-fit into the curve
                            // they define — same engine that scored them.
                            const eq = fitStudentEquation(
                                info.functionFamily,
                                resp.studentPoints,
                            );
                            return eq ? ` ≈ ${eq}` : '';
                        })()}
                    {(resp.type === 'plot_ray' || resp.type === 'plot_segment') &&
                        resp.shape &&
                        ` — drew ${
                            resp.shape === 'segment'
                                ? 'a segment'
                                : `a ray ${rayGlyphFor(resp.studentPoints, resp.shape)}`
                        }`}
                    {resp.type === 'plot_ray' &&
                        ` (${endpointLabel(resp.fromStyle)} endpoint)`}
                    {resp.type === 'plot_segment' &&
                        ` (${endpointLabel(resp.endpoints[0])} start, ${endpointLabel(resp.endpoints[1])} end)`}
                    </>
                )}
                </KV>
                </>
            ),
        });
    }

    // -- Number lines. --------------------------------------------------------
    for (const [blockId, resp] of Object.entries(
        responses.numberLineResponses ?? {},
    )) {
        const info = index.numberLines.get(blockId);
        items.push({
            key: `nl-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: info?.problemNumber ?? null,
            typeLabel: 'Number line',
            prompt: info?.problemPrompt ?? '',
            result: {
                good: resp.correct,
                text: resp.correct ? 'correct' : 'incorrect',
            },
            confidence: resp.confidence ?? null,
            body: (
                <>
                <KV label="Answer key">{info ? info.answerSummary : '—'}</KV>
                <KV label="Student answer" strong>
                {resp.type === 'plot_point'
                    ? resp.studentPoints.join(', ')
                    : formatNumberLineInterval(resp)}
                </KV>
                </>
            ),
        });
    }

    // -- Data plots. ----------------------------------------------------------
    for (const [blockId, resp] of Object.entries(
        responses.dataPlotResponses ?? {},
    )) {
        const info = index.dataPlots.get(blockId);
        items.push({
            key: `dp-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: info?.problemNumber ?? null,
            typeLabel: 'Data plot',
            prompt: info?.problemPrompt ?? '',
            result: {
                good: resp.correct,
                text: resp.correct ? 'correct' : 'incorrect',
            },
            confidence: resp.confidence ?? null,
            body: (
                <>
                <KV label="Answer key">{info ? info.answerSummary : '—'}</KV>
                <KV label="Student answer" strong>
                {resp.type === 'build_histogram'
                    ? formatBins(resp.studentBins)
                    : resp.type === 'build_boxplot'
                      ? formatFive(resp.studentFive)
                      : resp.type === 'build_dotplot'
                        ? formatDotValues(resp.studentValues)
                        : '—'}
                </KV>
                </>
            ),
        });
    }

    // -- Free text (reflection / short answer / essay): ungraded here, no
    //    result mark — rubric grading lives in GradingPanel below. -----------
    for (const [blockId, resp] of Object.entries(
        responses.freeResponses ?? {},
    )) {
        const info = index.freeText.get(blockId);
        items.push({
            key: `free-${blockId}`,
            docOrder: info?.docOrder ?? Number.POSITIVE_INFINITY,
            problemNumber: null,
            typeLabel: FREE_TEXT_LABELS[info?.blockType ?? 'self_explanation'],
            prompt: info?.problemPrompt ?? '',
            result: null,
            confidence: null,
            body: (
                <p className="whitespace-pre-wrap text-sm text-ink">
                {resp.text}
                </p>
            ),
        });
    }

    // Reading order; everything the current activity no longer contains
    // (docOrder Infinity) sinks below the live questions, deterministically.
    items.sort((a, b) => {
        if (a.docOrder !== b.docOrder) return a.docOrder - b.docOrder;
        return a.key.localeCompare(b.key);
    });

    const checkpoints = responses.checkpointResults
    ? Object.entries(responses.checkpointResults)
    .map(([sectionId, r]) => ({
        sectionId,
        info: index.sections.get(sectionId),
        result: r,
    }))
    .sort((a, b) => {
        const ao = a.info?.order ?? Infinity;
        const bo = b.info?.order ?? Infinity;
        // Guard Infinity - Infinity = NaN when two checkpoints both
        // reference sections no longer in the activity.
        if (ao !== bo) return ao - bo;
        return a.sectionId.localeCompare(b.sectionId);
    })
    : [];

    return (
        <div className="border-t border-line bg-surface px-4 py-3">
        {items.length === 0 ? (
            <p className="text-sm text-muted">No responses recorded.</p>
        ) : (
            <div className="divide-y divide-line">
            {items.map((item) => (
                <div key={item.key} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-2">
                {item.docOrder === Number.POSITIVE_INFINITY ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    No longer in this activity
                    </p>
                ) : item.problemNumber != null ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Problem {item.problemNumber}
                    </p>
                ) : null}
                <TypeBadge label={item.typeLabel} />
                {item.result && (
                    <ResultMark
                        good={item.result.good}
                        text={item.result.text}
                    />
                )}
                {hasConfidence && item.confidence && (
                    <span className="ml-auto text-xs text-muted">
                    Confidence: {CONFIDENCE_LABELS[item.confidence]}
                    </span>
                )}
                </div>
                {item.prompt && (
                    <p className="mt-0.5 text-sm text-strong">
                    {item.prompt}
                    </p>
                )}
                <div className="mt-1.5 space-y-0.5">{item.body}</div>
                </div>
            ))}
            </div>
        )}

        <GradingPanel
            submissionId={row.id}
            blocks={gradableBlocks(
                index,
                responses,
                grading?.grades.get(row.id),
            )}
        />

        {checkpoints.length > 0 && (
            <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Checkpoints
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-strong">
            {checkpoints.map((c) => (
                <li key={c.sectionId}>
                {c.info?.title ??
                    (c.info ? `Section ${c.info.order}` : 'Section')}
                {': '}
                <span className="font-medium">
                {c.result.score}/{c.result.total}
                </span>{' '}
                <span className="text-xs text-muted">
                checked {formatWhen(c.result.checkedAt)}
                </span>
                </li>
            ))}
            </ul>
            </div>
        )}
        </div>
    );
}

// Test-only seam: the drill-down is a pure component (row + index in, DOM
// out), so tests pin its ordering/badge/confidence contract directly without
// the route's data loading. App code never imports this — pages reach the
// detail through SummaryRow / AttemptRow.
export { SubmissionDetail as SubmissionDetailForTest };

// ---- Expandable rows --------------------------------------------------------

function Chevron({ open }: { open: boolean }) {
    return (
        <span className="text-xs text-faint">{open ? '▲' : '▼'}</span>
    );
}

function SummaryRow({
    group,
    resolveIndex,
}: {
    group: StudentGroup;
    resolveIndex: IndexResolver;
}) {
    const [open, setOpen] = useState(false);
    // The summary expands the latest attempt, so index against the version that
    // attempt was answered against.
    const index = resolveIndex(group.latest.activity_version_id);
    return (
        <>
        <tr
        className="cursor-pointer border-t border-line hover:bg-surface"
        onClick={() => setOpen((o) => !o)}
        >
        <td className="py-2 pl-3 pr-3">
        <span className="flex items-center gap-2">
        <Chevron open={open} />
        <span className="font-medium text-ink">{group.label}</span>
        </span>
        </td>
        <td className="py-2 pr-3 font-medium text-ink">
        {formatScore(group.latest.score)}
        </td>
        <td className="py-2 pr-3 text-muted">
        {formatScore(group.best.score)}
        </td>
        <td className="py-2 pr-3 text-muted">{group.count}</td>
        <td className="py-2 pr-3 text-xs text-muted">
        {formatWhen(group.latest.submitted_at)}
        </td>
        </tr>
        {open && (
            <tr>
            <td colSpan={5} className="p-0">
            <SubmissionDetail row={group.latest} index={index} />
            </td>
            </tr>
        )}
        </>
    );
}

function AttemptRow({
    row,
    resolveIndex,
}: {
    row: SubmissionRow;
    resolveIndex: IndexResolver;
}) {
    const [open, setOpen] = useState(false);
    const index = resolveIndex(row.activity_version_id);
    return (
        <div className="rounded-md border border-line bg-canvas">
        <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface"
        >
        <span className="flex items-center gap-2">
        <Chevron open={open} />
        <span className="font-medium text-strong">
        Attempt {row.attempt_number}
        </span>
        <span className="text-xs text-muted">
        {formatWhen(row.submitted_at)}
        </span>
        </span>
        <span className="font-medium text-ink">
        {formatScore(row.score)}
        </span>
        </button>
        {open && <SubmissionDetail row={row} index={index} />}
        </div>
    );
}

// ---- Page -------------------------------------------------------------------

export default function Submissions() {
    const { id } = useParams();
    const { session } = useSession();
    const gradedBy = session?.user.id ?? null;
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    const [view, setView] = useState<ViewMode>('summary');
    // Grades live outside loadState so a save can update one entry without a
    // reload. Keyed submissionId → blockId → grade.
    const [grades, setGrades] = useState<GradesBySubmission>(new Map());
    const [needsGradingOnly, setNeedsGradingOnly] = useState(false);

    useEffect(() => {
        if (!id || !UUID_RE.test(id)) {
            setLoadState({ status: 'not_found' });
            return;
        }
        setGrades(new Map());
        setNeedsGradingOnly(false);
        // Reset synchronously so switching activities (e.g. browser back/forward
        // between two /submissions URLs) doesn't render the previous activity's
        // rows under the new id until the fetch resolves.
        setLoadState({ status: 'loading' });
        let cancelled = false;
        (async () => {
            // Activity: title + the current published content. This is the
            // fallback index for legacy rows that predate version pinning;
            // version-pinned rows are indexed against their own version below.
            const { data: actData, error: actErr } = await supabase
            .from('activities')
            .select('id, title, draft_content, current_version_id')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
            if (cancelled) return;
            if (actErr) {
                setLoadState({ status: 'error', message: actErr.message });
                return;
            }
            if (!actData) {
                setLoadState({ status: 'not_found' });
                return;
            }
            const act = actData as {
                title: string;
                draft_content: unknown;
                current_version_id: string | null;
            };

            let content: unknown = act.draft_content;
            if (act.current_version_id) {
                const { data: vData, error: vErr } = await supabase
                .from('activity_versions')
                .select('content')
                .eq('id', act.current_version_id)
                .single();
                if (cancelled) return;
                if (vErr || !vData) {
                    setLoadState({
                        status: 'error',
                        message: "Couldn't load the published version of this activity.",
                    });
                    return;
                }
                content = (vData as { content: unknown }).content;
            }

            const parsedDoc = ActivityDocument.safeParse(content);
            if (!parsedDoc.success) {
                setLoadState({
                    status: 'error',
                    message: 'This activity could not be read for indexing.',
                });
                return;
            }
            const fallbackIndex = buildActivityIndex(parsedDoc.data);

            // Submissions for this activity. RLS restricts rows to the owner.
            const { data: subData, error: subErr } = await supabase
            .from('submissions')
            .select(
                'id, display_name, opaque_token, responses, score, submitted_at, attempt_number, activity_version_id',
            )
            .eq('activity_id', id)
            .order('submitted_at', { ascending: false });
            if (cancelled) return;
            if (subErr) {
                setLoadState({ status: 'error', message: subErr.message });
                return;
            }

            // `score` is a Postgres numeric(5,4); PostgREST serializes numeric
            // as a JSON string, so coerce to a real number here to match
            // SubmissionRow's typed contract (otherwise comparisons/formatting
            // operate on strings).
            const rows: SubmissionRow[] = (
                (subData ?? []) as Array<
                    Omit<SubmissionRow, 'score'> & { score: string | number | null }
                >
            ).map((r) => ({
                ...r,
                score: r.score == null ? null : Number(r.score),
            }));

            // Index each submission against the version it was actually answered
            // against. Collect the distinct versions the rows reference (other
            // than the current one, which fallbackIndex already covers), load
            // their content, and build one index apiece. Rows with a null or
            // unparseable/missing version fall back to the current version.
            const indexByVersion = new Map<string, ActivityIndex>();
            if (act.current_version_id) {
                indexByVersion.set(act.current_version_id, fallbackIndex);
            }
            const neededVersionIds = [
                ...new Set(
                    rows
                    .map((r) => r.activity_version_id)
                    .filter(
                        (v): v is string =>
                        v != null && !indexByVersion.has(v),
                    ),
                ),
            ];
            if (neededVersionIds.length > 0) {
                const { data: versData, error: versErr } = await supabase
                .from('activity_versions')
                .select('id, content')
                .in('id', neededVersionIds);
                if (cancelled) return;
                if (versErr) {
                    setLoadState({ status: 'error', message: versErr.message });
                    return;
                }
                for (const v of (versData ?? []) as Array<{
                    id: string;
                    content: unknown;
                }>) {
                    const parsed = ActivityDocument.safeParse(v.content);
                    // A version that no longer parses (e.g. predates a schema
                    // change) is simply skipped; the resolver falls back to the
                    // current version for rows that referenced it.
                    if (parsed.success) {
                        indexByVersion.set(v.id, buildActivityIndex(parsed.data));
                    }
                }
            }

            const resolveIndex: IndexResolver = (versionId) =>
            (versionId != null && indexByVersion.get(versionId)) || fallbackIndex;

            // Does any indexed version carry a rubric-bearing block? Gates the
            // "Needs grading" filter + affects nothing else when false.
            const hasGradableContent = [
                fallbackIndex,
                ...indexByVersion.values(),
            ].some((idx) =>
                [...idx.freeText.values()].some((info) => info.rubric != null),
            );

            setLoadState({
                status: 'ready',
                data: {
                    title: act.title,
                    resolveIndex,
                    groups: groupSubmissions(rows),
                    hasGradableContent,
                },
            });

            // Grades load separately (and tolerantly): pre-migration-0010 this
            // 404s, which just means everything reads as ungraded.
            if (hasGradableContent && rows.length > 0) {
                try {
                    const g = await loadGrades(rows.map((r) => r.id));
                    if (!cancelled) setGrades(g);
                } catch {
                    /* grades table not present yet, or read error — stay empty */
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loadState.status === 'loading') {
        return (
            <Shell>
            <p className="text-muted">Loading submissions…</p>
            </Shell>
        );
    }

    if (loadState.status === 'not_found') {
        return (
            <Shell>
            <h1 className="text-2xl font-bold text-ink">Activity not found</h1>
            <p className="mt-2 text-muted">
            It may have been deleted, or you don't have access to it.
            </p>
            <Link
            to="/activities"
            className="mt-4 inline-block text-sm font-medium text-strong underline underline-offset-2 hover:text-ink"
            >
            ← Back to my activities
            </Link>
            </Shell>
        );
    }

    if (loadState.status === 'error') {
        return (
            <Shell>
            <h1 className="text-2xl font-bold text-ink">
            Couldn't load submissions
            </h1>
            <p className="mt-2 text-muted">{loadState.message}</p>
            <Link
            to="/activities"
            className="mt-4 inline-block text-sm font-medium text-strong underline underline-offset-2 hover:text-ink"
            >
            ← Back to my activities
            </Link>
            </Shell>
        );
    }

    const { title, resolveIndex, groups, hasGradableContent } = loadState.data;
    const totalSubmissions = groups.reduce((n, g) => n + g.count, 0);

    // Merge one saved grade into the map (optimistic; the DB trigger already
    // stamped it). A fresh Map so React sees the change.
    const onGradeSaved = (saved: BlockGrade) => {
        setGrades((prev) => {
            const next = new Map(prev);
            const bySub = new Map(next.get(saved.submissionId) ?? []);
            bySub.set(saved.blockId, saved);
            next.set(saved.submissionId, bySub);
            return next;
        });
    };

    // A group needs grading when its LATEST attempt (the summary headline) has an
    // answered rubric block that isn't fully graded. Unreadable responses are
    // treated as not-needing (nothing we can grade).
    const groupNeedsGrading = (g: StudentGroup): boolean => {
        try {
            const responses = migrateSubmissionResponses(g.latest.responses);
            const idx = resolveIndex(g.latest.activity_version_id);
            return submissionNeedsGrading(idx, responses, grades.get(g.latest.id));
        } catch {
            return false;
        }
    };

    const visibleGroups =
        needsGradingOnly && hasGradableContent
            ? groups.filter(groupNeedsGrading)
            : groups;

    return (
        <Shell>
        <div className="flex items-center justify-between">
        <Link
        to={`/activity/${id}`}
        className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
        >
        ← Back to editor
        </Link>
        <Link
        to="/activities"
        className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
        >
        All activities
        </Link>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-ink">Submissions</h1>
        <p className="mt-1 text-sm text-muted">
        {title} · {totalSubmissions} submission
        {totalSubmissions === 1 ? '' : 's'} from {groups.length} student
        {groups.length === 1 ? '' : 's'}
        </p>

        {groups.length === 0 ? (
            <p className="mt-8 text-muted">
            No submissions yet. Once students submit this activity, they'll show
            up here.
            </p>
        ) : (
            <>
            <div
            role="tablist"
            aria-label="Submission view"
            className="mt-6 inline-flex rounded-md border border-line-strong bg-canvas p-0.5 text-sm"
            >
            <button
            type="button"
            role="tab"
            aria-selected={view === 'summary'}
            onClick={() => setView('summary')}
            className={`rounded px-3 py-1 font-medium transition ${
                view === 'summary'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-ink'
            }`}
            >
            Summary
            </button>
            <button
            type="button"
            role="tab"
            aria-selected={view === 'all'}
            onClick={() => setView('all')}
            className={`rounded px-3 py-1 font-medium transition ${
                view === 'all'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-ink'
            }`}
            >
            All attempts
            </button>
            </div>

            {hasGradableContent && (
                <label className="ml-3 inline-flex items-center gap-1.5 text-sm text-muted">
                <input
                type="checkbox"
                checked={needsGradingOnly}
                onChange={(e) => setNeedsGradingOnly(e.target.checked)}
                />
                Needs grading only
                </label>
            )}

            <GradingProvider value={{ grades, gradedBy, onSaved: onGradeSaved }}>
            {visibleGroups.length === 0 ? (
                <p className="mt-6 text-sm text-muted">
                Nothing needs grading — every written response is graded.
                </p>
            ) : view === 'summary' ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-line bg-canvas shadow-sm">
                <table className="w-full text-sm">
                <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pl-3 pr-3 font-medium">Student</th>
                <th className="py-2 pr-3 font-medium">Latest</th>
                <th className="py-2 pr-3 font-medium">Best</th>
                <th className="py-2 pr-3 font-medium">Attempts</th>
                <th className="py-2 pr-3 font-medium">Last submitted</th>
                </tr>
                </thead>
                <tbody>
                {visibleGroups.map((g) => (
                    <SummaryRow key={g.key} group={g} resolveIndex={resolveIndex} />
                ))}
                </tbody>
                </table>
                </div>
            ) : (
                <div className="mt-4 space-y-5">
                {visibleGroups.map((g) => (
                    <div key={g.key}>
                    <p className="mb-1.5 text-sm font-semibold text-ink">
                    {g.label}{' '}
                    <span className="text-xs font-normal text-muted">
                    {g.count} attempt{g.count === 1 ? '' : 's'}
                    </span>
                    </p>
                    <div className="space-y-1.5">
                    {[...g.attempts]
                        .sort((a, b) => b.attempt_number - a.attempt_number)
                        .map((row) => (
                            <AttemptRow key={row.id} row={row} resolveIndex={resolveIndex} />
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            )}
            </GradingProvider>
            </>
        )}
        </Shell>
    );
}
