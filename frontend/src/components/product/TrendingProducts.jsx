import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useSearch } from "../../context/SearchContext";

export default function TrendingProducts({ isAuthenticated = false }) {
  const { searchQuery } = useSearch();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    axios.get("http://127.0.0.1:8000/api/products/trending", {
      params: { limit: 8 },
      signal: controller.signal,
    }).then((response) => {
      setProducts(Array.isArray(response.data) ? response.data : []);
    }).catch((error) => {
      if (!axios.isCancel(error)) setProducts([]);
    });

    return () => controller.abort();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (searchQuery && filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className={`${isAuthenticated ? "mt-2" : "-mt-2"} px-4 max-w-7xl mx-auto`}>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
            TRENDING
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 flex items-center justify-center gap-2">
            🔥 Hot & Trending Right Now
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            What everyone is buying this week
          </p>
        </div>

        <button className="text-emerald-600 font-semibold hover:underline text-sm mt-3">
          View All &rarr;
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}