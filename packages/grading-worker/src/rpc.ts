/**
 * The two RPC doors (W-2, migration 0042 §H/§I) plus the registry read. The
 * claim result is TYPED — `status` is always present, never a bare array —
 * and the submit path surfaces the server's named refusals (`lease_expired`,
 * the validation matrix) as distinct outcomes for the W-4 taxonomy.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Anchor, ClaimedBlock, RegistryEntry } from './promptBuilder.ts';
import type { ModelOutput } from './outputSchema.ts';

export interface ClaimItem {
  suggestion_id: string;
  check_id: string;
  block_id: string;
  activity_id: string;
  activity_version_id: string;
  section_id: string;
  attempt_number: number;
  block: ClaimedBlock;
  response_text: string;
  anchors: Anchor[];
}

export interface ClaimResult {
  status: 'ok' | 'quota_paused' | 'provider_off';
  items: ClaimItem[];
  resumes_at?: string;
  dropped?: number;
}

export interface ClaimOptions {
  limit: number;
  leaseMinutes: number;
  promptRev: number;
  schemaRev: number;
  modelId: string;
  study?: boolean;
  studyCheckIds?: string[];
}

export async function claimSuggestions(
  client: SupabaseClient,
  opts: ClaimOptions,
): Promise<ClaimResult> {
  const { data, error } = await client.rpc('claim_grade_suggestions', {
    p_limit: opts.limit,
    p_lease_minutes: opts.leaseMinutes,
    p_prompt_rev: opts.promptRev,
    p_schema_rev: opts.schemaRev,
    p_model_id: opts.modelId,
    p_study: opts.study ?? false,
    p_study_check_ids: opts.studyCheckIds ?? null,
  });
  if (error) throw new Error(`claim failed: ${error.message}`);
  return data as ClaimResult;
}

export type SubmitOutcome =
  | { kind: 'stored' }
  | { kind: 'lease_expired' }
  | { kind: 'validation_reject'; reason: string };

export async function submitSuggestion(
  client: SupabaseClient,
  suggestionId: string,
  output: ModelOutput,
  stamps: { modelId: string; promptRev: number; schemaRev: number },
  tokens: { in: number | null; out: number | null },
): Promise<SubmitOutcome> {
  const { error } = await client.rpc('submit_grade_suggestion', {
    p_suggestion_id: suggestionId,
    p_machine_confidence: output.confidence,
    p_model_id: stamps.modelId,
    p_prompt_rev: stamps.promptRev,
    p_schema_rev: stamps.schemaRev,
    p_criteria: output.criteria,
    p_general_feedback_draft: output.general_feedback_draft ?? null,
    p_misconceptions: output.misconceptions ?? [],
    p_tokens_in: tokens.in,
    p_tokens_out: tokens.out,
  });
  if (!error) return { kind: 'stored' };
  if (error.message.includes('lease_expired')) return { kind: 'lease_expired' };
  return { kind: 'validation_reject', reason: error.message };
}

export async function fetchRegistry(client: SupabaseClient): Promise<RegistryEntry[]> {
  const { data, error } = await client
    .from('misconception_registry')
    .select('id, skill, description');
  if (error) throw new Error(`registry read failed: ${error.message}`);
  return (data ?? []) as RegistryEntry[];
}
