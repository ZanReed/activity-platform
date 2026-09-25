/**
 * The three revision stamps every suggestion row carries (design §3):
 * "a rev that exists only in a running process is not a rev." A bump here is
 * a reviewable diff that forces the E2a snapshot update, and the W-7 golden
 * log keys on the (PROMPT_REV, SCHEMA_REV, model_id) tuple — the worker
 * refuses to run a tuple that has not had its E2b golden run.
 */
export const PROMPT_REV = 1;
export const SCHEMA_REV = 1;

/**
 * The kickoff model choice (D4) — a default, not a commitment: the worker's
 * MODEL_ID config overrides it, and any override must appear in the golden
 * log (or run under --allow-unvalidated, loudly) before the worker will use
 * it. Chosen against then-current local options at pilot kickoff; the D7
 * agreement study is the measurement that decides, not this constant.
 */
export const DEFAULT_MODEL_ID = 'qwen3-32b';
