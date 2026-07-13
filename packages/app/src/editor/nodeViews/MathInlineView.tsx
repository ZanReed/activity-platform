import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import { useMathFieldEditing } from './useMathFieldEditing';

export default function MathInlineView(props: NodeViewProps) {
    const { latex, editing, renderRef, mathFieldRef, onWrapperClick, fieldProps } =
        useMathFieldEditing<HTMLSpanElement>(props, false);

    return (
        <NodeViewWrapper
        as="span"
        className={`math-inline-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={onWrapperClick}
        >
        <span
        ref={renderRef}
        className="math-inline-render"
        style={editing ? { display: 'none' } : undefined}
        />
        {editing && (
            <math-field ref={mathFieldRef} className="math-inline-input" {...fieldProps}>
            {latex}
            </math-field>
        )}
        </NodeViewWrapper>
    );
}
