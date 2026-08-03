// =============================================================================
// ActivityPrint.tsx — the /activity/:id/print route (S5.5 T4)
// -----------------------------------------------------------------------------
// A teacher-facing print page, rebuilt onto the viewer tree. It loads the
// activity's current working copy (same draft > published-version priority as
// the editor) and renders it through the SAME components a student gets, in
// print mode, in this page — not in an iframe.
//
// WHY THE IFRAME IS GONE (ruling D4A). The old page rendered the renderer's
// print document into an <iframe srcDoc> and printed the frame. That isolation
// existed because the renderer emits a whole HTML document with its own styles,
// which had to escape the app's Tailwind reset. The viewer needs none of it: it
// is a React tree whose print CSS already lives in this app, and the student
// route already prints in place — which is precisely the path S5's 51-case
// parity gate certifies. Keeping a second, serialized pipeline here would mean
// the teacher surface drifted on code the gate never runs.
//
// WHAT THE TEACHER SEES, AND WHAT THEY DO NOT. The preview mirrors the printed
// page's show/hide decisions (D24-C, viewer.css): the write-the-letter lines,
// number boxes and static figure twins are all visible here, and the live
// boards, selects and check chrome are not. Paper GEOMETRY — page size, margin,
// pagination — is not previewable on a screen and appears only once the browser
// print dialog opens. That is a smaller lie than a half-faithful facsimile.
//
// THE THREE DOCUMENTS ON THIS PAGE, and why there are three:
//
//   authored   the raw ActivityDocument, answers and all. Never rendered.
//   served     authored → REAL sanitizer → print shuffle. This is what the
//              components render, so they see exactly the shape they were
//              built for and cannot read an answer even by accident.
//   answerKey  extracted from the AUTHORED document, id-keyed, supplied
//              through a context this route mounts only when asked.
//
// The foldable is a SECOND surface on this page, and stays one: it is a duplex
// booklet whose panels are measured and imposed, which a flowing page cannot
// express. Since T5 it builds from the same viewer tree as the worksheet —
// rendered offscreen and captured — so the two surfaces no longer disagree
// about what a block looks like, they only disagree about the paper.
// =============================================================================

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import {
  ActivityDocument,
  upgradeActivityDocument,
  type PrintConfig,
} from '@activity/schema';
import {
  AnswerKeyProvider,
  PrintButton,
  ViewerContainer,
  applyPrintShuffles,
  createViewerStore,
  extractAnswerKey,
  printSeed,
  sanitizeActivityDocument,
} from '@activity/viewer';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';
import { supabase } from '../lib/supabase';
import { buildFoldableDocument } from '../lib/foldable';
import { useAutosave } from '../lib/useAutosave';
import { PrintSettingsBody } from '../components/ActivityConfigDrawer';

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
        <main className="min-h-screen bg-surface-2 p-6">
        <div className="mx-auto max-w-5xl">{children}</div>
        </main>
    );
}

