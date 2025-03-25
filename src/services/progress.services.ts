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

async function insertMissedEntries(challengeId: number, userId: string, dates: string[]) {
  if (dates.length === 0) return [];

  const entries = dates.map(date => ({
    challenge_id: challengeId,
    user_id: userId,
    date,
    completed: false,
    notes: 'missed'
  }));

  const { data, error } = await supabase
    .from("progress")
    .insert(entries)
    .select();

  if (error) {
    console.log("Error inserting missed entries:", error);
    return [];
  }

  return data as ProgressEntry[];
}

export async function getProgress(challengeId: number, userId: string, joinedDate: string, challengeDuration: number) {
  // Get all progress entries
  const { data: progressEntries, error: progressError } = await supabase
    .from("progress")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (progressError) {
    console.log("Error fetching progress:", progressError);
    return [];
  }

  // Create a map of existing progress entries by date
  const progressMap = new Map(
    progressEntries.map((entry: ProgressEntry) => [entry.date, entry])
  );

  // Generate all dates between start_date and start_date + duration
  const startDate = new Date(joinedDate);
  const allDates: ProgressEntry[] = [];
  // find how many days have passed till date from joinedDate but dont count today
  const daysPassed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Collect all missing dates
  const missingDates: string[] = [];

  for (let i = 0; i < Math.min(daysPassed, challengeDuration); i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];

    // If there's an existing entry for this date, use it
    if (progressMap.has(dateString)) {
      allDates.push(progressMap.get(dateString)!);
    } else {
      // Add to missing dates array
      missingDates.push(dateString);
      // Create a temporary entry for display
      allDates.push({
        id: -i, // Temporary negative ID
        challenge_id: challengeId,
        user_id: userId,
        date: dateString,
        completed: false,
        notes: 'missed'
      });
    }
  }

  // If there are missing dates, insert them all at once
  if (missingDates.length > 0) {
    const insertedEntries = await insertMissedEntries(challengeId, userId, missingDates);
    
    // Update the allDates array with the real IDs from inserted entries
    let insertIndex = 0;
    allDates.forEach((entry, index) => {
      if (entry.id < 0) {
        const insertedEntry = insertedEntries[insertIndex];
        if (insertedEntry) {
          allDates[index] = insertedEntry;
        }
        insertIndex++;
      }
    });
  }

  // sort by date ascending
  allDates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return allDates;
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