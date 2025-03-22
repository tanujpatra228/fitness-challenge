"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { getLeaderboard } from "@/src/services/progress.services"
import { useQuery } from "@tanstack/react-query"

interface LeaderboardProps {
  challengeId: number;
}

export default function Leaderboard({ challengeId }: LeaderboardProps) {
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', challengeId],
    queryFn: () => getLeaderboard(challengeId),
    enabled: !!challengeId,
    refetchInterval: 10000
  });

  const leaderboard = leaderboardQuery.data || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Challenge progress rankings</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground">No participants yet</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[150px]">
                      {entry.email}
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