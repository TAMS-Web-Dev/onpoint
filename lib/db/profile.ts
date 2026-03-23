import { createClient } from '@/lib/supabase/server';
import { Profile, Database } from '@/types/database';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfileById(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getCurrentUserWithProfile(): Promise<{
  user: { id: string; email: string | undefined } | null;
  profile: Profile | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { user: null, profile: null, error: authError?.message ?? null };
  }

  const { user } = authData;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return {
      user: { id: user.id, email: user.email },
      profile: null,
      error: profileError.message,
    };
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
    error: null,
  };
}
