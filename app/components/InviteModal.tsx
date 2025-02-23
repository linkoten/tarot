// components/InviteModal.tsx
"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { invitePlayer } from "@/lib/actions/invitePlayers";
import Image from "next/image";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUsers: User[];
  partieId: number;
  seatIndex: number;
  currentUserId: string;
}

export function InviteModal({
  isOpen,
  onClose,
  onlineUsers,
  partieId,
  seatIndex,
  currentUserId,
}: InviteModalProps) {
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (invitedUserId: string) => {
    setInviting(true);
    try {
      if (!currentUserId) {
        throw new Error("User not authenticated.");
      }

      const result = await invitePlayer(
        partieId,
        seatIndex,
        invitedUserId,
        currentUserId // ID de l'utilisateur invitant
      );

      if (!result.success) {
        throw new Error(result.error || "Unknown error occurred");
      }

      toast({
        title: "Invitation envoyée",
        description: "Le joueur a été invité à rejoindre la partie.",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation.",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un joueur</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={user.image as string}
                  alt={user.name || "User"}
                  className="w-10 h-10 rounded-full"
                  height={40}
                  width={40}
                />
                <span>{user.name}</span>
              </div>
              <Button
                onClick={() => handleInvite(user.id || "")}
                disabled={inviting}
              >
                Inviter 📨
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
