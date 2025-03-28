"use client"

import { useAuth } from "@/src/components/AuthProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Logo } from "@/src/components/ui/logo"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getAvatar } from "../lib/userAvatars"

export default function Header() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const user = session?.user;
  const profile = session?.profile;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile ? getAvatar(profile) : ""} alt={profile?.display_name || ""} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block">{profile?.display_name || user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 hover-lift"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block">Logout</span>
              </Button>
            </>
          ) : (
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover-lift">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
} 