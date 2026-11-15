import { createContext } from 'react';

// ============================================================================
// ImageUploadContext — lets a NodeView upload a picture (2026-11-15).
// ----------------------------------------------------------------------------
// The figure slots under answer choices and matching items used to take a URL
// only; uploading needs the activity id (lib/uploadImage.ts keys the file by
// it), which NodeViews do not have. Editor.tsx provides an uploader that
// returns the public URL; it reaches the NodeViews through EditorContent's
// React portals, like FieldFocusContext. null = no upload here (the
// playground, or an activity not saved yet): the URL field is the only way.
// ============================================================================

export type ImageUploader = (file: File) => Promise<string>;

export const ImageUploadContext = createContext<ImageUploader | null>(null);
