/** Parse a study check-id file: one uuid per line (# comments allowed) or a
 *  JSON array. Duplicates collapse; anything that is not a uuid is refused
 *  loudly — a typo'd id would otherwise just read as "dropped" (EH-2's
 *  ownership drop), which is the wrong diagnosis. */
export function parseCheckIds(text: string): string[] {
  const trimmed = text.trim();
  const ids = trimmed.startsWith('[')
    ? (JSON.parse(trimmed) as string[])
    : trimmed
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '' && !l.startsWith('#'));
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const bad = ids.filter((id) => !uuid.test(id));
  if (bad.length > 0) {
    throw new Error(`not check ids: ${bad.slice(0, 3).join(', ')}${bad.length > 3 ? '…' : ''}`);
  }
  return [...new Set(ids)];
}
