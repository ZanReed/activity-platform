import { NodeViewContent } from '@tiptap/react';
import type { Node as PMNode } from '@tiptap/pm/model';

// ============================================================================
// PromptField — a block's editable prompt (NodeViewContent) with an empty-state
// placeholder signifier.
// ----------------------------------------------------------------------------
// A block's prompt is inline content directly in the node, so an EMPTY prompt
// rendered nothing — a teacher saw a bare gap with no cue that it's where the
// question goes. This wraps the NodeViewContent and shows ghost placeholder
// text (via CSS ::before + attr(data-placeholder)) whenever the prompt is
// empty; it disappears the moment content is typed. Same signifier idea as the
// top-level "Type / to add a block" hint, scoped to a prompt.
//
// `node` is the block node whose content IS the prompt (content: "(text |
// mathInline)*"), so node.content.size === 0 detects an empty prompt. The host
// NodeView re-renders on every transaction (Editor forceTick), so the empty
// state tracks typing live.
// ============================================================================

export default function PromptField({
    node,
    className,
    placeholder,
}: {
    node: PMNode;
    className: string;
    placeholder: string;
}) {
    const isEmpty = node.content.size === 0;
    return (
        <div
            className={`prompt-field${isEmpty ? ' prompt-field--empty' : ''}`}
            data-placeholder={placeholder}
        >
            <NodeViewContent className={className} />
        </div>
    );
}
