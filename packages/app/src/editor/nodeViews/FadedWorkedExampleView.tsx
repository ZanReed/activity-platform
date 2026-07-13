import { useMemo } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import { problemNumberAt } from '../problemNumbering';

// ============================================================================
// FadedWorkedExampleView — NodeView for the faded_worked_example scaffold.
//
//   <section.faded-example-block>
//     <header>
//       <span.__number>3.</span>              <- box problem number (leads)
//       ✍ <input.__title />                    <- editable title (attr)
//       <label> Label steps (a, b, c) </label> <- per-box showStepLabels toggle
//     </header>
//     <NodeViewContent />  <- shown steps + fill_in_blank (faded) steps
//   </section>
//
// The whole box is ONE numbered problem (its number leads the title), computed
// from the shared problem sequence via problemNumberAt — the same walk every
// question NodeView uses, which treats this box as atomic. The faded
// fill_in_blank steps render their own compact (a)/(b) labels (FillInBlankView),
// gated by the showStepLabels attr this view toggles.
// ============================================================================

export default function FadedWorkedExampleView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const title = (node.attrs.title as string | undefined) ?? '';
    const showStepLabels = node.attrs.showStepLabels !== false;
    const isEditable = editor.isEditable;

    const boxNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    return (
        <NodeViewWrapper
            className={`faded-example-block${
                showStepLabels ? '' : ' is-labels-off'
            }${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="faded-example-block__header" contentEditable={false}>
                <span className="faded-example-block__number">{boxNumber}.</span>
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
                {isEditable && (
                    <label className="faded-example-block__steps-toggle">
                        <input
                            type="checkbox"
                            checked={showStepLabels}
                            onChange={(e) =>
                                updateAttributes({
                                    showStepLabels: e.target.checked,
                                })
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                        <span>Label steps (a, b, c)</span>
                    </label>
                )}
            </div>
            <NodeViewContent className="faded-example-block__body" />
        </NodeViewWrapper>
    );
}
