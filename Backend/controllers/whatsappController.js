// // controllers/whatsappController.js
// //
// // Handles ALL incoming WhatsApp messages from Twilio's webhook.
// // Twilio sends a POST to /api/whatsapp/webhook whenever a customer
// // messages your WhatsApp number.
// //
// // Commands handled (case insensitive):
// //   "menu"    → sends menu
// //   "order"   → sends ordering instructions, sets session to AWAITING_ORDER
// //   "confirm" → confirms pending order, creates Order document
// //   "cancel"  → cancels pending order, clears session
// //   "update"  → sends current order status
// //   anything else while AWAITING_ORDER → tries to parse as an order
// //   anything else → sends unknown command help message

// import twilio from "twilio";
// import { getIO } from "../config/socket.js";
// import MenuItem from "../models/MenuItem.js";
// import Order from "../models/Order.js";
// import Cafe from "../models/Cafe.js";
// import User from "../models/User.js";
// import WhatsappSession from "../models/WhatsappSession.js";
// import { sendWhatsAppMessage } from "../utils/whatsappService.js";
// import { parseOrder, calculateTotal } from "../utils/orderParser.js";
// import {
//   menuMessage,
//   orderInstructionsMessage,
//   orderSummaryMessage,
//   orderConfirmedMessage,
//   orderCancelledMessage,
//   parseErrorMessage,
//   orderingDisabledMessage,
//   unknownCommandMessage,
//   currentStatusMessage,
// } from "../utils/whatsappMessages.js";
// import env from "../config/env.js";

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// // Extracts the plain phone number from Twilio's "whatsapp:+919876543210" format
// const extractPhone = (twilioFrom) => twilioFrom.replace("whatsapp:", "");

// // Refreshes session TTL by updating expiresAt — call on every interaction
// const refreshSession = async (session) => {
//   session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//   await session.save();
// };

// // ─── webhook ─────────────────────────────────────────────────────────────────

// /**
//  * POST /api/whatsapp/webhook
//  * Public — called by Twilio, not by your frontend.
//  *
//  * Twilio sends form-encoded body with:
//  *   From — "whatsapp:+919876543210"
//  *   Body — the message text the customer typed
//  *
//  * We respond with 200 immediately (Twilio requires this).
//  * Actual reply is sent via sendWhatsAppMessage() asynchronously.
//  *
//  * Webhook URL validation: in production, validate the Twilio signature
//  * using twilio.validateRequest() for security. See the comment below.
//  */
// export const webhook = async (req, res) => {
//   // Always respond 200 to Twilio immediately — if we take too long
//   // Twilio will retry and the customer gets duplicate messages
//   res.status(200).send();

//   try {
//     const from = req.body.From; // "whatsapp:+919876543210"
//     const rawBody = (req.body.Body || "").trim();
//     const command = rawBody.toLowerCase();
//     const phone = extractPhone(from);

//     if (!phone || !rawBody) return;

//     // ── MENU ──────────────────────────────────────────────────────────────────
//     if (command === "menu") {
//       const [items, cafe] = await Promise.all([
//         MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 }),
//         Cafe.findOne(),
//       ]);
//       await sendWhatsAppMessage(phone, menuMessage(items, cafe?.name || "NightByte"));
//       return;
//     }

//     // ── ORDER ─────────────────────────────────────────────────────────────────
//     if (command === "order") {
//       const cafe = await Cafe.findOne();
//       if (!cafe || !cafe.isOrderingEnabled) {
//         await sendWhatsAppMessage(phone, orderingDisabledMessage());
//         return;
//       }

//       const items = await MenuItem.find({ isAvailable: true }).sort({ name: 1 });

//       // Create or update session → AWAITING_ORDER
//       await WhatsappSession.findOneAndUpdate(
//         { phone },
//         {
//           phone,
//           state: "AWAITING_ORDER",
//           pendingItems: [],
//           pendingTotal: 0,
//           expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//         },
//         { upsert: true, new: true }
//       );

//       await sendWhatsAppMessage(phone, orderInstructionsMessage(items));
//       return;
//     }

//     // ── CONFIRM ───────────────────────────────────────────────────────────────
// if (command === "confirm") {
//   const session = await WhatsappSession.findOne({ phone });

//   if (!session || session.state !== "AWAITING_CONFIRM" || session.pendingItems.length === 0) {
//     await sendWhatsAppMessage(phone, `No pending order to confirm.\n\nType *Order* to place one.`);
//     return;
//   }

//   let user = await User.findOne({ phone });
//   if (!user) {
//     user = await User.create({ phone, isMobileVerified: false });
//   }

//   // ONLY ONE Order.create() here
//   const newOrder = await Order.create({
//     customer: user._id,
//     customerPhone: phone,
//     items: session.pendingItems.map((i) => ({
//       menuItem: i.menuItemId,
//       name: i.name,
//       price: i.price,
//       quantity: i.quantity,
//     })),
//     totalCost: session.pendingTotal,
//   });

