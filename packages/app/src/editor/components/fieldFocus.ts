import { createContext } from 'react';
import type { Editor } from '@tiptap/react';

// ============================================================================
// FieldFocusContext — routes the top toolbar at the focused nested field.
// ----------------------------------------------------------------------------
// The rich sub-fields (MC choice text / feedback, matching items, worked
// solutions, blank hints, definitions …) are nested Tiptap instances whose
// value lives in node attrs — the main toolbar's editor can't format them.
// Instead of each field carrying its own mini toolbar (the pre-slice-6
// clutter), every InlineRichTextEditor reports its focus through this context;
// Editor.tsx tracks the focused field and Toolbar routes the mark/math
// buttons to it (main-document-only controls disable while a field is
// active).
//
// The reporter contract: call (editor, true) on focus, (editor, false) on
// blur/unmount. The owner clears only if the reporting editor is still the
// active one, so a blur that races the next field's focus can't null it.
// ============================================================================

export type FieldFocusReporter = (field: Editor, focused: boolean) => void;

export const FieldFocusContext = createContext<FieldFocusReporter>(() => {});
