// =============================================================================
// Bank.tsx — the Activity Bank (/bank): browse the listed activities and add a
// copy to your own library (docs/design/activity-bank.md, BK-1…BK-10)
// -----------------------------------------------------------------------------
// Copy-on-use, "like the importer does": "Add to my library" makes an activity
// the teacher OWNS, already published (BK-2), so it can be shared to a class at
// once and edited freely. Everything a teacher needs to decide before adding
// is here: a static preview of the student view (BankPreview, print mode —
// see its header for why not screen mode) and the teacher guide.
//
// Order is the catalogue's teaching order: list_bank sorts course → unit →
// source path → title, and this page keeps it (filters remove rows, never
// reorder them).
// =============================================================================

import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { teacherGuideToTiptap } from '../lib/serialize';
import {
    BANK_LICENSE,
    copyBankActivity,
    getBankTeacherGuide,
    listBank,
    type BankEntry,
} from '../lib/bank';
import { PEDAGOGICAL_ROLE_LABELS, asPedagogicalRole } from '../lib/pedagogicalRole';
import type { JSONContent } from '@tiptap/react';

const BankPreview = lazy(() => import('../components/BankPreview'));
const TeacherGuideEditor = lazy(() => import('../editor/TeacherGuideEditor'));

const TYPE_LABELS: Record<string, string> = {
    exit_ticket: 'Exit ticket',
    warm_up: 'Warm-up',
    review: 'Review',
};

const ACTION =
    'text-xs font-medium text-muted underline underline-offset-2 hover:text-strong';

type Panel = { id: string; kind: 'preview' | 'guide' } | null;

type GuideState =
    | { phase: 'loading' }
    | { phase: 'ready'; doc: JSONContent | null }
    | { phase: 'error'; message: string };

