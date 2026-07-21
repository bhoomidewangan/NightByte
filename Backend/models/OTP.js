// models/OTP.js
// Stores hashed OTP codes temporarily.
// MongoDB's TTL index deletes documents automatically when expiresAt is reached,
// so you never need to manually clean up expired OTPs.

import mongoose from "mongoose";
import env from "../config/env.js";

const otpSchema = new mongoose.Schema({
  // The phone number this OTP was sent to (with country code)
  phone: {
    type: String,
    required: true,
    trim: true,
  },

  // The OTP code is stored as a bcrypt hash — never plain text.
  // Comparison is done with bcrypt.compare() in otpUtils.js.
  code: {
    type: String,
    required: true,
  },

  // MongoDB TTL index watches this field.
  // The document is automatically deleted after this timestamp passes.
  expiresAt: {
    type: Date,
    required: true,
    // Default: now + OTP_EXPIRY_MINUTES from env
    default: () =>
      new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000),
  },
});

// TTL index — MongoDB background job checks this every 60 seconds.
// Documents are removed when the current time passes expiresAt.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
