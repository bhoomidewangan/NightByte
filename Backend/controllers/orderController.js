// controllers/orderController.js
//
// Customer routes:
//   POST  /api/orders/place      — confirm cart and place order
//   GET   /api/orders/my-orders  — customer's own order history
//
// Owner routes:
//   GET   /api/orders            — all orders, filterable by status and/or date
//   PATCH /api/orders/:orderId/status — advance order to next status

import Order, { STATUS_FLOW } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Cafe from "../models/Cafe.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";
import { statusUpdateMessage } from "../utils/whatsappMessages.js";

// ─── placeOrder ──────────────────────────────────────────────────────────────

/**
 * POST /api/orders/place
 * Protected — customer only
 *
 * - Checks ordering is enabled
 * - Snapshots the cart into a new Order document
 * - Clears the cart after placing
 * - Returns the created order
 */
export const placeOrder = async (req, res, next) => {
  try {
    // Check cafe is accepting orders
    const cafe = await Cafe.findOne();
    if (!cafe || !cafe.isOrderingEnabled) {
      return res.status(403).json({
        success: false,
        message: "Ordering is currently disabled. Please try again later.",
      });
    }

    // Fetch customer's cart
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add items before placing an order.",
      });
    }

    const { note } = req.body;

    // Snapshot cart into order
    // Items already have name + price snapshotted from when they were added to cart
    const order = await Order.create({
      customer: req.user._id,
      customerPhone: req.user.phone,
      items: cart.items.map((i) => ({
        menuItem: i.menuItem,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      totalCost: cart.totalCost,
      note: note || "",
    });

    // Clear the cart after successful order placement
    cart.items = [];
    cart.totalCost = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── getOrdersForOwner ───────────────────────────────────────────────────────

/**
 * GET /api/orders
 * Protected — admin only
 *
 * Query params (all optional):
 *   ?status=preparing
 *   ?date=2025-06-01          (matches orders placed on that calendar date)
 *   ?status=preparing&date=2025-06-01
 *
 * Returns most recent orders first.
 */
export const getOrdersForOwner = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    // Filter by status
    if (status) {
      if (!STATUS_FLOW[status] && status !== "delivered") {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid values: ${Object.keys(STATUS_FLOW).join(", ")}`,
        });
      }
      filter.status = status;
    }

    // Filter by date — match all orders placed on that calendar day
    if (date) {
      const start = new Date(date);
      if (isNaN(start)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD e.g. 2025-06-01",
        });
      }
      const end = new Date(date);
      end.setDate(end.getDate() + 1); // next day midnight

      filter.placedAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate("customer", "name phone")
      .sort({ placedAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// ─── getOrdersForCustomer ────────────────────────────────────────────────────

/**
 * GET /api/orders/my-orders
 * Protected — customer only
 * Returns the logged-in customer's own order history, most recent first.
 */
export const getOrdersForCustomer = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({
      placedAt: -1,
    });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// ─── updateOrderStatus ───────────────────────────────────────────────────────

/**
 * PATCH /api/orders/:orderId/status
 * Protected — admin only
 *
 * Advances the order to the next status in the flow:
 *   pending → accepted → preparing → prepared → out_for_delivery → delivered
 *
 * Owner cannot skip steps or go backwards.
 * The next valid status is determined automatically from STATUS_FLOW —
 * the owner doesn't send a status in the body, they just hit the endpoint
 * and the order moves to the next step.
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const nextStatus = STATUS_FLOW[order.status];

    if (!nextStatus) {
      return res.status(400).json({
        success: false,
        message: `Order is already at the final status: "${order.status}"`,
      });
    }

    order.status = nextStatus;
    await order.save();

    // Notify customer on WhatsApp — fire and forget
    sendWhatsAppMessage(
      order.customerPhone,
      statusUpdateMessage(nextStatus, order.totalCost)
    ).catch((err) =>
      console.error("[WhatsApp] Failed to send status update:", err.message)
    );


    res.status(200).json({
      success: true,
      message: `Order status updated to "${nextStatus}"`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
