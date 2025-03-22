import { getProfile } from "@/src/services/profile.services";
import { supabase } from "@/src/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";
import ProfileDetailsModal from "./ProfileDetailsModal";

interface AuthContextType {
    session: Session | null;
    isSignedIn: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const authQuery = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data: session } = await supabase.auth.getSession();
            setSession(session);
            return session;
        },
        refetchOnWindowFocus: false,
    });

    const profileQuery = useQuery({
        queryKey: ['profile', session?.user?.id],
        queryFn: () => getProfile(session?.user?.id),
        enabled: !!session?.user?.id,
    });

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                const profile = await getProfile(session.user.id);
                if (!profile) {
                    setShowProfileModal(true);
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, isSignedIn: !!session, isLoading: authQuery.isLoading }}>
            {children}
            {session?.user && (
                <ProfileDetailsModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    userId={session.user.id}
                />
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
