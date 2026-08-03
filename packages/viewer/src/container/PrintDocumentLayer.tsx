// =============================================================================
// container/PrintDocumentLayer.tsx — the document-level print surface (S5 T1c)
// -----------------------------------------------------------------------------
// Everything a printed worksheet needs that is NOT a block: the paper size, the
// configured type and spacing, the row of fill-in lines across the top, and the
// teacher's reference material as a static box.
//
// WHY THIS IS IN S5 AT ALL. It looks like teacher-print configuration, and the
// slice plan originally filed it under the S5.5 teacher-print migration. That
// was wrong, and the eng review's outside voice caught it (S5-OV1): every one
// of these already reaches STUDENTS today, because a student pressing Ctrl+P on
// a published page gets the header, the reference box, the configured spacing
// and the right paper size. Shipping the viewer without them would have been a
// silent feature loss at cutover — and structurally invisible, because the
// parity gate's fixture roster is keyed to the block registry and none of these
// is a block. That is also why the gate grew a document fixture class.
//
// The values are schema-validated (numbers, a two-value enum, booleans) and the
// only free text is the teacher's own custom header labels, which React escapes
// as text children.
// =============================================================================

import type { CSSProperties, ReactElement } from 'react';
import type { PrintConfig, PrintHeader } from '@activity/schema';

export interface PrintDocumentLayerProps {
  readonly print: PrintConfig;
}

/**
 * The per-document `@page` rule.
 *
 * A real stylesheet rule rather than a custom property, for the reason the
 * renderer documents in the same place: `@page` cannot reliably read CSS custom
 * properties, so paper size and margin — the two values it needs — have to be
 * emitted as literal declarations. The base stylesheet carries a default
 * `@page` so a document that configures nothing still prints sanely; this
 * overrides it when a teacher has chosen.
 */
export function PrintPageRule({ print }: PrintDocumentLayerProps): ReactElement {
  const size = print.paperSize === 'a4' ? 'A4' : 'letter';
  return (
    <style>{`@page{size:${size};margin:${print.margin}in;}`}</style>
  );
}

/**
 * The `--print-*` custom properties the print stylesheet reads.
 *
 * Inert on screen: nothing outside `@media print` consumes them, so setting
 * them on the worksheet root costs a student nothing until they print.
 * `workSpace` seeds an activity-wide default that a single problem can override
 * with its own value, which is ordinary custom-property inheritance rather than
 * a special case.
 */
export function printVars(print: PrintConfig): CSSProperties {
  return {
    '--print-columns': print.columns,
    '--print-work-space': `${print.workSpace}rem`,
    '--print-font-size': `${print.fontSize}pt`,
    '--print-problem-spacing': `${print.problemSpacing}rem`,
  } as CSSProperties;
}

/**
 * The worksheet's own heading: what it IS, and what course it belongs to.
 *
 * On screen this lives in the top bar, which is app chrome — sticky, beside a
 * Print button, and hidden in print along with the rest of the chrome. On paper
 * a worksheet still has to say what it is: a stack of photocopies with no title
 * is a stack nobody can file, and the course line is how a student with four
 * subjects knows which folder it goes in. The published page has always printed
 * both, so this is parity, not invention.
 *
 * `course · unit` mirrors the renderer's separator exactly, so a teacher who
 * prints from either surface gets the same line.
 */
export function PrintWorksheetHeading({
  title,
  course,
  unit,
  version,
}: {
  readonly title: string;
  readonly course?: string | undefined;
  readonly unit?: string | undefined;
  /** 1-based print version, when a teacher printed more than one arrangement. */
  readonly version?: number | undefined;
}): ReactElement | null {
  const meta = [course, unit].filter((part): part is string => Boolean(part));
  if (!title && meta.length === 0 && version === undefined) return null;
  return (
    <header className="viewer-print-heading">
      <h1 className="viewer-print-heading__title">{title}</h1>
      {meta.length > 0 ? (
        <p className="viewer-print-heading__meta">{meta.join(' · ')}</p>
      ) : null}
      {/* WHICH SHEET IS THIS (S5.5 T9). Printing several arrangements to stop
          copying is only useful if a teacher can tell them apart afterwards —
          a stack of shuffled worksheets with no label cannot be matched to its
          answer key, which makes the feature worse than not having it.
          Lettered, because "Version B" is what a class period already calls it
          (the seed underneath is the number). Not aria-hidden: unlike the
          fill-in rules, this is information rather than furniture. */}
      {version === undefined ? null : (
        <p className="viewer-print-heading__version" data-print-version={version}>
          Version {versionLabel(version)}
        </p>
      )}
    </header>
  );
}

/** 1 → A, 2 → B, … wrapping past 26 (no worksheet has 27 versions). */
export function versionLabel(version: number): string {
  return String.fromCharCode(65 + ((version - 1) % 26));
}

/** The header fields, in the order they print. */
function headerFields(header: PrintHeader): { key: string; label: string }[] {
  const fields: { key: string; label: string }[] = [];
  if (header.name) fields.push({ key: 'name', label: 'Name' });
  if (header.date) fields.push({ key: 'date', label: 'Date' });
  if (header.period) fields.push({ key: 'period', label: 'Period' });
  if (header.class) fields.push({ key: 'class', label: 'Class' });
  if (header.score) fields.push({ key: 'score', label: 'Score' });
  for (const label of header.custom) fields.push({ key: 'custom', label });
  return fields;
}

/**
 * The print-only header: a wrapping row of labeled fill-in lines.
 *
 * Returns null when no field is enabled, so an empty ruled box never prints —
 * the same rule the renderer follows. aria-hidden because these are blank lines
 * for a pen: there is nothing here for a screen reader, and the student's name
 * is not something the screen surface asks for.
 */
export function PrintHeaderRow({ header }: { header: PrintHeader }): ReactElement | null {
  const fields = headerFields(header);
  if (fields.length === 0) return null;

  return (
    <div className="viewer-print-header" aria-hidden="true">
      {fields.map((field, index) => (
        <span
          key={`${field.key}-${index}`}
          className={`viewer-print-header__field viewer-print-header__field--${field.key}`}
        >
          <span className="viewer-print-header__label">{field.label}:</span>
          <span className="viewer-print-header__line" />
        </span>
      ))}
    </div>
  );
}
