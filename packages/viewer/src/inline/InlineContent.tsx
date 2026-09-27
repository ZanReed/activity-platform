// =============================================================================
// inline/InlineContent.tsx — the inline content renderer (S3 V5)
// -----------------------------------------------------------------------------
// EVERY block inherits this: text with marks, inline math, hard breaks, and
// vocabulary definitions. It looked like the trivial half of the exemplar pair
// and is in fact the cost center the S3 DX review flagged — get it wrong once
// and ~25 components inherit the mistake.
//
// Three decisions worth knowing:
//
//  1. MARKS NEST OUTSIDE-IN, in a FIXED order. The schema stores marks as an
//     unordered array, but `<strong><em>x</em></strong>` and
//     `<em><strong>x</strong></em>` are different DOM for identical content —
//     which would make print snapshots and DOM assertions flaky depending on
//     authoring order. MARK_ORDER pins it.
//
//  2. MATH RENDERS ASYNC-THEN-SYNC. The first math node on a page triggers the
//     lazy KaTeX chunk (D14) and shows the raw LaTeX meanwhile — a real
//     fallback a student can read, not a spinner or a blank. Once resident,
//     every later equation renders on first paint. The rendered HTML goes
//     through dangerouslySetInnerHTML because that is what KaTeX emits;
//     `trust: false` + throwOnError:false in math.ts is what makes that safe,
//     and the content is teacher-authored and server-sanitized besides.
//
//  3. A DEFINED TERM IS A BUTTON THAT OPENS THE GLOSSARY, NOT A LINK. Ruled
//     2026-09-27 (docs/design/glossary.md D6, amending the original "disclosure
//     in place" ruling): activation opens the glossary dialog focused on that
//     term, so the term carries aria-haspopup="dialog" and aria-expanded bound
//     to the dialog being open for IT. It stays a <button> — a link would
//     promise page navigation, and none happens. Where no glossary host exists
//     (print mode, a component rendered alone) the term keeps the old in-place
//     disclosure, so nothing outside a screen worksheet changes. Print hides
//     both and has its own appendix. A `glossary_link` mark — added at render by
//     the glossary's linkify, never stored — is a cross-link inside a
//     definition body and pushes its target onto the dialog's stack.
// =============================================================================

import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { GLOSSARY_LINK_MARK } from '@activity/schema';
import { useGlossaryNav, useGlossaryOpen } from '../glossary/context.js';
import { loadMathRenderer, residentMathRenderer } from './math.js';

// Rich definitions (paragraphs, display math, lists, figures) render through
// the paper glossary's block renderer. Lazy, because it pulls GraphFigure and
// only a student who OPENS a rich definition needs it.
const DefinitionBlocks = lazy(() =>
  import('../print/DefinitionGlossary.js').then((m) => ({
    default: m.DefinitionBlocks,
  })),
);

/** Fixed nesting order, outermost first — see decision 1. */
const MARK_ORDER = [
  'definition',
  GLOSSARY_LINK_MARK,
  'bold',
  'italic',
  'underline',
  'code',
  'subscript',
  'superscript',
] as const;

type MarkLike = { type: string; [key: string]: unknown };

/**
 * What this renderer accepts: anything tagged with a `type`. Deliberately
 * structural rather than the SanitizedInlineNode union — the sanitized
 * projection produces slightly different node types per BLOCK (a
 * fill_in_blank's content admits blank tokens, a paragraph's does not, and
 * DeepSanitizeInline rewrites math nodes in place), and every one of them is
 * dispatched here the same way: at runtime, on `type`. Naming one union would
 * force a cast at nearly every call site, which is worse than saying plainly
 * that this function switches on a tag.
 */
export interface RenderableInlineNode {
  readonly type?: string;
  readonly [key: string]: unknown;
}

export interface InlineContentProps {
  nodes: readonly RenderableInlineNode[];
  /** Renders a blank token — supplied by fill_in_blank; static blocks omit it
   * and any stray blank renders as its bare underline placeholder. */
  renderBlank?: (blank: { id: string; width?: number }) => ReactNode;
}

export function InlineContent({ nodes, renderBlank }: InlineContentProps) {
  return (
    <>
      {nodes.map((node, i) => (
        <InlineNode
          key={i}
          node={node as Record<string, unknown>}
          renderBlank={renderBlank}
        />
      ))}
    </>
  );
}

function InlineNode({
  node,
  renderBlank,
}: {
  node: Record<string, unknown>;
  renderBlank?: InlineContentProps['renderBlank'];
}) {
  switch (node.type) {
    case 'hard_break':
      return <br />;
    case 'math_inline':
      return <InlineMath latex={String(node.latex ?? '')} />;
    case 'blank': {
      const blank = { id: String(node.id), ...(typeof node.width === 'number' ? { width: node.width } : {}) };
      return (
        <>{renderBlank ? renderBlank(blank) : <span className="viewer-blank-placeholder" data-blank-id={blank.id} />}</>
      );
    }
    case 'text':
    default:
      return (
        <MarkedText
          text={String(node.text ?? '')}
          marks={(node.marks as MarkLike[] | undefined) ?? []}
        />
      );
  }
}

