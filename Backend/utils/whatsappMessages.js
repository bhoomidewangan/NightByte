// utils/whatsappMessages.js
// All WhatsApp message templates live here.
// Keeping them out of the controller means you can tweak wording
// without touching business logic.

// ─── Menu ────────────────────────────────────────────────────────────────────

/**
 * Formats the full menu as a WhatsApp message grouped by category.
 * @param {Array} items - MenuItem documents from DB
 * @param {string} cafeName
 * @returns {string}
 */
export const menuMessage = (items, cafeName) => {
  if (!items || items.length === 0) {
    return `*${cafeName}*\n\nThe menu is currently empty. Please check back later.`;
  }

  // Group by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  let msg = `🍽️ *${cafeName} — Menu*\n\n`;

  for (const [category, categoryItems] of Object.entries(grouped)) {
    msg += `*${category}*\n`;
    for (const item of categoryItems) {
      msg += `  • ${item.name} — ₹${item.price}\n`;
    }
    msg += "\n";
  }

  msg += `To place an order, reply *Order*`;
  return msg.trim();
};

// ─── Order Instructions ──────────────────────────────────────────────────────

/**
 * Sent after customer types "Order" — tells them how to format their order.
 * @param {Array} items - available MenuItem documents
 * @returns {string}
 */
export const orderInstructionsMessage = (items) => {
  let msg = `📝 *How to place your order*\n\n`;
  msg += `Reply with your order in this format:\n\n`;
  msg += `_Item Name - Quantity_\n\n`;
  msg += `*Example:*\n`;
  msg += `Paneer Tikka - 2\n`;
  msg += `Mango Lassi - 1\n`;
  msg += `Garlic Naan - 3\n\n`;
  msg += `*Available items:*\n`;

  for (const item of items) {
    msg += `  • ${item.name} — ₹${item.price}\n`;
  }

  msg += `\nSend your order now 👇`;
  return msg.trim();
};

// ─── Order Summary (for customer to confirm) ─────────────────────────────────

/**
 * Sent after parsing the customer's order — shows summary with total.
 * Customer replies "Confirm" or "Cancel".
 * @param {Array} parsedItems - [{ name, price, quantity }]
 * @param {number} total
 * @returns {string}
 */
export const orderSummaryMessage = (parsedItems, total) => {
  let msg = `🛒 *Order Summary*\n\n`;

  for (const item of parsedItems) {
    msg += `  • ${item.name} x${item.quantity} — ₹${item.price * item.quantity}\n`;
  }

  msg += `\n*Total: ₹${total}*\n\n`;
  msg += `Reply *Confirm* to place your order\n`;
  msg += `Reply *Cancel* to cancel`;
  return msg.trim();
};

// ─── Order Confirmed ─────────────────────────────────────────────────────────

export const orderConfirmedMessage = (total) =>
  `✅ *Order Confirmed!*\n\nYour order of ₹${total} has been placed successfully.\n\nWe'll notify you as the status updates. Type *Update* anytime to check your order status.`;

// ─── Order Cancelled ─────────────────────────────────────────────────────────

export const orderCancelledMessage = () =>
  `❌ Your order has been cancelled.\n\nType *Order* to start a new order or *Menu* to browse.`;

// ─── Order Status Update (owner → customer) ──────────────────────────────────

const STATUS_LABELS = {
  pending: "⏳ Pending — waiting for cafe to accept",
  accepted: "✅ Accepted — cafe has accepted your order",
  preparing: "👨‍🍳 Preparing — your order is being prepared",
  prepared: "📦 Prepared — your order is ready",
  out_for_delivery: "🛵 Out for Delivery — on the way!",
  delivered: "🎉 Delivered — enjoy your meal!",
};

/**
 * Sent to customer whenever the owner advances the order status.
 * @param {string} status - new status value
 * @param {number} total
 * @returns {string}
 */
export const statusUpdateMessage = (status, total) =>
  `*NightByte Order Update*\n\n${STATUS_LABELS[status] || status}\n\nOrder Total: ₹${total}`;

// ─── Customer checks status ("Update") ───────────────────────────────────────

/**
 * Sent when customer types "Update" — shows their most recent active order.
 * @param {Object|null} order - most recent Order document, or null
 * @returns {string}
 */
export const currentStatusMessage = (order) => {
  if (!order) {
    return `You have no active orders.\n\nType *Order* to place one or *Menu* to browse.`;
  }

  const label = STATUS_LABELS[order.status] || order.status;
  let msg = `*Your Latest Order*\n\n`;

  for (const item of order.items) {
    msg += `  • ${item.name} x${item.quantity}\n`;
  }

  msg += `\n*Total: ₹${order.totalCost}*\n`;
  msg += `*Status: ${label}*`;
  return msg.trim();
};

// ─── Parse error ─────────────────────────────────────────────────────────────

/**
 * Sent when the customer's order message can't be parsed.
 * @param {Array} unrecognised - item names that couldn't be matched
 * @returns {string}
 */
export const parseErrorMessage = (unrecognised) => {
  let msg = `⚠️ Sorry, I couldn't recognise these items:\n`;
  for (const name of unrecognised) {
    msg += `  • ${name}\n`;
  }
  msg += `\nPlease check the spelling and try again, or type *Menu* to see available items.`;
  return msg.trim();
};

// ─── Ordering disabled ───────────────────────────────────────────────────────

export const orderingDisabledMessage = () =>
  `😔 Sorry, we're not accepting orders right now.\n\nPlease check back later or type *Menu* to browse.`;

// ─── Unknown command ─────────────────────────────────────────────────────────

export const unknownCommandMessage = () =>
  `👋 Hi! Here's what you can do:\n\n*Menu* — View our menu\n*Order* — Place an order\n*Update* — Check your order status\n*Paid* — Confirm your payment after paying via link`;