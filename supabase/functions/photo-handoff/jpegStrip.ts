// =============================================================================
// photo-handoff/jpegStrip.ts — drop every metadata segment from a JPEG
// -----------------------------------------------------------------------------
// The phone re-encodes on a canvas before it sends (the same reencodePhoto as
// the Chromebook), and a canvas writes pixels only. This is the SERVER'S copy
// of that guarantee, because this path has no sign-in: anything that can POST
// can send bytes, and a photo with its GPS position must never be stored.
//
// It walks the WHOLE file, not only the header (Fable review 2026-11-18):
//   * every marker segment is parsed, in the header AND between scans (a
//     progressive JPEG may carry APPn/COM after its first scan);
//   * APP1–APP15 and COM are dropped wherever they are;
//   * APP0 is kept only as a plain 16-byte JFIF header (a JFXX thumbnail or any
//     other payload in it is dropped);
//   * entropy-coded data is copied, with its stuffed bytes (FF00) and restart
//     markers (FFD0–FFD7);
//   * output STOPS at EOI: a trailer (an appended motion-photo video, say) is
//     never stored;
//   * a file with no frame header (SOF) or no scan is refused — it is not an
//     image, whatever its first two bytes say.
// Anything malformed returns null and the caller refuses it.
//
// Pure (no Deno, no Node), so scripts/tests/photo-handoff.test.mjs runs it
// directly under Node's type stripping.
// =============================================================================

const SOS = 0xda;
const EOI = 0xd9;

function isSof(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function isPlainJfif(bytes: Uint8Array, start: number, length: number): boolean {
  // FFE0, length 16, "JFIF\0", version, units, densities, 0×0 thumbnail.
  return (
    length === 16 &&
    bytes[start + 4] === 0x4a && bytes[start + 5] === 0x46 && bytes[start + 6] === 0x49 &&
    bytes[start + 7] === 0x46 && bytes[start + 8] === 0x00 &&
    bytes[start + 16] === 0 && bytes[start + 17] === 0
  );
}

export function stripJpegMetadata(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const keep: Uint8Array[] = [bytes.subarray(0, 2)];
  let sawFrame = false;
  let sawScan = false;
  let i = 2;
  let inScan = false;

  while (i < bytes.length) {
    if (inScan) {
      // Entropy-coded data: copy up to the next real marker.
      const from = i;
      while (i < bytes.length) {
        if (bytes[i] === 0xff && i + 1 < bytes.length) {
          const next = bytes[i + 1]!;
          if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
            i += 2;
            continue;
          }
          if (next === 0xff) {
            i += 1; // fill byte before a marker
            continue;
          }
          break; // a marker: the scan's data ends here
        }
        i += 1;
      }
      keep.push(bytes.subarray(from, i));
      inScan = false;
      if (i >= bytes.length) return null; // no EOI
      continue;
    }

    if (bytes[i] !== 0xff) return null;
    let m = i + 1;
    while (m < bytes.length && bytes[m] === 0xff) m++;
    if (m >= bytes.length) return null;
    const marker = bytes[m]!;
    const start = m - 1;

    if (marker === EOI) {
      if (!sawFrame || !sawScan) return null;
      keep.push(bytes.subarray(start, m + 1));
      return concat(keep); // anything after EOI is dropped
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      keep.push(bytes.subarray(start, m + 1));
      i = m + 1;
      continue;
    }
    if (m + 2 >= bytes.length) return null;
    const length = (bytes[m + 1]! << 8) | bytes[m + 2]!;
    if (length < 2) return null;
    const end = m + 1 + length;
    if (end > bytes.length) return null;

    if (isSof(marker)) sawFrame = true;
    const dropped =
      (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe || (marker === 0xe0 && !isPlainJfif(bytes, start, length));
    if (!dropped) keep.push(bytes.subarray(start, end));
    i = end;
    if (marker === SOS) {
      if (!sawFrame) return null;
      sawScan = true;
      inScan = true;
    }
  }
  return null; // no EOI
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
