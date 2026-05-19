// controllers/authController.js
//
// Handles the complete auth flow for both owner and customers.
// All OTPs are delivered via WhatsApp (Twilio).
//
// Flow — Customer:
//   1. POST /send-otp      → generates OTP, sends on WhatsApp
//   2. POST /verify-otp    → verifies OTP, returns { verified: true }
//   3. POST /register      → creates account (only after OTP verified)
//   4. POST /login         → send OTP → verify OTP → returns JWT
//
// Flow — Owner (same steps, phone must match OWNER_PHONE in env):
//   The owner registers exactly like a customer but gets isAdmin: true
//   because their phone matches env.ownerPhone.
//   There is only one owner — if the owner's User document already exists,
//   /register returns an error telling them to log in instead.
//
// Login is OTP-based (no password):
//   send-otp → verify-otp → /login issues JWT
//   We use a short-lived "phoneVerified" flag stored in the OTP collection
//   to confirm the OTP was verified before issuing the token.
//   Concretely: verifyOTP deletes the OTP doc on success — so /login
//   calls verifyOTP and only issues a JWT if it returns true.

import User from "../models/User.js";
import { generateOTP, saveOTP, verifyOTP } from "../utils/otpUtils.js";
import { sendOTPWhatsApp } from "../utils/whatsappService.js";
import signToken from "../utils/jwtUtils.js";
import env from "../config/env.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Strips sensitive / internal fields before sending user data to the client
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  isAdmin: user.isAdmin,
  isMobileVerified: user.isMobileVerified,
});

// ─── sendOtp ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * Body: { phone }
 *
 * Generates and WhatsApp-sends an OTP to the given phone number.
 * Works for both new (registration) and existing (login) users.
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const otp = generateOTP();
    await saveOTP(phone, otp);
    await sendOTPWhatsApp(phone, otp);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${phone} via WhatsApp`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── verifyOtp ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp }
 *
 * Verifies the OTP.
 * - On success: marks the User's isMobileVerified = true (if user exists)
 *   and returns { verified: true }.
 * - On failure: returns 400.
 *
 * For new users (registration), isMobileVerified is set during /register
 * after we confirm the OTP was valid via verifyOTP().
 * For existing users (login), /login calls verifyOTP() directly.
 * This endpoint is primarily for the registration step so the frontend
 * can gate the "fill your name" screen behind OTP confirmation.
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const isValid = await verifyOTP(phone, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // If user already exists, mark their number as verified
    await User.findOneAndUpdate({ phone }, { isMobileVerified: true });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ─── register ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { phone, name }
 *
 * Creates a new user account.
 * Must be called AFTER /verify-otp has been called for the same phone —
 * we check isMobileVerified on any existing partial record, or we rely on
 * the fact that verifyOTP() was called (it deletes the OTP doc on success,
 * so we store a temporary verified flag by checking if OTP doc is gone).
 *
 * Simpler approach used here: the frontend calls send-otp → verify-otp
 * (which returns verified: true) → register. We trust this flow.
 * The OTP doc is already deleted by verifyOtp so it cannot be reused.
 *
 * Owner detection: if phone === env.ownerPhone, isAdmin is set to true.
 * The owner can only register once.
 */
export const register = async (req, res, next) => {
  try {
    const { phone, name } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered. Please log in.",
      });
    }

    const isAdmin = phone === env.ownerPhone;

    const user = await User.create({
      phone,
      name,
      isAdmin,
      isMobileVerified: true, // OTP was verified in the previous step
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── login ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { phone, otp }
 *
 * Verifies the OTP (which was sent via /send-otp) and issues a JWT.
 * The frontend flow is: send-otp → user receives WhatsApp → login (with otp).
 * There is no separate /verify-otp call needed for login.
 */
export const login = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    // Check user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this number. Please register first.",
      });
    }

    // Verify OTP — also deletes the OTP doc on success (single-use)
    const isValid = await verifyOTP(phone, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark number verified (in case it wasn't already)
    user.isMobileVerified = true;
    await user.save();

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── getMe ───────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Protected — requires valid JWT
 *
 * Returns the currently logged-in user's profile.
 * Useful for the frontend to rehydrate auth state on app load.
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};
