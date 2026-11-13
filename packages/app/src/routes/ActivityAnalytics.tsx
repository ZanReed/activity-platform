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
// Job health USED to be on this page (a nightly job that quietly stops is this
// system's classic failure — 0022 found the purge job had never worked). C-6
// moved it off the teacher page: the weekly CI-health routine reads
// analytics_job_runs instead, so it still reaches someone who can fix it.
// =============================================================================

import ActivityResultsHeader from '../components/ActivityResultsHeader';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { supabase } from '../lib/supabase';
import { labelFor, NOT_QUESTIONS, UNATTRIBUTED } from '../lib/analyticsLabels';

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
    // `job` (the nightly run) is still returned; C-6 took it off this page.
}


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

// C-6 (ui-review-group-c.md): the maintenance-job health line and the
// `pnpm backfill:census` hint were developer text on a teacher page; the job's
// health is watched by the weekly CI-health routine instead.

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
            {/* C-7: one header across the activity's results pages. */}
            <ActivityResultsHeader activityId={id ?? ''} current="analytics" />
            <h1 className="mb-6 text-xl font-semibold text-ink">Analytics</h1>

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

                    {/* C-6: the old note named a developer command; this says
                        the same fact in a teacher's words. */}
                    {!data.censused && (
                        <p className="mb-6 rounded-lg border border-line bg-surface-2 p-4 text-sm text-muted">
                            The question breakdown for the latest version appears once a
                            student has opened it.
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
                                attempt once. &ldquo;Students&rdquo; counts each student
                                whose latest attempt reaches that question.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[34rem] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-line text-left text-muted">
                                            <th className="py-2 pr-3 font-medium">Question type</th>
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
                                        {data.keys
                                            .filter((k) => !NOT_QUESTIONS.has(k.census_key) || k.verdicts_all > 0)
                                            .map((k) => (
                                            <tr
                                                key={k.census_key}
                                                className="border-b border-line last:border-0"
                                            >
                                                <td className="py-2 pr-3 text-ink" title={k.census_key}>
                                                    {labelFor(k.census_key)}
                                                    {k.census_key === UNATTRIBUTED && (
                                                        <span className="ml-2 text-xs text-muted">
                                                            checked before the breakdown was counted
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
