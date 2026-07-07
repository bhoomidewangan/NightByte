// src/socket.js
// Shared Socket.io client instance.
// Import getSocket() anywhere you need to listen to or emit events.
//
// Usage:
//   import { connectSocket, getSocket, disconnectSocket } from "../socket";
//   connectSocket(token);   // call once after login
//   getSocket();            // get the instance anywhere
//   disconnectSocket();     // call on logout

import { io } from "socket.io-client";

let socket = null;

const BACKEND_URL = "https://nightbyte-1.onrender.com";

/**
 * Creates and connects the socket with the JWT token.
 * Call this right after the user logs in.
 * @param {string} token - JWT from localStorage
 */
export const connectSocket = (token) => {
  // If already connected with a live socket, do nothing
  if (socket?.connected) return;
  
  // If socket exists but is disconnected, clean it up first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });
};

/**
 * Returns the active socket instance.
 * Returns null if not connected yet.
 */
export const getSocket = () => socket;

/**
 * Disconnects and clears the socket.
 * Call this on logout.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};




