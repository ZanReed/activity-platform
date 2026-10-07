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

import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { teacherGuideToTiptap } from '../lib/serialize';
import {
    BANK_LICENSE,
    copyBankActivity,
    getBankTeacherGuide,
    getMyPublicName,
    isBankLister,
    listBank,
    setPublicName,
    type BankEntry,
    type PublicName,
} from '../lib/bank';
import {
    PEDAGOGICAL_ROLES,
    PEDAGOGICAL_ROLE_LABELS,
    asPedagogicalRole,
    type PedagogicalRole,
} from '../lib/pedagogicalRole';
import { useSession } from '../lib/SessionContext';
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

// The author's name on their Bank cards (0055, BK-13): OPT-IN. Shown only to
// teachers who can list, since only a lister's name ever reaches a card.
function NameControl() {
    const { session } = useSession();
    const userId = session?.user.id ?? null;
    const [current, setCurrent] = useState<PublicName | null>(null);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        getMyPublicName(userId)
            .then((n) => {
                if (!cancelled) setCurrent(n);
            })
            .catch(() => {
                if (!cancelled) setCurrent({ name: null, optedIn: false });
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    if (!current) return null;

    const save = async (value: string) => {
        setBusy(true);
        setError(null);
        try {
            setCurrent(await setPublicName(value));
            setEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save the name.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-4 rounded-md border border-line bg-canvas px-3 py-2 text-xs text-muted" data-bank-name>
            {editing ? (
                <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void save(draft);
                    }}
                >
                    <label htmlFor="bank-public-name" className="font-medium text-strong">
                        Your name on activities you list
                    </label>
                    <input
                        id="bank-public-name"
                        type="text"
                        maxLength={80}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="e.g. Ms Rivera"
                        className="min-w-[10rem] flex-1 rounded-md border border-line-strong bg-canvas px-2 py-1 text-sm text-ink"
                    />
                    <button type="submit" disabled={busy} className="font-medium text-strong underline underline-offset-2">
                        {busy ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="underline underline-offset-2">
                        Cancel
                    </button>
                    <p className="w-full">
                        Other teachers see it on the activities you list. Your students already see your
                        account name on your activities’ sign-in screen. Leave it empty to stay unnamed in the Bank.
                    </p>
                </form>
            ) : (
                <span>
                    {current.optedIn && current.name ? (
                        <>
                            Activities you list show <strong className="text-strong">by {current.name}</strong>.
                        </>
                    ) : (
                        'Activities you list show no name.'
                    )}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setDraft(current.optedIn ? (current.name ?? '') : '');
                            setEditing(true);
                        }}
                        className="font-medium text-strong underline underline-offset-2"
                    >
                        {current.optedIn ? 'Change' : 'Add your name'}
                    </button>
                    {current.optedIn && (
                        <>
                            {' · '}
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void save('')}
                                className="underline underline-offset-2"
                            >
                                Hide my name
                            </button>
                        </>
                    )}
                </span>
            )}
            {error && (
                <p className="mt-1 text-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

const NO_AUTHOR = '\u0000no-author';
const TAG_LIMIT = 12;

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={on}
            onClick={onClick}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                on ? 'border-accent bg-accent text-white' : 'border-line bg-canvas text-muted hover:text-strong'
            }`}
        >
            {children}
        </button>
    );
}

function toggleIn<T>(set: ReadonlySet<T>, value: T): ReadonlySet<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
}

export default function Bank() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<BankEntry[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [course, setCourse] = useState<string>('');
    const [roles, setRoles] = useState<ReadonlySet<PedagogicalRole>>(new Set());
    const [tags, setTags] = useState<ReadonlySet<string>>(new Set());
    const [guideOnly, setGuideOnly] = useState(false);
    const [author, setAuthor] = useState<string>('');
    const [showAllTags, setShowAllTags] = useState(false);
    const [lister, setLister] = useState(false);
    const [panel, setPanel] = useState<Panel>(null);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void isBankLister().then((ok) => {
            if (!cancelled) setLister(ok);
        });
        return () => {
            cancelled = true;
        };
    }, []);

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

    // Tag chips, most-used first; the long tail behind "More tags".
    const tagCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const e of entries ?? []) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [entries]);
    const shownTags = showAllTags ? tagCounts : tagCounts.slice(0, TAG_LIMIT);

    const roleOptions = useMemo(
        () => PEDAGOGICAL_ROLES.filter((r) => (entries ?? []).some((e) => e.pedagogical_role === r)),
        [entries],
    );
    const authors = useMemo(() => {
        const names = new Set<string>();
        let unnamed = false;
        for (const e of entries ?? []) {
            if (e.author_name) names.add(e.author_name);
            else unnamed = true;
        }
        return { names: [...names].sort((a, b) => a.localeCompare(b)), unnamed };
    }, [entries]);
    const showAuthorFilter = authors.names.length + (authors.unnamed ? 1 : 0) > 1;

    // Filters remove rows, never reorder them (teaching order is the point).
    // Across filters: AND. Within the tag chips: ANY of the chosen tags.
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (entries ?? []).filter(
            (e) =>
                (!course || e.course === course) &&
                (roles.size === 0 || roles.has(e.pedagogical_role as PedagogicalRole)) &&
                (tags.size === 0 || e.tags.some((t) => tags.has(t))) &&
                (!guideOnly || e.has_guide) &&
                (!author || (author === NO_AUTHOR ? !e.author_name : e.author_name === author)) &&
                (!q ||
                    e.title.toLowerCase().includes(q) ||
                    e.tags.some((t) => t.toLowerCase().includes(q)) ||
                    (e.unit ?? '').toLowerCase().includes(q) ||
                    (e.author_name ?? '').toLowerCase().includes(q)),
        );
    }, [entries, query, course, roles, tags, guideOnly, author]);

    const filtering =
        query.trim() !== '' || course !== '' || roles.size > 0 || tags.size > 0 || guideOnly || author !== '';
    const clearFilters = () => {
        setQuery('');
        setCourse('');
        setRoles(new Set());
        setTags(new Set());
        setGuideOnly(false);
        setAuthor('');
    };

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

                {lister && <NameControl />}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <input
                        type="search"
                        aria-label="Search the Activity Bank"
                        placeholder="Search titles, units, tags, authors"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="min-w-[14rem] flex-1 rounded-md border border-line-strong bg-canvas px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    {courses.length > 1 && (
                        <select
                            aria-label="Subject"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink"
                        >
                            <option value="">All subjects</option>
                            {courses.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    )}
                    {showAuthorFilter && (
                        <select
                            aria-label="Author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink"
                        >
                            <option value="">All authors</option>
                            {authors.names.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                            {authors.unnamed && <option value={NO_AUTHOR}>Unnamed</option>}
                        </select>
                    )}
                </div>

                {entries && entries.length > 0 && (
                    <div className="mt-3 space-y-2" data-bank-filters>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {roleOptions.length > 1 &&
                                roleOptions.map((r) => (
                                    <Chip key={r} on={roles.has(r)} onClick={() => setRoles((cur) => toggleIn(cur, r))}>
                                        {PEDAGOGICAL_ROLE_LABELS[r]}
                                    </Chip>
                                ))}
                            <label className="ml-1 flex items-center gap-1.5 text-xs text-muted">
                                <input type="checkbox" checked={guideOnly} onChange={(e) => setGuideOnly(e.target.checked)} />
                                Has a teacher guide
                            </label>
                        </div>
                        {tagCounts.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5" aria-label="Topic tags" role="group">
                                {shownTags.map(([t]) => (
                                    <Chip key={t} on={tags.has(t)} onClick={() => setTags((cur) => toggleIn(cur, t))}>
                                        {t}
                                    </Chip>
                                ))}
                                {tagCounts.length > TAG_LIMIT && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllTags((v) => !v)}
                                        className="text-xs font-medium text-muted underline underline-offset-2 hover:text-strong"
                                    >
                                        {showAllTags ? 'Fewer tags' : `More tags (${tagCounts.length - TAG_LIMIT})`}
                                    </button>
                                )}
                            </div>
                        )}
                        {filtering && (
                            <p className="text-xs text-muted" role="status">
                                Showing {visible.length} of {entries.length}.{' '}
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="font-medium text-strong underline underline-offset-2"
                                >
                                    Clear filters
                                </button>
                            </p>
                        )}
                    </div>
                )}

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
                                                {e.author_name && (
                                                    <p className="mt-0.5 text-xs text-muted">by {e.author_name}</p>
                                                )}
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
