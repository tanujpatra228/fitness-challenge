"use client"

import type React from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { supabase } from "@/src/utils/supabase"
import { useState } from "react"
import { useAuth } from "../../../../components/AuthProvider"
import { useRouter } from "next/navigation"

export default function CreateChallenge() {
  const { session } = useAuth();
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("challenges")
      .insert([{ title, description, duration: Number.parseInt(duration), created_by: session.user.id}])

    if (error) {
      alert("Error creating challenge")
    } else {
      alert("Challenge created successfully!")
      setTitle("")
      setDescription("")
      setDuration("")
      router.push("/challenges")
    }
    setLoading(false)
  }

  return (
    <Card className="w-[450px] mx-auto">
      <CardHeader>
        <CardTitle>Create a New Challenge</CardTitle>
        <CardDescription>Set up your fitness challenge</CardDescription>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Challenge"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

