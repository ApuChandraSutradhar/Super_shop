import React from "react";
import ProductCard from "./ProductCard";
import trendingProducts from "../../data/trendingProducts";
import { useSearch } from "../../context/SearchContext";

export default function TrendingProducts() {
  const { searchQuery } = useSearch();

  const filteredProducts = trendingProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (searchQuery && filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
            TRENDING
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 flex items-center gap-2">
            🔥 Hot & Trending Right Now
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            What everyone is buying this week
          </p>
        </div>

        <button className="text-emerald-600 font-semibold hover:underline text-sm hidden sm:block">
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