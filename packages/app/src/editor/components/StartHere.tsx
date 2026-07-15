import { startHereThumbnails } from '../blockThumbnails';

// ============================================================================
// StartHere — the first-run empty-doc state (slice-6 stage 5).
// ----------------------------------------------------------------------------
// A brand-new empty worksheet is the one screen where "no tutorial" is decided
// (design: notion-hybrid-editor.md → §First-run). Three one-tap visual
// starters give instant momentum: Title + instructions (drops heading +
// paragraph, caret in the heading), A question (opens the block picker at
// Blanks), Two-column layout. The Editor owns when this shows (doc empty +
// session latch — once the doc has real content it never returns this
// session) and what each tap does; this component is pure presentation.
// The `/` ghost hint and the end square stay visible alongside — this screen
// gently emphasizes them via the canvas's `editor-first-run` class.
// ============================================================================

interface StartHereProps {
    onTitleInstructions: () => void;
    onQuestion: () => void;
    onColumns: () => void;
}

export default function StartHere({
    onTitleInstructions,
    onQuestion,
    onColumns,
}: StartHereProps) {
    const starters = [
        {
            label: 'Title + instructions',
            thumb: startHereThumbnails.titleInstructions,
            onPick: onTitleInstructions,
        },
        {
            label: 'A question',
            thumb: startHereThumbnails.question,
            onPick: onQuestion,
        },
        {
            label: 'Two-column layout',
            thumb: startHereThumbnails.twoColumns,
            onPick: onColumns,
        },
    ];
    return (
        <div className="start-here" data-testid="start-here">
            <div className="start-here__title">Start here</div>
            <p className="start-here__sub">
                Pick a starting point — or just start typing above.
            </p>
            <div className="start-here__cards">
                {starters.map((s) => (
                    <button
                        key={s.label}
                        type="button"
                        className="start-here__card"
                        onClick={s.onPick}
                    >
                        <span className="start-here__thumb" aria-hidden="true">
                            {s.thumb}
                        </span>
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
