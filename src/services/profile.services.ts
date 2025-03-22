import { supabase } from "../utils/supabase";

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, displayName: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: displayName,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.log('Error updating profile:', error);
    return null;
  }

  return data;
} 