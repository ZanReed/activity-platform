/**
 * The OpenAI-compatible inference call. The pilot's named server is vLLM
 * with guided decoding — `response_format: json_schema` (W-6); Ollama rides
 * the same interface ONLY after `worker:check` verifies its structured-output
 * behavior, because the two diverge on exactly this feature.
 *
 * W-4: a response that fails to parse is captured RAW to a local file for
 * prompt debugging — a schema failure you cannot look at is a schema failure
 * you cannot fix — and counted per-rev by the caller.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface InferenceRequest {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  modelId: string;
  inferenceUrl: string;
}

export interface InferenceSuccess {
  ok: true;
  raw: string;
  parsed: unknown;
  tokensIn: number | null;
  tokensOut: number | null;
}

export interface InferenceFailure {
  ok: false;
  reason: 'unreachable' | 'timeout' | 'http_error' | 'bad_json';
  detail: string;
  capturePath?: string;
}

export type InferenceResult = InferenceSuccess | InferenceFailure;

/**
 * How long one model call may take, response and body together (review D7,
 * 2026-11-28). Before this a server that accepted the connection and never
 * answered hung the run for good, with every claimed lease waiting out its
 * own expiry.
 *
 * Why 180 s: a grade draft is a few hundred output tokens under guided
 * decoding. Even a slow local GPU at ~5 tokens/s finishes in about a minute,
 * and a cold model load is part of the first call. Three minutes is past any
 * honest call and still short enough that a stuck server is noticed in the
 * same sitting. Override with `timeoutMs` (worker:check uses the default).
 */
export const INFERENCE_TIMEOUT_MS = 180_000;

export async function callModel(
  req: InferenceRequest,
  failedOutputDir: string,
  timeoutMs: number = INFERENCE_TIMEOUT_MS,
): Promise<InferenceResult> {
  const timedOut = (): InferenceFailure => ({
    ok: false,
    reason: 'timeout',
    detail: `inference server did not answer within ${timeoutMs / 1000} s at ${req.inferenceUrl}`,
  });
  // One signal bounds the response AND the body read.
  const signal = AbortSignal.timeout(timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${req.inferenceUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: req.modelId,
        temperature: 0,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'grade_draft', strict: true, schema: req.schema },
        },
      }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'TimeoutError') return timedOut();
    return {
      ok: false,
      reason: 'unreachable',
      detail: `inference server unreachable at ${req.inferenceUrl}: ${(err as Error).message}`,
    };
  }

  let body: string;
  try {
    body = await res.text();
  } catch (err) {
    if ((err as Error).name === 'TimeoutError') return timedOut();
    return { ok: false, reason: 'unreachable', detail: `inference reply lost: ${(err as Error).message}` };
  }
  if (!res.ok) {
    return { ok: false, reason: 'http_error', detail: `${res.status}: ${body.slice(0, 500)}` };
  }

  try {
    const envelope = JSON.parse(body);
    const content: unknown = envelope?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('no message content');
    const parsed = JSON.parse(content);
    return {
      ok: true,
      raw: content,
      parsed,
      tokensIn: numberOrNull(envelope?.usage?.prompt_tokens),
      tokensOut: numberOrNull(envelope?.usage?.completion_tokens),
    };
  } catch (err) {
    // Capture the raw output for prompt debugging (W-4). MODEL OUTPUT ONLY —
    // never the prompt, which can embed other students' anchor responses
    // (EH-14 scopes this capture deliberately).
    mkdirSync(failedOutputDir, { recursive: true });
    const capturePath = join(failedOutputDir, `bad-output-${Date.now()}.txt`);
    writeFileSync(capturePath, body);
    return {
      ok: false,
      reason: 'bad_json',
      detail: (err as Error).message,
      capturePath,
    };
  }
}

function numberOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
