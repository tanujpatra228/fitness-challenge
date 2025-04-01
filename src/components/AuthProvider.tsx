import { getProfile } from "@/src/services/profile.services";
import { supabase } from "@/src/utils/supabase";
import React, { createContext, useContext, useEffect, useState } from "react";
import ProfileDetailsModal from "./ProfileDetailsModal";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<SessionWithProfile | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setSession(null);
        } catch (error) {
            console.error('Error signing out:', error);
            setError(error as Error);
        }
    };

    // Initial session check
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setError(null);
                const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    throw sessionError;
                }

                if (sessionData?.user) {
                    try {
                        const profile = await getProfile(sessionData.user.id);
                        const sessionWithProfile = {
                            ...sessionData,
                            profile: profile || null
                        };
                        setSession(sessionWithProfile);
                        if (!profile) {
                            setShowProfileModal(true);
                        }
                    } catch (profileError) {
                        console.error('Error fetching profile:', profileError);
                        // Still set the session even if profile fetch fails
                        setSession({
                            ...sessionData,
                            profile: null
                        });
                        setShowProfileModal(true);
                    }
                } else {
                    setSession(null);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setError(error as Error);
                setSession(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sessionData) => {
            try {
                setError(null);
                if (_event === "SIGNED_OUT") {
                    setSession(null);
                    return;
                }
                else if (_event === "SIGNED_IN" && sessionData?.user) {
                    if (sessionData.user.id === session?.user?.id) {
                        return;
                    }
                    try {
                        const profile = await getProfile(sessionData.user.id);
                        const sessionWithProfile = {
                            ...sessionData,
                            profile: profile || null
                        };
                        setSession(sessionWithProfile);
                        if (!profile) {
                            setShowProfileModal(true);
                        }
                    } catch (profileError) {
                        console.error('Error fetching profile on auth change:', profileError);
                        // Still set the session even if profile fetch fails
                        setSession({
                            ...sessionData,
                            profile: null
                        });
                        setShowProfileModal(true);
                    }
                }
            } catch (error) {
                console.error('Error handling auth state change:', error);
                setError(error as Error);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [session?.user?.id]);

    if (error) {
        console.error('Auth Provider Error:', error);
    }

    return (
        <AuthContext.Provider value={{ 
            session, 
            isSignedIn: !!session, 
            isLoading, 
            signOut, 
            setShowProfileModal,
            error 
        }}>
            {children}
            {session?.user && (
                <ProfileDetailsModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    session={session}
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
