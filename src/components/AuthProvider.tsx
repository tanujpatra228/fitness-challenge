import { getProfile } from "@/src/services/profile.services";
import { supabase } from "@/src/utils/supabase";
import React, { createContext, useContext, useEffect, useState } from "react";
import ProfileDetailsModal from "./ProfileDetailsModal";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionWithProfile | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Initial session check
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session?.user) {
                    const profile = await getProfile(session.user.id);
                    setSession({...session, profile: (profile && { ...profile, avatar_url: session.user.user_metadata.avatar_url }) || null});
                    if (!profile) {
                        setShowProfileModal(true);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === "SIGNED_OUT") {
                setSession(null);
                return;
            }
            if (session?.user) {
                setSession((prevSession: SessionWithProfile | null) => {
                    if (prevSession?.user.id === session.user.id) {
                        return prevSession;
                    }
                    return {
                        ...session,
                        user: session.user,
                        profile: (profile && { ...profile, avatar_url: session.user.user_metadata.avatar_url }) || null
                    }
                });
                const profile = await getProfile(session.user.id);
                setSession({...session, profile: (profile && { ...profile, avatar_url: session.user.user_metadata.avatar_url }) || null});
                if (!profile) {
                    setShowProfileModal(true);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, isSignedIn: !!session, isLoading, signOut }}>
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
