import { useEffect, useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    type NodeViewProps,
} from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import PromptField from '../components/PromptField';
import type { InlineNodes } from '../../lib/serialize';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
import { problemNumberAt, fadedStepContextAt } from '../problemNumbering';

// ============================================================================
// FillInBlankView — NodeView for the fill_in_blank block.
// ----------------------------------------------------------------------------
// Visual structure:
//   <div.fill-in-blank-block>
//     <div.fill-in-blank-block__number>1.</div>
//     <NodeViewContent />   <- editable inline content (text, math, blanks)
//   </div>
//
// NodeViewWrapper handles the block-level tag automatically based on the
// node's content spec in FillInBlank.ts; we no longer pass an explicit
// `as` prop (it was leaking to the DOM as a literal attribute).
//
// Problem numbering:
//   Computed from document position — we walk the doc and count how many
//   fillInBlank nodes precede this one, then add 1. Tiptap re-renders the
//   NodeView when the doc changes, so reordering blocks updates the
//   displayed number automatically.
//
// Why useMemo on the position walk?
//   The doc walk is O(blocks). Doing it on every keystroke in a 50-block doc
//   is cheap but not free. The memo keys on editor.state — recomputes only
//   when document state changes, not on every NodeView render.
//
// Selection state:
//   Mirrors .math-block-wrapper.is-selected — blue outline + tinted bg.
//
// Block settings:
//   `solution` / `hasConfidenceRating` / `workSpace` live in the descriptor
//   drawer (blockControls.ts → questionAdvanced), reached via the quick-bar ⚙.
//   The block keeps only a display-only QuestionSettingsSummary — the old
//   inline "⚙ Settings" footer is gone (drawer = the single settings home).
//   `skills` has no control yet (Phase 2); the attr still round-trips through
//   serialize.
// ============================================================================

export default function FillInBlankView({
    node,
    editor,
    getPos,
    selected,
}: NodeViewProps) {
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasSolution = solution.length > 0;
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const workSpace =
        typeof node.attrs.workSpace === 'number'
            ? (node.attrs.workSpace as number)
            : null;
    // Per-block label (numbering/label decouple). null/absent = auto.
    const label = node.attrs.label as
        | { mode?: string; text?: string }
        | null;
    const labelMode = label?.mode ?? 'auto';

    // Blank-discoverability chrome: while the block is being edited, a "+ Blank"
    // button (the primary maker, mirroring the math editors' in-equation button)
    // and a faint power-user tip about the `{{answer}}` shorthand. Both live in a
    // focus-gated footer so the resting block stays clean — the button appears the
    // moment the caret enters the block (including a freshly inserted empty one),
    // and stays put while a just-made blank's popover is open.
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        if (!editor) return;
        const update = () => {
            const pos = typeof getPos === 'function' ? getPos() : undefined;
            if (typeof pos !== 'number') {
                setIsEditing((prev) => (prev ? false : prev));
                return;
            }
            const self = editor.state.doc.nodeAt(pos);
            const end = pos + (self ? self.nodeSize : node.nodeSize);
            const sel = editor.state.selection;
            const within = sel.from >= pos && sel.to <= end;
            // Editor-focused caret inside → editing. Also keep the chrome up when
            // a blank inside is node-selected (its popover took DOM focus, so the
            // editor is blurred but the ProseMirror selection is still in here).
            const active =
                within && (editor.isFocused || sel instanceof NodeSelection);
            setIsEditing((prev) => (prev === active ? prev : active));
        };
        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        editor.on('focus', update);
        editor.on('blur', update);
        update();
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
            editor.off('focus', update);
            editor.off('blur', update);
        };
    }, [editor, getPos, node.nodeSize]);

    // A fill_in_blank nested directly in a faded worked example is a "faded
    // step": it drops the problem-number gutter and shows a compact inline
    // letter — the box owns the one problem number. fadedStep is null for a
    // standalone problem, which keeps its numeric gutter.
    const { problemNumber, fadedStep } = useMemo(() => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        const step = fadedStepContextAt(editor, pos);
        return {
            problemNumber: step ? 0 : problemNumberAt(editor, pos),
            fadedStep: step,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor.state, getPos]);

    return (
        <NodeViewWrapper
            className={`fill-in-blank-block${
                fadedStep ? ' is-faded-step' : ''
            }${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            {fadedStep ? (
                // Always rendered; the parent box hides these via a CSS
                // modifier when its showStepLabels toggle is off. (A NodeView
                // can't react to a parent attr change, so visibility lives with
                // the parent that re-renders, not here.)
                <span
                    className="fill-in-blank-block__step-label"
                    contentEditable={false}
                >
                    ({fadedStep.letter})
                </span>
            ) : labelMode === 'none' ? (
                // Unnumbered on the published page. In the editor we still show a
                // faint dash so the author sees it's a deliberate (still-graded)
                // unnumbered blank, not a missing number.
                <div
                    className="fill-in-blank-block__number fill-in-blank-block__number--none"
                    contentEditable={false}
                    title="Unnumbered on the page — still graded and reviewable"
                >
                    —
                </div>
            ) : labelMode === 'custom' ? (
                <div
                    className="fill-in-blank-block__number fill-in-blank-block__number--custom"
                    contentEditable={false}
                >
                    {label?.text}
                </div>
            ) : (
                <div
                    className="fill-in-blank-block__number"
                    contentEditable={false}
                >
                    {problemNumber}.
                </div>
            )}
            <PromptField
                node={node}
                className="fill-in-blank-block__body"
                placeholder="Type the sentence…"
            />
            {isEditing && (
                <div
                    className="fill-in-blank-block__chrome"
                    contentEditable={false}
                >
                    <button
                        type="button"
                        className="fill-in-blank-block__add-blank"
                        // preventDefault the press so it can't move the editor
                        // selection or blur (which would unmount this chrome
                        // before the click). Do the insert on CLICK, after all
                        // mouse-driven selection handling has settled, so the
                        // NodeSelection we set to open the popover isn't clobbered
                        // by a trailing mouseup. Append at the block's content-end
                        // (from getPos) rather than trusting the live selection.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            const pos =
                                typeof getPos === 'function' ? getPos() : undefined;
                            if (typeof pos !== 'number') return;
                            const self = editor.state.doc.nodeAt(pos);
                            const end =
                                pos + (self ? self.nodeSize : node.nodeSize) - 1;
                            editor.commands.insertBlankAndEdit(end);
                        }}
                        title="Insert a fill-in blank at the cursor (⌘⇧B)"
                    >
                        + Blank
                    </button>
                    <span className="fill-in-blank-block__tip">
                        or type <code>{'{{answer}}'}</code>
                    </span>
                </div>
            )}
            <QuestionSettingsSummary
                hasSolution={hasSolution}
                hasConfidenceRating={hasConfidenceRating}
                workSpace={workSpace}
            />
        </NodeViewWrapper>
    );
}
