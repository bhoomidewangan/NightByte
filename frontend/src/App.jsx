import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import CustomerLayout from "./components/CustomerLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";

import AdminDashboard from "./pages/AdminDashboard";
import AdminMenu from "./pages/AdminMenu";
import AdminOrders from "./pages/AdminOrders";
import CafeSettings from "./pages/CafeSettings";

import { connectSocket, disconnectSocket } from "./socket";

import PaymentStatus from "./pages/PaymentStatus";

function App() {
  const { token, isLoggedIn } = useSelector((state) => state.auth);

  // Reconnect socket on page refresh if user is already logged in.
  // Without this, refreshing the page would lose the socket connection
  // because connectSocket() only runs on the Login page normally.
  const socketInitialised = useRef(false);

  // useEffect(() => {
  //   if (isLoggedIn && token && !socketInitialised.current) {
  //     connectSocket(token);
  //     socketInitialised.current = true;
  //   }

  //   if (!isLoggedIn) {
  //     disconnectSocket();
  //     socketInitialised.current = false;
  //   }
  // }, [isLoggedIn, token]);
  useEffect(() => {
  console.log("useEffect fired — isLoggedIn:", isLoggedIn, "token:", !!token, "ref:", socketInitialised.current);
  
  if (isLoggedIn && token && !socketInitialised.current) {
    connectSocket(token);
    socketInitialised.current = true;
    console.log("Socket connect called");
  }

  if (!isLoggedIn) {
    disconnectSocket();
    socketInitialised.current = false;
  }
}, [isLoggedIn, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <CustomerLayout>
              <Home />
            </CustomerLayout>
          }
        />

        <Route
          path="/menu"
          element={
            <CustomerLayout>
              <Menu />
            </CustomerLayout>
          }
        />

        <Route
          path="/login"
          element={
            <CustomerLayout>
              <Login />
            </CustomerLayout>
          }
        />

        <Route
          path="/signup"
          element={
            <CustomerLayout>
              <Signup />
            </CustomerLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <Cart />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <Orders />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/menu"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminMenu />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminLayout>
                <CafeSettings />
              </AdminLayout>
            </AdminRoute>
          }
        />

        // Add this route inside
        <Route
          path="/payment/status"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <PaymentStatus />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