//   // Notify owner dashboard via socket
//   try {
//     const io = getIO();
//     io.to("owner_room").emit("new_order", newOrder);
//   } catch (socketErr) {
//     console.error("[Socket] Failed to emit new_order from WhatsApp:", socketErr.message);
//   }

//   await WhatsappSession.deleteOne({ phone });
//   await sendWhatsAppMessage(phone, orderConfirmedMessage(session.pendingTotal));
//   return;
// }

//     // ── CANCEL ────────────────────────────────────────────────────────────────
//     if (command === "cancel") {
//       await WhatsappSession.deleteOne({ phone });
//       await sendWhatsAppMessage(phone, orderCancelledMessage());
//       return;
//     }

//     // ── UPDATE ────────────────────────────────────────────────────────────────
//     if (command === "update") {
//       const user = await User.findOne({ phone });

//       if (!user) {
//         await sendWhatsAppMessage(phone, currentStatusMessage(null));
//         return;
//       }

//       // Most recent non-delivered order, or most recent of any status
//       const order = await Order.findOne({ customer: user._id })
//         .sort({ placedAt: -1 });

//       await sendWhatsAppMessage(phone, currentStatusMessage(order));
//       return;
//     }

//     // ── AWAITING_ORDER (customer sent their order items) ──────────────────────
//     const session = await WhatsappSession.findOne({ phone });

//     if (session && session.state === "AWAITING_ORDER") {
//       const cafe = await Cafe.findOne();
//       if (!cafe || !cafe.isOrderingEnabled) {
//         await WhatsappSession.deleteOne({ phone });
//         await sendWhatsAppMessage(phone, orderingDisabledMessage());
//         return;
//       }

//       const menuItems = await MenuItem.find({ isAvailable: true });
//       const { matched, unmatched } = parseOrder(rawBody, menuItems);

//       if (unmatched.length > 0 && matched.length === 0) {
//         // Nothing matched at all
//         await sendWhatsAppMessage(phone, parseErrorMessage(unmatched));
//         await refreshSession(session);
//         return;
//       }

//       if (unmatched.length > 0) {
//         // Some matched, some didn't — ask them to fix
//         await sendWhatsAppMessage(phone, parseErrorMessage(unmatched));
//         await refreshSession(session);
//         return;
//       }

//       const total = calculateTotal(matched);

//       // Advance session to AWAITING_CONFIRM
//       session.state = "AWAITING_CONFIRM";
//       session.pendingItems = matched;
//       session.pendingTotal = total;
//       session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//       await session.save();

//       await sendWhatsAppMessage(phone, orderSummaryMessage(matched, total));
//       return;
//     }

//     // ── UNKNOWN COMMAND ───────────────────────────────────────────────────────
//     await sendWhatsAppMessage(phone, unknownCommandMessage());

//   } catch (error) {
//     // Log but don't crash — Twilio already got its 200
//     console.error("[WhatsApp Webhook Error]", error.message);
//   }
// };






















// controllers/whatsappController.js
//
// Handles ALL incoming WhatsApp messages from Twilio's webhook.
// Twilio sends a POST to /api/whatsapp/webhook whenever a customer
// messages your WhatsApp number.
//
// Commands handled (case insensitive):
//   "menu"    → sends menu
//   "order"   → sends ordering instructions, sets session to AWAITING_ORDER
//   "confirm" → creates Cashfree payment link, sends to customer
//   "cancel"  → cancels pending order, clears session
//   "update"  → sends current order status
//   anything else while AWAITING_ORDER → tries to parse as an order
//   anything else → sends unknown command help message

import crypto from "crypto";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Cafe from "../models/Cafe.js";
import User from "../models/User.js";
import WhatsappSession from "../models/WhatsappSession.js";
import PendingPayment from "../models/PendingPayment.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";
import { createCashfreePaymentLink } from "../utils/cashfreeService.js";
import { parseOrder, calculateTotal } from "../utils/orderParser.js";
import {
  menuMessage,
  orderInstructionsMessage,
  orderSummaryMessage,
  orderCancelledMessage,
  parseErrorMessage,
  orderingDisabledMessage,
  unknownCommandMessage,
  currentStatusMessage,
} from "../utils/whatsappMessages.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Extracts the plain phone number from Twilio's "whatsapp:+919876543210" format
const extractPhone = (twilioFrom) => twilioFrom.replace("whatsapp:", "");

// Refreshes session TTL by updating expiresAt — call on every interaction
const refreshSession = async (session) => {
  session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await session.save();
};

// ─── webhook ─────────────────────────────────────────────────────────────────

/**
 * POST /api/whatsapp/webhook
 * Public — called by Twilio, not by your frontend.
 *
 * Twilio sends form-encoded body with:
 *   From — "whatsapp:+919876543210"
 *   Body — the message text the customer typed
 *
 * We respond with 200 immediately (Twilio requires this).
 * Actual reply is sent via sendWhatsAppMessage() asynchronously.
 */
