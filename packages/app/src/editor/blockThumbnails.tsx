import type { ReactElement, ReactNode } from 'react';

// ============================================================================
// blockThumbnails — static SVG mini-previews for the "Add a block" window.
// ----------------------------------------------------------------------------
// Slice-6 stage 5 (design: notion-hybrid-editor.md → "Block picker = visual
// preview"). Each pickable slashMenuItems entry gets a tiny hand-drawn render
// of what the block looks like, so the picker conveys "what it is + how it
// helps" visually instead of via prose. Static SVG by eng-review ruling (no
// live renders). Keyed by the item's `title` — the same key the picker already
// uses — and a unit test (blockThumbnails.test.tsx) guards parity with
// slashMenuItems so a new block type can't ship without a thumbnail.
//
// Shared mini-language: grey rounded bars = text, grey strokes = frames/axes,
// the blue accent marks the spot a STUDENT interacts with (blank, choice,
// point, input). All colors route through the --ed-* tokens so the thumbnails
// track the editor palette.
// ============================================================================

const LINE = 'var(--ed-border-strong)'; /* slate-300 — text lines, frames */
const SOFT = 'var(--ed-border)'; /* slate-200 — faint fills */
const INK = 'var(--ed-text-muted)'; /* slate-500 — emphasis strokes/glyphs */
const ACCENT = 'var(--ed-accent)'; /* blue-500 — the interaction point */
const ACCENT_BG = 'var(--ed-accent-bg)'; /* blue-50 */

// Plain lowercase element factories (not React components — the file exports
// data records, and mixing components in would break react-refresh).
function thumb(children: ReactNode): ReactElement {
    return (
        <svg
            viewBox="0 0 96 56"
            className="block-thumb"
            aria-hidden="true"
            focusable="false"
        >
            {children}
        </svg>
    );
}

// A rounded "text line" bar.
function bar(x: number, y: number, w: number, h = 3, fill = LINE): ReactElement {
    return (
        <rect key={`${x},${y}`} x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
    );
}

const titleInstructions = thumb(
    <>
        {bar(14, 11, 46, 6, INK)}
        {bar(14, 26, 66)}
        {bar(14, 33, 58)}
        {bar(14, 40, 62)}
    </>
);

const blockMath = thumb(
    <>
        <text
            x="30"
            y="37"
            fontSize="24"
            fontFamily="Georgia, serif"
            fill={INK}
        >
            ∑
        </text>
        {bar(50, 20, 22)}
        <rect x={47} y={27} width={28} height={2} rx={1} fill={INK} />
        {bar(50, 33, 22)}
    </>
);

const sectionBreak = thumb(
    <>
        {bar(14, 9, 56)}
        {bar(14, 16, 40)}
        <circle cx={14} cy={28} r={3} fill={ACCENT} />
        <line
            x1={22}
            y1={28}
            x2={82}
            y2={28}
            stroke={LINE}
            strokeWidth={2}
            strokeDasharray="4 4"
        />
        {bar(14, 38, 56)}
        {bar(14, 45, 32)}
    </>
);

const twoColumns = thumb(
    <>
        <rect x={10} y={8} width={36} height={40} rx={4} fill="none" stroke={LINE} />
        {bar(16, 16, 24)}
        {bar(16, 23, 18)}
        {bar(16, 30, 24)}
        <rect x={50} y={8} width={36} height={40} rx={4} fill="none" stroke={LINE} />
        {bar(56, 16, 24)}
        {bar(56, 23, 18)}
        {bar(56, 30, 24)}
    </>
);

const threeColumns = thumb(
    <>
        {[8, 36, 64].map((x) => (
            <g key={x}>
                <rect
                    x={x}
                    y={8}
                    width={24}
                    height={40}
                    rx={4}
                    fill="none"
                    stroke={LINE}
                />
                {bar(x + 5, 16, 14)}
                {bar(x + 5, 23, 10)}
            </g>
        ))}
    </>
);

const splitIntoColumns = thumb(
    <>
        {bar(14, 7, 56)}
        {bar(14, 14, 40)}
        {/* down arrow into the left cell */}
        <path
            d="M28 20 v7 m0 0 l-3 -3 m3 3 l3 -3"
            stroke={ACCENT}
            strokeWidth={1.75}
            fill="none"
            strokeLinecap="round"
        />
        <rect x={10} y={31} width={36} height={18} rx={3} fill="none" stroke={LINE} />
        {bar(16, 37, 22)}
        {bar(16, 43, 16)}
        <rect
            x={50}
            y={31}
            width={36}
            height={18}
            rx={3}
            fill="none"
            stroke={LINE}
            strokeDasharray="3 3"
        />
    </>
);

