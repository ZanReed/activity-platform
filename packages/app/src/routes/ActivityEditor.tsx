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
import type { JSONContent } from '@tiptap/react';
import {
    ActivityDocument,
    createEmptyDocument,
    type ActivityMeta,
} from '@activity/schema';
import { supabase } from '../lib/supabase';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import { useAutosave, type SaveStatus } from '../lib/useAutosave';
import Editor from '../editor/Editor';
import PublishControl from '../components/PublishControl';

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
| { status: 'ready'; tiptap: JSONContent };

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl">{children}</div>
        </main>
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
    const [tiptapJson, setTiptapJson] = useState<JSONContent | null>(null);

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

            setMeta(doc.meta);
            setLoadState({ status: 'ready', tiptap: safeTiptap });
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

    // Stable fingerprint of the whole document (body + meta). Null until the
    // editor has produced its first JSON — the autosave stays idle until then.
    const changeKey = useMemo(
        () =>
        tiptapJson && meta ? JSON.stringify({ t: tiptapJson, m: meta }) : null,
                              [tiptapJson, meta],
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
        const doc = tiptapToActivity(tiptapJson, safeMeta);
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

        return (
            <Shell>
            <div className="flex items-center justify-between">
            <Link
            to="/activities"
            className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
            ← All activities
            </Link>
            <div className="flex items-center gap-4">
            <SaveIndicator status={status} />
            <PublishControl activityId={id} saveStatus={status} onBeforePublish={flush} />
            </div>
            </div>

            <input
            type="text"
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            placeholder="Untitled activity"
            aria-label="Activity title"
            className="mt-4 mb-6 w-full bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            {/* key={id}: the editor's identity is the activity; a fresh activity
            gets a fresh editor (Editor consumes initialContent only at mount). */}
            <Editor
            key={id}
            initialContent={loadState.tiptap}
            onUpdate={handleEditorUpdate}
            />
            </Shell>
        );
}
