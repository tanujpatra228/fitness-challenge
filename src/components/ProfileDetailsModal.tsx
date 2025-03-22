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
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { getAvatarList } from "@/src/lib/userAvatars"
import { updateProfile } from "@/src/services/profile.services"
import { useMutation } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { toast } from "sonner"

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ProfileDetailsModal({ isOpen, onClose, userId }: ProfileDetailsModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");

  const avatars = useMemo(() => getAvatarList(gender, 65), [gender]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => updateProfile(userId, displayName, gender, selectedAvatarId || avatars[0].id),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    if (!selectedAvatarId) {
      toast.error("Please select an avatar");
      return;
    }
    await updateProfileMutation.mutateAsync();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Your Profile Details</DialogTitle>
            <DialogDescription>
              Please enter your details to continue. This will be visible to other users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value: 'male' | 'female') => {
                  setGender(value);
                  setSelectedAvatarId(""); // Reset avatar selection when gender changes
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Select Avatar</Label>
              <div className="flex justify-start items-center gap-2">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatarId === avatar.id
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={avatar.src}
                      alt={`Avatar ${avatar.id}`}
                      className="w-16 h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 