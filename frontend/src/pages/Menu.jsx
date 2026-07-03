import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../api/api";

function Menu() {
  const dispatch = useDispatch();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fallbackImage =
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600";

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get("/menu");
      const groupedMenu = res.data.menu || {};
      const flatMenu = [];

      Object.keys(groupedMenu).forEach((category) => {
        groupedMenu[category].forEach((item) => {
          flatMenu.push({
            ...item,
            category,
          });
        });
      });

      setMenuItems(flatMenu);
      setCategories(["All", ...Object.keys(groupedMenu)]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const categoryMatch =
      activeCategory === "All" || item.category === activeCategory;

    const searchMatch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const handleAddToCart = async (item) => {
    try {
      await api.post("/cart/add", {
        menuItemId: item._id,
        quantity: 1,
      });

      dispatch(
        addToCart({
          id: item._id,
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image || fallbackImage,
        })
      );

      toast.success(`${item.name} added to cart`);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add item";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="text-purple-300 text-sm font-semibold">
              Midnight Cravings
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Explore Our Menu
            </h1>

            <p className="text-gray-400 mt-2">
              Fresh, fast and made for late-night hunger.
            </p>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-xl px-4 py-3 w-full md:w-80">
            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? "whitespace-nowrap bg-purple-300 text-purple-950 px-5 py-2 rounded-full text-sm font-bold"
                  : "whitespace-nowrap bg-[#101a2e] border border-[#26324a] text-gray-300 px-5 py-2 rounded-full text-sm hover:bg-[#18233a]"
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-gray-400 mt-20">Loading menu...</p>
        )}

        {!loading && filteredItems.length === 0 && (
          <p className="text-center text-gray-400 mt-20">No items found.</p>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                className="bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden hover:border-purple-400 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/30"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={item.image || fallbackImage}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{item.name}</h2>

                      <p className="text-gray-400 text-sm mt-2 min-h-[40px]">
                        {item.description || "Freshly prepared item"}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        item.isAvailable
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <p className="text-2xl font-bold text-purple-300">
                      ₹{item.price}
                    </p>

                    <button
                      disabled={!item.isAvailable}
                      onClick={() => handleAddToCart(item)}
                      className={
                        item.isAvailable
                          ? "bg-purple-300 text-purple-950 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-200"
                          : "bg-gray-700 text-gray-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed"
                      }
                    >
                      {item.isAvailable ? "Add +" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;