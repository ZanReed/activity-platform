// =============================================================================
// ActivityPrint.tsx — the /activity/:id/print route
// -----------------------------------------------------------------------------
// A teacher-facing print page. Loads the activity's current working copy (same
// draft > published-version priority as the editor), renders it through the
// renderer's print document (renderActivityForPrint), and shows it in an
// isolated <iframe srcDoc>. The iframe IS the print source — the Print button
// calls its contentWindow.print(), so the browser prints exactly the previewed
// document with its inlined @page rules, free of the app's own chrome/Tailwind.
//
// Two layers of print-time control sit in a no-print sidebar:
//   - Preference overrides (paper size, columns, margin, body size, spacing,
//     work space). These are SESSION-ONLY — they tweak how this printout looks
//     without touching the saved document. The saved print config (authored in
//     the editor) is the baseline; an override shadows one field. "Reset"
//     clears them. Header fields aren't here — those are authored in the editor.
//   - "Show answers": the answer-key variant, where every blank prints
//     prefilled with its canonical answer.
//
// All of this runs client-side: the renderer is imported directly, so this page
// needs no Edge Function and no redeploy to work or to change.
// =============================================================================

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { renderActivityForPrint } from '@activity/renderer';
import { ActivityDocument, type PrintConfig } from '@activity/schema';
import { supabase } from '../lib/supabase';

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The subset of print fields exposed as session overrides here. Header toggles
// and custom labels are authored in the editor, not overridden per-print.
type PrintOverrides = Partial<
Pick<
PrintConfig,
'paperSize' | 'columns' | 'margin' | 'fontSize' | 'problemSpacing' | 'workSpace'
>
>;

type LoadState =
| { status: 'loading' }
| { status: 'not_found' }
| { status: 'error'; message: string }
| { status: 'ready'; doc: ActivityDocument };

interface ActivityLoadRow {
    id: string;
    title: string;
    draft_content: unknown;
    current_version_id: string | null;
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl">{children}</div>
        </main>
    );
}

const LABEL_CLASS =
'text-xs font-semibold uppercase tracking-wide text-slate-500';
const HELP_CLASS = 'mt-1 text-xs text-slate-500';
const FIELD_CLASS =
'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

// A labelled number control that commits only valid, in-range input; empty or
// out-of-range entry is ignored (keeps the last good value).
function NumberControl({
    label,
    value,
    min,
    step,
    onCommit,
}: {
    label: string;
    value: number;
    min: number;
    step: number;
    onCommit: (n: number) => void;
}) {
    return (
        <label className="block">
        <span className={LABEL_CLASS}>{label}</span>
        <input
        type="number"
        min={min}
        step={step}
        className={`${FIELD_CLASS} mt-1`}
        value={value}
        onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') return;
            const n = Number(raw);
            if (Number.isFinite(n) && n >= min) onCommit(n);
        }}
        />
        </label>
    );
}

