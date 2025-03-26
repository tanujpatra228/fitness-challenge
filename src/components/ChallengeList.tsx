"use client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Share2, SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { shareChallengeLink } from "../lib/utils"
import { fetchChallenges, joinChallenge, leaveChallenge, Challenge } from "../services/challenges.services"
import { useAuth } from "./AuthProvider"
import { Skeleton } from "./ui/skeleton"

export default function ChallengeList() {
  const { session } = useAuth();
  const user = session?.user || null;

  const challengesQuery = useQuery({
    queryKey: ['challenges'],
    queryFn: fetchChallenges,
    enabled: !!session?.user,
    refetchInterval: 10000,
    staleTime: 5000,
    gcTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      if (!user) return false;
      const success = await joinChallenge(user.id, challengeId);
      if (success) {
        challengesQuery.refetch();
        toast.success("Successfully joined challenge!");
      } else {
        toast.error("Failed to join challenge");
      }
      return success;
    }
  });

  const leaveChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      if (!user) return false;
      const success = await leaveChallenge(user.id, challengeId);
      if (success) {
        challengesQuery.refetch();
        toast.success("Successfully left challenge");
      } else {
        toast.error("Failed to leave challenge");
      }
      return success;
    }
  });

  const challenges = challengesQuery.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2">
        {challengesQuery.isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-1/3 mt-4" />
                </CardContent>
              </div>
              <CardFooter className="flex justify-between items-center gap-2 flex-wrap">
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          ))
        ) : challengesQuery.isError ? (
          <div className="col-span-full text-center text-muted-foreground">
            Error loading challenges. Please try again.
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No active challenges. Create one to get started!
          </div>
        ) : (
          challenges.map((challenge: Challenge) => {
            const participantsCount = challenge.participants.length;
            const alreadyJoined = challenge.participants.some(p => p.user_id === user?.id);
            
            return (
              <Card key={challenge.id} className="flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>{challenge.duration} days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-justify">{challenge.description}</p>
                    {participantsCount > 0 && (
                      <p className="text-left text-sm">Participants: {participantsCount}</p>
                    )}
                  </CardContent>
                </div>
                <CardFooter className="flex justify-between items-center gap-2 flex-wrap">
                  {user?.id !== challenge.created_by ? (
                    alreadyJoined ? (
                      <Button
                        onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                        className="mt-4"
                        variant="destructive"
                        disabled={leaveChallengeMutation.isPending}
                      >
                        {leaveChallengeMutation.isPending ? "Leaving..." : "Quit Challenge"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => joinChallengeMutation.mutate(challenge.id)}
                        className="mt-4"
                        disabled={alreadyJoined || joinChallengeMutation.isPending}
                      >
                        {joinChallengeMutation.isPending ? "Joining..." : "Join Challenge"}
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
                  )}
                  <Link href={`/challenges/join/${challenge.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4">
                    Visit Challenge <SquareArrowOutUpRight />
                  </Link>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

