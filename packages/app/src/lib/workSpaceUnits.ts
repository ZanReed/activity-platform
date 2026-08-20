// =============================================================================
// workSpaceUnits.ts — "3 lines" / "1in" / "2.5cm" → rem
// -----------------------------------------------------------------------------
// `print.workSpace` is STORED in rem, because that is what the print stylesheet
// consumes (`--print-work-space`). rem is a fine storage unit and a poor
// authoring one: a teacher deciding how much room to leave under a problem is
// thinking in lines of handwriting, or in centimetres, or in inches — never in
// root-em multiples.
//
// So the ```meta fence takes any of them and converts here (ruling D6,
// 2026-08-21). The doc leads with LINES because it is the only one of the four
// that is unit-system-neutral: this project's author writes metric and their
// colleagues write imperial, so leading with either would make the catalogue
// mixed no matter which was chosen — while "give them three lines to work" is
// what both of them actually say out loud.
//
// A bare number stays rem, which keeps every fence written before this change
// meaning exactly what it meant, and matches what ⚙ → Print still displays.
//
// ---- The constants, and why they are what they are --------------------------
//
//   1in = 6rem     CSS defines 1in as 96px, and the root font-size is 16px.
//                  Exact, not a taste call.
//   1cm = 2.3622…  96 / 2.54 / 16. Also exact.
//   1 line = 2rem  A JUDGEMENT, unlike the two above. Ruled paper runs about
//                  7.1mm (college) to 8.7mm (wide); 2rem is 8mm, which sits
//                  between them and errs generous — a student who needs one
//                  more millimetre writes smaller, while a student a
//                  millimetre short writes off the box.
//
// rem is ROOT-relative, so none of this shifts with the activity's print
// font-size: `--print-font-size` is applied to the container, and a rem is
// still 16px underneath it. That is the property that lets a physical unit
// convert to rem at all.
// =============================================================================

/** CSS: 1in = 96px, root font-size 16px. */
const REM_PER_INCH = 6;

/** 96px per inch ÷ 2.54 cm per inch ÷ 16px per rem. */
const REM_PER_CM = 96 / 2.54 / 16;

/**
 * One line of handwriting, in rem. 2rem ≈ 8mm, between college-ruled (7.1mm)
 * and wide-ruled (8.7mm). The one constant here that is a choice rather than a
 * definition — if worksheets come back with cramped answers, this is the number
 * to move, and moving it re-scales every `N lines` already authored.
 */
export const REM_PER_LINE = 2;

/** Trim float artifacts (2.5 * 2.3622 → 5.905511811023622). */
function round(n: number): number {
    return Number(n.toFixed(3));
}

/**
 * Parse an authored work-space value into rem, or null when it is not a
 * quantity at all.
 *
 *   '3 lines' | '3line' | '3 lines '  → 6
 *   '1in' | '1 inch' | '1 inches'     → 6
 *   '2.5cm'                           → 5.906
 *   '3rem' | '3'                      → 3
 *
 * Returns null for anything unparseable or negative, so the caller can warn
 * with the author's own text rather than silently storing a wrong number.
 * Zero is VALID and means "no reserved space" — it is the schema default and a
 * legitimate thing to say out loud.
 */
export function parseWorkSpace(raw: string): number | null {
    const text = raw.trim().toLowerCase();
    if (text === '') return null;

    const m = /^(-?\d*\.?\d+)\s*([a-z]*)$/.exec(text);
    if (!m) return null;

    const value = Number(m[1]);
    if (!Number.isFinite(value) || value < 0) return null;

    switch (m[2] ?? '') {
        case '':
        case 'rem':
            return round(value);
        case 'line':
        case 'lines':
            return round(value * REM_PER_LINE);
        case 'in':
        case 'inch':
        case 'inches':
            return round(value * REM_PER_INCH);
        case 'cm':
            return round(value * REM_PER_CM);
        case 'mm':
            return round((value / 10) * REM_PER_CM);
        default:
            return null;
    }
}

/**
 * A rem value described back in lines, for help text and warnings — the
 * direction that lets ⚙ keep storing rem while telling a teacher what it means.
 * Rounded to a half line, which is the finest distinction worth naming.
 */
export function describeWorkSpace(rem: number): string {
    const lines = Math.round((rem / REM_PER_LINE) * 2) / 2;
    if (lines === 0) return 'no space';
    return `about ${lines} line${lines === 1 ? '' : 's'}`;
}
