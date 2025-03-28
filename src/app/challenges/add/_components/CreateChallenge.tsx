"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { useAuth } from "../../../../components/AuthProvider"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createChallenge } from "@/src/services/challenges.services"
import { toast } from "sonner"
import { BackButton } from "@/src/components/ui/back-button"

export default function CreateChallenge() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: { title: string; description: string; duration: number; created_by: string }) => {
      return createChallenge(challengeData);
    },
    onSuccess: () => {
      toast.success("Challenge created successfully!");
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setTitle("");
      setDescription("");
      setDuration("");
      router.push("/challenges");
    },
    onError: (error) => {
      console.error("Error creating challenge:", error);
      toast.error("Failed to create challenge. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    createChallengeMutation.mutate({
      title,
      description,
      duration: Number.parseInt(duration),
      created_by: session.user.id
    });
  }

  return (
    <div className="space-y-4">
      <BackButton />
      <Card className="w-[450px] mx-auto">
        <CardHeader>
          <CardTitle>Create a New Challenge</CardTitle>
          <CardDescription>Set up your FitChallenge</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Challenge Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea
              placeholder="Challenge Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Duration (days)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={createChallengeMutation.isPending}>
              {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

