// config/socket.js
// Initialises Socket.io on the HTTP server and exports the `io` instance
// so any controller can emit events without importing socket.io again.
//
// Room strategy:
//   - Owner joins "owner_room" on connect (if isAdmin: true in JWT)
//   - Customer joins their own user ID as a room e.g. "64f3a..."
//
// This means:
//   - New order   → io.to("owner_room").emit("new_order", order)
//   - Status update → io.to(customerId).emit("order_status_updated", order)

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "./env.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // tighten this to your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  // ── Auth middleware for every socket connection ──────────────────────────
  // Client must pass token in handshake: socket = io(URL, { auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      socket.user = decoded; // { id, isAdmin }
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ── On connection ─────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const { id, isAdmin } = socket.user;

    if (isAdmin) {
      // Owner joins the owner room — receives all new order events
      socket.join("owner_room");
      console.log(`[Socket] Owner connected: ${socket.id}`);
    } else {
      // Customer joins their own room — receives their status updates only
      socket.join(id);
      console.log(`[Socket] Customer connected: ${id}`);
    }

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  console.log("[Socket] Socket.io initialised");
  return io;
};

// Call this in controllers to emit events
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialised. Call initSocket first.");
  return io;
};