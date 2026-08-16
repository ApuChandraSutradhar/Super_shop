import React, { useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Fresh Fruits",
    price: "",
    discount: "",
    stock: "", // স্টক ফিল্ড
    description: "",
    image: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/products", formData);
      setMessage("Product Added Successfully!");
      setFormData({
        name: "",
        category: "Fresh Fruits",
        price: "",
        discount: "",
        stock: "",
        description: "",
        image: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Product</h2>

      {message && (
        <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Fresh Fruits">Fresh Fruits</option>
          <option value="Fresh Vegetables">Fresh Vegetables</option>
          <option value="Fish">Fish</option>
          <option value="Meat">Meat</option>
          <option value="Grocery">Grocery</option>
          <option value="Bakery">Bakery</option>
          <option value="Drinks">Drinks</option>
          <option value="Beauty">Beauty</option>
          <option value="Electronics">Electronics</option>
          <option value="Baby Care">Baby Care</option>
          
        </select>

        <input
          type="number"
          name="price"
          placeholder="Original Price (e.g. 500)"
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          type="number"
          name="discount"
          placeholder="Discount % (e.g. 15)"
          value={formData.discount}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Stock Quantity Field */}
        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity (e.g. 50)"
          value={formData.stock}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <textarea
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-lg transition"
        >
          Save Product
        </button>
      </form>
    </div>
  );
}