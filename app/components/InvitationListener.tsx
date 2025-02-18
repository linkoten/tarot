"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  acceptInvitation,
  getPendingInvitations,
  refuseInvitation,
} from "@/lib/actions/invitePlayers";
import socket from "../socket";
import { fetchPartieData } from "@/lib/features/partieSlice";
import { useAppDispatch } from "@/lib/hooks";

export function InvitationListener({
  userId,
  userName,
}: {
  userId: string;
  userName: string | null;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const joinRoom = (response: any) => {
    if (response.invitation?.partieId) {
      socket.emit("joinRoom", response.invitation?.partieId);
      console.log("Joining room 2:", response.invitation?.partieId);
    }
  };

  useEffect(() => {
    function onUserJoined(data: { userId: string; roomId: number }) {
      dispatch(fetchPartieData(data.roomId));
    }

    socket.on("userJoined", onUserJoined);
    socket.connect();

    return () => {
      socket.off("userJoined", onUserJoined);
    };
  }, []);

  useEffect(() => {
    const handleNewPlayerAdded = (data: {
      userId: string;
      userName: string;
      partieId: number;
    }) => {
      console.log("New player added:", data);
      dispatch(fetchPartieData(data.partieId));
    };

    socket.on("newPlayerAdded", handleNewPlayerAdded);

    return () => {
      socket.off("newPlayerAdded", handleNewPlayerAdded);
    };
  }, [acceptInvitation]);

  useEffect(() => {
    const checkInvitations = async () => {
      const result = await getPendingInvitations(userId);

      if (result.success && result.invitations.length > 0) {
        result.invitations.forEach((invitation) => {
          toast({
            title: "Nouvelle invitation",
            description: `Vous êtes invité à rejoindre une partie.`,
            action: (
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    const response = await acceptInvitation(
                      invitation.id,
                      userId,
                      userName
                    );
                    if (response.success) {
                      socket.emit("newPlayer", {
                        userId,
                        userName,
                        partieId: response.invitation?.partieId,
                      });

                      router.push(
                        `/dashboard/partie/${response.invitation?.partieId}`
                      );

                      joinRoom(response);
                    }
                  }}
                >
                  Accepter
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    await refuseInvitation(invitation.id, userId);
                  }}
                >
                  Refuser
                </button>
              </div>
            ),
          });
        });
      }
    };

    checkInvitations();
    // Optionally poll every X seconds:
    const intervalId = setInterval(checkInvitations, 10000);

    return () => clearInterval(intervalId);
  }, [userId, toast, router]);

  return null;
}
