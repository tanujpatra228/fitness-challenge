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
import { Skeleton } from "./ui/skeleton"

export default function ChallengeList() {
  const { session } = useAuth();
  const user = session?.user || null;

  const challengesQuery = useQuery({
    queryKey: ['challenges'],
    queryFn: fetchChallenges,
    enabled: !!session?.user,
  });

  // const joinChallengeMutation = useMutation({
  //   mutationFn: async (challengeId: number) => {
  //     if (!user) return false;
  //     const success = await joinChallenge(user.id, challengeId);
  //     if (success) {
  //       challengesQuery.refetch();
  //       toast.success("Successfully joined challenge!");
  //     } else {
  //       toast.error("Failed to join challenge");
  //     }
  //     return success;
  //   }
  // });

  // const leaveChallengeMutation = useMutation({
  //   mutationFn: async (challengeId: number) => {
  //     if (!user) return false;
  //     const success = await leaveChallenge(user.id, challengeId);
  //     if (success) {
  //       challengesQuery.refetch();
  //       toast.success("Successfully left challenge");
  //     } else {
  //       toast.error("Failed to leave challenge");
  //     }
  //     return success;
  //   }
  // });

  const challenges = challengesQuery.data || [];

  return (
    <div className="space-y-6 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Active Challenges</h2>
        <Button asChild className="sm:flex items-center gap-2">
          <Link href="/challenges/add">
            Create Challenge
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {challengesQuery.isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col justify-between hover-lift">
              <div>
                <CardHeader className="space-y-1">
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
          <div className="col-span-full text-center text-muted-foreground p-8">
            <p className="text-lg font-medium">Error loading challenges</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground p-8">
            <p className="text-lg font-medium">No active challenges</p>
            <p className="text-sm mt-2">Create one to get started!</p>
            <Button 
              className="mt-4"
              asChild
            >
              <Link href="/challenges/add">
                Create Challenge
              </Link>
            </Button>
          </div>
        ) : (
          challenges.map((challenge: Challenge) => {
            const participantsCount = challenge.participants.length;
            const alreadyJoined = challenge.participants.some(p => p.user_id === user?.id);
            
            return (
              <Card key={challenge.id} className="flex flex-col justify-between hover-lift">
                <div>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <CardDescription className="text-sm">{challenge.duration} days</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{challenge.description}</p>
                    {participantsCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{participantsCount}</span>
                        <span className="text-muted-foreground">participants</span>
                      </div>
                    )}
                  </CardContent>
                </div>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
                  {user?.id !== challenge.created_by ? (
                    // alreadyJoined ? (
                    //   <Button
                    //     onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                    //     className="w-full sm:w-auto"
                    //     variant="destructive"
                    //     disabled={leaveChallengeMutation.isPending}
                    //   >
                    //     {leaveChallengeMutation.isPending ? "Leaving..." : "Quit Challenge"}
                    //   </Button>
                    // ) : (
                    //   <Button
                    //     onClick={() => joinChallengeMutation.mutate(challenge.id)}
                    //     className="w-full sm:w-auto"
                    //     disabled={alreadyJoined || joinChallengeMutation.isPending}
                    //   >
                    //     {joinChallengeMutation.isPending ? "Joining..." : "Join Challenge"}
                    //   </Button>
                    // )
                    <></>
                  ) : (
                    <Button
                      onClick={async () => {
                        try {
                          await shareChallengeLink(challenge.id, challenge.title, toast.success);
                        } catch (error) {
                          console.error("Error sharing challenge:", error);
                          // toast.error("Failed to share link");
                        }
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                    >
                      Challenge Friend <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Link 
                    href={`/challenges/join/${challenge.id}`} 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                  >
                    Visit Challenge <SquareArrowOutUpRight className="h-4 w-4" />
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