const learningObjectives = thumb(
    <>
        <circle cx={18} cy={15} r={7} fill="none" stroke={ACCENT} strokeWidth={1.75} />
        <circle cx={18} cy={15} r={2.5} fill={ACCENT} />
        {bar(31, 13, 40, 4, INK)}
        <circle cx={16} cy={33} r={2} fill={LINE} />
        {bar(23, 31, 48)}
        <circle cx={16} cy={43} r={2} fill={LINE} />
        {bar(23, 41, 40)}
    </>
);

const workedExample = thumb(
    <>
        <rect x={8} y={6} width={80} height={44} rx={4} fill="none" stroke={LINE} />
        {bar(14, 12, 30, 4, INK)}
        {bar(14, 23, 60)}
        {bar(14, 30, 66)}
        {bar(14, 37, 48)}
    </>
);

const fadedWorkedExample = thumb(
    <>
        <rect x={8} y={6} width={80} height={44} rx={4} fill="none" stroke={LINE} />
        {bar(14, 13, 60)}
        {bar(14, 21, 52)}
        {bar(14, 32, 18)}
        <rect
            x={36}
            y={28}
            width={24}
            height={9}
            rx={4.5}
            fill={ACCENT_BG}
            stroke={ACCENT}
        />
        {bar(64, 32, 16)}
        {bar(14, 42, 40)}
    </>
);

const image = thumb(
    <>
        <rect x={18} y={6} width={60} height={44} rx={4} fill="none" stroke={LINE} />
        <circle cx={62} cy={17} r={5} fill={LINE} />
        <path
            d="M22 46 L38 26 L48 36 L56 28 L74 46 Z"
            fill={SOFT}
            stroke={LINE}
            strokeLinejoin="round"
        />
    </>
);

const staticGraph = thumb(
    <>
        <path d="M16 8 V44 H84" fill="none" stroke={INK} strokeWidth={2} />
        <path
            d="M20 40 C 36 38, 44 14, 80 12"
            fill="none"
            stroke={LINE}
            strokeWidth={2.5}
            strokeLinecap="round"
        />
    </>
);

const fillInBlank = thumb(
    <>
        {bar(12, 16, 20)}
        <rect
            x={36}
            y={11}
            width={26}
            height={11}
            rx={4}
            fill={ACCENT_BG}
            stroke={ACCENT}
        />
        {bar(66, 16, 18)}
        {bar(12, 33, 44)}
        {bar(12, 40, 30)}
    </>
);

const answerBlank = thumb(
    <>
        {bar(10, 26, 14)}
        <rect
            x={28}
            y={20}
            width={40}
            height={14}
            rx={6}
            fill={ACCENT_BG}
            stroke={ACCENT}
        />
        {bar(72, 26, 14)}
    </>
);

const multipleChoice = thumb(
    <>
        <circle cx={16} cy={14} r={4} fill="none" stroke={LINE} strokeWidth={1.75} />
        {bar(26, 12, 44)}
        <circle cx={16} cy={28} r={4} fill="none" stroke={ACCENT} strokeWidth={1.75} />
        <circle cx={16} cy={28} r={1.75} fill={ACCENT} />
        {bar(26, 26, 52)}
        <circle cx={16} cy={42} r={4} fill="none" stroke={LINE} strokeWidth={1.75} />
        {bar(26, 40, 38)}
    </>
);

const matching = thumb(
    <>
        <rect x={10} y={10} width={20} height={10} rx={2} fill="none" stroke={LINE} />
        <rect x={10} y={36} width={20} height={10} rx={2} fill="none" stroke={LINE} />
        <rect x={66} y={10} width={20} height={10} rx={2} fill="none" stroke={LINE} />
        <rect x={66} y={36} width={20} height={10} rx={2} fill="none" stroke={LINE} />
        <line x1={30} y1={15} x2={66} y2={41} stroke={ACCENT} strokeWidth={1.75} />
        <line x1={30} y1={41} x2={66} y2={15} stroke={ACCENT} strokeWidth={1.75} />
    </>
);

const ordering = thumb(
    <>
        <rect x={14} y={7} width={64} height={11} rx={3} fill="none" stroke={LINE} />
        {bar(28, 11, 36)}
        <rect x={18} y={22} width={64} height={11} rx={3} fill="none" stroke={ACCENT} />
        {bar(32, 26, 36)}
        <rect x={14} y={37} width={64} height={11} rx={3} fill="none" stroke={LINE} />
        {bar(28, 41, 36)}
        {[12.5, 27.5, 42.5].map((y) => (
            <g key={y} fill={LINE}>
                <circle cx={20.5} cy={y - 1.75} r={1} />
                <circle cx={24} cy={y - 1.75} r={1} />
                <circle cx={20.5} cy={y + 1.75} r={1} />
                <circle cx={24} cy={y + 1.75} r={1} />
            </g>
        ))}
    </>
);

