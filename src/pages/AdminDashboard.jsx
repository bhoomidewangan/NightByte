/*import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, menuRes, cafeRes] = await Promise.all([
        api.get("/orders"),
        api.get("/menu/all"),
        api.get("/cafe"),
      ]);

      setOrders(ordersRes.data.orders || []);
      setMenuItems(menuRes.data.items || []);
      setCafe(cafeRes.data.cafe || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.status !== "delivered"
  ).length;

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalCost || 0),
    0
  );

  const recentOrders = orders.slice(0, 3);

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

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: "📦",
      change: "All time orders",
    },
    {
      title: "Revenue",
      value: `₹${revenue}`,
      icon: "💰",
      change: "Total revenue",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: "⏳",
      change: "Needs attention",
    },
    {
      title: "Cafe Status",
      value: cafe?.isOrderingEnabled ? "Open" : "Closed",
      icon: "☕",
      change: `${cafe?.openingTime || "--"} - ${cafe?.closingTime || "--"}`,
    },
  ];

  const itemCounts = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      itemCounts[item.name] =
        (itemCounts[item.name] || 0) + Number(item.quantity || 0);
    });
  });

  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 mb-8">
          <div>
            <p className="text-purple-300 text-sm font-semibold">
              Cafe Owner Panel
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Track orders, revenue and cafe performance.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin/menu"
              className="bg-[#101a2e] border border-[#26324a] px-5 py-3 rounded-xl hover:bg-[#18233a]"
            >
              Manage Menu
            </Link>

            <Link
              to="/admin/orders"
              className="bg-purple-300 text-purple-950 px-5 py-3 rounded-xl font-bold hover:bg-purple-200"
            >
              View Orders
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl hover:border-purple-400 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <h2 className="text-3xl font-bold mt-3 text-purple-300">
                    {stat.value}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-[#1d2a43] flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-4">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Menu Overview</h2>
            <p className="text-gray-400 text-sm mt-1">
              Total items currently added by admin.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-5">
                <p className="text-gray-400 text-sm">Menu Items</p>
                <h3 className="text-3xl font-bold text-purple-300 mt-2">
                  {menuItems.length}
                </h3>
              </div>

              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-5">
                <p className="text-gray-400 text-sm">Available</p>
                <h3 className="text-3xl font-bold text-green-300 mt-2">
                  {menuItems.filter((item) => item.isAvailable).length}
                </h3>
              </div>

              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-5">
                <p className="text-gray-400 text-sm">Unavailable</p>
                <h3 className="text-3xl font-bold text-red-300 mt-2">
                  {menuItems.filter((item) => !item.isAvailable).length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Popular Items</h2>
            <p className="text-gray-400 text-sm mt-1">Based on orders</p>

            <div className="space-y-5 mt-6">
              {popularItems.length === 0 ? (
                <p className="text-gray-400">No order data yet.</p>
              ) : (
                popularItems.map(([name, count], index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{name}</span>
                      <span className="text-purple-300 font-bold">
                        {count} sold
                      </span>
                    </div>

                    <div className="h-2 bg-[#071023] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-300 rounded-full"
                        style={{
                          width: `${Math.min(count * 20, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-purple-300 text-sm font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-400">No recent orders yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex justify-between items-center bg-[#071023] border border-[#26324a] rounded-xl p-4"
                  >
                    <div>
                      <h3 className="font-bold">
                        #{order._id?.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {order.customer?.name || "Customer"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-purple-300">
                        ₹{order.totalCost}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[order.status] ||
                          "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Quick Actions</h2>

            <div className="space-y-3 mt-6">
              <Link
                to="/admin/menu"
                className="block bg-[#071023] border border-[#26324a] rounded-xl p-4 hover:border-purple-400"
              >
                🍔 Add / Edit Menu Items
              </Link>

              <Link
                to="/admin/orders"
                className="block bg-[#071023] border border-[#26324a] rounded-xl p-4 hover:border-purple-400"
              >
                📦 Manage Order Queue
              </Link>

              <Link
                to="/admin/settings"
                className="block bg-[#071023] border border-[#26324a] rounded-xl p-4 hover:border-purple-400"
              >
                ☕ Update Cafe Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;*/


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, menuRes, cafeRes] = await Promise.all([
        api.get("/orders"),
        api.get("/menu/all"),
        api.get("/cafe"),
      ]);

      setOrders(ordersRes.data.orders || []);
      setMenuItems(menuRes.data.items || []);
      setCafe(cafeRes.data.cafe || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeOrders = orders.filter((order) => order.status !== "delivered");
  const pendingOrders = orders.filter((order) => order.status === "pending");

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalCost || 0),
    0
  );

  const recentOrders = orders.slice(0, 5);

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

  const itemCounts = {};
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      itemCounts[item.name] =
        (itemCounts[item.name] || 0) + Number(item.quantity || 0);
    });
  });

  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: "📦",
      sub: "All-time orders",
    },
    {
      title: "Total Revenue",
      value: `₹${revenue}`,
      icon: "💰",
      sub: "From completed + active orders",
    },
    {
      title: "Active Orders",
      value: activeOrders.length,
      icon: "🔥",
      sub: `${pendingOrders.length} pending`,
    },
    {
      title: "Cafe Status",
      value: cafe?.isOrderingEnabled ? "Open" : "Closed",
      icon: "☕",
      sub: `${cafe?.openingTime || "--"} - ${cafe?.closingTime || "--"}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-8">
          <div>
            <p className="text-purple-300 text-sm font-semibold">
              NightByte Owner Console
            </p>
            <h1 className="text-4xl font-bold mt-2">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Monitor cafe performance, menu inventory, and live order activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchDashboardData}
              className="bg-[#101a2e] border border-[#26324a] px-5 py-3 rounded-xl hover:bg-[#18233a] font-semibold"
            >
              Refresh
            </button>

            <Link
              to="/admin/menu"
              className="bg-[#101a2e] border border-[#26324a] px-5 py-3 rounded-xl hover:bg-[#18233a]"
            >
              Manage Menu
            </Link>

            <Link
              to="/admin/orders"
              className="bg-purple-300 text-purple-950 px-5 py-3 rounded-xl font-bold hover:bg-purple-200"
            >
              View Orders
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl hover:border-purple-400 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <h2 className="text-3xl font-bold mt-3 text-purple-300">
                    {stat.value}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-[#1d2a43] flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-4">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Recent Orders</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Latest customer orders from the backend.
                </p>
              </div>

              <Link to="/admin/orders" className="text-purple-300 text-sm font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-400">No recent orders yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[#071023] border border-[#26324a] rounded-xl p-4"
                  >
                    <div>
                      <h3 className="font-bold">
                        #{order._id?.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {order.customer?.name || "Customer"} •{" "}
                        {order.customerPhone || order.customer?.phone}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-bold text-purple-300">
                        ₹{order.totalCost}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[order.status] ||
                          "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Cafe Info</h2>
            <p className="text-gray-400 text-sm mt-1">
              Current public cafe configuration.
            </p>

            <div className="mt-6 space-y-4">
              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-4">
                <p className="text-gray-500 text-sm">Cafe Name</p>
                <p className="font-bold mt-1">{cafe?.name || "Not set"}</p>
              </div>

              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-4">
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="font-bold mt-1">{cafe?.phone || "Not set"}</p>
              </div>

              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-4">
                <p className="text-gray-500 text-sm">Ordering</p>
                <p
                  className={
                    cafe?.isOrderingEnabled
                      ? "font-bold mt-1 text-green-300"
                      : "font-bold mt-1 text-red-300"
                  }
                >
                  {cafe?.isOrderingEnabled ? "Open" : "Closed"}
                </p>
              </div>

              <Link
                to="/admin/settings"
                className="block text-center bg-purple-300 text-purple-950 py-3 rounded-xl font-bold hover:bg-purple-200"
              >
                Update Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Menu Inventory</h2>
            <p className="text-gray-400 text-sm mt-1">
              Availability overview from admin menu.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs">Total</p>
                <h3 className="text-2xl font-bold text-purple-300 mt-2">
                  {menuItems.length}
                </h3>
              </div>

              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs">Live</p>
                <h3 className="text-2xl font-bold text-green-300 mt-2">
                  {menuItems.filter((item) => item.isAvailable).length}
                </h3>
              </div>

              <div className="bg-[#071023] border border-[#26324a] rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs">Hidden</p>
                <h3 className="text-2xl font-bold text-red-300 mt-2">
                  {menuItems.filter((item) => !item.isAvailable).length}
                </h3>
              </div>
            </div>

            <Link
              to="/admin/menu"
              className="block text-center mt-6 border border-[#26324a] py-3 rounded-xl font-bold hover:bg-[#18233a]"
            >
              Manage Inventory
            </Link>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Top Selling Items</h2>
            <p className="text-gray-400 text-sm mt-1">Calculated from orders.</p>

            <div className="space-y-5 mt-6">
              {popularItems.length === 0 ? (
                <p className="text-gray-400">No order data yet.</p>
              ) : (
                popularItems.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{name}</span>
                      <span className="text-purple-300 font-bold">
                        {count} sold
                      </span>
                    </div>

                    <div className="h-2 bg-[#071023] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-300 rounded-full"
                        style={{ width: `${Math.min(count * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Quick Actions</h2>

            <div className="space-y-3 mt-6">
              <Link
                to="/admin/menu"
                className="block bg-[#071023] border border-[#26324a] rounded-xl p-4 hover:border-purple-400"
              >
                🍔 Add / Edit Menu Items
              </Link>

              <Link
                to="/admin/orders"
                className="block bg-[#071023] border border-[#26324a] rounded-xl p-4 hover:border-purple-400"
              >
                📦 Manage Order Queue
              </Link>

              <Link
                to="/admin/settings"
                className="block bg-[#071023] border border-[#26324a] rounded-xl p-4 hover:border-purple-400"
              >
                ☕ Update Cafe Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;