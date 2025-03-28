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

  if(auth.session) {
    return null;
  }

  return (
    <Auth />
  )
}

