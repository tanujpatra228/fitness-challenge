import { supabase } from "../utils/supabase";

export interface ProgressEntry {
  id: number;
  challenge_id: number;
  user_id: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  completed_count: number;
  total_days: number;
  streak: number;
  last_completed: string | null;
  profile: {
    display_name: string;
    gender: string;
    avatar_id: string;
  };
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

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.log("Error fetching today's progress:", error);
    return null;
  }

  return data as ProgressEntry | null;
}

export async function getLeaderboard(challengeId: number): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      user_id,
      completed,
      date,
      profiles:user_id (display_name, gender, avatar_id),
      challenges:challenge_id (duration)
    `)
    .eq('challenge_id', challengeId)
    .order('date', { ascending: false });

  if (error) {
    console.log('Error fetching leaderboard:', error);
    return [];
  }

  // Process the data to calculate statistics
  const userStats = new Map<string, LeaderboardEntry>();

  data.forEach((entry: any) => {
    const userId = entry.user_id;
    
    if (!userStats.has(userId)) {
      userStats.set(userId, {
        user_id: userId,
        completed_count: 0,
        total_days: entry.challenges.duration || 0,
        streak: 0,
        last_completed: null,
        profile: entry.profiles
      });
    }

    const stats = userStats.get(userId)!;

    if (entry.completed) {
      stats.completed_count++;
      if (!stats.last_completed || new Date(entry.date) > new Date(stats.last_completed)) {
        stats.last_completed = entry.date;
      }
    }

    // Calculate streak
    if (entry.completed && stats.last_completed) {
      const lastDate = new Date(stats.last_completed);
      const currentDate = new Date(entry.date);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.streak++;
      } else {
        stats.streak = 1;
      }
    } else if (entry.completed) {
      stats.streak = 1;
    }
  });

  return Array.from(userStats.values())
    .sort((a, b) => {
      // Sort by completion rate first
      const aRate = a.completed_count / a.total_days;
      const bRate = b.completed_count / b.total_days;
      if (bRate !== aRate) {
        return bRate - aRate;
      }
      // Then by streak
      return b.streak - a.streak;
    });
}