import { Link } from "react-router-dom";

function Home() {
  const popularItems = [
    {
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      name: "Cheese Burger",
      price: "₹129",
      desc: "Juicy & cheesy",
    },
    {
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
      name: "Cheese Burst Pizza",
      price: "₹299",
      desc: "Loaded with cheese",
    },
    {
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
      name: "Cold Coffee",
      price: "₹99",
      desc: "Chilled & refreshing",
    },
    {
      image:
        "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600",
      name: "Peri Peri Fries",
      price: "₹99",
      desc: "Spicy & crispy",
    },
  ];

  return (
    <div className="min-h-screen bg-[#071023] text-white overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-14 items-center">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10">
          <p className="inline-block text-purple-300 font-semibold bg-purple-500/10 border border-purple-400/20 px-4 py-2 rounded-full">
            🌙 NIT Raipur Late-Night Canteen
          </p>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-6">
            Late Night
            <br />
            <span className="text-purple-300">Cravings?</span>
            <br />
            We’ve Got You.
          </h1>

          <p className="text-gray-400 text-lg mt-6 max-w-xl">
            Delicious food, delivered fast. Browse the menu, add items to your
            cart, and track your order easily.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              to="/menu"
              className="bg-purple-300 text-purple-950 px-7 py-3 rounded-xl font-bold hover:bg-purple-200 transition hover:scale-105"
            >
              Browse Menu →
            </Link>

            <Link
              to="/cart"
              className="bg-[#101a2e] border border-[#26324a] px-7 py-3 rounded-xl hover:bg-[#18233a] transition"
            >
              View Cart 🛒
            </Link>

            <Link
              to="/orders"
              className="bg-[#101a2e] border border-[#26324a] px-7 py-3 rounded-xl hover:bg-[#18233a] transition"
            >
              My Orders 📦
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-[#101a2e] border border-[#26324a] px-5 py-3 rounded-xl">
              <span className="text-green-300 font-bold">● We’re Open</span>
            </div>

            <div className="bg-[#101a2e] border border-[#26324a] px-5 py-3 rounded-xl text-gray-300">
              ⏰ 8:00 PM - 2:00 AM
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative">
            <div className="absolute -inset-5 bg-purple-500/20 blur-3xl rounded-full"></div>

            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000"
              alt="NightByte food"
              className="relative w-full h-[430px] object-cover rounded-[2rem] border border-[#26324a] shadow-2xl"
            />

            <div className="absolute -bottom-6 left-6 bg-[#101a2e]/95 border border-[#26324a] rounded-2xl p-4 shadow-xl w-64">
              <p className="text-gray-400 text-sm">Tonight’s Bestseller</p>
              <h3 className="font-bold mt-1">Cheese Burger Combo</h3>
              <div className="flex justify-between items-center mt-3">
                <span className="text-purple-300 font-bold">₹199</span>
                <Link
                  to="/menu"
                  className="bg-purple-300 text-purple-950 px-3 py-1 rounded-lg text-sm font-bold"
                >
                  Order
                </Link>
              </div>
            </div>

            <div className="absolute -top-5 right-5 bg-green-500/20 text-green-300 border border-green-400/30 px-4 py-2 rounded-full text-sm font-bold">
              Fresh • Fast • Open
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-[#101a2e] border border-[#26324a] rounded-3xl p-7 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Popular Tonight</p>
              <h2 className="text-2xl font-bold mt-1">Student Favorites</h2>
            </div>

            <Link to="/menu" className="text-purple-300 text-sm font-bold">
              View All
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {popularItems.map((item, index) => (
              <div
                key={index}
                className="bg-[#071023] border border-[#26324a] rounded-2xl overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-36 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                  <p className="text-purple-300 font-bold mt-3">
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/menu"
            className="block text-center mt-7 bg-purple-300 text-purple-950 py-3 rounded-xl font-bold hover:bg-purple-200 transition"
          >
            Explore Full Menu
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/menu"
            className="bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden hover:border-purple-400 hover:-translate-y-2 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800"
              alt="Fast ordering"
              className="w-full h-44 object-cover"
            />

            <div className="p-6">
              <p className="text-4xl">⚡</p>
              <h3 className="text-xl font-bold mt-4">Fast Ordering</h3>
              <p className="text-gray-400 mt-3">
                Browse the menu and place your order in just a few clicks.
              </p>
              <p className="text-purple-300 font-bold mt-5">Order Now →</p>
            </div>
          </Link>

          <Link
            to="/cart"
            className="bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden hover:border-purple-400 hover:-translate-y-2 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800"
              alt="Smart cart"
              className="w-full h-44 object-cover"
            />

            <div className="p-6">
              <p className="text-4xl">🛒</p>
              <h3 className="text-xl font-bold mt-4">Smart Cart</h3>
              <p className="text-gray-400 mt-3">
                Add, remove or update food items before placing your order.
              </p>
              <p className="text-purple-300 font-bold mt-5">Go to Cart →</p>
            </div>
          </Link>

          <Link
            to="/orders"
            className="bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden hover:border-purple-400 hover:-translate-y-2 transition"
          >
            <img
              src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800"
              alt="Order updates"
              className="w-full h-44 object-cover"
            />

            <div className="p-6">
              <p className="text-4xl">📱</p>
              <h3 className="text-xl font-bold mt-4">Order Updates</h3>
              <p className="text-gray-400 mt-3">
                Track your order status from Preparing to Delivered.
              </p>
              <p className="text-purple-300 font-bold mt-5">Track Orders →</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center">
          Why Choose <span className="text-purple-300">NightByte?</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-6 mt-10">
          {[
            ["🍽️", "Fresh & Tasty", "Prepared fresh with quality ingredients."],
            ["🚀", "Super Fast", "Perfect for late-night hunger."],
            ["🛡️", "Safe & Hygienic", "Clean food and trusted service."],
            ["💜", "Loved by Students", "Made for students, by students."],
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 text-center"
            >
              <p className="text-4xl">{item[0]}</p>
              <h3 className="font-bold mt-4">{item[1]}</h3>
              <p className="text-gray-400 text-sm mt-2">{item[2]}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;