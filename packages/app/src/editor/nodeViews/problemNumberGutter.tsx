import type { ReactElement } from 'react';

// Shared editor-side rendering of the per-block label (numbering/label decouple)
// for the question NodeViews. Two shapes: a gutter div (mc/matching/ordering)
// and a text prefix (number_line/graph/data_plot header labels).

type LabelAttr = { mode?: string; text?: string } | null | undefined;

export function labelModeOf(label: LabelAttr): string {
    return label?.mode ?? 'auto';
}

// Gutter for gutter-style NodeViews. `none` shows a faint dash so the author
// sees a deliberate (still-graded) unnumbered block; `custom` shows the text.
export function ProblemNumberGutter({
    label,
    problemNumber,
    className = 'mc-block__number',
}: {
    label: LabelAttr;
    problemNumber: number;
    className?: string;
}): ReactElement {
    const mode = labelModeOf(label);
    if (mode === 'none') {
        return (
            <div
                className={`${className} ${className}--none`}
                contentEditable={false}
                title="Unnumbered on the page — still graded and reviewable"
            >
                —
            </div>
        );
    }
    if (mode === 'custom') {
        return (
            <div
                className={`${className} ${className}--custom`}
                contentEditable={false}
            >
                {label?.text}
            </div>
        );
    }
    return (
        <div className={className} contentEditable={false}>
            {problemNumber}.
        </div>
    );
}

// Prefix for header-label NodeViews: "3. " (auto), "Warm-up · " (custom), or ""
// (none). Keeps the descriptive header ("… Interactive graph") intact.
export function labelPrefix(label: LabelAttr, problemNumber: number): string {
    const mode = labelModeOf(label);
    if (mode === 'none') return '';
    if (mode === 'custom') return `${label?.text} · `;
    return `${problemNumber}. `;
}
