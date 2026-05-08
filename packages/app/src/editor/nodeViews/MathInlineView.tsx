import { useLayoutEffect, useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathInlineView({ node, updateAttributes }: NodeViewProps) {
    const latex = node.attrs.latex as string;
    const [editing, setEditing] = useState(false);
    const renderRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        if (!renderRef.current) return;
        katex.render(latex || '\\square', renderRef.current, {
            displayMode: false,
            throwOnError: false,
        });
    }, [latex]);

    return (
        <NodeViewWrapper
        as="span"
        className={`math-inline-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={() => setEditing(true)}
        >
        <span ref={renderRef} className="math-inline-render" />
        {editing && (
            <input
            type="text"
            value={latex}
            onChange={(e) => updateAttributes({ latex: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    setEditing(false);
                }
            }}
            className="math-inline-input"
            autoFocus
            />
        )}
        </NodeViewWrapper>
    );
}
