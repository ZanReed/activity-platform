import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';
import ColumnWidthPicker from './components/ColumnWidthPicker';
import CellHeightControl from './components/CellHeightControl';
import InsertMenu from './components/InsertMenu';
import TextStylePicker from './components/TextStylePicker';

// editor.isActive(markName) returns false when a mark is "armed" on a collapsed
// cursor — ProseMirror's stored-marks state, applied to the next typed character.
// For toolbar UX we want both states to show as active: the button reflects
// "mark will apply to what you type / is applied to what's selected," which
// matches how Word, Google Docs, and most editors visualize it.
function isMarkActive(editor: Editor, markName: string): boolean {
    if (editor.isActive(markName)) return true;
    return editor.state.storedMarks?.some((m) => m.type.name === markName) ?? false;
}

interface ToolbarProps {
    editor: Editor | null;
    // The focused nested rich field (MC choice/feedback, worked solutions,
    // blank hints …), reported through FieldFocusContext. While set, the mark
    // and inline-math buttons route to IT — the one toolbar formats everything
    // — and the main-document-only controls (style picker, Define) disable.
    fieldEditor?: Editor | null;
    // 'activity' (default) is the full toolbar. 'reference' is the constrained
    // set for the reference-panel editor: same selection formatting and column
    // controls, but the "+ Insert" dropdown only offers the reference-safe
    // items (no Section, questions, or graphs — a panel has neither questions
    // nor sections). Additive — the main editor passes nothing.
    variant?: 'activity' | 'reference';
}

