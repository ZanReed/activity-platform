import { useRef } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import { useMathFieldEditing } from './useMathFieldEditing';
import MathPromptControls from './MathPromptControls';

export default function MathInlineView(props: NodeViewProps) {
    const {
        latex,
        editing,
        renderRef,
        mathFieldRef,
        onWrapperClick,
        insertPrompt,
        prompts,
        keepEditingRef,
        fieldProps,
    } = useMathFieldEditing<HTMLSpanElement>(props, false);

    // Stable anchor for the settings popover (the always-present inline wrapper).
    const anchorRef = useRef<HTMLSpanElement>(null);

    return (
        <NodeViewWrapper
        as="span"
        className={`math-inline-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={onWrapperClick}
        >
        <span ref={anchorRef} className="math-inline-anchor">
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
        <MathPromptControls
        editing={editing}
        latex={latex}
        prompts={prompts}
        insertPrompt={insertPrompt}
        keepEditingRef={keepEditingRef}
        anchorEl={anchorRef.current}
        onUpdatePrompts={(next) => props.updateAttributes({ prompts: next })}
        />
        </span>
        </NodeViewWrapper>
    );
}
