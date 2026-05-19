import { useLayoutEffect, useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { MathfieldElement } from 'mathlive';

export default function MathInlineView({ node, updateAttributes }: NodeViewProps) {
    const latex = node.attrs.latex as string;
    const [editing, setEditing] = useState(false);
    const renderRef = useRef<HTMLSpanElement>(null);
    const mathFieldRef = useRef<MathfieldElement>(null);

    // Render KaTeX into the static view. The span stays mounted always
    // (just hidden when editing) so renderRef remains stable across edit
    // cycles — 5-commitments lifecycle pattern, commitment #2.
    useLayoutEffect(() => {
        if (!renderRef.current) return;
        katex.render(latex || '\\square', renderRef.current, {
            displayMode: false,
            throwOnError: false,
        });
    }, [latex]);

    // Configure the math-field when edit mode is entered. Focus it so the
    // caret appears on the *first* click — without this the field mounts
    // unfocused, and since setEditing(false) is wired only to onBlur, an
    // unfocused field can never blur, so the block gets stuck in edit mode
    // and never returns to the rendered view. Also set manual keyboard policy.
    useLayoutEffect(() => {
        if (!editing || !mathFieldRef.current) return;
        const mf = mathFieldRef.current;
        mf.mathVirtualKeyboardPolicy = 'manual';
        const showKeyboard = () => window.mathVirtualKeyboard?.show();
        const hideKeyboard = () => window.mathVirtualKeyboard?.hide();
        mf.addEventListener('focusin', showKeyboard);
        mf.addEventListener('focusout', hideKeyboard);

        // Defer the focus one frame: a focus() issued the same tick the
        // math-field mounts can be dropped before MathLive finishes wiring
        // up its internal editable region.
        const raf = requestAnimationFrame(() => mf.focus());

        return () => {
            cancelAnimationFrame(raf);
            mf.removeEventListener('focusin', showKeyboard);
            mf.removeEventListener('focusout', hideKeyboard);
        };
    }, [editing]);

    return (
        <NodeViewWrapper
        as="span"
        className={`math-inline-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={() => !editing && setEditing(true)}
        >
        <span
        ref={renderRef}
        className="math-inline-render"
        style={editing ? { display: 'none' } : undefined}
        />
        {editing && (
            <math-field
            ref={mathFieldRef}
            onInput={(e) => {
                const value = (e.currentTarget as MathfieldElement).value;
                updateAttributes({ latex: value });
            }}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    (e.currentTarget as MathfieldElement).blur();
                }
            }}
            className="math-inline-input"
            >
            {latex}
            </math-field>
        )}
        </NodeViewWrapper>
    );
}
