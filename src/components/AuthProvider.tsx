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
            console.log('Error signing out:', error);
            setError(error as Error);
        }
    };

    // Initial session check
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log("Initializing auth");
                const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    throw sessionError;
                }

                if (!sessionData?.user) {
                    setSession(null);
                    return;
                }

                const profile = await getProfile(sessionData.user.id);
                const sessionWithProfile = {
                    ...sessionData,
                    profile: profile || null
                };
                setSession(sessionWithProfile);

                if (!profile) {
                    setShowProfileModal(true);
                }
            } catch (error) {
                console.log('Error initializing auth:', error);
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
                console.log("Auth state changed:", _event);
                setError(null);
                if (_event === "SIGNED_OUT") {
                    setSession(null);
                    return;
                }
                else if (_event === "SIGNED_IN" && sessionData?.user) {
                    const profile = await getProfile(sessionData.user.id);
                    const sessionWithProfile = {
                        ...sessionData,
                        profile: profile || null
                    };
                    setSession(sessionWithProfile);

                    if (!profile) {
                        setShowProfileModal(true);
                    }
                }
            } catch (error) {
                console.log('Error handling auth state change:', error);
                setError(error as Error);
            } finally {
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (error) {
        console.log('Auth Provider Error:', error);
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
