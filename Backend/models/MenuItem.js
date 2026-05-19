// models/MenuItem.js
// Each document is one item on the cafe's menu.
// The owner can add, edit, toggle availability, or delete items.
// Customers only see items where isAvailable: true.

import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // e.g. "Starters", "Main Course", "Beverages", "Desserts"
    // Useful for grouping the menu on the frontend
    category: {
      type: String,
      trim: true,
      default: "General",
    },

    // Owner can hide an item without deleting it
    // (e.g. seasonal item, out of stock temporarily)
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Optional image URL (owner can upload via a separate service later)
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast category filtering when fetching the menu
menuItemSchema.index({ category: 1, isAvailable: 1 });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
