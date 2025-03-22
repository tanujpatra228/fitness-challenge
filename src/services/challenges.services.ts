import { supabase } from "../utils/supabase";

export async function fetchChallenges() {
    const { data, error } = await supabase.from("challenges").select("*, participants(user_id, joined_at)")

    if (error) {
        console.error("Error fetching challenges:", error)
        return [];
    } else {
        return data;
    }
}

export async function fetchChallengeById(id: string) {
    const { data, error } = await supabase
        .from("challenges")
        .select("*, participants(user_id, joined_at)")
        .eq("id", id)
        .single()

    if (error) {
        return null;
    } else {
        return data as Record<string, any>;
    }
}

export async function joinChallenge(userId: string, challengeId: number) {
    const { error } = await supabase
        .from("participants")
        .insert([{ challenge_id: challengeId, user_id: userId }])

    if (error) {
        throw error;
    } else {
        return true;
    }
}

export async function leaveChallenge(userId: string, challengeId: number) {
    const { error } = await supabase
        .from("participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", userId);

    if (error) {
        console.log('error', error);
        throw error;
    } else {
        return true;
    }
}

