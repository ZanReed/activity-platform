// =============================================================================
// RepublishDialog.tsx — the confirm-with-a-list step of "Republish changed"
// (R-3; lib/bulkRepublish.ts has the rulings)
// -----------------------------------------------------------------------------
// Every changed activity is listed by name under its unit, ticked, and marked
// "from its file" or "edited in the app" — an app edit may be half-finished,
// and this list is the one place it can be left out. Skipped quizzes and exams
// are named, not hidden. While it runs: "Publishing 7 of 21"; after: who
// failed and why, by name. The dialog can't be closed mid-run.
// =============================================================================

import { useMemo, useRef, useState } from 'react';
import { useDialogFocus } from '../lib/useDialogFocus';
import { groupByUnit, sortForOutline, type GroupableActivity } from '../lib/activityGrouping';
import {
    republishMany,
    type RepublishCandidate,
    type RepublishResult,
    type RepublishRow,
} from '../lib/bulkRepublish';

export const REPUBLISH_COPY = {
    title: 'Republish changed activities',
    intro: 'These have changes students can’t see yet. Each one you leave ticked is republished, so students get the new version.',
    fromFile: 'from its file',
    editedInApp: 'edited in the app',
    skippedHeading: 'Not republished',
    skippedAssessment: 'Quiz or exam: these are printed from the draft, not published.',
    noUnit: 'No unit',
    cancel: 'Cancel',
    close: 'Close',
    run: (n: number) => `Republish ${n}`,
    progress: (done: number, total: number) => `Publishing ${done} of ${total}…`,
    doneAll: (n: number) => `Republished ${n}.`,
    doneSome: (ok: number, failed: number) =>
        `Republished ${ok}. ${failed} couldn’t be published:`,
} as const;

type Row = RepublishRow & GroupableActivity;

export function RepublishDialog({
    candidates,
    onClose,
}: {
    candidates: RepublishCandidate<Row>[];
    /** Called with the ids that were republished (empty if none ran). */
    onClose: (republished: string[]) => void;
}) {
    const publishable = useMemo(() => candidates.filter((c) => c.skip === null), [candidates]);
    const skipped = useMemo(() => candidates.filter((c) => c.skip !== null), [candidates]);
    const [ticked, setTicked] = useState<ReadonlySet<string>>(() => new Set(publishable.map((c) => c.row.id)));
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [results, setResults] = useState<RepublishResult[] | null>(null);

    const running = progress !== null && results === null;
    const byId = useMemo(() => new Map(candidates.map((c) => [c.row.id, c])), [candidates]);
    // The same order as the outline behind it (catalogue path, then recency).
    const groups = useMemo(() => groupByUnit(sortForOutline(publishable.map((c) => c.row))), [publishable]);
    const republished = (results ?? []).filter((r) => r.ok).map((r) => r.id);
    const failures = (results ?? []).filter((r): r is Extract<RepublishResult, { ok: false }> => !r.ok);

    const close = () => {
        if (!running) onClose(republished);
    };
    // lib/useDialogFocus, not focus-trap-react (9 KiB on the Activities journey).
    const dialogRef = useRef<HTMLDivElement>(null);
    const onKeyDown = useDialogFocus(dialogRef, close);
    const toggle = (id: string) =>
        setTicked((cur) => {
            const next = new Set(cur);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const run = async () => {
        // Outline order, so progress walks the list the teacher just read.
        const ids = groups.flatMap((g) => g.rows.map((r) => r.id)).filter((id) => ticked.has(id));
        setProgress({ done: 0, total: ids.length });
        const out = await republishMany(ids, (done, total) => setProgress({ done, total }));
        setResults(out);
    };

    return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) close();
                }}
                onKeyDown={onKeyDown}
            >
                <div
                    ref={dialogRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="republish-title"
                    className="outline-none flex max-h-[85vh] w-full max-w-xl flex-col rounded-lg bg-canvas shadow-xl"
                >
                    <div className="border-b border-line px-5 py-3">
                        <h2 id="republish-title" className="text-base font-semibold text-ink">
                            {REPUBLISH_COPY.title}
                        </h2>
                        <p className="mt-1 text-xs text-muted">{REPUBLISH_COPY.intro}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {groups.map((g) => (
                            <fieldset key={g.key} className="mb-4" disabled={progress !== null}>
                                <legend className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
                                    {g.unit ?? REPUBLISH_COPY.noUnit}
                                </legend>
                                {g.rows.map((r) => {
                                    const c = byId.get(r.id);
                                    return (
                                        <label key={r.id} className="flex min-h-[36px] items-center gap-2 text-sm text-ink">
                                            <input
                                                type="checkbox"
                                                checked={ticked.has(r.id)}
                                                onChange={() => toggle(r.id)}
                                            />
                                            <span className="flex-1">{r.title}</span>
                                            <span className="text-xs text-muted" data-origin={c?.fromFile ? 'file' : 'app'}>
                                                {c?.fromFile ? REPUBLISH_COPY.fromFile : REPUBLISH_COPY.editedInApp}
                                            </span>
                                        </label>
                                    );
                                })}
                            </fieldset>
                        ))}

                        {skipped.length > 0 && (
                            <div className="mb-2" data-republish-skipped>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    {REPUBLISH_COPY.skippedHeading}
                                </p>
                                <ul className="mt-1 text-sm text-muted">
                                    {skipped.map((c) => (
                                        <li key={c.row.id}>{c.row.title}</li>
                                    ))}
                                </ul>
                                <p className="mt-1 text-xs text-muted">{REPUBLISH_COPY.skippedAssessment}</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-line px-5 py-3">
                        <div role="status" aria-live="polite" className="text-sm text-ink">
                            {running && progress ? REPUBLISH_COPY.progress(progress.done, progress.total) : null}
                            {results && failures.length === 0 ? REPUBLISH_COPY.doneAll(republished.length) : null}
                            {results && failures.length > 0 ? (
                                <>
                                    <p>{REPUBLISH_COPY.doneSome(republished.length, failures.length)}</p>
                                    <ul className="mt-1 text-xs text-danger">
                                        {failures.map((f) => (
                                            <li key={f.id}>
                                                {byId.get(f.id)?.row.title ?? f.id}: {f.message}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                            {results ? (
                                <button
                                    type="button"
                                    onClick={close}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                                >
                                    {REPUBLISH_COPY.close}
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={close}
                                        disabled={running}
                                        className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface disabled:opacity-50"
                                    >
                                        {REPUBLISH_COPY.cancel}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void run()}
                                        disabled={running || ticked.size === 0}
                                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {REPUBLISH_COPY.run(ticked.size)}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
}
