import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
    CELL_MIN_HEIGHT_MAX_REM,
    CELL_MIN_HEIGHT_MIN_REM,
    activeColumnMinHeight,
} from '../extensions/Columns';

// ============================================================================
// CellHeightControl — reserved work-space floor for the active column cell
// (variable block sizing Drop 4; schema Column.minHeight, rem).
// ----------------------------------------------------------------------------
// Mirrors ColumnWidthPicker's dropdown pattern: a contextual trigger in the
// columns toolbar cluster, disabled outside a columns block. The panel offers
// Auto (clear the floor), three quick presets, and a numeric rem input —
// control-first by design (the cancelled column-divider gesture taught us to
// lead with reliable buttons; a cell bottom-edge drag can be layered on later
// if ever missed). The floor still GROWS with content; on paper it is the
// write-in work space, and rem scales it with the print font-size config.
//
// Selection drives everything via activeColumnMinHeight(editor); the parent
// Toolbar re-renders on every editor transaction, so this reflects live state.
// ============================================================================

const QUICK_PRESETS_REM = [4, 8, 12] as const;

interface CellHeightControlProps {
    editor: Editor;
}

export default function CellHeightControl({ editor }: CellHeightControlProps) {
    const info = activeColumnMinHeight(editor);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);

    const minHeight = info?.minHeight ?? null;

    // Re-seed the input from the live value whenever the panel opens or the
    // value changes underneath it (e.g. a preset click).
    useEffect(() => {
        if (open) setDraft(minHeight === null ? '' : String(minHeight));
    }, [open, minHeight]);

    // Close on outside click / Escape while open.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (info === null) {
        return (
            <button
                type="button"
                disabled
                title="Put the cursor in a column cell to reserve work space"
                className="min-w-[32px] cursor-not-allowed rounded bg-white px-2 py-1 text-sm font-medium text-slate-300"
            >
                Cell height
            </button>
        );
    }

    const apply = (value: number | null) => {
        editor.chain().focus().setColumnMinHeight(value).run();
    };

    const commitDraft = () => {
        const raw = draft.trim();
        if (raw === '') {
            apply(null);
            return;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
            setDraft(minHeight === null ? '' : String(minHeight));
            return;
        }
        apply(n); // the command clamps into bounds
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                title="Reserve write-in work space in this cell (minimum height — it still grows with content)"
                aria-haspopup="menu"
                aria-expanded={open}
                className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
                    minHeight !== null
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
            >
                Cell: {minHeight === null ? 'auto' : `${minHeight}rem`} ▾
            </button>

            {open ? (
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="flex flex-wrap gap-1">
                        <button
                            type="button"
                            aria-pressed={minHeight === null}
                            onClick={() => apply(null)}
                            className={`rounded border px-2 py-1 text-xs font-medium transition ${
                                minHeight === null
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            Auto
                        </button>
                        {QUICK_PRESETS_REM.map((rem) => {
                            const active = minHeight === rem;
                            return (
                                <button
                                    key={rem}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => apply(rem)}
                                    className={`rounded border px-2 py-1 text-xs font-medium transition ${
                                        active
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {rem}rem
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                        <input
                            type="number"
                            min={CELL_MIN_HEIGHT_MIN_REM}
                            max={CELL_MIN_HEIGHT_MAX_REM}
                            step={0.5}
                            value={draft}
                            placeholder="auto"
                            aria-label="Minimum cell height in rem"
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commitDraft}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    commitDraft();
                                }
                            }}
                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-500">rem</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-slate-500">
                        Reserved write-in space on paper. The cell still grows
                        if its content is taller.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
