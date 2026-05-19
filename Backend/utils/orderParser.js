// utils/orderParser.js
// Parses a customer's freeform WhatsApp order message into structured items.
//
// Expected format (flexible — handles extra spaces, different separators):
//   Paneer Tikka - 2
//   Mango Lassi - 1
//   Garlic Naan - 3
//
// Also handles:
//   Paneer Tikka : 2
//   Paneer Tikka 2        (space only)
//   paneer tikka - 2      (case insensitive)
//
// Returns:
//   matched   — [{ menuItemId, name, price, quantity }]
//   unmatched — [string] item names that couldn't be found in the menu

/**
 * @param {string} text - raw message from customer
 * @param {Array}  menuItems - MenuItem documents from DB
 * @returns {{ matched: Array, unmatched: Array }}
 */
export const parseOrder = (text, menuItems) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const matched = [];
  const unmatched = [];

  for (const line of lines) {
    // Split on - or : or last sequence of spaces before a number
    // Regex: everything before the separator, then optional separator, then digits at the end
    const match = line.match(/^(.+?)[\s\-:]+(\d+)\s*$/);

    if (!match) {
      unmatched.push(line);
      continue;
    }

    const rawName = match[1].trim().toLowerCase();
    const quantity = parseInt(match[2], 10);

    if (quantity < 1) {
      unmatched.push(line);
      continue;
    }

    // Find menu item — case insensitive exact match first, then partial
    let menuItem = menuItems.find(
      (i) => i.name.toLowerCase() === rawName
    );

    // Fallback: partial match (e.g. "paneer" matches "Paneer Tikka")
    if (!menuItem) {
      menuItem = menuItems.find((i) =>
        i.name.toLowerCase().includes(rawName) ||
        rawName.includes(i.name.toLowerCase())
      );
    }

    if (!menuItem) {
      unmatched.push(match[1].trim());
      continue;
    }

    // Check if already added (customer typed same item twice)
    const existing = matched.find(
      (m) => m.menuItemId.toString() === menuItem._id.toString()
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      matched.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      });
    }
  }

  return { matched, unmatched };
};

/**
 * Calculates total cost from parsed items.
 * @param {Array} items - matched items from parseOrder
 * @returns {number}
 */
export const calculateTotal = (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