const interactiveGraph = thumb(
    <>
        <path d="M48 8 V44 M16 26 H84" fill="none" stroke={LINE} strokeWidth={1.5} />
        <circle cx={64} cy={16} r={4.5} fill={ACCENT} />
    </>
);

const numberLine = thumb(
    <>
        <line x1={10} y1={30} x2={86} y2={30} stroke={INK} strokeWidth={2} />
        {[18, 30, 42, 54, 66, 78].map((x) => (
            <line key={x} x1={x} y1={26} x2={x} y2={34} stroke={LINE} strokeWidth={1.5} />
        ))}
        <line x1={42} y1={30} x2={80} y2={30} stroke={ACCENT} strokeWidth={3.5} />
        <circle cx={42} cy={30} r={4.5} fill={ACCENT} />
        <path
            d="M80 25 l7 5 l-7 5"
            fill="none"
            stroke={ACCENT}
            strokeWidth={2.5}
            strokeLinejoin="round"
        />
    </>
);

const dataPlot = thumb(
    <>
        <rect x={20} y={28} width={10} height={16} fill={SOFT} stroke={LINE} />
        <rect
            x={34}
            y={16}
            width={10}
            height={28}
            fill={ACCENT_BG}
            stroke={ACCENT}
        />
        <rect x={48} y={22} width={10} height={22} fill={SOFT} stroke={LINE} />
        <rect x={62} y={34} width={10} height={10} fill={SOFT} stroke={LINE} />
        <line x1={14} y1={44} x2={82} y2={44} stroke={INK} strokeWidth={2} />
    </>
);

const selfExplanation = thumb(
    <>
        <text x="10" y="18" fontSize="15" fontFamily="Georgia, serif" fill={INK}>
            ❝
        </text>
        {bar(26, 9, 44, 4, INK)}
        <rect x={12} y={22} width={72} height={26} rx={4} fill="none" stroke={LINE} />
        {bar(18, 30, 40, 3, SOFT)}
        {bar(18, 37, 52, 3, SOFT)}
    </>
);

const shortAnswer = thumb(
    <>
        {bar(12, 11, 56, 4, INK)}
        <rect x={12} y={24} width={72} height={15} rx={3} fill="none" stroke={ACCENT} />
        {bar(18, 30, 28, 3, SOFT)}
    </>
);

const essay = thumb(
    <>
        {bar(12, 7, 50, 4, INK)}
        <rect x={12} y={17} width={72} height={33} rx={3} fill="none" stroke={LINE} />
        {bar(18, 24, 56, 3, SOFT)}
        {bar(18, 31, 60, 3, SOFT)}
        {bar(18, 38, 36, 3, SOFT)}
        <rect x={62} y={42} width={16} height={5} rx={2.5} fill={ACCENT_BG} />
    </>
);

const callout = thumb(
    <>
        <rect x={12} y={14} width={72} height={30} rx={4} fill={ACCENT_BG} stroke={ACCENT} />
        <circle cx={23} cy={29} r={5} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={23} cy={25.5} r={0.9} fill={ACCENT} />
        <line x1={23} y1={28} x2={23} y2={32} stroke={ACCENT} strokeWidth={2} strokeLinecap="round" />
        {bar(34, 24, 42, 3, INK)}
        {bar(34, 33, 34, 3, SOFT)}
    </>
);

// Keyed by slashMenuItems title. Parity with the pickable catalogue is
// guard-tested; a lookup miss renders a card without a preview (never throws).
export const blockThumbnails: Record<string, ReactElement> = {
    'Block math': blockMath,
    'Section break': sectionBreak,
    '2 columns': twoColumns,
    '3 columns': threeColumns,
    'Split into columns': splitIntoColumns,
    'Learning objectives': learningObjectives,
    'Worked example': workedExample,
    'Faded worked example': fadedWorkedExample,
    Image: image,
    'Static graph': staticGraph,
    'Fill in the blank': fillInBlank,
    'Answer blank': answerBlank,
    'Multiple choice': multipleChoice,
    Matching: matching,
    Ordering: ordering,
    'Interactive graph': interactiveGraph,
    'Number line': numberLine,
    'Data plot': dataPlot,
    'Self-explanation': selfExplanation,
    'Short answer': shortAnswer,
    Essay: essay,
    Callout: callout,
};

// The first-run "Start here" starter cards (StartHere.tsx). "A question" and
// "Two-column layout" reuse the picker thumbnails; "Title + instructions" is
// starter-only (heading + paragraph isn't a pickable block).
export const startHereThumbnails = {
    titleInstructions,
    question: fillInBlank,
    twoColumns,
} as const;
