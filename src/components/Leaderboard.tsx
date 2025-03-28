"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { getLeaderboard } from "@/src/services/progress.services";
import { useQuery } from "@tanstack/react-query";
import LeaderboardAvatar from "./ui/leader-board-avatar";
import { useAuth } from "./AuthProvider";
import { Skeleton } from "./ui/skeleton";

interface LeaderboardProps {
  challengeId: number;
}

export default function Leaderboard({ challengeId }: LeaderboardProps) {
  const { session } = useAuth();

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', challengeId],
    queryFn: () => getLeaderboard(challengeId),
    enabled: !!challengeId && !!session?.user,
    refetchInterval: 10000,
    staleTime: 5000, // Consider data fresh for 5 seconds
    gcTime: 30000, // Keep data in cache for 30 seconds
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  const leaderboard = leaderboardQuery.data || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Challenge progress rankings</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboardQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : leaderboardQuery.isError ? (
          <p className="text-center text-muted-foreground">Error loading leaderboard</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground">No participants yet</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry: LeaderboardEntry, index: number) => (
              <div
                key={entry.user_id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <LeaderboardAvatar entry={entry} index={index} />

                  <div>
                    <p className="font-medium truncate max-w-[150px]">
                      {entry.profile.display_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.completed_count}/{entry.total_days} days completed
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium">
                    {Math.round((entry.completed_count / entry.total_days) * 100)}%
                  </div>
                  {entry.streak > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {entry.streak} day streak
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 