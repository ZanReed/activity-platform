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
//    insertions), the marks, and the inline-math atom.
// 2. "+ Insert" — ALL block insertion, in one dropdown driven by
//    slashMenuItems.ts so it and the slash menu share one item list.
// 3. Contextual cluster — column controls render only while the selection is
//    inside a columns block (the pattern the graph NodeView's inline controls
//    set: controls live where/when they apply).
export default function Toolbar({ editor, variant = 'activity' }: ToolbarProps) {
    if (!editor) return null;

    const inColumns = editor.isActive('columns');

    return (
        // sticky: on long documents the toolbar follows the viewport instead
        // of scrolling away with the top of the editor card. z-30 sits above
        // editor content and the columns grip but below the anchored popovers
        // (z-50, portaled to body). The opaque bg + bottom border keep
        // scrolled content from showing through; rounded-t-lg replaces the
        // corner clipping the card's removed overflow-hidden provided.
        <div className="sticky top-0 z-30 flex flex-wrap gap-1 rounded-t-lg border-b border-slate-200 bg-slate-50 p-2">
            <TextStylePicker editor={editor} />

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={isMarkActive(editor, 'bold')}
            >
                <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={isMarkActive(editor, 'italic')}
            >
                <em>I</em>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={isMarkActive(editor, 'underline')}
            >
                <u>U</u>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={isMarkActive(editor, 'code')}
            >
                <code>{'<>'}</code>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                active={isMarkActive(editor, 'subscript')}
            >
                X<sub>2</sub>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                active={isMarkActive(editor, 'superscript')}
            >
                X<sup>2</sup>
            </ToolbarButton>
            {/*
              Define — applies the inline vocabulary-definition mark to the
              selection and opens the edit popover (DefinitionPopoverHost). A
              mark, so it lives with the other text marks. Enabled when there's
              a selection to define, or when the cursor is already inside a
              definition (active). Re-clicking while active is a no-op so it
              never clobbers the existing definition text.
            */}
            <ToolbarButton
                onClick={() => {
                    if (editor.isActive('definition')) return;
                    editor.chain().focus().setDefinition().run();
                }}
                disabled={
                    editor.state.selection.empty &&
                    !editor.isActive('definition')
                }
                active={isMarkActive(editor, 'definition')}
                title="Define the selected term (adds a vocabulary definition)"
            >
                Define
            </ToolbarButton>

            <Divider />

            {/* Inline math is selection-level (an inline atom at the cursor),
                so it stays a flat button; every BLOCK insert lives in the
                "+ Insert" dropdown. */}
            <ToolbarButton
                onClick={() => editor.chain().focus().insertMathInline('x^2').run()}
                title="Insert inline math at the cursor"
            >
                ƒx
            </ToolbarButton>

            <Divider />

            <InsertMenu editor={editor} variant={variant} />

            {/*
              Contextual column cluster — rendered ONLY while the selection is
              inside a columns block, instead of sitting permanently disabled.
              Within the cluster, + / − Column still use editor.can() for
              enablement at the schema's 2–6 bounds.
            */}
            {inColumns && (
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
                            editor.getAttributes('columns').gridLines === 'on'
                        }
                        title="Cycle grid lines on the selected columns block (auto → on → off)"
                    >
                        {`Grid: ${
                            editor.getAttributes('columns').gridLines === 'on'
                                ? 'on'
                                : editor.getAttributes('columns').gridLines ===
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
