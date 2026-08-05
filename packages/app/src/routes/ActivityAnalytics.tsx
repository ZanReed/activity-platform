// =============================================================================
// ActivityAnalytics.tsx — the /activity/:id/analytics route (S7)
// -----------------------------------------------------------------------------
// The teacher-facing end of the analytics census: what this activity is MADE
// of (per block kind, from the census of the current published version) and
// how students are doing on each kind (computed live from section_checks).
//
// Deliberately one screen, not a dashboard. Every named consumer of this data
// — the solution-unlock pedagogy pass, the free-activity catalog, per-skill
// analytics — is backlogged, so designing a full analytics surface now would
// be designing for readers who don't exist. This proves the pipeline end to
// end and gives the one teacher on the platform something true to look at.
//
// TWO NUMBERS, NEITHER HIDDEN. Checking is formative: students re-check freely
// and every check re-scores the whole section, so "correct across all attempts"
// counts a student's mastered item once per attempt. "Latest attempt" is the
// closer read of where the class ended up. Which of these deserves to become a
// stored, purge-surviving rollup is an open ruling (it rides with the
// teacher-grading slice), so this screen reports both and picks neither.
//
// JOB HEALTH IS ON THE PAGE ON PURPOSE. A nightly maintenance job that quietly
// stops is this system's classic failure (0022 found the purge job had never
// worked). Postgres notices vanish in a day and nobody reads cron logs, so the
// last run shows up here, where someone actually looks.
// =============================================================================

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { supabase } from '../lib/supabase';

interface AnalyticsKey {
    census_key: string;
    /** Instances of this kind in the CURRENT version; null = the kind appears
     * only in check history (the teacher removed or replaced it). */
    block_count: number | null;
    verdicts_all: number;
    correct_all: number;
    incorrect_all: number;
    recorded_all: number;
    verdicts_latest: number;
    correct_latest: number;
    incorrect_latest: number;
    recorded_latest: number;
    students: number;
}

interface AnalyticsPayload {
    activity_id: string;
    current_version_id: string | null;
    censused: boolean;
    keys: AnalyticsKey[];
    totals: { checks: number; students: number; last_check_at: string | null };
    job: {
        last_run_at: string;
        stale_cache_rows_deleted: number;
        section_check_rows: number;
    } | null;
}

/** The bucket for a check item no census row explains — a check recorded
 * against a version whose census hasn't been written yet. Never silently
 * dropped: an invisible gap would read as "nothing to see here". */
const UNATTRIBUTED = '_unattributed';

