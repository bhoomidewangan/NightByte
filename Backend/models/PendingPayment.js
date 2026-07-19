// models/PendingPayment.js
// Stores a payment intent between initiation and verification.
// Created when the customer clicks "Pay" and deleted after:
//   - Payment is verified successfully (order created)
//   - Payment fails (cleaned up in verify controller)
//   - 30 minutes pass (TTL index auto-deletes)

import mongoose from "mongoose";

const pendingItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const pendingPaymentSchema = new mongoose.Schema(
  {
    // The unique order ID we sent to Cashfree
    tempOrderId: { type: String, required: true, unique: true },

    // Cashfree's internal order ID (for reference)
    cfOrderId: { type: String },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerPhone: { type: String, required: true },

    amount: { type: Number, required: true },

    // Cart items snapshotted at payment initiation
    items: [pendingItemSchema],

    note: { type: String, default: "" },

    // "web" = came from cart page, "whatsapp" = came from WhatsApp bot
    source: {
      type: String,
      enum: ["web", "whatsapp"],
      required: true,
    },


    // Auto-delete after 30 minutes if payment never completes
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// TTL index
pendingPaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
pendingPaymentSchema.index({ tempOrderId: 1 });

const PendingPayment = mongoose.model("PendingPayment", pendingPaymentSchema);

export default PendingPayment;