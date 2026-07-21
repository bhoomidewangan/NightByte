// utils/cashfreeService.js
// Wraps all Cashfree API calls in one place.
// Controllers never call Cashfree directly — they go through here.

import axios from "axios";
import env from "../config/env.js";

// Base URL differs between sandbox and production
const BASE_URL =
  env.cashfree.env === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// Headers required by Cashfree on every request
const headers = {
  "x-api-version": "2025-01-01",
  "x-client-id": env.cashfree.appId,
  "x-client-secret": env.cashfree.secretKey,
  "Content-Type": "application/json",
};

/**
 * Creates a Cashfree payment order.
 * Returns a payment_session_id which the frontend uses to open the checkout.
 *
 * @param {Object} params
 * @param {string} params.orderId       - your internal order ID (must be unique)
 * @param {number} params.amount        - total amount in INR
 * @param {string} params.customerPhone - customer phone with country code
 * @param {string} params.customerName  - customer name
 * @param {string} params.returnUrl     - URL to redirect after payment
 * @returns {Promise<{ paymentSessionId: string, cfOrderId: string }>}
 */
export const createCashfreeOrder = async ({
  orderId,
  amount,
  customerPhone,
  customerName,
  returnUrl,
}) => {
  const response = await axios.post(
    `${BASE_URL}/orders`,
    {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerPhone.replace("+", ""),
        customer_phone: customerPhone.replace("+91", ""),
        customer_name: customerName || "Customer",
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      },
    },
    { headers }
  );

  return {
    paymentSessionId: response.data.payment_session_id,
    cfOrderId: response.data.cf_order_id,
  };
};



/**
 * Creates a Cashfree payment LINK for WhatsApp orders.
 * Returns a shareable URL the customer can open on their phone to pay.
 */
export const createCashfreePaymentLink = async ({
  orderId,
  amount,
  customerPhone,
  customerName,
}) => {
  const response = await axios.post(
    `${BASE_URL}/links`,
    {
      link_id: orderId,
      link_amount: amount,
      link_currency: "INR",
      link_purpose: "NightByte Order",
      customer_details: {
        customer_phone: customerPhone.replace("+91", ""),
        customer_name: customerName || "Customer",
      },
      link_meta: {
        notify_url: `${env.backendUrl}/api/payment/webhook`,
      },
      link_notify: {
        send_sms: false,
        send_email: false,
      },
    },
    { headers }
  );

  return {
    paymentLink: response.data.link_url,
    linkId: response.data.link_id,
  };
};

/**
 * Verifies a payment by fetching the order status from Cashfree.
 * Called after the customer returns from the payment page.
 *
 * @param {string} orderId - the order_id you passed when creating the order
 * @returns {Promise<{ isPaid: boolean, status: string }>}
 */
export const verifyCashfreePayment = async (orderId) => {
  const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
    headers,
  });

  const status = response.data.order_status;

  return {
    isPaid: status === "PAID",
    status,
  };
};




/**
 * Verifies a payment link status from Cashfree.
 * Used in webhook to confirm WhatsApp payment.
 */
export const verifyCashfreeLink = async (linkId) => {
  const response = await axios.get(`${BASE_URL}/links/${linkId}`, {
    headers,
  });
  const status = response.data.link_status;
  return { isPaid: status === "PAID", status };
};
