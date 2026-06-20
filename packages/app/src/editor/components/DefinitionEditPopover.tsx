import { useEffect, useRef, useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import { createPortal } from 'react-dom';

// ============================================================================
// DefinitionEditPopover — single-field edit popover for a definition mark.
// ----------------------------------------------------------------------------
// Deliberately simpler than BlankEditPopover (a blank has many fields; a
// definition has one). A textarea holds a local draft; nothing is committed to
// the document until an exit path (Done, Escape, outside-click), which commits
// the draft via onChange — or removes the mark via onRemove when the draft is
// blank, so an abandoned "Define" never leaves an empty definition behind.
// Anchored to the marked span via floating-ui; portaled to <body> so it isn't
// clipped by editor overflow.
// ============================================================================

interface DefinitionEditPopoverProps {
    referenceElement: HTMLElement | null;
    initialDefinition: string;
    onChange: (definition: string) => void; // commit definition text
    onRemove: () => void; // remove the mark entirely
    onClose: () => void; // release selection / dismiss
}

export default function DefinitionEditPopover({
    referenceElement,
    initialDefinition,
    onChange,
    onRemove,
    onClose,
}: DefinitionEditPopoverProps) {
    const [draft, setDraft] = useState(initialDefinition);
    const draftRef = useRef(initialDefinition);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const { refs, floatingStyles } = useFloating({
        placement: 'bottom-start',
        middleware: [offset(6), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        refs.setReference(referenceElement);
    }, [referenceElement, refs]);

    // Focus the textarea (cursor at end) once it's mounted and positioned.
    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.focus();
            const len = el.value.length;
            el.setSelectionRange(len, len);
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    // Commit the draft (or remove the mark when blank), then release.
    const commitAndClose = () => {
        const value = draftRef.current.trim();
        if (value === '') {
            onRemove();
        } else {
            onChange(value);
        }
        onClose();
    };

    // Escape + outside-click both commit then close. A click on the popover
    // itself (or the marked term) is not an "outside" click.
    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            const floatingEl = refs.floating.current;
            if (floatingEl && floatingEl.contains(target)) return;
            if (referenceElement && referenceElement.contains(target)) return;
            commitAndClose();
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                commitAndClose();
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
        // referenceElement is the only external input the handlers read.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [referenceElement]);

    const setBoth = (v: string) => {
        draftRef.current = v;
        setDraft(v);
    };

    return createPortal(
        <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
            role="dialog"
            aria-label="Edit definition"
        >
            <label className="mb-1 block text-xs font-medium text-slate-500">
                Definition
            </label>
            <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setBoth(e.target.value)}
                rows={3}
                placeholder="What this term means…"
                className="w-full resize-y rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => {
                        onRemove();
                        onClose();
                    }}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                    Remove
                </button>
                <button
                    type="button"
                    onClick={commitAndClose}
                    className="rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700"
                >
                    Done
                </button>
            </div>
        </div>,
        document.body,
    );
}
