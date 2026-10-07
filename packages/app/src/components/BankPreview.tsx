// =============================================================================
// BankPreview.tsx — a listed activity's student view, for a teacher deciding
// whether to add it (docs/design/activity-bank.md BK-6)
// -----------------------------------------------------------------------------
// Rendered in PRINT mode on purpose: a static, faithful picture of the
// worksheet with nothing to press. A screen-mode render would offer Check, and
// a check from here would be recorded under the previewing teacher against the
// AUTHOR's activity (check-activity takes the caller's id; nothing stops a
// teacher), landing stray rows in the author's Responses. Interactive use is
// what the copy is for: once added, the teacher owns it.
//
// The document comes from the same get-activity read every student uses
// (`createReadClient`), so it is the SANITIZED copy — no answers, no teacher
// guide (that has its own panel, via get_bank_teacher_guide). Lazy-loaded by
// the Bank page: the viewer is only paid for when a teacher opens a preview.
// =============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ViewerContainer,
    createReadClient,
    createViewerStore,
    type SanitizedActivityDocument,
} from '@activity/viewer';
import { functionsBase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';

type State =
    | { phase: 'loading' }
    | { phase: 'ready'; document: SanitizedActivityDocument; versionId: string }
    | { phase: 'error'; message: string };

export default function BankPreview({ activityId }: { activityId: string }) {
    const { session } = useSession();
    const tokenRef = useRef<string | null>(session?.access_token ?? null);
    tokenRef.current = session?.access_token ?? null;

    const readClient = useMemo(
        () =>
            createReadClient({
                baseUrl: `${functionsBase()}/get-activity`,
                getAccessToken: () => tokenRef.current,
            }),
        [],
    );

    const [state, setState] = useState<State>({ phase: 'loading' });

    useEffect(() => {
        let cancelled = false;
        setState({ phase: 'loading' });
        readClient
            .load(activityId)
            .then((served) => {
                if (!cancelled) {
                    setState({
                        phase: 'ready',
                        document: served.document,
                        versionId: served.versionId,
                    });
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setState({
                        phase: 'error',
                        message: err instanceof Error ? err.message : 'Could not load the preview.',
                    });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [activityId, readClient]);

    // Inert, like ActivityPrint's: a preview never checks work. Built once per
    // activity — a new store per render would reset block state.
    const store = useMemo(
        () =>
            createViewerStore({
                userId: 'bank-preview',
                activityId,
                versionId: 'bank-preview',
                checkService: {
                    checkSection: () =>
                        Promise.reject(new Error('a Bank preview never checks work')),
                    fetchReleasedFeedback: () =>
                        Promise.reject(new Error('a Bank preview never fetches feedback')),
                },
            }),
        [activityId],
    );

    if (state.phase === 'loading') {
        return <p className="text-sm text-muted">Loading the preview…</p>;
    }
    if (state.phase === 'error') {
        return (
            <p className="text-sm text-danger" role="alert">
                Couldn’t load the preview: {state.message}
            </p>
        );
    }
    return (
        <div className="max-h-[70vh] overflow-y-auto rounded-md border border-line bg-canvas p-4" data-bank-preview>
            <ViewerContainer document={state.document} store={store} mode="print" />
        </div>
    );
}
