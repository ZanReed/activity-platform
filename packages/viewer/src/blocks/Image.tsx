// =============================================================================
// blocks/Image.tsx — static content (S3)
// -----------------------------------------------------------------------------
// Two things worth knowing:
//
//  - A CROP is stored as a rect, not baked into the file (the same upload
//    serves every crop). It is applied as an object-position/scale window so
//    the original stays untouched and re-cropping never degrades quality.
//  - An empty `alt` is DELIBERATE and must stay empty: the schema defaults it
//    to '', and alt="" is how you tell a screen reader "decorative, skip me".
//    Substituting filler here would make every decorative image an
//    interruption.
// =============================================================================

import type { ImageBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';

export default function Image({ block }: BlockComponentProps<ImageBlock>) {
  const { crop } = block;
  // Crop rect is fractional (0..1) of the source. Scale the image up by the
  // inverse of the window and offset it so the window lands on the crop.
  const cropStyle = crop
    ? {
        width: `${100 / crop.w}%`,
        marginLeft: `${(-crop.x / crop.w) * 100}%`,
        marginTop: `${(-crop.y / crop.h) * 100}%`,
        // The wrapper clips; this keeps the visible band at the right height.
        aspectRatio: block.srcAspect ? String(block.srcAspect) : undefined,
      }
    : undefined;

  const img = (
    <img
      className="viewer-image__img"
      src={block.src}
      alt={block.alt}
      style={cropStyle}
      loading="lazy"
    />
  );

  return (
    <figure
      className="viewer-image"
      data-block-type="image"
      data-cropped={crop ? 'true' : 'false'}
      {...(block.align ? { 'data-align': block.align } : {})}
    >
      {crop ? (
        <span className="viewer-image__window" style={{ display: 'block', overflow: 'hidden' }}>
          {img}
        </span>
      ) : (
        img
      )}
      {block.caption ? (
        <figcaption className="viewer-image__caption">{block.caption}</figcaption>
      ) : null}
    </figure>
  );
}
