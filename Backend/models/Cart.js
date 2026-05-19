// models/Cart.js
// One cart per customer — identified by their User _id.
// Cart is upserted (created if not exists, updated if exists) on every add/remove.
// Cleared automatically after the customer places an order.
//
// totalCost is stored on the document and recalculated on every mutation
// so the frontend can just read it without summing client-side.

import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    // Snapshot the name and price at the time the item is added.
    // This protects the cart display from being affected if the owner
    // later edits the item's price or name before the order is placed.
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false } // sub-documents don't need their own _id
);

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per customer, enforced at DB level
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    // Kept in sync with items on every mutation.
    // Calculated as: sum of (item.price * item.quantity) for all items.
    totalCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method — recalculates and sets totalCost from current items array.
// Call this after any add/remove operation, then save the document.
cartSchema.methods.recalculateTotal = function () {
  this.totalCost = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
