'use client'

import { useAuth } from "@/src/components/AuthProvider"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { joinChallenge, leaveChallenge } from "@/src/services/challenges.services"
import { useMutation } from "@tanstack/react-query"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default function ChallengeDetail({ challenge }: { challenge: any }) {
    const auth = useAuth();

    const alreadyJoined = challenge?.participants?.some((participant: any) => participant.user_id === auth?.session?.user?.id);

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
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <Card className="w-[450px]">
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
        </div>
    )
}