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
// =============================================================================

import { useState, type ReactNode } from 'react';
import { FocusTrap } from 'focus-trap-react';

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

    return (
        <FocusTrap
            focusTrapOptions={{
                escapeDeactivates: false,
                returnFocusOnDeactivate: true,
                allowOutsideClick: true,
                initialFocus: '[data-confirm-cancel]',
                tabbableOptions: { displayCheck: 'none' },
            }}
        >
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4"
                role="presentation"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) cancel();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.stopPropagation();
                        cancel();
                    }
                }}
            >
                <div
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                    aria-describedby="confirm-dialog-body"
                    data-confirm-dialog
                    className="w-full max-w-md rounded-lg border border-line bg-canvas p-6 shadow-lg"
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
        </FocusTrap>
    );
}
