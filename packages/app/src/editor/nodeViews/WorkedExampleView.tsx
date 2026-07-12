import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

// ============================================================================
// WorkedExampleView — NodeView for the worked_example block.
//
//   <section.worked-example-block>
//     <input.worked-example-block__title />   <- editable title (attr)
//     <NodeViewContent />  <- editable nested content blocks
//   </section>
//
// Same shape as LearningObjectivesView: the title is a controlled block-attr
// input in a contentEditable={false} header; the body is NodeViewContent so
// ProseMirror manages the nested paragraphs / block math / lists / images that
// the node's content expression allows.
// ============================================================================

export default function WorkedExampleView({
    node,
    editor,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const title = (node.attrs.title as string | undefined) ?? '';
    const isEditable = editor.isEditable;

    return (
        <NodeViewWrapper
            className={`worked-example-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="worked-example-block__header" contentEditable={false}>
                <span className="worked-example-block__icon" aria-hidden="true">
                    ✎
                </span>
                <input
                    type="text"
                    className="worked-example-block__title"
                    value={title}
                    placeholder="Worked example"
                    aria-label="Worked example title"
                    disabled={!isEditable}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>
            <NodeViewContent className="worked-example-block__body" />
        </NodeViewWrapper>
    );
}
