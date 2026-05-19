// utils/otpUtils.js
// Pure utility functions for OTP lifecycle:
//   generate → hash → store → verify → cleanup

import crypto from "crypto";
import bcrypt from "bcryptjs";
import OTP from "../models/OTP.js";
import env from "../config/env.js";

// ─── Generate ────────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random numeric OTP of the configured length.
 * Uses crypto.randomInt (not Math.random) for proper randomness.
 *
 * @returns {string} e.g. "483920"
 */
export const generateOTP = () => {
  const max = Math.pow(10, env.otp.length); // 10^6 = 1000000
  const min = Math.pow(10, env.otp.length - 1); // 10^5 = 100000
  // randomInt(min, max) gives a number in [min, max)
  return crypto.randomInt(min, max).toString();
};

// ─── Hash ────────────────────────────────────────────────────────────────────

/**
 * Hashes a plain OTP before storing.
 * bcrypt salt rounds at 10 is the standard balance of speed vs security for OTPs.
 *
 * @param {string} plainOtp
 * @returns {Promise<string>} hashed OTP
 */
export const hashOTP = async (plainOtp) => {
  return await bcrypt.hash(plainOtp, 10);
};

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * Deletes any existing OTP for this phone number, then saves the new hashed one.
 * This ensures a user always has at most one active OTP at a time,
 * and "resend OTP" always invalidates the previous code.
 *
 * @param {string} phone - with country code, e.g. "+919876543210"
 * @param {string} plainOtp - the raw code (before hashing)
 * @returns {Promise<void>}
 */
export const saveOTP = async (phone, plainOtp) => {
  const hashed = await hashOTP(plainOtp);

  // Delete previous OTP for this phone (if any) before creating the new one
  await OTP.deleteMany({ phone });

  await OTP.create({
    phone,
    code: hashed,
    expiresAt: new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000),
  });
};

// ─── Verify ──────────────────────────────────────────────────────────────────

/**
 * Verifies a plain OTP against the stored hash for a given phone.
 * Returns false if no OTP exists, if it's expired (TTL index handles deletion
 * but there's a ~60s window where MongoDB hasn't cleaned it yet), or if the
 * code doesn't match.
 *
 * On success, deletes the OTP so it cannot be reused.
 *
 * @param {string} phone
 * @param {string} plainOtp - the code the user submitted
 * @returns {Promise<boolean>}
 */
export const verifyOTP = async (phone, plainOtp) => {
  const otpDoc = await OTP.findOne({ phone });

  if (!otpDoc) return false; // No OTP found or already expired + cleaned up

  // Manual expiry check for the ~60s TTL window
  if (otpDoc.expiresAt < new Date()) {
    await OTP.deleteMany({ phone });
    return false;
  }

  const isMatch = await bcrypt.compare(plainOtp, otpDoc.code);

  if (isMatch) {
    // Delete immediately after successful verification — OTP is single-use
    await OTP.deleteMany({ phone });
  }

  return isMatch;
};
