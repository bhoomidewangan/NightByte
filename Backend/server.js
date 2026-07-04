// server.js
// Entry point — updated to support Socket.io.
// Key change from before: instead of app.listen() directly,
// we create an http.Server from app and pass it to both
// Socket.io (initSocket) and server.listen().

import http from "http";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./config/socket.js";

const startServer = async () => {
  // Connect DB first — crash on failure
  await connectDB();

  // Wrap Express app in a raw Node HTTP server
  // Socket.io needs the HTTP server, not the Express app
  const httpServer = http.createServer(app);

  // Initialise Socket.io on the HTTP server
  initSocket(httpServer);

  // Listen on the HTTP server (not app.listen)
  httpServer.listen(env.port, () => {
    console.log(`[SERVER] NightByte backend running on port ${env.port}`);
    console.log(`[SERVER] Environment: ${env.nodeEnv}`);
    console.log(`[SERVER] Health check: http://localhost:${env.port}/health`);
  });
};

startServer();