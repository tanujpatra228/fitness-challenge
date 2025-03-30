type Profile = {
    id: string;
    display_name: string;
    gender: 'male' | 'female';
    avatar_id: string;
    created_at: string;
    updated_at: string;
}

type ProfileWithAvatar = Profile & { avatar_url?: string };

type SessionWithProfile = Session & {
    profile: ProfileWithAvatar | null;
}

type AuthContextType = {
    session: SessionWithProfile | null;
    isSignedIn: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
    setShowProfileModal: (show: boolean) => void;
}

type AuthError = {
    message: string;
}

type Challenge = {
    id: number;
    title: string;
    description: string;
    duration: number;
    created_by: string;
    participants: {
      user_id: string;
      joined_at: string;
    }[];
}

type ProgressEntry = {
    id: number;
    challenge_id: number;
    user_id: string;
    date: string;
    completed: boolean;
    notes?: string;
    created_at?: string;
}

type LeaderboardEntry = {
    user_id: string;
    profile: ProfileWithAvatar;
    completed_count: number;
    total_days: number;
    streak: number;
    last_completed_date: string | null;
}

type LeaderboardProgressEntry = {
    user_id: string;
    completed: boolean;
    created_at: string;
    profiles: ProfileWithAvatar;
}
