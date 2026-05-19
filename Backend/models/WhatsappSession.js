// models/WhatsappSession.js
// Tracks the state of a customer's WhatsApp ordering conversation.
//
// When a customer types "Order", they enter a pending session.
// Their next message (the actual order) is parsed and stored here
// as a pendingOrder — waiting for "Confirm" or "Cancel".
//
// Sessions expire after 10 minutes automatically via TTL index
// so stale half-completed orders don't linger.
//
// State machine:
//   (none)           — customer not in any flow
//   AWAITING_ORDER   — customer typed "Order", waiting for them to send items
//   AWAITING_CONFIRM — order parsed and sent to customer for review, waiting for Confirm/Cancel

import mongoose from "mongoose";

const pendingItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const whatsappSessionSchema = new mongoose.Schema(
  {
    // Customer's phone number with country code e.g. +919876543210
    phone: {
      type: String,
      required: true,
      unique: true,
    },

    // Current state of the conversation
    state: {
      type: String,
      enum: ["AWAITING_ORDER", "AWAITING_CONFIRM"],
      required: true,
    },

    // Populated when state is AWAITING_CONFIRM
    // Holds the parsed items before the customer confirms
    pendingItems: {
      type: [pendingItemSchema],
      default: [],
    },

    pendingTotal: {
      type: Number,
      default: 0,
    },

    // TTL — session auto-deleted after 10 minutes of inactivity
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB removes the document when expiresAt is reached
whatsappSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
whatsappSessionSchema.index({ phone: 1 });

const WhatsappSession = mongoose.model("WhatsappSession", whatsappSessionSchema);

export default WhatsappSession;
