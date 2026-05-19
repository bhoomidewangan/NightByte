// middleware/authMiddleware.js
// Two middleware functions used to protect routes:
//
//   protect      — verifies the JWT and attaches req.user
//   requireAdmin — blocks the route if the logged-in user is not the owner/admin
//
// Usage in routes:
//   router.patch("/toggle", protect, requireAdmin, cafeController.toggleOrdering);
//   router.post("/place",   protect, orderController.placeOrder);

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";

// ─── protect ─────────────────────────────────────────────────────────────────

export const protect = async (req, res, next) => {
  try {
    // Expect: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify signature and expiry
    const decoded = jwt.verify(token, env.jwt.secret);

    // Attach the full user document to req so controllers can use it
    // Select out __v; keep isAdmin so requireAdmin can check it
    const user = await User.findById(decoded.id).select("-__v");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws JsonWebTokenError or TokenExpiredError
    // Both are handled by the global error handler in app.js
    next(error);
  }
};

// ─── requireAdmin ─────────────────────────────────────────────────────────────

// Always use AFTER protect — relies on req.user being set
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  next();
};
