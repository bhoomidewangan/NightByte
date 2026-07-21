// src/pages/PaymentStatus.jsx
// Cashfree redirects here after payment is completed (success or failure).
// URL will be: /payment/status?order_id=NB-xxx
//
// This page:
//   1. Reads order_id from URL params
//   2. Calls /api/payment/verify on the backend
//   3. Shows success or failure UI
//   4. Redirects to /orders on success

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      setStatus("failed");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.post("/payment/verify", { orderId });
        setOrder(res.data.order);
        setStatus("success");
        toast.success("Payment successful! Order placed.");

        // Redirect to orders page after 3 seconds
        setTimeout(() => navigate("/orders"), 3000);
      } catch (error) {
        setStatus("failed");
        toast.error(error.response?.data?.message || "Payment verification failed");
      }
    };

    verifyPayment();
  }, []);

  // ── Verifying ───────────────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-6 text-lg">Verifying your payment...</p>
          <p className="text-gray-500 text-sm mt-2">Please don't close this page</p>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center px-4">
        <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-green-300">Payment Successful!</h1>
          <p className="text-gray-400 mt-3">Your order has been placed successfully.</p>

          {order && (
            <div className="mt-6 bg-[#071023] border border-[#26324a] rounded-xl p-4 text-left">
              <p className="text-gray-400 text-sm">Order ID</p>
              <p className="font-bold mt-1">#{order._id?.slice(-6).toUpperCase()}</p>

              <p className="text-gray-400 text-sm mt-3">Total Paid</p>
              <p className="font-bold text-purple-300 text-xl mt-1">₹{order.totalCost}</p>

              <p className="text-gray-400 text-sm mt-3">Items</p>
              <div className="mt-1 space-y-1">
                {order.items?.map((item, i) => (
                  <p key={i} className="text-gray-300 text-sm">
                    {item.quantity} × {item.name}
                  </p>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-500 text-sm mt-6">
            Redirecting to your orders in 3 seconds...
          </p>

          <Link
            to="/orders"
            className="block mt-4 bg-purple-300 text-purple-950 py-3 rounded-xl font-bold hover:bg-purple-200"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // ── Failed ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center px-4">
      <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold text-red-300">Payment Failed</h1>
        <p className="text-gray-400 mt-3">
          Your payment was not completed. Your cart is still saved.
        </p>

        <Link
          to="/cart"
          className="block mt-8 bg-purple-300 text-purple-950 py-3 rounded-xl font-bold hover:bg-purple-200"
        >
          Back to Cart
        </Link>

        <Link
          to="/menu"
          className="block mt-3 border border-[#26324a] py-3 rounded-xl font-semibold hover:bg-[#18233a]"
        >
          Browse Menu
        </Link>
      </div>
    </div>
  );
}

export default PaymentStatus;
