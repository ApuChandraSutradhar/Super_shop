import React from "react";
import ProductCard from "./ProductCard";
import products from "../../data/products";
import { useSearch } from "../../context/SearchContext";

export default function ProductGrid() {
  const { searchQuery } = useSearch(); // গ্লোবাল সার্চ নেওয়া হলো

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="mt-8 px-4">
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

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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