"use client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Textarea } from "@/src/components/ui/textarea"
import { useAuth } from "@/src/components/AuthProvider"
import { logProgress, getTodayProgress, type ProgressEntry } from "@/src/services/progress.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

interface ProgressLoggerProps {
  challengeId: number;
}

export default function ProgressLogger({ challengeId }: ProgressLoggerProps) {
  const { session } = useAuth();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const todayProgressQuery = useQuery({
    queryKey: ['progress', challengeId, 'today'],
    queryFn: () => getTodayProgress(challengeId, session?.user?.id || ''),
    enabled: !!session?.user?.id,
  });

  const logProgressMutation = useMutation({
    mutationFn: async ({ completed, notes }: { completed: boolean, notes?: string }) => {
      if (!session?.user?.id) return;
      return logProgress(challengeId, session.user.id, completed, notes);
    },
    onSuccess: () => {
      toast.success("Progress logged successfully!");
      setNotes("");
      todayProgressQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['progress', challengeId, 'history'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', challengeId] });
    },
    onError: () => {
      toast.error("Failed to log progress");
    }
  });

  const handleLogProgress = async (completed: boolean) => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      await logProgressMutation.mutateAsync({ completed, notes });
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.id) {
    return null;
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
                disabled={loading}
                className="flex-1"
              >
                Mark as Completed
              </Button>
              <Button
                onClick={() => handleLogProgress(false)}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                Mark as Failed
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 