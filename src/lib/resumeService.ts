import { getSupabase } from './supabase';
import { ResumeDocument } from '../types/resume';
import {
  buildResumeRowPayload,
  mapResumeRowToDocument,
  type ResumeRow,
} from './domain/resumeRow';

export type SaveResumeResult =
  | { ok: true; version: number; legacy?: boolean }
  | { ok: false; reason: 'conflict'; latest?: ResumeDocument }
  | { ok: false; reason: 'error'; message: string }
  | { ok: false; reason: 'unauthenticated' };

export const fetchUserResumes = async (): Promise<ResumeDocument[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes from Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as ResumeRow[]).map(mapResumeRowToDocument);
  } catch (err) {
    console.error('Failed to fetch resumes:', err);
    return null;
  }
};

export const fetchUserResume = async (id: string): Promise<ResumeDocument | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching resume from Supabase:', error);
      return null;
    }

    return data ? mapResumeRowToDocument(data as ResumeRow) : null;
  } catch (err) {
    console.error('Failed to fetch resume:', err);
    return null;
  }
};

const legacyUpsert = async (
  resume: ResumeDocument,
  userId: string
): Promise<SaveResumeResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  const payload = buildResumeRowPayload(resume, 1, userId);
  delete payload.version;

  let { error } = await supabase.from('resumes').upsert(payload, { onConflict: 'id' });

  if (error && /layout_id/i.test(error.message)) {
    const withoutLayout = { ...payload };
    delete withoutLayout.layout_id;
    ({ error } = await supabase.from('resumes').upsert(withoutLayout, { onConflict: 'id' }));
  }

  if (error) {
    return { ok: false, reason: 'error', message: error.message };
  }

  return { ok: true, version: 0, legacy: true };
};

const insertResume = async (
  resume: ResumeDocument,
  userId: string
): Promise<SaveResumeResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  let payload = buildResumeRowPayload(resume, 1, userId);
  let { data, error } = await supabase
    .from('resumes')
    .insert(payload)
    .select('version')
    .single();

  if (error && /layout_id/i.test(error.message)) {
    const withoutLayout = { ...payload };
    delete withoutLayout.layout_id;
    payload = withoutLayout;
    ({ data, error } = await supabase
      .from('resumes')
      .insert(payload)
      .select('version')
      .single());
  }

  if (error && /version/i.test(error.message)) {
    return legacyUpsert(resume, userId);
  }

  if (error) {
    if (error.code === '23505') {
      const latest = await fetchUserResume(resume.id);
      return { ok: false, reason: 'conflict', latest: latest ?? undefined };
    }
    console.error('Error saving resume to Supabase:', error);
    return { ok: false, reason: 'error', message: error.message };
  }

  return {
    ok: true,
    version: typeof data?.version === 'number' ? data.version : 1,
  };
};

const updateResume = async (
  resume: ResumeDocument,
  expectedVersion: number,
  userId: string
): Promise<SaveResumeResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  let payload = buildResumeRowPayload(resume, expectedVersion + 1);
  let { data, error } = await supabase
    .from('resumes')
    .update(payload)
    .eq('id', resume.id)
    .eq('version', expectedVersion)
    .select('version')
    .maybeSingle();

  if (error && /layout_id/i.test(error.message)) {
    const withoutLayout = { ...payload };
    delete withoutLayout.layout_id;
    payload = withoutLayout;
    ({ data, error } = await supabase
      .from('resumes')
      .update(payload)
      .eq('id', resume.id)
      .eq('version', expectedVersion)
      .select('version')
      .maybeSingle());
  }

  if (error && /version/i.test(error.message)) {
    // The database migration has not been applied yet. Keep the editor usable
    // with a legacy upsert until the user runs the migration.
    return legacyUpsert(resume, userId);
  }

  if (error) {
    console.error('Error updating resume in Supabase:', error);
    return { ok: false, reason: 'error', message: error.message };
  }

  if (!data) {
    const latest = await fetchUserResume(resume.id);
    return { ok: false, reason: 'conflict', latest: latest ?? undefined };
  }

  return {
    ok: true,
    version: typeof data.version === 'number' ? data.version : expectedVersion + 1,
  };
};

/**
 * Saves a resume with optimistic concurrency.
 *
 * - No `expectedVersion`: insert a new resume (version 1).
 * - `expectedVersion > 0`: conditional update guarded by the row version.
 * - `expectedVersion === 0`: legacy upsert (database migration not applied).
 */
export const saveUserResume = async (
  resume: ResumeDocument,
  expectedVersion?: number
): Promise<SaveResumeResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: 'unauthenticated' };

    if (typeof expectedVersion === 'number') {
      if (expectedVersion <= 0) {
        return legacyUpsert(resume, user.id);
      }
      return updateResume(resume, expectedVersion, user.id);
    }

    return insertResume(resume, user.id);
  } catch (err) {
    console.error('Failed to save resume:', err);
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : String(err),
    };
  }
};

export const saveUserResumes = async (resumesToSave: ResumeDocument[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase || resumesToSave.length === 0) return true;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    let payloads: Record<string, unknown>[] = resumesToSave.map((resume) => ({
      ...buildResumeRowPayload(resume, 1, user.id),
      created_at: resume.createdAt || new Date().toISOString(),
      updated_at: resume.updatedAt || new Date().toISOString(),
    }));

    // Guest migration must never overwrite an existing cloud row or reset its
    // version. ignoreDuplicates performs ON CONFLICT DO NOTHING.
    let { error } = await supabase
      .from('resumes')
      .upsert(payloads, { onConflict: 'id', ignoreDuplicates: true });

    if (error && /layout_id/i.test(error.message)) {
      payloads = payloads.map((payload) => {
        const copy = { ...payload };
        delete copy.layout_id;
        return copy;
      });
      ({ error } = await supabase
        .from('resumes')
        .upsert(payloads, { onConflict: 'id', ignoreDuplicates: true }));
    }

    if (error && /version/i.test(error.message)) {
      payloads = payloads.map((payload) => {
        const copy = { ...payload };
        delete copy.version;
        return copy;
      });
      ({ error } = await supabase
        .from('resumes')
        .upsert(payloads, { onConflict: 'id', ignoreDuplicates: true }));
    }

    if (error) {
      console.error('Error batch saving resumes to Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to batch save resumes:', err);
    return false;
  }
};

export const deleteUserResume = async (resumeId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);

    if (error) {
      console.error('Error deleting resume from Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete resume:', err);
    return false;
  }
};
