import { useMemo, useRef } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import { useMathFieldEditing } from './useMathFieldEditing';
import MathPromptControls from './MathPromptControls';
import { problemNumberAt } from '../problemNumbering';
import { labelPrefix } from './problemNumberGutter';

export default function MathBlockView(props: NodeViewProps) {
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
    } = useMathFieldEditing<HTMLDivElement>(props, true);

    // A gap-bearing equation is a numbered problem (numbering/label decouple);
    // show its label prefix so the author sees the number/custom text. A plain
    // display equation carries no prompts and shows nothing.
    const { node, editor, getPos } = props;
    const hasPrompts = Array.isArray(prompts) && prompts.length > 0;
    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );
    const prefix = hasPrompts
        ? labelPrefix(
              node.attrs.label as { mode?: string; text?: string } | null,
              problemNumber,
          )
        : '';

    // Stable anchor for the settings popover: the popover is decoupled from the
    // field's edit lifecycle (a field blur can tear edit mode down), so it
    // anchors to this always-present wrapper and survives on showSettings alone.
    const anchorRef = useRef<HTMLDivElement>(null);

    return (
        <NodeViewWrapper
        as="div"
        className={`math-block-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={onWrapperClick}
        >
        {prefix && (
            <span className="math-block-number" contentEditable={false}>
                {prefix}
            </span>
        )}
        <div ref={anchorRef} className="math-block-anchor">
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
        <MathPromptControls
        editing={editing}
        latex={latex}
        prompts={prompts}
        insertPrompt={insertPrompt}
        keepEditingRef={keepEditingRef}
        anchorEl={anchorRef.current}
        onUpdatePrompts={(next) => props.updateAttributes({ prompts: next })}
        />
        </div>
        </NodeViewWrapper>
    );
}