function GuidePanel({ activityId }: { activityId: string }) {
    const [state, setState] = useState<GuideState>({ phase: 'loading' });
    useEffect(() => {
        let cancelled = false;
        getBankTeacherGuide(activityId)
            .then((guide) => {
                if (!cancelled) {
                    setState({ phase: 'ready', doc: guide ? teacherGuideToTiptap(guide) : null });
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setState({
                        phase: 'error',
                        message: err instanceof Error ? err.message : 'Could not load the guide.',
                    });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [activityId]);

    if (state.phase === 'loading') return <p className="text-sm text-muted">Loading the guide…</p>;
    if (state.phase === 'error') {
        return <p className="text-sm text-danger" role="alert">Couldn’t load the guide: {state.message}</p>;
    }
    if (!state.doc) return <p className="text-sm text-muted">This activity has no teacher guide.</p>;
    return (
        <div data-bank-guide>
            <TeacherGuideEditor initialContent={state.doc} editable={false} />
        </div>
    );
}

export default function Bank() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<BankEntry[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [course, setCourse] = useState<string>('');
    const [panel, setPanel] = useState<Panel>(null);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        listBank()
            .then((rows) => {
                if (!cancelled) setEntries(rows);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Could not load the Activity Bank.');
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const courses = useMemo(
        () => [...new Set((entries ?? []).map((e) => e.course))],
        [entries],
    );

    // Filters remove rows, never reorder them (teaching order is the point).
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (entries ?? []).filter(
            (e) =>
                (!course || e.course === course) &&
                (!q ||
                    e.title.toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q)) ||
                    (e.unit ?? '').toLowerCase().includes(q)),
        );
    }, [entries, query, course]);

    // Group consecutive rows by course + unit, preserving list_bank's order.
    const groups = useMemo(() => {
        const out: { key: string; course: string; unit: string | null; rows: BankEntry[] }[] = [];
        for (const e of visible) {
            const key = `${e.course}\u0000${e.unit ?? ''}`;
            const last = out[out.length - 1];
            if (last && last.key === key) last.rows.push(e);
            else out.push({ key, course: e.course, unit: e.unit, rows: [e] });
        }
        return out;
    }, [visible]);

    const handleAdd = async (entry: BankEntry) => {
        setAddError(null);
        setAddingId(entry.id);
        try {
            const newId = await copyBankActivity(entry.id);
            navigate(`/activity/${newId}`, { state: { fromBank: entry.title } });
        } catch (err) {
            setAddError(
                `Couldn’t add “${entry.title}”: ${err instanceof Error ? err.message : 'unknown error'}`,
            );
            setAddingId(null);
        }
    };

    const toggle = (id: string, kind: 'preview' | 'guide') =>
        setPanel((cur) => (cur && cur.id === id && cur.kind === kind ? null : { id, kind }));

    return (
        <main className="min-h-screen bg-surface p-8">
            <div className="mx-auto max-w-3xl">
                <Link
                    to="/activities"
                    className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
                >
                    ← My activities
                </Link>
                <h1 className="mt-3 text-2xl font-bold text-ink">Activity Bank</h1>
                <p className="mt-1 text-sm text-muted">
                    Ready-made activities, in teaching order. <strong>Add to my library</strong> makes
                    a copy that is yours: share it with a class straight away, or change anything
                    first. Shared under {BANK_LICENSE}.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <input
                        type="search"
                        aria-label="Search the Activity Bank"
                        placeholder="Search titles, units, tags"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="min-w-[14rem] flex-1 rounded-md border border-line-strong bg-canvas px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    {courses.length > 1 && (
                        <select
                            aria-label="Course"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink"
                        >
                            <option value="">All courses</option>
                            {courses.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {addError && (
                    <p className="mt-3 text-sm text-danger" role="alert">
                        {addError}
                    </p>
                )}

                <div className="mt-6 space-y-6">
                    {loadError ? (
                        <p className="text-sm text-danger" role="alert">
                            {loadError}
                        </p>
                    ) : entries === null ? (
                        <p className="text-sm text-muted">Loading the Activity Bank…</p>
                    ) : entries.length === 0 ? (
                        <p className="text-sm text-muted">Nothing is in the Activity Bank yet.</p>
                    ) : groups.length === 0 ? (
                        <p className="text-sm text-muted">No activities match.</p>
                    ) : (
                        groups.map((group) => (
                            <section key={group.key} aria-label={`${group.course} — ${group.unit ?? 'No unit'}`}>
                                <h2 className="border-b border-line pb-1.5 text-sm font-semibold text-ink">
                                    {courses.length > 1 ? `${group.course} — ` : ''}
                                    {group.unit ?? 'No unit'}
                                </h2>
                                <ul className="mt-1.5 overflow-hidden rounded-lg border border-line bg-canvas">
                                    {group.rows.map((e, i) => {
                                        const role = asPedagogicalRole(e.pedagogical_role);
                                        const typeLabel = TYPE_LABELS[e.activity_type];
                                        const open = panel && panel.id === e.id ? panel.kind : null;
                                        return (
                                            <li
                                                key={e.id}
                                                className={`px-3.5 py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
                                                data-bank-entry={e.id}
                                            >
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                    <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                                                        {e.title}
                                                    </span>
                                                    {role && (
                                                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-accent">
                                                            {PEDAGOGICAL_ROLE_LABELS[role]}
                                                        </span>
                                                    )}
                                                    {typeLabel && (
                                                        <span className="text-xs text-muted">{typeLabel}</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className={ACTION}
                                                        aria-expanded={open === 'preview'}
                                                        onClick={() => toggle(e.id, 'preview')}
                                                    >
                                                        Preview
                                                    </button>
                                                    {e.has_guide && (
                                                        <button
                                                            type="button"
                                                            className={ACTION}
                                                            aria-expanded={open === 'guide'}
                                                            onClick={() => toggle(e.id, 'guide')}
                                                        >
                                                            Teacher guide
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleAdd(e)}
                                                        disabled={addingId !== null}
                                                        className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {addingId === e.id ? 'Adding…' : 'Add to my library'}
                                                    </button>
                                                </div>
                                                {e.description && (
                                                    <p className="mt-1 text-xs text-muted">{e.description}</p>
                                                )}
                                                {open && (
                                                    <div className="mt-3">
                                                        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
                                                            {open === 'preview' ? (
                                                                <BankPreview activityId={e.id} />
                                                            ) : (
                                                                <GuidePanel activityId={e.id} />
                                                            )}
                                                        </Suspense>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
