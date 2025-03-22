"use client"

import Auth from "@/src/components/Auth";
import { useAuth } from "@/src/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.session && !auth.isLoading) {
      router.replace("/challenges");
    }
  }, [auth.session, auth.isLoading]);

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <h1 className="text-4xl font-bold mb-8">Fitness Challenge Platform</h1>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if(auth.session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Fitness Challenge Platform</h1>
        <Auth />
      </main>
    </div>
  )
}

