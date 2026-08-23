// =============================================================================
// print/DefinitionGlossary.tsx — the paper surface for inline definitions (S5)
// -----------------------------------------------------------------------------
// An appendix at the END of the worksheet, one entry per defined term, gated by
// meta.print.printDefinitionGlossary (off by default — most worksheets do not
// want two extra pages, and the teacher who does can say so).
//
// It exists because the screen and paper surfaces for a definition are
// different objects, not two renderings of one: on screen it is a disclosure
// the student opens over the word; on paper there is no opening, so the content
// has to live somewhere else or vanish. Vanishing was acceptable when a
// definition was a short gloss and stopped being acceptable when one could
// carry a display equation, a list, and a figure.
//
// The content alphabet is the DefinitionBlock union — the reference panel's
// vocabulary minus columns and callouts. Seven variants, rendered here rather
// than through the block registry, because these are not registry blocks: they
// are a constrained subset with their own schema, and routing them through the
// component registry would mean teaching every block component about a shape it
// will never otherwise see.
// =============================================================================

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { DefinitionBlock, GraphFigureBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { loadMathRenderer, residentMathRenderer } from '../inline/math.js';
import GraphFigure from '../blocks/GraphFigure.js';
import type { GlossaryEntry } from './definitions.js';

/** Display math inside an entry. Same lazy-KaTeX seam every other math surface
 * uses (D14), with the resident renderer taken synchronously when one is
 * already loaded so a printed page does not depend on an effect having run. */
function GlossaryMath({ latex }: { latex: string }): ReactElement {
  const [html, setHtml] = useState<string | null>(() => {
    const resident = residentMathRenderer();
    return resident ? resident(latex, true) : null;
  });

  useEffect(() => {
    if (html !== null) return;
    let cancelled = false;
    void loadMathRenderer().then((render) => {
      if (!cancelled) setHtml(render(latex, true));
    });
    return () => {
      cancelled = true;
    };
  }, [html, latex]);

  // The readable fallback is the LaTeX itself, exactly as elsewhere: a student
  // who prints before the chunk resolves gets source they can still read,
  // rather than a blank space where an equation should be.
  return html === null ? (
    <span className="viewer-glossary__math-fallback">{latex}</span>
  ) : (
    <span
      className="viewer-glossary__math"
      // KaTeX output; safe per math.ts (trust:false, throwOnError:false).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** One list, possibly nested. Lists are the only recursive shape in the
 * definition alphabet. */
function GlossaryList({
  block,
}: {
  block: Extract<DefinitionBlock, { type: 'bullet_list' | 'ordered_list' }>;
}): ReactElement {
  const Tag = block.type === 'ordered_list' ? 'ol' : 'ul';
  return (
    <Tag
      className={`viewer-glossary__list viewer-glossary__list--${
        block.type === 'ordered_list' ? 'ordered' : 'bullet'
      }`}
    >
      {block.items.map((item, index) => (
        <li key={item.id ?? index} className="viewer-glossary__list-item">
          <InlineContent nodes={item.content as never} />
          {item.children?.map((child, childIndex) => (
            <GlossaryList key={child.id ?? childIndex} block={child as never} />
          ))}
        </li>
      ))}
    </Tag>
  );
}

/** One block of a definition's content. */
function GlossaryBlock({ block }: { block: DefinitionBlock }): ReactElement | null {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="viewer-glossary__paragraph">
          <InlineContent nodes={block.content as never} />
        </p>
      );

    case 'heading': {
      // Headings inside an entry are SUB-headings of a glossary item, so they
      // render at a fixed small size rather than at their authored level: an
      // h1 inside an appendix entry would outrank the appendix's own title.
      return (
        <p className="viewer-glossary__heading" data-level={block.level}>
          <InlineContent nodes={block.content as never} />
        </p>
      );
    }

    case 'math_block':
      return <GlossaryMath latex={block.latex} />;

    case 'image':
      return (
        <img
          className="viewer-glossary__image"
          src={block.src}
          alt={block.alt}
          loading="lazy"
        />
      );

    case 'bullet_list':
    case 'ordered_list':
      return <GlossaryList block={block} />;

    case 'graph_figure':
      // The kit-free static figure — the reason graph_figure exists apart from
      // a display graph, and what makes it printable at all.
      // `mode` is REQUIRED by BlockComponentProps, and this call site is the
      // glossary, which only ever renders on paper — so it says so, rather
      // than passing a value it inherited. GraphFigure itself ignores `mode`
      // (it renders identical markup on both surfaces; the print differences
      // are CSS), but the prop is part of the shared component contract and
      // dropping it is a type error, not a cleanup.
      return <GraphFigure block={block as GraphFigureBlock as never} mode="print" />;

    default:
      return null;
  }
}

export interface DefinitionGlossaryProps {
  readonly entries: readonly GlossaryEntry[];
}

/**
 * The appendix. Renders nothing when there is nothing to define, so a document
 * with the setting on but no definitions does not print an empty "Glossary"
 * heading — the same rule the header follows.
 *
 * Marked scaffold: teacher-provided support material, never scored, outside
 * every section, so no check path walks it.
 */
export function DefinitionGlossary({
  entries,
}: DefinitionGlossaryProps): ReactElement | null {
  if (entries.length === 0) return null;

  return (
    <aside className="viewer-glossary" data-block-category="scaffold">
      <h2 className="viewer-glossary__title">Glossary</h2>
      <dl className="viewer-glossary__list-root">
        {entries.map((entry) => (
          <div key={entry.term.toLowerCase()} className="viewer-glossary__entry">
            <dt className="viewer-glossary__term">{entry.term}</dt>
            <dd className="viewer-glossary__body">
              {entry.content.map((block, index) => (
                <GlossaryBlock key={block.id ?? index} block={block} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
