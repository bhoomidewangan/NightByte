// routes/authRoutes.js
// Mounts at /api/auth (see app.js)
//
// Public routes (no JWT needed):
//   POST /send-otp    — send OTP to a phone number
//   POST /verify-otp  — verify OTP (used during registration flow)
//   POST /register    — create a new account
//   POST /login       — verify OTP + issue JWT
//
// Protected routes (JWT required):
//   GET  /me          — get current user profile

import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

// ─── Validation chains ───────────────────────────────────────────────────────

// Reused across routes that need a phone number
const phoneValidation = body("phone")
  .trim()
  .notEmpty().withMessage("Phone number is required")
  .matches(/^\+[1-9]\d{7,14}$/)
  .withMessage("Phone must include country code, e.g. +919876543210");

const otpValidation = body("otp")
  .trim()
  .notEmpty().withMessage("OTP is required")
  .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
  .isNumeric().withMessage("OTP must contain only numbers");

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/auth/send-otp
router.post(
  "/send-otp",
  phoneValidation,
  validateRequest,
  authController.sendOtp
);

// POST /api/auth/verify-otp
router.post(
  "/verify-otp",
  phoneValidation,
  otpValidation,
  validateRequest,
  authController.verifyOtp
);

// POST /api/auth/register
router.post(
  "/register",
  phoneValidation,
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  validateRequest,
  authController.register
);

// POST /api/auth/login
router.post(
  "/login",
  phoneValidation,
  otpValidation,
  validateRequest,
  authController.login
);

// GET /api/auth/me  — protected
router.get("/me", protect, authController.getMe);

export default router;
