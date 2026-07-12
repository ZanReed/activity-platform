import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

// ============================================================================
// FadedWorkedExampleView — NodeView for the faded_worked_example scaffold.
//
//   <section.faded-example-block>
//     <input.faded-example-block__title />   <- editable title (attr)
//     <NodeViewContent />  <- shown steps + fill_in_blank (faded) steps
//   </section>
//
// Same title-attr-over-NodeViewContent shape as WorkedExampleView. The body
// hosts nested block NodeViews (fill_in_blank steps render with their own
// FillInBlankView, numbered from the shared problem sequence).
// ============================================================================

export default function FadedWorkedExampleView({
    node,
    editor,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const title = (node.attrs.title as string | undefined) ?? '';
    const isEditable = editor.isEditable;

    return (
        <NodeViewWrapper
            className={`faded-example-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="faded-example-block__header" contentEditable={false}>
                <span className="faded-example-block__icon" aria-hidden="true">
                    ✍
                </span>
                <input
                    type="text"
                    className="faded-example-block__title"
                    value={title}
                    placeholder="Guided practice"
                    aria-label="Guided practice title"
                    disabled={!isEditable}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>
            <NodeViewContent className="faded-example-block__body" />
        </NodeViewWrapper>
    );
}
