import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function shareChallengeLink(challengeId: number, challengeTitle: string, cb?: Function) {
  const link = `${window.location.origin}/challenges/join/${challengeId}`;
  const shareMessage = `Alright champ, I’ve just crushed the first round of ${challengeTitle} on FitChallenger — now it’s your turn to step up! 💪\nJoin me in this challenge and let’s see who really owns the grind.\nWe’ll track our progress together, push each other, and yeah… bragging rights are 100% on the table.😏\n\nLet’s go: ${link}`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        text: shareMessage,
      });
    } catch (error) {
      // If share was cancelled or failed, fallback to clipboard
      await navigator.clipboard.writeText(shareMessage);
      if (cb) cb("Copy to clipboard");
    }
  } else {
    // Fallback to clipboard if Web Share API is not available
    await navigator.clipboard.writeText(shareMessage);
    if (cb) cb("Copy to clipboard");
  }
}