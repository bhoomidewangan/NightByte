/*import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";

function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "bg-purple-300 text-purple-950 px-4 py-3 rounded-xl font-bold"
      : "text-gray-300 hover:bg-[#18233a] px-4 py-3 rounded-xl";

  return (
    <div className="min-h-screen bg-[#071023] text-white flex">
      <aside className="w-72 bg-[#0c1629] border-r border-[#26324a] p-6 hidden lg:flex flex-col">
        <Link to="/admin" className="text-3xl font-extrabold mb-10">
          Night<span className="text-purple-300">Byte</span>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            ADMIN PANEL
          </p>
        </Link>

        <nav className="space-y-3 flex-1">
          <NavLink to="/admin" end className={linkClass}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/menu" className={linkClass}>
            🍔 Manage Menu
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            📦 Order Queue
          </NavLink>

          <NavLink to="/admin/settings" className={linkClass}>
            ☕ Cafe Settings
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-8 bg-red-500/20 text-red-300 py-3 rounded-xl font-bold hover:bg-red-500/30"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1">
        <div className="lg:hidden bg-[#0c1629] border-b border-[#26324a] p-4 flex justify-between items-center">
          <Link to="/admin" className="font-bold text-xl">
            Night<span className="text-purple-300">Byte</span> Admin
          </Link>

          <button
            onClick={logout}
            className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

export default AdminLayout;*/


import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";

function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "bg-purple-300 text-purple-950 px-4 py-2 rounded-lg font-bold"
      : "text-gray-300 hover:text-purple-300 px-4 py-2 rounded-lg";

  return (
    <div className="min-h-screen bg-[#071023] text-white">
      <header className="bg-[#0c1629] border-b border-[#26324a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">
              Night<span className="text-purple-300">Byte</span>
            </h1>
            <p className="text-xs text-gray-500 font-semibold tracking-widest">
              ADMIN PANEL
            </p>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <NavLink to="/admin" end className={linkClass}>
              📊 Dashboard
            </NavLink>

            <NavLink to="/admin/menu" className={linkClass}>
              🍔 Menu
            </NavLink>

            <NavLink to="/admin/orders" className={linkClass}>
              📦 Orders
            </NavLink>

            <NavLink to="/admin/settings" className={linkClass}>
              ☕ Settings
            </NavLink>
          </nav>

          <button
            onClick={logout}
            className="bg-red-500/20 text-red-300 px-5 py-2 rounded-lg font-bold hover:bg-red-500/30"
          >
            Logout
          </button>
        </div>

        <nav className="md:hidden px-4 pb-4 flex gap-2 overflow-x-auto">
          <NavLink to="/admin" end className={linkClass}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/menu" className={linkClass}>
            🍔 Menu
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            📦 Orders
          </NavLink>

          <NavLink to="/admin/settings" className={linkClass}>
            ☕ Settings
          </NavLink>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default AdminLayout;