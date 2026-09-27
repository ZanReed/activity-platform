// =============================================================================
// glossary/context.tsx — how a term and a cross-link reach the glossary
// -----------------------------------------------------------------------------
// Two contexts, because they live at two different depths:
//
//   GlossaryOpenContext — provided by the container's GlossaryHost. A defined
//     term on the worksheet asks it to open the dialog on itself (D1/D6). When
//     NO host is present (print mode, a component rendered alone in a test),
//     the term keeps the old in-place disclosure — so nothing that renders an
//     InlineContent outside a screen worksheet changes behaviour.
//
//   GlossaryNavContext — provided INSIDE the dialog. A cross-link in a
//     definition body pushes its target onto the dialog's one navigation stack
//     (GD-2). Outside the dialog a `glossary_link` mark renders as plain text.
// =============================================================================

import { createContext, useContext } from 'react';

export interface GlossaryOpenRequest {
  /** Set for a keyed (course-glossary) mark. */
  readonly glossaryKey?: string | undefined;
  /** The term's text as the student sees it. */
  readonly text: string;
  /** The element focus returns to on close (GD-7). */
  readonly opener: HTMLElement;
}

export interface GlossaryOpenContextValue {
  open(request: GlossaryOpenRequest): void;
  /** The opener of the dialog currently open, if any (aria-expanded). */
  readonly activeOpener: HTMLElement | null;
}

export const GlossaryOpenContext = createContext<GlossaryOpenContextValue | null>(null);

export function useGlossaryOpen(): GlossaryOpenContextValue | null {
  return useContext(GlossaryOpenContext);
}

export interface GlossaryNavContextValue {
  go(targetId: string): void;
}

export const GlossaryNavContext = createContext<GlossaryNavContextValue | null>(null);

export function useGlossaryNav(): GlossaryNavContextValue | null {
  return useContext(GlossaryNavContext);
}
