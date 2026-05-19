// config/db.js
// Establishes MongoDB connection via Mongoose.
// Called once at server startup. Exits the process on failure so
// the app never starts in a broken state.

import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      // These are the recommended options for Mongoose 8+
      // (useNewUrlParser and useUnifiedTopology are no longer needed)
    });

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);

    // Helpful in dev — log every query Mongoose sends
    if (env.isDev) {
      mongoose.set("debug", false); // flip to true to log raw queries
    }
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1); // Crash immediately — nothing works without the DB
  }
};

// Graceful shutdown: close the connection when the process is killed
// so MongoDB doesn't hold open connections unnecessarily
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("[DB] Connection closed due to app termination");
  process.exit(0);
});

export default connectDB;
