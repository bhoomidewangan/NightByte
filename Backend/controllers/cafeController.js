// controllers/cafeController.js
// Manages the single cafe document.
//
// Owner routes:
//   POST   /api/cafe        — create the cafe (one-time setup)
//   PUT    /api/cafe        — update cafe details
//   PATCH  /api/cafe/toggle — enable/disable ordering
//
// Public routes:
//   GET    /api/cafe        — fetch cafe info + ordering status (customers see this)

import Cafe from "../models/Cafe.js";

// ─── getCafe ─────────────────────────────────────────────────────────────────

/**
 * GET /api/cafe
 * Public — customers call this on app load to get cafe info and check
 * whether ordering is currently enabled.
 */
export const getCafe = async (req, res, next) => {
  try {
    const cafe = await Cafe.findOne();

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: "Cafe not set up yet",
      });
    }

    res.status(200).json({ success: true, cafe });
  } catch (error) {
    next(error);
  }
};

// ─── createCafe ──────────────────────────────────────────────────────────────

/**
 * POST /api/cafe
 * Protected — admin only
 * One-time setup. Returns 409 if cafe already exists.
 */
export const createCafe = async (req, res, next) => {
  try {
    const existing = await Cafe.findOne();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Cafe already exists. Use PUT /api/cafe to update details.",
      });
    }

    const { name, description, address, phone, openingTime, closingTime } =
      req.body;

    const cafe = await Cafe.create({
      name,
      description,
      address,
      phone,
      openingTime,
      closingTime,
    });

    res.status(201).json({ success: true, cafe });
  } catch (error) {
    next(error);
  }
};

// ─── updateCafe ──────────────────────────────────────────────────────────────

/**
 * PUT /api/cafe
 * Protected — admin only
 * Updates any cafe detail (name, address, timings, etc.)
 * Does NOT toggle ordering — that has its own endpoint.
 */
export const updateCafe = async (req, res, next) => {
  try {
    const { name, description, address, phone, openingTime, closingTime } =
      req.body;

    const cafe = await Cafe.findOneAndUpdate(
      {},
      { name, description, address, phone, openingTime, closingTime },
      { new: true, runValidators: true }
    );

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: "Cafe not found. Create it first via POST /api/cafe",
      });
    }

    res.status(200).json({ success: true, cafe });
  } catch (error) {
    next(error);
  }
};

// ─── toggleOrdering ──────────────────────────────────────────────────────────

/**
 * PATCH /api/cafe/toggle
 * Protected — admin only
 * Flips isOrderingEnabled between true and false.
 * Owner uses this to open/close the cafe for orders.
 */
export const toggleOrdering = async (req, res, next) => {
  try {
    const cafe = await Cafe.findOne();

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: "Cafe not found",
      });
    }

    cafe.isOrderingEnabled = !cafe.isOrderingEnabled;
    await cafe.save();

    res.status(200).json({
      success: true,
      message: `Ordering is now ${cafe.isOrderingEnabled ? "enabled" : "disabled"}`,
      isOrderingEnabled: cafe.isOrderingEnabled,
    });
  } catch (error) {
    next(error);
  }
};
