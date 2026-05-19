// =============================================================================
// ActivityEditor.tsx — the /activity/:id route
// -----------------------------------------------------------------------------
// Stage 10 step 3: loads an activity's draft from Supabase and displays it in
// the editor. Persistence (debounced autosave) is step 4 — editing the title
// or the body here does NOT save yet.
// =============================================================================

import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import type { JSONContent } from '@tiptap/react';
import {
    ActivityDocument,
    createEmptyDocument,
    type ActivityMeta,
} from '@activity/schema';
import { supabase } from '../lib/supabase';
import { activityToTiptap } from '../lib/serialize';
import Editor from '../editor/Editor';

// The columns we read. draft_content is jsonb — typed `unknown` because it's
// validated through ActivityDocument.safeParse below, not trusted as-is.
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

// Plausible-UUID check. Lets a malformed :id short-circuit to "not found"
// instead of hitting Postgres with an invalid uuid cast (which errors).
const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl">{children}</div>
        </main>
    );
}

export default function ActivityEditor() {
    const { id } = useParams();
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    const [meta, setMeta] = useState<ActivityMeta | null>(null);

    useEffect(() => {
        if (!id || !UUID_RE.test(id)) {
            setLoadState({ status: 'not_found' });
            return;
        }
        // `cancelled` guards StrictMode's double-invoke and unmount-mid-fetch.
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
            .from('activities')
            .select('id, title, draft_content')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle(); // 0 rows (bad id or not owner) -> data null, no error
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

            // Resolve the document to edit. A published activity with no pending
            // draft has draft_content === null — fall back to a fresh document
            // seeded from the title column. (Loading a published *version* into the
            // editor is a later concern; Stage 10 edits drafts only.)
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

            // ProseMirror's `doc` node requires at least one block child. A
            // brand-new activity (one empty section, no blocks) serializes to
            // `content: []` — substitute a single empty paragraph so the editor
            // always mounts with a valid document.
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

    // status === 'ready'. `meta` is set in the same effect branch as the ready
    // state; this guard exists only so TypeScript narrows `meta` to non-null.
    if (!meta) return null;

    return (
        <Shell>
        <Link
        to="/activities"
        className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
        ← All activities
        </Link>

        <input
        type="text"
        value={meta.title}
        onChange={(e) => setMeta({ ...meta, title: e.target.value })}
        placeholder="Untitled activity"
        aria-label="Activity title"
        className="mt-4 mb-6 w-full bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* key={id}: the editor's identity is the activity. Editor consumes
        `initialContent` only at mount, so if this route is ever reused
        across an :id change, the key forces a fresh editor instance. */}
        <Editor key={id} initialContent={loadState.tiptap} />
        </Shell>
    );
}
