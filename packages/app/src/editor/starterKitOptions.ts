// StarterKit v3 bundles two marks the activity schema has no place for:
// strikethrough (⌘⇧S) and link (auto-linked or pasted URLs). Left on, a teacher
// sees them while editing and the next save silently drops them
// (serialize.ts's SUPPORTED_SIMPLE_MARKS), which reads as lost work. Every
// editor that configures StarterKit spreads this, so neither mark can be made
// in the first place. `starterKitOptions.test.ts` checks each call site.
//
// If links or strikethrough are ever wanted, they are a schema mark first
// (SIMPLE_MARK_TYPES + the viewer's inline renderer, and URL sanitising for
// links); remove the matching key here only after that ships.
export const UNSAVED_STARTER_KIT_MARKS = {
    link: false,
    strike: false,
} as const;
