// models/Cafe.js
// Represents the single cafe in this application.
// There will only ever be ONE document in this collection.
// The owner creates it once via the admin setup endpoint,
// and then updates it as needed (toggle ordering, change details).

import mongoose from "mongoose";

const cafeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cafe name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Owner flips this to false to pause incoming orders
    // (e.g. cafe is closed, kitchen is overwhelmed, etc.)
    isOrderingEnabled: {
      type: Boolean,
      default: true,
    },

    // Optional: opening/closing hours displayed to customers
    openingTime: {
      type: String, // e.g. "09:00"
    },

    closingTime: {
      type: String, // e.g. "23:00"
    },
  },
  {
    timestamps: true,
  }
);

const Cafe = mongoose.model("Cafe", cafeSchema);

export default Cafe;
