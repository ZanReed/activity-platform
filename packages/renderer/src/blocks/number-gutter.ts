import type { PageLabel } from '@activity/schema';
import { escape } from '../html.js';

// The problem-number gutter, shared by every numbered question renderer so the
// label logic lives once. `label` decides what shows: a sequence number (auto),
// authored text (custom), or nothing (none). `num` is the resolved number for
// the auto case (block.number ?? ctx.problemNumber). Returns '' for none.
//
// Suppression is purely presentational — callers still emit all the gradeable
// markup (block id, choices, blanks, interaction data), so a `none`/`custom`
// block scores and stays reviewable exactly like a numbered one.
export function renderNumberGutter(
  label: PageLabel | undefined,
  num: number,
): string {
  const l = label ?? { kind: 'number' as const };
  if (l.kind === 'none') return '';
  if (l.kind === 'custom') {
    return (
      '<div class="block-problem-number block-problem-number--custom">' +
      escape(l.text) +
      '</div>'
    );
  }
  return '<div class="block-problem-number">' + escape(String(num)) + '.</div>';
}
