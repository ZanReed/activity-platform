// The player arrives with slice 2 (docs/design/video-pause-points.md VP-12).
// Until then a clip shows nothing to anyone, and the stylesheet hides its frame,
// so a file imported early can't leave a gap or a placeholder on a student's page.
export default function Video() {
  return <div className="viewer-video" hidden />;
}
