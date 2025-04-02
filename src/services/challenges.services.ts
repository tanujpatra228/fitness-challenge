import { supabase } from "../utils/supabase";

export async function fetchChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*, participants(user_id, joined_at)")
    .order('created_at', { ascending: false });

  if (error) {
    console.log("Error fetching challenges:", error);
    throw error;
  }

  return data as Challenge[];
}

export async function fetchChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*, participants(user_id, joined_at)")
    .eq("id", id)
    .single();

  if (error) {
    console.log("Error fetching challenge:", error);
    return null;
  }

  return data as Challenge;
}

export async function joinChallenge(userId: string, challengeId: number): Promise<boolean> {
  const { error } = await supabase
    .from("participants")
    .insert([
      {
        user_id: userId,
        challenge_id: challengeId,
        joined_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.log("Error joining challenge:", error);
    return false;
  }

  return true;
}

export async function leaveChallenge(userId: string, challengeId: number): Promise<boolean> {
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("user_id", userId)
    .eq("challenge_id", challengeId);

  if (error) {
    console.log("Error leaving challenge:", error);
    return false;
  }

  return true;
}

export async function createChallenge(challenge: Omit<Challenge, 'id' | 'participants'>): Promise<Challenge> {
  const { data, error } = await supabase
    .from("challenges")
    .insert([challenge])
    .select("id")
    .single();

  if (error) {
    console.log("Error creating challenge:", error);
    throw error;
  }

  return data as Challenge;
}

