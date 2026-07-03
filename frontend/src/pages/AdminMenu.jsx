/*import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

function AdminMenu() {
  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  };

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get("/menu/all");
      setItems(res.data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.price) {
        toast.error("Name and price are required");
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price),
      };

      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
        toast.success("Item updated");
      } else {
        await api.post("/menu", payload);
        toast.success("Item added");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save item");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category || "",
      imageUrl: item.imageUrl || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/menu/${id}/toggle`);
      toast.success("Availability updated");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle item");
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading admin menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-purple-300 text-sm font-semibold">
            Admin Control
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Manage Menu</h1>
          <p className="text-gray-400 mt-2">
            Add, edit and control item availability.
          </p>
        </div>

        <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold mb-5">
            {editingId ? "Edit Item" : "Add New Item"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Item name"
              className="bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
            />

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
            />

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
            />

            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
              className="bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="md:col-span-2 bg-[#071023] border border-[#26324a] rounded-lg px-4 py-3 outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              className="bg-purple-300 text-purple-950 px-5 py-3 rounded-lg font-bold hover:bg-purple-200"
            >
              {editingId ? "Update Item" : "+ Add Item"}
            </button>

            {editingId && (
              <button
                onClick={cancelEdit}
                className="border border-[#26324a] px-5 py-3 rounded-lg text-gray-300 hover:bg-[#18233a]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 px-5 py-4 bg-[#0c1629] text-gray-400 text-xs uppercase font-bold">
            <div className="col-span-5">Item</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {items.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-12 items-center px-5 py-5 border-t border-[#26324a]"
            >
              <div className="col-span-5 flex items-center gap-4">
                <img
                  src={
                    item.imageUrl ||
                    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600"
                  }
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />

                <div>
                  <h2 className="font-bold">{item.name}</h2>
                  <p className="text-gray-500 text-sm">
                    {item.description || "No description"}
                  </p>
                </div>
              </div>

              <div className="col-span-2 text-gray-300">
                {item.category || "General"}
              </div>

              <div className="col-span-2 font-bold text-purple-300">
                ₹{item.price}
              </div>

              <div className="col-span-1">
                <span
                  className={
                    item.isAvailable
                      ? "bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold"
                      : "bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold"
                  }
                >
                  {item.isAvailable ? "Live" : "Off"}
                </span>
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => toggleAvailability(item._id)}
                  className="bg-[#1d2a43] hover:bg-[#263553] px-3 py-2 rounded-lg text-xs"
                >
                  Toggle
                </button>

                <button
                  onClick={() => startEdit(item)}
                  className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg text-xs"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              No menu items found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMenu;*/


import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

function AdminMenu() {
  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  };

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackImage =
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600";

  const fetchItems = async () => {
    try {
      const res = await api.get("/menu/all");
      setItems(res.data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category || "",
      imageUrl: item.imageUrl || "",
    });

    setEditingId(item._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveItem = async () => {
    try {
      if (!form.name || !form.price) {
        toast.error("Item name and price are required");
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price),
      };

      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
        toast.success("Item updated successfully");
      } else {
        await api.post("/menu", payload);
        toast.success("Item added successfully");
      }

      closeForm();
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save item");
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/menu/${id}/toggle`);
      toast.success("Availability updated");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update item");
    }
  };

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/menu/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  const availableCount = items.filter((item) => item.isAvailable).length;
  const unavailableCount = items.length - availableCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071023] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071023] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-8">
          <div>
            <p className="text-purple-300 text-sm font-semibold">
              Inventory Management
            </p>
            <h1 className="text-4xl font-bold mt-2">Manage Menu</h1>
            <p className="text-gray-400 mt-2">
              Add, edit, delete and control item availability.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="bg-purple-300 text-purple-950 px-5 py-3 rounded-xl font-bold hover:bg-purple-200"
          >
            + Add New Item
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Total Items</p>
            <h2 className="text-3xl font-bold text-purple-300 mt-2">
              {items.length}
            </h2>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Available</p>
            <h2 className="text-3xl font-bold text-green-300 mt-2">
              {availableCount}
            </h2>
          </div>

          <div className="bg-[#101a2e] border border-[#26324a] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Unavailable</p>
            <h2 className="text-3xl font-bold text-red-300 mt-2">
              {unavailableCount}
            </h2>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#101a2e] border border-[#26324a] rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingId ? "Edit Menu Item" : "Add Menu Item"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Fill item details according to backend menu schema.
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-gray-400 font-semibold">
                    Item Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="French Fries"
                    className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-gray-400 font-semibold">
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="90"
                    className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-gray-400 font-semibold">
                    Category
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Snacks"
                    className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-gray-400 font-semibold">
                    Image URL
                  </label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs uppercase text-gray-400 font-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Crispy golden fries served hot."
                    rows="4"
                    className="mt-2 w-full bg-[#071023] border border-[#26324a] rounded-xl px-4 py-3 outline-none focus:border-purple-400"
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={saveItem}
                  className="flex-1 bg-purple-300 text-purple-950 py-3 rounded-xl font-bold hover:bg-purple-200"
                >
                  {editingId ? "Update Item" : "Add Item"}
                </button>

                <button
                  onClick={closeForm}
                  className="flex-1 border border-[#26324a] text-gray-300 py-3 rounded-xl font-bold hover:bg-[#18233a]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center bg-[#101a2e] border border-[#26324a] rounded-2xl p-10">
            <p className="text-4xl">🍽️</p>
            <h2 className="text-xl font-bold mt-4">No menu items yet</h2>
            <p className="text-gray-400 mt-2">
              Add your first item to start accepting orders.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-[#101a2e] border border-[#26324a] rounded-2xl overflow-hidden shadow-xl hover:border-purple-400 transition"
              >
                <div className="flex flex-col sm:flex-row">
                  <img
                    src={item.imageUrl || fallbackImage}
                    alt={item.name}
                    className="w-full sm:w-44 h-44 object-cover"
                  />

                  <div className="p-5 flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{item.name}</h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {item.description || "No description added"}
                        </p>
                      </div>

                      <span
                        className={
                          item.isAvailable
                            ? "h-fit bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold"
                            : "h-fit bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold"
                        }
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 mt-5">
                      <div>
                        <p className="text-gray-500 text-sm">
                          {item.category || "General"}
                        </p>
                        <p className="text-3xl font-bold text-purple-300">
                          ₹{item.price}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAvailability(item._id)}
                          className="bg-[#071023] border border-[#26324a] px-3 py-2 rounded-lg text-xs hover:bg-[#18233a]"
                        >
                          {item.isAvailable ? "Hide" : "Show"}
                        </button>

                        <button
                          onClick={() => openEditForm(item)}
                          className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg text-xs hover:bg-blue-500/30"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteItem(item._id)}
                          className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg text-xs hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMenu;