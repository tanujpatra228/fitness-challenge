"use client"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { updateProfile } from "@/src/services/profile.services"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

interface DisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function DisplayNameModal({ isOpen, onClose, userId }: DisplayNameModalProps) {
  const [displayName, setDisplayName] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (name: string) => {
      return updateProfile(userId, name);
    },
    onSuccess: () => {
      toast.success("Display name updated successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update display name");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    await updateProfileMutation.mutateAsync(displayName.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Your Display Name</DialogTitle>
            <DialogDescription>
              Please enter a display name to continue. This will be visible to other users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Display Name"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 