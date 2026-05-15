import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// =============================================================================
// SectionBreakView — NodeView for the section_break atom.
// -----------------------------------------------------------------------------
// Title and isCheckpoint are document concerns → ProseMirror state via
// updateAttributes (the 5-commitments rule, item: React state vs PM state).
// The NodeViewWrapper is `as="div"` because section_break is a block-level
// node — using `as="span"` would break line layout.
//
// onKeyDown stopPropagation on the title input: the NodeView lives inside the
// editor's container, and editor keyboard shortcuts would otherwise fire when
// you type into the title (e.g., Mod+Shift+ArrowUp would reorder the block
// instead of selecting text in the input).
// =============================================================================

export function SectionBreakView({
    node,
    updateAttributes,
    editor,
    selected,
}: NodeViewProps) {
    const title = (node.attrs.title as string | null) ?? '';
    const isCheckpoint = node.attrs.isCheckpoint as boolean;
    const isEditable = editor.isEditable;

    return (
        <NodeViewWrapper
        as="div"
        className={`section-break${selected ? ' section-break--selected' : ''}`}
        data-is-checkpoint={isCheckpoint ? 'true' : 'false'}
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
        <label className="section-break__checkpoint-label">
        <input
        type="checkbox"
        checked={isCheckpoint}
        onChange={(e) =>
            updateAttributes({ isCheckpoint: e.target.checked })
        }
        onKeyDown={(e) => e.stopPropagation()}
        disabled={!isEditable}
        />
        <span>Checkpoint</span>
        </label>
        </div>
        </NodeViewWrapper>
    );
}
