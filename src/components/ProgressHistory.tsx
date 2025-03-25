"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useAuth } from "@/src/components/AuthProvider"
import { getProgress, type ProgressEntry } from "@/src/services/progress.services"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarX } from "lucide-react"

interface ProgressHistoryProps {
  challengeId: number;
  joinedDate: string;
  challengeDuration: number;
}

export default function ProgressHistory({ challengeId, joinedDate, challengeDuration }: ProgressHistoryProps) {
  const { session } = useAuth();

  const progressQuery = useQuery({
    queryKey: ['progress', challengeId, 'history'],
    queryFn: () => getProgress(challengeId, session?.user?.id || '', joinedDate, challengeDuration),
    enabled: !!session?.user?.id
  });

  if (!session?.user?.id) {
    return null;
  }

  const progress = progressQuery.data as ProgressEntry[] || [];

  return (
    <Card className="w-full">
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
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  entry.notes === 'missed' ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </p>
                    {entry.notes && (
                      <p className={`text-sm ${
                        entry.notes === 'missed' 
                          ? 'text-muted-foreground flex items-center gap-1'
                          : 'text-muted-foreground'
                      }`}>
                        {entry.notes === 'missed' && <CalendarX className="w-3 h-3" />}
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  entry.completed
                    ? 'bg-green-100 text-green-800'
                    : entry.notes === 'missed'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {entry.completed ? 'Completed' : entry.notes === 'missed' ? 'Missed' : 'Failed'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 