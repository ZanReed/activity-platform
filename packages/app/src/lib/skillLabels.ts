// =============================================================================
// skillLabels.ts — the curriculum's skill names, as mirrored in `skill_label`
// (0068, W-6). Read-only for teachers (one RLS select policy); the importer's
// --skills-registry writes it. Fetched once per page load: it changes only when
// the author runs an import.
// =============================================================================

import { supabase } from './supabase';

export interface SkillLabel {
    id: string;
    label: string;
}

let cached: Promise<SkillLabel[]> | null = null;

export function fetchSkillLabels(): Promise<SkillLabel[]> {
    cached ??= (async () => {
        const { data, error } = await supabase.from('skill_label').select('id, label').order('id');
        if (error) {
            cached = null;
            throw new Error(error.message);
        }
        return (data ?? []) as SkillLabel[];
    })();
    return cached;
}
