"use client"
import { useAuth } from "@/src/components/AuthProvider"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const { user } = session || {};
  const router = useRouter();

  useEffect(() => {
    console.log('user && isLoading', user, isLoading);
    if (!user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <h1 className="text-4xl font-bold mb-8">Fitness Challenge Platform</h1>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Fitness Challenge Platform</h1>
        {children}
      </main>
    </div>
  )
}
