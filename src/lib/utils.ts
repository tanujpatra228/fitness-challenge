import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyInviteLink(challengeId: number, cb?: Function) {
  const link = `${window.location.origin}/challenges/join/${challengeId}`
  navigator.clipboard.writeText(link).then(() => {
    if (cb) cb();
  });
}