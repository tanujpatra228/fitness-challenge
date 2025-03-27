import { Dumbbell } from "lucide-react"
import Link from "next/link"

export function Logo() {
  return (
    <div className="flex items-center gap-2 hover-lift">
      <div className="rounded-full bg-primary p-2">
        <Dumbbell className="h-6 w-6 text-primary-foreground" />
      </div>
      <Link href="/" className="font-heading text-lg font-semibold">FitChallenge</Link>
    </div>
  )
} 