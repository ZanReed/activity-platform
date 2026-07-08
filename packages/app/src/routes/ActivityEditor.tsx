// =============================================================================
// ActivityEditor.tsx — the /activity/:id route
// -----------------------------------------------------------------------------
// Loads an activity's draft (or its published version if no draft exists),
// displays it in the editor, autosaves changes (title + body) back to Supabase,
// and provides a Publish action that snapshots the current draft to an
// immutable, student-accessible static HTML page.
//
// Load priority on mount: prefer draft_content (a pending edit-in-progress) →
// then current_version_id's content (post-publish, no edits yet) → then a
// fresh empty doc (brand-new activity, shouldn't happen via Activities.tsx
// flow which always inserts a draft, but defensive). This is the fix for
// the "publish clears your editor" bug: the publish RPC clears draft_content
// on success, so after a publish there's a window (until the next edit) where
// draft is null. Before this fix, the editor showed an empty document during
// that window; now it shows the just-published version as the starting point
// for the next revision.
// =============================================================================

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { Link, useParams } from 'react-router';
import type { Editor as TiptapEditor, JSONContent } from '@tiptap/react';
import {
    ActivityDocument,
    createEmptyDocument,
    type ActivityMeta,
    type ReferencePanel,
    type CalculatorTool,
} from '@activity/schema';
import { supabase } from '../lib/supabase';
import {
    activityToTiptap,
    tiptapToActivity,
    referencePanelToTiptap,
    tiptapToReferencePanel,
} from '../lib/serialize';
import { useAutosave, type SaveStatus } from '../lib/useAutosave';
import Editor from '../editor/Editor';
import PublishControl from '../components/PublishControl';
import ImportMarkdownDialog from '../components/ImportMarkdownDialog';
import {
    ConfigButtons,
    ConfigDrawer,
    HeaderButton,
    type ConfigKey,
} from '../components/ActivityConfigDrawer';

interface ActivityLoadRow {
    id: string;
    title: string;
    draft_content: unknown;
    current_version_id: string | null;
}

interface ActivityVersionLoadRow {
    content: unknown;
}

type LoadState =
| { status: 'loading' }
| { status: 'not_found' }
| { status: 'error'; message: string }
| { status: 'ready'; tiptap: JSONContent; referenceTiptap: JSONContent };

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Locked mode relies on per-section "Check this section" buttons to freeze
// answers; a section that isn't a checkpoint has no such button, so students
// in that section can never lock. Walk the Tiptap doc and report whether any
// section lacks a checkpoint. The leading run before the first sectionBreak
// forms an implicit section with no checkpoint affordance, so its presence
// counts. Mirrors splitTiptapBlocksIntoSections in serialize.ts.
function hasNonCheckpointSection(tiptap: JSONContent): boolean {
    const nodes = tiptap.content ?? [];
    if (nodes.length === 0) return false;
    if (nodes[0]?.type !== 'sectionBreak') return true;
    for (const n of nodes) {
        if (n.type === 'sectionBreak' && n.attrs?.isCheckpoint !== true) {
            return true;
        }
    }
    return false;
}

// Reconstitute a ReferencePanel from the panel editor's Tiptap JSON + the title
// field, or undefined when the panel is effectively empty (no title and no real
// content) so an empty scaffold is never persisted. Called only at save time —
// the live fingerprint uses the Tiptap JSON directly (see changeKey), since
// tiptapToReferencePanel mints fresh UUIDs and must not feed change detection.
function panelFromEditor(
    json: JSONContent | null,
    title: string,
): ReferencePanel | undefined {
    const hasTitle = title.trim().length > 0;
    const content = json?.content ?? [];
    const hasContent = content.some(
        (n) => n.type !== 'paragraph' || (n.content?.length ?? 0) > 0,
    );
    if (!hasTitle && !hasContent) return undefined;
    return tiptapToReferencePanel(json ?? { type: 'doc', content: [] }, title);
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl">{children}</div>
        </main>
    );
}

// Public base for published pages, mirrored from the publish Edge Function's
// R2_PUBLIC_URL_BASE. Trailing slashes trimmed so URL building is unambiguous.
const PUBLISHED_BASE = (import.meta.env.VITE_PUBLISHED_URL_BASE ?? '').replace(
    /\/+$/,
    '',
);

