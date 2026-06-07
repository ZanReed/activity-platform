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
// answer key from the activity's current published version (buildActivityIndex),
// so the teacher reads "Problem 3: simplify ____ → answer 3x, student wrote 2x ✗"
// instead of a raw UUID. Blanks that a later edit removed are labeled as no
// longer present. No cross-student aggregation here — that's Phase 2.
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
import { supabase } from '../lib/supabase';
import {
    buildActivityIndex,
    groupSubmissions,
    formatScore,
    type ActivityIndex,
    type StudentGroup,
    type SubmissionRow,
} from '../lib/submissions';

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
    unsure: 'Unsure',
    think_so: 'Think so',
    certain: 'Certain',
};

interface LoadedData {
    title: string;
    index: ActivityIndex;
    groups: StudentGroup[];
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
            order: info?.blankOrder ?? 0,
            row: { blankId, ...resp },
        });
    }

    const problems = [...byProblem.values()].sort((a, b) => {
        if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
        return a.prompt.localeCompare(b.prompt);
    });
    for (const p of problems) p.blanks.sort((a, b) => a.order - b.order);

    const checkpoints = responses.checkpointResults
    ? Object.entries(responses.checkpointResults)
    .map(([sectionId, r]) => ({
        sectionId,
        info: index.sections.get(sectionId),
        result: r,
    }))
    .sort(
        (a, b) =>
        (a.info?.order ?? Infinity) - (b.info?.order ?? Infinity),
    )
    : [];

    const blankCount = Object.keys(responses.blanks).length;

    return (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        {blankCount === 0 ? (
            <p className="text-sm text-slate-500">No blank responses recorded.</p>
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
                    {b.canonicalAnswer ?? '—'}
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
    index,
}: {
    group: StudentGroup;
    index: ActivityIndex;
}) {
    const [open, setOpen] = useState(false);
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
    index,
}: {
    row: SubmissionRow;
    index: ActivityIndex;
}) {
    const [open, setOpen] = useState(false);
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
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    const [view, setView] = useState<ViewMode>('summary');

    useEffect(() => {
        if (!id || !UUID_RE.test(id)) {
            setLoadState({ status: 'not_found' });
            return;
        }
        let cancelled = false;
        (async () => {
            // Activity: title + the content to index. The index should reflect
            // what students submitted against — the current published version —
            // falling back to the draft if the activity was never published.
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
            const index = buildActivityIndex(parsedDoc.data);

            // Submissions for this activity. RLS restricts rows to the owner.
            const { data: subData, error: subErr } = await supabase
            .from('submissions')
            .select(
                'id, display_name, opaque_token, responses, score, submitted_at, attempt_number',
            )
            .eq('activity_id', id)
            .order('submitted_at', { ascending: false });
            if (cancelled) return;
            if (subErr) {
                setLoadState({ status: 'error', message: subErr.message });
                return;
            }

            const rows = (subData ?? []) as SubmissionRow[];
            setLoadState({
                status: 'ready',
                data: { title: act.title, index, groups: groupSubmissions(rows) },
            });
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

    const { title, index, groups } = loadState.data;
    const totalSubmissions = groups.reduce((n, g) => n + g.count, 0);

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

            {view === 'summary' ? (
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
                {groups.map((g) => (
                    <SummaryRow key={g.key} group={g} index={index} />
                ))}
                </tbody>
                </table>
                </div>
            ) : (
                <div className="mt-4 space-y-5">
                {groups.map((g) => (
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
                            <AttemptRow key={row.id} row={row} index={index} />
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            )}
            </>
        )}
        </Shell>
    );
}
