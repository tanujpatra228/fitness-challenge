import { supabase } from "../utils/supabase";

export async function logProgress(challengeId: number, userId: string, completed: boolean, notes?: string) {
  const { data, error } = await supabase
    .from('progress')
    .insert([
      {
        challenge_id: challengeId,
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        completed,
        notes
      }
    ])
    .select()
    .single();

  if (error) {
    console.log('Error logging progress:', error);
    throw error;
  }

  return data as unknown as ProgressEntry;
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
    .from('progress')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.log('Error fetching today\'s progress:', error);
    throw error;
  }

  return data as unknown as ProgressEntry | null;
}

export async function getLeaderboard(challengeId: number): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      user_id,
      completed,
      created_at,
      profiles (
        display_name,
        avatar_id,
        gender
      )
    `)
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('Error fetching leaderboard:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  // Group progress by user
  const userProgress = (data as unknown as LeaderboardProgressEntry[]).reduce((acc, entry) => {
    if (!acc[entry.user_id]) {
      acc[entry.user_id] = {
        user_id: entry.user_id,
        profile: entry.profiles,
        completed_count: 0,
        total_days: 0,
        streak: 0,
        last_completed_date: null
      };
    }
    acc[entry.user_id].total_days++;
    if (entry.completed) {
      acc[entry.user_id].completed_count++;
      acc[entry.user_id].last_completed_date = entry.created_at;
    }
    return acc;
  }, {} as Record<string, LeaderboardEntry>);

  // Calculate streaks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  Object.values(userProgress).forEach(entry => {
    if (entry.last_completed_date) {
      const lastCompleted = new Date(entry.last_completed_date);
      lastCompleted.setHours(0, 0, 0, 0);
      
      const daysSinceLastCompleted = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastCompleted <= 1) {
        entry.streak = 1;
        let currentDate = new Date(lastCompleted);
        currentDate.setDate(currentDate.getDate() - 1);
        
        while ((data as unknown as LeaderboardProgressEntry[]).some(d => 
          d.user_id === entry.user_id && 
          new Date(d.created_at).toDateString() === currentDate.toDateString() &&
          d.completed
        )) {
          entry.streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }
    }
  });

  // Convert to array and sort by completion rate and streak
  return Object.values(userProgress)
    .sort((a, b) => {
      const aRate = a.completed_count / a.total_days;
      const bRate = b.completed_count / b.total_days;
      if (aRate !== bRate) {
        return bRate - aRate;
      }
      return b.streak - a.streak;
    });
}