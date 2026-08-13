import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import staticProducts from "../../data/products";
import { useSearch } from "../../context/SearchContext";
import { useCart } from "../../context/CartContext";

export default function ProductGrid() {
  const { searchQuery } = useSearch();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState(staticProducts);

  // Fetch products from database API
  const fetchDatabaseProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/products");
      const apiProducts = Array.isArray(response.data) ? response.data : [];

      // ১. staticProducts আগে এবং apiProducts পরে রাখা হয়েছে
      // এতে একই ID থাকলে ডাটাবেজের ডাটা প্রাধান্য পাবে
      const combined = [...staticProducts, ...apiProducts];

      // ২. ID অনুযায়ী ডুপ্লিকেট বাদ দেওয়া (ডাটাবেজের প্রোডাক্ট থেকে যাবে)
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

  // Filter products based on search input
  const filteredProducts = allProducts.filter((product) =>
    (product.name || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <section className="mt-8 px-4">
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mb-10 relative">
        <h2 className="text-3xl font-bold text-gray-800">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Products"}
        </h2>
        <p className="text-gray-500 mt-2">
          {searchQuery
            ? `Found ${filteredProducts.length} items matching your search`
            : "Fresh products specially selected for you"}
        </p>
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
            No products found matching "{searchQuery}".
          </p>
        </div>
      )}
    </section>
  );
}