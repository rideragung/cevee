import { getSupabase } from './supabase';
import { JobApplication } from '../types/job';
import {
  buildJobRowPayload,
  mapJobRowToDocument,
  type JobRow,
} from './domain/jobRow';

export type SaveJobResult =
  | { ok: true; version: number }
  | { ok: false; reason: 'conflict'; latest?: JobApplication }
  | { ok: false; reason: 'missing_table'; message: string }
  | { ok: false; reason: 'error'; message: string }
  | { ok: false; reason: 'unauthenticated' };

const isMissingTableError = (message?: string, code?: string): boolean => {
  if (code === '42P01' || code === 'PGRST205') return true;
  if (!message) return false;
  return /job_applications/i.test(message) && /(does not exist|schema cache|not find)/i.test(message);
};

export const fetchUserJobs = async (): Promise<JobApplication[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error.message, error.code)) {
        return [];
      }
      console.error('Error fetching job applications from Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as JobRow[]).map(mapJobRowToDocument);
  } catch (err) {
    console.error('Failed to fetch job applications:', err);
    return null;
  }
};

export const fetchUserJob = async (id: string): Promise<JobApplication | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching job application from Supabase:', error);
      return null;
    }

    return data ? mapJobRowToDocument(data as JobRow) : null;
  } catch (err) {
    console.error('Failed to fetch job application:', err);
    return null;
  }
};

const insertJob = async (job: JobApplication, userId: string): Promise<SaveJobResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  const payload = buildJobRowPayload(job, 1, userId);
  const { data, error } = await supabase
    .from('job_applications')
    .insert(payload)
    .select('version')
    .single();

  if (error) {
    if (error.code === '23505') {
      const latest = await fetchUserJob(job.id);
      return { ok: false, reason: 'conflict', latest: latest ?? undefined };
    }
    if (isMissingTableError(error.message, error.code)) {
      return { ok: false, reason: 'missing_table', message: error.message };
    }
    console.error('Error inserting job application to Supabase:', error);
    return { ok: false, reason: 'error', message: error.message };
  }

  return {
    ok: true,
    version: typeof data?.version === 'number' ? data.version : 1,
  };
};

const updateJob = async (
  job: JobApplication,
  expectedVersion: number,
  userId: string
): Promise<SaveJobResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  const payload = buildJobRowPayload(job, expectedVersion + 1);
  const { data, error } = await supabase
    .from('job_applications')
    .update(payload)
    .eq('id', job.id)
    .eq('version', expectedVersion)
    .select('version')
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message, error.code)) {
      return { ok: false, reason: 'missing_table', message: error.message };
    }
    console.error('Error updating job application in Supabase:', error);
    return { ok: false, reason: 'error', message: error.message };
  }

  if (!data) {
    const latest = await fetchUserJob(job.id);
    if (!latest) {
      return insertJob(job, userId);
    }
    return { ok: false, reason: 'conflict', latest };
  }

  return {
    ok: true,
    version: typeof data.version === 'number' ? data.version : expectedVersion + 1,
  };
};

export const saveUserJob = async (
  job: JobApplication,
  expectedVersion?: number
): Promise<SaveJobResult> => {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'unauthenticated' };

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: 'unauthenticated' };

    if (expectedVersion === undefined || expectedVersion <= 0) {
      return await insertJob(job, user.id);
    }

    return await updateJob(job, expectedVersion, user.id);
  } catch (err) {
    console.error('Failed to save job application:', err);
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};

export const saveUserJobs = async (jobs: JobApplication[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase || jobs.length === 0) return false;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const payload = jobs.map((job) => buildJobRowPayload(job, job.version ?? 1, user.id));
    const { error } = await supabase
      .from('job_applications')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      if (isMissingTableError(error.message, error.code)) {
        return false;
      }
      console.error('Error batch saving job applications:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to batch save job applications:', err);
    return false;
  }
};

export const deleteUserJob = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isMissingTableError(error.message, error.code)) {
        return true;
      }
      console.error('Error deleting job application from Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete job application:', err);
    return false;
  }
};
