"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useAuth } from "@/src/components/AuthProvider"
import { getProgress, type ProgressEntry } from "@/src/services/progress.services"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

interface ProgressHistoryProps {
  challengeId: number;
}

export default function ProgressHistory({ challengeId }: ProgressHistoryProps) {
  const { session } = useAuth();

  const progressQuery = useQuery({
    queryKey: ['progress', challengeId, 'history'],
    queryFn: () => getProgress(challengeId, session?.user?.id || ''),
    enabled: !!session?.user?.id
  });

  if (!session?.user?.id) {
    return null;
  }

  const progress = progressQuery.data as ProgressEntry[] || [];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Progress History</CardTitle>
        <CardDescription>Your daily progress for this challenge</CardDescription>
      </CardHeader>
      <CardContent>
        {progress.length === 0 ? (
          <p className="text-center text-muted-foreground">No progress logged yet</p>
        ) : (
          <div className="space-y-4">
            {progress.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">
                    {index + 1}. {format(new Date(entry.date), 'MMM dd, yyyy')}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  entry.completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {entry.completed ? 'Completed' : 'Failed'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 