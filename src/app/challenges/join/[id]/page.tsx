import { fetchChallengeById } from "@/src/services/challenges.services";
import Link from "next/link";
import ChallengeDetail from "./_components/ChallengeDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const challengeId = (await params).id;
  const challenge = await fetchChallengeById(challengeId);
  return {
    title: `I challenge you to do ${challenge?.title} on FitChallenger`,
    description: challenge?.description || 'You have been challenged to join a FitChallenge',
    author: 'FitChallenge',
    openGraph: {
      title: `I challenge you to do ${challenge?.title} on FitChallenger`,
      description: challenge?.description || 'You have been challenged to join a FitChallenge',
      images: [
        {
          url: 'https://res.cloudinary.com/dopcbgrcs/image/upload/c_fill,w_1200,h_630/v1743333597/fitchallenger-app_futccf.jpg',
          width: 1200,
          height: 630,
          alt: 'A challenge on FitChallenger'
        }
      ]
    }
  }
}

export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const challengeId = (await params).id;
  const challenge = await fetchChallengeById(challengeId);

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p>Challenge not found</p>
        <Link href="/challenges/add">Create a Challenge</Link>
      </div>
    )
  }

  return (
    <>
      <ChallengeDetail challenge={challenge} />
    </>
  )

}