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
//  3. DEFINITIONS ARE A DISCLOSURE, NOT A LINK. A definition mark renders as a
//     <button> with aria-expanded, because activating it reveals content in
//     place; a link would promise navigation. Screen readers get the term and
//     its state; the definition body renders inline when open.
// =============================================================================

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  SanitizedFillInBlankInline,
  SanitizedInlineNode,
} from '../sanitize/sanitized-types.js';
import { loadMathRenderer, residentMathRenderer } from './math.js';

/** Fixed nesting order, outermost first — see decision 1. */
const MARK_ORDER = [
  'definition',
  'bold',
  'italic',
  'underline',
  'code',
  'subscript',
  'superscript',
] as const;

type MarkLike = { type: string; [key: string]: unknown };

export interface InlineContentProps {
  nodes: readonly (SanitizedInlineNode | SanitizedFillInBlankInline)[];
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
    out = wrapMark(mark, out);
  }
  return <>{out}</>;
}

function wrapMark(mark: MarkLike, child: ReactNode): ReactNode {
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
      return <DefinitionTerm mark={mark}>{child}</DefinitionTerm>;
    default:
      return child;
  }
}

function DefinitionTerm({
  mark,
  children,
}: {
  mark: MarkLike;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  // A simple definition carries `definition` text; a rich one carries blocks
  // (V5 renders the text form; rich definition blocks land with their own
  // component pass, and the term still discloses).
  const simple = typeof mark.definition === 'string' ? mark.definition : null;

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
          {simple ?? 'Definition'}
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
