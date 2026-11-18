// The phone page's slice of the photo block (media submissions slice 2c,
// §4.1), behind its own package subpath (`@activity/viewer/photo-handoff`) so
// the app's lazy /h route takes the re-encode and its copy without reaching
// through the viewer barrel. The phone re-encodes exactly as the Chromebook
// does: the canvas strips EXIF before a byte leaves the phone (and the
// photo-handoff function strips any that a modified page sends anyway).
export { PhotoError, photoErrorText, reencodePhoto } from './photoUpload.js';
export { PHOTO_HANDOFF_PATH } from './photoLinkSeam.js';
