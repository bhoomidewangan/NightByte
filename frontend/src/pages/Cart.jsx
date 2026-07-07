import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fallbackImage =
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600";

  const deliveryFee = cartItems.length > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");

      setCartItems(res.data.cart.items || []);
      setSubtotal(res.data.cart.totalCost || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increaseItem = async (item) => {
    try {
      await api.post("/cart/add", {
        menuItemId: item.menuItem,
        quantity: 1,
      });

      toast.success("Quantity updated");
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update cart");
    }
  };

  const decreaseItem = async (item) => {
    try {
      await api.post("/cart/remove", {
        menuItemId: item.menuItem,
        quantity: 1,
      });

      toast.success("Quantity updated");
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update cart");
    }
  };

  const removeItem = async (item) => {
    try {
      await api.post("/cart/remove", {
        menuItemId: item.menuItem,
        quantity: item.quantity,
      });

      toast.success("Item removed");
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  const clearBackendCart = async () => {
    try {
      await api.delete("/cart");

      toast.success("Cart cleared");
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    }
  };

  const placeOrder = async () => {
    try {
      if (cartItems.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      await api.post("/orders/place", {
        note: "Order placed from NightByte frontend",
      });

      toast.success("Order placed successfully");
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-purple-300 text-sm font-semibold">Checkout</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Your Cart</h1>
          <p className="text-gray-400 mt-2">
            Review your food items before placing the order.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-[#101a2e] border border-[#26324a] rounded-3xl p-10 text-center shadow-xl">
            <p className="text-5xl">🛒</p>
            <h2 className="text-2xl font-bold mt-5">Your cart is empty</h2>
            <p className="text-gray-400 mt-3">
              Add something tasty from the menu.
            </p>

            <Link
              to="/menu"
              className="inline-block mt-6 bg-purple-300 text-purple-950 px-6 py-3 rounded-xl font-bold hover:bg-purple-200"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.menuItem}
                  className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5 flex flex-col md:flex-row gap-5 md:items-center justify-between shadow-xl"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={item.image || fallbackImage}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />

                    <div>
                      <h2 className="text-xl font-bold">{item.name}</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Saved from backend cart
                      </p>
                      <p className="text-purple-300 font-semibold mt-2">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <button
                      onClick={() => decreaseItem(item)}
                      className="bg-[#1d2a43] hover:bg-[#263553] w-9 h-9 rounded-lg font-bold"
                    >
                      -
                    </button>

                    <span className="text-lg font-bold w-8 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseItem(item)}
                      className="bg-[#1d2a43] hover:bg-[#263553] w-9 h-9 rounded-lg font-bold"
                    >
                      +
                    </button>

                    <p className="text-xl text-purple-300 font-bold w-20 text-right">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() => removeItem(item)}
                      className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 h-fit shadow-xl">
              <h2 className="text-2xl font-bold">Order Summary</h2>

              <div className="space-y-4 mt-6 text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>

                <hr className="border-[#26324a]" />

                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-purple-300">₹{total}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                className="w-full mt-8 bg-purple-300 text-purple-950 py-4 rounded-xl font-bold hover:bg-purple-200 transition"
              >
                Place Order 🚀
              </button>

              <button
                onClick={clearBackendCart}
                className="w-full mt-4 border border-red-500/50 text-red-300 hover:bg-red-500/10 py-3 rounded-xl font-semibold transition"
              >
                Clear Cart
              </button>

              <Link
                to="/menu"
                className="block text-center mt-4 text-purple-300 font-semibold"
              >
                + Add more items
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;