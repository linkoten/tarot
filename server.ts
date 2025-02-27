import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// next app configuration
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error occurred handling", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

// Socket.IO setup
const io = new Server(server, {
  path: "/api/socket",
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  const joinedRooms = new Set();

  socket.on("joinRoom", (roomId) => {
    if (joinedRooms.has(roomId)) return;

    joinedRooms.add(roomId);
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    console.log("les gens dans la room", joinedRooms);
    io.to(roomId).emit("userJoined", { userId: socket.id, roomId });
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    joinedRooms.delete(roomId);
    console.log(`${socket.id} left room ${roomId}`);
    io.to(roomId).emit("userLeft", { userId: socket.id, roomId });
  });

  socket.on("startGame", (roomId) => {
    console.log("on reçoit les infos de la part du client", roomId);
    io.to(roomId).emit("gameStarted", { partieId: roomId });
  });

  socket.on("preneurDesignated", ({ roomId, preneurId }) => {
    console.log("Preneur designated in room", roomId);
    io.to(roomId).emit("preneurDesignated", { partieId: roomId, preneurId });
  });

  socket.on("newPlayer", ({ userId, userName, partieId }) => {
    io.to(partieId).emit("newPlayerAdded", {
      userId,
      userName,
      partieId,
      message: `${userName} a rejoint la partie !`,
    });
  });

  socket.on("newContract", ({ roomId, userId, userName, contract }) => {
    // Vérifier que toutes les données nécessaires sont présentes
    if (!roomId || !userId || !userName || !contract) {
      console.error("Missing data in newContract event:", {
        roomId,
        userId,
        userName,
        contract,
      });
      return;
    }

    console.log(`New contract ${contract} by ${userName} in room ${roomId}`);
    io.to(roomId).emit("newContractAdded", {
      partieId: roomId,
      userId,
      userName,
      contract,
    });
  });

  socket.on("exchangeChien", (roomId) => {
    console.log("Chien exchanged in room", roomId);
    io.to(roomId).emit("newExchangeChien", { partieId: roomId });
  });

  socket.on("sendMessage", ({ currentUserId, partieId, message }) => {
    console.log(`Message in room ${partieId}:`, message);
    io.to(partieId).emit("newMessage", {
      currentUserId,
      partieId,
      message,
    });
  });

  socket.on("cardPlayed", ({ roomId, playedCard, currentUserId }) => {
    console.log("Card played in room", roomId, playedCard, currentUserId);
    io.to(roomId).emit("newCardPlayed", {
      partieId: roomId,
      playedCard,
      currentUserId,
    });
  });

  socket.on("endOfManche", ({ roomId, mancheNumero }) => {
    console.log(
      "on reçoit les infos de la fin de la manche",
      roomId,
      mancheNumero
    );
    io.to(roomId).emit("announceEndOfManche", {
      partieId: roomId,
      mancheNumero,
    });
  });

  socket.on("nextManche", (roomId) => {
    console.log("on reçoit les infos de la nouvelle manche", roomId);
    io.to(roomId).emit("newMancheAdded", { partieId: roomId });
  });

  socket.on("pliWon", ({ partieId, currentUserId }) => {
    console.log("Pli won in room", partieId);
    io.to(partieId).emit("newPliWon", { partieId, currentUserId });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    joinedRooms.forEach((roomId: any) => {
      io.to(roomId).emit("userLeft", { userId: socket.id, roomId });
    });
    joinedRooms.clear();
  });
});

server.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
