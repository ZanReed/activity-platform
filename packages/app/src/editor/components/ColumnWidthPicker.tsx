import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
    activeColumnsWidthInfo,
    widthPresetOrder,
    presetToWidths,
    type WidthPreset,
} from '../extensions/Columns';

// ============================================================================
// ColumnWidthPicker — visual width-preset chooser for the active columns block.
// ----------------------------------------------------------------------------
// Replaces the old cycling "Width" toolbar button: a dropdown of layout
// thumbnails the author clicks directly. The options shown depend on the
// column count (widthPresetOrder): 2-col has even / wide-left / wide-right;
// 3-col adds wide-center and the three narrow-* options; 4–6-col is even-only
// so the trigger disables. Each thumbnail draws bars whose flex-grow mirrors the
// preset's stored weights, with the emphasised column highlighted.
//
// Selection drives everything via activeColumnsWidthInfo(editor); the parent
// Toolbar re-renders on every editor transaction, so this reflects live state.
// Applying a preset goes through the setColumnWidthPreset command.
// ============================================================================

const PRESET_LABEL: Record<WidthPreset, string> = {
    even: 'Even',
    'wide-left': 'Wide left',
    'wide-center': 'Wide center',
    'wide-right': 'Wide right',
    'narrow-left': 'Narrow left',
    'narrow-center': 'Narrow center',
    'narrow-right': 'Narrow right',
};

// Short label for the trigger button (keeps the toolbar compact).
const PRESET_SHORT: Record<WidthPreset, string> = {
    even: 'even',
    'wide-left': 'wide L',
    'wide-center': 'wide C',
    'wide-right': 'wide R',
    'narrow-left': 'narrow L',
    'narrow-center': 'narrow C',
    'narrow-right': 'narrow R',
};

interface ColumnWidthPickerProps {
    editor: Editor;
}

export default function ColumnWidthPicker({ editor }: ColumnWidthPickerProps) {
    const info = activeColumnsWidthInfo(editor);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

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

    // Not in a columns block (or single-option 4–6-col): a disabled, inert
    // trigger that mirrors the other contextual toolbar buttons.
    const inColumns = info !== null;
    const hasChoices = info !== null && info.cyclable;

    if (!inColumns || !hasChoices) {
        return (
            <button
                type="button"
                disabled
                title={
                    inColumns
                        ? 'This column count has a single (even) layout'
                        : 'Select a columns block to change its layout'
                }
                className="min-w-[32px] cursor-not-allowed rounded bg-canvas px-2 py-1 text-sm font-medium text-disabled"
            >
                {inColumns ? `Width: ${PRESET_SHORT[info.preset]}` : 'Width'}
            </button>
        );
    }

    const { preset: current, count } = info;
    const options = widthPresetOrder(count);

    const apply = (preset: WidthPreset) => {
        editor.chain().focus().setColumnWidthPreset(preset).run();
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                title="Choose the column layout"
                aria-haspopup="menu"
                aria-expanded={open}
                className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
                    current !== 'even'
                        ? 'bg-primary text-white'
                        : 'bg-canvas text-strong hover:bg-surface-3'
                }`}
            >
                Width: {PRESET_SHORT[current]} ▾
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-line bg-canvas p-1 shadow-lg"
                >
                    {options.map((preset) => {
                        const isCurrent = preset === current;
                        return (
                            <button
                                key={preset}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isCurrent}
                                onClick={() => apply(preset)}
                                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition ${
                                    isCurrent
                                        ? 'bg-surface-2 text-ink'
                                        : 'text-strong hover:bg-surface'
                                }`}
                            >
                                <PresetThumbnail count={count} preset={preset} />
                                <span className="flex-1">
                                    {PRESET_LABEL[preset]}
                                </span>
                                {isCurrent ? (
                                    <span aria-hidden="true" className="text-faint">
                                        ✓
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

// A small bar diagram of a preset's column widths. Bars flex-grow by the
// preset's weights (null ⇒ 1); the emphasised column (weight !== 1) is tinted
// indigo so wide vs. narrow reads at a glance.
function PresetThumbnail({
    count,
    preset,
}: {
    count: number;
    preset: WidthPreset;
}) {
    const widths = presetToWidths(count, preset);
    return (
        <span
            aria-hidden="true"
            className="flex h-4 w-9 flex-none items-stretch gap-[2px]"
        >
            {widths.map((w, i) => {
                const emphasised = typeof w === 'number';
                return (
                    <span
                        key={i}
                        style={{ flexGrow: w ?? 1 }}
                        className={`rounded-[1px] ${
                            emphasised ? 'bg-[color:var(--ed-accent-alt)]' : 'bg-line-strong'
                        }`}
                    />
                );
            })}
        </span>
    );
}
