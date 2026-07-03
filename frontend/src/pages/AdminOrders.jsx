/*import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColor = {
    pending: "bg-yellow-500/20 text-yellow-300",
    accepted: "bg-blue-500/20 text-blue-300",
    preparing: "bg-purple-500/20 text-purple-300",
    prepared: "bg-cyan-500/20 text-cyan-300",
    out_for_delivery: "bg-orange-500/20 text-orange-300",
    delivered: "bg-green-500/20 text-green-300",
  };

  const formatStatus = (status) =>
    status
      ?.split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
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

  const updateStatus = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`);
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-purple-300 font-semibold text-sm">
              Admin Panel
            </p>

            <h1 className="text-4xl font-bold mt-2">Order Queue</h1>

            <p className="text-gray-400 mt-2">
              Track and update all customer orders.
            </p>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-xl px-5 py-3">
            <span className="text-gray-400 text-sm">Total Orders</span>

            <p className="text-2xl font-bold text-purple-300">
              {orders.length}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold">
                      #{order._id?.slice(-6).toUpperCase()}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColor[order.status] ||
                        "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-gray-300">
                    <p>
                      👤{" "}
                      <span className="font-semibold">
                        {order.customer?.name || "Customer"}
                      </span>
                    </p>

                    <p>📞 {order.customerPhone || order.customer?.phone}</p>

                    <div>
                      🍔{" "}
                      {order.items?.map((item, index) => (
                        <span key={index}>
                          {item.name} × {item.quantity}
                          {index !== order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>

                    <p>🕒 {formatDate(order.placedAt || order.createdAt)}</p>

                    {order.note && <p>📝 {order.note}</p>}
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p className="text-gray-400">Total Bill</p>

                    <h2 className="text-3xl font-bold text-purple-300 mt-1">
                      ₹{order.totalCost}
                    </h2>
                  </div>

                  <button
                    onClick={() => updateStatus(order._id)}
                    disabled={order.status === "delivered"}
                    className={`mt-6 px-5 py-3 rounded-xl font-semibold transition ${
                      order.status === "delivered"
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-purple-300 text-purple-950 hover:bg-purple-200"
                    }`}
                  >
                    {order.status === "delivered"
                      ? "Completed"
                      : "Next Status"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center bg-[#101a2e] border border-[#26324a] rounded-2xl p-10">
            <p className="text-4xl">📦</p>
            <h2 className="text-xl font-bold mt-4">No orders found</h2>
            <p className="text-gray-400 mt-2">
              New customer orders will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;*/


import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const statuses = [
    "all",
    "pending",
    "accepted",
    "preparing",
    "prepared",
    "out_for_delivery",
    "delivered",
  ];

  const statusColor = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    accepted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    preparing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    prepared: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    out_for_delivery: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    delivered: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  const actionText = {
    pending: "Accept Order",
    accepted: "Start Preparing",
    preparing: "Mark Prepared",
    prepared: "Out For Delivery",
    out_for_delivery: "Mark Delivered",
    delivered: "Completed",
  };

  const formatStatus = (status) =>
    status
      ?.split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
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

  const updateStatus = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`);
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalCost || 0),
    0
  );

  const pendingCount = orders.filter((order) => order.status === "pending").length;

  const activeCount = orders.filter(
    (order) => order.status !== "delivered"
  ).length;

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;

    const text = `${order.customer?.name || ""} ${
      order.customerPhone || order.customer?.phone || ""
    } ${order._id || ""}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-8">
          <div>
            <p className="text-purple-300 font-semibold text-sm">
              Admin Panel
            </p>

            <h1 className="text-4xl font-bold mt-2">Order Management</h1>

            <p className="text-gray-400 mt-2">
              Manage live orders and update their preparation status.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-[#101a2e] border border-[#26324a] px-5 py-3 rounded-xl hover:bg-[#18233a] font-semibold"
          >
            Refresh Orders
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <h2 className="text-3xl font-bold text-purple-300 mt-2">
              {orders.length}
            </h2>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Pending</p>
            <h2 className="text-3xl font-bold text-yellow-300 mt-2">
              {pendingCount}
            </h2>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Active Orders</p>
            <h2 className="text-3xl font-bold text-blue-300 mt-2">
              {activeCount}
            </h2>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Revenue</p>
            <h2 className="text-3xl font-bold text-green-300 mt-2">
              ₹{revenue}
            </h2>
          </div>
        </div>

        <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5 mb-8">
          <div className="grid lg:grid-cols-3 gap-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, phone, order id..."
              className="lg:col-span-1 bg-[#071023] border border-[#26324a] rounded-xl px-4 py-3 outline-none focus:border-purple-400"
            />

            <div className="lg:col-span-2 flex gap-3 overflow-x-auto">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={
                    filter === status
                      ? "whitespace-nowrap bg-purple-300 text-purple-950 px-4 py-3 rounded-xl text-sm font-bold"
                      : "whitespace-nowrap bg-[#071023] border border-[#26324a] text-gray-300 px-4 py-3 rounded-xl text-sm hover:bg-[#18233a]"
                  }
                >
                  {status === "all" ? "All" : formatStatus(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center bg-[#101a2e] border border-[#26324a] rounded-2xl p-10">
            <p className="text-4xl">🎉</p>
            <h2 className="text-xl font-bold mt-4">All caught up!</h2>
            <p className="text-gray-400 mt-2">
              No orders match the current filter.
            </p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-5">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl hover:border-purple-400 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      #{order._id?.slice(-6).toUpperCase()}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(order.placedAt || order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      statusColor[order.status] ||
                      "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="mt-5 bg-[#071023] border border-[#26324a] rounded-xl p-4 space-y-2 text-gray-300">
                  <p>
                    👤{" "}
                    <span className="font-semibold text-white">
                      {order.customer?.name || "Customer"}
                    </span>
                  </p>

                  <p>📞 {order.customerPhone || order.customer?.phone}</p>
                </div>

                <div className="mt-5">
                  <p className="text-gray-400 text-sm mb-3">Items Ordered</p>

                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3"
                      >
                        <span>{item.name}</span>
                        <span className="text-purple-300 font-bold">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.note && (
                  <p className="mt-4 text-sm text-gray-400">📝 {order.note}</p>
                )}

                <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#26324a]">
                  <div>
                    <p className="text-gray-400 text-sm">Total Bill</p>
                    <h3 className="text-3xl font-bold text-purple-300">
                      ₹{order.totalCost}
                    </h3>
                  </div>

                  <button
                    onClick={() => updateStatus(order._id)}
                    disabled={order.status === "delivered"}
                    className={`px-5 py-3 rounded-xl font-bold transition ${
                      order.status === "delivered"
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-purple-300 text-purple-950 hover:bg-purple-200"
                    }`}
                  >
                    {actionText[order.status] || "Next Status"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;