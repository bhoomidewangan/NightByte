// utils/whatsappService.js
// Wraps the Twilio SDK to send WhatsApp messages.
// All controllers talk to this file — never to Twilio directly —
// so swapping providers later only requires changes here.

import twilio from "twilio";
import env from "../config/env.js";

// Twilio client is initialised once and reused
const client = twilio(env.twilio.accountSid, env.twilio.authToken);

/**
 * Sends an OTP to a phone number via WhatsApp using Twilio.
 *
 * In development with the Twilio Sandbox:
 *   - The recipient must have joined the sandbox first by sending
 *     "join <sandbox-keyword>" to +14155238886 on WhatsApp.
 *   - You can find your sandbox keyword at console.twilio.com → Messaging → Try it out → WhatsApp
 *
 * In production:
 *   - Use an approved WhatsApp Business message template.
 *   - Replace TWILIO_WHATSAPP_FROM with your approved number.
 *
 * @param {string} toPhone - recipient phone with country code, e.g. "+919876543210"
 * @param {string} otp     - the plain OTP string, e.g. "483920"
 * @returns {Promise<void>}
 * @throws Will throw if Twilio rejects the request (logged by the caller)
 */
export const sendOTPWhatsApp = async (toPhone, otp) => {
  const body =
    `Your NightByte verification code is: *${otp}*\n\n` +
    `This code expires in ${env.otp.expiryMinutes} minutes. Do not share it with anyone.`;

  await client.messages.create({
    from: env.twilio.whatsappFrom,       // e.g. "whatsapp:+14155238886"
    to: `whatsapp:${toPhone}`,           // e.g. "whatsapp:+919876543210"
    body,
  });
};

/**
 * Sends a generic WhatsApp text message.
 * Will be used later for order status notification messages.
 *
 * @param {string} toPhone - recipient phone with country code
 * @param {string} message - plain text message body
 * @returns {Promise<void>}
 */
export const sendWhatsAppMessage = async (toPhone, message) => {
  await client.messages.create({
    from: env.twilio.whatsappFrom,
    to: `whatsapp:${toPhone}`,
    body: message,
  });
};
