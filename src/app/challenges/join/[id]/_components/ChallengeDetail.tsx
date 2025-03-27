'use client'

import { useAuth } from "@/src/components/AuthProvider"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchChallengeById, joinChallenge, leaveChallenge } from "@/src/services/challenges.services"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import Leaderboard from "@/src/components/Leaderboard"
import { Skeleton } from "@/src/components/ui/skeleton"
import { toast } from "sonner"
import { Share2, Calendar1, Users } from "lucide-react"
import Header from "@/src/components/Header"
import { BackButton } from "@/src/components/ui/back-button"
import ProgressHistory from "@/src/components/ProgressHistory"
import ProgressLogger from "@/src/components/ProgressLogger"
import { shareChallengeLink } from "@/src/lib/utils"
import Link from "next/link"

export default function ChallengeDetail({ challenge }: { challenge: any }) {
    const auth = useAuth();
    const queryClient = useQueryClient();

    const alreadyJoined = challenge?.participants?.some((participant: any) => participant.user_id === auth?.session?.user?.id);
    const joinedDate = challenge?.participants?.find((participant: any) => participant.user_id === auth?.session?.user?.id)?.joined_at || null;
    const participantsCount = challenge?.participants?.length || 0;

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
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <BackButton />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-[400px]" />
                            <Skeleton className="h-[400px]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-4">
                <BackButton />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6 lg:space-y-8">
                        <Card className="hover-lift">
                            <CardHeader className="space-y-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                                        <CardDescription className="text-sm capitalize flex justify-start items-center gap-2 divide-x divide-slate-400">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar1 className="h-4 w-4" />
                                                <span>{challenge.duration} days</span>
                                            </div>
                                            <div className="pl-2 flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{participantsCount} participants</span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                {!!auth.session ? (
                                    alreadyJoined ? (
                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <Button
                                                onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                                                className="w-full sm:w-auto"
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
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                                            >
                                                Challenge Friend <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => joinChallengeMutation.mutate(challenge.id)}
                                            className="w-full sm:w-auto"
                                            disabled={alreadyJoined || joinChallengeMutation.isPending}
                                        >
                                            {joinChallengeMutation.isPending ? "Joining..." : "Join Challenge"}
                                        </Button>
                                    )
                                ) : (
                                    <Link 
                                        href="/" 
                                        className="inline-flex items-center justify-center w-full sm:w-auto rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
                                    >
                                        Login to Join Challenges
                                    </Link>
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
                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <Leaderboard challengeId={challenge.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}