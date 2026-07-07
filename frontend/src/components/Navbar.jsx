import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { disconnectSocket } from "../socket";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);

  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleLogout = () => {
    // Disconnect socket before clearing auth state
    disconnectSocket();
    dispatch(logoutUser());
    setOpenProfile(false);
    navigate("/login");
  };

  return (
    <nav className="bg-[#071023] text-white border-b border-[#26324a] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Night<span className="text-purple-300">Byte</span> ☕
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" className="hover:text-purple-300">
            Home
          </Link>

          {isLoggedIn && !user?.isAdmin && (
            <>
              <Link to="/menu" className="hover:text-purple-300">
                Menu
              </Link>

              <Link
                to="/cart"
                className="relative hover:text-purple-300 font-medium"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link to="/orders" className="hover:text-purple-300">
                Orders
              </Link>
            </>
          )}

          {isLoggedIn && user?.isAdmin && (
            <Link
              to="/admin"
              className="bg-purple-300 text-purple-950 px-5 py-2 rounded-lg font-bold hover:bg-purple-200"
            >
              Admin Panel
            </Link>
          )}

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setOpenProfile(!openProfile)}
                className="bg-[#101a2e] border border-[#26324a] px-4 py-2 rounded-xl hover:border-purple-400 transition"
              >
                👤 {user?.name || "User"} ▾
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-3 w-52 bg-[#101a2e] border border-[#26324a] rounded-xl shadow-xl overflow-hidden">
                  {user?.isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setOpenProfile(false)}
                      className="block px-4 py-3 hover:bg-[#18233a]"
                    >
                      ⚙️ Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/orders"
                        onClick={() => setOpenProfile(false)}
                        className="block px-4 py-3 hover:bg-[#18233a]"
                      >
                        📦 My Orders
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setOpenProfile(false)}
                        className="block px-4 py-3 hover:bg-[#18233a]"
                      >
                        🛒 My Cart
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/10"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-purple-300 text-purple-950 px-5 py-2 rounded-lg font-bold hover:bg-purple-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
