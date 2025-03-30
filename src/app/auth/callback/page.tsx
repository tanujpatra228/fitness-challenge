"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/utils/supabase"

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.log("Error during auth callback:", error);
        router.push("/");
        return;
      }

      if (session) {
        router.push("/challenges");
      } else {
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
} 