function formatWhen(iso: string | null): string {
    if (!iso) return 'never';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function percent(correct: number, of: number): string {
    if (of === 0) return '—';
    return `${Math.round((correct / of) * 100)}%`;
}

/** How long past its daily schedule a run has to be before this reads as a
 * problem rather than a gap. The job runs at 03:30 UTC, so anything past ~36h
 * has genuinely missed a night. */
const STALE_AFTER_HOURS = 36;

/**
 * What to say about the nightly maintenance job.
 *
 * This exists because a silently-dead scheduled job is this system's classic
 * failure — `purge_soft_deleted` went unscheduled from the project's start and
 * nobody noticed for months, because the only evidence was a Postgres notice
 * nobody reads. So the run shows up on a screen someone opens.
 *
 * The one thing this must NOT do is guess at causes. An earlier version said
 * "the nightly analytics job is not scheduled yet" whenever there was no ledger
 * row — which was wrong the moment the job WAS scheduled and simply hadn't
 * fired, and would have sent a reader off to re-schedule something already
 * scheduled. The ledger knows whether the job has RUN. It knows nothing about
 * whether it is scheduled, so this says only what it can see.
 */
function jobHealth(job: AnalyticsPayload['job']): string {
    if (!job) {
        return 'The nightly maintenance job has not run yet.';
    }
    const ranAt = new Date(job.last_run_at);
    const hoursAgo = (Date.now() - ranAt.getTime()) / 3_600_000;
    const base = `Maintenance last ran ${formatWhen(job.last_run_at)} · ${job.section_check_rows.toLocaleString()} checks stored`;
    return hoursAgo > STALE_AFTER_HOURS
        ? `${base} — that is more than a day ago, so the nightly job may have stopped.`
        : base;
}

/** Human label for a census key: `data_plot.build_histogram` reads as
 * "data plot · build histogram". The key itself stays visible in a title
 * attribute — it is the vocabulary the database speaks. */
function labelFor(key: string): string {
    if (key === UNATTRIBUTED) return 'Not yet attributed';
    return key
        .split('.')
        .map((part) => part.replace(/_/g, ' '))
        .join(' · ');
}

export default function ActivityAnalytics() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<AnalyticsPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const { data: result, error: rpcError } = await supabase.rpc(
                'get_activity_analytics',
                { p_activity_id: id },
            );
            if (cancelled) return;
            if (rpcError) {
                // The RPC answers "not yours" and "doesn't exist" with the same
                // message by design; don't dress it up as something more
                // specific than the server was willing to say.
                setError(rpcError.message);
                setData(null);
            } else {
                setError(null);
                setData(result as AnalyticsPayload);
            }
            setLoading(false);
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold text-ink">Activity analytics</h1>
                <Link
                    to={`/activity/${id}`}
                    className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
                >
                    Back to editor
                </Link>
            </div>

            {loading && <p className="text-sm text-muted">Loading…</p>}

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-line bg-surface-2 p-4 text-sm text-danger"
                >
                    Couldn&rsquo;t load analytics: {error}
                </div>
            )}

            {data && !loading && !error && (
                <>
                    <section className="mb-6 grid grid-cols-3 gap-3">
                        <Stat label="Checks" value={String(data.totals.checks)} />
                        <Stat label="Students" value={String(data.totals.students)} />
                        <Stat
                            label="Last check"
                            value={formatWhen(data.totals.last_check_at)}
                        />
                    </section>

                    {!data.censused && (
                        <p className="mb-6 rounded-lg border border-line bg-surface-2 p-4 text-sm text-muted">
                            No census yet for the current version. It is written the first
                            time a student opens this activity — or run{' '}
                            <code className="text-strong">pnpm backfill:census</code> to
                            count it now.
                        </p>
                    )}

                    {data.keys.length === 0 ? (
                        <p className="text-sm text-muted">
                            Nothing to report yet: no student has checked a section of this
                            activity.
                        </p>
                    ) : (
                        <>
                            <p className="mb-3 text-sm text-muted">
                                Students re-check as often as they like, so &ldquo;all
                                attempts&rdquo; counts a question each time it was checked.
                                &ldquo;Latest&rdquo; counts each student&rsquo;s most recent
                                attempt once.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[34rem] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-line text-left text-muted">
                                            <th className="py-2 pr-3 font-medium">Block kind</th>
                                            <th className="py-2 pr-3 font-medium">In activity</th>
                                            <th className="py-2 pr-3 font-medium">Students</th>
                                            <th className="py-2 pr-3 font-medium">
                                                Correct (latest)
                                            </th>
                                            <th className="py-2 font-medium">
                                                Correct (all attempts)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.keys.map((k) => (
                                            <tr
                                                key={k.census_key}
                                                className="border-b border-line last:border-0"
                                            >
                                                <td className="py-2 pr-3 text-ink" title={k.census_key}>
                                                    {labelFor(k.census_key)}
                                                    {k.census_key === UNATTRIBUTED && (
                                                        <span className="ml-2 text-xs text-muted">
                                                            checks on a version with no census
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-3 text-muted">
                                                    {k.block_count ?? '—'}
                                                </td>
                                                <td className="py-2 pr-3 text-muted">{k.students}</td>
                                                <td className="py-2 pr-3 text-ink">
                                                    {percent(k.correct_latest, k.verdicts_latest)}
                                                    <span className="ml-1 text-xs text-muted">
                                                        ({k.correct_latest}/{k.verdicts_latest})
                                                    </span>
                                                </td>
                                                <td className="py-2 text-muted">
                                                    {percent(k.correct_all, k.verdicts_all)}
                                                    <span className="ml-1 text-xs">
                                                        ({k.correct_all}/{k.verdicts_all})
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    <p className="mt-8 text-xs text-muted">
                        {jobHealth(data.job)}
                    </p>
                </>
            )}
        </main>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-line bg-canvas p-3">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-lg font-semibold text-ink">{value}</div>
        </div>
    );
}
