import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

function CafeSettings() {
  const emptyForm = {
    name: "",
    description: "",
    address: "",
    phone: "",
    openingTime: "",
    closingTime: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [cafeExists, setCafeExists] = useState(false);
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCafe = async () => {
    try {
      const res = await api.get("/cafe");
      const cafe = res.data.cafe;

      setCafeExists(true);
      setIsOrderingEnabled(cafe.isOrderingEnabled);

      setForm({
        name: cafe.name || "",
        description: cafe.description || "",
        address: cafe.address || "",
        phone: cafe.phone || "",
        openingTime: cafe.openingTime || "",
        closingTime: cafe.closingTime || "",
      });
    } catch (error) {
      setCafeExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafe();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveCafe = async () => {
    try {
      if (!form.name) {
        toast.error("Cafe name is required");
        return;
      }

      if (cafeExists) {
        await api.put("/cafe", form);
        toast.success("Cafe updated");
      } else {
        await api.post("/cafe", form);
        toast.success("Cafe created");
      }

      fetchCafe();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save cafe");
    }
  };

  const toggleOrdering = async () => {
    try {
      const res = await api.patch("/cafe/toggle");
      setIsOrderingEnabled(res.data.isOrderingEnabled);
      toast.success(res.data.message || "Ordering status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle ordering");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading cafe settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-purple-300 text-sm font-semibold">Cafe Control</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Cafe Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage cafe details, timings and ordering status.
          </p>
        </div>

        <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between bg-[#0c1629] border border-[#26324a] rounded-2xl p-5 mb-8">
            <div>
              <h2 className="text-xl font-bold">
                {form.name || "NightByte Cafe"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Current ordering status
              </p>
            </div>

            <button
              onClick={toggleOrdering}
              className={
                isOrderingEnabled
                  ? "bg-green-500/20 text-green-300 px-5 py-2 rounded-full text-sm font-bold"
                  : "bg-red-500/20 text-red-300 px-5 py-2 rounded-full text-sm font-bold"
              }
            >
              {isOrderingEnabled ? "Open" : "Closed"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Cafe Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="NightByte"
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="NIT Raipur Hostel Canteen"
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Description
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Late-night food ordering cafe"
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Opening Time
              </label>
              <input
                name="openingTime"
                type="time"
                value={form.openingTime}
                onChange={handleChange}
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-400 font-semibold">
                Closing Time
              </label>
              <input
                name="closingTime"
                type="time"
                value={form.closingTime}
                onChange={handleChange}
                className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button
              onClick={saveCafe}
              className="flex-1 bg-purple-300 text-purple-950 py-3 rounded-lg font-bold hover:bg-purple-200"
            >
              {cafeExists ? "Save Changes" : "Create Cafe"}
            </button>

            <button
              onClick={toggleOrdering}
              className={
                isOrderingEnabled
                  ? "flex-1 border border-red-500/50 text-red-300 py-3 rounded-lg font-bold hover:bg-red-500/10"
                  : "flex-1 border border-green-500/50 text-green-300 py-3 rounded-lg font-bold hover:bg-green-500/10"
              }
            >
              {isOrderingEnabled ? "Close Ordering" : "Open Ordering"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CafeSettings;