import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

// ============================================================================
// LearningObjectivesView — NodeView for the learning_objectives block.
//
//   <section.learning-objectives-block>
//     <input.learning-objectives-block__title />   <- editable title (attr)
//     <NodeViewContent />  <- editable objective paragraphs (styled as a list)
//   </section>
//
// The title is a block attribute, not content, so it's an ordinary controlled
// input writing straight to ProseMirror via updateAttributes. Its wrapper is
// contentEditable={false} so PM doesn't treat the input as node content; key
// events are stopped so editor shortcuts don't fire while typing the title.
// The body is NodeViewContent — ProseMirror owns the objective paragraphs, so
// marks and inline math work inside them for free.
// ============================================================================

export default function LearningObjectivesView({
    node,
    editor,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const title = (node.attrs.title as string | undefined) ?? '';
    const isEditable = editor.isEditable;

    return (
        <NodeViewWrapper
            className={`learning-objectives-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div
                className="learning-objectives-block__header"
                contentEditable={false}
            >
                <input
                    type="text"
                    className="learning-objectives-block__title"
                    value={title}
                    placeholder="Learning objectives"
                    aria-label="Learning objectives title"
                    disabled={!isEditable}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>
            <NodeViewContent className="learning-objectives-block__list" />
        </NodeViewWrapper>
    );
}
