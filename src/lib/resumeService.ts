import { getSupabase } from './supabase';
import { ResumeDocument } from '../types/resume';

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

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at ?? row.updated_at,
      updatedAt: row.updated_at,
      content: row.content,
    }));
  } catch (err) {
    console.error('Failed to fetch resumes:', err);
    return null;
  }
};

export const saveUserResume = async (resume: ResumeDocument): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from('resumes').upsert(
      {
        id: resume.id,
        user_id: user.id,
        title: resume.title,
        content: resume.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Error saving resume to Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to save resume:', err);
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
