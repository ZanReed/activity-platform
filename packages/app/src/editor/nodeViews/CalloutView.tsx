import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import PromptField from '../components/PromptField';
import {
    CALLOUT_VARIANTS,
    type CalloutVariantValue,
} from '../extensions/Callout';

// ============================================================================
// CalloutView — NodeView for the callout block.
//
//   <aside.callout-block.callout-block--{variant}>
//     <div.callout-block__switcher>   <- 4 variant buttons (authoring chrome)
//     <NodeViewContent />             <- editable inline body (text + math)
//   </aside>
//
// The switcher is contentEditable=false chrome; clicking a button rewrites the
// `variant` attr via updateAttributes (a document change, so it autosaves and
// undoes like any edit). Per the NodeView rule, `selected` (ProseMirror
// selection) drives ONLY the is-selected class — it is never conflated with a
// React editing flag; the switcher is always visible, not gated on focus.
// ============================================================================

const VARIANT_META: Record<
    CalloutVariantValue,
    { icon: string; label: string }
> = {
    info: { icon: 'ℹ️', label: 'Info' },
    warning: { icon: '⚠️', label: 'Warning' },
    success: { icon: '✅', label: 'Success' },
    note: { icon: '📝', label: 'Note' },
};

export default function CalloutView({
    node,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const variant = (node.attrs.variant as CalloutVariantValue) ?? 'info';

    return (
        <NodeViewWrapper
            className={`callout-block callout-block--${variant}${
                selected ? ' is-selected' : ''
            }`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div
                className="callout-block__switcher"
                contentEditable={false}
                role="group"
                aria-label="Callout style"
            >
                {CALLOUT_VARIANTS.map((v) => {
                    const meta = VARIANT_META[v];
                    const active = v === variant;
                    return (
                        <button
                            key={v}
                            type="button"
                            className={`callout-block__variant-btn${
                                active ? ' is-active' : ''
                            }`}
                            title={meta.label}
                            aria-label={meta.label}
                            aria-pressed={active}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => updateAttributes({ variant: v })}
                        >
                            <span aria-hidden="true">{meta.icon}</span>
                        </button>
                    );
                })}
            </div>
            <PromptField
                node={node}
                className="callout-block__body"
                placeholder="Callout text…"
            />
        </NodeViewWrapper>
    );
}
