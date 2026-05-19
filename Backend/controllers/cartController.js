// controllers/cartController.js
//
// Customer routes (protected — customer JWT required):
//   GET    /api/cart          — fetch current cart with total
//   POST   /api/cart/add      — add item or increment quantity
//   POST   /api/cart/remove   — decrement quantity or remove item
//   DELETE /api/cart          — clear entire cart
//
// Key behaviors:
//   - One cart per customer (upserted, never duplicated)
//   - Item name and price are snapshotted from MenuItem at add time
//     so price changes don't affect what's already in the cart
//   - totalCost is recalculated and saved on every mutation
//   - Ordering must be enabled to add items (checked against Cafe doc)

import Cart from "../models/Cart.js";
import MenuItem from "../models/MenuItem.js";
import Cafe from "../models/Cafe.js";

// ─── getCart ─────────────────────────────────────────────────────────────────

/**
 * GET /api/cart
 * Returns the customer's current cart.
 * If no cart exists yet, returns an empty cart structure.
 */
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], totalCost: 0 },
      });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ─── addToCart ───────────────────────────────────────────────────────────────

/**
 * POST /api/cart/add
 * Body: { menuItemId, quantity }
 *
 * - Checks ordering is enabled
 * - Checks item exists and is available
 * - If item already in cart: increments quantity
 * - If item not in cart: pushes new entry with snapshotted name + price
 * - Recalculates totalCost and saves
 */
export const addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    // Check cafe is accepting orders
    const cafe = await Cafe.findOne();
    if (!cafe || !cafe.isOrderingEnabled) {
      return res.status(403).json({
        success: false,
        message: "Ordering is currently disabled. Please try again later.",
      });
    }

    // Check item exists and is available
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    if (!menuItem.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `${menuItem.name} is currently unavailable`,
      });
    }

    // Find or initialise cart for this customer
    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (i) => i.menuItem.toString() === menuItemId
    );

    if (existingIndex > -1) {
      // Increment quantity
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      // Push new item — snapshot name and price at this moment
      cart.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: Number(quantity),
      });
    }

    cart.recalculateTotal();
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ─── removeFromCart ──────────────────────────────────────────────────────────

/**
 * POST /api/cart/remove
 * Body: { menuItemId, quantity }
 *
 * - Decrements quantity by the given amount
 * - If quantity reaches 0 or below, removes the item entirely
 * - Recalculates totalCost and saves
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ success: false, message: "Cart is empty" });
    }

    const existingIndex = cart.items.findIndex(
      (i) => i.menuItem.toString() === menuItemId
    );

    if (existingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items[existingIndex].quantity -= Number(quantity);

    if (cart.items[existingIndex].quantity <= 0) {
      // Remove item entirely
      cart.items.splice(existingIndex, 1);
    }

    cart.recalculateTotal();
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// ─── clearCart ───────────────────────────────────────────────────────────────

/**
 * DELETE /api/cart
 * Wipes the customer's cart completely.
 * Called internally by orderController after order is placed.
 * Also exposed as an endpoint so the customer can clear manually.
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(200).json({ success: true, message: "Cart already empty" });
    }

    cart.items = [];
    cart.totalCost = 0;
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
