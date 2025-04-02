"use client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Textarea } from "@/src/components/ui/textarea"
import { useAuth } from "@/src/components/AuthProvider"
import { logProgress, getTodayProgress } from "@/src/services/progress.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { Skeleton } from "./ui/skeleton"

interface ProgressLoggerProps {
  challengeId: number;
}

export default function ProgressLogger({ challengeId }: ProgressLoggerProps) {
  const { session } = useAuth();
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const todayProgressQuery = useQuery({
    queryKey: ['progress', challengeId, 'today'],
    queryFn: () => getTodayProgress(challengeId, session?.user?.id || ''),
    enabled: !!session?.user?.id,
    staleTime: 5000,
    gcTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  const logProgressMutation = useMutation({
    mutationFn: async ({ completed, notes }: { completed: boolean, notes?: string }) => {
      if (!session?.user?.id) return;
      return logProgress(challengeId, session.user.id, completed, notes);
    },
    onSuccess: () => {
      toast.success("Progress logged successfully!");
      setNotes("");
      // Invalidate all progress-related queries
      queryClient.invalidateQueries({ queryKey: ['progress', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', challengeId] });
    },
    onError: (error) => {
      console.log("Error logging progress:", error);
      toast.error("Failed to log progress. Please try again.");
    }
  });

  const handleLogProgress = async (completed: boolean) => {
    if (!session?.user?.id) return;
    try {
      await logProgressMutation.mutateAsync({ completed, notes });
    } catch (error) {
      // Error is already handled in onError
    }
  };

  if (!session?.user?.id) {
    return null;
  }

  if (todayProgressQuery.isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todayProgressQuery.isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-left">Log Today's Progress</CardTitle>
          <CardDescription className="text-left">Error loading today's progress. Please try again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const todayProgress = todayProgressQuery.data as ProgressEntry | null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-left">Log Today's Progress</CardTitle>
        <CardDescription className="text-left">
          {todayProgress ? "You've already logged your progress for today" : "Mark your progress for today"}
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 ${todayProgress ? 'hidden' : ''}`}>
        {!todayProgress && (
          <>
            <Textarea
              placeholder="Add notes about your progress (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleLogProgress(true)}
                disabled={logProgressMutation.isPending}
                className="flex-1"
              >
                {logProgressMutation.isPending ? "Logging..." : "Mark as Completed"}
              </Button>
              <Button
                onClick={() => handleLogProgress(false)}
                disabled={logProgressMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                {logProgressMutation.isPending ? "Logging..." : "Mark as Failed"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 