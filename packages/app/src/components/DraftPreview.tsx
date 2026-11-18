// =============================================================================
// DraftPreview.tsx — "Preview as student" (schema-shortlist.md S8, author
// ruling 2026-11-15: really checks, nothing saved)
// -----------------------------------------------------------------------------
// The DRAFT, full screen, in the real student viewer: answer keys, hints and
// solutions are stripped as for a student, orderings shuffled, seeded numbers
// drawn for one preview student, and Check grades in the browser with the real
// grader (viewer preview/draftPreview.ts). Nothing leaves the browser and
// nothing is recorded; closing throws the answers away.
//
// Loaded by the editor in a click handler (not React.lazy — the import dialog's
// reason), and it pulls the grader with it, so neither ever reaches a page a
// student opens.
// =============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityDocument } from '@activity/schema';
import { ViewerContainer, createViewerStore, photoLink, setPhotoLink, setVideoLink, videoLink } from '@activity/viewer';
import { buildDraftPreview } from '@activity/viewer/draft-preview';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';

const PREVIEW_USER = '00000000-0000-4000-8000-00000000c0de';

export default function DraftPreview({
    draft,
    activityId,
    onClose,
}: {
    draft: ActivityDocument;
    activityId: string;
    onClose: () => void;
}) {
    // A different "student" each time Another student is pressed: new seeded
    // numbers, a new shuffle, and empty answers.
    const [run, setRun] = useState(1);
    const preview = useMemo(() => {
        const p = buildDraftPreview(draft, `student-${run}`);
        const store = createViewerStore({
            userId: PREVIEW_USER,
            activityId,
            versionId: `preview-${run}`,
            checkService: p.checkService,
        });
        return { ...p, store };
    }, [draft, activityId, run]);
    // No Escape-to-close: Escape also closes a glossary card or the reference
    // panel INSIDE the preview, and closing the preview throws the answers
    // away. Close is the button. Focus starts on it and goes back on close.
    const closeRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        return () => opener?.focus?.();
    }, []);
    // A video clip's source comes from a live call the student page wires up
    // (setVideoLink). The preview makes no requests, so it unhooks it while
    // open and puts back whatever was there.
    useEffect(() => {
        const saved = videoLink;
        setVideoLink(null);
        // The photo block likewise: in the preview it shows what students
        // will see, and reserves and uploads nothing.
        const savedPhoto = photoLink;
        setPhotoLink(null);
        return () => {
            setVideoLink(saved);
            setPhotoLink(savedPhoto);
        };
    }, []);
    const seeded = ((draft.meta as { seedVars?: unknown[] }).seedVars ?? []).length > 0;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-preview-title"
            data-draft-preview
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-surface outline-none"
        >
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-canvas px-4 py-2">
                <h2 id="draft-preview-title" className="text-sm font-semibold text-ink">
                    Student preview
                </h2>
                <p className="min-w-0 flex-1 text-xs text-muted">
                    Your draft as a student sees it. Check marks it for real; nothing is saved.
                    {preview.hasDol ? ' A DoL section is checked as an ordinary section here.' : ''}
                    {' '}Video clips and course-glossary pop-ups show only on the published page.
                </p>
                {seeded && (
                    <button
                        type="button"
                        onClick={() => setRun((n) => n + 1)}
                        className="text-sm font-medium text-strong underline underline-offset-2"
                    >
                        Another student
                    </button>
                )}
                <button
                    type="button"
                    data-preview-close
                    ref={closeRef}
                    onClick={onClose}
                    className="rounded-md border border-line-strong px-3 py-1 text-sm font-medium text-strong hover:bg-surface"
                >
                    Close preview
                </button>
            </div>
            <div className="flex-1">
                <ViewerContainer
                    key={run}
                    document={preview.served}
                    store={preview.store}
                    versionId={`preview-${run}`}
                    mode="screen"
                />
            </div>
        </div>
    );
}
