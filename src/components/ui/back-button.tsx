"use client"

import { Button } from "@/src/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={`gap-2 ${className}`}
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  )
} 