function MarkedText({ text, marks }: { text: string; marks: MarkLike[] }) {
  const ordered = [...marks].sort(
    (a, b) =>
      MARK_ORDER.indexOf(a.type as (typeof MARK_ORDER)[number]) -
      MARK_ORDER.indexOf(b.type as (typeof MARK_ORDER)[number]),
  );
  // Build inside-out so the first entry in MARK_ORDER ends up outermost.
  let out: ReactNode = text;
  for (const mark of [...ordered].reverse()) {
    out = wrapMark(mark, out, text);
  }
  return <>{out}</>;
}

function wrapMark(mark: MarkLike, child: ReactNode, text: string): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong>{child}</strong>;
    case 'italic':
      return <em>{child}</em>;
    case 'underline':
      return <u>{child}</u>;
    case 'code':
      return <code>{child}</code>;
    case 'subscript':
      return <sub>{child}</sub>;
    case 'superscript':
      return <sup>{child}</sup>;
    case 'definition':
      return (
        <DefinitionTerm mark={mark} text={text}>
          {child}
        </DefinitionTerm>
      );
    case GLOSSARY_LINK_MARK:
      return typeof mark.target === 'string' ? (
        <GlossaryLink target={mark.target}>{child}</GlossaryLink>
      ) : (
        child
      );
    default:
      return child;
  }
}

/** A cross-link inside a definition body (D3 as amended by UC1). Outside the
 * glossary dialog there is nowhere to navigate, so it is plain text. */
function GlossaryLink({ target, children }: { target: string; children: ReactNode }) {
  const nav = useGlossaryNav();
  if (!nav) return <>{children}</>;
  return (
    <button type="button" className="glossary-link" onClick={() => nav.go(target)}>
      {children}
    </button>
  );
}

function DefinitionTerm({
  mark,
  text,
  children,
}: {
  mark: MarkLike;
  text: string;
  children: ReactNode;
}) {
  const glossary = useGlossaryOpen();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  // A simple definition carries `definition` text; a rich one carries
  // `content` blocks. Every catalogue import is rich (the definitions fence
  // admits math and formatting), so the rich path is the common one — it
  // showed the bare word "Definition" until 2026-09-26.
  const simple = typeof mark.definition === 'string' ? mark.definition : null;
  const rich =
    simple === null && Array.isArray(mark.content) && mark.content.length > 0
      ? (mark.content as never[])
      : null;
  const glossaryKey =
    typeof mark.glossaryKey === 'string' && mark.glossaryKey ? mark.glossaryKey : undefined;

  if (glossary) {
    // D6: the glossary dialog, focused on this term. A keyed mark stays a
    // button even with an empty baked body (EN-5) — the live store row, or the
    // dialog's own fallback line, has something to say about it.
    return (
      <span className="viewer-definition">
        <button
          ref={buttonRef}
          type="button"
          className="viewer-definition__term"
          aria-haspopup="dialog"
          aria-expanded={
            glossary.activeOpener !== null && glossary.activeOpener === buttonRef.current
          }
          onClick={(event) =>
            glossary.open({ glossaryKey, text, opener: event.currentTarget })
          }
        >
          {children}
        </button>
      </span>
    );
  }

  return (
    <span className="viewer-definition">
      <button
        type="button"
        className="viewer-definition__term"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>
      {open ? (
        <span className="viewer-definition__body" id={panelId} role="note">
          {simple ??
            (rich ? (
              <Suspense fallback={children}>
                <DefinitionBlocks blocks={rich} />
              </Suspense>
            ) : (
              'Definition'
            ))}
        </span>
      ) : null}
    </span>
  );
}

export function InlineMath({ latex }: { latex: string }) {
  const [html, setHtml] = useState<string | null>(() => {
    const resident = residentMathRenderer();
    return resident ? resident(latex, false) : null;
  });

  useEffect(() => {
    if (html !== null) return;
    let cancelled = false;
    void loadMathRenderer().then((render) => {
      if (!cancelled) setHtml(render(latex, false));
    });
    return () => {
      cancelled = true;
    };
  }, [html, latex]);

  if (html === null) {
    // Readable fallback while the chunk loads — the student sees the equation
    // in source form rather than a gap.
    return (
      <span className="viewer-math viewer-math--loading" data-math-pending="true">
        {latex}
      </span>
    );
  }
  return (
    <span
      className="viewer-math"
      data-math="inline"
      // KaTeX output; safe per math.ts (trust:false, throwOnError:false).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