export default function ActivityPrint() {
    const { id } = useParams();
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    const [overrides, setOverrides] = useState<PrintOverrides>({});
    const [showAnswers, setShowAnswers] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!id || !UUID_RE.test(id)) {
            setLoadState({ status: 'not_found' });
            return;
        }
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
            .from('activities')
            .select('id, title, draft_content, current_version_id')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
            if (cancelled) return;

            if (error) {
                setLoadState({ status: 'error', message: error.message });
                return;
            }
            if (!data) {
                setLoadState({ status: 'not_found' });
                return;
            }

            const row = data as ActivityLoadRow;

            // Same load priority as the editor: the in-progress draft is the
            // teacher's current working copy and the most likely thing they
            // want to print; fall back to the published version when there's
            // no draft (post-publish, pre-edit).
            let raw: unknown;
            if (row.draft_content !== null) {
                raw = row.draft_content;
            } else if (row.current_version_id) {
                const { data: versionData, error: vErr } = await supabase
                .from('activity_versions')
                .select('content')
                .eq('id', row.current_version_id)
                .single();
                if (cancelled) return;
                if (vErr || !versionData) {
                    setLoadState({
                        status: 'error',
                        message: "Couldn't load this activity's content to print.",
                    });
                    return;
                }
                raw = (versionData as { content: unknown }).content;
            } else {
                setLoadState({
                    status: 'error',
                    message: 'This activity has no content to print yet.',
                });
                return;
            }

            const parsed = ActivityDocument.safeParse(raw);
            if (!parsed.success) {
                setLoadState({
                    status: 'error',
                    message: "This activity's content could not be read.",
                });
                return;
            }
            setLoadState({ status: 'ready', doc: parsed.data });
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const doc = loadState.status === 'ready' ? loadState.doc : null;

    // The effective print config = saved baseline with any session overrides
    // shadowed on top. Memoized HTML so we only re-render the (non-trivial)
    // document string when the doc, an override, or the answer toggle changes.
    const html = useMemo(() => {
        if (!doc) return '';
        const merged: ActivityDocument = {
            ...doc,
            meta: {
                ...doc.meta,
                print: { ...doc.meta.print, ...overrides },
            },
        };
        return renderActivityForPrint(merged, { showAnswers });
    }, [doc, overrides, showAnswers]);

    const handlePrint = () => {
        const win = iframeRef.current?.contentWindow;
        if (win) {
            win.focus();
            win.print();
        }
    };

    if (loadState.status === 'loading') {
        return (
            <Shell>
            <p className="text-slate-500">Loading…</p>
            </Shell>
        );
    }
    if (loadState.status === 'not_found') {
        return (
            <Shell>
            <h1 className="text-2xl font-bold text-slate-900">
            Activity not found
            </h1>
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
            Couldn't open this activity for printing
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

    // status === 'ready' — doc is set.
    const print = loadState.doc.meta.print;
    const eff = { ...print, ...overrides };
    const hasOverrides = Object.keys(overrides).length > 0;

    return (
        <Shell>
        <div className="flex items-center justify-between">
        <Link
        to={`/activity/${id}`}
        className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
        ← Back to editor
        </Link>
        <h1 className="truncate text-lg font-bold text-slate-900">
        {loadState.doc.meta.title}
        </h1>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Controls — no-print by nature (they live in the app, not the iframe). */}
        <aside className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <button
        type="button"
        onClick={handlePrint}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
        Print
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
        type="checkbox"
        checked={showAnswers}
        onChange={(e) => setShowAnswers(e.target.checked)}
        />
        <span>Show answers (answer key)</span>
        </label>

        <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between">
        <span className={LABEL_CLASS}>Layout overrides</span>
        {hasOverrides && (
            <button
            type="button"
            onClick={() => setOverrides({})}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
            Reset
            </button>
        )}
        </div>
        <p className={HELP_CLASS}>
        Tweaks this printout only — your saved settings don't change.
        </p>

        <div className="mt-3 flex flex-col gap-3">
        <label className="block">
        <span className={LABEL_CLASS}>Paper size</span>
        <select
        className={`${FIELD_CLASS} mt-1`}
        value={eff.paperSize}
        onChange={(e) =>
            setOverrides((o) => ({
                ...o,
                paperSize: e.target.value as PrintConfig['paperSize'],
            }))
        }
        >
        <option value="letter">Letter</option>
        <option value="a4">A4</option>
        </select>
        </label>

        <label className="block">
        <span className={LABEL_CLASS}>Columns</span>
        <select
        className={`${FIELD_CLASS} mt-1`}
        value={eff.columns}
        onChange={(e) =>
            setOverrides((o) => ({
                ...o,
                columns: Number(e.target.value),
            }))
        }
        >
        <option value={1}>1 column</option>
        <option value={2}>2 columns</option>
        <option value={3}>3 columns</option>
        </select>
        </label>

        <NumberControl
        label="Margin (in)"
        value={eff.margin}
        min={0}
        step={0.25}
        onCommit={(n) => setOverrides((o) => ({ ...o, margin: n }))}
        />
        <NumberControl
        label="Body text (pt)"
        value={eff.fontSize}
        min={1}
        step={1}
        onCommit={(n) => setOverrides((o) => ({ ...o, fontSize: n }))}
        />
        <NumberControl
        label="Space between problems (rem)"
        value={eff.problemSpacing}
        min={0}
        step={0.5}
        onCommit={(n) =>
            setOverrides((o) => ({ ...o, problemSpacing: n }))
        }
        />
        <NumberControl
        label="Work space per problem (rem)"
        value={eff.workSpace}
        min={0}
        step={0.5}
        onCommit={(n) => setOverrides((o) => ({ ...o, workSpace: n }))}
        />
        </div>
        </div>
        </aside>

        {/* Preview = print source. White page on a grey mat. */}
        <iframe
        ref={iframeRef}
        title="Print preview"
        srcDoc={html}
        className="h-[80vh] w-full rounded-lg border border-slate-300 bg-white shadow-sm"
        />
        </div>
        </Shell>
    );
}
