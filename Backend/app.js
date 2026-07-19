// app.js
// Sets up the Express application: middleware, routes, and error handling.
// Kept separate from server.js so it can be imported cleanly in tests later.

import express from "express";
import cors from "cors";

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());             // parse application/json bodies
app.use(express.urlencoded({ extended: true })); // parse form bodies

// ─── Health Check ────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
// Routes will be imported and mounted here in the upcoming steps.
// Placeholder structure so the app runs cleanly right now.

import authRoutes from "./routes/authRoutes.js";
import cafeRoutes from "./routes/cafeRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";


app.use("/api/auth", authRoutes);
app.use("/api/cafe", cafeRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/payment", paymentRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Any error passed via next(err) in a controller lands here.
// Must have exactly 4 parameters for Express to recognise it as an error handler.

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  if (err.stack) console.error(err.stack);

  // Mongoose validation errors → 400
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Mongoose duplicate key errors → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  // Default → 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
