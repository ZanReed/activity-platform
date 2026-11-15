// StarterKit v3 bundles two marks the activity schema treats specially.
//
// STRIKETHROUGH has no place in the schema: left on, a teacher sees it while
// editing and the next save drops it (serialize.ts SUPPORTED_SIMPLE_MARKS),
// which reads as lost work. So it is off.
//
// LINK has been a schema mark since 2026-11-15 (schema-shortlist.md S7,
// author ruling: https ONLY). It is on, held to the same rule as the schema
// and the viewer's sanitizer: an https address, nothing else. No click opens
// it while editing (a teacher clicks to place the cursor).
//
// Every editor that configures StarterKit spreads this, so each one keeps the
// same rules; `starterKitOptions.test.ts` checks every call site.

/** The one link rule, shared by the editor, the toolbar and serialize. */
export function isHttpsUrl(url: unknown): url is string {
    if (typeof url !== 'string' || url.length > 2000) return false;
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && u.username === '' && u.password === '';
    } catch {
        return false;
    }
}

/**
 * The canonical form a link is STORED in: the URL parser's own spelling
 * (`Https://Example.com` → `https://example.com/`), so the schema, the
 * sanitizer and the viewer — which test the literal `https://` prefix — agree
 * with what the editor accepted. null when it isn't an https link.
 */
export function canonicalHttpsUrl(url: unknown): string | null {
    return isHttpsUrl(url) ? new URL(url).href : null;
}

export const UNSAVED_STARTER_KIT_MARKS = {
    strike: false,
    link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        isAllowedUri: (url: string) => isHttpsUrl(url),
        shouldAutoLink: (url: string) => isHttpsUrl(url),
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    },
} as const;
