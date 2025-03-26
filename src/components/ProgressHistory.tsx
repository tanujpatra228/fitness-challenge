"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useAuth } from "@/src/components/AuthProvider"
import { getProgress, type ProgressEntry } from "@/src/services/progress.services"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarX } from "lucide-react"
import { Skeleton } from "./ui/skeleton"

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
    enabled: !!session?.user?.id && !!joinedDate && !!challengeDuration,
    staleTime: 5000,
    gcTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  if (!session?.user?.id) {
    return null;
  }

  if (progressQuery.isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (progressQuery.isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg text-left">Progress History</CardTitle>
          <CardDescription className="text-left">Your daily progress for this challenge</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Error loading progress history. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const progress = progressQuery.data as ProgressEntry[] || [];

  if (progress.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg text-left">Progress History</CardTitle>
        <CardDescription className="text-left">Your daily progress for this challenge</CardDescription>
      </CardHeader>
      <CardContent>
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
                  {progress.length - index}
                </span>
                <div>
                  <p className="font-medium">
                    {format(new Date(entry.date), 'MMM dd, yyyy')}
                  </p>
                  {entry.notes && (
                    <p className={`text-sm text-muted-foreground ${
                      entry.notes === 'missed' 
                        ? 'flex items-center gap-1'
                        : ''
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
                  : 'bg-red-100 text-red-800'
              }`}>
                {entry.completed ? 'Completed' : 'Failed'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 