'use client'

import { useAuth } from "@/src/components/AuthProvider"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { joinChallenge, leaveChallenge } from "@/src/services/challenges.services"
import { useMutation } from "@tanstack/react-query"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import ProgressLogger from "@/src/components/ProgressLogger"
import ProgressHistory from "@/src/components/ProgressHistory"
import Leaderboard from "@/src/components/Leaderboard"

export default function ChallengeDetail({ challenge }: { challenge: any }) {
    const auth = useAuth();

    const alreadyJoined = challenge?.participants?.some((participant: any) => participant.user_id === auth?.session?.user?.id);
    const joinedDate = challenge?.participants?.find((participant: any) => participant.user_id === auth?.session?.user?.id)?.joined_at || null;

    const joinChallengeMutation = useMutation({
        mutationFn: async (challengeId: number) => {
            if (!auth?.session?.user) return false;
            if (await joinChallenge(auth?.session?.user?.id, challengeId)) revalidatePath(`/join/${challengeId}`);
        }
    });

    const leaveChallengeMutation = useMutation({
        mutationFn: async (challengeId: number) => {
            const user = auth?.session?.user || null;
            if (!user) return false;
            if (await leaveChallenge(user.id, challengeId)) revalidatePath(`/join/${challengeId}`);
        }
    });

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
                                    <Button
                                        onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                                        className="mt-4"
                                        variant="destructive"
                                        disabled={leaveChallengeMutation.isPending}
                                    >
                                        Leave Challenge
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