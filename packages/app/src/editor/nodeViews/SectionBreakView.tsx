import { Suspense, lazy, useEffect, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { Editor as TiptapEditor } from '@tiptap/core';

// =============================================================================
// SectionBreakView — NodeView for the section_break atom.
// -----------------------------------------------------------------------------
// Title, isCheckpoint and the DoL marker are document concerns → ProseMirror
// state via updateAttributes (the 5-commitments rule, item: React state vs PM
// state). The NodeViewWrapper is `as="div"` because section_break is a
// block-level node — using `as="span"` would break line layout.
//
// onKeyDown stopPropagation on the inputs: the NodeView lives inside the
// editor's container, and editor keyboard shortcuts would otherwise fire when
// you type into the title (e.g., Mod+Shift+ArrowUp would reorder the block
// instead of selecting text in the input).
//
// THE DoL CHECKBOX (D65; GUI amendment 2026-11-12, D-1/D-2): a DoL is always a
// checkpoint (its own Check), so ticking it ticks Checkpoint and locks it on;
// an activity has at most one, so every other break's checkbox is off while
// one exists. Its panel (skills, numbers, the pass note) is a LAZY chunk.
// =============================================================================

const DolPanel = lazy(() => import('./DolPanel'));

/** The title of ANOTHER section break that is already the DoL, or null. */
function otherDol(editor: TiptapEditor, pos: number | undefined): string | null {
    let found: string | null = null;
    editor.state.doc.forEach((child, offset) => {
        if (found === null && child.type.name === 'sectionBreak' && child.attrs.dol != null && offset !== pos) {
            found = (child.attrs.title as string | null) || 'Untitled section';
        }
    });
    return found;
}

function useOtherDol(editor: TiptapEditor, getPos: NodeViewProps['getPos']): string | null {
    const read = () => otherDol(editor, typeof getPos === 'function' ? getPos() : undefined);
    const [value, setValue] = useState<string | null>(read);
    useEffect(() => {
        const update = () => setValue(read());
        editor.on('update', update);
        return () => {
            editor.off('update', update);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);
    return value;
}

export function SectionBreakView({
    node,
    updateAttributes,
    editor,
    selected,
    getPos,
}: NodeViewProps) {
    const title = (node.attrs.title as string | null) ?? '';
    const isDol = node.attrs.dol != null;
    const isCheckpoint = (node.attrs.isCheckpoint as boolean) || isDol;
    const isEditable = editor.isEditable;
    const elsewhere = useOtherDol(editor, getPos);
    const seeded = isDol && Boolean((node.attrs.dol as { seed?: unknown }).seed);
    const [confirmOff, setConfirmOff] = useState(false);

    const setDol = (on: boolean) => {
        if (on) {
            // A fresh DoL has no skills yet, so it isn't saved until the first
            // one is picked (SectionDol needs one); the panel says so.
            updateAttributes({ dol: { skills: [], retake: false }, isCheckpoint: true });
        } else if (seeded && !confirmOff) {
            setConfirmOff(true);
        } else {
            setConfirmOff(false);
            updateAttributes({ dol: null });
        }
    };

    return (
        <NodeViewWrapper
        as="div"
        className={`section-break${selected ? ' section-break--selected' : ''}`}
        data-is-checkpoint={isCheckpoint ? 'true' : 'false'}
        data-is-dol={isDol ? 'true' : undefined}
        contentEditable={false}
        >
        <div className="section-break__rule" aria-hidden="true" />
        <div className="section-break__controls">
        <input
        type="text"
        className="section-break__title"
        placeholder="Untitled section"
        value={title}
        onChange={(e) =>
            updateAttributes({ title: e.target.value || null })
        }
        onKeyDown={(e) => e.stopPropagation()}
        disabled={!isEditable}
        aria-label="Section title"
        />
        <label
        className="section-break__checkpoint-label"
        title={isDol ? 'A DoL is always a checkpoint: it has its own Check.' : undefined}
        >
        <input
        type="checkbox"
        checked={isCheckpoint}
        onChange={(e) =>
            updateAttributes({ isCheckpoint: e.target.checked })
        }
        onKeyDown={(e) => e.stopPropagation()}
        disabled={!isEditable || isDol}
        />
        <span>Checkpoint</span>
        </label>
        <label
        className="section-break__checkpoint-label"
        title={
            elsewhere !== null && !isDol
                ? `“${elsewhere}” is already the DoL. An activity has one.`
                : 'A demonstration of learning: the check that shows a student has the skill.'
        }
        >
        <input
        type="checkbox"
        checked={isDol}
        onChange={(e) => setDol(e.target.checked)}
        onKeyDown={(e) => e.stopPropagation()}
        disabled={!isEditable || (elsewhere !== null && !isDol)}
        aria-label="This section is the DoL"
        />
        <span>DoL</span>
        </label>
        </div>
        {confirmOff && (
            <div className="section-break__confirm" role="alertdialog" aria-label="Remove the DoL">
            <span>
            This DoL&rsquo;s numbers come from its file. Removing the DoL removes them too, and any{' '}
            <code>{'{name}'}</code> left in the section will show as braces.
            </span>
            <button type="button" onClick={() => setDol(false)}>
            Remove the DoL
            </button>
            <button type="button" onClick={() => setConfirmOff(false)}>
            Keep it
            </button>
            </div>
        )}
        {isDol && isEditable && (
            <Suspense fallback={<p className="section-break__dol" role="status">Loading DoL…</p>}>
            <DolPanel
            dol={node.attrs.dol as Record<string, unknown>}
            editor={editor}
            getPos={getPos}
            onChange={(dol) => updateAttributes({ dol })}
            />
            </Suspense>
        )}
        </NodeViewWrapper>
    );
}
