import { fetchChallengeById } from "@/src/services/challenges.services";
import Link from "next/link";
import ChallengeDetail from "./_components/ChallengeDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const challengeId = (await params).id;
  const challenge = await fetchChallengeById(challengeId);
  return {
    title: challenge?.title || 'Fitness Challenge',
    description: challenge?.description || 'You have been challenged to join a fitness challenge',
    author: 'Fitness Challenge App',
  }
}

export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const challengeId = (await params).id;
  const challenge = await fetchChallengeById(challengeId);

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p>Challenge not found</p>
        <Link href="/">Create a Challenge</Link>
      </div>
    )
  }

  return (
    <>
      <ChallengeDetail challenge={challenge} />
    </>
  )

}