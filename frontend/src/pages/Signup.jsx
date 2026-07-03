/*import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";

import { loginUser } from "../redux/authSlice";
import api from "../api/api";
import { auth, googleProvider } from "../firebase";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const token = await googleUser.getIdToken();

      dispatch(
        loginUser({
          user: {
            name: googleUser.displayName,
            email: googleUser.email,
            photo: googleUser.photoURL,
            uid: googleUser.uid,
            provider: "google",
          },
          token,
        })
      );

      toast.success("Google signup successful");
      navigate("/");
    } catch (error) {
      const msg = error.message || "Google signup failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await api.post("/auth/send-otp", { phone });
      setMessage(res.data.message || "OTP sent successfully");
      toast.success(res.data.message || "OTP sent successfully");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const handleSignup = async () => {
    try {
      const res = await api.post("/auth/register", {
        name,
        phone,
        otp,
      });

      setMessage(res.data.message || "Account created successfully");
      toast.success("Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#101a2e]/90 border border-[#26324a] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-700/40">
            🌙
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Night<span className="text-purple-400">Byte</span>
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Create your NightByte account
          </p>
        </div>

        <div className="space-y-5">
          <button
            onClick={handleGoogleSignup}
            className="w-full border border-[#26324a] py-3 rounded-lg text-sm text-gray-300 hover:bg-[#18233a] font-semibold"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-[#26324a]" />
            <span className="text-xs text-gray-500">OR</span>
            <hr className="flex-1 border-[#26324a]" />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              Phone Number
            </label>

            <div className="flex gap-3 mt-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="flex-1 bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
              />

              <button
                onClick={handleSendOtp}
                className="bg-[#222d44] hover:bg-[#2d3a58] text-purple-300 px-4 rounded-lg text-xs font-semibold"
              >
                Send OTP
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              OTP Verification
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6 digit OTP"
              className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
            />
          </div>

          {message && (
            <p className="text-center text-sm text-purple-300">{message}</p>
          )}

          <button
            onClick={handleSignup}
            className="w-full bg-purple-300 text-purple-950 py-3 rounded-lg font-bold hover:bg-purple-200 shadow-lg shadow-purple-700/30"
          >
            Create Account →
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-300 font-semibold">
            Login
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-gray-500 uppercase tracking-widest">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          Safe • Fast • Fresh
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
        </div>
      </div>
    </div>
  );
}

export default Signup;  */



/*import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
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

  const handleSignup = async () => {
    try {
      if (!name || !phone || !otp) {
        toast.error("Fill all fields");
        return;
      }

      const res = await api.post("/auth/register", {
        name,
        phone,
        otp,
      });

      setMessage(res.data.message || "Account created successfully");
      toast.success("Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#101a2e]/90 border border-[#26324a] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-700/40">
            🌙
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Night<span className="text-purple-400">Byte</span>
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Create your NightByte account
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              Phone Number
            </label>

            <div className="flex gap-3 mt-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="flex-1 bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
              />

              <button
                onClick={handleSendOtp}
                className="bg-[#222d44] hover:bg-[#2d3a58] text-purple-300 px-4 rounded-lg text-xs font-semibold"
              >
                Send OTP
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              OTP Verification
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6 digit OTP"
              className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
            />
          </div>

          {message && (
            <p className="text-center text-sm text-purple-300">{message}</p>
          )}

          <button
            onClick={handleSignup}
            className="w-full bg-purple-300 text-purple-950 py-3 rounded-lg font-bold hover:bg-purple-200 shadow-lg shadow-purple-700/30"
          >
            Create Account →
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-300 font-semibold">
            Login
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-gray-500 uppercase tracking-widest">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          Safe • Fast • Fresh
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
        </div>
      </div>
    </div>
  );
}

export default Signup; */


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
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

 const handleSignup = async () => {
  try {
    if (!name || !phone || !otp) {
      toast.error("Fill all fields");
      return;
    }

    // Step 1: Verify OTP
    await api.post("/auth/verify-otp", {
      phone,
      otp,
    });

    // Step 2: Register user
    const res = await api.post("/auth/register", {
      name,
      phone,
    });

    setMessage(res.data.message || "Account created successfully");
    toast.success("Account created successfully");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  } catch (error) {
    const msg = error.response?.data?.message || "Signup failed";
    setMessage(msg);
    toast.error(msg);
  }
};

  return (
    <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#101a2e]/90 border border-[#26324a] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-700/40">
            🌙
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Night<span className="text-purple-400">Byte</span>
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Create your NightByte account
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              Phone Number
            </label>

            <div className="flex gap-3 mt-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="flex-1 bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
              />

              <button
                onClick={handleSendOtp}
                className="bg-[#222d44] hover:bg-[#2d3a58] text-purple-300 px-4 rounded-lg text-xs font-semibold"
              >
                Send OTP
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-semibold">
              OTP Verification
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6 digit OTP"
              className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-400"
            />
          </div>

          {message && (
            <p className="text-center text-sm text-purple-300">{message}</p>
          )}

          <button
            onClick={handleSignup}
            className="w-full bg-purple-300 text-purple-950 py-3 rounded-lg font-bold hover:bg-purple-200 shadow-lg shadow-purple-700/30"
          >
            Create Account →
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-300 font-semibold">
            Login
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-gray-500 uppercase tracking-widest">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          Safe • Fast • Fresh
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
        </div>
      </div>
    </div>
  );
}

export default Signup;