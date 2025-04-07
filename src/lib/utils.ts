import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function shareChallengeLink(challengeId: number, challengeTitle: string, cb?: Function) {
  const link = `${window.location.origin}/challenges/join/${challengeId}`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      // const imageUrl = "https://res.cloudinary.com/dopcbgrcs/image/upload/c_fill,w_1200,h_630/v1743333597/fitchallenger-app_futccf.jpg";
      // const response = await fetch(imageUrl);
      // const blob = await response.blob();
      // await navigator.share({
      //   title: `I challenge you to do ${challengeTitle} on FitChallenger`,
      //   text: 'Join my FitChallenge and track your progress together!',
      //   url: link,
      //   files: [new File([blob], 'image.jpg', { type: 'image/jpeg' })]
      // });
      await navigator.share({
        text: `I challenge you to do ${challengeTitle} on FitChallenger, Join my FitChallenge and track your progress together!\n\n${link}`,
      });
    } catch (error) {
      // If share was cancelled or failed, fallback to clipboard
      const clipboardContent = `I challenge you to do ${challengeTitle} on FitChallenger\n\nJoin my FitChallenge and track your progress together!\n\n${link}`;
      await navigator.clipboard.writeText(clipboardContent);
      if (cb) cb("Copy to clipboard");
    }
  } else {
    // Fallback to clipboard if Web Share API is not available
    const clipboardContent = `I challenge you to do ${challengeTitle} on FitChallenger\n\nJoin my FitChallenge and track your progress together!\n\n${link}`;
    await navigator.clipboard.writeText(clipboardContent);
    if (cb) cb("Copy to clipboard");
  }
}