// The live alias URL the publish function writes (`{base}/{id}/index.html`).
// Null when the base env is unset, so callers can hide the affordance rather
// than render a broken link.
function publishedUrl(activityId: string): string | null {
    return PUBLISHED_BASE ? `${PUBLISHED_BASE}/${activityId}/index.html` : null;
}

// Persistent link to an already-published activity's live page. Unlike the
// post-publish pill in PublishControl (which only exists in the session where
// you clicked Publish), this renders on every load of a published activity so
// the URL is always retrievable.
function PublishedLink({ activityId }: { activityId: string }) {
    const url = publishedUrl(activityId);
    const [copied, setCopied] = useState(false);
    if (!url) return null;
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard write can fail in unsupported contexts; non-fatal */
        }
    };
    return (
        <span className="flex items-center gap-2 text-sm">
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
        View published page
        </a>
        <button
        type="button"
        onClick={copy}
        className="font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
        {copied ? 'Copied!' : 'Copy link'}
        </button>
        </span>
    );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
    if (status === 'idle') return null;
    if (status === 'saving') {
        return <span className="text-xs text-slate-400">Saving…</span>;
    }
    if (status === 'saved') {
        return <span className="text-xs text-slate-400">Saved</span>;
    }
    return (
        <span className="text-xs text-red-600">
        Couldn't save — your latest edits aren't stored
        </span>
    );
}

