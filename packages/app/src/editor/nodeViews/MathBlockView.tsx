import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import { useMathFieldEditing } from './useMathFieldEditing';

export default function MathBlockView(props: NodeViewProps) {
    const { latex, editing, renderRef, mathFieldRef, onWrapperClick, fieldProps } =
        useMathFieldEditing<HTMLDivElement>(props, true);

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
            <math-field ref={mathFieldRef} className="math-block-input" {...fieldProps}>
            {latex}
            </math-field>
        )}
        </NodeViewWrapper>
    );
}
