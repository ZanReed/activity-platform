// =============================================================================
// _shared/cors.ts — CORS helpers for Edge Functions
// -----------------------------------------------------------------------------
// Shared by every Edge Function. Centralized so we change the allowed origin
// in one place when we move from dev (any origin) to prod (specific domain).
//
// In Phase 1, the SPA and the published activities both call Edge Functions
// from a different origin than supabase.co, so CORS is required.
// =============================================================================

const ALLOWED_ORIGINS_ENV = Deno.env.get('ALLOWED_ORIGINS') ?? '*';

/**
 * Headers to include on every Edge Function response (including OPTIONS
 * preflights). When ALLOWED_ORIGINS is '*', any origin is permitted; when
 * it's a comma-separated list, only those exact origins are echoed back.
 */
export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS_ENV.split(',').map((s) => s.trim());
  const allowOrigin =
    ALLOWED_ORIGINS_ENV === '*'
      ? '*'
      : allowed.includes(origin) ? origin : allowed[0] ?? '';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/** Short-circuit OPTIONS preflight requests. */
export function handlePreflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

/** Build a JSON Response with CORS headers attached. */
export function jsonResponse(
  req: Request,
  body: unknown,
  init: ResponseInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

/** Build a JSON error Response with CORS headers attached. */
export function errorResponse(
  req: Request,
  status: number,
  message: string,
  details?: unknown,
): Response {
  return jsonResponse(req, { error: message, ...(details ? { details } : {}) }, { status });
}