export default function ActivityEditor() {
    const { id } = useParams();
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    const [meta, setMeta] = useState<ActivityMeta | null>(null);
    // Reference-panel authoring state. Like the main editor, the FINGERPRINT
    // uses the panel editor's Tiptap JSON (stable) — never the serialized
    // ReferencePanel, since tiptapToReferencePanel mints fresh block UUIDs and
    // would churn the change-detection key. panelTitle is the disclosure's title
    // field (not part of the Tiptap doc). Both are folded into changeKey;
    // panelFromEditor reconstitutes the ReferencePanel at save time.
    const [panelTitle, setPanelTitle] = useState('');
    const [panelJson, setPanelJson] = useState<JSONContent | null>(null);
    const [tiptapJson, setTiptapJson] = useState<JSONContent | null>(null);
    // Activity-level calculator config (scaffold sibling to the panel). Undefined
    // when the activity has no calculator; folded into changeKey + the save.
    const [calculator, setCalculator] = useState<CalculatorTool | undefined>(
        undefined,
    );
    const [isPublished, setIsPublished] = useState(false);
    // Live editor instance (null until mounted) + the markdown-import modal's
    // open state. The editor owns its useEditor instance; it reports up here via
    // onEditorReady so the header's Import action can drive insert commands.
    const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(
        null,
    );
    const [importOpen, setImportOpen] = useState(false);
    // Which config drawer section is open (null = drawer closed). One drawer,
    // one section at a time — see ActivityConfigDrawer.
    const [configOpen, setConfigOpen] = useState<ConfigKey | null>(null);

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
            setIsPublished(row.current_version_id !== null);

            // Three-way load priority: draft > published version > fresh empty.
            // The draft path is the common case (any activity with in-progress
            // edits). The version path is the post-publish reopen case — the
            // publish RPC clears draft_content, so without this fallback the
            // editor would show an empty document for any activity that's been
            // published but not yet re-edited. Fresh-empty is the defensive
            // bottom case; Activities.tsx always inserts a draft on creation,
            // so a row with neither a draft nor a current_version_id should be
            // impossible via the normal flow.
            let doc: ActivityDocument;
            if (row.draft_content !== null) {
                const parsed = ActivityDocument.safeParse(row.draft_content);
                if (!parsed.success) {
                    setLoadState({
                        status: 'error',
                        message: "This activity's saved draft could not be read.",
                    });
                    return;
                }
                doc = parsed.data;
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
                        message:
                        "Couldn't load the published version of this activity.",
                    });
                    return;
                }
                const versionRow = versionData as ActivityVersionLoadRow;
                const parsed = ActivityDocument.safeParse(versionRow.content);
                if (!parsed.success) {
                    setLoadState({
                        status: 'error',
                        message:
                        "The published version of this activity is malformed.",
                    });
                    return;
                }
                doc = parsed.data;
            } else {
                doc = createEmptyDocument({ title: row.title });
            }

            // ProseMirror's `doc` requires at least one block child; a brand-new
            // activity serializes to content: [] — substitute an empty paragraph.
            const tiptap = activityToTiptap(doc);
            const safeTiptap: JSONContent =
            Array.isArray(tiptap.content) && tiptap.content.length > 0
            ? tiptap
            : { type: 'doc', content: [{ type: 'paragraph' }] };

            // Seed the reference-panel editor with the loaded panel's blocks
            // (flat, no sections). Empty-paragraph fallback when there's no
            // panel or it has no blocks — ProseMirror's doc needs at least one
            // block child.
            const loadedPanel = doc.referencePanel;
            const refTiptap =
            loadedPanel && loadedPanel.blocks.length > 0
            ? referencePanelToTiptap(loadedPanel)
            : { type: 'doc', content: [{ type: 'paragraph' }] };
            const safeRefTiptap: JSONContent =
            Array.isArray(refTiptap.content) && refTiptap.content.length > 0
            ? refTiptap
            : { type: 'doc', content: [{ type: 'paragraph' }] };

            setMeta(doc.meta);
            setCalculator(doc.calculator);
            setPanelTitle(loadedPanel?.title ?? '');
            setLoadState({
                status: 'ready',
                tiptap: safeTiptap,
                referenceTiptap: safeRefTiptap,
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // The editor reports body changes here; onCreate also routes here, so the
    // first call carries the loaded baseline (the autosave hook ignores it).
    const handleEditorUpdate = useCallback((json: JSONContent) => {
        setTiptapJson(json);
    }, []);

    // The reference-panel editor reports its Tiptap JSON here; onCreate routes
    // here too (the baseline). changeKey gates on panelJson so the autosave
    // baseline settles only once BOTH editors have reported — no spurious
    // load-time save.
    const handlePanelUpdate = useCallback((json: JSONContent) => {
        setPanelJson(json);
    }, []);

    // Insert markdown-imported blocks. A fresh activity (just the default empty
    // paragraph) is replaced outright so there's no leading blank; an activity
    // with existing content gets the blocks appended at the end. The resulting
    // transaction flows through onUpdate → autosave like any other edit.
    const handleImportMarkdown = useCallback(
        (importedBlocks: JSONContent[]) => {
            if (!editorInstance || importedBlocks.length === 0) return;
            if (editorInstance.isEmpty) {
                editorInstance
                    .chain()
                    .focus()
                    .setContent({ type: 'doc', content: importedBlocks })
                    .run();
            } else {
                editorInstance
                    .chain()
                    .focus('end')
                    .insertContentAt(
                        editorInstance.state.doc.content.size,
                        importedBlocks,
                    )
                    .run();
            }
        },
        [editorInstance],
    );

    // Stable fingerprint of the whole document (body + meta). Null until the
    // editor has produced its first JSON — the autosave stays idle until then.
    const changeKey = useMemo(
        () =>
        tiptapJson && meta && panelJson
        ? JSON.stringify({
            t: tiptapJson,
            m: meta,
            rt: panelTitle,
            rj: panelJson,
            c: calculator ?? null,
        })
        : null,
        [tiptapJson, meta, panelTitle, panelJson, calculator],
    );

    // Serializes the current state and writes the draft. draft_content and the
    // title column are written together so the activity list (which reads the
    // column) never drifts from meta.title.
    const save = async () => {
        if (!tiptapJson || !meta || !id) return;
        // meta.title is z.string().min(1); a blank title would make the saved
        // draft fail validation on the next load. Fall back to a placeholder.
        const safeMeta: ActivityMeta = {
            ...meta,
            title: meta.title.trim() || 'Untitled activity',
        };
        const doc = tiptapToActivity(
            tiptapJson,
            safeMeta,
            panelFromEditor(panelJson, panelTitle),
            calculator,
        );
        const parsed = ActivityDocument.safeParse(doc);
        if (!parsed.success) {
            // Shouldn't happen — serialize produces valid docs and the title is
            // sanitized. Fail loud rather than persist a draft the editor can't read.
            throw new Error('Document failed validation; not saved.');
        }
        const { error } = await supabase
        .from('activities')
        .update({
            draft_content: parsed.data,
            title: safeMeta.title,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        if (error) throw error;
    };

        const { status, flush } = useAutosave(changeKey, save);

        if (loadState.status === 'loading') {
            return (
                <Shell>
                <p className="text-slate-500">Loading activity…</p>
                </Shell>
            );
        }

        if (loadState.status === 'not_found') {
            return (
                <Shell>
                <h1 className="text-2xl font-bold text-slate-900">
                Activity not found
                </h1>
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
                Couldn't open this activity
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

        // status === 'ready'. meta and id are both set; guards narrow them for
        // PublishControl's activityId: string prop.
        if (!meta) return null;
        if (!id) return null;

        // Locked mode with an unlockable section — drives the inline banner
        // (primary cue, never hidden in the drawer) and the Settings button's
        // amber dot (secondary cue).
        const lockedWarning =
            meta.submissionMode === 'locked' &&
            hasNonCheckpointSection(tiptapJson ?? loadState.tiptap);

        // Mirrors panelFromEditor's emptiness test: a title or any non-empty
        // block counts as content (drives the Reference button's dot).
        const referenceHasContent =
            panelTitle.trim().length > 0 ||
            (panelJson?.content ?? []).some(
                (n) => n.type !== 'paragraph' || (n.content?.length ?? 0) > 0,
            );

        return (
            <Shell>
            <div className="flex items-start justify-between gap-4">
            <Link
            to="/activities"
            className="pt-2 text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
            ← All activities
            </Link>
            {/*
              One header, two clusters in a single visual language (icon+label
              chips): activity configuration (opens the right-side drawer) and
              navigation/actions. Publish keeps its own primary styling —
              it's the page's main action, not a chip.
            */}
            <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="mr-1">
            <SaveIndicator status={status} />
            </span>
            <ConfigButtons
            active={configOpen}
            onToggle={(key) =>
                setConfigOpen((cur) => (cur === key ? null : key))
            }
            calculatorEnabled={calculator?.enabled ?? false}
            referenceHasContent={referenceHasContent}
            settingsWarning={lockedWarning}
            />
            <span
            aria-hidden="true"
            className="mx-1 w-px self-stretch bg-slate-200"
            />
            <HeaderButton
            icon="📄"
            label="Print view"
            to={`/activity/${id}/print`}
            title="Open the printable worksheet view"
            />
            <HeaderButton
            icon="📊"
            label="Submissions"
            to={`/activity/${id}/submissions`}
            title="Open the submissions dashboard"
            />
            <HeaderButton
            icon="📥"
            label="Import"
            onClick={() => setImportOpen(true)}
            disabled={!editorInstance}
            title="Paste markdown and convert it to activity blocks"
            />
            <PublishControl activityId={id} saveStatus={status} onBeforePublish={flush} />
            </div>
            </div>

            {isPublished && (
                <div className="mt-2 flex justify-end">
                <PublishedLink activityId={id} />
                </div>
            )}

            <input
            type="text"
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            placeholder="Untitled activity"
            aria-label="Activity title"
            className="mt-4 w-full bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            {lockedWarning && (
                <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Locked mode freezes answers when a section is checked, but at
                least one section isn't a checkpoint — students there have no
                way to lock their work. Mark every section as a checkpoint, or
                switch to free or single mode.
                </div>
            )}

            <div className="mb-6" />

            {/* key={id}: the editor's identity is the activity; a fresh activity
            gets a fresh editor (Editor consumes initialContent only at mount). */}
            <Editor
            key={id}
            initialContent={loadState.tiptap}
            onUpdate={handleEditorUpdate}
            gridLinesDefault={meta.print.gridLines}
            activityId={id}
            onEditorReady={setEditorInstance}
            />

            {/*
              Always rendered (its section bodies stay mounted while hidden) —
              the reference-panel editor inside must report its baseline JSON
              at load so changeKey/autosave can settle; see ActivityConfigDrawer.
            */}
            <ConfigDrawer
            active={configOpen}
            onClose={() => setConfigOpen(null)}
            meta={meta}
            onMetaChange={setMeta}
            panelEditorKey={id}
            panelInitialContent={loadState.referenceTiptap}
            panelTitle={panelTitle}
            onPanelTitleChange={setPanelTitle}
            onPanelEditorUpdate={handlePanelUpdate}
            calculator={calculator}
            onCalculatorChange={setCalculator}
            activityId={id}
            />

            {importOpen && (
                <ImportMarkdownDialog
                onClose={() => setImportOpen(false)}
                onImport={handleImportMarkdown}
                />
            )}
            </Shell>
        );
}
