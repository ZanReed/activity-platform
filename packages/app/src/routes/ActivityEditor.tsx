// =============================================================================
// ActivityEditor.tsx — the /activity/:id route
// -----------------------------------------------------------------------------
// Stage 10 step 4: loads an activity's draft, displays it in the editor, and
// autosaves changes (title + body) back to Supabase, debounced.
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

interface ActivityLoadRow {
    id: string;
    title: string;
    draft_content: unknown;
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
            .select('id, title, draft_content')
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

            // A published activity with no pending draft has draft_content === null
            // — fall back to a fresh document seeded from the title column.
            let doc: ActivityDocument;
            if (row.draft_content === null) {
                doc = createEmptyDocument({ title: row.title });
            } else {
                const parsed = ActivityDocument.safeParse(row.draft_content);
                if (!parsed.success) {
                    setLoadState({
                        status: 'error',
                        message: "This activity's saved draft could not be read.",
                    });
                    return;
                }
                doc = parsed.data;
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

        const status = useAutosave(changeKey, save);

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

        // status === 'ready'. meta is set in the same effect branch; guard narrows.
        if (!meta) return null;

        return (
            <Shell>
            <div className="flex items-center justify-between">
            <Link
            to="/activities"
            className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
            ← All activities
            </Link>
            <SaveIndicator status={status} />
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
