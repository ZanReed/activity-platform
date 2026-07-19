import { useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { MathPrompt } from '@activity/schema';
import 'katex/dist/katex.min.css';
import { useMathFieldEditing } from './useMathFieldEditing';
import BlankEditPopover from '../components/BlankEditPopover';

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

    // Single-gap v1 (MA-DR2): one popover per equation, editing the first gap.
    const [showSettings, setShowSettings] = useState(false);
    const prompt = prompts[0];
    // Stable anchor for the settings popover: the popover is decoupled from the
    // field's edit lifecycle (a field blur can tear edit mode down), so it
    // anchors to this always-present wrapper and survives on `showSettings` alone.
    const anchorRef = useRef<HTMLDivElement>(null);

    // Commit a grading change from the popover onto the (first) prompt.
    const patchPrompt = (patch: Partial<MathPrompt>) => {
        if (!prompt) return;
        props.updateAttributes({
            prompts: prompts.map((p, i) => (i === 0 ? { ...p, ...patch } : p)),
        });
    };

    return (
        <NodeViewWrapper
        as="div"
        className={`math-block-wrapper ${editing ? 'is-selected' : ''}`}
        onClick={onWrapperClick}
        >
        <div ref={anchorRef} className="math-block-anchor">
        <div
        ref={renderRef}
        className="math-block-render"
        style={editing ? { display: 'none' } : undefined}
        />
        {editing && (
            <>
            <math-field ref={mathFieldRef} className="math-block-input" {...fieldProps}>
            {latex}
            </math-field>
            {/* Edit chrome (MA-DR1/DR2). onMouseDown+preventDefault so a button
                press doesn't blur the field (which would exit edit mode). */}
            <div className="math-edit-chrome" contentEditable={false}>
            <button
            type="button"
            className="math-insert-blank"
            onMouseDown={(e) => {
                e.preventDefault();
                insertPrompt();
            }}
            title="Insert a fill-in blank at the cursor"
            >
            + Blank
            </button>
            {prompt && (
                <button
                type="button"
                className="math-gap-settings"
                onMouseDown={(e) => {
                    e.preventDefault();
                    // Guard so the field's blur (opening the popover moves focus)
                    // doesn't exit edit mode; the popover survives either way.
                    keepEditingRef.current = true;
                    setShowSettings((s) => !s);
                }}
                aria-expanded={showSettings}
                title="Answer settings (equivalence, tolerance, alternatives)"
                >
                Answer settings
                </button>
            )}
            </div>
            </>
        )}
        </div>
        {showSettings && prompt && (
            <BlankEditPopover
            referenceElement={anchorRef.current}
            isOpen
            mathPromptMode
            blankId={prompt.id}
            initialAnswer={prompt.answer}
            initialAcceptableAnswers={prompt.acceptableAnswers}
            initialHint={undefined}
            initialMistakeFeedback={undefined}
            initialInterchangeable={false}
            initialAnswerType="math"
            initialTolerance={prompt.tolerance}
            initialEquivalence={prompt.equivalence}
            canGroupWithPrevious={false}
            onChange={(attrs) => {
                const patch: Partial<MathPrompt> = {};
                if (attrs.acceptableAnswers !== undefined)
                    patch.acceptableAnswers = attrs.acceptableAnswers;
                if ('tolerance' in attrs) patch.tolerance = attrs.tolerance;
                if ('equivalence' in attrs) patch.equivalence = attrs.equivalence;
                patchPrompt(patch);
            }}
            onClose={() => {
                setShowSettings(false);
                keepEditingRef.current = false;
            }}
            />
        )}
        </NodeViewWrapper>
    );
}
