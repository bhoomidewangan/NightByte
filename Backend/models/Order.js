// models/Order.js
// Created when a customer confirms their cart.
// Items are snapshotted (name + price copied from cart) so historical orders
// are never affected by future menu edits.
//
// Status flows strictly forward:
//   pending → accepted → preparing → prepared → out_for_delivery → delivered
// The owner cannot skip steps or go backwards.

import mongoose from "mongoose";

// Valid statuses and their allowed next state
// Used in orderController to validate status transitions
export const STATUS_FLOW = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "prepared",
  prepared: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null, // terminal state
};

export const ALL_STATUSES = Object.keys(STATUS_FLOW);

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      // Not required — item might be deleted from menu later,
      // but the order snapshot still holds the details below.
    },

    // Snapshot fields — source of truth for this order's line items
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Snapshot of customer's phone at order time
    // Useful for WhatsApp notifications without extra DB lookup
    customerPhone: {
      type: String,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },

    totalCost: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ALL_STATUSES,
      default: "pending",
    },

    // Stored separately for fast single-field queries
    // Mongoose timestamps gives us createdAt but placedAt makes intent explicit
    placedAt: {
      type: Date,
      default: Date.now,
    },

    // Optional note from the customer (e.g. "no onions please")
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

// Owner fetches orders filtered by status
orderSchema.index({ status: 1 });

// Owner fetches orders filtered by date (most recent first)
orderSchema.index({ placedAt: -1 });

// Owner fetches orders filtered by status AND date
orderSchema.index({ status: 1, placedAt: -1 });

// Customer fetches their own order history
orderSchema.index({ customer: 1, placedAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
