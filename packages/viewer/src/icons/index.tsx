// =============================================================================
// icons/index.tsx — the viewer's inline-SVG glyph set (ruling 4.1A)
// -----------------------------------------------------------------------------
// ONE icon set, drawn inline, never emoji. The published page uses emoji for
// its callout markers (ℹ️ ⚠️ ✅ 📝) and that is precisely what 4.1A ruled
// against for the viewer, for three reasons that all land on paper:
//
//  1. An emoji is whatever the reading device decides it is — a different
//     drawing on Windows, macOS, Android and a school Chromebook, and a tofu
//     box where the font is missing.
//  2. Emoji are COLOUR glyphs. A worksheet is photocopied and printed in
//     grayscale, where a colour emoji becomes a grey smudge; these draw in
//     currentColor, so they print as ink.
//  3. They cannot be sized or aligned with the text they label.
//
// Every glyph is a 16-unit square, stroke-based, inheriting colour and scaling
// with font-size — so a callout icon is the same weight as the sentence beside
// it, in light mode, dark mode, and print.
//
// aria-hidden throughout: each of these sits beside text that already carries
// the meaning. An icon announcing "warning" before a sentence that says what to
// watch out for is noise, not information.
// =============================================================================

import type { ReactElement } from 'react';
import type { CalloutVariant } from '@activity/schema';

interface GlyphProps {
  readonly className?: string | undefined;
}

function Svg({
  children,
  className,
}: GlyphProps & { children: React.ReactNode }): ReactElement {
  return (
    <svg
      className={className ?? 'viewer-icon'}
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Information: a circled lower-case i. */
export function InfoIcon(props: GlyphProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4" />
      <path d="M8 4.75h.01" />
    </Svg>
  );
}

/** Warning: the triangle, which reads as caution even with no colour at all. */
export function WarningIcon(props: GlyphProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M8 2.25 14.5 13.5h-13z" />
      <path d="M8 6.75v3" />
      <path d="M8 11.75h.01" />
    </Svg>
  );
}

/** Success: a circled check. */
export function SuccessIcon(props: GlyphProps): ReactElement {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="m5.25 8.25 2 2 3.5-4" />
    </Svg>
  );
}

/** Note: a sheet with written lines. */
export function NoteIcon(props: GlyphProps): ReactElement {
  return (
    <Svg {...props}>
      <path d="M4 1.75h5l3.25 3.25v9.25H4z" />
      <path d="M9 1.75V5h3.25" />
      <path d="M6 8.5h4M6 11h3" />
    </Svg>
  );
}

const CALLOUT_ICONS: Record<CalloutVariant, (p: GlyphProps) => ReactElement> = {
  info: InfoIcon,
  warning: WarningIcon,
  success: SuccessIcon,
  note: NoteIcon,
};

/**
 * The marker for a callout variant.
 *
 * Paired with the border STYLE the print layer encodes, this is the
 * belt-and-braces the published page already had: two independent channels
 * (shape and border) that both survive a photocopier, so the four variants stay
 * distinguishable when the colour is gone.
 */
export function CalloutIcon({
  variant,
  className,
}: {
  readonly variant: CalloutVariant;
  readonly className?: string | undefined;
}): ReactElement {
  const Glyph = CALLOUT_ICONS[variant];
  return <Glyph {...(className === undefined ? {} : { className })} />;
}
