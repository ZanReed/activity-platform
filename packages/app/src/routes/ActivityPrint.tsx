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
// The no-print sidebar carries three kinds of control:
//   - Print layout (paper size, margin, body size, spacing, work space, header
//     fields). This is the SAVED print config — the same PrintSettingsBody the
//     editor used to host, moved here (2026-07-18) so you configure the print
//     against its live preview. Edits autosave to the activity's draft (an
//     activity with no draft yet gets one, exactly like any editor edit).
//   - "Layout": worksheet (flat) vs the journal foldable. A view choice, not
//     saved.
//   - "Show answers": the answer-key variant, where every blank prints
//     prefilled with its canonical answer. A view choice, not saved.
//
// The preview + layout controls run client-side (the renderer is imported
// directly, so this page needs no Edge Function). The layout save is a plain
// activities.update, mirroring the editor's autosave.
// =============================================================================

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Link, useParams } from 'react-router';
import { renderActivityForPrint, FONTS_R2_PREFIX } from '@activity/renderer';
import { ActivityDocument, type PrintConfig } from '@activity/schema';
import { supabase } from '../lib/supabase';
import { buildFoldableDocument } from '../lib/foldable';
import { useAutosave } from '../lib/useAutosave';
import { PrintSettingsBody } from '../components/ActivityConfigDrawer';

// Where the printed document's @font-face rules point (meta.typography fonts,
// self-hosted on R2). Same base the published page uses — the preview iframe
// is its own document, so app-side fontsource CSS can't reach it. Empty when
// VITE_PUBLISHED_URL_BASE is unset (dev without R2): the print preview then
// falls back to the default stack, exactly like a published page would.
const PUBLISHED_BASE = (import.meta.env.VITE_PUBLISHED_URL_BASE ?? '').replace(
    /\/+$/,
    '',
);
const FONTS_BASE_URL = PUBLISHED_BASE
    ? `${PUBLISHED_BASE}/${FONTS_R2_PREFIX}`
    : undefined;

// The two print layouts this route offers. 'worksheet' is the flat, full-page
// document (renderActivityForPrint, synchronous). 'foldable' is the journal
// foldable (Drop D): a DOM-measured, paginated, duplex-imposed landscape booklet
// built client-side — async, because it measures real layout.
type PrintLayout = 'worksheet' | 'foldable';

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
const FIELD_CLASS =
'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function ActivityPrint() {
    const { id } = useParams();
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    // The editable, SAVED print config. Seeded from the loaded doc's meta.print;
    // edits autosave (see savePrint). null until the doc loads.
    const [print, setPrint] = useState<PrintConfig | null>(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [layout, setLayout] = useState<PrintLayout>('worksheet');
    const [foldableHtml, setFoldableHtml] = useState('');
    const [foldableStatus, setFoldableStatus] = useState<
    'idle' | 'building' | 'error'
    >('idle');
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
            setPrint(parsed.data.meta.print);
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const doc = loadState.status === 'ready' ? loadState.doc : null;

    // The effective document = the loaded body with the (editable) print config
    // applied. Shared by both layouts (the worksheet renders it directly; the
    // foldable builder measures + paginates it).
    const mergedDoc = useMemo<ActivityDocument | null>(() => {
        if (!doc || !print) return null;
        return { ...doc, meta: { ...doc.meta, print } };
    }, [doc, print]);

    // Persist a print-config edit to the activity's draft — mirrors the editor's
    // save (a read-through write of draft_content). An activity with no draft
    // yet gets one, exactly like any editor edit. useAutosave debounces; its
    // baseline (the seeded config) never triggers a save.
    const savePrint = useCallback(async () => {
        if (!id || !doc || !print) return;
        const next: ActivityDocument = {
            ...doc,
            meta: { ...doc.meta, print },
        };
        const parsed = ActivityDocument.safeParse(next);
        if (!parsed.success) {
            throw new Error('Print settings failed validation; not saved.');
        }
        const { error } = await supabase
            .from('activities')
            .update({
                draft_content: parsed.data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);
        if (error) throw error;
    }, [id, doc, print]);

    const { status: saveStatus } = useAutosave(
        print ? JSON.stringify(print) : null,
        savePrint,
    );

    // Flat worksheet HTML — synchronous, memoized so the (non-trivial) document
    // string only rebuilds when the merged doc or the answer toggle changes.
    const worksheetHtml = useMemo(
        () =>
            mergedDoc
                ? renderActivityForPrint(mergedDoc, {
                      showAnswers,
                      fontsBaseUrl: FONTS_BASE_URL,
                  })
                : '',
        [mergedDoc, showAnswers],
    );

    // Journal foldable HTML — async (DOM-measured). Rebuilt whenever the merged
    // doc or answer toggle changes while the foldable layout is active. The
    // cancelled guard drops a stale build if inputs change mid-flight.
    useEffect(() => {
        if (layout !== 'foldable' || !mergedDoc) return;
        let cancelled = false;
        setFoldableStatus('building');
        buildFoldableDocument(mergedDoc, { showAnswers, fontsBaseUrl: FONTS_BASE_URL })
        .then((built) => {
            if (cancelled) return;
            setFoldableHtml(built);
            setFoldableStatus('idle');
        })
        .catch(() => {
            if (!cancelled) setFoldableStatus('error');
        });
        return () => {
            cancelled = true;
        };
    }, [layout, mergedDoc, showAnswers]);

    const previewHtml = layout === 'foldable' ? foldableHtml : worksheetHtml;

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

        <label className="block">
        <span className={LABEL_CLASS}>Layout</span>
        <select
        className={`${FIELD_CLASS} mt-1`}
        value={layout}
        onChange={(e) => setLayout(e.target.value as PrintLayout)}
        >
        <option value="worksheet">Worksheet (full page)</option>
        <option value="foldable">Journal foldable</option>
        </select>
        </label>

        {layout === 'foldable' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
            <p className="font-semibold">Print double-sided to fold.</p>
            <p className="mt-1">
            In the print dialog choose <strong>two-sided</strong> and{' '}
            <strong>flip on long edge</strong>, then fold each sheet down the
            middle. The blank tab glues into the journal.
            </p>
            {foldableStatus === 'building' && (
                <p className="mt-1 text-amber-700">Laying out pages…</p>
            )}
            {foldableStatus === 'error' && (
                <p className="mt-1 font-medium text-red-700">
                Couldn't lay out the foldable. Try a different paper size or
                margin.
                </p>
            )}
            </div>
        )}

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
        <span className={LABEL_CLASS}>Print layout</span>
        {saveStatus === 'saving' && (
            <span className="text-xs text-slate-500">Saving…</span>
        )}
        {saveStatus === 'saved' && (
            <span className="text-xs text-slate-500">Saved</span>
        )}
        {saveStatus === 'error' && (
            <span className="text-xs text-red-600">Couldn't save</span>
        )}
        </div>
        {print && (
            <div className="mt-3">
            <PrintSettingsBody
            meta={{ ...loadState.doc.meta, print }}
            onChange={(next) => setPrint(next.print)}
            />
            </div>
        )}
        </div>
        </aside>

        {/* Preview = print source. White page on a grey mat. */}
        <iframe
        ref={iframeRef}
        title="Print preview"
        srcDoc={previewHtml}
        className="h-[80vh] w-full rounded-lg border border-slate-300 bg-white shadow-sm"
        />
        </div>
        </Shell>
    );
}
