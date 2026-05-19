// utils/jwtUtils.js
// Single helper to generate a signed JWT.
// Keeping this out of the controller keeps signing logic in one place —
// if you ever change the payload shape, you change it here only.

import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Signs and returns a JWT for the given user document.
 *
 * Payload contains:
 *   id      — user's MongoDB _id (used by protect middleware to re-fetch the user)
 *   isAdmin — lets the client know role without an extra API call
 *
 * @param {import("mongoose").Document} user
 * @returns {string} signed JWT
 */
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

export default signToken;
