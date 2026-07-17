import { useCallback, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// ============================================================================
// usePreviewToggle — the "preview as student" eye toggle shared by the three
// graphing NodeViews (interactive_graph / number_line / data_plot).
// ----------------------------------------------------------------------------
// Per the graph-authoring-redirection design (docs/design/editor-refinement-
// pass.md → "Graph authoring redirection"), the toggle hides ALL authoring
// chrome (type picker, answer inputs, helper text, settings summary) so the
// author sees the block the way it SITS on the page — a flow/layout preview,
// NOT a fidelity-accurate student simulation (a graded board still shows the
// author's answer drawables; real student experience = publish the activity).
//
// State is NodeView-local and ephemeral by design: it lives with the React
// component, never touches the document, never serializes, and resets if the
// NodeView is recreated (drag-reorder / some undo paths) — exactly the
// "per-block, session state" the design calls for. No plumbing through the
// positional BlockQuickBarHost, which has no stable per-block identity.
// ============================================================================

export function usePreviewToggle(): { preview: boolean; toggle: () => void } {
    const [preview, setPreview] = useState(false);
    const toggle = useCallback(() => setPreview((p) => !p), []);
    return { preview, toggle };
}

export function PreviewEyeButton({
    preview,
    onToggle,
}: {
    preview: boolean;
    onToggle: () => void;
}) {
    const label = preview ? 'Back to editing' : 'Preview as student';
    return (
        <button
            type="button"
            className={`graph-preview-eye${preview ? ' is-on' : ''}`}
            title={label}
            aria-label={label}
            aria-pressed={preview}
            // Don't steal the caret / move the selection when clicking.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggle}
        >
            {preview ? (
                <EyeOff size={15} aria-hidden="true" />
            ) : (
                <Eye size={15} aria-hidden="true" />
            )}
        </button>
    );
}