const LABEL_CLASS =
'text-xs font-semibold uppercase tracking-wide text-muted';
const FIELD_CLASS =
'w-full rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

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
                // Also the not-my-activity case: RLS filters rows this teacher
                // cannot read, so a foreign id is indistinguishable from a
                // missing one — which is the correct thing to tell them.
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

            // Through the upgrade seam BEFORE validating (ruling D23C). A no-op
            // today — there are zero schema migrations — but the day the first
            // one lands, an old draft would otherwise fail this parse and the
            // teacher would be told their content "could not be read" with no
            // hint that it is simply older than this build.
            try {
                const { doc } = upgradeActivityDocument(raw);
                setLoadState({ status: 'ready', doc });
                setPrint(doc.meta.print);
            } catch {
                setLoadState({
                    status: 'error',
                    message: "This activity's content could not be read.",
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const doc = loadState.status === 'ready' ? loadState.doc : null;

    // The AUTHORED document with the (editable) print config applied. Answers
    // still in it; never rendered directly.
    const authoredDoc = useMemo<ActivityDocument | null>(() => {
        if (!doc || !print) return null;
        return { ...doc, meta: { ...doc.meta, print } };
    }, [doc, print]);

    // What the components actually render: the REAL sanitizer, then the print
    // shuffle. The sanitizer is what lets every component keep its
    // SanitizedActivityDocument typing here; the shuffle is D15A — an ordering
    // question printed in authored order is a printed answer key.
    const servedDoc = useMemo(() => {
        if (!authoredDoc || !id) return null;
        return applyPrintShuffles(
            sanitizeActivityDocument(authoredDoc),
            printSeed(id),
        );
    }, [authoredDoc, id]);

    // The teacher's answers, extracted from the AUTHORED document and carried
    // beside the served one. Only mounted while Show answers is on.
    const answerKey = useMemo(
        () => (authoredDoc ? extractAnswerKey(authoredDoc) : null),
        [authoredDoc],
    );

    // An INERT store (finding F3). ViewerContainer needs one, but nothing on
    // this page checks work or belongs to a student: the check service throws
    // if anything ever reaches it, which is louder than silently pretending to
    // grade, and the ids are placeholders because no work is persisted from
    // here. Built once — a new store per render would reset block state.
    const store = useMemo(
        () =>
            createViewerStore({
                userId: 'teacher-print-preview',
                activityId: id ?? 'preview',
                versionId: 'preview',
                checkService: {
                    checkSection: () =>
                        Promise.reject(
                            new Error(
                                'the print preview never checks work (ActivityPrint is inert)',
                            ),
                        ),
                    fetchReleasedFeedback: () =>
                        Promise.reject(
                            new Error(
                                'the print preview never fetches feedback (ActivityPrint is inert)',
                            ),
                        ),
                },
            }),
        [id],
    );

    // Persist a print-config edit to the activity's draft.
    //
    // RE-FETCH, THEN MERGE ONLY meta.print (ruling D20A). The previous version
    // wrote back the whole document this tab loaded, so a teacher with the
    // editor open in another tab could lose editor work by nudging a margin
    // here — silently, with no error and no trace. Print settings are the only
    // thing this page owns, so they are the only thing it writes.
    const savePrint = useCallback(async () => {
        if (!id || !print) return;
        const { data, error: readErr } = await supabase
            .from('activities')
            .select('draft_content, current_version_id')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
        if (readErr) throw readErr;
        if (!data) throw new Error('This activity is no longer available.');

        const current = (data as { draft_content: unknown }).draft_content;
        // No draft yet (published, never edited): fall back to the document we
        // loaded, which came from the published version. Creating the draft is
        // correct — it mirrors what any editor edit does.
        const base = current ?? doc;
        const parsed = ActivityDocument.safeParse(base);
        if (!parsed.success) {
            throw new Error('Print settings failed validation; not saved.');
        }
        const next: ActivityDocument = {
            ...parsed.data,
            meta: { ...parsed.data.meta, print },
        };

        const { error } = await supabase
            .from('activities')
            .update({
                draft_content: next,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);
        if (error) throw error;
    }, [id, doc, print]);

    const { status: saveStatus } = useAutosave(
        print ? JSON.stringify(print) : null,
        savePrint,
    );

    // Journal foldable — still the renderer's own document in its own iframe
    // until T5 re-points it. Rebuilt whenever its inputs change while active.
    useEffect(() => {
        if (layout !== 'foldable' || !authoredDoc) return;
        let cancelled = false;
        // DEBOUNCED (ruling D14A). A build is now a full offscreen React render
        // plus a readiness wait plus an iframe measure, and dragging a spacing
        // control fires one per keystroke. The cancelled guard already threw
        // stale RESULTS away; this stops the work from starting.
        const timer = setTimeout(() => {
            setFoldableStatus('building');
            buildFoldableDocument(authoredDoc, {
                showAnswers,
                ...(id ? { activityId: id } : {}),
            })
            .then((built) => {
                if (cancelled) return;
                setFoldableHtml(built);
                setFoldableStatus('idle');
            })
            .catch(() => {
                if (!cancelled) setFoldableStatus('error');
            });
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [layout, authoredDoc, showAnswers, id]);

    if (loadState.status === 'loading') {
        return (
            <Shell>
            <p className="text-muted">Loading…</p>
            </Shell>
        );
    }
    if (loadState.status === 'not_found') {
        return (
            <Shell>
            <h1 className="text-2xl font-bold text-ink">
            Activity not found
            </h1>
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
            Couldn't open this activity for printing
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

    const worksheet =
        servedDoc && showAnswers && answerKey ? (
            <AnswerKeyProvider answers={answerKey}>
            <ViewerContainer document={servedDoc} store={store} mode="print" />
            </AnswerKeyProvider>
        ) : servedDoc ? (
            <ViewerContainer document={servedDoc} store={store} mode="print" />
        ) : null;

    // status === 'ready' — doc is set.
    return (
        <main className="activity-print min-h-screen bg-surface-2 p-6">
        <div className="mx-auto max-w-5xl">
        <div className="activity-print__chrome flex items-center justify-between">
        <Link
        to={`/activity/${id}`}
        className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
        >
        ← Back to editor
        </Link>
        <h1 className="truncate text-lg font-bold text-ink">
        {loadState.doc.meta.title}
        </h1>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Controls. Marked as route chrome so the print rule in index.css
            can take the whole sidebar off the page in one place, rather than
            each control remembering to hide itself. */}
        <aside className="activity-print__chrome flex flex-col gap-4 rounded-lg border border-line bg-canvas p-4">
        {layout === 'worksheet' ? (
            // The viewer's own Print action: it waits for pending math, fonts
            // and images to settle before opening the dialog, bounded, and
            // prints anyway on expiry (S5-2). A student who cannot print is
            // worse off than one missing a figure, and the same is true here.
            <PrintButton />
        ) : (
            <button
            type="button"
            onClick={() => {
                const frame = document.querySelector<HTMLIFrameElement>(
                    '.activity-print__foldable',
                );
                frame?.contentWindow?.focus();
                frame?.contentWindow?.print();
            }}
            className="rounded-md bg-accent-strong px-3 py-2 text-sm font-semibold text-white hover:bg-accent-stronger"
            >
            Print
            </button>
        )}

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
            <div className="rounded-md border border-warning-border bg-warning-bg p-2.5 text-xs text-warning-stronger">
            <p className="font-semibold">Print double-sided to fold.</p>
            <p className="mt-1">
            In the print dialog choose <strong>two-sided</strong> and{' '}
            <strong>flip on long edge</strong>, then fold each sheet down the
            middle. The blank tab glues into the journal.
            </p>
            {foldableStatus === 'building' && (
                <p className="mt-1 text-warning-text">Laying out pages…</p>
            )}
            {foldableStatus === 'error' && (
                <p className="mt-1 font-medium text-danger-strong">
                Couldn't lay out the foldable. Try a different paper size or
                margin.
                </p>
            )}
            </div>
        )}

        <label className="flex items-center gap-2 text-sm text-strong">
        <input
        type="checkbox"
        checked={showAnswers}
        onChange={(e) => setShowAnswers(e.target.checked)}
        />
        <span>Show answers (answer key)</span>
        </label>

        <div className="border-t border-line pt-3">
        <div className="flex items-center justify-between">
        <span className={LABEL_CLASS}>Print layout</span>
        {saveStatus === 'saving' && (
            <span className="text-xs text-muted">Saving…</span>
        )}
        {saveStatus === 'saved' && (
            <span className="text-xs text-muted">Saved</span>
        )}
        {saveStatus === 'error' && (
            <span className="text-xs text-danger">Couldn't save</span>
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

        {/* The preview IS the print source for the worksheet: what prints is
            this subtree, so there is nothing to keep in sync. */}
        <div className="activity-print__sheet rounded-lg border border-line-strong bg-canvas p-6 shadow-sm">
        {layout === 'foldable' ? (
            <iframe
            title="Foldable preview"
            srcDoc={foldableHtml}
            className="activity-print__foldable h-[80vh] w-full"
            />
        ) : (
            worksheet
        )}
        </div>
        </div>
        </div>
        </main>
    );
}
