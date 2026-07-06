import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { loginUser } from "../redux/authSlice";
import api from "../api/api";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    try {
      if (!phone.startsWith("+91") || phone.length !== 13) {
        toast.error("Use format +91XXXXXXXXXX");
        return;
      }

      const res = await api.post("/auth/send-otp", { phone });
      const msg = res.data.message || "OTP sent successfully";

      setMessage(msg);
      toast.success(msg);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const handleLogin = async () => {
    try {
      if (!phone || !otp) {
        toast.error("Enter phone number and OTP");
        return;
      }

      const res = await api.post("/auth/login", { phone, otp });

      dispatch(
        loginUser({
          user: res.data.user,
          token: res.data.token,
        })
      );

      // Connect socket immediately after login using the returned token
      //connectSocket(res.data.token);

      toast.success("Login successful");

      if (res.data.user?.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-700/40">
            🍴
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Night<span className="text-purple-400">Byte</span>
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Late-night fuel for the focused few.
          </p>
        </div>

        <div className="bg-[#101a2e]/90 border border-[#26324a] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-1">
              Login using WhatsApp OTP
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
              />
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full bg-[#222d44] hover:bg-[#2d3a58] text-purple-300 py-3 rounded-lg text-sm font-semibold"
            >
              Send WhatsApp OTP →
            </button>

            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                OTP
              </label>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
              />
            </div>

            {message && (
              <p className="text-center text-sm text-purple-300">{message}</p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-purple-300 text-purple-950 py-3 rounded-lg font-bold hover:bg-purple-200 shadow-lg shadow-purple-700/30"
            >
              Login with OTP
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          New to the night?{" "}
          <Link to="/signup" className="text-purple-300 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
