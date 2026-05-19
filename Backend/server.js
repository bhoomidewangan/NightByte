// server.js
// Application entry point.
// Order of operations:
//   1. Validate env vars (env.js import does this at module load time)
//   2. Connect to MongoDB
//   3. Start the Express server

import env from "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js";

const startServer = async () => {
  // Step 2: Connect DB — crashes the process on failure (see db.js)
  await connectDB();

  // Step 3: Start listening
  app.listen(env.port, () => {
    console.log(`[SERVER] NightByte backend running on port ${env.port}`);
    console.log(`[SERVER] Environment: ${env.nodeEnv}`);
    console.log(`[SERVER] Health check: http://localhost:${env.port}/health`);
  });
};

startServer();
