import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function shareChallengeLink(challengeId: number, cb?: Function) {
  const link = `${window.location.origin}/challenges/join/${challengeId}`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join my FitChallenge',
        text: 'Join my FitChallenge and track your progress together!',
        url: link
      });
      if (cb) cb("Share successful");
    } catch (error) {
      // If share was cancelled or failed, fallback to clipboard
      await navigator.clipboard.writeText(link);
      if (cb) cb("Link copy to clipboard");
    }
  } else {
    // Fallback to clipboard if Web Share API is not available
    await navigator.clipboard.writeText(link);
    if (cb) cb("Link copy to clipboard");
  }
}