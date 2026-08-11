import React, { useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Fresh Fruits",
    price: "",
    description: "",
    image: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/products", formData);
      setMessage(res.data.message);
      setFormData({ name: "", category: "Fresh Fruits", price: "", description: "", image: "" });
    } catch (err) {
      setMessage("Failed to add product! Please check console.");
      console.error(err);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Product</h1>
        
        {message && <p className="mb-4 text-emerald-700 bg-emerald-100 p-3 rounded-xl">{message}</p>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm max-w-lg flex flex-col gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b] bg-white"
          >
            <option value="Fresh Fruits">Fresh Fruits</option>
            <option value="Fresh Vegetables">Fresh Vegetables</option>
            <option value="Fish">Fish</option>
            <option value="Meat">Meat</option>
            <option value="Grocery">Grocery</option>
          </select>

          <input
            type="number"
            placeholder="Price (৳)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />

          <textarea
            placeholder="Product Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />

          <button type="submit" className="bg-[#064e3b] text-white py-3 rounded-xl font-semibold hover:bg-emerald-900 cursor-pointer">
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
}