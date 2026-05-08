import { useLayoutEffect, useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathBlockView({ node, updateAttributes }: NodeViewProps) {
    const latex = node.attrs.latex as string;
    const [editing, setEditing] = useState(false);
    const renderRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!renderRef.current) return;
        katex.render(latex || '\\square', renderRef.current, {
            displayMode: true,
            throwOnError: false,
        });
    }, [latex]);

    return (
        <NodeViewWrapper
        as="div"
        className={`math-block-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={() => setEditing(true)}
        >
        <div ref={renderRef} className="math-block-render" />
        {editing && (
            <textarea
            value={latex}
            onChange={(e) => updateAttributes({ latex: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    setEditing(false);
                }
                // Enter inserts a newline in the textarea — useful for
                // multi-line LaTeX like \begin{align} ... \end{align}.
            }}
            className="math-block-input"
            rows={2}
            autoFocus
            />
        )}
        </NodeViewWrapper>
    );
}
