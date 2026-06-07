import { useMemo, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';

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
// Block settings (Stage 15):
//   A footer disclosure exposes the block-level fields — `solution` (a worked
//   explanation revealed post-check) and `hasConfidenceRating` (whether the
//   problem asks for a confidence rating). These are document concerns, so the
//   controls write straight to ProseMirror via `updateAttributes`; only the
//   open/closed disclosure is React state (the 5-commitments rule). The footer
//   is contentEditable={false} so ProseMirror doesn't treat it as block
//   content, and stays hidden for a plain, unselected, unconfigured problem to
//   keep a long worksheet uncluttered. `skills` has no control yet (Phase 2);
//   the attr still round-trips through serialize.
// ============================================================================

export default function FillInBlankView({
    node,
    editor,
    getPos,
    selected,
    updateAttributes,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const solution = (node.attrs.solution as string | undefined) ?? '';
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isEditable = editor.isEditable;
    const isConfigured = solution.length > 0 || hasConfidenceRating;
    // The `selected` prop is only true for a NodeSelection of the whole block.
    // Clicking into a problem puts the cursor *inside* its editable content (a
    // TextSelection), so `selected` stays false and a footer gated on it never
    // reveals — teachers couldn't find these settings. Show the toggle on every
    // problem while editing; collapsed it's a single unobtrusive row. Outside
    // the editor (preview/read-only) keep it hidden unless already configured.
    const showFooter = isEditable || isConfigured;

    const problemNumber = useMemo(() => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (pos === undefined) return 1;

        let count = 1;
        editor.state.doc.descendants((descendant, descendantPos) => {
            if (descendantPos >= pos) return false;
            if (descendant.type.name === 'fillInBlank') {
                count++;
            }
            return true;
        });
        return count;
    }, [editor.state, getPos]);

    return (
        <NodeViewWrapper
            className={`fill-in-blank-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div className="fill-in-blank-block__number" contentEditable={false}>
                {problemNumber}.
            </div>
            <NodeViewContent className="fill-in-blank-block__body" />
            {showFooter && (
                <div
                    className="fill-in-blank-block__settings"
                    contentEditable={false}
                >
                    <button
                        type="button"
                        className="fill-in-blank-block__settings-toggle"
                        onClick={() => setSettingsOpen((open) => !open)}
                        aria-expanded={settingsOpen}
                        disabled={!isEditable}
                    >
                        <span aria-hidden="true">⚙</span> Settings
                        {!settingsOpen && isConfigured && (
                            <span className="fill-in-blank-block__settings-badge">
                                {solution.length > 0 && 'solution'}
                                {solution.length > 0 &&
                                    hasConfidenceRating &&
                                    ' · '}
                                {hasConfidenceRating && 'confidence'}
                            </span>
                        )}
                    </button>
                    {settingsOpen && (
                        <div className="fill-in-blank-block__settings-panel">
                            <label className="fill-in-blank-block__settings-field">
                                <span className="fill-in-blank-block__settings-label">
                                    Worked solution
                                </span>
                                <textarea
                                    className="fill-in-blank-block__solution"
                                    value={solution}
                                    placeholder="Shown to students after the section is checked."
                                    onChange={(e) =>
                                        updateAttributes({
                                            solution: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => e.stopPropagation()}
                                    disabled={!isEditable}
                                    rows={3}
                                />
                            </label>
                            <label className="fill-in-blank-block__settings-checkbox">
                                <input
                                    type="checkbox"
                                    checked={hasConfidenceRating}
                                    onChange={(e) =>
                                        updateAttributes({
                                            hasConfidenceRating:
                                                e.target.checked,
                                        })
                                    }
                                    onKeyDown={(e) => e.stopPropagation()}
                                    disabled={!isEditable}
                                />
                                <span>Ask for a confidence rating</span>
                            </label>
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
