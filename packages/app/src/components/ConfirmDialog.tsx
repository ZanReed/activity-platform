// =============================================================================
// ConfirmDialog.tsx — "say the cost before it happens" (UI review group A,
// docs/design/ui-review-group-a.md G-1, G-3 … G-7)
// -----------------------------------------------------------------------------
// One modal for every one-way or costly action: release grades, replace a join
// code, delete a class or an activity, republish, sign out with unchecked
// answers. The body names the cost in plain words; the confirm button names the
// action ("Release grades", not "OK"). Cancel is focused first, so Enter on a
// misclick never goes through. While the action runs the dialog can't be closed,
// and a failure is shown inside it rather than lost behind it.
//
// The focus trap is hand-rolled (as RemoveStudentDialog's is), not
// focus-trap-react: that library is 8.9 KiB gz and would land on every
// teacher page that can delete something (perf-budgets journeys).
// =============================================================================

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface ConfirmDialogProps {
    title: string;
    children: ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    /** Red confirm button, for deleting and other things that are hard to take back. */
    danger?: boolean;
    /** Runs the action. A thrown error is shown in the dialog, which stays open. */
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

const BTN =
    'min-h-11 rounded-md px-4 py-2.5 text-sm font-medium shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50';

export default function ConfirmDialog({
    title,
    children,
    confirmLabel,
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cancel = () => {
        if (!busy) onCancel();
    };
    const confirm = async () => {
        setBusy(true);
        setError(null);
        try {
            await onConfirm();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setBusy(false);
        }
    };

    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef(cancel);
    cancelRef.current = cancel;
    // Cancel first (a misclick + Enter must not go through); focus goes back
    // to whatever opened the dialog when it closes.
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        dialogRef.current?.querySelector<HTMLButtonElement>('[data-confirm-cancel]')?.focus();
        // Keys are caught at the document, not only on the dialog: a click on
        // the dialog's text, or both buttons disabled while it runs, leaves
        // focus on <body>, and Escape / Tab must still behave (Fable review).
        const onDocKey = (e: globalThis.KeyboardEvent) => {
            const dialog = dialogRef.current;
            if (!dialog || dialog.contains(document.activeElement)) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                cancelRef.current();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const first = dialog.querySelector<HTMLElement>('button:not(:disabled)');
                if (first) first.focus();
                else dialog.focus();
            }
        };
        document.addEventListener('keydown', onDocKey);
        return () => {
            document.removeEventListener('keydown', onDocKey);
            if (opener && document.contains(opener)) opener.focus();
        };
    }, []);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            cancel();
            return;
        }
        if (e.key !== 'Tab') return;
        const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea') ?? [])];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4"
                role="presentation"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) cancel();
                }}
                onKeyDown={onKeyDown}
            >
                <div
                    ref={dialogRef}
                    tabIndex={-1}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                    aria-describedby="confirm-dialog-body"
                    data-confirm-dialog
                    className="w-full max-w-md rounded-lg border border-line bg-canvas p-6 shadow-lg outline-none"
                >
                    <h2 id="confirm-dialog-title" className="text-lg font-bold text-ink">
                        {title}
                    </h2>
                    <div id="confirm-dialog-body" className="mt-2 space-y-2 text-sm text-muted">
                        {children}
                    </div>
                    {error && (
                        <p className="mt-3 text-sm text-danger" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            data-confirm-cancel
                            disabled={busy}
                            onClick={cancel}
                            className={`${BTN} border border-line-strong bg-canvas text-strong hover:bg-surface`}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            data-confirm-ok
                            disabled={busy}
                            onClick={() => void confirm()}
                            className={`${BTN} text-white ${danger ? 'bg-danger hover:bg-danger-strong' : 'bg-primary hover:bg-primary-hover'}`}
                        >
                            {busy ? 'Working…' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
    );
}
