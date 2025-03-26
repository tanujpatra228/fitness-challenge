'use client'

import { useAuth } from "@/src/components/AuthProvider"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { joinChallenge, leaveChallenge } from "@/src/services/challenges.services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import ProgressLogger from "@/src/components/ProgressLogger"
import ProgressHistory from "@/src/components/ProgressHistory"
import Leaderboard from "@/src/components/Leaderboard"
import { Share2 } from "lucide-react"
import { shareChallengeLink } from "@/src/lib/utils"
import { toast } from "sonner"
import { Skeleton } from "@/src/components/ui/skeleton"

export default function ChallengeDetail({ challenge }: { challenge: any }) {
    const auth = useAuth();
    const queryClient = useQueryClient();

    const alreadyJoined = challenge?.participants?.some((participant: any) => participant.user_id === auth?.session?.user?.id);
    const joinedDate = challenge?.participants?.find((participant: any) => participant.user_id === auth?.session?.user?.id)?.joined_at || null;

    const joinChallengeMutation = useMutation({
        mutationFn: async (challengeId: number) => {
            if (!auth?.session?.user) return false;
            const success = await joinChallenge(auth.session.user.id, challengeId);
            if (!success) {
                throw new Error("Failed to join challenge");
            }
            return success;
        },
        onSuccess: () => {
            toast.success("Successfully joined challenge!");
            // Invalidate all challenge-related queries
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
        },
        onError: (error) => {
            console.error("Error joining challenge:", error);
            toast.error("Failed to join challenge. Please try again.");
        }
    });

    const leaveChallengeMutation = useMutation({
        mutationFn: async (challengeId: number) => {
            if (!auth?.session?.user) return false;
            const success = await leaveChallenge(auth.session.user.id, challengeId);
            if (!success) {
                throw new Error("Failed to leave challenge");
            }
            return success;
        },
        onSuccess: () => {
            toast.success("Successfully left challenge");
            // Invalidate all challenge-related queries
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
        },
        onError: (error) => {
            console.error("Error leaving challenge:", error);
            toast.error("Failed to leave challenge. Please try again.");
        }
    });

    if (!challenge) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{challenge.title}</CardTitle>
                            <CardDescription>{challenge.duration} days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{challenge.description}</p>
                            {!!auth.session ? (
                                alreadyJoined ? (
                                    <div className="flex justify-center items-center gap-2">
                                        <Button
                                            onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                                            className="mt-4"
                                            variant="destructive"
                                            disabled={leaveChallengeMutation.isPending}
                                        >
                                            {leaveChallengeMutation.isPending ? "Leaving..." : "Quit Challenge"}
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await shareChallengeLink(challenge.id, toast.success);
                                                } catch (error) {
                                                    console.error("Error sharing challenge:", error);
                                                    toast.error("Failed to share link");
                                                }
                                            }}
                                            className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            Challenge Friend <Share2 />
                                        </Button>
                                    </div>
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
                                <Link href="/">Login to Join Challenges</Link>
                            )}
                        </CardContent>
                    </Card>

                    {alreadyJoined && (
                        <>
                            <ProgressLogger challengeId={challenge.id} />
                            <ProgressHistory
                                challengeId={challenge.id}
                                joinedDate={joinedDate}
                                challengeDuration={challenge.duration}
                            />
                        </>
                    )}
                </div>

                {/* Right Column - Leaderboard */}
                <div className="">
                    <Leaderboard challengeId={challenge.id} />
                </div>
            </div>
        </div>
    )
}