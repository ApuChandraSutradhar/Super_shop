import React, { useState } from "react";
import axios from "axios";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Fresh Fruits",
    price: "",
    discount: "",
    stock: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("discount", formData.discount);
    data.append("stock", formData.stock);
    data.append("description", formData.description);
    
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Product Added Successfully!");
      setFormData({
        name: "",
        category: "Fresh Fruits",
        price: "",
        discount: "",
        stock: "",
        description: "",
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {message && (
        <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 font-semibold">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Price (TK)</label>
            <input
              type="number"
              name="price"
              placeholder="Original Price (e.g. 500)"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Discount (%)</label>
            <input
              type="number"
              name="discount"
              placeholder="Discount % (e.g. 15)"
              value={formData.discount}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              placeholder="Stock Quantity (e.g. 50)"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Upload Image from Laptop</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full p-2.5 border rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
        </div>

        {imagePreview && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1 font-semibold">Image Preview:</p>
            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#005a36] hover:bg-[#004227] text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md cursor-pointer"
        >
          {loading ? "Saving Product..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}