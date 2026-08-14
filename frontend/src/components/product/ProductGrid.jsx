import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import staticProducts from "../../data/products";
import { useSearch } from "../../context/SearchContext";
import { useCart } from "../../context/CartContext";

export default function ProductGrid() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearch();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState(staticProducts);

  // সেকশনের অবস্থান ট্র্যাক করার জন্য Ref
  const sectionRef = useRef(null);

  // Fetch products from database API
  const fetchDatabaseProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/products");
      const apiProducts = Array.isArray(response.data) ? response.data : [];

      const combined = [...staticProducts, ...apiProducts];

      const uniqueProducts = Array.from(
        new Map(combined.map((item) => [item.id, item])).values()
      );

      setAllProducts(uniqueProducts);
    } catch (error) {
      console.error("Error fetching products from database:", error);
    }
  };

  useEffect(() => {
    fetchDatabaseProducts();
  }, []);

  // ক্যাটাগরি বা সার্চ ফিল্টার হলে স্ক্রোল লজিক
  useEffect(() => {
    if (selectedCategory) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCategory]);

  // Back to Home বাটন ক্লিক হ্যান্ডলার
  const handleBackToHome = () => {
    if (setSearchQuery) setSearchQuery("");
    if (setSelectedCategory) setSelectedCategory("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter products based on search input and selected category
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "All" ||
      (product.category || "").toLowerCase().trim() ===
        selectedCategory.toLowerCase().trim();

    const matchesSearch = (product.name || "")
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section ref={sectionRef} className="mt-8 px-4 scroll-mt-24">
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mb-10 relative">
        <h2 className="text-3xl font-bold text-gray-800">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : selectedCategory && selectedCategory !== "All"
            ? selectedCategory
            : "All Products"}
        </h2>
        <p className="text-gray-500 mt-2">
          {searchQuery
            ? `Found ${filteredProducts.length} items matching your search`
            : selectedCategory && selectedCategory !== "All"
            ? `Showing products for ${selectedCategory}`
            : "Fresh products specially selected for you"}
        </p>

        {/* 🟢 সার্চ করার পর "Back to Home Page" বাটন শো করার লজিক */}
        {searchQuery && (
          <button
            onClick={handleBackToHome}
            className="mt-4 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-full transition-all duration-300 shadow-sm flex items-center gap-2"
          >
            ← Back to Home Page
          </button>
        )}
      </div>

      {/* Product List Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={`${product.id}-${index}`}
              product={product}
              onAddToCart={() => addToCart(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg font-medium">
            {searchQuery
              ? `No products found matching "${searchQuery}".`
              : `No products found in "${selectedCategory}".`}
          </p>
          {searchQuery && (
            <button
              onClick={handleBackToHome}
              className="mt-4 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-full transition-all duration-300 inline-block"
            >
              Back to Home Page
            </button>
          )}
        </div>
      )}
    </section>
  );
}