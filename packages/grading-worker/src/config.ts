/**
 * Worker configuration: environment first, an optional `.env` beside the
 * package second (parsed here — no dotenv dependency), defaults last. Every
 * value is printed by `worker:check`, so a misconfigured worker is a
 * diagnosable worker (W-4's problem+cause+fix rule applies to setup too).
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_MODEL_ID } from './constants.ts';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Minimal KEY=VALUE parser for the package-local .env. */
export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return out;
}

function loadDotEnv(): Record<string, string> {
  const path = join(PKG_ROOT, '.env');
  if (!existsSync(path)) return {};
  return parseEnvFile(readFileSync(path, 'utf8'));
}

export interface WorkerConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  inferenceUrl: string;
  modelId: string;
  batchSize: number;
  leaseMinutes: number;
  pollSeconds: number;
  sessionPath: string;
  failedOutputDir: string;
  goldenLogPath: string;
  pkgRoot: string;
}

export function loadConfig(): WorkerConfig {
  const dotenv = loadDotEnv();
  const get = (key: string) => process.env[key] ?? dotenv[key];
  const supabaseUrl = get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = get('SUPABASE_ANON_KEY') ?? '';
  if (supabaseUrl === '' || supabaseAnonKey === '') {
    throw new Error(
      'Missing SUPABASE_URL / SUPABASE_ANON_KEY.\n' +
        '  Fix: copy .env.example to .env in packages/grading-worker and fill both\n' +
        '  (the anon/publishable key — the worker signs in as the teacher, never\n' +
        '  with a service key, D3).',
    );
  }
  return {
    supabaseUrl,
    supabaseAnonKey,
    inferenceUrl: get('INFERENCE_URL') ?? 'http://127.0.0.1:8000/v1',
    modelId: get('MODEL_ID') ?? DEFAULT_MODEL_ID,
    batchSize: clampInt(get('BATCH_SIZE'), 4, 1, 20),
    leaseMinutes: clampInt(get('LEASE_MINUTES'), 15, 1, 60),
    pollSeconds: clampInt(get('POLL_SECONDS'), 30, 5, 3600),
    sessionPath:
      get('SESSION_PATH') ?? join(homedir(), '.config', 'activity-grading-worker', 'session.json'),
    failedOutputDir: join(PKG_ROOT, 'var', 'failed-outputs'),
    goldenLogPath: join(PKG_ROOT, 'golden-log.json'),
    pkgRoot: PKG_ROOT,
  };
}

function clampInt(raw: string | undefined, dflt: number, min: number, max: number): number {
  const n = raw === undefined ? dflt : Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(Math.max(n, min), max);
}