// Three tiers (editor toolbar reorganization, 2026-07-08):
// 1. Flat controls — ONLY selection formatting: the block-style picker
//    (headings/paragraph/lists are transforms of the current block, not
//    insertions), the marks, and the inline-math atom. These route to the
//    focused nested field when one is active (slice-6 MC pass).
// 2. Block insertion — in the activity editor this lives OUTSIDE the toolbar
//    now (the in-canvas "Add a block" window + the "/" slash menu). Only the
//    reference panel still shows the "+ Insert" dropdown here.
// 3. Contextual cluster — column controls render only while the selection is
//    inside a columns block (the pattern the graph NodeView's inline controls
//    set: controls live where/when they apply).
export default function Toolbar({
    editor,
    fieldEditor = null,
    variant = 'activity',
}: ToolbarProps) {
    if (!editor) return null;

    // The formatting target: the focused nested field, else the main editor.
    const field =
        fieldEditor && !fieldEditor.isDestroyed ? fieldEditor : null;
    const target = field ?? editor;
    const inField = field !== null;

    const inColumns = editor.isActive('row');

    return (
        // sticky: on long documents the toolbar follows the viewport instead
        // of scrolling away with the top of the editor card. z-30 sits above
        // editor content and the columns grip but below the anchored popovers
        // (z-50, portaled to body). The opaque bg + bottom border keep
        // scrolled content from showing through; rounded-t-lg replaces the
        // corner clipping the card's removed overflow-hidden provided.
        // `editor-toolbar` is the stable hook the popovers' outside-click
        // handlers allowlist (formatting a popover field mustn't close it).
        <div className="editor-toolbar sticky top-0 z-30 flex flex-wrap gap-1 rounded-t-lg border-b border-slate-200 bg-slate-50 p-2">
            {/* Block styles are main-document transforms — disabled while a
                nested field has focus (a hint can't become a heading). */}
            <TextStylePicker editor={editor} disabled={inField} />

            <Divider />

            <ToolbarButton
                onClick={() => target.chain().focus().toggleBold().run()}
                active={isMarkActive(target, 'bold')}
            >
                <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => target.chain().focus().toggleItalic().run()}
                active={isMarkActive(target, 'italic')}
            >
                <em>I</em>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => target.chain().focus().toggleUnderline().run()}
                active={isMarkActive(target, 'underline')}
            >
                <u>U</u>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => target.chain().focus().toggleCode().run()}
                active={isMarkActive(target, 'code')}
            >
                <code>{'<>'}</code>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => target.chain().focus().toggleSubscript().run()}
                active={isMarkActive(target, 'subscript')}
            >
                X<sub>2</sub>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => target.chain().focus().toggleSuperscript().run()}
                active={isMarkActive(target, 'superscript')}
            >
                X<sup>2</sup>
            </ToolbarButton>
            {/*
              Define — applies the inline vocabulary-definition mark to the
              selection and opens the edit popover (DefinitionPopoverHost). A
              mark, so it lives with the other text marks. Enabled when there's
              a selection to define, or when the cursor is already inside a
              definition (active). Re-clicking while active is a no-op so it
              never clobbers the existing definition text. Main-document only —
              nested fields have no definition mark.
            */}
            <ToolbarButton
                onClick={() => {
                    if (editor.isActive('definition')) return;
                    editor.chain().focus().setDefinition().run();
                }}
                disabled={
                    inField ||
                    (editor.state.selection.empty &&
                        !editor.isActive('definition'))
                }
                active={!inField && isMarkActive(editor, 'definition')}
                title="Define the selected term (adds a vocabulary definition)"
            >
                Define
            </ToolbarButton>

            <Divider />

            {/* Inline math is selection-level (an inline atom at the cursor),
                so it stays a flat button; every BLOCK insert lives in the
                "+ Insert" dropdown. In a nested field the seed is empty — the
                fields don't register MathFocus, so the atom opens on click. */}
            <ToolbarButton
                onClick={() =>
                    target
                        .chain()
                        .focus()
                        .insertMathInline(inField ? '' : 'x^2')
                        .run()
                }
                title="Insert inline math at the cursor"
            >
                ƒx
            </ToolbarButton>

            {/* Block insertion in the ACTIVITY editor moved into the in-canvas
                "Add a block" window (the between-block line + end square) and
                the "/" slash menu, so no toolbar insert button here. The
                constrained REFERENCE panel keeps its dropdown — it has no
                in-canvas affordances of its own. */}
            {variant === 'reference' && (
                <>
                    <Divider />
                    <InsertMenu editor={editor} variant={variant} />
                </>
            )}

            {/*
              Contextual column cluster — rendered ONLY while the selection is
              inside a columns block, instead of sitting permanently disabled.
              Within the cluster, + / − Column still use editor.can() for
              enablement at the schema's 2–6 bounds.
            */}
            {inColumns && !inField && (
                <>
                    <Divider />

                    {/*
                      Grid-lines toggle — cycles the block's tri-state
                      (inherit → on → off → inherit). The label reflects the
                      current state so the author sees whether the block defers
                      to the activity default ("Grid: auto") or overrides it
                      ("Grid: on"/"Grid: off"). Active styling lights up only
                      for an explicit "on".
                    */}
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().cycleColumnsGridLines().run()
                        }
                        active={
                            editor.getAttributes('row').gridLines === 'on'
                        }
                        title="Cycle grid lines on the selected columns block (auto → on → off)"
                    >
                        {`Grid: ${
                            editor.getAttributes('row').gridLines === 'on'
                                ? 'on'
                                : editor.getAttributes('row').gridLines ===
                                    'off'
                                  ? 'off'
                                  : 'auto'
                        }`}
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addColumn().run()}
                        disabled={!editor.can().addColumn()}
                        title="Add a column to the selected layout (max 6)"
                    >
                        + Column
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().removeColumn().run()}
                        disabled={!editor.can().removeColumn()}
                        title="Remove the current column (min 2)"
                    >
                        − Column
                    </ToolbarButton>
                    {/*
                      Width presets — a visual dropdown (ColumnWidthPicker) of
                      layout thumbnails. Options depend on the column count
                      (2-col: even / wide L / wide R; 3-col adds wide C and the
                      three narrow-* options); 4–6-column blocks are even-only
                      so the trigger disables.
                    */}
                    <ColumnWidthPicker editor={editor} />
                    {/*
                      Reserved work space — a min-height floor on the active
                      cell (schema Column.minHeight, rem). Auto / quick presets
                      / numeric input; the cell still grows with content.
                      Control-first by design (no drag gesture — see the
                      cancelled column-divider lesson in
                      docs/design/variable-block-sizing.md).
                    */}
                    <CellHeightControl editor={editor} />
                </>
            )}
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: ReactNode;
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            // preventDefault keeps the mousedown from stealing focus — the
            // formatting target (main doc or a nested field) must stay focused
            // so the command applies to ITS selection. Without this, clicking
            // a mark button while in a nested field blurs the field first and
            // the command would route to the wrong editor.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition ${
                disabled
                    ? 'cursor-not-allowed bg-white text-slate-300'
                    : active
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="mx-1 w-px self-stretch bg-slate-300" />;
}
