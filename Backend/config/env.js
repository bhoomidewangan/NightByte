// config/env.js
// Loads and validates all environment variables at startup.
// The app will crash immediately with a clear message if anything is missing,
// rather than failing silently at runtime.

import dotenv from "dotenv";
dotenv.config();

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_FROM",
  "OWNER_PHONE",
  "CASHFREE_APP_ID",
  "CASHFREE_SECRET_KEY",
  "FRONTEND_URL",
  "BACKEND_URL",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `\n[ENV ERROR] Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
      `Copy .env.example to .env and fill in the values.\n`
  );
  process.exit(1);
}

const env = {
  mongoUri: process.env.MONGO_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10),
    length: parseInt(process.env.OTP_LENGTH || "6", 10),
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
  },

  // The single owner's phone number (with country code, e.g. +919876543210)
  ownerPhone: process.env.OWNER_PHONE,

  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  cashfree: {
    appId: process.env.CASHFREE_APP_ID,
    secretKey: process.env.CASHFREE_SECRET_KEY,
    env: process.env.CASHFREE_ENV || "sandbox", // "sandbox" for test, "production" for live
  },

  frontendUrl: process.env.FRONTEND_URL,
  backendUrl: process.env.BACKEND_URL,
};

export default env;
