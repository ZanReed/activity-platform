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
function formatSystemParts(
    parts: { studentPoints: [number, number][]; side: string; strict: boolean }[],
): string {
    if (parts.length === 0) return '—';
    return parts
        .map((p) => `${formatPoints(p.studentPoints)} [${p.side}, ${p.strict ? 'dashed' : 'solid'}]`)
        .join('  ·  ');
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
        </main>
    );
}

// ---- Per-submission drill-down ----------------------------------------------

interface DetailBlankRow {
    blankId: string;
    answer: string;
    correct: boolean;
    confidence?: ConfidenceLevel;
}

interface DetailProblem {
    problemId: string;
    heading: string;
    prompt: string;
    sortKey: number; // problemNumber, or Infinity for unknown/removed
    blanks: Array<{
        canonicalAnswer: string | null; // null when no longer in the activity
        groupAnswers: string[] | null; // set when the blank is in an any-order group
        order: number;
        row: DetailBlankRow;
    }>;
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
            <p className="px-4 py-3 text-sm text-red-600">
            This submission's responses couldn't be read.
            </p>
        );
    }

    const responses = parsed.value;

    // Group blank responses by their problem, using the activity index.
    const byProblem = new Map<string, DetailProblem>();
    const REMOVED = '__removed__';
    for (const [blankId, resp] of Object.entries(responses.blanks)) {
        const info = index.blanks.get(blankId);
        const problemId = info?.problemId ?? REMOVED;
        let problem = byProblem.get(problemId);
        if (!problem) {
            problem = info
            ? {
                problemId,
                heading: info.problemNumber
                ? `Problem ${info.problemNumber}`
                : 'Problem',
                prompt: info.problemPrompt,
                sortKey: info.problemNumber ?? Number.POSITIVE_INFINITY,
                blanks: [],
            }
            : {
                problemId: REMOVED,
                heading: 'No longer in this activity',
                prompt: '',
                sortKey: Number.POSITIVE_INFINITY,
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

    const problems = [...byProblem.values()].sort((a, b) => {
        // The "No longer in this activity" group always sorts last, even below
        // a real but unnumbered problem (both have sortKey Infinity, and the
        // removed group's empty prompt would otherwise win the localeCompare).
        const aRemoved = a.problemId === REMOVED;
        const bRemoved = b.problemId === REMOVED;
        if (aRemoved !== bRemoved) return aRemoved ? 1 : -1;
        if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
        return a.prompt.localeCompare(b.prompt);
    });
    for (const p of problems) {
        p.blanks.sort((a, b) => {
            // Break order ties (e.g. multiple orphaned blanks that all default
            // to order 0) by blankId, so the list is deterministic rather than
            // dependent on object-key iteration order.
            if (a.order !== b.order) return a.order - b.order;
            return a.row.blankId.localeCompare(b.row.blankId);
        });
    }

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

    const blankCount = Object.keys(responses.blanks).length;

    // Multiple-choice responses, ordered by problem number then id. Selected
    // choice ids resolve to letters + text through the activity index; a
    // choice id no longer in the document renders as "?".
    const mcRows = responses.choices
        ? Object.entries(responses.choices)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.mcs.get(blockId),
                  resp,
              }))
              .sort((a, b) => {
                  const an = a.info?.problemNumber ?? Infinity;
                  const bn = b.info?.problemNumber ?? Infinity;
                  if (an !== bn) return an - bn;
                  return a.blockId.localeCompare(b.blockId);
              })
        : [];

    // Matching responses, ordered by problem number then id. Pair ids resolve
    // to item/target TEXT through the activity index (no letters — published
    // letters follow the publish-time shuffle, which the dashboard doesn't
    // re-derive); an id no longer in the document renders as "?".
    const matchRows = responses.matches
        ? Object.entries(responses.matches)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.matchings.get(blockId),
                  resp,
              }))
              .sort((a, b) => {
                  const an = a.info?.problemNumber ?? Infinity;
                  const bn = b.info?.problemNumber ?? Infinity;
                  if (an !== bn) return an - bn;
                  return a.blockId.localeCompare(b.blockId);
              })
        : [];

    // Ordering responses, ordered by problem number then id.
    const orderingRows = responses.orderings
        ? Object.entries(responses.orderings)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.orderings.get(blockId),
                  resp,
              }))
              .sort((a, b) => {
                  const an = a.info?.problemNumber ?? Infinity;
                  const bn = b.info?.problemNumber ?? Infinity;
                  if (an !== bn) return an - bn;
                  return a.blockId.localeCompare(b.blockId);
              })
        : [];

    // Interactive-graph responses (Stage 5), ordered by problem number then id.
    const graphRows = responses.graphResponses
        ? Object.entries(responses.graphResponses)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.graphs.get(blockId),
                  resp,
              }))
              .sort((a, b) => {
                  const an = a.info?.problemNumber ?? Infinity;
                  const bn = b.info?.problemNumber ?? Infinity;
                  if (an !== bn) return an - bn;
                  return a.blockId.localeCompare(b.blockId);
              })
        : [];

    // Number-line responses (1-D), ordered by problem number then id.
    const numberLineRows = responses.numberLineResponses
        ? Object.entries(responses.numberLineResponses)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.numberLines.get(blockId),
                  resp,
              }))
              .sort((a, b) => {
                  const an = a.info?.problemNumber ?? Infinity;
                  const bn = b.info?.problemNumber ?? Infinity;
                  if (an !== bn) return an - bn;
                  return a.blockId.localeCompare(b.blockId);
              })
        : [];

    // Data-plot responses (stats charts), ordered by problem number then id.
    const dataPlotRows = responses.dataPlotResponses
        ? Object.entries(responses.dataPlotResponses)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.dataPlots.get(blockId),
                  resp,
              }))
              .sort((a, b) => {
                  const an = a.info?.problemNumber ?? Infinity;
                  const bn = b.info?.problemNumber ?? Infinity;
                  if (an !== bn) return an - bn;
                  return a.blockId.localeCompare(b.blockId);
              })
        : [];

    // Free-text responses (self_explanation / short_answer / essay) — no answer
    // key / result / confidence. Sorted by block id (these carry no problem
    // number). short_answer/essay await manual grading (a later slice); for now
    // all render as raw text with a type badge.
    const freeRows = responses.freeResponses
        ? Object.entries(responses.freeResponses)
              .map(([blockId, resp]) => ({
                  blockId,
                  info: index.freeText.get(blockId),
                  resp,
              }))
              .sort((a, b) => a.blockId.localeCompare(b.blockId))
        : [];

    return (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        {blankCount === 0 &&
        graphRows.length === 0 &&
        numberLineRows.length === 0 &&
        dataPlotRows.length === 0 &&
        mcRows.length === 0 &&
        matchRows.length === 0 &&
        orderingRows.length === 0 &&
        freeRows.length === 0 ? (
            <p className="text-sm text-slate-500">No responses recorded.</p>
        ) : (
            <div className="space-y-4">
            {problems.map((p) => (
                <div key={p.problemId}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {p.heading}
                </p>
                {p.prompt && (
                    <p className="mt-0.5 text-sm text-slate-700">{p.prompt}</p>
                )}
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Answer key</th>
                <th className="py-1 pr-3 font-medium">Student</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {p.blanks.map((b) => (
                    <tr
                    key={b.row.blankId}
                    className="border-t border-slate-200"
                    >
                    <td className="py-1 pr-3 font-mono text-slate-600">
                    {b.groupAnswers
                        ? `${b.groupAnswers.join(' or ')} (any order)`
                        : b.canonicalAnswer ?? '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {b.row.answer || (
                        <span className="text-slate-400">(blank)</span>
                    )}
                    </td>
                    <td className="py-1 pr-3">
                    {b.row.correct ? (
                        <span className="font-medium text-green-700">
                        ✓ correct
                        </span>
                    ) : (
                        <span className="font-medium text-red-600">
                        ✗ incorrect
                        </span>
                    )}
                    </td>
                    <td className="py-1 text-slate-600">
                    {b.row.confidence
                        ? CONFIDENCE_LABELS[b.row.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            ))}

            {mcRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Multiple choice
                </p>
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Problem</th>
                <th className="py-1 pr-3 font-medium">Answer key</th>
                <th className="py-1 pr-3 font-medium">Student picked</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {mcRows.map((m) => (
                    <tr key={m.blockId} className="border-t border-slate-200">
                    <td className="py-1 pr-3 text-slate-700">
                    {m.info?.problemNumber != null
                        ? `Problem ${m.info.problemNumber}`
                        : 'Question'}
                    {m.info?.problemPrompt && (
                        <span className="block text-xs text-slate-400">
                        {m.info.problemPrompt}
                        </span>
                    )}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-600">
                    {m.info ? m.info.answerSummary : '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {m.resp.selected
                        .map((choiceId) => {
                            const choice = m.info?.choices.find(
                                (c) => c.id === choiceId,
                            );
                            return choice
                                ? `${choice.letter}. ${choice.text}`
                                : '?';
                        })
                        .join(', ')}
                    </td>
                    <td className="py-1 pr-3">
                    {m.resp.correct ? (
                        <span className="font-medium text-green-700">✓ correct</span>
                    ) : (
                        <span className="font-medium text-red-600">✗ incorrect</span>
                    )}
                    </td>
                    <td className="py-1 text-slate-600">
                    {m.resp.confidence
                        ? CONFIDENCE_LABELS[m.resp.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            )}

            {matchRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Matching
                </p>
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Problem</th>
                <th className="py-1 pr-3 font-medium">Student&apos;s pairs</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {matchRows.map((m) => (
                    <tr key={m.blockId} className="border-t border-slate-200">
                    <td className="py-1 pr-3 text-slate-700">
                    {m.info?.problemNumber != null
                        ? `Problem ${m.info.problemNumber}`
                        : 'Question'}
                    {m.info?.problemPrompt && (
                        <span className="block text-xs text-slate-400">
                        {m.info.problemPrompt}
                        </span>
                    )}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {(m.info?.items ?? []).map((item) => {
                        const picked = m.resp.pairs[item.id];
                        const pickedText = picked
                            ? m.info?.targets.find((t) => t.id === picked)
                                  ?.text ?? '?'
                            : null;
                        const correctId = m.info?.key[item.id];
                        const pairCorrect =
                            picked !== undefined && picked === correctId;
                        const correctText = correctId
                            ? m.info?.targets.find((t) => t.id === correctId)
                                  ?.text ?? '?'
                            : '—';
                        return (
                            <span key={item.id} className="block">
                            {item.text} →{' '}
                            {pickedText ?? (
                                <span className="text-slate-400">
                                (unmatched)
                                </span>
                            )}{' '}
                            {pairCorrect ? (
                                <span className="text-green-700">✓</span>
                            ) : (
                                <span className="text-red-600">
                                ✗ (key: {correctText})
                                </span>
                            )}
                            </span>
                        );
                    })}
                    {!m.info && '?'}
                    </td>
                    <td className="py-1 pr-3">
                    <span
                        className={
                            m.resp.correct
                                ? 'font-medium text-green-700'
                                : 'font-medium text-red-600'
                        }
                    >
                    {m.resp.earned} / {m.resp.total} pairs
                    </span>
                    </td>
                    <td className="py-1 text-slate-600">
                    {m.resp.confidence
                        ? CONFIDENCE_LABELS[m.resp.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            )}

            {orderingRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ordering
                </p>
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Problem</th>
                <th className="py-1 pr-3 font-medium">Correct order</th>
                <th className="py-1 pr-3 font-medium">Student&apos;s order</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {orderingRows.map((o) => (
                    <tr key={o.blockId} className="border-t border-slate-200">
                    <td className="py-1 pr-3 text-slate-700">
                    {o.info?.problemNumber != null
                        ? `Problem ${o.info.problemNumber}`
                        : 'Question'}
                    {o.info?.problemPrompt && (
                        <span className="block text-xs text-slate-400">
                        {o.info.problemPrompt}
                        </span>
                    )}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-600">
                    {o.info?.answerSummary ?? '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {o.resp.order
                        .map((itemId, n) => {
                            const text =
                                o.info?.items.find((i) => i.id === itemId)
                                    ?.text ?? '?';
                            return `${n + 1}. ${text}`;
                        })
                        .join('  ')}
                    </td>
                    <td className="py-1 pr-3">
                    {o.resp.correct ? (
                        <span className="font-medium text-green-700">✓ correct</span>
                    ) : (
                        <span className="font-medium text-red-600">✗ incorrect</span>
                    )}
                    </td>
                    <td className="py-1 text-slate-600">
                    {o.resp.confidence
                        ? CONFIDENCE_LABELS[o.resp.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            )}

            {graphRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Graph questions
                </p>
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Problem</th>
                <th className="py-1 pr-3 font-medium">Answer key</th>
                <th className="py-1 pr-3 font-medium">Student plotted</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {graphRows.map((g) => (
                    <tr key={g.blockId} className="border-t border-slate-200">
                    <td className="py-1 pr-3 text-slate-700">
                    {g.info?.problemNumber != null
                        ? `Problem ${g.info.problemNumber}`
                        : 'Graph'}
                    {g.info?.problemPrompt && (
                        <span className="block text-xs text-slate-400">
                        {g.info.problemPrompt}
                        </span>
                    )}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-600">
                    {g.info ? g.info.answerSummary : '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {g.resp.type === 'graph_inequality_system' ? (
                        formatSystemParts(g.resp.parts)
                    ) : (
                        <>
                        {formatPoints(g.resp.studentPoints)}
                        {g.resp.type === 'plot_function' &&
                            g.info?.functionFamily &&
                            (() => {
                                // The points the student placed, re-fit into the curve
                                // they define — same engine that scored them.
                                const eq = fitStudentEquation(
                                    g.info.functionFamily,
                                    g.resp.studentPoints,
                                );
                                return eq ? ` ≈ ${eq}` : '';
                            })()}
                        {(g.resp.type === 'plot_ray' || g.resp.type === 'plot_segment') &&
                            g.resp.shape &&
                            ` — drew ${
                                g.resp.shape === 'segment'
                                    ? 'a segment'
                                    : `a ray ${rayGlyphFor(g.resp.studentPoints, g.resp.shape)}`
                            }`}
                        {g.resp.type === 'plot_ray' && ` (${g.resp.fromStyle} endpoint)`}
                        {g.resp.type === 'plot_segment' &&
                            ` (${g.resp.endpoints[0]} start, ${g.resp.endpoints[1]} end)`}
                        </>
                    )}
                    </td>
                    <td className="py-1 pr-3">
                    {g.resp.correct ? (
                        <span className="font-medium text-green-700">✓ correct</span>
                    ) : (
                        <span className="font-medium text-red-600">✗ incorrect</span>
                    )}
                    </td>
                    <td className="py-1 text-slate-600">
                    {g.resp.confidence
                        ? CONFIDENCE_LABELS[g.resp.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            )}

            {numberLineRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Number line
                </p>
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Problem</th>
                <th className="py-1 pr-3 font-medium">Answer key</th>
                <th className="py-1 pr-3 font-medium">Student answer</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {numberLineRows.map((n) => (
                    <tr key={n.blockId} className="border-t border-slate-200">
                    <td className="py-1 pr-3 text-slate-700">
                    {n.info?.problemNumber != null
                        ? `Problem ${n.info.problemNumber}`
                        : 'Number line'}
                    {n.info?.problemPrompt && (
                        <span className="block text-xs text-slate-400">
                        {n.info.problemPrompt}
                        </span>
                    )}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-600">
                    {n.info ? n.info.answerSummary : '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {n.resp.type === 'plot_point'
                        ? n.resp.studentPoints.join(', ')
                        : formatNumberLineInterval(n.resp)}
                    </td>
                    <td className="py-1 pr-3">
                    {n.resp.correct ? (
                        <span className="font-medium text-green-700">✓ correct</span>
                    ) : (
                        <span className="font-medium text-red-600">✗ incorrect</span>
                    )}
                    </td>
                    <td className="py-1 text-slate-600">
                    {n.resp.confidence
                        ? CONFIDENCE_LABELS[n.resp.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            )}

            {dataPlotRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data plot
                </p>
                <table className="mt-2 w-full text-sm">
                <thead>
                <tr className="text-left text-xs text-slate-400">
                <th className="py-1 pr-3 font-medium">Problem</th>
                <th className="py-1 pr-3 font-medium">Answer key</th>
                <th className="py-1 pr-3 font-medium">Student answer</th>
                <th className="py-1 pr-3 font-medium">Result</th>
                <th className="py-1 font-medium">Confidence</th>
                </tr>
                </thead>
                <tbody>
                {dataPlotRows.map((d) => (
                    <tr key={d.blockId} className="border-t border-slate-200">
                    <td className="py-1 pr-3 text-slate-700">
                    {d.info?.problemNumber != null
                        ? `Problem ${d.info.problemNumber}`
                        : 'Data plot'}
                    {d.info?.problemPrompt && (
                        <span className="block text-xs text-slate-400">
                        {d.info.problemPrompt}
                        </span>
                    )}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-600">
                    {d.info ? d.info.answerSummary : '—'}
                    </td>
                    <td className="py-1 pr-3 font-mono text-slate-900">
                    {d.resp.type === 'build_histogram'
                        ? formatBins(d.resp.studentBins)
                        : d.resp.type === 'build_boxplot'
                          ? formatFive(d.resp.studentFive)
                          : d.resp.type === 'build_dotplot'
                            ? formatDotValues(d.resp.studentValues)
                            : '—'}
                    </td>
                    <td className="py-1 pr-3">
                    {d.resp.correct ? (
                        <span className="font-medium text-green-700">✓ correct</span>
                    ) : (
                        <span className="font-medium text-red-600">✗ incorrect</span>
                    )}
                    </td>
                    <td className="py-1 text-slate-600">
                    {d.resp.confidence
                        ? CONFIDENCE_LABELS[d.resp.confidence]
                        : '—'}
                    </td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>
            )}

            {freeRows.length > 0 && (
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Written responses
                </p>
                <div className="mt-2 space-y-2">
                {freeRows.map((f) => (
                    <div
                    key={f.blockId}
                    className="border-t border-slate-200 pt-2"
                    >
                    <div className="flex items-baseline gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {FREE_TEXT_LABELS[f.info?.blockType ?? 'self_explanation']}
                    </span>
                    {f.info?.problemPrompt && (
                        <p className="text-xs text-slate-400">
                        {f.info.problemPrompt}
                        </p>
                    )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                    {f.resp.text}
                    </p>
                    </div>
                ))}
                </div>
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
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Checkpoints
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                {checkpoints.map((c) => (
                    <li key={c.sectionId}>
                    {c.info?.title ??
                        (c.info ? `Section ${c.info.order}` : 'Section')}
                    {': '}
                    <span className="font-medium">
                    {c.result.score}/{c.result.total}
                    </span>{' '}
                    <span className="text-xs text-slate-400">
                    checked {formatWhen(c.result.checkedAt)}
                    </span>
                    </li>
                ))}
                </ul>
                </div>
            )}
            </div>
        )}
        </div>
    );
}

// ---- Expandable rows --------------------------------------------------------

function Chevron({ open }: { open: boolean }) {
    return (
        <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
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
        className="cursor-pointer border-t border-slate-200 hover:bg-slate-50"
        onClick={() => setOpen((o) => !o)}
        >
        <td className="py-2 pl-3 pr-3">
        <span className="flex items-center gap-2">
        <Chevron open={open} />
        <span className="font-medium text-slate-900">{group.label}</span>
        </span>
        </td>
        <td className="py-2 pr-3 font-medium text-slate-900">
        {formatScore(group.latest.score)}
        </td>
        <td className="py-2 pr-3 text-slate-600">
        {formatScore(group.best.score)}
        </td>
        <td className="py-2 pr-3 text-slate-600">{group.count}</td>
        <td className="py-2 pr-3 text-xs text-slate-500">
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
        <div className="rounded-md border border-slate-200 bg-white">
        <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
        >
        <span className="flex items-center gap-2">
        <Chevron open={open} />
        <span className="font-medium text-slate-700">
        Attempt {row.attempt_number}
        </span>
        <span className="text-xs text-slate-400">
        {formatWhen(row.submitted_at)}
        </span>
        </span>
        <span className="font-medium text-slate-900">
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
            <p className="text-slate-500">Loading submissions…</p>
            </Shell>
        );
    }

    if (loadState.status === 'not_found') {
        return (
            <Shell>
            <h1 className="text-2xl font-bold text-slate-900">Activity not found</h1>
            <p className="mt-2 text-slate-600">
            It may have been deleted, or you don't have access to it.
            </p>
            <Link
            to="/activities"
            className="mt-4 inline-block text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
            >
            ← Back to my activities
            </Link>
            </Shell>
        );
    }

    if (loadState.status === 'error') {
        return (
            <Shell>
            <h1 className="text-2xl font-bold text-slate-900">
            Couldn't load submissions
            </h1>
            <p className="mt-2 text-slate-600">{loadState.message}</p>
            <Link
            to="/activities"
            className="mt-4 inline-block text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
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
        className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
        ← Back to editor
        </Link>
        <Link
        to="/activities"
        className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
        All activities
        </Link>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Submissions</h1>
        <p className="mt-1 text-sm text-slate-500">
        {title} · {totalSubmissions} submission
        {totalSubmissions === 1 ? '' : 's'} from {groups.length} student
        {groups.length === 1 ? '' : 's'}
        </p>

        {groups.length === 0 ? (
            <p className="mt-8 text-slate-500">
            No submissions yet. Once students submit this activity, they'll show
            up here.
            </p>
        ) : (
            <>
            <div
            role="tablist"
            aria-label="Submission view"
            className="mt-6 inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-sm"
            >
            <button
            type="button"
            role="tab"
            aria-selected={view === 'summary'}
            onClick={() => setView('summary')}
            className={`rounded px-3 py-1 font-medium transition ${
                view === 'summary'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            >
            All attempts
            </button>
            </div>

            {hasGradableContent && (
                <label className="ml-3 inline-flex items-center gap-1.5 text-sm text-slate-600">
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
                <p className="mt-6 text-sm text-slate-500">
                Nothing needs grading — every written response is graded.
                </p>
            ) : view === 'summary' ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
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
                    <p className="mb-1.5 text-sm font-semibold text-slate-900">
                    {g.label}{' '}
                    <span className="text-xs font-normal text-slate-400">
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
