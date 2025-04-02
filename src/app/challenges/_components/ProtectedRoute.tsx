"use client"
import { useAuth } from "@/src/components/AuthProvider"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading, error } = useAuth();
  const router = useRouter();

  console.log("Protected Route", {session, isLoading, error});

  useEffect(() => {
    if (error) {
      console.error('Protected Route Error:', error);
    }

    // Only redirect if we're not loading and there's no session
    if (!isLoading && !session) {
      router.replace('/');
    }
  }, [session, isLoading, router, error]);

  // Show loading state while checking authentication
  if (isLoading && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-6 md:px-20 text-center">
          <h1 className="text-4xl font-bold mb-8">FitChallenge Platform</h1>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
};
