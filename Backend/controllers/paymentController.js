// controllers/paymentController.js
//
// Handles the payment flow for web orders.
//
// Flow:
//   1. Customer confirms cart → POST /api/payment/initiate
//      → Creates a Cashfree order, returns paymentSessionId to frontend
//   2. Frontend opens Cashfree checkout with paymentSessionId
//   3. Customer pays → Cashfree redirects to /payment/status?order_id=xxx
//   4. Frontend calls POST /api/payment/verify with the orderId
//      → Backend verifies with Cashfree, creates Order in DB if paid
//      → Clears cart, emits socket event to owner
//
// A pending payment record is stored in the DB using a temp order ID
// so we can match the verification back to the correct cart.

import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Cafe from "../models/Cafe.js";
import User from "../models/User.js";
import PendingPayment from "../models/PendingPayment.js";
import { createCashfreeOrder, verifyCashfreePayment } from "../utils/cashfreeservice.js";
import { getIO } from "../config/socket.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";
import { orderConfirmedMessage, statusUpdateMessage } from "../utils/whatsappMessages.js";
import env from "../config/env.js";

// ─── initiate ────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/initiate
 * Protected — customer only
 *
 * - Checks ordering is enabled
 * - Checks cart is not empty
 * - Creates a Cashfree payment order
 * - Saves a PendingPayment record to match verification later
 * - Returns paymentSessionId to frontend
 */
export const initiate = async (req, res, next) => {
  try {
    const cafe = await Cafe.findOne();
    if (!cafe || !cafe.isOrderingEnabled) {
      return res.status(403).json({
        success: false,
        message: "Ordering is currently disabled.",
      });
    }

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // Generate a unique order ID for Cashfree
    // Format: NB-<timestamp>-<random> to keep it readable
    const tempOrderId = `NB-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const { paymentSessionId, cfOrderId } = await createCashfreeOrder({
      orderId: tempOrderId,
      amount: cart.totalCost,
      customerPhone: req.user.phone,
      customerName: req.user.name || "Customer",
      returnUrl: `${process.env.FRONTEND_URL}/payment/status?order_id=${tempOrderId}`,
    });

    // Save pending payment so we can verify and create the order later
    await PendingPayment.create({
      tempOrderId,
      cfOrderId,
      customer: req.user._id,
      customerPhone: req.user.phone,
      amount: cart.totalCost,
      source: "web",
      // Snapshot cart items at payment initiation time
      items: cart.items.map((i) => ({
        menuItem: i.menuItem,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      note: req.body.note || "",
    });

    res.status(200).json({
      success: true,
      paymentSessionId,
      tempOrderId,
      amount: cart.totalCost,
    });
  } catch (error) {
    next(error);
  }
};

// ─── verify ──────────────────────────────────────────────────────────────────

/**
 * POST /api/payment/verify
 * Protected — customer only
 * Body: { orderId } — the tempOrderId from initiate
 *
 * - Verifies payment status with Cashfree
 * - If PAID: creates Order in DB, clears cart, notifies owner via socket
 * - If not paid: deletes PendingPayment, returns failure
 */
export const verify = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    // Find the pending payment record
    const pending = await PendingPayment.findOne({ tempOrderId: orderId });
    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found. It may have expired.",
      });
    }

    // Verify with Cashfree
    const { isPaid, status } = await verifyCashfreePayment(orderId);

    if (!isPaid) {
      // Payment failed or pending — clean up and return failure
      await PendingPayment.deleteOne({ tempOrderId: orderId });
      return res.status(400).json({
        success: false,
        message: `Payment ${status.toLowerCase()}. Please try again.`,
        status,
      });
    }

    // Payment confirmed — create the actual order
    const order = await Order.create({
      customer: pending.customer,
      customerPhone: pending.customerPhone,
      items: pending.items,
      totalCost: pending.amount,
      note: pending.note,
      paymentId: orderId,
      paymentStatus: "paid",
    });

    // Clear the cart
    const cart = await Cart.findOne({ customer: pending.customer });
    if (cart) {
      cart.items = [];
      cart.totalCost = 0;
      await cart.save();
    }

    // Clean up pending payment record
    await PendingPayment.deleteOne({ tempOrderId: orderId });

    // Notify owner via socket
    try {
      const io = getIO();
      const populatedOrder = await Order.findById(order._id).populate(
        "customer",
        "name phone"
      );
      io.to("owner_room").emit("new_order", populatedOrder);
    } catch (socketErr) {
      console.error("[Socket] Failed to emit new_order:", socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Payment successful. Order placed.",
      order,
    });
  } catch (error) {
    next(error);
  }
};


// ─── webhook (WhatsApp + web fallback) ───────────────────────────────────────

/**
 * POST /api/payment/webhook
 * Called by Cashfree automatically when a payment is completed.
 * Handles both web and WhatsApp payment confirmations.
 *
 * For WhatsApp orders:
 *   - Creates the Order in DB
 *   - Sends WhatsApp confirmation to customer
 *   - Notifies owner via socket
 *
 * For web orders (fallback):
 *   - The frontend /verify handles this normally
 *   - Webhook acts as a safety net if /verify was never called
 */
export const webhook = async (req, res) => {
  // Respond 200 immediately so Cashfree doesn't retry
  res.status(200).send();

  try {
    const event = req.body;

    // Cashfree sends different event types — we only care about payment success
    if (
      event.type !== "PAYMENT_SUCCESS_WEBHOOK" &&
      event.type !== "PAYMENT_LINK_EVENT"
    ) {
      return;
    }

    // Extract order/link ID depending on event type
    const orderId =
      event.data?.order?.order_id ||
      event.data?.payment_link?.link_id;

    if (!orderId) return;

    // Find the pending payment record
    const pending = await PendingPayment.findOne({ tempOrderId: orderId });
    if (!pending) return; // Already processed or expired

    // Only handle WhatsApp orders here
    // Web orders are handled by /verify — skip to avoid duplicate orders
    if (pending.source === "web") return;

    // Find or create user for WhatsApp customer
    let user = await User.findOne({ phone: pending.customerPhone });
    if (!user) {
      user = await User.create({
        phone: pending.customerPhone,
        isMobileVerified: false,
      });
    }

    // Create the order
    const order = await Order.create({
      customer: user._id,
      customerPhone: pending.customerPhone,
      items: pending.items,
      totalCost: pending.amount,
      note: pending.note,
      paymentId: orderId,
      paymentStatus: "paid",
    });

    // Clean up pending payment
    await PendingPayment.deleteOne({ tempOrderId: orderId });

    // Notify owner via socket
    try {
      const io = getIO();
      io.to("owner_room").emit("new_order", order);
    } catch (socketErr) {
      console.error("[Socket] Failed to emit new_order from webhook:", socketErr.message);
    }

    // Send WhatsApp confirmation to customer
    await sendWhatsAppMessage(
      pending.customerPhone,
      orderConfirmedMessage(pending.amount)
    );

  } catch (error) {
    console.error("[Payment Webhook Error]", error.message);
  }
};
