// =============================================================================
// math.ts — KaTeX wrapper with graceful error handling
// -----------------------------------------------------------------------------
// Invalid LaTeX must NEVER crash the renderer. Teachers will paste
// half-finished equations; the editor will autosave them; the renderer
// must produce valid HTML for any input. Errors are rendered as a visible
// error indicator so the teacher knows something is wrong.
//
// KaTeX's renderToString accepts a `throwOnError: false` option that returns
// an error span instead of throwing. We use that as the first line of
// defense, then a try/catch as the second.
// =============================================================================

import katex from 'katex';

export interface MathOptions {
  displayMode: boolean;
}

export function renderMath(latex: string, opts: MathOptions): string {
  try {
    return katex.renderToString(latex, {
      displayMode: opts.displayMode,
      throwOnError: false,
      // errorColor: visible to teachers reviewing their published worksheet,
      // not so jarring it ruins the page for students.
      errorColor: '#cc0000',
      // strict mode catches LaTeX that's syntactically valid but semantically
      // suspicious. Warning-level so unusual-but-correct input still renders.
      strict: 'warn',
      // Trust mode: don't allow \href, \htmlClass, etc. Teacher input is
      // trusted to be non-malicious but we still don't want to expose those
      // KaTeX features that could embed arbitrary HTML.
      trust: false,
    });
  } catch (err) {
    // Belt-and-suspenders: if KaTeX still throws somehow, return a visible
    // error rather than propagating. Logged for visibility in dev.
    const message = err instanceof Error ? err.message : 'Math error';
    return (
      '<span class="math-error" style="color:#cc0000">' +
      'Math error: ' +
      message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;') +
      '</span>'
    );
  }
}
