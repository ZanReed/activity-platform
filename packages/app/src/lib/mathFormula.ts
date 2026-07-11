import { convertAsciiMathToLatex } from 'mathlive';

// ============================================================================
// mathFormula — the seam between canonical formula ASCII and a MathLive field.
// ----------------------------------------------------------------------------
// Teacher-side answer input renders as real math (a <math-field>) while attrs
// keep storing the canonical ASCII the parsers read (formatModel & co.). Two
// directions:
//
//   seed:   canonical ASCII → LaTeX          (formulaToLatex)
//   commit: field.getValue('ascii-math') → parser-ready ASCII
//                                             (mathFieldAsciiToFormula)
//
// The commit direction is the calculator's proven path — normalizeAsciiMath
// (inside compileFunction) reassembles MathLive's spaced-letter names and
// extractDomain tolerates `f o r`, so the parsers need no changes.
// ============================================================================

// A domain clause converted wholesale reads as the product x·f·o·r·x and
// DISPLAYS run together ("2xforx≥0"), so split it out and join with an upright
// \mathrm{for}. MathLive serializes \mathrm{for} back to the spaced `f o r`
// that extractDomain accepts, so the round trip holds.
export function formulaToLatex(ascii: string): string {
    const m = /^(.*?)\s+for\s+(.+)$/i.exec(ascii);
    if (m) {
        return (
            convertAsciiMathToLatex(m[1] ?? '') +
            '\\;\\mathrm{for}\\;' +
            convertAsciiMathToLatex(m[2] ?? '')
        );
    }
    return convertAsciiMathToLatex(ascii);
}

// \text{…} groups serialize as quoted strings ("for") — quotes never occur in
// valid formula syntax, so blanking them is safe and keeps the domain-clause
// regex matching whatever MathLive emits.
export function mathFieldAsciiToFormula(ascii: string): string {
    return ascii.replace(/"/g, ' ').trim();
}

// ---- Input-mode preference ----------------------------------------------------
// math ⇄ text toggle state, remembered globally per field group ("the author
// flipped function answers to text" survives across blocks and sessions).

export type FormulaInputMode = 'math' | 'text';

const MODE_PREFIX = 'graph-input-mode:';

export function loadInputMode(key: string, fallback: FormulaInputMode): FormulaInputMode {
    try {
        const stored = window.localStorage.getItem(MODE_PREFIX + key);
        return stored === 'math' || stored === 'text' ? stored : fallback;
    } catch {
        return fallback;
    }
}

export function saveInputMode(key: string, mode: FormulaInputMode): void {
    try {
        window.localStorage.setItem(MODE_PREFIX + key, mode);
    } catch {
        // Private-mode storage failures just lose the preference.
    }
}