export const webhook = async (req, res) => {
  // Always respond 200 to Twilio immediately — if we take too long
  // Twilio will retry and the customer gets duplicate messages
  res.status(200).send();

  try {
    const from = req.body.From; // "whatsapp:+919876543210"
    const rawBody = (req.body.Body || "").trim();
    const command = rawBody.toLowerCase();
    const phone = extractPhone(from);

    if (!phone || !rawBody) return;

    // ── MENU ──────────────────────────────────────────────────────────────────
    if (command === "menu") {
      const [items, cafe] = await Promise.all([
        MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 }),
        Cafe.findOne(),
      ]);
      await sendWhatsAppMessage(phone, menuMessage(items, cafe?.name || "NightByte"));
      return;
    }

    // ── ORDER ─────────────────────────────────────────────────────────────────
    if (command === "order") {
      const cafe = await Cafe.findOne();
      if (!cafe || !cafe.isOrderingEnabled) {
        await sendWhatsAppMessage(phone, orderingDisabledMessage());
        return;
      }

      const items = await MenuItem.find({ isAvailable: true }).sort({ name: 1 });

      // Create or update session → AWAITING_ORDER
      await WhatsappSession.findOneAndUpdate(
        { phone },
        {
          phone,
          state: "AWAITING_ORDER",
          pendingItems: [],
          pendingTotal: 0,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
        { upsert: true, new: true }
      );

      await sendWhatsAppMessage(phone, orderInstructionsMessage(items));
      return;
    }

    // ── CONFIRM ───────────────────────────────────────────────────────────────
    if (command === "confirm") {
      const session = await WhatsappSession.findOne({ phone });

      if (
        !session ||
        session.state !== "AWAITING_CONFIRM" ||
        session.pendingItems.length === 0
      ) {
        await sendWhatsAppMessage(
          phone,
          `No pending order to confirm.\n\nType *Order* to place one.`
        );
        return;
      }

      // Find or create user
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone, isMobileVerified: false });
      }

      // Generate unique order ID for Cashfree
      const tempOrderId = `WANB-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      // Create Cashfree payment link
      const { paymentLink } = await createCashfreePaymentLink({
        orderId: tempOrderId,
        amount: session.pendingTotal,
        customerPhone: phone,
        customerName: user.name || "Customer",
      });

      // Save pending payment record with source: "whatsapp"
      // The Cashfree webhook will pick this up after payment is confirmed
      await PendingPayment.create({
        tempOrderId,
        customer: user._id,
        customerPhone: phone,
        amount: session.pendingTotal,
        source: "whatsapp",
        items: session.pendingItems.map((i) => ({
          menuItem: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      // Clear the WhatsApp session
      await WhatsappSession.deleteOne({ phone });

      // Send payment link to customer
      await sendWhatsAppMessage(
        phone,
        `💳 *Complete Your Payment*\n\n` +
          `Order Total: ₹${session.pendingTotal}\n\n` +
          `Click the link below to pay securely:\n${paymentLink}\n\n` +
          `Your order will be placed automatically once payment is confirmed. ✅`
      );
      return;
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────
    if (command === "cancel") {
      await WhatsappSession.deleteOne({ phone });
      await sendWhatsAppMessage(phone, orderCancelledMessage());
      return;
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    if (command === "update") {
      const user = await User.findOne({ phone });

      if (!user) {
        await sendWhatsAppMessage(phone, currentStatusMessage(null));
        return;
      }

      // Most recent order
      const order = await Order.findOne({ customer: user._id }).sort({
        placedAt: -1,
      });

      await sendWhatsAppMessage(phone, currentStatusMessage(order));
      return;
    }

    // ── AWAITING_ORDER (customer sent their order items) ──────────────────────
    const session = await WhatsappSession.findOne({ phone });

    if (session && session.state === "AWAITING_ORDER") {
      const cafe = await Cafe.findOne();
      if (!cafe || !cafe.isOrderingEnabled) {
        await WhatsappSession.deleteOne({ phone });
        await sendWhatsAppMessage(phone, orderingDisabledMessage());
        return;
      }

      const menuItems = await MenuItem.find({ isAvailable: true });
      const { matched, unmatched } = parseOrder(rawBody, menuItems);

      if (unmatched.length > 0 && matched.length === 0) {
        // Nothing matched at all
        await sendWhatsAppMessage(phone, parseErrorMessage(unmatched));
        await refreshSession(session);
        return;
      }

      if (unmatched.length > 0) {
        // Some matched, some didn't — ask them to fix
        await sendWhatsAppMessage(phone, parseErrorMessage(unmatched));
        await refreshSession(session);
        return;
      }

      const total = calculateTotal(matched);

      // Advance session to AWAITING_CONFIRM
      session.state = "AWAITING_CONFIRM";
      session.pendingItems = matched;
      session.pendingTotal = total;
      session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await session.save();

      await sendWhatsAppMessage(phone, orderSummaryMessage(matched, total));
      return;
    }

    // ── UNKNOWN COMMAND ───────────────────────────────────────────────────────
    await sendWhatsAppMessage(phone, unknownCommandMessage());
  } catch (error) {
    // Log but don't crash — Twilio already got its 200
    console.error("[WhatsApp Webhook Error]", error.message);
  }
};

