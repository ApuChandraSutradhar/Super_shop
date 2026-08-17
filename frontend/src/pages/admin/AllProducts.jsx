import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [updating, setUpdating] = useState(false);

  // 1. Fetch All Products from Database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Delete Product Handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
        setProducts(products.filter((p) => p.id !== id));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  // 3. Open Edit Modal
  const handleEditClick = (product) => {
    setEditProduct({ ...product });
    setEditImagePreview(product.image);
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  // 4. Handle Edit Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel Method Spoofing
    formData.append("name", editProduct.name);
    formData.append("category", editProduct.category);
    formData.append("price", editProduct.price);
    formData.append("discount", editProduct.discount || 0);
    formData.append("stock", editProduct.stock);
    formData.append("description", editProduct.description || "");

    // নতুন ছবি সিলেক্ট করলে সেটি যুক্ত হবে
    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/products/${editProduct.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Product updated successfully!");
      setIsEditOpen(false);
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    } finally {
      setUpdating(false);
    }
  };

  // Filter Products by Search & Category
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-extrabold text-gray-800">
          Product Management
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700"
          >
            <option value="All Categories">All Categories</option>
            <option value="Fresh Fruits">Fresh Fruits</option>
            <option value="Fresh Vegetables">Fresh Vegetables</option>
            <option value="Drinks">Drinks</option>
            <option value="Meat">Meat</option>
            <option value="Fish">Fish</option>
            <option value="Grocery">Grocery</option>
          </select>

          {/* Add Product Link Button */}
          <Link
            to="/admin/add-product"
            className="inline-flex items-center gap-2 bg-[#005a36] hover:bg-[#004227] text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"
          >
            <FiPlus /> Add Product
          </Link>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">
          Loading database products...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const finalPrice = p.discount
                    ? p.price - (p.price * p.discount) / 100
                    : p.price;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <span className="text-xs text-gray-400">
                            ID: #{p.id}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {p.category}
                      </td>

                      {/* Price & Discounted Price */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800">
                          ৳{Math.round(finalPrice)}
                        </span>
                        {p.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through block">
                            ৳{p.price}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.stock > 10
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            p.stock > 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {p.stock > 0 ? "Active" : "Out of Stock"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-3">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold text-xs"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✏️ EDIT PRODUCT MODAL */}
      {isEditOpen && editProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Edit Product #{editProduct.id}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                  required
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value="Fresh Fruits">Fresh Fruits</option>
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Meat">Meat</option>
                    <option value="Fish">Fish</option>
                    <option value="Grocery">Grocery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, stock: e.target.value })
                    }
                    required
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Price (TK)
                  </label>
                  <input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: e.target.value })
                    }
                    required
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={editProduct.discount}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        discount: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={editProduct.description || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                  rows="2"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-gray-500 border rounded-xl p-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
                />
                {editImagePreview && (
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-xl mt-2 border"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="w-1/2 py-2.5 border rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-2.5 bg-[#005a36] text-white font-semibold rounded-xl text-sm hover:bg-[#004227]"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}