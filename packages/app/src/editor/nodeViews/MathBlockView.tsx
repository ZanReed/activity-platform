import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import { useMathFieldEditing } from './useMathFieldEditing';

export default function MathBlockView(props: NodeViewProps) {
    const {
        latex,
        editing,
        renderRef,
        mathFieldRef,
        onWrapperClick,
        insertPrompt,
        fieldProps,
    } = useMathFieldEditing<HTMLDivElement>(props, true);

    return (
        <NodeViewWrapper
        as="div"
        className={`math-block-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={onWrapperClick}
        >
        <div
        ref={renderRef}
        className="math-block-render"
        style={editing ? { display: 'none' } : undefined}
        />
        {editing && (
            <>
            <math-field ref={mathFieldRef} className="math-block-input" {...fieldProps}>
            {latex}
            </math-field>
            {/* Model A insert-blank affordance (MA-DR1). onMouseDown +
                preventDefault so clicking the button doesn't blur the field
                (which would exit edit mode before the insert runs). */}
            <div className="math-edit-chrome" contentEditable={false}>
            <button
            type="button"
            className="math-insert-blank"
            onMouseDown={(e) => {
                e.preventDefault();
                insertPrompt();
            }}
            title="Insert a fill-in blank at the cursor"
            >
            + Blank
            </button>
            </div>
            </>
        )}
        </NodeViewWrapper>
    );
}
