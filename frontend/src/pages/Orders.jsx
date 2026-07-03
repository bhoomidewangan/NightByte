import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

function Orders() {
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeStatuses = ["pending", "accepted", "preparing", "prepared", "out_for_delivery"];
  const pastStatuses = ["delivered", "cancelled"];

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatStatus = (status) => {
    return status
      ?.split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    if (filter === "Active") return activeStatuses.includes(order.status);
    if (filter === "Past") return pastStatuses.includes(order.status);
    return true;
  });

  const statusStyle = {
    pending: "bg-purple-500/20 text-purple-300",
    accepted: "bg-blue-500/20 text-blue-300",
    preparing: "bg-yellow-500/20 text-yellow-300",
    prepared: "bg-cyan-500/20 text-cyan-300",
    out_for_delivery: "bg-orange-500/20 text-orange-300",
    delivered: "bg-green-500/20 text-green-300",
    cancelled: "bg-red-500/20 text-red-300",
  };

  const filterButton = (name) =>
    filter === name
      ? "bg-purple-300 text-purple-950 px-5 py-2 rounded-full text-sm font-bold"
      : "bg-[#101a2e] border border-[#26324a] text-gray-300 px-5 py-2 rounded-full text-sm hover:bg-[#18233a]";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-purple-300 text-sm font-semibold">Order History</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">My Orders</h1>
          <p className="text-gray-400 mt-2">
            Track your cravings from kitchen to doorstep.
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setFilter("All")} className={filterButton("All")}>
            All
          </button>
          <button onClick={() => setFilter("Active")} className={filterButton("Active")}>
            Active
          </button>
          <button onClick={() => setFilter("Past")} className={filterButton("Past")}>
            Past
          </button>
        </div>

        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold">
                      #{order._id?.slice(-6).toUpperCase()}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusStyle[order.status] || "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mt-2">
                    {formatDate(order.placedAt || order.createdAt)}
                  </p>

                  <div className="mt-5 space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-purple-300"></span>
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <p className="text-gray-500 text-sm mt-4">
                      Note: {order.note}
                    </p>
                  )}
                </div>

                <div className="md:text-right">
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-3xl font-bold text-purple-300">
                    ₹{order.totalCost}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center bg-[#101a2e] border border-[#26324a] rounded-2xl p-10">
            <p className="text-4xl">📦</p>
            <h2 className="text-xl font-bold mt-4">No orders found</h2>
            <p className="text-gray-400 mt-2">
              No {filter.toLowerCase()} orders available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;