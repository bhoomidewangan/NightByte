// controllers/menuController.js
//
// Owner routes (admin only):
//   POST   /api/menu           — add a new item
//   PUT    /api/menu/:itemId   — update item details
//   PATCH  /api/menu/:itemId/toggle — toggle availability
//   DELETE /api/menu/:itemId   — delete item
//
// Public routes:
//   GET    /api/menu           — fetch all available items (customers)
//   GET    /api/menu/all       — fetch all items including unavailable (admin)

import MenuItem from "../models/MenuItem.js";

// ─── getMenu ─────────────────────────────────────────────────────────────────

/**
 * GET /api/menu
 * Public — returns only available items, grouped by category.
 * This is what customers see.
 */
export const getMenu = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({
      category: 1,
      name: 1,
    });

    // Group by category for convenient frontend rendering
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    res.status(200).json({ success: true, menu: grouped });
  } catch (error) {
    next(error);
  }
};

// ─── getAllItems ──────────────────────────────────────────────────────────────

/**
 * GET /api/menu/all
 * Protected — admin only
 * Returns ALL items including unavailable ones so the owner
 * can see and manage the full menu.
 */
export const getAllItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// ─── addItem ─────────────────────────────────────────────────────────────────

/**
 * POST /api/menu
 * Protected — admin only
 */
export const addItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// ─── updateItem ──────────────────────────────────────────────────────────────

/**
 * PUT /api/menu/:itemId
 * Protected — admin only
 * Updates name, description, price, category, or imageUrl.
 * Use PATCH /:itemId/toggle to flip availability.
 */
export const updateItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    const item = await MenuItem.findByIdAndUpdate(
      req.params.itemId,
      { name, description, price, category, imageUrl },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// ─── toggleAvailability ──────────────────────────────────────────────────────

/**
 * PATCH /api/menu/:itemId/toggle
 * Protected — admin only
 * Flips isAvailable — hides/shows item without deleting it.
 */
export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      success: true,
      message: `${item.name} is now ${item.isAvailable ? "available" : "unavailable"}`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// ─── deleteItem ──────────────────────────────────────────────────────────────

/**
 * DELETE /api/menu/:itemId
 * Protected — admin only
 * Hard deletes the item. For soft-hiding use toggleAvailability instead.
 */
export const deleteItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, message: `${item.name} deleted` });
  } catch (error) {
    next(error);
  }
};
