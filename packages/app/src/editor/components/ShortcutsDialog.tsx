// =============================================================================
// ShortcutsDialog.tsx — the editor's keyboard shortcuts, listed (2026-11-15)
// -----------------------------------------------------------------------------
// Opened by ⌘/ in the editor or the toolbar's keyboard button. Loaded on first
// use (Editor.tsx), so the editor chunk does not carry it.
//
// The rows live in ../shortcutList.ts.
// =============================================================================

import { useRef } from 'react';
import { useDialogFocus } from '../../lib/useDialogFocus';
import { SHORTCUT_GROUPS } from '../shortcutList';

export default function ShortcutsDialog({ onClose }: { onClose: () => void }) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const onKeyDown = useDialogFocus(dialogRef, onClose);
    const ctrl = typeof navigator !== 'undefined' && !/Mac|iPhone|iPad/.test(navigator.platform);
    // Windows and Linux press Ctrl where a Mac presses ⌘.
    const keys = (k: string) => (ctrl ? k.replace(/⌘/g, 'Ctrl+').replace(/⇧/g, 'Shift+') : k);
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            onKeyDown={onKeyDown}
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="shortcuts-title"
                data-shortcuts-dialog
                className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-line bg-canvas p-6 shadow-lg outline-none"
            >
                <div className="flex items-start justify-between gap-4">
                    <h2 id="shortcuts-title" className="text-lg font-bold text-ink">
                        Keyboard shortcuts
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-line-strong px-3 py-1 text-sm font-medium text-strong hover:bg-surface"
                    >
                        Close
                    </button>
                </div>
                {SHORTCUT_GROUPS.map((g) => (
                    <section key={g.title} className="mt-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{g.title}</h3>
                        <dl className="mt-1.5 space-y-1 text-sm">
                            {g.rows.map(([k, what]) => (
                                <div key={k} className="flex gap-3">
                                    <dt className="w-28 flex-none font-mono text-xs leading-5 text-strong">{keys(k)}</dt>
                                    <dd className="text-ink">{what}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ))}
            </div>
        </div>
    );
}
