"use client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Share2, SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { shareChallengeLink } from "../lib/utils"
import { fetchChallenges, joinChallenge, leaveChallenge } from "../services/challenges.services"
import { useAuth } from "./AuthProvider"

export default function ChallengeList() {
  const { session } = useAuth();
  const user = session?.user || null;
  const challengesQuery = useQuery({
    queryKey: ['challenges'],
    queryFn: fetchChallenges,
    refetchOnWindowFocus: false,
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      if (!user) return false;
      if (await joinChallenge(user.id, challengeId)) challengesQuery.refetch();
    }
  });

  const leaveChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      if (!user) return false;
      if (await leaveChallenge(user.id, challengeId)) challengesQuery.refetch();
    }
  });

  const challenges = challengesQuery.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2">
        {challenges.map((challenge) => {
          const participantsCount = Array.isArray(challenge.participants) ? challenge.participants.length : 0;
          const alreadyJoined = participantsCount > 0 ? challenge.participants.find((participant: any) => participant.user_id === user?.id) : false;
          return (
            <Card key={challenge.id} className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle>{challenge.title}</CardTitle>
                  <CardDescription>{challenge.duration} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-justify">{challenge.description}</p>
  
                  {/* Has Participants */}
                  {
                    !!participantsCount && (
                      <p className="text-left text-sm">Participants: {participantsCount}</p>
                    )
                  }
                </CardContent>
              </div>
              <CardFooter className="flex justify-between items-center gap-2 flex-wrap">
                {
                  user?.id !== challenge.created_by ? (
                    alreadyJoined ? (
                      <Button
                      onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                      className="mt-4"
                      variant="destructive"
                      disabled={leaveChallengeMutation.isPending}
                    >
                      Quit Challenge
                    </Button>
                    ) : (
                      <Button
                      onClick={() => joinChallengeMutation.mutate(challenge.id)}
                      className="mt-4"
                      disabled={alreadyJoined || joinChallengeMutation.isPending}
                    >
                      Join Challenge
                    </Button>
                    )
                  ) : (
                    <Button
                      onClick={async () => {
                        try {
                          await shareChallengeLink(challenge.id, toast.success);
                        } catch (error) {
                          toast.error("Failed to share link");
                        }
                      }}
                      className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      Challenge Friend <Share2 />
                    </Button>
                  )
                }
                <Link href={`/challenges/join/${challenge.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4">
                  Visit Challange <SquareArrowOutUpRight />
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

