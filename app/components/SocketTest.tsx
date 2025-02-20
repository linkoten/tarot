"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import socket from "../socket";
import { fetchPartieData, selectPartie } from "@/lib/features/partieSlice";

export default function SocketTest({ roomId }: { roomId: number }) {
  const dispatch = useAppDispatch();

  const [isConnected, setIsConnected] = useState(false);
  // const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ userId: string; message: string }>
  >([]);
  const currentPartie = useAppSelector(selectPartie);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNewMessage(data: { userId: string; message: string }) {
      setMessages((prevMessages) => [...prevMessages, data]);
    }

    function onUserJoined(data: { userId: string; roomId: number }) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId: data.userId, message: "joined the room" },
      ]);
    }

    function onUserLeft(data: { userId: string; roomId: number }) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId: data.userId, message: "left the room" },
      ]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("newMessage", onNewMessage);
    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);
    /*socket.on("newPlayerAdded", onNewPlayerAdded);
    socket.on("newContractAdded", onNewContractAdded);
    socket.on("newExchangeChien", onNewExchangeChien);
    socket.on("newCardPlayed", onNewCardPlayed); */

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newMessage", onNewMessage);
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
      /*  socket.off("newPlayerAdded", onNewPlayerAdded);
      socket.off("newContractAdded", onNewContractAdded);
      socket.off("newExchangeChien", onNewExchangeChien);
      socket.off("newCardPlayed", onNewCardPlayed); */
    };
  }, []);

  const joinRoom = () => {
    if (roomId) {
      socket.emit("joinRoom", roomId);
      console.log("Joining room:", roomId);
    }
  };

  const leaveRoom = () => {
    if (roomId) {
      socket.emit("leaveRoom", roomId);
      console.log("Leaving room:", roomId);
      // setRoomId("");
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (roomId && message) {
      socket.emit("sendMessage", { roomId, message });
      console.log("Sending message:", message, "to room:", roomId);
      setMessage("");
    }
  };

  const newPlayer = () => {
    if (roomId) {
      socket.emit("newPlayer", roomId);
      console.log("Nouveau Joueur:", roomId);
      dispatch(fetchPartieData(roomId)).unwrap();
    }
  };

  useEffect(() => {
    socket.on("newPlayerAdded", (data) => {
      console.log("New Player added to the game:", data);
      dispatch(fetchPartieData(data.partieId));
    });

    return () => {
      socket.off("newPlayerAdded");
    };
  }, [dispatch, newPlayer]);

  /* useEffect(() => {
    socket.on("gameStarted", (data) => {
      console.log("Game started:", data);
      // dispatch(fetchPartieData(data.partieId));
    });

    socket.connect();

    return () => {
      socket.off("gameStarted");
    };
  }, [dispatch, startGame]); */

  /* const announceContract = () => {
    if (roomId) {
      socket.emit("newContract", roomId, (response: any) => {
        if (response.success) {
          console.log("Game started successfully:", response.data);
          dispatch(startPartie(roomId)).unwrap();
        } else {
          console.error("Error starting game:", response.error);
        }
      });
    }
  }; */

  if (!currentPartie) {
    console.error("Aucune partie sélectionnée.");
    return;
  }

  return (
    <div className="p-4 hidden">
      <h1 className="text-2xl font-bold mb-4">Socket.IO Room Test</h1>
      <p className="mb-2">Connected: {isConnected ? "Yes" : "No"}</p>
      <div className="mb-4">
        <Button onClick={joinRoom} className="mr-2">
          Join Room
        </Button>
        <Button onClick={leaveRoom} variant="outline">
          Leave Room
        </Button>
      </div>
      {roomId && (
        <div className="mb-4">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
            className="mb-2"
          />
          <Button onClick={sendMessage}>Send Message</Button>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Messages:</h2>
        {messages.map((msg, index) => (
          <p key={index}>
            {msg.userId}: {msg.message}
          </p>
        ))}
      </div>
    </div>
  );
}
