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
  reason: 'unreachable' | 'http_error' | 'bad_json';
  detail: string;
  capturePath?: string;
}

export type InferenceResult = InferenceSuccess | InferenceFailure;

export async function callModel(
  req: InferenceRequest,
  failedOutputDir: string,
): Promise<InferenceResult> {
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
    });
  } catch (err) {
    return {
      ok: false,
      reason: 'unreachable',
      detail: `inference server unreachable at ${req.inferenceUrl}: ${(err as Error).message}`,
    };
  }

  const body = await res.text();
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
