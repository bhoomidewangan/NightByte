// models/User.js
// Single model for both the owner/admin and customers.
// The owner is identified by isAdmin: true (set automatically when their
// phone number matches OWNER_PHONE from env). Customers are everyone else.

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      // Customers provide their name at registration.
      // Not required at schema level because the owner might not set one.
    },

    // Phone stored with country code, e.g. +919876543210
    // This is the primary identifier for all users — used for OTP, login, and WhatsApp.
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    // True only for the single cafe owner/admin.
    // Set during registration when phone === process.env.OWNER_PHONE.
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Phone OTP is the only verification method (delivered via WhatsApp).
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// // Index on phone is already created by unique: true above.
// // Adding an explicit one here for query planning clarity.
// userSchema.index({ phone: 1 });

const User = mongoose.model("User", userSchema);

export default User;
