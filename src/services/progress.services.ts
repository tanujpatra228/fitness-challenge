import { supabase } from "../utils/supabase";

export interface ProgressEntry {
  id: number;
  challenge_id: number;
  user_id: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export async function logProgress(challengeId: number, userId: string, completed: boolean, notes?: string) {
  const { data, error } = await supabase
    .from("progress")
    .insert([{
      challenge_id: challengeId,
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      completed,
      notes
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProgress(challengeId: number, userId: string) {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.log("Error fetching progress:", error);
    return [];
  }

  return data as ProgressEntry[];
}

export async function getTodayProgress(challengeId: number, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .eq("date", today)
    .single();

    console.log('data', data, error);

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.log("Error fetching today's progress:", error);
    return null;
  }

  return data as ProgressEntry | null;
}