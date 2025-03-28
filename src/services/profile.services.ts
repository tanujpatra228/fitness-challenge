import { supabase } from "../utils/supabase";

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

export async function updateProfile(
  userId: string,
  displayName: string,
  gender: 'male' | 'female',
  avatarId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: displayName,
      gender,
      avatar_id: avatarId,
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