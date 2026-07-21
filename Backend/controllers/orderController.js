// Customer routes:
//   POST  /api/orders/place      — confirm cart and place order
//   GET   /api/orders/my-orders  — customer's own order history
//
// Owner routes:
//   GET   /api/orders            — all orders, filterable by status and/or date
//   PATCH /api/orders/:orderId/status — advance order to next status
//
// Socket events emitted:
//   new_order            → to "owner_room"       (on placeOrder)
//   order_status_updated → to customer's room    (on updateOrderStatus)

import Order, { STATUS_FLOW } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Cafe from "../models/Cafe.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";
import { statusUpdateMessage } from "../utils/whatsappMessages.js";
import { getIO } from "../config/socket.js";

// ─── placeOrder ──────────────────────────────────────────────────────────────

/**
 * POST /api/orders/place
 * Protected — customer only
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

    // Clear the cart
    cart.items = [];
    cart.totalCost = 0;
    await cart.save();

    // ── Socket: notify owner of new order in real time ──────────────────────
    try {
      const io = getIO();
      // Populate customer name/phone for the owner's dashboard display
      const populatedOrder = await Order.findById(order._id).populate(
        "customer",
        "name phone"
      );
      io.to("owner_room").emit("new_order", populatedOrder);
    } catch (socketErr) {
      // Don't fail the request if socket emit fails
      console.error("[Socket] Failed to emit new_order:", socketErr.message);
    }

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
 * Query params: ?status=preparing  ?date=2025-06-01  or both
 */
export const getOrdersForOwner = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) {
      if (!STATUS_FLOW[status] && status !== "delivered") {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid values: ${Object.keys(STATUS_FLOW).join(", ")}`,
        });
      }
      filter.status = status;
    }

    if (date) {
      const start = new Date(date);
      if (isNaN(start)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD e.g. 2025-06-01",
        });
      }
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
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
 * Advances order to next status automatically from STATUS_FLOW.
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

    // ── Socket: notify customer of status change in real time ───────────────
    try {
      const io = getIO();
      // Emit to the customer's personal room (their user ID)
      io.to(order.customer.toString()).emit("order_status_updated", {
        orderId: order._id,
        status: nextStatus,
        totalCost: order.totalCost,
      });
    } catch (socketErr) {
      console.error("[Socket] Failed to emit order_status_updated:", socketErr.message);
    }

    // ── WhatsApp: notify customer via WhatsApp too ──────────────────────────
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