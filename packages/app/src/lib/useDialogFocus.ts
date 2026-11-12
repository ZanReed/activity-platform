// =============================================================================
// useDialogFocus.ts — a small focus trap for modal dialogs
// -----------------------------------------------------------------------------
// Replaces focus-trap-react (9 KiB gz) on the teacher list pages, where it was
// most of a journey's budget (perf-budgets). On open: focus the element
// `initialSelector` names (or the first enabled button); Tab and Shift+Tab
// cycle inside; Escape calls onEscape; on close, focus returns to whatever
// opened it. Keys are also caught at the document while focus has fallen out
// of the dialog (a click on its text, or every button disabled while it runs).
// =============================================================================

import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)';

export function useDialogFocus(
    dialogRef: RefObject<HTMLElement | null>,
    onEscape: () => void,
    initialSelector?: string,
): (e: KeyboardEvent<HTMLElement>) => void {
    const escapeRef = useRef(onEscape);
    escapeRef.current = onEscape;

    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        const dialog = dialogRef.current;
        const first = (initialSelector && dialog?.querySelector<HTMLElement>(initialSelector)) || dialog?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? dialog)?.focus();
        const onDocKey = (e: globalThis.KeyboardEvent) => {
            const d = dialogRef.current;
            if (!d || d.contains(document.activeElement)) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                escapeRef.current();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const target = d.querySelector<HTMLElement>(FOCUSABLE);
                if (target) target.focus();
                else d.focus();
            }
        };
        document.addEventListener('keydown', onDocKey);
        return () => {
            document.removeEventListener('keydown', onDocKey);
            if (opener && document.contains(opener)) opener.focus();
        };
        // Runs once per open; the dialog element is stable while mounted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            escapeRef.current();
            return;
        }
        if (e.key !== 'Tab') return;
        const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
        const head = items[0];
        const tail = items[items.length - 1];
        if (!head || !tail) return;
        if (e.shiftKey && document.activeElement === head) {
            e.preventDefault();
            tail.focus();
        } else if (!e.shiftKey && document.activeElement === tail) {
            e.preventDefault();
            head.focus();
        }
    };
}
