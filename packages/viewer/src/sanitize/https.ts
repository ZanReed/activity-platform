// The one link rule a student surface applies (schema-shortlist.md S7):
// used by the sanitizer AND the renderer. Its own module so the renderer,
// which rides the student shell, does not pull the sanitizer with it.

/** The only links a student is served: https, parseable, no credentials. */
export function isHttpsHref(href: unknown): href is string {
  if (typeof href !== 'string' || href.length > 2000) return false;
  try {
    const u = new URL(href);
    return u.protocol === 'https:' && u.username === '' && u.password === '';
  } catch {
    return false;
  }
}

